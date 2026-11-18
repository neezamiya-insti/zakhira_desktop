/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCurrentBusinessId, supabase } from '../lib/supabaseClient';
import { customerService } from './customerService';
import { productService } from './productService';

// ============================================================
// TYPES (public shape is unchanged → other files keep working)
// ============================================================
export type DocumentLineInput = {
  productId: string;
  material: string;
  sku: string;
  category?: string;
  costPrice: number;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountValue: number;
  lineTotal: number;
};

export type SalesDocumentInput = {
  documentType: 'invoice' | 'quotation';
  orderNumber: string;
  customerId: string | null;
  customerName: string;
  customerCompany?: string;
  customerPhone?: string;
  customerPhoneAlt?: string;
  customerEmail?: string;
  customerAddress?: string;
  customerCity?: string;
  issueDate: string;
  dueDate?: string;
  salesChannel: 'Online' | 'Offline';
  status: 'Pending' | 'Approved' | 'Rejected';
  currency: string;
  notes?: string;
  vatNumber?: string;
  vatRate: number;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  paymentStatus: 'Unpaid' | 'Partially Paid' | 'Paid';
  paymentMethod?: string | null;
  paymentReference?: string;
  paymentAmount: number;
  balanceDue: number;
  lines: DocumentLineInput[];
};

/** Row shape — identical in SQLite and Supabase (snake_case) */
export type SalesDocumentRow = {
  id: string;
  business_id: string;
  document_type: 'invoice' | 'quotation';
  order_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_company: string | null;
  customer_phone: string | null;
  customer_phone_alt: string | null;
  customer_email: string | null;
  customer_address: string | null;
  customer_city: string | null;
  issue_date: string;
  due_date: string | null;
  sales_channel: 'Online' | 'Offline';
  status: 'Pending' | 'Approved' | 'Rejected';
  currency: string;
  notes: string | null;
  vat_number: string | null;
  vat_rate: number;
  subtotal: number;
  discount_total: number;
  tax_total: number;
  grand_total: number;
  payment_status: 'Unpaid' | 'Partially Paid' | 'Paid';
  payment_method: string | null;
  payment_amount: number;
  payment_date: string | null;
  payment_reference: string | null;
  balance_due: number;
  created_by: string;
  created_at: string;
  updated_at: string | null;
};

type Row = Record<string, any>;
type SyncAction = 'INSERT' | 'UPDATE' | 'DELETE';

/** Everything that belongs to ONE document, pushed together (all ids are client UUIDs → retry-safe) */
type Bundle = {
  document: Row;
  lines: Row[];
  payments: Row[];
  accounting: Row | null;
  stock_movements: Row[];
};

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
// EVENTS (pages listen to these)
// ============================================================
/** Background sync CHANGED local data → page should re-read SQLite */
export const SALES_SYNCED_EVENT = 'zakhira:sales-synced';
/** Pushing/pulling failed for a reason other than "offline" */
export const SALES_SYNC_ERROR_EVENT = 'zakhira:sales-sync-error';

// ============================================================
// CONSTANTS + SMALL UTILITIES
// ============================================================
const QUEUE_TABLE = 'sales_documents';
const BUSINESS_ID_KEY = 'zakhira_business_id';
const CURSOR_KEY = 'zakhira_sales_pull_cursor';
const PUSH_INTERVAL_MS = 5000;
const PULL_INTERVAL_MS = 20000;
const RECONCILE_MS = 120000; // check for remotely-deleted documents every 2 min
const PAGE = 1000;
const CHUNK = 50;

const DOC_COLS = [
  'id',
  'business_id',
  'document_type',
  'order_number',
  'customer_id',
  'customer_name',
  'customer_company',
  'customer_phone',
  'customer_phone_alt',
  'customer_email',
  'customer_address',
  'customer_city',
  'issue_date',
  'due_date',
  'sales_channel',
  'status',
  'currency',
  'notes',
  'vat_number',
  'vat_rate',
  'subtotal',
  'discount_total',
  'tax_total',
  'grand_total',
  'payment_status',
  'payment_method',
  'payment_amount',
  'payment_date',
  'payment_reference',
  'balance_due',
  'created_by',
  'created_at',
  'updated_at',
] as const;
const DOC_NUM = new Set([
  'vat_rate',
  'subtotal',
  'discount_total',
  'tax_total',
  'grand_total',
  'payment_amount',
  'balance_due',
]);

