import { getCurrentBusinessId, supabase } from '../lib/supabaseClient';

// ============================================================
// TYPES
// ============================================================
export type CustomerInput = {
  /** Optional: lets the UI pre-generate the id so optimistic UI + SQLite + Supabase all share one UUID */
  id?: string;
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  phone_alt?: string | null;
  vat_number?: string | null;
  address?: string | null;
  city?: string | null;
};

/** Row shape — identical in SQLite and Supabase (snake_case) */
export type CustomerRow = {
  id: string;
  business_id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  phone_alt: string | null;
  vat_number: string | null;
  address: string | null;
  city: string | null;
  created_at: string;
  updated_at: string | null;
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

// ============================================================
// EVENTS (the page listens to these)
// ============================================================
/** Fired when a background sync CHANGED the local SQLite data → page should re-read it */
export const CUSTOMERS_SYNCED_EVENT = 'zakhira:customers-synced';
/** Fired when pushing/pulling fails for a reason other than "offline" */
export const CUSTOMERS_SYNC_ERROR_EVENT = 'zakhira:customers-sync-error';

// ============================================================
// SMALL UTILITIES
// ============================================================
const BUSINESS_ID_KEY = 'zakhira_business_id';
const PUSH_INTERVAL_MS = 5000; // check the queue every 5s (cheap when empty)
const PULL_INTERVAL_MS = 20000; // download remote changes at most every 20s

/**
 * Offline-safe business id. Hits Supabase only the first time (while online),
 * then reads from localStorage. Clear BUSINESS_ID_KEY on logout / business switch.
 */
const getBusinessId = async (): Promise<string> => {
  const cached = localStorage.getItem(BUSINESS_ID_KEY);
  if (cached) return cached;
  const id = (await getCurrentBusinessId()) as string;
  localStorage.setItem(BUSINESS_ID_KEY, id);
  return id;
};

/**
 * Tiny mutex. Every local write (row + queue entry) and the "apply remote
 * changes" step run inside it, so a pull can never see a half-finished write.
 */
let lockChain: Promise<unknown> = Promise.resolve();
const withLock = <T>(fn: () => Promise<T>): Promise<T> => {
  const run = lockChain.then(fn);
  lockChain = run.catch(() => undefined);
  return run;
};

/** True when the failure just means "no internet" (retry later, not a real error). */
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

/** Reports a REAL sync error once (console + event → page shows popup). */
const reportedErrors = new Set<string>();
const reportSyncError = (key: string, err: unknown): void => {
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
  console.error('[CustomerSync]', key, err);
  window.dispatchEvent(
    new CustomEvent(CUSTOMERS_SYNC_ERROR_EVENT, {
      detail: {
        message,
        details: [e?.details, e?.hint ? `Hint: ${e.hint}` : '']
          .filter(Boolean)
          .join('\n') || undefined,
        code: e?.code,
      },
    })
  );
};

const normalizeRow = (r: CustomerRow): CustomerRow => ({
  id: r.id,
  business_id: r.business_id,
  name: r.name,
  company: r.company ?? null,
  email: r.email ?? null,
  phone: r.phone ?? null,
  phone_alt: r.phone_alt ?? null,
  vat_number: r.vat_number ?? null,
  address: r.address ?? null,
  city: r.city ?? null,
  created_at: r.created_at,
  updated_at: r.updated_at ?? null,
});

// ============================================================
// LOCAL DB
// ============================================================
let tableReady: Promise<void> | null = null;

/** Idempotent. Safe to call on every operation. */
const ensureTable = (): Promise<void> => {
  if (!tableReady) {
    tableReady = (async () => {
      await api().dbRun(
        `CREATE TABLE IF NOT EXISTS customers (
           id          TEXT PRIMARY KEY,
           business_id TEXT NOT NULL,
           name        TEXT NOT NULL,
           company     TEXT,
           email       TEXT,
           phone       TEXT,
           phone_alt   TEXT,
           vat_number  TEXT,
           address     TEXT,
           city        TEXT,
           created_at  TEXT NOT NULL,
           updated_at  TEXT
         )`
      );
      const columns = await api().dbQuery<{ name: string }>(
        'PRAGMA table_info(customers)'
      );
      if (!columns.some((column) => column.name === 'vat_number')) {
        await api().dbRun('ALTER TABLE customers ADD COLUMN vat_number TEXT');
      }
      await api().dbRun(
        `CREATE INDEX IF NOT EXISTS idx_customers_business
           ON customers (business_id, created_at DESC)`
      );
    })().catch((err) => {
      tableReady = null; // allow retry
      throw err;
    });
  }
  return tableReady;
};

const readLocal = (businessId: string): Promise<CustomerRow[]> =>
  api().dbQuery<CustomerRow>(
    `SELECT * FROM customers WHERE business_id = ? ORDER BY created_at DESC`,
    [businessId]
  );

const upsertIntoLocalDb = async (row: CustomerRow): Promise<void> => {
  await api().dbRun(
    `INSERT INTO customers
       (id, business_id, name, company, email, phone, phone_alt, vat_number, address, city, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       business_id = excluded.business_id,
       name = excluded.name,
       company = excluded.company,
       email = excluded.email,
       phone = excluded.phone,
       phone_alt = excluded.phone_alt,
       vat_number = excluded.vat_number,
       address = excluded.address,
       city = excluded.city,
       created_at = excluded.created_at,
       updated_at = excluded.updated_at`,
    [
      row.id,
      row.business_id,
      row.name,
      row.company,
      row.email,
      row.phone,
      row.phone_alt,
      row.vat_number,
      row.address,
      row.city,
      row.created_at,
      row.updated_at,
    ]
  );
};

/** In-memory snapshot so the page can render instantly on re-mount */
let cache: CustomerRow[] | null = null;

// ============================================================
// SYNC — PUSH (local queue → Supabase)
// ============================================================
type QueueRow = { id: number; action: SyncAction; payload: string };

/**
 * Sends queued changes to Supabase.
 *  - Changes are grouped per customer; only the LAST action matters because
 *    every payload is the full row (INSERT+UPDATE+UPDATE → one upsert,
 *    INSERT+DELETE → one delete).
 *  - Offline  → throws a network error (whole cycle stops, retried later).
 *  - Real error for one customer (RLS, duplicate phone, …) → reported, that
 *    customer stays queued, but OTHER customers still sync (no more stuck queue).
 */
const pushQueue = async (): Promise<void> => {
  const rows = await api().dbQuery<QueueRow>(
    `SELECT id, action, payload FROM sync_queue
      WHERE table_name = 'customers' ORDER BY id ASC`
  );

  if (rows.length === 0) {
    reportedErrors.clear();
    return;
  }

  const groups = new Map<
    string,
    { ids: number[]; action: SyncAction; payload: Record<string, unknown> }
  >();

  for (const r of rows) {
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(r.payload) as Record<string, unknown>;
    } catch {
      await api().dbRun('DELETE FROM sync_queue WHERE id = ?', [r.id]); // corrupt entry
      continue;
    }
    const cid = payload?.id ? String(payload.id) : '';
    if (!cid) {
      await api().dbRun('DELETE FROM sync_queue WHERE id = ?', [r.id]);
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
      if (g.action === 'DELETE') {
        const { error } = await supabase.from('customers').delete().eq('id', cid);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('customers')
          .upsert(g.payload, { onConflict: 'id' });
        if (error) throw error;
      }
      await api().dbRun(
        `DELETE FROM sync_queue WHERE id IN (${g.ids.map(() => '?').join(',')})`,
        g.ids
      );
    } catch (err) {
      if (isNetworkError(err)) throw err; // offline → stop, retry later
      reportSyncError(`push ${g.action} ${cid}`, err); // real error → show it, keep going
    }
  }
};

