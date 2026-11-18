/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase, getCurrentBusinessId } from '../lib/supabaseClient';

// ============================================================
// TYPES (UI shape — same field names the AccountingPage already uses)
// ============================================================
export type TransactionType = 'In' | 'Out' | 'Return';
export type PaymentMode = 'Cash' | 'Card' | 'Bank Transfer' | 'Other';
export type TxnStatus = 'Paid' | 'Partially Paid' | 'Returned';

export type AccountingTransaction = {
  id: string;
  transactionNo: string;
  date: string;
  customerName: string;
  companyName: string;
  invoiceRef: string;
  invoiceFile?: string;
  invoiceFileName?: string;
  type: TransactionType;
  amount: number;
  status: TxnStatus;
  mode: PaymentMode;
  linkedInvoiceId?: string; // sales_documents.id
  sourceDocumentId?: string; // sales_documents.id
  sourceModule?: 'sales' | 'inventory' | 'manual';
  notes?: string;
  createdAt: string;
  hasReturn?: boolean;
  returnTransactionId?: string;
  originalTransactionId?: string; // transaction_no of the original "In" entry
  returnNumber?: string;
};

export type NewTransactionInput = {
  type: TransactionType;
  date: string;
  customerName: string;
  companyName?: string;
  invoiceRef?: string;
  invoiceFile?: string;
  invoiceFileName?: string;
  amount: number;
  status: TxnStatus;
  mode: PaymentMode;
  notes?: string;
  // only for type === 'Return'
  originalTransactionDbId?: string; // accounting_transactions.id of the original "In" row
  salesDocumentId?: string; // sales_documents.id (if the original came from sales)
};