const LINE_COLS = [
  'id',
  'document_id',
  'product_id',
  'material',
  'sku',
  'category',
  'description',
  'cost_price',
  'quantity',
  'unit_price',
  'discount_type',
  'discount_value',
  'line_total',
] as const;
const LINE_NUM = new Set([
  'cost_price',
  'quantity',
  'unit_price',
  'discount_value',
  'line_total',
]);

const PAY_COLS = [
  'id',
  'document_id',
  'payment_date',
  'amount',
  'method',
  'note',
  'balance_after',
  'recorded_by',
  'created_at',
] as const;
const PAY_NUM = new Set(['amount', 'balance_after']);

const pick = (
  r: any,
  cols: readonly string[],
  nums: Set<string>
): Record<string, any> => {
  const o: Record<string, any> = {};
  for (const c of cols) {
    const v = r?.[c];
    o[c] = nums.has(c) ? Number(v) || 0 : v ?? null;
  }
  return o;
};

const normalizeDoc = (r: any): SalesDocumentRow => {
  const o = pick(r, DOC_COLS, DOC_NUM);
  o.id = String(o.id);
  o.sales_channel = o.sales_channel === 'Online' ? 'Online' : 'Offline';
  o.updated_at = o.updated_at ?? o.created_at;
  return o as SalesDocumentRow;
};
const normalizeLine = (r: any): Row => pick(r, LINE_COLS, LINE_NUM);
const normalizePayment = (r: any): Row => pick(r, PAY_COLS, PAY_NUM);

/** Offline-safe business id (network only the very first time) */
const getBusinessId = async (): Promise<string> => {
  const cached = localStorage.getItem(BUSINESS_ID_KEY);
  if (cached) return cached;
  const id = (await getCurrentBusinessId()) as string;
  localStorage.setItem(BUSINESS_ID_KEY, id);
  return id;
};

const getUser = (): { id: string } => {
  const raw = localStorage.getItem('zakhira_user');
  if (!raw) throw new Error('User not logged in');
  return JSON.parse(raw) as { id: string };
};

/** Tiny mutex: local writes (rows + queue entry) and "apply remote changes" never interleave. */
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

const isUniqueViolation = (err: unknown, word: string): boolean => {
  if ((err as { code?: string })?.code !== '23505') return false;
  const e = err as { message?: string; details?: string };
  return `${e.message ?? ''} ${e.details ?? ''}`.toLowerCase().includes(word);
};

/** Reports a REAL sync error once (console + event → page shows it). */
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
  console.error('[SalesSync]', key, err);
  window.dispatchEvent(
    new CustomEvent(SALES_SYNC_ERROR_EVENT, {
      detail: {
        message,
        details:
          [e?.details, e?.hint ? `Hint: ${e.hint}` : '']
            .filter(Boolean)
            .join('\n') || undefined,
        code: e?.code,
      },
    })
  );
};

// ============================================================
// LOCAL DB
// ============================================================
let tableReady: Promise<void> | null = null;