// ============================================================
// SYNC — PULL (Supabase → local SQLite)
// ============================================================
/**
 * Downloads the remote list and applies it locally, EXCEPT for customers that
 * still have unsent local changes (those win until they are pushed).
 * Also removes local rows that were deleted on another device.
 */
const pullRemote = async (): Promise<void> => {
  const businessId = await getBusinessId();

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('business_id', businessId);
  if (error) throw error;

  const remote = ((data ?? []) as CustomerRow[]).map(normalizeRow);

  const changed = await withLock(async () => {
    // Unsent local changes (checked INSIDE the lock → consistent)
    const queued = await api().dbQuery<{ payload: string }>(
      `SELECT payload FROM sync_queue WHERE table_name = 'customers'`
    );
    const pending = new Set<string>();
    for (const q of queued) {
      try {
        const p = JSON.parse(q.payload) as { id?: string };
        if (p?.id) pending.add(String(p.id));
      } catch {
        /* ignore corrupt entry */
      }
    }

    const local = (await readLocal(businessId)).map(normalizeRow);
    const localJson = new Map(local.map((r) => [r.id, JSON.stringify(r)]));
    const remoteIds = new Set<string>();
    let didChange = false;

    for (const row of remote) {
      remoteIds.add(row.id);
      if (pending.has(row.id)) continue;
      if (localJson.get(row.id) !== JSON.stringify(row)) {
        await upsertIntoLocalDb(row);
        didChange = true;
      }
    }

    for (const l of local) {
      if (!remoteIds.has(l.id) && !pending.has(l.id)) {
        await api().dbRun('DELETE FROM customers WHERE id = ?', [l.id]);
        didChange = true;
      }
    }

    if (didChange) cache = await readLocal(businessId);
    return didChange;
  });

  if (changed) window.dispatchEvent(new Event(CUSTOMERS_SYNCED_EVENT));
};

