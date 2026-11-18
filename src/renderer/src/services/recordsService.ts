/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase, getCurrentBusinessId } from '../lib/supabaseClient';
import { salesService, type SalesDocumentRow } from './salesService';

// ============================================================
// TYPES
// ============================================================
export type RecordsDocument = {
  id: string;
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
  created_by_name: string;
  created_at: string;
  updated_at: string;
  lines: any[];
  payments: any[]; // + recorded_by_name
  returns: any[]; // + items[], linked_transaction_no, created_by_name
  history: any[]; // + changed_by_name
};

export type ReturnInput = {
  documentId: string;
  documentRef: string;
  documentStatus: 'Pending' | 'Approved' | 'Rejected';
  customerName: string;
  customerCompany: string;
  date: string;
  reason: string;
  notes?: string;
  items: Array<{
    lineId: string;
    productId: string;
    productName: string;
    price: number;
    originalQty: number;
    returnQty: number;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
  }>;
  subtotal: number;
  taxTotal: number;
  totalReturnAmount: number;
};

export type CompanyInfo = {
  name: string;
  address: string;
  phone: string;
  vat: string;
};

type Status = 'Pending' | 'Approved' | 'Rejected';
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
export const RECORDS_SYNCED_EVENT = 'zakhira:records-synced';
/** Fired when pushing/pulling fails for a reason other than "offline" */
export const RECORDS_SYNC_ERROR_EVENT = 'zakhira:records-sync-error';

// ============================================================
// CONSTANTS
// ============================================================
const BUSINESS_ID_KEY = 'zakhira_business_id';
const COMPANY_CACHE_KEY = 'zakhira_company_info';
const QUEUE_TABLE = 'records';
const PUSH_INTERVAL_MS = 5000; // check the queue every 5s (cheap when empty)
const PULL_INTERVAL_MS = 30000; // download remote changes at most every 30s
const pulledKey = (businessId: string): string => `zakhira_records_pulled_${businessId}`;

// ============================================================
// SMALL UTILITIES
// ============================================================
const round = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;
const today = (): string => new Date().toISOString().split('T')[0];
const nowIso = (): string => new Date().toISOString();
const uuid = (): string => crypto.randomUUID();
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

const getUser = (): { id: string; name: string } => {
  const raw = localStorage.getItem('zakhira_user');
  if (!raw) throw new Error('User not logged in');
  const u = JSON.parse(raw);
  if (!u?.id) throw new Error('User not logged in');
  return { id: u.id, name: u.name || u.full_name || u.email || '' };
};

const mapMode = (m?: string | null): 'Cash' | 'Card' | 'Bank Transfer' | 'Other' =>
  m === 'Bank Transfer' ? 'Bank Transfer' : m === 'Card' ? 'Card' : m === 'Other' ? 'Other' : 'Cash';

// transaction_no VARCHAR(20): "TXN-" + 13 digit timestamp (+ small offset) = 17 chars
const txnNo = (offset = 0): string => `TXN-${Date.now() + offset}`;

const unique = <T,>(arr: T[]): T[] => Array.from(new Set(arr.filter(Boolean)));

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
 * Tiny mutex. Every local write (document + queue entries) and the
 * "apply remote changes" step run inside it, so a pull can never see a
 * half-finished write.
 */
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

/**
 * A logical failure that will never succeed by retrying
 * (e.g. payment bigger than the balance because another device already paid).
 * The queued operation is dropped, the error is shown, and the next pull
 * restores the server truth locally.
 */