const ensureTables = (): Promise<void> => {
  if (!tableReady) {
    tableReady = (async () => {
      const db = api();
      await db.dbRun(
        `CREATE TABLE IF NOT EXISTS sales_documents (
           id                 TEXT PRIMARY KEY,
           business_id        TEXT NOT NULL,
           document_type      TEXT NOT NULL,
           order_number       TEXT NOT NULL,
           customer_id        TEXT,
           customer_name      TEXT NOT NULL,
           customer_company   TEXT,
           customer_phone     TEXT,
           customer_phone_alt TEXT,
           customer_email     TEXT,
           customer_address   TEXT,
           customer_city      TEXT,
           issue_date         TEXT NOT NULL,
           due_date           TEXT,
           sales_channel      TEXT,
           status             TEXT,
           currency           TEXT,
           notes              TEXT,
           vat_number         TEXT,
           vat_rate           REAL,
           subtotal           REAL,
           discount_total     REAL,
           tax_total          REAL,
           grand_total        REAL,
           payment_status     TEXT,
           payment_method     TEXT,
           payment_amount     REAL,
           payment_date       TEXT,
           payment_reference  TEXT,
           balance_due        REAL,
           created_by         TEXT,
           created_at         TEXT NOT NULL,
           updated_at         TEXT
         )`
      );
      await db.dbRun(
        `CREATE INDEX IF NOT EXISTS idx_sales_documents_business
           ON sales_documents (business_id, created_at DESC)`
      );
      await db.dbRun(
        `CREATE INDEX IF NOT EXISTS idx_sales_documents_order
           ON sales_documents (business_id, order_number)`
      );
      await db.dbRun(
        `CREATE TABLE IF NOT EXISTS sales_document_lines (
           id             TEXT PRIMARY KEY,
           document_id    TEXT NOT NULL,
           product_id     TEXT,
           material       TEXT,
           sku            TEXT,
           category       TEXT,
           description    TEXT,
           cost_price     REAL,
           quantity       REAL,
           unit_price     REAL,
           discount_type  TEXT,
           discount_value REAL,
           line_total     REAL
         )`
      );
      await db.dbRun(
        `CREATE INDEX IF NOT EXISTS idx_sales_lines_document
           ON sales_document_lines (document_id)`
      );
      await db.dbRun(
        `CREATE TABLE IF NOT EXISTS sales_payments (
           id            TEXT PRIMARY KEY,
           document_id   TEXT NOT NULL,
           payment_date  TEXT,
           amount        REAL,
           method        TEXT,
           note          TEXT,
           balance_after REAL,
           recorded_by   TEXT,
           created_at    TEXT
         )`
      );
      await db.dbRun(
        `CREATE INDEX IF NOT EXISTS idx_sales_payments_document
           ON sales_payments (document_id)`
      );
    })().catch((err) => {
      tableReady = null; // allow retry
      throw err;
    });
  }
  return tableReady;
};

const upsertLocal = async (
  table: string,
  cols: readonly string[],
  row: Row
): Promise<void> => {
  const placeholders = cols.map(() => '?').join(',');
  const updates = cols
    .filter((c) => c !== 'id')
    .map((c) => `${c} = excluded.${c}`)
    .join(',');
  await api().dbRun(
    `INSERT INTO ${table} (${cols.join(',')}) VALUES (${placeholders})
     ON CONFLICT(id) DO UPDATE SET ${updates}`,
    cols.map((c) => row[c] ?? null)
  );
};

const upsertDocLocal = (d: Row) => upsertLocal('sales_documents', DOC_COLS, d);

const replaceLines = async (docId: string, lines: Row[]): Promise<void> => {
  await api().dbRun(`DELETE FROM sales_document_lines WHERE document_id = ?`, [
    docId,
  ]);
  for (const l of lines) await upsertLocal('sales_document_lines', LINE_COLS, l);
};

const replacePayments = async (docId: string, pays: Row[]): Promise<void> => {
  await api().dbRun(`DELETE FROM sales_payments WHERE document_id = ?`, [docId]);
  for (const p of pays) await upsertLocal('sales_payments', PAY_COLS, p);
};

const readDocs = async (
  businessId: string,
  type?: 'invoice' | 'quotation'
): Promise<SalesDocumentRow[]> => {
  const rows = type
    ? await api().dbQuery<Row>(
        `SELECT * FROM sales_documents
          WHERE business_id = ? AND document_type = ?
          ORDER BY created_at DESC`,
        [businessId, type]
      )
    : await api().dbQuery<Row>(
        `SELECT * FROM sales_documents WHERE business_id = ?
          ORDER BY created_at DESC`,
        [businessId]
      );
  return rows.map(normalizeDoc);
};