// ============================================================
// SYNC — ORCHESTRATION
// ============================================================
let syncing = false;
let rerun = false;
let pullRequested = false;
let lastPull = 0;

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
      await ensureTable();
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

let syncTimer: ReturnType<typeof setInterval> | null = null;

// ============================================================
// SERVICE
// ============================================================
export const customerService = {
  /** Synchronous snapshot of the last loaded list (or null on first launch). */
  getCached(): CustomerRow[] | null {
    return cache;
  },

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

  // 1. Read — ALWAYS local SQLite only (instant, works offline)
  async getCustomers(): Promise<CustomerRow[]> {
    await ensureTable();
    const businessId = await getBusinessId();
    const rows = await readLocal(businessId);
    cache = rows;
    return rows;
  },

  // 2. Create — SQLite first, then queue the exact same row, then push right away
  async createCustomer(customer: CustomerInput): Promise<CustomerRow> {
    await ensureTable();
    const businessId = await getBusinessId();
    const now = new Date().toISOString();

    const row: CustomerRow = {
      id: customer.id ?? crypto.randomUUID(),
      business_id: businessId,
      name: customer.name,
      company: customer.company ?? null,
      email: customer.email ?? null,
      phone: customer.phone ?? null,
      phone_alt: customer.phone_alt ?? null,
      vat_number: customer.vat_number?.trim() || null,
      address: customer.address ?? null,
      city: customer.city ?? null,
      created_at: now,
      updated_at: now,
    };

    await withLock(async () => {
      // 1) Local write
      await api().dbRun(
        `INSERT INTO customers
           (id, business_id, name, company, email, phone, phone_alt, vat_number, address, city, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          row.id,
          row.business_id,
          row.name,
          row.company,
          row.email,
          row.phone,
          row.phone_alt,
          row.vat_number,
          row.address,
          row.city,
          row.created_at,
          row.updated_at,
        ]
      );
      // 2) Queue the full row (pushed with supabase upsert → safe to retry)
      await api().addToSyncQueue('customers', 'INSERT', { ...row });
    });

    if (cache) cache = [row, ...cache.filter((c) => c.id !== row.id)];
    void syncNow(); // push immediately if online
    return row;
  },

  // 3. Update — SQLite first, then queue the full updated row, then push right away
  async updateCustomer(id: string, customer: CustomerInput): Promise<CustomerRow> {
    await ensureTable();
    const businessId = await getBusinessId();
    const now = new Date().toISOString();

    const row = await withLock(async () => {
      const existing = await api().dbQuery<CustomerRow>(
        'SELECT * FROM customers WHERE id = ?',
        [id]
      );

      const updated: CustomerRow = {
        id,
        business_id: existing[0]?.business_id ?? businessId,
        name: customer.name,
        company: customer.company ?? null,
        email: customer.email ?? null,
        phone: customer.phone ?? null,
        phone_alt: customer.phone_alt ?? null,
        vat_number: customer.vat_number?.trim() || null,
        address: customer.address ?? null,
        city: customer.city ?? null,
        created_at: existing[0]?.created_at ?? now,
        updated_at: now,
      };

      // 1) Local write (upsert → also works if the row was missing locally)
      await upsertIntoLocalDb(updated);
      // 2) Queue the full row
      await api().addToSyncQueue('customers', 'UPDATE', { ...updated });
      return updated;
    });

    if (cache) cache = cache.map((c) => (c.id === id ? row : c));
    void syncNow();
    return row;
  },

  // 4. Delete — SQLite first, then queue the id, then push right away
  async deleteCustomer(id: string): Promise<void> {
    await ensureTable();

    await withLock(async () => {
      await api().dbRun('DELETE FROM customers WHERE id = ?', [id]);
      await api().addToSyncQueue('customers', 'DELETE', { id });
    });

    if (cache) cache = cache.filter((c) => c.id !== id);
    void syncNow();
  },
};