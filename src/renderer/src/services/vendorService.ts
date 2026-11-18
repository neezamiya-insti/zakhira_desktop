/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCurrentBusinessId, supabase } from '../lib/supabaseClient';

// ============================================================
// TYPES
// ============================================================
/** What the page works with (camelCase) */
export type Vendor = {
  id: string;
  uniqueId: string;
  name: string;
  companyName: string;
  phone: string;
  vatNumber: string | null;
  address: string;
  city: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type VendorInput = {
  /** Optional: lets the UI pre-generate the id so optimistic UI + SQLite + Supabase share one UUID */
  id?: string;
  name: string;
  companyName: string;
  phone: string;
  vatNumber: string;
  address: string;
  city: string;
};

/** Row shape — identical in SQLite and Supabase (snake_case) */
type VendorRow = {
  id: string;
  business_id: string;
  unique_id: string;
  name: string;
  company_name: string;
  phone: string;
  vat_number: string | null;
  address: string;
  city: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

type SyncAction = 'INSERT' | 'UPDATE' | 'DELETE';

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

/** Thrown when a vendor has purchase orders and therefore cannot be deleted. */
export class VendorHasOrdersError extends Error {
  count: number;
  constructor(count: number) {
    super(`Vendor has ${count} order(s) and cannot be deleted`);
    this.name = 'VendorHasOrdersError';
    this.count = count;
    Object.setPrototypeOf(this, VendorHasOrdersError.prototype);
  }
}

// ============================================================
// EVENTS (the page listens to these)
// ============================================================
/** Background sync CHANGED local data → page should re-read SQLite */
export const VENDORS_SYNCED_EVENT = 'zakhira:vendors-synced';
/** Pushing/pulling failed for a reason other than "offline" */
export const VENDORS_SYNC_ERROR_EVENT = 'zakhira:vendors-sync-error';

// ============================================================
// SMALL UTILITIES
// ============================================================
const BUSINESS_ID_KEY = 'zakhira_business_id';
const PUSH_INTERVAL_MS = 5000;
const PULL_INTERVAL_MS = 20000;

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
  extra: { name?: string; uniqueId?: string; count?: number } = {}
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
  console.error('[VendorSync]', key, err);
  window.dispatchEvent(
    new CustomEvent(VENDORS_SYNC_ERROR_EVENT, {
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

const uniqueIdNumber = (id: string): number => {
  const m = String(id).match(/VND-(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
};

const nextUniqueIdFrom = (ids: string[]): string => {
  const max = ids.reduce((m, s) => Math.max(m, uniqueIdNumber(s)), 0);
  return `VND-${String(max + 1).padStart(4, '0')}`;
};

// ============================================================
// NORMALIZERS / MAPPERS
// ============================================================
const normalizeRow = (r: any): VendorRow => ({
  id: String(r.id),
  business_id: String(r.business_id),
  unique_id: String(r.unique_id ?? ''),
  name: String(r.name ?? ''),
  company_name: String(r.company_name ?? ''),
  phone: String(r.phone ?? ''),
  vat_number: r.vat_number ?? null,
  address: String(r.address ?? ''),
  city: String(r.city ?? ''),
  active: r.active == null ? true : r.active === true || r.active === 1,
  created_at: String(r.created_at),
  updated_at: String(r.updated_at ?? r.created_at),
});

const toVendor = (r: VendorRow): Vendor => ({
  id: r.id,
  uniqueId: r.unique_id,
  name: r.name,
  companyName: r.company_name,
  phone: r.phone,
  vatNumber: r.vat_number,
  address: r.address,
  city: r.city,
  active: r.active,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

/** Exactly the columns that exist in the Supabase `vendors` table */
const toPayload = (r: VendorRow): Record<string, unknown> => ({
  id: r.id,
  business_id: r.business_id,
  unique_id: r.unique_id,
  name: r.name,
  company_name: r.company_name,
  phone: r.phone,
  vat_number: r.vat_number,
  address: r.address,
  city: r.city,
  active: r.active,
  created_at: r.created_at,
  updated_at: r.updated_at,
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
        `CREATE TABLE IF NOT EXISTS vendors (
           id           TEXT PRIMARY KEY,
           business_id  TEXT NOT NULL,
           unique_id    TEXT NOT NULL,
           name         TEXT NOT NULL,
           company_name TEXT NOT NULL,
           phone        TEXT,
           vat_number   TEXT,
           address      TEXT,
           city         TEXT,
           active       INTEGER NOT NULL DEFAULT 1,
           created_at   TEXT NOT NULL,
           updated_at   TEXT
         )`
      );
      const columns = await db.dbQuery<{ name: string }>(
        'PRAGMA table_info(vendors)'
      );
      if (!columns.some((column) => column.name === 'vat_number')) {
        await db.dbRun('ALTER TABLE vendors ADD COLUMN vat_number TEXT');
      }
      await db.dbRun(
        `CREATE INDEX IF NOT EXISTS idx_vendors_business
           ON vendors (business_id, created_at DESC)`
      );
      // purchase-order counts per vendor (downloaded while online → works offline)
      await db.dbRun(
        `CREATE TABLE IF NOT EXISTS vendor_order_counts (
           vendor_id TEXT PRIMARY KEY,
           n         INTEGER NOT NULL DEFAULT 0
         )`
      );
    })().catch((err) => {
      tableReady = null; // allow retry
      throw err;
    });
  }
  return tableReady;
};

const readLocal = async (businessId: string): Promise<VendorRow[]> => {
  const rows = await api().dbQuery<Record<string, unknown>>(
    `SELECT * FROM vendors WHERE business_id = ? ORDER BY created_at DESC`,
    [businessId]
  );
  return rows.map(normalizeRow);
};

const readCounts = async (): Promise<Record<string, number>> => {
  const rows = await api().dbQuery<{ vendor_id: string; n: number }>(
    `SELECT vendor_id, n FROM vendor_order_counts`
  );
  const map: Record<string, number> = {};
  rows.forEach((r) => {
    if (Number(r.n) > 0) map[r.vendor_id] = Number(r.n);
  });
  return map;
};

const upsertLocal = async (r: VendorRow): Promise<void> => {
  await api().dbRun(
    `INSERT INTO vendors
       (id, business_id, unique_id, name, company_name, phone, vat_number,
        address, city, active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       business_id = excluded.business_id,
       unique_id = excluded.unique_id,
       name = excluded.name,
       company_name = excluded.company_name,
       phone = excluded.phone,
       vat_number = excluded.vat_number,
       address = excluded.address,
       city = excluded.city,
       active = excluded.active,
       created_at = excluded.created_at,
       updated_at = excluded.updated_at`,
    [
      r.id,
      r.business_id,
      r.unique_id,
      r.name,
      r.company_name,
      r.phone,
      r.vat_number,
      r.address,
      r.city,
      r.active ? 1 : 0,
      r.created_at,
      r.updated_at,
    ]
  );
};

/** ids that still have unsent local changes in the sync queue */
const pendingIds = async (): Promise<Set<string>> => {
  const queued = await api().dbQuery<{ payload: string }>(
    `SELECT payload FROM sync_queue WHERE table_name = 'vendors'`
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
let vendorCache: VendorRow[] | null = null;
let countsCache: Record<string, number> | null = null;

// ============================================================
// SYNC — PUSH (local queue → Supabase)
// ============================================================
type QueueRow = { id: number; action: SyncAction; payload: string };

type Group = {
  ids: number[];
  action: SyncAction;
  payload: Record<string, any>;
};

let pullRequested = false;
let pushTouchedLocal = false;

const nextFreeUniqueId = async (businessId: string): Promise<string> => {
  const { data } = await supabase
    .from('vendors')
    .select('unique_id')
    .eq('business_id', businessId);
  const local = await api().dbQuery<{ unique_id: string }>(
    `SELECT unique_id FROM vendors WHERE business_id = ?`,
    [businessId]
  );
  return nextUniqueIdFrom([
    ...((data ?? []) as { unique_id: string }[]).map((r) => r.unique_id),
    ...local.map((r) => r.unique_id),
  ]);
};

/** Pushes one vendor group. Returns the server row (or null). */
const pushVendor = async (
  cid: string,
  g: Group
): Promise<Record<string, any> | null> => {
  if (g.action === 'DELETE') {
    const { error } = await supabase.from('vendors').delete().eq('id', cid);
    if (error) throw error;
    return null;
  }

  const row: Record<string, any> = { ...g.payload };
  const attempt = () =>
    supabase.from('vendors').upsert(row, { onConflict: 'id' }).select().single();

  let { data, error } = await attempt();

  // Another device already used this ID → take the next free one and retry
  if (error && isUniqueViolation(error, 'unique_id')) {
    const oldId = String(row.unique_id);
    const newId = await nextFreeUniqueId(String(row.business_id));
    row.unique_id = newId;
    ({ data, error } = await attempt());
    if (!error) {
      await withLock(async () => {
        await api().dbRun(`UPDATE vendors SET unique_id = ? WHERE id = ?`, [
          newId,
          cid,
        ]);
        await api().dbRun(
          `UPDATE sync_queue SET payload = REPLACE(payload, ?, ?)
            WHERE table_name = 'vendors' AND payload LIKE ?`,
          [`"unique_id":"${oldId}"`, `"unique_id":"${newId}"`, `%"id":"${cid}"%`]
        );
      });
      pushTouchedLocal = true;
    }
  }
  if (error) throw error;
  return data as Record<string, any>;
};

/** Writes the server's version into SQLite — unless newer local changes are queued. */
const applyServerRow = async (row: Record<string, any>): Promise<void> => {
  await withLock(async () => {
    const pending = await pendingIds();
    if (pending.has(String(row.id))) return;
    const local = await api().dbQuery<{ id: string }>(
      `SELECT id FROM vendors WHERE id = ?`,
      [row.id]
    );
    if (!local[0]) return; // deleted locally in the meantime
    await upsertLocal(normalizeRow(row));
  });
};

/**
 * Sends queued changes to Supabase.
 *  - Grouped per vendor; last action wins (payloads are full rows).
 *  - Offline  → throws a network error (cycle stops, retried later).
 *  - Real error for one vendor → reported, it stays queued, OTHERS still sync.
 */
const pushQueue = async (): Promise<void> => {
  const rows = await api().dbQuery<QueueRow>(
    `SELECT id, action, payload FROM sync_queue
      WHERE table_name = 'vendors' ORDER BY id ASC`
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
    const g = groups.get(cid);
    if (g) {
      g.ids.push(r.id);
      g.action = r.action;
      g.payload = payload;
    } else {
      groups.set(cid, { ids: [r.id], action: r.action, payload });
    }
  }

  for (const [cid, g] of groups) {
    try {
      const serverRow = await pushVendor(cid, g);
      await api().dbRun(
        `DELETE FROM sync_queue WHERE id IN (${g.ids.map(() => '?').join(',')})`,
        g.ids
      );
      if (serverRow) await applyServerRow(serverRow);
    } catch (err) {
      if (isNetworkError(err)) throw err; // offline → stop, retry later

      // Vendor cannot be deleted on the server (it has purchase orders)
      if (g.action === 'DELETE' && errCode(err) === '23503') {
        await api().dbRun(
          `DELETE FROM sync_queue WHERE id IN (${g.ids.map(() => '?').join(',')})`,
          g.ids
        );
        pullRequested = true; // bring the vendor back locally
        let count = 1;
        try {
          const res = await supabase
            .from('purchase_orders')
            .select('*', { count: 'exact', head: true })
            .eq('vendor_id', cid);
          if (!res.error && res.count) count = res.count;
        } catch {
          /* keep default */
        }
        reportSyncError(`delete-blocked ${cid}`, err, {
          name: String(g.payload.company_name || g.payload.name || ''),
          uniqueId: String(g.payload.unique_id || ''),
          count,
        });
        continue;
      }

      reportSyncError(`push ${g.action} ${cid}`, err);
    }
  }

  if (pushTouchedLocal) {
    pushTouchedLocal = false;
    vendorCache = null;
    window.dispatchEvent(new Event(VENDORS_SYNCED_EVENT));
  }
};

// ============================================================
// SYNC — PULL (Supabase → local SQLite)
// ============================================================
const pullRemote = async (): Promise<void> => {
  const businessId = await getBusinessId();

  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('business_id', businessId);
  if (error) throw error;
  const remote = ((data ?? []) as any[]).map(normalizeRow);

  // purchase-order counts per vendor (best effort — ignored if not allowed)
  let remoteCounts: Record<string, number> | null = null;
  try {
    const po = await supabase
      .from('purchase_orders')
      .select('vendor_id')
      .eq('business_id', businessId);
    if (!po.error) {
      remoteCounts = {};
      for (const r of (po.data ?? []) as { vendor_id: string }[]) {
        remoteCounts[r.vendor_id] = (remoteCounts[r.vendor_id] ?? 0) + 1;
      }
    }
  } catch {
    /* ignore */
  }

  const changed = await withLock(async () => {
    const pending = await pendingIds();
    const local = await readLocal(businessId);
    const localJson = new Map(local.map((r) => [r.id, JSON.stringify(r)]));
    const remoteIds = new Set<string>();
    let didChange = false;

    for (const row of remote) {
      remoteIds.add(row.id);
      if (pending.has(row.id)) continue;
      if (localJson.get(row.id) !== JSON.stringify(row)) {
        await upsertLocal(row);
        didChange = true;
      }
    }

    for (const l of local) {
      if (!remoteIds.has(l.id) && !pending.has(l.id)) {
        await api().dbRun(`DELETE FROM vendors WHERE id = ?`, [l.id]);
        didChange = true;
      }
    }

    if (remoteCounts) {
      const cur = await readCounts();
      const sig = (m: Record<string, number>): string =>
        JSON.stringify(Object.entries(m).sort(([a], [b]) => a.localeCompare(b)));
      if (sig(cur) !== sig(remoteCounts)) {
        await api().dbRun(`DELETE FROM vendor_order_counts`);
        for (const [vendorId, n] of Object.entries(remoteCounts)) {
          await api().dbRun(
            `INSERT INTO vendor_order_counts (vendor_id, n) VALUES (?, ?)`,
            [vendorId, n]
          );
        }
        didChange = true;
      }
    }

    if (didChange) {
      vendorCache = null;
      countsCache = null;
    }
    return didChange;
  });

  if (changed) window.dispatchEvent(new Event(VENDORS_SYNCED_EVENT));
};

// ============================================================
// SYNC — ORCHESTRATION
// ============================================================
let syncing = false;
let rerun = false;
let lastPull = 0;
let syncTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Push queue → (optionally) pull remote. Single-flight: if called while a
 * sync is running it simply schedules one more pass right after.
 */
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
export const vendorsService = {
  // ------------------------------------------------------------
  // sync control
  // ------------------------------------------------------------
  /** Starts background sync (idempotent). Safe to call from the page or App.tsx. */
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
    vendors: Vendor[];
    orderCounts: Record<string, number>;
  } | null {
    if (!vendorCache || !countsCache) return null;
    return {
      vendors: vendorCache.map(toVendor),
      orderCounts: countsCache,
    };
  },

  // ============================================================
  // 📋 READ — ALWAYS local SQLite only (instant, works offline)
  // ============================================================
  async getVendors(): Promise<Vendor[]> {
    await ensureTables();
    const businessId = await getBusinessId();
    const rows = await readLocal(businessId);
    vendorCache = rows;
    return rows.map(toVendor);
  },

  /** { vendorId: number of purchase orders } — last known values, works offline */
  async getOrderCounts(): Promise<Record<string, number>> {
    await ensureTables();
    const counts = await readCounts();
    countsCache = counts;
    return counts;
  },

  /** Next free VND-000N (based on local data) — shown in the "Add vendor" form */
  async getNextUniqueId(): Promise<string> {
    await ensureTables();
    const businessId = await getBusinessId();
    const rows = await readLocal(businessId);
    return nextUniqueIdFrom(rows.map((r) => r.unique_id));
  },

  // ============================================================
  // ➕ CREATE — SQLite first, then queue, then push right away
  // ============================================================
  async createVendor(vendor: VendorInput): Promise<Vendor> {
    await ensureTables();
    const businessId = await getBusinessId();
    const now = new Date().toISOString();

    const row = await withLock(async () => {
      // generated INSIDE the lock → two quick saves can never get the same ID
      const existing = await readLocal(businessId);
      const created: VendorRow = {
        id: vendor.id ?? crypto.randomUUID(),
        business_id: businessId,
        unique_id: nextUniqueIdFrom(existing.map((r) => r.unique_id)),
        name: vendor.name,
        company_name: vendor.companyName,
        phone: vendor.phone,
        vat_number: vendor.vatNumber.trim() || null,
        address: vendor.address,
        city: vendor.city,
        active: true,
        created_at: now,
        updated_at: now,
      };
      await upsertLocal(created);
      await api().addToSyncQueue('vendors', 'INSERT', toPayload(created));
      return created;
    });

    if (vendorCache) {
      vendorCache = [row, ...vendorCache.filter((v) => v.id !== row.id)];
    }
    void syncNow();
    return toVendor(row);
  },

  // ============================================================
  // ✏️ UPDATE
  // ============================================================
  async updateVendor(id: string, vendor: VendorInput): Promise<Vendor> {
    await ensureTables();
    const businessId = await getBusinessId();
    const now = new Date().toISOString();

    const row = await withLock(async () => {
      const found = await api().dbQuery<Record<string, unknown>>(
        `SELECT * FROM vendors WHERE id = ?`,
        [id]
      );
      const existing = found[0] ? normalizeRow(found[0]) : null;

      const updated: VendorRow = {
        id,
        business_id: existing?.business_id ?? businessId,
        unique_id: existing?.unique_id ?? '',
        name: vendor.name,
        company_name: vendor.companyName,
        phone: vendor.phone,
        vat_number: vendor.vatNumber.trim() || null,
        address: vendor.address,
        city: vendor.city,
        active: existing?.active ?? true,
        created_at: existing?.created_at ?? now,
        updated_at: now,
      };
      if (!updated.unique_id) {
        const all = await readLocal(businessId);
        updated.unique_id = nextUniqueIdFrom(all.map((r) => r.unique_id));
      }

      await upsertLocal(updated);
      await api().addToSyncQueue('vendors', 'UPDATE', toPayload(updated));
      return updated;
    });

    if (vendorCache) vendorCache = vendorCache.map((v) => (v.id === id ? row : v));
    void syncNow();
    return toVendor(row);
  },

  // ============================================================
  // 🔄 ACTIVATE / DEACTIVATE
  // ============================================================
  async setVendorActive(id: string, active: boolean): Promise<Vendor> {
    await ensureTables();
    const now = new Date().toISOString();

    const row = await withLock(async () => {
      const found = await api().dbQuery<Record<string, unknown>>(
        `SELECT * FROM vendors WHERE id = ?`,
        [id]
      );
      if (!found[0]) throw new Error('Vendor not found');
      const updated: VendorRow = {
        ...normalizeRow(found[0]),
        active,
        updated_at: now,
      };
      await upsertLocal(updated);
      await api().addToSyncQueue('vendors', 'UPDATE', toPayload(updated));
      return updated;
    });

    if (vendorCache) vendorCache = vendorCache.map((v) => (v.id === id ? row : v));
    void syncNow();
    return toVendor(row);
  },

  // ============================================================
  // 🗑️ DELETE — blocked when the vendor has orders
  // ============================================================
  async deleteVendor(id: string): Promise<void> {
    await ensureTables();

    const counts = await readCounts();
    if ((counts[id] ?? 0) > 0) throw new VendorHasOrdersError(counts[id]);

    await withLock(async () => {
      const found = await api().dbQuery<Record<string, unknown>>(
        `SELECT * FROM vendors WHERE id = ?`,
        [id]
      );
      const existing = found[0] ? normalizeRow(found[0]) : null;
      await api().dbRun(`DELETE FROM vendors WHERE id = ?`, [id]);
      await api().addToSyncQueue('vendors', 'DELETE', {
        id,
        name: existing?.name ?? '',
        company_name: existing?.company_name ?? '',
        unique_id: existing?.unique_id ?? '',
      });
    });

    if (vendorCache) vendorCache = vendorCache.filter((v) => v.id !== id);
    void syncNow();
  },
};