/** ids that still have unsent local changes in the sync queue */
const pendingIds = async (onlyInserts = false): Promise<Set<string>> => {
  const queued = await api().dbQuery<{ payload: string }>(
    `SELECT payload FROM sync_queue WHERE table_name = ?${
      onlyInserts ? ` AND action = 'INSERT'` : ''
    }`,
    [QUEUE_TABLE]
  );
  const set = new Set<string>();
  for (const q of queued) {
    try {
      const p = JSON.parse(q.payload) as { id?: string; document?: { id?: string } };
      const id = p?.document?.id ?? p?.id;
      if (id) set.add(String(id));
    } catch {
      /* ignore corrupt entry */
    }
  }
  return set;
};

/** Queue ids of OTHER tables (customers / products) that are not on the server yet */
const pendingInsertsOf = async (table: string): Promise<Set<string>> => {
  const queued = await api().dbQuery<{ payload: string }>(
    `SELECT payload FROM sync_queue WHERE table_name = ? AND action = 'INSERT'`,
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

/** In-memory snapshot so the page can render instantly on re-mount */
let docCache: SalesDocumentRow[] | null = null;

// ============================================================
// SYNC — PUSH (local queue → Supabase)
// ============================================================
type QueueRow = { id: number; action: SyncAction; payload: string };
type Group = {
  cid: string;
  ids: number[];
  action: SyncAction;
  payload: Record<string, any>;
};

let pullRequested = false;
let pushTouchedLocal = false;

/** Next free number for the same prefix (e.g. INV-2026-) looking at server AND local data. */
const nextFreeOrderNumber = async (
  businessId: string,
  sample: string
): Promise<string> => {
  const m = sample.match(/^(.+-)(\d+)$/);
  const prefix = m ? m[1] : `${sample}-`;
  const numOf = (s: string): number => {
    const mm = String(s).match(/-(\d+)$/);
    return mm ? parseInt(mm[1], 10) : 0;
  };

  const { data, error } = await supabase
    .from('sales_documents')
    .select('order_number')
    .eq('business_id', businessId)
    .like('order_number', `${prefix}%`);
  if (error) throw error;

  const local = await api().dbQuery<{ order_number: string }>(
    `SELECT order_number FROM sales_documents
      WHERE business_id = ? AND order_number LIKE ?`,
    [businessId, `${prefix}%`]
  );

  const all = [
    ...((data ?? []) as { order_number: string }[]).map((r) => r.order_number),
    ...local.map((r) => r.order_number),
  ];
  const max = all.reduce((mx, s) => Math.max(mx, numOf(s)), 0);
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
};

/** Another device already used this order number → renumber locally + in the queue */
const renumberLocal = async (
  g: Group,
  oldNo: string,
  newNo: string
): Promise<void> => {
  const p = g.payload as Bundle;
  p.document.order_number = newNo;
  if (p.accounting && p.accounting.invoice_ref === oldNo) {
    p.accounting.invoice_ref = newNo;
  }
  for (const mv of p.stock_movements ?? []) {
    if (mv.reference === oldNo) mv.reference = newNo;
  }
  const json = JSON.stringify(p);
  await withLock(async () => {
    await api().dbRun(`UPDATE sales_documents SET order_number = ? WHERE id = ?`, [
      newNo,
      g.cid,
    ]);
    for (const id of g.ids) {
      await api().dbRun(`UPDATE sync_queue SET payload = ? WHERE id = ?`, [
        json,
        id,
      ]);
    }
  });
  docCache = null;
  pushTouchedLocal = true;
};

const upsertRemote = async (table: string, rows: Row[]): Promise<void> => {
  if (rows.length === 0) return;
  const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
  if (error) throw error;
};

/** Pushes ONE document bundle. Every step is an upsert by client UUID → safe to retry. */
const pushDocument = async (g: Group): Promise<void> => {
  if (g.action === 'DELETE') {
    const { error } = await supabase.from('sales_documents').delete().eq('id', g.cid);
    if (error) throw error;
    return;
  }

  const p = g.payload as Bundle;
  // updated_at is left to the server, so other devices' "changed since" cursor never misses it
  const doc: Row = { ...p.document };
  delete doc.updated_at;

  let { error } = await supabase
    .from('sales_documents')
    .upsert(doc, { onConflict: 'id' });

  if (error && isUniqueViolation(error, 'order_number')) {
    const oldNo = String(doc.order_number);
    const newNo = await nextFreeOrderNumber(String(doc.business_id), oldNo);
    doc.order_number = newNo;
    ({ error } = await supabase
      .from('sales_documents')
      .upsert(doc, { onConflict: 'id' }));
    if (!error) await renumberLocal(g, oldNo, newNo);
  }
  if (error) throw error;

  await upsertRemote('sales_document_lines', p.lines ?? []);
  await upsertRemote('sales_payments', p.payments ?? []);
  if (p.accounting) await upsertRemote('accounting_transactions', [p.accounting]);
  await upsertRemote('stock_movements', p.stock_movements ?? []);
};

/**
 * Sends queued documents to Supabase.
 *  - Grouped per document; last action wins.
 *  - A document waits until its customer / products exist on the server (FK safety).
 *  - Offline → throws network error (cycle stops, retried later).
 *  - Real error for one document → reported, it stays queued, OTHERS continue.
 */
const pushQueue = async (): Promise<void> => {
  const rows = await api().dbQuery<QueueRow>(
    `SELECT id, action, payload FROM sync_queue
      WHERE table_name = ? ORDER BY id ASC`,
    [QUEUE_TABLE]
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
      await api().dbRun(`DELETE FROM sync_queue WHERE id = ?`, [r.id]); // corrupt
      continue;
    }
    const cid = String(payload?.document?.id ?? payload?.id ?? '');
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
      groups.set(cid, { cid, ids: [r.id], action: r.action, payload });
    }
  }

  const pendingCustomers = await pendingInsertsOf('customers');
  const pendingProducts = await pendingInsertsOf('products');
  let waitingCustomers = false;
  let waitingProducts = false;

  for (const g of groups.values()) {
    try {
      if (g.action !== 'DELETE') {
        const p = g.payload as Bundle;
        const cust = p.document?.customer_id as string | null;
        if (cust && pendingCustomers.has(cust)) {
          waitingCustomers = true;
          continue; // customer not on the server yet → try again next cycle
        }
        if ((p.lines ?? []).some((l) => pendingProducts.has(String(l.product_id)))) {
          waitingProducts = true;
          continue;
        }
      }

      await pushDocument(g);
      await api().dbRun(
        `DELETE FROM sync_queue WHERE id IN (${g.ids.map(() => '?').join(',')})`,
        g.ids
      );
    } catch (err) {
      if (isNetworkError(err)) throw err; // offline → stop, retry later
      reportSyncError(`push ${g.action} ${g.cid}`, err); // real error → show, keep going
    }
  }

  if (waitingCustomers) void customerService.syncNow();
  if (waitingProducts) void productService.syncNow();

  if (pushTouchedLocal) {
    pushTouchedLocal = false;
    window.dispatchEvent(new Event(SALES_SYNCED_EVENT));
  }
};

