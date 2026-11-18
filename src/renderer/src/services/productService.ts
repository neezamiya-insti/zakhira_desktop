/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCurrentBusinessId, supabase } from '../lib/supabaseClient';

// ============================================================
// TYPES (same public shape as before → other files keep working)
// ============================================================
export type Product = {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  cost_price: number;
  stock: number;
  low_stock_level: number;
  active: boolean;
  unit_id: string;
  category_id: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductInput = {
  /** Optional: lets the UI pre-generate the id (optimistic UI + SQLite + Supabase share one UUID) */
  id?: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  cost_price: number;
  stock: number;
  low_stock_level: number;
  unit_id: string;
  category_id: string | null;
  image_url?: string | null;
  /** Base64 images (max 5). Stored in product_images. Omit to leave images unchanged. */
  images?: string[];
};

export type Category = {
  id: string;
  name: string;
};

type ProductRow = Product & { business_id: string };
type CategoryRow = Category & { business_id: string; created_at: string };
type SyncAction = 'INSERT' | 'UPDATE' | 'DELETE';
type SyncTable = 'products' | 'categories';

/** The IPC bridge exposed by your preload script */
type ElectronDb = {
  dbQuery: <T = unknown>(sql: string, params?: unknown[]) => Promise<T[]>;
  dbRun: (
    sql: string,
    params?: unknown[]
  ) => Promise<{ changes: number; lastInsertRowid?: number | bigint }>;
  addToSyncQueue: (
    table: string,
    action: SyncAction,
    payload: Record<string, unknown>
  ) => Promise<unknown>;
};

const api = (): ElectronDb => {
  const win = window as unknown as {
    api?: ElectronDb;
    electronAPI?: ElectronDb;
  };
  const dbApi = win.api ?? win.electronAPI;
  if (!dbApi) throw new Error('Database API is not available on window');
  return dbApi;
};

// ============================================================
// EVENTS (the page listens to these)
// ============================================================
/** Background sync CHANGED local data → page should re-read SQLite */
export const PRODUCTS_SYNCED_EVENT = 'zakhira:products-synced';
/** Pushing/pulling failed for a reason other than "offline" */
export const PRODUCTS_SYNC_ERROR_EVENT = 'zakhira:products-sync-error';

// ============================================================
// SMALL UTILITIES
// ============================================================
const BUSINESS_ID_KEY = 'zakhira_business_id';
const PUSH_INTERVAL_MS = 5000;
const PULL_INTERVAL_MS = 20000;
const MAX_IMAGES = 5;
const IMAGE_FETCH_CHUNK = 20;

const getBusinessId = async (): Promise<string> => {
  const cached = localStorage.getItem(BUSINESS_ID_KEY);
  if (cached) return cached;
  const id = (await getCurrentBusinessId()) as string;
  localStorage.setItem(BUSINESS_ID_KEY, id);
  return id;
};

/** Tiny mutex: local writes (row + queue entry) and "apply remote changes" never interleave. */
let lockChain: Promise<unknown> = Promise.resolve();
const withLock = <T>(fn: () => Promise<T>): Promise<T> => {
  const run = lockChain.then(fn);
  lockChain = run.catch(() => undefined);
  return run;
};

const isNetworkError = (err: unknown): boolean => {
  const msg = String((err as { message?: string })?.message ?? err).toLowerCase();
  return [
    'failed to fetch',
    'fetch failed',
    'networkerror',
    'network request failed',
    'load failed',
    'err_internet_disconnected',
    'err_network',
    'timed out',
    'timeout',
  ].some((k) => msg.includes(k));
};

const errCode = (err: unknown): string | undefined =>
  (err as { code?: string })?.code;

const isUniqueViolation = (err: unknown, word: string): boolean => {
  if (errCode(err) !== '23505') return false;
  const e = err as { message?: string; details?: string };
  return `${e.message ?? ''} ${e.details ?? ''}`.toLowerCase().includes(word);
};

/** Reports a REAL sync error once (console + event → page shows it). */
const reportedErrors = new Set<string>();
const reportSyncError = (
  key: string,
  err: unknown,
  extra: { name?: string; sku?: string } = {}
): void => {
  const e = err as {
    message?: string;
    details?: string;
    hint?: string;
    code?: string;
  };
  const message = e?.message || String(err);
  const dedupeKey = `${key}:${message}`;
  if (reportedErrors.has(dedupeKey)) return;
  reportedErrors.add(dedupeKey);
  console.error('[ProductSync]', key, err);
  window.dispatchEvent(
    new CustomEvent(PRODUCTS_SYNC_ERROR_EVENT, {
      detail: {
        message,
        details:
          [e?.details, e?.hint ? `Hint: ${e.hint}` : '']
            .filter(Boolean)
            .join('\n') || undefined,
        code: e?.code,
        ...extra,
      },
    })
  );
};

const skuNumber = (sku: string): number => {
  const m = String(sku).match(/SKU-(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
};

// ============================================================
// NORMALIZERS (SQLite row / Supabase row → one canonical shape)
// ============================================================
const normalizeProduct = (r: any): ProductRow => ({
  id: String(r.id),
  business_id: String(r.business_id),
  sku: String(r.sku ?? ''),
  name: String(r.name ?? ''),
  description: r.description ?? '',
  price: Number(r.price) || 0,
  cost_price: Number(r.cost_price) || 0,
  stock: Number(r.stock) || 0,
  low_stock_level: Number(r.low_stock_level) || 0,
  active: r.active == null ? true : r.active === true || r.active === 1,
  unit_id: String(r.unit_id ?? ''),
  category_id: r.category_id ?? null,
  image_url: null,
  created_at: String(r.created_at),
  updated_at: String(r.updated_at ?? r.created_at),
});

const normalizeCategory = (r: any): CategoryRow => ({
  id: String(r.id),
  business_id: String(r.business_id),
  name: String(r.name ?? ''),
  created_at: String(r.created_at ?? new Date().toISOString()),
});

/** Columns that exist in the Supabase `products` table (image_url is NOT sent) */
const toProductPayload = (r: ProductRow): Record<string, unknown> => ({
  id: r.id,
  business_id: r.business_id,
  sku: r.sku,
  name: r.name,
  description: r.description,
  price: r.price,
  cost_price: r.cost_price,
  stock: r.stock,
  low_stock_level: r.low_stock_level,
  active: r.active,
  unit_id: r.unit_id,
  category_id: r.category_id,
  created_at: r.created_at,
  updated_at: r.updated_at,
});

const toCategoryPayload = (c: CategoryRow): Record<string, unknown> => ({
  id: c.id,
  business_id: c.business_id,
  name: c.name,
  created_at: c.created_at,
});

// ============================================================
// LOCAL DB
// ============================================================
let tableReady: Promise<void> | null = null;

const ensureTables = (): Promise<void> => {
  if (!tableReady) {
    tableReady = (async () => {
      const db = api();
      await db.dbRun(
        `CREATE TABLE IF NOT EXISTS categories (
           id          TEXT PRIMARY KEY,
           business_id TEXT NOT NULL,
           name        TEXT NOT NULL,
           created_at  TEXT NOT NULL
         )`
      );
      await db.dbRun(
        `CREATE INDEX IF NOT EXISTS idx_categories_business ON categories (business_id)`
      );
      await db.dbRun(
        `CREATE TABLE IF NOT EXISTS products (
           id              TEXT PRIMARY KEY,
           business_id     TEXT NOT NULL,
           sku             TEXT NOT NULL,
           name            TEXT NOT NULL,
           description     TEXT,
           price           REAL NOT NULL DEFAULT 0,
           cost_price      REAL NOT NULL DEFAULT 0,
           stock           INTEGER NOT NULL DEFAULT 0,
           low_stock_level INTEGER NOT NULL DEFAULT 5,
           active          INTEGER NOT NULL DEFAULT 1,
           unit_id         TEXT,
           category_id     TEXT,
           created_at      TEXT NOT NULL,
           updated_at      TEXT
         )`
      );
      await db.dbRun(
        `CREATE INDEX IF NOT EXISTS idx_products_business
           ON products (business_id, created_at DESC)`
      );
      await db.dbRun(
        `CREATE TABLE IF NOT EXISTS product_images (
           product_id TEXT NOT NULL,
           sort_order INTEGER NOT NULL,
           image_data TEXT NOT NULL,
           PRIMARY KEY (product_id, sort_order)
         )`
      );
    })().catch((err) => {
      tableReady = null;
      throw err;
    });
  }
  return tableReady;
};

const readProducts = async (businessId: string): Promise<ProductRow[]> => {
  const rows = await api().dbQuery<Record<string, unknown>>(
    `SELECT * FROM products WHERE business_id = ? ORDER BY created_at DESC`,
    [businessId]
  );
  return rows.map(normalizeProduct);
};

const readCategories = async (businessId: string): Promise<CategoryRow[]> => {
  const rows = await api().dbQuery<Record<string, unknown>>(
    `SELECT * FROM categories WHERE business_id = ? ORDER BY name ASC`,
    [businessId]
  );
  return rows.map(normalizeCategory);
};

const readImages = async (productId: string): Promise<string[]> => {
  const rows = await api().dbQuery<{ image_data: string }>(
    `SELECT image_data FROM product_images WHERE product_id = ? ORDER BY sort_order ASC`,
    [productId]
  );
  return rows.map((r) => r.image_data);
};

const readThumbnails = async (): Promise<Record<string, string>> => {
  const rows = await api().dbQuery<{ product_id: string; image_data: string }>(
    `SELECT product_id, image_data FROM product_images WHERE sort_order = 0`
  );
  const map: Record<string, string> = {};
  rows.forEach((r) => {
    map[r.product_id] = r.image_data;
  });
  return map;
};

const replaceLocalImages = async (
  productId: string,
  images: string[]
): Promise<void> => {
  await api().dbRun(`DELETE FROM product_images WHERE product_id = ?`, [
    productId,
  ]);
  const list = images.slice(0, MAX_IMAGES);
  for (let i = 0; i < list.length; i++) {
    await api().dbRun(
      `INSERT INTO product_images (product_id, sort_order, image_data) VALUES (?, ?, ?)`,
      [productId, i, list[i]]
    );
  }
};

const upsertProductLocal = async (r: ProductRow): Promise<void> => {
  await api().dbRun(
    `INSERT INTO products
       (id, business_id, sku, name, description, price, cost_price, stock,
        low_stock_level, active, unit_id, category_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       business_id = excluded.business_id,
       sku = excluded.sku,
       name = excluded.name,
       description = excluded.description,
       price = excluded.price,
       cost_price = excluded.cost_price,
       stock = excluded.stock,
       low_stock_level = excluded.low_stock_level,
       active = excluded.active,
       unit_id = excluded.unit_id,
       category_id = excluded.category_id,
       created_at = excluded.created_at,
       updated_at = excluded.updated_at`,
    [
      r.id,
      r.business_id,
      r.sku,
      r.name,
      r.description,
      r.price,
      r.cost_price,
      r.stock,
      r.low_stock_level,
      r.active ? 1 : 0,
      r.unit_id,
      r.category_id,
      r.created_at,
      r.updated_at,
    ]
  );
};

const upsertCategoryLocal = async (c: CategoryRow): Promise<void> => {
  await api().dbRun(
    `INSERT INTO categories (id, business_id, name, created_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       business_id = excluded.business_id,
       name = excluded.name,
       created_at = excluded.created_at`,
    [c.id, c.business_id, c.name, c.created_at]
  );
};

/** ids that still have unsent local changes in the sync queue */
const pendingIds = async (table: SyncTable): Promise<Set<string>> => {
  const queued = await api().dbQuery<{ payload: string }>(
    `SELECT payload FROM sync_queue WHERE table_name = ?`,
    [table]
  );
  const set = new Set<string>();
  for (const q of queued) {
    try {
      const p = JSON.parse(q.payload) as { id?: string };
      if (p?.id) set.add(String(p.id));
    } catch {
      /* ignore corrupt entry */
    }
  }
  return set;
};

// ---- in-memory snapshot so the page renders instantly on re-mount ----
let productCache: ProductRow[] | null = null;
let categoryCache: CategoryRow[] | null = null;
let thumbCache: Record<string, string> | null = null;

// ============================================================
// SYNC — PUSH (local queue → Supabase)
// ============================================================
type QueueRow = {
  id: number;
  table_name: SyncTable;
  action: SyncAction;
  payload: string;
};

type Group = {
  table: SyncTable;
  cid: string;
  ids: number[];
  action: SyncAction;
  payload: Record<string, any>;
};

let pullRequested = false;
let pushTouchedLocal = false;

const nextFreeSku = async (businessId: string): Promise<string> => {
  const { data } = await supabase
    .from('products')
    .select('sku')
    .eq('business_id', businessId);
  const local = await api().dbQuery<{ sku: string }>(
    `SELECT sku FROM products WHERE business_id = ?`,
    [businessId]
  );
  const all = [
    ...((data ?? []) as { sku: string }[]).map((r) => r.sku),
    ...local.map((r) => r.sku),
  ];
  const max = all.reduce((m, s) => Math.max(m, skuNumber(s)), 0);
  return `SKU-${String(max + 1).padStart(4, '0')}`;
};

/** Pushes one product group. Returns the server row (or null). */
const pushProduct = async (g: Group): Promise<Record<string, any> | null> => {
  if (g.action === 'DELETE') {
    const { error } = await supabase.from('products').delete().eq('id', g.cid);
    if (error) throw error;
    return null;
  }

  const { images, ...rest } = g.payload;
  const row: Record<string, any> = { ...rest };
  const attempt = () =>
    supabase.from('products').upsert(row, { onConflict: 'id' }).select().single();

  let { data, error } = await attempt();

  // Another device already used this SKU → take the next free one and retry
  if (error && isUniqueViolation(error, 'sku')) {
    const oldSku = String(row.sku);
    const newSku = await nextFreeSku(String(row.business_id));
    row.sku = newSku;
    ({ data, error } = await attempt());
    if (!error) {
      await withLock(async () => {
        await api().dbRun(`UPDATE products SET sku = ? WHERE id = ?`, [
          newSku,
          g.cid,
        ]);
        await api().dbRun(
          `UPDATE sync_queue SET payload = REPLACE(payload, ?, ?)
            WHERE table_name = 'products' AND payload LIKE ?`,
          [`"sku":"${oldSku}"`, `"sku":"${newSku}"`, `%"id":"${g.cid}"%`]
        );
      });
      pushTouchedLocal = true;
    }
  }
  if (error) throw error;

  // Images: replace the remote set (only when this change included images)
  if (Array.isArray(images)) {
    const del = await supabase
      .from('product_images')
      .delete()
      .eq('product_id', g.cid);
    if (del.error) throw del.error;
    if (images.length > 0) {
      const ins = await supabase.from('product_images').insert(
        images.slice(0, MAX_IMAGES).map((img: string, i: number) => ({
          product_id: g.cid,
          image_data: img,
          sort_order: i,
        }))
      );
      if (ins.error) throw ins.error;
    }
  }

  return data as Record<string, any>;
};

/** Pushes one category group. Returns the server row (or null). */
const pushCategory = async (g: Group): Promise<Record<string, any> | null> => {
  if (g.action === 'DELETE') {
    const { error } = await supabase.from('categories').delete().eq('id', g.cid);
    if (error) throw error;
    return null;
  }

  const row = g.payload;
  const { data, error } = await supabase
    .from('categories')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();

  // Same category name already exists (created on another device) → merge into it
  if (error && isUniqueViolation(error, 'name')) {
    const found = await supabase
      .from('categories')
      .select('id')
      .eq('business_id', row.business_id)
      .eq('name', row.name)
      .maybeSingle();
    if (found.error) throw found.error;
    const remoteId = found.data?.id as string | undefined;
    if (remoteId && remoteId !== g.cid) {
      await withLock(async () => {
        await api().dbRun(
          `UPDATE products SET category_id = ? WHERE category_id = ?`,
          [remoteId, g.cid]
        );
        await api().dbRun(
          `UPDATE sync_queue SET payload = REPLACE(payload, ?, ?)
            WHERE table_name = 'products'`,
          [g.cid, remoteId]
        );
        await api().dbRun(`DELETE FROM categories WHERE id = ?`, [g.cid]);
      });
      pushTouchedLocal = true;
      pullRequested = true;
      return null;
    }
  }
  if (error) throw error;
  return data as Record<string, any>;
};

/** Writes the server's version (e.g. server-side updated_at) into SQLite — unless newer local changes are queued. */
const applyServerRow = async (
  table: SyncTable,
  row: Record<string, any>
): Promise<void> => {
  await withLock(async () => {
    const pending = await pendingIds(table);
    if (pending.has(String(row.id))) return;
    if (table === 'products') {
      const local = await api().dbQuery<{ id: string }>(
        `SELECT id FROM products WHERE id = ?`,
        [row.id]
      );
      if (!local[0]) return; // deleted locally in the meantime
      await upsertProductLocal(normalizeProduct(row));
    } else {
      const local = await api().dbQuery<{ id: string }>(
        `SELECT id FROM categories WHERE id = ?`,
        [row.id]
      );
      if (!local[0]) return;
      await upsertCategoryLocal(normalizeCategory(row));
    }
  });
};

/**
 * Sends queued changes to Supabase.
 *  - Grouped per record; last action wins (payloads are full rows; product
 *    payloads are merged so an earlier "images" change is never lost).
 *  - Categories are pushed BEFORE products (FK safety).
 *  - Offline → throws network error (cycle stops, retried later).
 *  - Real error for one record → reported, record stays queued, OTHERS continue.
 */
const pushQueue = async (): Promise<void> => {
  const rows = await api().dbQuery<QueueRow>(
    `SELECT id, table_name, action, payload FROM sync_queue
      WHERE table_name IN ('products', 'categories') ORDER BY id ASC`
  );

  if (rows.length === 0) {
    reportedErrors.clear();
    return;
  }

  const groups = new Map<string, Group>();
  for (const r of rows) {
    let payload: Record<string, any>;
    try {
      payload = JSON.parse(r.payload) as Record<string, any>;
    } catch {
      await api().dbRun(`DELETE FROM sync_queue WHERE id = ?`, [r.id]);
      continue;
    }
    const cid = payload?.id ? String(payload.id) : '';
    if (!cid) {
      await api().dbRun(`DELETE FROM sync_queue WHERE id = ?`, [r.id]);
      continue;
    }
    const key = `${r.table_name}:${cid}`;
    const g = groups.get(key);
    if (g) {
      g.ids.push(r.id);
      g.action = r.action;
      g.payload = r.action === 'DELETE' ? payload : { ...g.payload, ...payload };
    } else {
      groups.set(key, {
        table: r.table_name,
        cid,
        ids: [r.id],
        action: r.action,
        payload,
      });
    }
  }

  const ordered = [...groups.values()].sort((a, b) =>
    a.table === b.table ? 0 : a.table === 'categories' ? -1 : 1
  );

  for (const g of ordered) {
    try {
      const serverRow =
        g.table === 'categories' ? await pushCategory(g) : await pushProduct(g);

      await api().dbRun(
        `DELETE FROM sync_queue WHERE id IN (${g.ids.map(() => '?').join(',')})`,
        g.ids
      );
      if (serverRow) await applyServerRow(g.table, serverRow);
    } catch (err) {
      if (isNetworkError(err)) throw err; // offline → stop, retry later

      // Product cannot be deleted (it has sales / purchase history)
      if (
        g.table === 'products' &&
        g.action === 'DELETE' &&
        errCode(err) === '23503'
      ) {
        await api().dbRun(
          `DELETE FROM sync_queue WHERE id IN (${g.ids.map(() => '?').join(',')})`,
          g.ids
        );
        pullRequested = true; // bring the product back locally
        reportSyncError(`delete-blocked ${g.cid}`, err, {
          name: g.payload.name,
          sku: g.payload.sku,
        });
        continue;
      }

      reportSyncError(`push ${g.table} ${g.action} ${g.cid}`, err);
    }
  }

  if (pushTouchedLocal) {
    pushTouchedLocal = false;
    productCache = null;
    categoryCache = null;
    window.dispatchEvent(new Event(PRODUCTS_SYNCED_EVENT));
  }
};

// ============================================================
// SYNC — PULL (Supabase → local SQLite)
// ============================================================
/** product ids whose remote images we already looked at this session */
const imagesChecked = new Set<string>();

const fetchRemoteImages = async (
  ids: string[]
): Promise<Map<string, string[]>> => {
  const map = new Map<string, string[]>();
  for (let i = 0; i < ids.length; i += IMAGE_FETCH_CHUNK) {
    const chunk = ids.slice(i, i + IMAGE_FETCH_CHUNK);
    const { data, error } = await supabase
      .from('product_images')
      .select('product_id, image_data, sort_order')
      .in('product_id', chunk)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    for (const r of (data ?? []) as any[]) {
      const arr = map.get(r.product_id) ?? [];
      arr.push(r.image_data);
      map.set(r.product_id, arr);
    }
  }
  return map;
};

/**
 * Downloads categories + products and applies them locally, EXCEPT records
 * that still have unsent local changes. Images are downloaded only for
 * products that are new/changed (or have no local images yet).
 */
const pullRemote = async (): Promise<void> => {
  const businessId = await getBusinessId();

  const [catRes, prodRes] = await Promise.all([
    supabase.from('categories').select('*').eq('business_id', businessId),
    supabase.from('products').select('*').eq('business_id', businessId),
  ]);
  if (catRes.error) throw catRes.error;
  if (prodRes.error) throw prodRes.error;

  const remoteCats = ((catRes.data ?? []) as any[]).map(normalizeCategory);
  const remoteProducts = ((prodRes.data ?? []) as any[]).map(normalizeProduct);

  // ---- plan which products need their images downloaded ----
  const planLocal = await readProducts(businessId);
  const planJson = new Map(planLocal.map((p) => [p.id, JSON.stringify(p)]));
  const withImages = new Set(
    (
      await api().dbQuery<{ product_id: string }>(
        `SELECT DISTINCT product_id FROM product_images`
      )
    ).map((r) => r.product_id)
  );
  const needImages: string[] = [];
  for (const rp of remoteProducts) {
    const changed = planJson.get(rp.id) !== JSON.stringify(rp);
    const missing = !withImages.has(rp.id) && !imagesChecked.has(rp.id);
    if (changed || missing) needImages.push(rp.id);
  }
  const fetched =
    needImages.length > 0
      ? await fetchRemoteImages(needImages)
      : new Map<string, string[]>();

  // ---- apply everything inside the lock ----
  const changed = await withLock(async () => {
    const pendingProducts = await pendingIds('products');
    const pendingCats = await pendingIds('categories');
    let didChange = false;

    // categories
    const localCats = await readCategories(businessId);
    const localCatJson = new Map(
      localCats.map((c) => [c.id, JSON.stringify(c)])
    );
    const remoteCatIds = new Set<string>();
    for (const rc of remoteCats) {
      remoteCatIds.add(rc.id);
      if (pendingCats.has(rc.id)) continue;
      if (localCatJson.get(rc.id) !== JSON.stringify(rc)) {
        await upsertCategoryLocal(rc);
        didChange = true;
      }
    }
    for (const lc of localCats) {
      if (!remoteCatIds.has(lc.id) && !pendingCats.has(lc.id)) {
        await api().dbRun(`DELETE FROM categories WHERE id = ?`, [lc.id]);
        didChange = true;
      }
    }

    // products
    const localProducts = await readProducts(businessId);
    const localJson = new Map(
      localProducts.map((p) => [p.id, JSON.stringify(p)])
    );
    const remoteIds = new Set<string>();
    for (const rp of remoteProducts) {
      remoteIds.add(rp.id);
      if (pendingProducts.has(rp.id)) continue;
      if (localJson.get(rp.id) !== JSON.stringify(rp)) {
        await upsertProductLocal(rp);
        didChange = true;
      }
    }
    for (const lp of localProducts) {
      if (!remoteIds.has(lp.id) && !pendingProducts.has(lp.id)) {
        await api().dbRun(`DELETE FROM products WHERE id = ?`, [lp.id]);
        await api().dbRun(`DELETE FROM product_images WHERE product_id = ?`, [
          lp.id,
        ]);
        didChange = true;
      }
    }

    // images
    for (const id of needImages) {
      imagesChecked.add(id);
      if (pendingProducts.has(id)) continue;
      const imgs = fetched.get(id) ?? [];
      if (imgs.length === 0) continue; // remote has none → keep whatever is local
      const cur = await readImages(id);
      if (JSON.stringify(cur) !== JSON.stringify(imgs)) {
        await replaceLocalImages(id, imgs);
        didChange = true;
      }
    }

    if (didChange) {
      productCache = null;
      categoryCache = null;
      thumbCache = null;
    }
    return didChange;
  });

  if (changed) window.dispatchEvent(new Event(PRODUCTS_SYNCED_EVENT));
};

// ============================================================
// SYNC — ORCHESTRATION
// ============================================================
let syncing = false;
let rerun = false;
let lastPull = 0;
let syncTimer: ReturnType<typeof setInterval> | null = null;

const syncNow = async (forcePull = false): Promise<void> => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;
  if (forcePull) pullRequested = true;
  if (syncing) {
    rerun = true;
    return;
  }

  syncing = true;
  try {
    do {
      rerun = false;
      await ensureTables();
      await pushQueue();
      if (pullRequested || Date.now() - lastPull > PULL_INTERVAL_MS) {
        pullRequested = false;
        await pullRemote();
        lastPull = Date.now();
      }
    } while (rerun);
  } catch (err) {
    if (!isNetworkError(err)) reportSyncError('sync', err);
  } finally {
    syncing = false;
  }
};

// ============================================================
// SERVICE
// ============================================================
export const productService = {
  // ------------------------------------------------------------
  // sync control
  // ------------------------------------------------------------
  /** Runs a local product write while preventing sync from interleaving. */
  runExclusive<T>(fn: () => Promise<T>): Promise<T> {
    return withLock(fn);
  },

  /** Clears cached product data and notifies screens to reload from SQLite. */
  invalidateCache(): void {
    productCache = null;
    categoryCache = null;
    thumbCache = null;
    window.dispatchEvent(new Event(PRODUCTS_SYNCED_EVENT));
  },

  /** Starts background sync (idempotent). */
  startSyncWorker(): void {
    if (syncTimer) return;
    syncTimer = setInterval(() => void syncNow(), PUSH_INTERVAL_MS);
    window.addEventListener('online', () => void syncNow(true));
    window.addEventListener('focus', () => void syncNow(true));
    void syncNow(true);
  },

  /** Manual trigger (e.g. a "Sync now" button). */
  syncNow(): Promise<void> {
    return syncNow(true);
  },

  /** Instant snapshot for first paint (null on first launch). */
  getCachedSnapshot(): {
    products: Product[];
    categories: Category[];
    thumbnails: Record<string, string>;
  } | null {
    if (!productCache || !categoryCache || !thumbCache) return null;
    return {
      products: productCache,
      categories: categoryCache,
      thumbnails: thumbCache,
    };
  },

  // ============================================================
  // 📦 PRODUCTS (local SQLite only — instant, works offline)
  // ============================================================
  async getProducts(): Promise<Product[]> {
    await ensureTables();
    const businessId = await getBusinessId();
    const rows = await readProducts(businessId);
    productCache = rows;
    return rows;
  },

  /** First image of every product (for list thumbnails) */
  async getThumbnails(): Promise<Record<string, string>> {
    await ensureTables();
    const map = await readThumbnails();
    thumbCache = map;
    return map;
  },

  /** All images of ONE product (for edit / preview) */
  async getProductImages(productId: string): Promise<string[]> {
    await ensureTables();
    return readImages(productId);
  },

  async createProduct(product: ProductInput): Promise<Product> {
    await ensureTables();
    const businessId = await getBusinessId();
    const now = new Date().toISOString();

    const row: ProductRow = {
      id: product.id ?? crypto.randomUUID(),
      business_id: businessId,
      sku: product.sku,
      name: product.name,
      description: product.description ?? '',
      price: product.price,
      cost_price: product.cost_price ?? 0,
      stock: product.stock,
      low_stock_level: product.low_stock_level,
      active: true,
      unit_id: product.unit_id,
      category_id: product.category_id ?? null,
      image_url: null,
      created_at: now,
      updated_at: now,
    };

    await withLock(async () => {
      await upsertProductLocal(row);
      if (product.images) await replaceLocalImages(row.id, product.images);
      await api().addToSyncQueue('products', 'INSERT', {
        ...toProductPayload(row),
        ...(product.images ? { images: product.images.slice(0, MAX_IMAGES) } : {}),
      });
    });

    if (productCache) {
      productCache = [row, ...productCache.filter((p) => p.id !== row.id)];
    }
    if (thumbCache) {
      const next = { ...thumbCache };
      if (product.images?.[0]) next[row.id] = product.images[0];
      thumbCache = next;
    }
    void syncNow();
    return row;
  },

  async updateProduct(id: string, product: ProductInput): Promise<Product> {
    await ensureTables();
    const businessId = await getBusinessId();
    const now = new Date().toISOString();

    const { row, imagesChanged } = await withLock(async () => {
      const existingRows = await api().dbQuery<Record<string, unknown>>(
        `SELECT * FROM products WHERE id = ?`,
        [id]
      );
      const existing = existingRows[0] ? normalizeProduct(existingRows[0]) : null;

      const updated: ProductRow = {
        id,
        business_id: existing?.business_id ?? businessId,
        sku: product.sku,
        name: product.name,
        description: product.description ?? '',
        price: product.price,
        cost_price: product.cost_price ?? 0,
        stock: product.stock,
        low_stock_level: product.low_stock_level,
        active: existing?.active ?? true,
        unit_id: product.unit_id,
        category_id: product.category_id ?? null,
        image_url: null,
        created_at: existing?.created_at ?? now,
        updated_at: now,
      };

      await upsertProductLocal(updated);

      let changed = false;
      if (product.images) {
        const current = await readImages(id);
        if (JSON.stringify(current) !== JSON.stringify(product.images)) {
          await replaceLocalImages(id, product.images);
          changed = true;
        }
      }

      await api().addToSyncQueue('products', 'UPDATE', {
        ...toProductPayload(updated),
        ...(changed && product.images
          ? { images: product.images.slice(0, MAX_IMAGES) }
          : {}),
      });
      return { row: updated, imagesChanged: changed };
    });

    if (productCache) {
      productCache = productCache.map((p) => (p.id === id ? row : p));
    }
    if (thumbCache && imagesChanged) {
      const next = { ...thumbCache };
      if (product.images?.[0]) next[id] = product.images[0];
      else delete next[id];
      thumbCache = next;
    }
    void syncNow();
    return row;
  },

  async deleteProduct(id: string): Promise<void> {
    await ensureTables();

    await withLock(async () => {
      const existing = await api().dbQuery<{ name: string; sku: string }>(
        `SELECT name, sku FROM products WHERE id = ?`,
        [id]
      );
      await api().dbRun(`DELETE FROM products WHERE id = ?`, [id]);
      await api().dbRun(`DELETE FROM product_images WHERE product_id = ?`, [id]);
      await api().addToSyncQueue('products', 'DELETE', {
        id,
        name: existing[0]?.name ?? '',
        sku: existing[0]?.sku ?? '',
      });
    });

    if (productCache) productCache = productCache.filter((p) => p.id !== id);
    if (thumbCache) {
      const next = { ...thumbCache };
      delete next[id];
      thumbCache = next;
    }
    void syncNow();
  },

  /**
   * One-time migration of images that older versions kept in localStorage.
   * Returns the ids that are done (migrated, or already had images).
   * Products that are not in local SQLite yet are skipped (retried later).
   */
  async importLegacyImages(map: Record<string, string[]>): Promise<string[]> {
    await ensureTables();
    const done: string[] = [];

    for (const [id, imgs] of Object.entries(map)) {
      if (!Array.isArray(imgs) || imgs.length === 0) {
        done.push(id);
        continue;
      }
      await withLock(async () => {
        const rows = await api().dbQuery<Record<string, unknown>>(
          `SELECT * FROM products WHERE id = ?`,
          [id]
        );
        if (!rows[0]) return; // not available locally yet
        const current = await readImages(id);
        if (current.length === 0) {
          const list = imgs.slice(0, MAX_IMAGES);
          const now = new Date().toISOString();
          await replaceLocalImages(id, list);
          await api().dbRun(`UPDATE products SET updated_at = ? WHERE id = ?`, [
            now,
            id,
          ]);
          const row = normalizeProduct({ ...rows[0], updated_at: now });
          await api().addToSyncQueue('products', 'UPDATE', {
            ...toProductPayload(row),
            images: list,
          });
          thumbCache = null;
          productCache = null;
        }
        done.push(id);
      });
    }

    if (done.length > 0) void syncNow();
    return done;
  },

  // ============================================================
  // 🖼️ IMAGE UPLOAD (kept for other screens — online only)
  // ============================================================
  async uploadProductImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);
    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);
    return urlData.publicUrl;
  },

  // ============================================================
  // 🏷️ CATEGORIES (local first, pushed before products)
  // ============================================================
  async getCategories(): Promise<Category[]> {
    await ensureTables();
    const businessId = await getBusinessId();
    const rows = await readCategories(businessId);
    categoryCache = rows;
    return rows;
  },

  async createCategory(name: string): Promise<Category> {
    await ensureTables();
    const businessId = await getBusinessId();
    const row: CategoryRow = {
      id: crypto.randomUUID(),
      business_id: businessId,
      name: name.trim(),
      created_at: new Date().toISOString(),
    };

    await withLock(async () => {
      await upsertCategoryLocal(row);
      await api().addToSyncQueue('categories', 'INSERT', toCategoryPayload(row));
    });

    if (categoryCache) {
      categoryCache = [...categoryCache, row].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }
    void syncNow();
    return row;
  },
};