export type RealInvoiceLine = {
  id: string;
  material: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type RealInvoice = {
  id: string;
  orderNumber: string;
  status: string;
  issueDate: string;
  createdAt: string;
  notes: string;
  vatRate: number;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  createdBy: string; // profile name
  customerSnapshot: {
    name: string;
    company: string;
    phone: string;
    address: string;
    city: string;
  };
  lines: RealInvoiceLine[];
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

/** Raw Supabase row (snake_case) + the return number joined from sales_returns */
type TxnRow = {
  id: string;
  business_id: string;
  transaction_no: string;
  txn_date: string;
  customer_name: string | null;
  company_name: string | null;
  invoice_ref: string | null;
  invoice_file: string | null;
  invoice_file_name: string | null;
  type: TransactionType;
  amount: number;
  status: TxnStatus;
  mode: PaymentMode;
  source_module: 'sales' | 'inventory' | 'manual' | null;
  sales_document_id: string | null;
  original_transaction_id: string | null;
  has_return: boolean | null;
  notes: string | null;
  created_at: string;
  _return_number?: string | null;
  [k: string]: any;
};

// ============================================================
// EVENTS (the page listens to these)
// ============================================================
/** Fired when a background sync CHANGED the local SQLite data → page should re-read it */
export const ACCOUNTING_SYNCED_EVENT = 'zakhira:accounting-synced';
/** Fired when pushing/pulling fails for a reason other than "offline" */
export const ACCOUNTING_SYNC_ERROR_EVENT = 'zakhira:accounting-sync-error';

// ============================================================
// CONSTANTS + SMALL UTILITIES
// ============================================================
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PAGE = 1000;
const BUSINESS_ID_KEY = 'zakhira_business_id';
const QUEUE_TABLE = 'accounting';
const PUSH_INTERVAL_MS = 5000;
const PULL_INTERVAL_MS = 30000;
const pulledKey = (businessId: string): string => `zakhira_accounting_pulled_${businessId}`;

const nowIso = (): string => new Date().toISOString();
const uuid = (): string => crypto.randomUUID();

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

/** Tiny mutex: local writes (row + queue entry) and "apply remote changes" never interleave. */
let lockChain: Promise<unknown> = Promise.resolve();
const withLock = <T,>(fn: () => Promise<T>): Promise<T> => {
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
  console.error('[AccountingSync]', key, err);
  window.dispatchEvent(
    new CustomEvent(ACCOUNTING_SYNC_ERROR_EVENT, {
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

/** Canonical form (sorted keys) used ONLY to compare local vs remote rows. */
const canon = (v: any): any => {
  if (Array.isArray(v)) return v.map(canon);
  if (v && typeof v === 'object') {
    const o: Record<string, any> = {};
    for (const k of Object.keys(v).sort()) o[k] = canon(v[k]);
    return o;
  }
  return v;
};
const fingerprint = (d: unknown): string => JSON.stringify(canon(d));

// ============================================================
// MAPPERS
// ============================================================
const mapRow = (
  row: any,
  idToNo: Map<string, string>,
  returnNoByTxnId: Map<string, string>
): AccountingTransaction => ({
  id: row.id,
  transactionNo: row.transaction_no,
  date: row.txn_date,
  customerName: row.customer_name || '',
  companyName: row.company_name || '',
  invoiceRef: row.invoice_ref || '—',
  invoiceFile: row.invoice_file || undefined,
  invoiceFileName: row.invoice_file_name || undefined,
  type: row.type,
  amount: Number(row.amount),
  status: row.status,
  mode: row.mode,
  linkedInvoiceId: row.sales_document_id || undefined,
  sourceDocumentId: row.sales_document_id || undefined,
  sourceModule: row.source_module,
  notes: row.notes || undefined,
  createdAt: row.created_at,
  hasReturn: !!row.has_return,
  originalTransactionId: row.original_transaction_id
    ? idToNo.get(row.original_transaction_id) || undefined
    : undefined,
  returnNumber: returnNoByTxnId.get(row.id) || row._return_number || undefined,
});

const mapAll = (rows: TxnRow[]): AccountingTransaction[] => {
  const idToNo = new Map<string, string>(rows.map((r) => [r.id, r.transaction_no]));
  const empty = new Map<string, string>();
  return rows.map((r) => mapRow(r, idToNo, empty));
};

// ============================================================
// LOCAL DB
// ============================================================
let tableReady: Promise<void> | null = null;

/** Idempotent. Safe to call on every operation. */
const ensureTable = (): Promise<void> => {
  if (!tableReady) {
    tableReady = (async () => {
      await api().dbRun(
        `CREATE TABLE IF NOT EXISTS accounting_txns_local (
           id          TEXT PRIMARY KEY,
           business_id TEXT NOT NULL,
           txn_date    TEXT NOT NULL,
           created_at  TEXT NOT NULL,
           data        TEXT NOT NULL
         )`
      );
      await api().dbRun(
        `CREATE INDEX IF NOT EXISTS idx_accounting_txns_local_business
           ON accounting_txns_local (business_id, txn_date DESC, created_at DESC)`
      );
    })().catch((err) => {
      tableReady = null; // allow retry
      throw err;
    });
  }
  return tableReady;
};

const parseRow = (r: { data: string }): TxnRow => JSON.parse(r.data) as TxnRow;

const readLocal = async (businessId: string): Promise<TxnRow[]> => {
  const rows = await api().dbQuery<{ data: string }>(
    `SELECT data FROM accounting_txns_local
      WHERE business_id = ? ORDER BY txn_date DESC, created_at DESC`,
    [businessId]
  );
  return rows.map(parseRow);
};

const readLocalOne = async (id: string): Promise<TxnRow | null> => {
  const rows = await api().dbQuery<{ data: string }>(
    `SELECT data FROM accounting_txns_local WHERE id = ?`,
    [id]
  );
  return rows[0] ? parseRow(rows[0]) : null;
};

const upsertIntoLocalDb = async (businessId: string, row: TxnRow): Promise<void> => {
  await api().dbRun(
    `INSERT INTO accounting_txns_local (id, business_id, txn_date, created_at, data)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       business_id = excluded.business_id,
       txn_date = excluded.txn_date,
       created_at = excluded.created_at,
       data = excluded.data`,
    [row.id, businessId, row.txn_date, row.created_at, JSON.stringify(row)]
  );
};

/** In-memory snapshot so the page can render instantly on re-mount */
let cache: AccountingTransaction[] | null = null;

/** Provisional "TXN-YYYY-0001" (the real number is assigned by the server when pushed). */
const nextLocalTransactionNo = (rows: TxnRow[]): string => {
  const prefix = `TXN-${new Date().getFullYear()}-`;
  let last = 0;
  for (const r of rows) {
    const no = String(r.transaction_no || '');
    if (no.startsWith(prefix)) {
      const n = Number(no.split('-')[2]);
      if (Number.isFinite(n)) last = Math.max(last, n);
    }
  }
  return `${prefix}${String(last + 1).padStart(4, '0')}`;
};

// ============================================================
// QUEUED OPERATIONS
// ============================================================
type CreateOp = {
  kind: 'create';
  id: string;
  originalId: string | null;
  fields: Record<string, any>; // every column except id / business_id / transaction_no / created_at
};

type DeleteOp = {
  kind: 'delete';
  id: string;
  originalId: string | null;
};

type SyncOp = CreateOp | DeleteOp;

// next "TXN-YYYY-0001" for this business (computed on the SERVER when pushing)
async function nextTransactionNo(businessId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `TXN-${year}-`;
  const { data, error } = await supabase
    .from('accounting_transactions')
    .select('transaction_no')
    .eq('business_id', businessId)
    .like('transaction_no', `${prefix}%`)
    .order('transaction_no', { ascending: false })
    .limit(1);
  if (error) throw error;
  const last = data && data[0] ? Number(String(data[0].transaction_no).split('-')[2]) : 0;
  const n = Number.isFinite(last) ? last : 0;
  return `${prefix}${String(n + 1).padStart(4, '0')}`;
}

const execCreate = async (businessId: string, op: CreateOp): Promise<void> => {
  // idempotent: if the row already reached the server, don't insert again
  const { data: existing, error: exErr } = await supabase
    .from('accounting_transactions')
    .select('id')
    .eq('id', op.id)
    .maybeSingle();
  if (exErr) throw exErr;

  if (!existing) {
    let done = false;
    for (let attempt = 0; attempt < 5; attempt++) {
      const transaction_no = await nextTransactionNo(businessId);
      const { error } = await supabase.from('accounting_transactions').insert([
        {
          id: op.id,
          business_id: businessId,
          transaction_no,
          ...op.fields,
        },
      ]);
      if (!error) {
        done = true;
        break;
      }
      // duplicate transaction_no (race) -> retry with the next number
      if ((error as any).code === '23505' && attempt < 4) continue;
      throw error;
    }
    if (!done) throw new Error('Could not allocate a transaction number');
  }

  if (op.fields.type === 'Return' && op.originalId) {
    const { error } = await supabase
      .from('accounting_transactions')
      .update({ has_return: true })
      .eq('id', op.originalId);
    if (error) throw error;
  }
};

const execDelete = async (op: DeleteOp): Promise<void> => {
  const { data: row, error: rErr } = await supabase
    .from('accounting_transactions')
    .select('id, original_transaction_id')
    .eq('id', op.id)
    .maybeSingle();
  if (rErr) throw rErr;

  const originalId = row?.original_transaction_id ?? op.originalId;

  const { error } = await supabase.from('accounting_transactions').delete().eq('id', op.id);
  if (error) throw error;

  if (originalId) {
    const { count, error: cErr } = await supabase
      .from('accounting_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('original_transaction_id', originalId);
    if (cErr) throw cErr;
    if (!count) {
      const { error: uErr } = await supabase
        .from('accounting_transactions')
        .update({ has_return: false })
        .eq('id', originalId);
      if (uErr) throw uErr;
    }
  }
};

const executeOp = async (businessId: string, op: SyncOp): Promise<void> => {
  switch (op.kind) {
    case 'create':
      return execCreate(businessId, op);
    case 'delete':
      return execDelete(op);
    default:
      return; // unknown kind → ignore (removed from the queue)
  }
};

// ============================================================
// SYNC — PUSH (local queue → Supabase)
// ============================================================
type QueueRow = { id: number; action: SyncAction; payload: string };

/**
 * Sends queued operations to Supabase.
 *  - Operations on ONE transaction are replayed in the order they happened.
 *  - Offline  → throws a network error (whole cycle stops, retried later).
 *  - Real error for one transaction → reported, it stays queued, but OTHER
 *    transactions still sync (no stuck queue).
 */
const pushQueue = async (): Promise<boolean> => {
  const rows = await api().dbQuery<QueueRow>(
    `SELECT id, action, payload FROM sync_queue
      WHERE table_name = '${QUEUE_TABLE}' ORDER BY id ASC`
  );

  if (rows.length === 0) {
    reportedErrors.clear();
    return false;
  }

  const groups = new Map<string, Array<{ qid: number; op: SyncOp }>>();

  for (const r of rows) {
    let op: SyncOp;
    try {
      op = JSON.parse(r.payload) as SyncOp;
    } catch {
      await api().dbRun('DELETE FROM sync_queue WHERE id = ?', [r.id]); // corrupt entry
      continue;
    }
    const tid = op?.id ? String(op.id) : '';
    if (!tid) {
      await api().dbRun('DELETE FROM sync_queue WHERE id = ?', [r.id]);
      continue;
    }
    const g = groups.get(tid);
    if (g) g.push({ qid: r.id, op });
    else groups.set(tid, [{ qid: r.id, op }]);
  }

  if (groups.size === 0) return false;

  const businessId = await getBusinessId();
  let pushedAny = false;

  for (const [tid, entries] of groups) {
    for (const entry of entries) {
      try {
        await executeOp(businessId, entry.op);
        await api().dbRun('DELETE FROM sync_queue WHERE id = ?', [entry.qid]);
        pushedAny = true;
      } catch (err) {
        if (isNetworkError(err)) throw err; // offline → stop, retry later
        reportSyncError(`push ${entry.op.kind} ${tid}`, err); // real error → show it
        break; // keep this transaction's remaining operations queued (order matters)
      }
    }
  }

  return pushedAny;
};

// ============================================================
// SYNC — PULL (Supabase → local SQLite)
// ============================================================
/** Reads ALL transactions (paged past 1000 rows) + return numbers from Supabase. */
const fetchRemote = async (businessId: string): Promise<TxnRow[]> => {
  const rows: any[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('accounting_transactions')
      .select('*')
      .eq('business_id', businessId)
      .order('txn_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < PAGE) break;
  }

  // return numbers (sales_returns.linked_transaction_id -> return_number)
  const { data: rets, error: rErr } = await supabase
    .from('sales_returns')
    .select('return_number, linked_transaction_id')
    .eq('business_id', businessId);
  if (rErr) throw rErr; // never treat a failed query as "empty"
  const returnNoByTxnId = new Map<string, string>(
    (rets || [])
      .filter((r: any) => r.linked_transaction_id)
      .map((r: any) => [r.linked_transaction_id as string, r.return_number as string])
  );

  return rows.map((r) => ({ ...r, _return_number: returnNoByTxnId.get(r.id) || null })) as TxnRow[];
};

let pullRequested = false;

/**
 * Downloads the remote list and applies it locally, EXCEPT for transactions
 * that still have unsent local changes (those win until they are pushed).
 * Also removes local rows that were deleted on another device.
 */
const pullRemote = async (): Promise<void> => {
  const businessId = await getBusinessId();
  const remote = await fetchRemote(businessId);
  const firstPull = !localStorage.getItem(pulledKey(businessId));

  const changed = await withLock(async () => {
    // Unsent local changes (checked INSIDE the lock → consistent).
    // A pending Return also protects its ORIGINAL row (has_return flag).
    const queued = await api().dbQuery<{ payload: string }>(
      `SELECT payload FROM sync_queue WHERE table_name = '${QUEUE_TABLE}'`
    );
    const pending = new Set<string>();
    for (const q of queued) {
      try {
        const p = JSON.parse(q.payload) as { id?: string; originalId?: string | null };
        if (p?.id) pending.add(String(p.id));
        if (p?.originalId) pending.add(String(p.originalId));
      } catch {
        /* ignore corrupt entry */
      }
    }

    const local = await readLocal(businessId);
    const localPrint = new Map(local.map((r) => [r.id, fingerprint(r)]));
    const remoteIds = new Set<string>();
    let didChange = false;

    for (const row of remote) {
      remoteIds.add(row.id);
      if (pending.has(row.id)) continue;
      if (localPrint.get(row.id) !== fingerprint(row)) {
        await upsertIntoLocalDb(businessId, row);
        didChange = true;
      }
    }

    for (const l of local) {
      if (!remoteIds.has(l.id) && !pending.has(l.id)) {
        await api().dbRun('DELETE FROM accounting_txns_local WHERE id = ?', [l.id]);
        didChange = true;
      }
    }

    if (didChange) cache = mapAll(await readLocal(businessId));
    return didChange;
  });

  localStorage.setItem(pulledKey(businessId), '1');
  if (changed || firstPull) window.dispatchEvent(new Event(ACCOUNTING_SYNCED_EVENT));
};

// ============================================================
// SYNC — ORCHESTRATION
// ============================================================
let syncing = false;
let rerun = false;
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

const enqueue = (op: SyncOp): Promise<unknown> =>
  api().addToSyncQueue(QUEUE_TABLE, 'UPDATE', { ...op } as Record<string, unknown>);

// ============================================================
// SERVICE
// ============================================================
export const accountingService = {
  /** Synchronous snapshot of the last loaded list (or null on first launch). */
  getCached(): AccountingTransaction[] | null {
    return cache;
  },

  /** True until the very first download from Supabase finished (fresh install / new business). */
  isFirstSyncPending(): boolean {
    const id = localStorage.getItem(BUSINESS_ID_KEY);
    if (!id) return true;
    return !localStorage.getItem(pulledKey(id));
  },

  /** Starts background sync (idempotent). Safe to call from the page or App.tsx. */
  startSyncWorker(): void {
    if (syncTimer) return;
    syncTimer = setInterval(() => void syncNow(), PUSH_INTERVAL_MS);
    window.addEventListener('online', () => void syncNow(true));
    window.addEventListener('focus', () => void syncNow(true));
    // Sales (records) pushed payments / returns / rejections → accounting rows changed on the
    // server → download them right away
    window.addEventListener('zakhira:sales-updated', () => void syncNow(true));
    void syncNow(true);
  },

  /** Manual trigger (e.g. a "Sync now" button). */
  syncNow(): Promise<void> {
    return syncNow(true);
  },

  // ----------------------------------------------------------
  // All transactions — ALWAYS local SQLite only (instant, works offline)
  // ----------------------------------------------------------
  async getTransactions(): Promise<AccountingTransaction[]> {
    await ensureTable();
    const businessId = await getBusinessId();
    const list = mapAll(await readLocal(businessId));
    cache = list;
    return list;
  },

  // ----------------------------------------------------------
  // Create a manual entry (In / Out / Return) — SQLite first, then queued
  // ----------------------------------------------------------
  async createTransaction(input: NewTransactionInput): Promise<AccountingTransaction> {
    await ensureTable();
    const businessId = await getBusinessId();
    const isReturn = input.type === 'Return';

    if (isReturn && !input.originalTransactionDbId) {
      throw new Error('Return needs a linked original transaction');
    }

    const id = uuid();
    const now = nowIso();

    const fields: Record<string, any> = {
      txn_date: input.date,
      customer_name: input.customerName,
      company_name: input.companyName || null,
      invoice_ref: input.invoiceRef && input.invoiceRef !== '—' ? input.invoiceRef : null,
      type: input.type,
      amount: input.amount,
      status: isReturn ? 'Returned' : input.status,
      mode: input.mode,
      source_module: 'manual',
      sales_document_id: isReturn ? input.salesDocumentId || null : null,
      original_transaction_id: isReturn ? input.originalTransactionDbId || null : null,
      invoice_file: input.invoiceFile || null,
      invoice_file_name: input.invoiceFileName || null,
      notes: input.notes || null,
    };

    const result = await withLock(async () => {
      const all = await readLocal(businessId);

      const row: TxnRow = {
        id,
        business_id: businessId,
        transaction_no: nextLocalTransactionNo(all), // provisional — server assigns the real one
        ...(fields as any),
        has_return: false,
        created_at: now,
        _return_number: null,
      };

      // 1) local write (+ flag the original locally)
      await upsertIntoLocalDb(businessId, row);
      if (isReturn && input.originalTransactionDbId) {
        const original = await readLocalOne(input.originalTransactionDbId);
        if (original) {
          await upsertIntoLocalDb(businessId, { ...original, has_return: true });
        }
      }

      // 2) queue (replayed on Supabase when online)
      await enqueue({
        kind: 'create',
        id,
        originalId: isReturn ? input.originalTransactionDbId || null : null,
        fields,
      });

      const after = await readLocal(businessId);
      cache = mapAll(after);
      const idToNo = new Map<string, string>(after.map((r) => [r.id, r.transaction_no]));
      return mapRow(row, idToNo, new Map());
    });

    void syncNow();
    return result;
  },

  // ----------------------------------------------------------
  // Delete an entry (and clear has_return on the original if needed)
  // ----------------------------------------------------------
  async deleteTransaction(id: string): Promise<void> {
    await ensureTable();
    const businessId = await getBusinessId();

    await withLock(async () => {
      const row = await readLocalOne(id);
      const originalId = row?.original_transaction_id ?? null;

      await api().dbRun('DELETE FROM accounting_txns_local WHERE id = ?', [id]);

      if (originalId) {
        const rest = await readLocal(businessId);
        const stillHasReturn = rest.some((r) => r.original_transaction_id === originalId);
        if (!stillHasReturn) {
          const original = rest.find((r) => r.id === originalId);
          if (original) {
            await upsertIntoLocalDb(businessId, { ...original, has_return: false });
          }
        }
      }

      await enqueue({ kind: 'delete', id, originalId });
      cache = mapAll(await readLocal(businessId));
    });

    void syncNow();
  },

  // ----------------------------------------------------------
  // The real sales document behind a transaction (by id, else by order number)
  // Local first (records_documents, written by recordsService) → Supabase only if missing
  // ----------------------------------------------------------
  async getRealInvoice(id?: string, orderNumber?: string): Promise<RealInvoice | null> {
    const businessId = await getBusinessId();

    // 1) LOCAL
    try {
      const rows = await api().dbQuery<{ data: string }>(
        `SELECT data FROM records_documents WHERE business_id = ?`,
        [businessId]
      );
      let doc: any = null;
      if (id && UUID_RE.test(id)) {
        for (const r of rows) {
          const d = JSON.parse(r.data);
          if (d.id === id) {
            doc = d;
            break;
          }
        }
      }
      if (!doc && orderNumber && orderNumber !== '—') {
        for (const r of rows) {
          const d = JSON.parse(r.data);
          if (d.order_number === orderNumber) {
            doc = d;
            break;
          }
        }
      }
      if (doc) return toRealInvoice(doc, (doc.lines || []) as any[], doc.created_by_name || '');
    } catch {
      /* local table not created yet → fall through to remote */
    }

    // 2) REMOTE fallback (only when online)
    if (typeof navigator !== 'undefined' && !navigator.onLine) return null;
    try {
      let doc: any = null;
      if (id && UUID_RE.test(id)) {
        const { data } = await supabase
          .from('sales_documents')
          .select('*')
          .eq('id', id)
          .eq('business_id', businessId)
          .maybeSingle();
        doc = data;
      }
      if (!doc && orderNumber && orderNumber !== '—') {
        const { data } = await supabase
          .from('sales_documents')
          .select('*')
          .eq('business_id', businessId)
          .eq('order_number', orderNumber)
          .maybeSingle();
        doc = data;
      }
      if (!doc) return null;

      const [{ data: lines }, { data: profile }] = await Promise.all([
        supabase.from('sales_document_lines').select('*').eq('document_id', doc.id),
        supabase.from('profiles').select('name, email').eq('id', doc.created_by).maybeSingle(),
      ]);

      return toRealInvoice(doc, lines || [], profile?.name || profile?.email || '');
    } catch {
      return null;
    }
  },
};

/** sales_documents row (+ lines, + creator name) → RealInvoice */
function toRealInvoice(doc: any, lines: any[], createdBy: string): RealInvoice {
  return {
    id: doc.id,
    orderNumber: doc.order_number,
    status: doc.status,
    issueDate: doc.issue_date,
    createdAt: doc.created_at,
    notes: doc.notes || '',
    vatRate: Number(doc.vat_rate) || 0,
    subtotal: Number(doc.subtotal) || 0,
    discountTotal: Number(doc.discount_total) || 0,
    taxTotal: Number(doc.tax_total) || 0,
    grandTotal: Number(doc.grand_total) || 0,
    createdBy,
    customerSnapshot: {
      name: doc.customer_name || '',
      company: doc.customer_company || '',
      phone: doc.customer_phone || doc.customer_phone_alt || '',
      address: doc.customer_address || '',
      city: doc.customer_city || '',
    },
    lines: (lines || []).map((l: any) => ({
      id: l.id,
      material: l.material,
      quantity: Number(l.quantity),
      unitPrice: Number(l.unit_price),
      lineTotal: Number(l.line_total),
    })),
  };
}