// ============================================================
// SYNC — PULL (Supabase → local SQLite)
// ============================================================
let lastReconcile = 0;

const fetchAll = async <T>(
  build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: any }>
): Promise<T[]> => {
  const out: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await build(from, from + PAGE - 1);
    if (error) throw error;
    out.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return out;
};

/**
 * Downloads documents changed since the last pull (everything on first run) and
 * applies them locally, EXCEPT documents that still have unsent local changes.
 * Lines / payments are downloaded only for documents that actually changed.
 */
const pullRemote = async (): Promise<void> => {
  const businessId = await getBusinessId();
  const cursorKey = `${CURSOR_KEY}:${businessId}`;
  const cursor = localStorage.getItem(cursorKey);

  const remoteDocs = (
    await fetchAll<any>((from, to) => {
      let q = supabase
        .from('sales_documents')
        .select('*')
        .eq('business_id', businessId);
      if (cursor) q = q.gte('updated_at', cursor);
      return q
        .order('updated_at', { ascending: true })
        .order('id', { ascending: true })
        .range(from, to);
    })
  ).map(normalizeDoc);

  // which ones differ from what we already have?
  const local = await readDocs(businessId);
  const localJson = new Map(local.map((d) => [d.id, JSON.stringify(d)]));
  const toApply = remoteDocs.filter((d) => localJson.get(d.id) !== JSON.stringify(d));

  // children, only for changed documents
  const linesBy = new Map<string, Row[]>();
  const paysBy = new Map<string, Row[]>();
  const ids = toApply.map((d) => d.id);
  for (let i = 0; i < ids.length; i += CHUNK) {
    const chunk = ids.slice(i, i + CHUNK);
    const [ls, ps] = await Promise.all([
      supabase.from('sales_document_lines').select('*').in('document_id', chunk),
      supabase
        .from('sales_payments')
        .select('*')
        .in('document_id', chunk)
        .order('created_at', { ascending: true }),
    ]);
    if (ls.error) throw ls.error;
    if (ps.error) throw ps.error;
    for (const r of (ls.data ?? []) as any[]) {
      const arr = linesBy.get(r.document_id) ?? [];
      arr.push(normalizeLine(r));
      linesBy.set(r.document_id, arr);
    }
    for (const r of (ps.data ?? []) as any[]) {
      const arr = paysBy.get(r.document_id) ?? [];
      arr.push(normalizePayment(r));
      paysBy.set(r.document_id, arr);
    }
  }

  // documents deleted on another device (cheap: ids only, every few minutes)
  let remoteIdSet: Set<string> | null = null;
  if (Date.now() - lastReconcile > RECONCILE_MS) {
    const idRows = await fetchAll<{ id: string }>((from, to) =>
      supabase
        .from('sales_documents')
        .select('id')
        .eq('business_id', businessId)
        .order('id', { ascending: true })
        .range(from, to)
    );
    remoteIdSet = new Set(idRows.map((r) => String(r.id)));
  }

  const changed = await withLock(async () => {
    const pending = await pendingIds(); // checked INSIDE the lock → consistent
    let didChange = false;

    for (const d of toApply) {
      if (pending.has(d.id)) continue; // local unsent change wins
      await upsertDocLocal(d);
      await replaceLines(d.id, linesBy.get(d.id) ?? []);
      await replacePayments(d.id, paysBy.get(d.id) ?? []);
      didChange = true;
    }

    if (remoteIdSet) {
      for (const l of local) {
        if (!remoteIdSet.has(l.id) && !pending.has(l.id)) {
          await api().dbRun(`DELETE FROM sales_documents WHERE id = ?`, [l.id]);
          await api().dbRun(`DELETE FROM sales_document_lines WHERE document_id = ?`, [l.id]);
          await api().dbRun(`DELETE FROM sales_payments WHERE document_id = ?`, [l.id]);
          didChange = true;
        }
      }
    }

    if (didChange) docCache = await readDocs(businessId);
    return didChange;
  });

  if (remoteIdSet) lastReconcile = Date.now();
  if (remoteDocs.length > 0) {
    const last = remoteDocs[remoteDocs.length - 1].updated_at;
    const t = last ? new Date(last) : null;
    if (t && !isNaN(t.getTime())) localStorage.setItem(cursorKey, t.toISOString());
  }

  if (changed) window.dispatchEvent(new Event(SALES_SYNCED_EVENT));
};