class PermanentSyncError extends Error {}

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
  console.error('[RecordsSync]', key, err);
  window.dispatchEvent(
    new CustomEvent(RECORDS_SYNC_ERROR_EVENT, {
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

/**
 * Canonical form used ONLY to compare local vs remote documents:
 * keys sorted, and arrays of {id} objects sorted by id (DB row order is not guaranteed).
 */
const canon = (v: any): any => {
  if (Array.isArray(v)) {
    const arr = v.map(canon);
    if (
      arr.length > 1 &&
      arr.every((x) => x && typeof x === 'object' && 'id' in x)
    ) {
      arr.sort((a, b) => String(a.id).localeCompare(String(b.id)));
    }
    return arr;
  }
  if (v && typeof v === 'object') {
    const o: Record<string, any> = {};
    for (const k of Object.keys(v).sort()) o[k] = canon(v[k]);
    return o;
  }
  return v;
};
const fingerprint = (d: unknown): string => JSON.stringify(canon(d));

// ============================================================
// LOCAL DB
// ============================================================
// Each sales document is stored as ONE JSON blob (with lines, payments,
// returns+items and history inside) → a write is always atomic.
let tableReady: Promise<void> | null = null;

/** Idempotent. Safe to call on every operation. */
const ensureTable = (): Promise<void> => {
  if (!tableReady) {
    tableReady = (async () => {
      await api().dbRun(
        `CREATE TABLE IF NOT EXISTS records_documents (
           id          TEXT PRIMARY KEY,
           business_id TEXT NOT NULL,
           created_at  TEXT NOT NULL,
           data        TEXT NOT NULL
         )`
      );
      await api().dbRun(
        `CREATE INDEX IF NOT EXISTS idx_records_documents_business
           ON records_documents (business_id, created_at DESC)`
      );
    })().catch((err) => {
      tableReady = null; // allow retry
      throw err;
    });
  }
  return tableReady;
};

const parseRow = (r: { data: string }): RecordsDocument =>
  JSON.parse(r.data) as RecordsDocument;

const readLocal = async (businessId: string): Promise<RecordsDocument[]> => {
  const rows = await api().dbQuery<{ data: string }>(
    `SELECT data FROM records_documents WHERE business_id = ? ORDER BY created_at DESC`,
    [businessId]
  );
  return rows.map(parseRow);
};

const fromSalesDocument = async (
  doc: SalesDocumentRow
): Promise<RecordsDocument> => {
  const [lines, payments] = await Promise.all([
    api().dbQuery<Record<string, any>>(
      `SELECT * FROM sales_document_lines WHERE document_id = ? ORDER BY rowid ASC`,
      [doc.id]
    ),
    api().dbQuery<Record<string, any>>(
      `SELECT * FROM sales_payments WHERE document_id = ? ORDER BY created_at ASC`,
      [doc.id]
    ),
  ]);

  return {
    ...doc,
    sales_channel: doc.sales_channel === 'Online' ? 'Online' : 'Offline',
    updated_at: doc.updated_at || doc.created_at,
    created_by_name: '',
    lines,
    payments: payments.map((payment) => ({
      ...payment,
      recorded_by_name: '',
    })),
    returns: [],
    history: [],
  };
};

const readLocalOne = async (id: string): Promise<RecordsDocument | null> => {
  const rows = await api().dbQuery<{ data: string }>(
    `SELECT data FROM records_documents WHERE id = ?`,
    [id]
  );
  if (rows[0]) return parseRow(rows[0]);

  const salesDoc = (await salesService.getDocuments()).find((doc) => doc.id === id);
  return salesDoc ? fromSalesDocument(salesDoc) : null;
};

const upsertIntoLocalDb = async (
  businessId: string,
  doc: RecordsDocument
): Promise<void> => {
  await api().dbRun(
    `INSERT INTO records_documents (id, business_id, created_at, data)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       business_id = excluded.business_id,
       created_at = excluded.created_at,
       data = excluded.data`,
    [doc.id, businessId, doc.created_at, JSON.stringify(doc)]
  );
};

/** In-memory snapshot so the page can render instantly on re-mount */
let cache: RecordsDocument[] | null = null;

// ============================================================
// QUEUED OPERATIONS (what gets replayed against Supabase)
// ============================================================
// Every operation carries CLIENT-GENERATED ids, and every remote step is an
// upsert / "exists?" check → replaying an operation after a crash or a
// timeout can never create duplicates.
type PaymentOp = {
  kind: 'payment';
  docId: string;
  paymentId: string;
  txnId: string;
  txnNo: string;
  amount: number;
  method: string;
  note: string | null;
  date: string;
  userId: string;
};

type StatusOp = {
  kind: 'status';
  docId: string;
  historyId: string;
  oldStatus: Status;
  newStatus: Status;
  reason: string;
  userId: string;
};

type EnsureAccountingOp = {
  kind: 'ensure_accounting';
  docId: string;
};

type ReturnOp = {
  kind: 'return';
  docId: string;
  returnId: string;
  provisionalNumber: string;
  txnId: string;
  txnNo: string;
  historyId: string;
  documentRef: string;
  documentStatus: Status;
  customerName: string;
  customerCompany: string;
  date: string;
  reason: string;
  notes: string | null;
  subtotal: number;
  taxTotal: number;
  totalReturnAmount: number;
  userId: string;
  items: Array<{
    id: string;
    movementId: string;
    lineId: string;
    productId: string;
    productName: string;
    price: number;
    originalQty: number;
    returnQty: number;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
  }>;
};

type SyncOp = PaymentOp | StatusOp | EnsureAccountingOp | ReturnOp;

// ============================================================
// LOCAL APPLY (optimistic changes on the stored document)
// ============================================================
const applyStatus = (
  doc: RecordsDocument,
  oldStatus: Status,
  newStatus: Status,
  reason: string,
  user: { id: string; name: string },
  historyId: string
): void => {
  const now = nowIso();
  doc.status = newStatus;
  doc.updated_at = now;
  doc.history = [
    ...(doc.history || []),
    {
      id: historyId,
      document_id: doc.id,
      old_status: oldStatus,
      new_status: newStatus,
      reason: reason.slice(0, 255),
      changed_by: user.id,
      changed_at: now,
      changed_by_name: user.name,
    },
  ];
};

/** Mirrors the old server-side addPayment math, but on the local copy. */
const applyPayment = (
  doc: RecordsDocument,
  p: { amount: number; method: string; note?: string },
  user: { id: string; name: string },
  paymentId: string
): { date: string; note: string | null } => {
  const grand = Number(doc.grand_total);
  const paid = Number(doc.payment_amount || 0);
  const remaining = round(grand - paid);
  if (!(p.amount > 0) || p.amount > remaining + 0.001) {
    throw new Error('Invalid payment amount');
  }

  const newPaid = round(paid + p.amount);
  const newBalance = round(Math.max(0, grand - newPaid));
  const now = nowIso();
  const date = today();
  const note = p.note ? p.note.slice(0, 255) : null;

  doc.payments = [
    ...(doc.payments || []),
    {
      id: paymentId,
      document_id: doc.id,
      payment_date: date,
      amount: p.amount,
      method: mapMode(p.method),
      note,
      balance_after: newBalance,
      recorded_by: user.id,
      recorded_by_name: user.name,
      created_at: now,
    },
  ];
  doc.payment_status = newBalance <= 0 ? 'Paid' : 'Partially Paid';
  doc.payment_amount = newPaid;
  doc.balance_due = newBalance;
  doc.payment_method = doc.payment_method || mapMode(p.method);
  doc.payment_date = date;
  doc.payment_reference = note ?? doc.payment_reference;
  doc.updated_at = now;
  return { date, note };
};

/** Provisional return number (the real one is assigned when it reaches the server). */
const nextLocalReturnNumber = (all: RecordsDocument[]): string => {
  const year = new Date().getFullYear();
  const prefix = `RET-${year}-`;
  let last = 0;
  for (const d of all) {
    for (const r of d.returns || []) {
      const num = String(r.return_number || '');
      if (num.startsWith(prefix)) {
        last = Math.max(last, Number(num.split('-')[2]) || 0);
      }
    }
  }
  return `${prefix}${String(last + 1).padStart(4, '0')}`;
};

// ============================================================
// REMOTE EXECUTION (replaying one queued operation on Supabase)
// ============================================================
async function insertInTxn(
  businessId: string,
  doc: any,
  payment: any,
  txnId: string,
  txnNoStr: string
): Promise<void> {
  const { error } = await supabase.from('accounting_transactions').upsert(
    [
      {
        id: txnId,
        business_id: businessId,
        transaction_no: txnNoStr,
        txn_date: payment.payment_date || today(),
        customer_name: doc.customer_name,
        company_name: doc.customer_company || '',
        invoice_ref: doc.order_number,
        type: 'In',
        amount: payment.amount,
        status: Number(payment.balance_after) > 0 ? 'Partially Paid' : 'Paid',
        mode: mapMode(payment.method),
        source_module: 'sales',
        sales_document_id: doc.id,
        sales_payment_id: payment.id,
        notes: `Payment received for ${doc.order_number} (Balance after: ${payment.balance_after})${
          payment.note ? ` — ${payment.note}` : ''
        }`,
      },
    ],
    { onConflict: 'id' }
  );
  if (error) throw error;
}

const execPayment = async (businessId: string, op: PaymentOp): Promise<void> => {
  const { data: current, error: curErr } = await supabase
    .from('sales_documents')
    .select('*')
    .eq('id', op.docId)
    .maybeSingle();
  if (curErr) throw curErr;
  if (!current) throw new PermanentSyncError('Document no longer exists on the server');

  const { data: existing, error: exErr } = await supabase
    .from('sales_payments')
    .select('*')
    .eq('id', op.paymentId)
    .maybeSingle();
  if (exErr) throw exErr;

  let payRow: any = existing;
  let doc: any = current;

  if (!existing) {
    // Totals are computed from the SERVER state (another device may have paid too)
    const grand = Number(current.grand_total);
    const paid = Number(current.payment_amount || 0);
    const remaining = round(grand - paid);
    if (!(op.amount > 0) || op.amount > remaining + 0.001) {
      throw new PermanentSyncError(
        'Payment was not saved: the balance changed on another device'
      );
    }
    const newPaid = round(paid + op.amount);
    const newBalance = round(Math.max(0, grand - newPaid));
    const newStatus = newBalance <= 0 ? 'Paid' : 'Partially Paid';

    const { data: ins, error: payErr } = await supabase
      .from('sales_payments')
      .upsert(
        [
          {
            id: op.paymentId,
            document_id: op.docId,
            payment_date: op.date,
            amount: op.amount,
            method: mapMode(op.method),
            note: op.note,
            balance_after: newBalance,
            recorded_by: op.userId,
          },
        ],
        { onConflict: 'id' }
      )
      .select()
      .single();
    if (payErr) throw payErr;
    payRow = ins;

    const { data: upd, error: docErr } = await supabase
      .from('sales_documents')
      .update({
        payment_status: newStatus,
        payment_amount: newPaid,
        balance_due: newBalance,
        payment_method: current.payment_method || mapMode(op.method),
        payment_date: op.date,
        payment_reference: op.note ? op.note : current.payment_reference,
      })
      .eq('id', op.docId)
      .select()
      .single();
    if (docErr) throw docErr;
    doc = upd;
  }

  await insertInTxn(businessId, doc, payRow, op.txnId, op.txnNo);
};

const execStatus = async (op: StatusOp): Promise<void> => {
  const { data, error } = await supabase
    .from('sales_documents')
    .update({ status: op.newStatus })
    .eq('id', op.docId)
    .select('id');
  if (error) throw error;
  if (!data || data.length === 0) {
    throw new PermanentSyncError('Document no longer exists on the server');
  }

  const { error: hErr } = await supabase.from('sales_status_history').upsert(
    [
      {
        id: op.historyId,
        document_id: op.docId,
        old_status: op.oldStatus,
        new_status: op.newStatus,
        reason: op.reason.slice(0, 255),
        changed_by: op.userId,
      },
    ],
    { onConflict: 'id' }
  );
  if (hErr) throw hErr;

  if (op.newStatus === 'Rejected') {
    const { error: dErr } = await supabase
      .from('accounting_transactions')
      .delete()
      .eq('sales_document_id', op.docId)
      .eq('type', 'In');
    if (dErr) throw dErr;
  }
};

/**
 * If a document lost its accounting rows (e.g. it was rejected before),
 * recreate them from its payments.
 */
const execEnsureAccounting = async (
  businessId: string,
  op: EnsureAccountingOp
): Promise<void> => {
  const { data: existing, error: exErr } = await supabase
    .from('accounting_transactions')
    .select('id')
    .eq('sales_document_id', op.docId)
    .eq('type', 'In')
    .limit(1);
  if (exErr) throw exErr;
  if (existing && existing.length > 0) return;

  const { data: doc, error: dErr } = await supabase
    .from('sales_documents')
    .select('*')
    .eq('id', op.docId)
    .maybeSingle();
  if (dErr) throw dErr;
  const { data: pays, error: pErr } = await supabase
    .from('sales_payments')
    .select('*')
    .eq('document_id', op.docId)
    .order('created_at', { ascending: true });
  if (pErr) throw pErr;
  if (!doc || !pays) return;

  for (let i = 0; i < pays.length; i++) {
    await insertInTxn(businessId, doc, pays[i], uuid(), txnNo(i));
  }
};

const execReturn = async (businessId: string, op: ReturnOp): Promise<void> => {
  // Return number: if the header already exists keep its number,
  // otherwise RET-YYYY-0001 (max + 1 on the SERVER)
  const { data: existingRet, error: erErr } = await supabase
    .from('sales_returns')
    .select('id, return_number')
    .eq('id', op.returnId)
    .maybeSingle();
  if (erErr) throw erErr;

  let returnNumber: string;
  if (existingRet) {
    returnNumber = existingRet.return_number;
  } else {
    const prefix = op.provisionalNumber.slice(0, op.provisionalNumber.lastIndexOf('-') + 1);
    const { data: last, error: lErr } = await supabase
      .from('sales_returns')
      .select('return_number')
      .eq('business_id', businessId)
      .like('return_number', `${prefix}%`)
      .order('return_number', { ascending: false })
      .limit(1);
    if (lErr) throw lErr;
    const lastNum = last && last[0] ? Number(last[0].return_number.split('-')[2]) || 0 : 0;
    returnNumber = `${prefix}${String(lastNum + 1).padStart(4, '0')}`;
  }

  // original "In" transaction (for linking)
  const { data: originals, error: oErr } = await supabase
    .from('accounting_transactions')
    .select('id')
    .eq('sales_document_id', op.docId)
    .eq('type', 'In')
    .order('created_at', { ascending: false })
    .limit(1);
  if (oErr) throw oErr;
  const originalTxnId = originals && originals[0] ? originals[0].id : null;

  // 1. accounting "Out" entry
  const { error: accErr } = await supabase.from('accounting_transactions').upsert(
    [
      {
        id: op.txnId,
        business_id: businessId,
        transaction_no: op.txnNo,
        txn_date: op.date,
        customer_name: op.customerName,
        company_name: op.customerCompany || '',
        invoice_ref: op.documentRef,
        type: 'Out',
        amount: op.totalReturnAmount,
        status: 'Returned',
        mode: 'Other',
        source_module: 'sales',
        sales_document_id: op.docId,
        original_transaction_id: originalTxnId,
        notes: `Return ${returnNumber}: ${op.reason}${op.notes ? ` — ${op.notes}` : ''}`,
      },
    ],
    { onConflict: 'id' }
  );
  if (accErr) throw accErr;

  // mark original "In" rows as having a return
  const { error: hrErr } = await supabase
    .from('accounting_transactions')
    .update({ has_return: true })
    .eq('sales_document_id', op.docId)
    .eq('type', 'In');
  if (hrErr) throw hrErr;

  // 2. return header
  const { error: retErr } = await supabase.from('sales_returns').upsert(
    [
      {
        id: op.returnId,
        business_id: businessId,
        return_number: returnNumber,
        document_id: op.docId,
        linked_transaction_id: op.txnId,
        return_date: op.date,
        reason: op.reason.slice(0, 255),
        notes: op.notes ? op.notes.slice(0, 255) : null,
        subtotal: op.subtotal,
        tax_total: op.taxTotal,
        total_return_amount: op.totalReturnAmount,
        created_by: op.userId,
      },
    ],
    { onConflict: 'id' }
  );
  if (retErr) throw retErr;

  // 3. return items
  const { error: itemsErr } = await supabase.from('sales_return_items').upsert(
    op.items.map((it) => ({
      id: it.id,
      return_id: op.returnId,
      line_id: it.lineId,
      product_name: it.productName,
      price: it.price,
      original_qty: it.originalQty,
      return_qty: it.returnQty,
      subtotal: it.subtotal,
      tax_amount: it.taxAmount,
      total_amount: it.totalAmount,
    })),
    { onConflict: 'id' }
  );
  if (itemsErr) throw itemsErr;

  // Stock update + movement insert must be atomic and idempotent on retries.
  const stockItems = op.items
    .filter((item) => item.productId)
    .map((item) => ({
      movement_id: item.movementId,
      product_id: item.productId,
      return_qty: item.returnQty,
    }));
  if (stockItems.length > 0) {
    const { error: stockErr } = await supabase.rpc(
      'apply_sales_return_stock_movements',
      {
        p_business_id: businessId,
        p_document_id: op.docId,
        p_return_number: returnNumber,
        p_return_date: op.date,
        p_created_by: op.userId,
        p_items: stockItems,
      }
    );
    if (stockErr) throw stockErr;
  }

  // 5. history entry (new_status is NOT NULL, so keep current status)
  const { error: histErr } = await supabase.from('sales_status_history').upsert(
    [
      {
        id: op.historyId,
        document_id: op.docId,
        old_status: op.documentStatus,
        new_status: op.documentStatus,
        reason: `Returned ${op.items.length} item(s) — ${returnNumber}`.slice(0, 255),
        changed_by: op.userId,
      },
    ],
    { onConflict: 'id' }
  );
  if (histErr) throw histErr;
};

const executeOp = async (businessId: string, op: SyncOp): Promise<void> => {
  switch (op.kind) {
    case 'payment':
      return execPayment(businessId, op);
    case 'status':
      return execStatus(op);
    case 'ensure_accounting':
      return execEnsureAccounting(businessId, op);
    case 'return':
      return execReturn(businessId, op);
    default:
      return; // unknown op kind → ignore (it gets removed from the queue)
  }
};

// ============================================================
// SYNC — PUSH (local queue → Supabase)
// ============================================================
type QueueRow = { id: number; action: SyncAction; payload: string };

let pullRequested = false;

/**
 * Sends queued operations to Supabase.
 *  - Operations of ONE document are replayed in the order they happened.
 *  - Offline  → throws a network error (whole cycle stops, retried later).
 *  - Real error for one document (RLS, constraint, …) → reported, that
 *    document stays queued, but OTHER documents still sync (no stuck queue).
 *  - Logical error (PermanentSyncError) → that operation is dropped, reported,
 *    and a pull is forced so the local copy returns to the server truth.
 * Returns true when at least one operation reached the server.
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
    const docId = op?.docId ? String(op.docId) : '';
    if (!docId) {
      await api().dbRun('DELETE FROM sync_queue WHERE id = ?', [r.id]);
      continue;
    }
    const g = groups.get(docId);
    if (g) g.push({ qid: r.id, op });
    else groups.set(docId, [{ qid: r.id, op }]);
  }

  if (groups.size === 0) return false;

  const businessId = await getBusinessId();
  let pushedAny = false;

  for (const [docId, entries] of groups) {
    for (const entry of entries) {
      try {
        await executeOp(businessId, entry.op);
        await api().dbRun('DELETE FROM sync_queue WHERE id = ?', [entry.qid]);
        pushedAny = true;
      } catch (err) {
        if (isNetworkError(err)) throw err; // offline → stop, retry later

        if (err instanceof PermanentSyncError) {
          reportSyncError(`push ${entry.op.kind} ${docId}`, err);
          await api().dbRun('DELETE FROM sync_queue WHERE id = ?', [entry.qid]);
          pullRequested = true;
          continue; // next operation of this document
        }

        reportSyncError(`push ${entry.op.kind} ${docId}`, err); // real error → show it
        break; // keep this document's remaining operations queued (order matters)
      }
    }
  }

  return pushedAny;
};

// ============================================================
// SYNC — PULL (Supabase → local SQLite)
// ============================================================
/** Reads ALL documents (+ lines, payments, returns, items, history, names) from Supabase. */
const fetchRemoteDocuments = async (businessId: string): Promise<RecordsDocument[]> => {
  const { data: docs, error } = await supabase
    .from('sales_documents')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!docs || docs.length === 0) return [];

  const ids = docs.map((d) => d.id);

  const [lines, payments, returns, history] = await Promise.all([
    supabase.from('sales_document_lines').select('*').in('document_id', ids),
    supabase.from('sales_payments').select('*').in('document_id', ids).order('created_at', { ascending: true }),
    supabase.from('sales_returns').select('*').in('document_id', ids).order('created_at', { ascending: true }),
    supabase.from('sales_status_history').select('*').in('document_id', ids).order('changed_at', { ascending: true }),
  ]);
  // A failed sub-query must NEVER be treated as "empty" (it would wipe local data)
  for (const r of [lines, payments, returns, history]) {
    if (r.error) throw r.error;
  }

  const returnRows = returns.data || [];
  const returnIds = returnRows.map((r) => r.id);
  const linkedTxnIds = unique(returnRows.map((r) => r.linked_transaction_id));

  const [retItems, txns] = await Promise.all([
    returnIds.length
      ? supabase.from('sales_return_items').select('*').in('return_id', returnIds)
      : Promise.resolve({ data: [] as any[], error: null as any }),
    linkedTxnIds.length
      ? supabase.from('accounting_transactions').select('id, transaction_no').in('id', linkedTxnIds)
      : Promise.resolve({ data: [] as any[], error: null as any }),
  ]);
  if (retItems.error) throw retItems.error;
  if (txns.error) throw txns.error;

  // profile names (created_by / recorded_by / changed_by are UUIDs)
  const profileIds = unique<string>([
    ...docs.map((d) => d.created_by),
    ...(payments.data || []).map((p) => p.recorded_by),
    ...returnRows.map((r) => r.created_by),
    ...(history.data || []).map((h) => h.changed_by),
  ]);
  let profiles: any[] = [];
  if (profileIds.length) {
    const pr = await supabase.from('profiles').select('id, name, email').in('id', profileIds);
    if (pr.error) throw pr.error;
    profiles = pr.data || [];
  }
  const nameOf = (id?: string | null): string => {
    const p = profiles.find((x: any) => x.id === id);
    return p?.name || p?.email || '';
  };
  const txnNoOf = (id?: string | null): string =>
    ((txns.data || []).find((t: any) => t.id === id) as any)?.transaction_no || '';

  return docs.map((doc) => ({
    ...doc,
    created_by_name: nameOf(doc.created_by),
    lines: (lines.data || []).filter((l) => l.document_id === doc.id),
    payments: (payments.data || [])
      .filter((p) => p.document_id === doc.id)
      .map((p) => ({ ...p, recorded_by_name: nameOf(p.recorded_by) })),
    returns: returnRows
      .filter((r) => r.document_id === doc.id)
      .map((r) => ({
        ...r,
        items: ((retItems.data || []) as any[]).filter((i) => i.return_id === r.id),
        linked_transaction_no: txnNoOf(r.linked_transaction_id),
        created_by_name: nameOf(r.created_by),
      })),
    history: (history.data || [])
      .filter((h) => h.document_id === doc.id)
      .map((h) => ({ ...h, changed_by_name: nameOf(h.changed_by) })),
  })) as RecordsDocument[];
};

/**
 * Downloads the remote documents and applies them locally, EXCEPT for
 * documents that still have unsent local operations (those win until pushed).
 * Also removes local rows that were deleted on another device.
 */
const pullRemote = async (): Promise<void> => {
  const businessId = await getBusinessId();
  const remote = await fetchRemoteDocuments(businessId);
  const firstPull = !localStorage.getItem(pulledKey(businessId));

  const changed = await withLock(async () => {
    // Unsent local operations (checked INSIDE the lock → consistent)
    const queued = await api().dbQuery<{ payload: string }>(
      `SELECT payload FROM sync_queue WHERE table_name = '${QUEUE_TABLE}'`
    );
    const pending = new Set<string>();
    for (const q of queued) {
      try {
        const p = JSON.parse(q.payload) as { docId?: string };
        if (p?.docId) pending.add(String(p.docId));
      } catch {
        /* ignore corrupt entry */
      }
    }

    const local = await readLocal(businessId);
    const localPrint = new Map(local.map((d) => [d.id, fingerprint(d)]));
    const remoteIds = new Set<string>();
    let didChange = false;

    for (const doc of remote) {
      remoteIds.add(doc.id);
      if (pending.has(doc.id)) continue;
      if (localPrint.get(doc.id) !== fingerprint(doc)) {
        await upsertIntoLocalDb(businessId, doc);
        didChange = true;
      }
    }

    for (const l of local) {
      if (!remoteIds.has(l.id) && !pending.has(l.id)) {
        await api().dbRun('DELETE FROM records_documents WHERE id = ?', [l.id]);
        didChange = true;
      }
    }

    if (didChange) cache = await readLocal(businessId);
    return didChange;
  });

  localStorage.setItem(pulledKey(businessId), '1');
  if (changed || firstPull) window.dispatchEvent(new Event(RECORDS_SYNCED_EVENT));
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
      const pushed = await pushQueue();
      if (pushed) {
        // other modules (accounting, products/stock) can now see the new server data
        window.dispatchEvent(new Event('zakhira:sales-updated'));
      }
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
// LOCAL WRITE HELPER
// ============================================================
const enqueue = (op: SyncOp): Promise<unknown> =>
  api().addToSyncQueue(QUEUE_TABLE, 'UPDATE', { ...op } as Record<string, unknown>);

const loadForWrite = async (documentId: string): Promise<RecordsDocument> => {
  const existing = await readLocalOne(documentId);
  if (!existing) throw new Error('Document not found locally');
  return clone(existing);
};

const commitLocal = async (doc: RecordsDocument): Promise<void> => {
  const businessId = await getBusinessId();
  await upsertIntoLocalDb(businessId, doc);
  if (cache) cache = cache.map((c) => (c.id === doc.id ? doc : c));
};

// ============================================================
// SERVICE
// ============================================================
export const recordsService = {
  /** Synchronous snapshot of the last loaded list (or null on first launch). */
  getCached(): RecordsDocument[] | null {
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
    salesService.startSyncWorker();
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

  // ----------------------------------------------------------
  // All documents with lines, payments, returns (+items) and history
  // — ALWAYS local SQLite only (instant, works offline)
  // ----------------------------------------------------------
  async getDocuments(): Promise<RecordsDocument[]> {
    await ensureTable();
    const businessId = await getBusinessId();
    const records = await readLocal(businessId);
    const recordIds = new Set(records.map((doc) => doc.id));
    const localSales = await salesService.getDocuments();
    const salesOnly = await Promise.all(
      localSales
        .filter((doc) => !recordIds.has(doc.id))
        .map(fromSalesDocument)
    );
    const rows = [...records, ...salesOnly].sort((a, b) =>
      b.created_at.localeCompare(a.created_at)
    );
    cache = rows;
    return rows;
  },

  // ----------------------------------------------------------
  // Company info for printing (cached → works offline)
  // ----------------------------------------------------------
  async getCompanyInfo(): Promise<CompanyInfo> {
    const fallback: CompanyInfo = { name: 'Zakhira', address: '', phone: '', vat: '' };
    let cached: CompanyInfo | null = null;
    try {
      const raw = localStorage.getItem(COMPANY_CACHE_KEY);
      if (raw) cached = JSON.parse(raw) as CompanyInfo;
    } catch {
      cached = null;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) return cached ?? fallback;

    try {
      const businessId = await getBusinessId();
      const { data, error } = await supabase
        .from('businesses')
        .select('name, address, city, phone, vat_number')
        .eq('id', businessId)
        .single();
      if (error || !data) return cached ?? fallback;
      const info: CompanyInfo = {
        name: data.name || 'Zakhira',
        address: [data.address, data.city].filter(Boolean).join(', '),
        phone: data.phone || '',
        vat: data.vat_number || '',
      };
      try {
        localStorage.setItem(COMPANY_CACHE_KEY, JSON.stringify(info));
      } catch {
        /* ignore */
      }
      return info;
    } catch {
      return cached ?? fallback;
    }
  },

  // ----------------------------------------------------------
  // Status change + history (+ accounting cleanup on reject)
  // Local first, then queued for Supabase.
  // ----------------------------------------------------------
  async updateStatus(
    documentId: string,
    oldStatus: Status,
    newStatus: Status,
    reason: string
  ): Promise<RecordsDocument> {
    await ensureTable();
    const user = getUser();

    const doc = await withLock(async () => {
      const d = await loadForWrite(documentId);
      const historyId = uuid();
      applyStatus(d, oldStatus, newStatus, reason, user, historyId);
      await commitLocal(d);
      await enqueue({
        kind: 'status',
        docId: documentId,
        historyId,
        oldStatus,
        newStatus,
        reason: reason.slice(0, 255),
        userId: user.id,
      });
      return d;
    });

    void syncNow();
    return doc;
  },

  // ----------------------------------------------------------
  // Add payment (totals computed from the local copy now,
  // and re-computed from the server copy when it is pushed)
  // ----------------------------------------------------------
  async addPayment(
    documentId: string,
    p: { amount: number; method: string; note?: string }
  ): Promise<RecordsDocument> {
    await ensureTable();
    const user = getUser();

    const doc = await withLock(async () => {
      const d = await loadForWrite(documentId);
      const paymentId = uuid();
      const { date, note } = applyPayment(d, p, user, paymentId);
      await commitLocal(d);
      await enqueue({
        kind: 'payment',
        docId: documentId,
        paymentId,
        txnId: uuid(),
        txnNo: txnNo(),
        amount: p.amount,
        method: mapMode(p.method),
        note,
        date,
        userId: user.id,
      });
      return d;
    });

    void syncNow();
    return doc;
  },

  // ----------------------------------------------------------
  // If a document lost its accounting rows (e.g. it was rejected before),
  // recreate them from its payments (done on the server when synced).
  // ----------------------------------------------------------
  async ensureAccountingForPayments(documentId: string): Promise<void> {
    await ensureTable();
    await withLock(async () => {
      await enqueue({ kind: 'ensure_accounting', docId: documentId });
    });
    void syncNow();
  },

  // ----------------------------------------------------------
  // Approve (optionally with a payment) — ONE local write, operations
  // queued in the same order the online version used to run them.
  // NOTE: stock is NOT touched here — salesService.createDocument
  // already deducts stock when an invoice is created.
  // ----------------------------------------------------------
  async approveDocument(
    documentId: string,
    oldStatus: Status,
    payment?: { amount: number; method: string; note?: string }
  ): Promise<RecordsDocument> {
    await ensureTable();
    const user = getUser();

    const doc = await withLock(async () => {
      const d = await loadForWrite(documentId);
      const ops: SyncOp[] = [];

      // recreate accounting rows from existing payments (if they were removed)
      if ((d.payments || []).length > 0) {
        ops.push({ kind: 'ensure_accounting', docId: documentId });
      }

      if (payment && payment.amount > 0) {
        const paymentId = uuid();
        const { date, note } = applyPayment(d, payment, user, paymentId);
        ops.push({
          kind: 'payment',
          docId: documentId,
          paymentId,
          txnId: uuid(),
          txnNo: txnNo(),
          amount: payment.amount,
          method: mapMode(payment.method),
          note,
          date,
          userId: user.id,
        });
      }

      const historyId = uuid();
      applyStatus(d, oldStatus, 'Approved', 'Approved', user, historyId);
      ops.push({
        kind: 'status',
        docId: documentId,
        historyId,
        oldStatus,
        newStatus: 'Approved',
        reason: 'Approved',
        userId: user.id,
      });

      await commitLocal(d);
      for (const op of ops) await enqueue(op);
      return d;
    });

    void syncNow();
    return doc;
  },

  // ----------------------------------------------------------
  // Return
  // ----------------------------------------------------------
  async addReturn(
    input: ReturnInput
  ): Promise<{ return_number: string; linked_transaction_no: string } & Record<string, any>> {
    await ensureTable();
    const businessId = await getBusinessId();
    const user = getUser();

    const result = await withLock(async () => {
      const d = await loadForWrite(input.documentId);
      const all = await readLocal(businessId);

      const now = nowIso();
      const returnId = uuid();
      const txnId = uuid();
      const txnNoStr = txnNo();
      const historyId = uuid();
      const provisionalNumber = nextLocalReturnNumber(all);

      const items = input.items.map((it) => ({
        id: uuid(),
        movementId: uuid(),
        lineId: it.lineId,
        productId: it.productId,
        productName: it.productName,
        price: it.price,
        originalQty: it.originalQty,
        returnQty: it.returnQty,
        subtotal: it.subtotal,
        taxAmount: it.taxAmount,
        totalAmount: it.totalAmount,
      }));

      // 1) local copy
      const retRow = {
        id: returnId,
        business_id: businessId,
        return_number: provisionalNumber,
        document_id: input.documentId,
        linked_transaction_id: txnId,
        return_date: input.date,
        reason: input.reason.slice(0, 255),
        notes: input.notes ? input.notes.slice(0, 255) : null,
        subtotal: input.subtotal,
        tax_total: input.taxTotal,
        total_return_amount: input.totalReturnAmount,
        created_by: user.id,
        created_by_name: user.name,
        created_at: now,
        linked_transaction_no: txnNoStr,
        items: items.map((it) => ({
          id: it.id,
          return_id: returnId,
          line_id: it.lineId,
          product_name: it.productName,
          price: it.price,
          original_qty: it.originalQty,
          return_qty: it.returnQty,
          subtotal: it.subtotal,
          tax_amount: it.taxAmount,
          total_amount: it.totalAmount,
        })),
      };
      d.returns = [...(d.returns || []), retRow];
      d.history = [
        ...(d.history || []),
        {
          id: historyId,
          document_id: input.documentId,
          old_status: input.documentStatus,
          new_status: input.documentStatus,
          reason: `Returned ${input.items.length} item(s) — ${provisionalNumber}`.slice(0, 255),
          changed_by: user.id,
          changed_at: now,
          changed_by_name: user.name,
        },
      ];
      d.updated_at = now;
      await commitLocal(d);

      // 2) queue the full operation (replayed on Supabase when online)
      await enqueue({
        kind: 'return',
        docId: input.documentId,
        returnId,
        provisionalNumber,
        txnId,
        txnNo: txnNoStr,
        historyId,
        documentRef: input.documentRef,
        documentStatus: input.documentStatus,
        customerName: input.customerName,
        customerCompany: input.customerCompany,
        date: input.date,
        reason: input.reason,
        notes: input.notes ?? null,
        subtotal: input.subtotal,
        taxTotal: input.taxTotal,
        totalReturnAmount: input.totalReturnAmount,
        userId: user.id,
        items,
      });

      return { ...retRow, linked_transaction_no: txnNoStr };
    });

    void syncNow();
    return result;
  },
};