// ============================================================
// SYNC — ORCHESTRATION
// ============================================================
let syncing = false;
let rerun = false;
let lastPull = 0;
let syncTimer: ReturnType<typeof setInterval> | null = null;
let listenersAttached = false;

/** Push queue → (optionally) pull remote. Single-flight. */
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
export const salesService = {
  /** Synchronous snapshot of the last loaded list (or null on first launch). */
  getCached(): SalesDocumentRow[] | null {
    return docCache;
  },

  /** Starts background sync (idempotent — safe to call from many pages). */
  startSyncWorker(): void {
    if (!syncTimer) {
      syncTimer = setInterval(() => void syncNow(), PUSH_INTERVAL_MS);
    }
    if (!listenersAttached) {
      listenersAttached = true;
      window.addEventListener('online', () => void syncNow(true));
      window.addEventListener('focus', () => void syncNow(true));
    }
    void syncNow(true);
  },

  /** Manual trigger (e.g. a "Sync now" button). */
  syncNow(): Promise<void> {
    return syncNow(true);
  },

  /** Reserves a quotation number atomically on Supabase across all devices. */
  async reserveQuotationNumber(): Promise<string> {
    const businessId = await getBusinessId();
    const year = new Date().getFullYear();
    const { data, error } = await supabase.rpc('reserve_next_sales_quotation_number', {
      p_business_id: businessId,
      p_year: year,
    });
    if (error) throw error;
    if (typeof data !== 'string' || !new RegExp(`^QT-${year}-\\d{4,}$`).test(data)) {
      throw new Error('Supabase returned an invalid quotation number');
    }
    return data;
  },

  /** How many documents are still waiting to be sent to the server. */
  async getPendingCount(): Promise<number> {
    await ensureTables();
    const ids = await pendingIds();
    return ids.size;
  },

  // ============================================================
  // 📄 CREATE DOCUMENT (INVOICE / QUOTATION) — local first, instant, works offline
  // Writes: document + lines + payment (+ accounting entry + stock movements)
  // into SQLite and ONE queue entry. Stock is reduced locally right away.
  // ============================================================
  async createDocument(data: SalesDocumentInput): Promise<SalesDocumentRow> {
    await ensureTables();
    const businessId = await getBusinessId();
    const user = getUser();
    const now = new Date().toISOString();
    const docId = crypto.randomUUID();
    const hasPayment = data.paymentAmount > 0;

    const doc: SalesDocumentRow = {
      id: docId,
      business_id: businessId,
      document_type: data.documentType,
      order_number: data.orderNumber,
      customer_id: data.customerId || null,
      customer_name: data.customerName,
      customer_company: data.customerCompany || null,
      customer_phone: data.customerPhone || null,
      customer_phone_alt: data.customerPhoneAlt || null,
      customer_email: data.customerEmail || null,
      customer_address: data.customerAddress || null,
      customer_city: data.customerCity || null,
      issue_date: data.issueDate,
      due_date: data.dueDate || data.issueDate,
      sales_channel: data.salesChannel,
      status: data.status,
      currency: data.currency,
      notes: data.notes || null,
      vat_number: data.vatNumber || null,
      vat_rate: data.vatRate,
      subtotal: data.subtotal,
      discount_total: data.discountTotal,
      tax_total: data.taxTotal,
      grand_total: data.grandTotal,
      payment_status: data.paymentStatus,
      payment_method: data.paymentMethod || null,
      payment_amount: data.paymentAmount,
      payment_date: hasPayment ? data.issueDate : null,
      payment_reference: data.paymentReference || null,
      balance_due: data.balanceDue,
      created_by: user.id,
      created_at: now,
      updated_at: now,
    };

    const lines: Row[] = data.lines.map((l) => ({
      id: crypto.randomUUID(),
      document_id: docId,
      product_id: l.productId,
      material: l.material,
      sku: l.sku,
      category: l.category || null,
      description: l.description || null,
      cost_price: l.costPrice,
      quantity: l.quantity,
      unit_price: l.unitPrice,
      discount_type: 'percentage',
      discount_value: l.discountValue,
      line_total: l.lineTotal,
    }));

    const payments: Row[] = hasPayment
      ? [
          {
            id: crypto.randomUUID(),
            document_id: docId,
            payment_date: data.issueDate,
            amount: data.paymentAmount,
            method: data.paymentMethod || 'Cash',
            note: null,
            balance_after: data.balanceDue,
            recorded_by: user.id,
            created_at: now,
          },
        ]
      : [];

    const accounting: Row | null = hasPayment
      ? {
          id: crypto.randomUUID(),
          business_id: businessId,
          transaction_no: `TXN-${Date.now()}`,
          txn_date: data.issueDate,
          customer_name: data.customerName,
          company_name: data.customerCompany || '',
          invoice_ref: data.orderNumber,
          type: 'In',
          amount: data.paymentAmount,
          status: data.paymentStatus === 'Paid' ? 'Paid' : 'Partially Paid',
          mode:
            data.paymentMethod === 'Bank Transfer'
              ? 'Bank Transfer'
              : data.paymentMethod === 'Card'
                ? 'Card'
                : 'Cash',
          source_module: 'sales',
          sales_document_id: docId,
        }
      : null;

    // Stock (invoice only) — read from LOCAL products, no network
    const stockMovements: Row[] = [];
    const stockUpdates: { product: any; after: number }[] = [];
    if (data.documentType === 'invoice') {
      const products = await productService.getProducts();
      const byId = new Map(products.map((p) => [p.id, p]));
      for (const line of data.lines) {
        const product = byId.get(line.productId);
        if (!product) continue;
        const before = product.stock;
        const after = Math.max(0, before - line.quantity);
        stockMovements.push({
          id: crypto.randomUUID(),
          business_id: businessId,
          product_id: line.productId,
          movement_type: 'sale',
          qty: -line.quantity,
          before_qty: before,
          after_qty: after,
          reference: data.orderNumber,
          sales_document_id: docId,
          movement_date: data.issueDate,
          created_by: user.id,
        });
        stockUpdates.push({ product, after });
      }
    }

    const bundle: Bundle = {
      document: doc,
      lines,
      payments,
      accounting,
      stock_movements: stockMovements,
    };

    // 1) local rows + 2) queue entry, atomically w.r.t. the pull step
    await withLock(async () => {
      await upsertDocLocal(doc);
      for (const l of lines) await upsertLocal('sales_document_lines', LINE_COLS, l);
      for (const p of payments) await upsertLocal('sales_payments', PAY_COLS, p);
      await api().addToSyncQueue(QUEUE_TABLE, 'INSERT', { ...bundle });
    });

    if (docCache) docCache = [doc, ...docCache.filter((d) => d.id !== doc.id)];

    // 3) reduce stock locally (productService queues + syncs it by itself)
    for (const { product, after } of stockUpdates) {
      try {
        await productService.updateProduct(product.id, {
          sku: product.sku,
          name: product.name,
          description: product.description,
          price: product.price,
          cost_price: product.cost_price,
          stock: after,
          low_stock_level: product.low_stock_level,
          unit_id: product.unit_id,
          category_id: product.category_id,
        });
      } catch (err) {
        console.error('[Sales] local stock update failed', product.id, err);
      }
    }

    void syncNow(); // push immediately if online
    return doc;
  },

  // ============================================================
  // 📄 GET DOCUMENTS — ALWAYS local SQLite (instant, works offline)
  // ============================================================
  async getDocuments(type?: 'invoice' | 'quotation'): Promise<SalesDocumentRow[]> {
    await ensureTables();
    const businessId = await getBusinessId();
    const rows = await readDocs(businessId, type);
    if (!type) docCache = rows;
    return rows;
  },

  // ============================================================
  // 📄 GET DOCUMENT LINES — local first, server only as a fallback
  // ============================================================
  async getDocumentLines(documentId: string): Promise<Row[]> {
    await ensureTables();
    const local = await api().dbQuery<Row>(
      `SELECT * FROM sales_document_lines WHERE document_id = ? ORDER BY rowid ASC`,
      [documentId]
    );
    if (local.length > 0) return local.map(normalizeLine);

    try {
      const { data, error } = await supabase
        .from('sales_document_lines')
        .select('*')
        .eq('document_id', documentId);
      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  },

  async getDocumentPayments(documentId: string): Promise<Row[]> {
    await ensureTables();
    const rows = await api().dbQuery<Row>(
      `SELECT * FROM sales_payments WHERE document_id = ? ORDER BY created_at ASC`,
      [documentId]
    );
    return rows.map(normalizePayment);
  },
};