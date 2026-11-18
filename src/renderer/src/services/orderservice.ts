/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCurrentBusinessId, supabase } from '../lib/supabaseClient';
import { productService } from './productService';
import { vendorsService } from './vendorService';
import { settingsService } from './settingsService';

// ============================================================
// TYPES (UI shape — same field names the OrdersPage uses)
// ============================================================
export type OrderStatus = 'Pending' | 'Received' | 'Cancelled';
export type PaymentStatus = 'Unpaid' | 'Partially Paid' | 'Paid';
export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Card' | 'Other';

export type PurchaseOrderItem = {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
};

export type PurchasePayment = {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  method: PaymentMethod;
  note?: string;
  balanceAfter: number;
  createdAt: string;
};

export type PurchaseOrder = {
  id: string;
  orderNumber: string; // ORD-0001
  vendorId: string;
  vendor: {
    uniqueId: string;
    name: string;
    companyName: string;
    phone: string;
    address: string;
    city: string;
  };
  orderDate: string; // YYYY-MM-DD
  status: OrderStatus;
  items: PurchaseOrderItem[];
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  balanceDue: number;
  payments: PurchasePayment[];
  createdBy: string; // display name ('' if not readable)
  createdAt: string;
};

export type StatusHistoryEntry = {
  id: string;
  orderId: string;
  oldStatus: OrderStatus | null;
  newStatus: OrderStatus;
  reason: string;
  changedBy: string; // display name ('' if not readable)
  changedAt: string;
};

export type MeasuringUnit = {
  id: string;
  name: string;
  label: string;
  isDefault: boolean;
};

export type CreateOrderInput = {
  vendorId: string;
  orderDate: string; // YYYY-MM-DD
  lines: { productId: string; quantity: number }[];
  /** optional advance paid to the vendor now (0 = pay later) */
  advanceAmount: number;
  advanceMethod: PaymentMethod;
  /** text stored in the status history (already translated by the page) */
  historyReason: string;
};

export type PaymentInput = {
  amount: number;
  method: PaymentMethod;
  note?: string;
};

export type OrderServiceErrorCode =
  | 'INVALID'
  | 'NOT_PENDING'
  | 'HAS_PAYMENTS'
  | 'NOT_PAYABLE'
  | 'AMOUNT_TOO_HIGH'
  | 'CHANGED'
  | 'ACCOUNTING';

/** Business-rule errors. The page maps `code` to a translated message. */
export class OrderServiceError extends Error {
  code: OrderServiceErrorCode;
  constructor(code: OrderServiceErrorCode, message?: string) {
    super(message || code);
    this.name = 'OrderServiceError';
    this.code = code;
    Object.setPrototypeOf(this, OrderServiceError.prototype);
  }
}

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
/** Background sync CHANGED local orders → page should re-read SQLite */
export const ORDERS_SYNCED_EVENT = 'zakhira:orders-synced';
/** Pushing/pulling failed for a reason other than "offline" */
export const ORDERS_SYNC_ERROR_EVENT = 'zakhira:orders-sync-error';

// ============================================================
// SMALL UTILITIES
// ============================================================
const BUSINESS_ID_KEY = 'zakhira_business_id';
const UNIT_CACHE_KEY = 'zakhira_measuring_units';
const DEFAULT_UNIT_KEY = 'zakhira_default_unit';
const QUEUE_TABLE = 'po_ops';
const PUSH_INTERVAL_MS = 5000;
const PULL_INTERVAL_MS = 20000;
const FK_RETRIES_BEFORE_REPORT = 6;
const PAGE = 1000;

const getBusinessId = async (): Promise<string> => {
  const cached = localStorage.getItem(BUSINESS_ID_KEY);
  if (cached) return cached;
  const id = (await getCurrentBusinessId()) as string;
  localStorage.setItem(BUSINESS_ID_KEY, id);
  return id;
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
  extra: { orderNumber?: string } = {}
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
  console.error('[OrderSync]', key, err);
  window.dispatchEvent(
    new CustomEvent(ORDERS_SYNC_ERROR_EVENT, {
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

// Money is calculated in whole cents (integers) so there are no
// floating point errors like 0.1 + 0.2 = 0.30000000000000004.
const toCents = (n: number): number => Math.round((Number(n) + Number.EPSILON) * 100);
const fromCents = (c: number): number => c / 100;

const todayISO = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getLocalUser = (): { id: string; name: string } => {
  try {
    const u = JSON.parse(localStorage.getItem('zakhira_user') || '{}');
    return {
      id: u.id || u._id || '',
      name: u.name || u.fullName || u.username || u.email || '',
    };
  } catch {
    return { id: '', name: '' };
  }
};

/** Only the current user's own name is readable (profiles RLS) */
const knownNames = (): Record<string, string> => {
  const me = getLocalUser();
  return me.id && me.name ? { [me.id]: me.name } : {};
};

// an embedded many-to-one relation can come back as object or [object]
const one = (v: any): any => (Array.isArray(v) ? v[0] : v) || null;

// Supabase returns max 1000 rows per request -> page through everything.
async function fetchAll(
  build: (
    from: number,
    to: number
  ) => PromiseLike<{ data: any[] | null; error: any }>
): Promise<any[]> {
  const rows: any[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await build(from, from + PAGE - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < PAGE) break;
  }
  return rows;
}

const genTxnNo = (): string =>
  `TXN-${Date.now()}${Math.floor(Math.random() * 90 + 10)}`; // max 19 chars (column is 20)

const orderNumberValue = (no: string): number => {
  const m = String(no || '').match(/^ORD-(\d+)$/);
  return m ? parseInt(m[1], 10) : 0;
};

const nextOrderNumberFrom = (numbers: string[]): string => {
  const max = numbers.reduce((m, n) => Math.max(m, orderNumberValue(n)), 0);
  return `ORD-${String(max + 1).padStart(4, '0')}`;
};

const ORDER_SELECT = `*,
  vendor:vendors(id, unique_id, name, company_name, phone, address, city),
  items:purchase_order_items(*),
  payments:purchase_payments(*)`;

// ============================================================
// LOCAL DB
// ============================================================
let tableReady: Promise<void> | null = null;

const ensureTables = (): Promise<void> => {
  if (!tableReady) {
    tableReady = (async () => {
      const db = api();
      await db.dbRun(
        `CREATE TABLE IF NOT EXISTS po_orders (
           id               TEXT PRIMARY KEY,
           business_id      TEXT NOT NULL,
           order_number     TEXT NOT NULL,
           vendor_id        TEXT NOT NULL,
           order_date       TEXT NOT NULL,
           status           TEXT NOT NULL,
           total_amount     REAL NOT NULL DEFAULT 0,
           payment_status   TEXT NOT NULL DEFAULT 'Unpaid',
           payment_amount   REAL NOT NULL DEFAULT 0,
           balance_due      REAL NOT NULL DEFAULT 0,
           created_by       TEXT,
           created_at       TEXT NOT NULL,
           vendor_unique_id TEXT,
           vendor_name      TEXT,
           vendor_company   TEXT,
           vendor_phone     TEXT,
           vendor_address   TEXT,
           vendor_city      TEXT
         )`
      );
      await db.dbRun(
        `CREATE INDEX IF NOT EXISTS idx_po_orders_business
           ON po_orders (business_id, created_at DESC)`
      );
      await db.dbRun(
        `CREATE TABLE IF NOT EXISTS po_items (
           id           TEXT PRIMARY KEY,
           order_id     TEXT NOT NULL,
           product_id   TEXT NOT NULL,
           sku          TEXT,
           product_name TEXT,
           quantity     INTEGER NOT NULL DEFAULT 0,
           unit         TEXT,
           unit_price   REAL NOT NULL DEFAULT 0,
           line_total   REAL NOT NULL DEFAULT 0
         )`
      );
      await db.dbRun(
        `CREATE INDEX IF NOT EXISTS idx_po_items_order ON po_items (order_id)`
      );
      await db.dbRun(
        `CREATE TABLE IF NOT EXISTS po_payments (
           id            TEXT PRIMARY KEY,
           order_id      TEXT NOT NULL,
           payment_date  TEXT NOT NULL,
           amount        REAL NOT NULL DEFAULT 0,
           method        TEXT NOT NULL,
           note          TEXT,
           balance_after REAL NOT NULL DEFAULT 0,
           recorded_by   TEXT,
           created_at    TEXT NOT NULL
         )`
      );
      await db.dbRun(
        `CREATE INDEX IF NOT EXISTS idx_po_payments_order ON po_payments (order_id)`
      );
      await db.dbRun(
        `CREATE TABLE IF NOT EXISTS po_history (
           id          TEXT PRIMARY KEY,
           order_id    TEXT NOT NULL,
           old_status  TEXT,
           new_status  TEXT NOT NULL,
           reason      TEXT,
           changed_by  TEXT,
           changed_at  TEXT NOT NULL
         )`
      );
      await db.dbRun(
        `CREATE INDEX IF NOT EXISTS idx_po_history_order ON po_history (order_id)`
      );
    })().catch((err) => {
      tableReady = null; // allow retry
      throw err;
    });
  }
  return tableReady;
};

// ---------- normalizers (SQLite row / Supabase row → one canonical shape) ----------
const orderRowFromRemote = (r: any, businessId: string): any => {
  const v = one(r.vendor) || {};
  const total = Number(r.total_amount) || 0;
  const paid = Number(r.payment_amount) || 0;
  const balance =
    r.balance_due === null || r.balance_due === undefined
      ? fromCents(Math.max(0, toCents(total) - toCents(paid)))
      : Number(r.balance_due) || 0;
  return {
    id: String(r.id),
    business_id: String(r.business_id ?? businessId),
    order_number: String(r.order_number),
    vendor_id: String(r.vendor_id),
    order_date: String(r.order_date || '').slice(0, 10),
    status: String(r.status),
    total_amount: total,
    payment_status: String(r.payment_status),
    payment_amount: paid,
    balance_due: balance,
    created_by: r.created_by ? String(r.created_by) : '',
    created_at: String(r.created_at),
    vendor_unique_id: v.unique_id || '',
    vendor_name: v.name || '',
    vendor_company: v.company_name || '',
    vendor_phone: v.phone || '',
    vendor_address: v.address || '',
    vendor_city: v.city || '',
  };
};

const itemRowFromRemote = (it: any): any => ({
  id: String(it.id),
  order_id: String(it.order_id),
  product_id: String(it.product_id),
  sku: it.sku || '',
  product_name: it.product_name || '',
  quantity: Number(it.quantity) || 0,
  unit: it.unit || 'piece',
  unit_price: Number(it.unit_price) || 0,
  line_total: Number(it.line_total) || 0,
});

const paymentRowFromRemote = (p: any): any => ({
  id: String(p.id),
  order_id: String(p.order_id),
  payment_date: String(p.payment_date || '').slice(0, 10),
  amount: Number(p.amount) || 0,
  method: String(p.method),
  note: p.note || null,
  balance_after: Number(p.balance_after) || 0,
  recorded_by: p.recorded_by ? String(p.recorded_by) : '',
  created_at: String(p.created_at),
});

const mapPayment = (p: any): PurchasePayment => ({
  id: p.id,
  date: String(p.payment_date || '').slice(0, 10),
  amount: Number(p.amount) || 0,
  method: p.method as PaymentMethod,
  note: p.note || undefined,
  balanceAfter: Number(p.balance_after) || 0,
  createdAt: String(p.created_at),
});

/** works for SQLite rows AND normalized remote rows (same column names) */
const mapOrderRows = (
  o: any,
  items: any[],
  pays: any[],
  names: Record<string, string>
): PurchaseOrder => ({
  id: o.id,
  orderNumber: o.order_number,
  vendorId: o.vendor_id,
  vendor: {
    uniqueId: o.vendor_unique_id || '',
    name: o.vendor_name || '',
    companyName: o.vendor_company || '',
    phone: o.vendor_phone || '',
    address: o.vendor_address || '',
    city: o.vendor_city || '',
  },
  orderDate: String(o.order_date || '').slice(0, 10),
  status: o.status as OrderStatus,
  items: items.map(
    (it: any): PurchaseOrderItem => ({
      id: it.id,
      productId: it.product_id,
      sku: it.sku || '',
      productName: it.product_name || '',
      quantity: Number(it.quantity) || 0,
      unit: it.unit || 'piece',
      unitPrice: Number(it.unit_price) || 0,
      lineTotal: Number(it.line_total) || 0,
    })
  ),
  totalAmount: Number(o.total_amount) || 0,
  paymentStatus: o.payment_status as PaymentStatus,
  paymentAmount: Number(o.payment_amount) || 0,
  balanceDue: Number(o.balance_due) || 0,
  payments: pays
    .map(mapPayment)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  createdBy: names[o.created_by] || '',
  createdAt: String(o.created_at),
});

/** what matters for "did it change?" (timestamp formats differ SQLite vs Postgres) */
const orderSig = (o: PurchaseOrder): string =>
  JSON.stringify([
    o.orderNumber,
    o.vendorId,
    o.orderDate,
    o.status,
    o.totalAmount,
    o.paymentStatus,
    o.paymentAmount,
    o.balanceDue,
    o.vendor.uniqueId,
    o.vendor.name,
    o.vendor.companyName,
    o.vendor.phone,
    o.vendor.address,
    o.vendor.city,
    o.items
      .map((i) => [i.id, i.productId, i.sku, i.productName, i.quantity, i.unit, i.unitPrice, i.lineTotal])
      .sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
    o.payments
      .map((p) => [p.id, p.date, p.amount, p.method, p.note || '', p.balanceAfter])
      .sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
  ]);

/** Exactly the columns of the Supabase `purchase_orders` table */
const toOrderPayload = (r: any): Record<string, unknown> => ({
  id: r.id,
  business_id: r.business_id,
  order_number: r.order_number,
  vendor_id: r.vendor_id,
  order_date: r.order_date,
  status: r.status,
  total_amount: Number(r.total_amount) || 0,
  payment_status: r.payment_status,
  payment_amount: Number(r.payment_amount) || 0,
  balance_due: Number(r.balance_due) || 0,
  created_by: r.created_by,
  created_at: r.created_at,
});

/** Exactly the columns of the Supabase `products` table (used when stock changes) */
const toProductPayload = (r: any): Record<string, unknown> => ({
  id: r.id,
  business_id: r.business_id,
  sku: r.sku,
  name: r.name,
  description: r.description ?? '',
  price: Number(r.price) || 0,
  cost_price: Number(r.cost_price) || 0,
  stock: Number(r.stock) || 0,
  low_stock_level: Number(r.low_stock_level) || 0,
  active: r.active === true || r.active === 1,
  unit_id: r.unit_id,
  category_id: r.category_id ?? null,
  created_at: r.created_at,
  updated_at: r.updated_at,
});

// ---------- local reads / writes ----------
const readOrders = async (businessId: string): Promise<PurchaseOrder[]> => {
  const db = api();
  const [orders, items, payments] = await Promise.all([
    db.dbQuery<any>(
      `SELECT * FROM po_orders WHERE business_id = ? ORDER BY created_at DESC`,
      [businessId]
    ),
    db.dbQuery<any>(
      `SELECT i.* FROM po_items i
         JOIN po_orders o ON o.id = i.order_id
        WHERE o.business_id = ? ORDER BY i.rowid`,
      [businessId]
    ),
    db.dbQuery<any>(
      `SELECT p.* FROM po_payments p
         JOIN po_orders o ON o.id = p.order_id
        WHERE o.business_id = ? ORDER BY p.rowid`,
      [businessId]
    ),
  ]);

  const itemsBy = new Map<string, any[]>();
  items.forEach((it) => {
    const arr = itemsBy.get(it.order_id) ?? [];
    arr.push(it);
    itemsBy.set(it.order_id, arr);
  });
  const paysBy = new Map<string, any[]>();
  payments.forEach((p) => {
    const arr = paysBy.get(p.order_id) ?? [];
    arr.push(p);
    paysBy.set(p.order_id, arr);
  });

  const names = knownNames();
  return orders.map((o) =>
    mapOrderRows(o, itemsBy.get(o.id) ?? [], paysBy.get(o.id) ?? [], names)
  );
};

const readOrderById = async (id: string): Promise<PurchaseOrder | null> => {
  const db = api();
  const orders = await db.dbQuery<any>(`SELECT * FROM po_orders WHERE id = ?`, [id]);
  if (!orders[0]) return null;
  const [items, pays] = await Promise.all([
    db.dbQuery<any>(`SELECT * FROM po_items WHERE order_id = ? ORDER BY rowid`, [id]),
    db.dbQuery<any>(`SELECT * FROM po_payments WHERE order_id = ? ORDER BY rowid`, [id]),
  ]);
  return mapOrderRows(orders[0], items, pays, knownNames());
};

const writeOrderBundle = async (
  order: any,
  items: any[],
  payments: any[]
): Promise<void> => {
  const db = api();
  await db.dbRun(
    `INSERT INTO po_orders
       (id, business_id, order_number, vendor_id, order_date, status, total_amount,
        payment_status, payment_amount, balance_due, created_by, created_at,
        vendor_unique_id, vendor_name, vendor_company, vendor_phone, vendor_address, vendor_city)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       business_id = excluded.business_id,
       order_number = excluded.order_number,
       vendor_id = excluded.vendor_id,
       order_date = excluded.order_date,
       status = excluded.status,
       total_amount = excluded.total_amount,
       payment_status = excluded.payment_status,
       payment_amount = excluded.payment_amount,
       balance_due = excluded.balance_due,
       created_by = excluded.created_by,
       created_at = excluded.created_at,
       vendor_unique_id = excluded.vendor_unique_id,
       vendor_name = excluded.vendor_name,
       vendor_company = excluded.vendor_company,
       vendor_phone = excluded.vendor_phone,
       vendor_address = excluded.vendor_address,
       vendor_city = excluded.vendor_city`,
    [
      order.id,
      order.business_id,
      order.order_number,
      order.vendor_id,
      order.order_date,
      order.status,
      order.total_amount,
      order.payment_status,
      order.payment_amount,
      order.balance_due,
      order.created_by,
      order.created_at,
      order.vendor_unique_id,
      order.vendor_name,
      order.vendor_company,
      order.vendor_phone,
      order.vendor_address,
      order.vendor_city,
    ]
  );

  await db.dbRun(`DELETE FROM po_items WHERE order_id = ?`, [order.id]);
  for (const it of items) {
    await db.dbRun(
      `INSERT INTO po_items
         (id, order_id, product_id, sku, product_name, quantity, unit, unit_price, line_total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        it.id,
        it.order_id,
        it.product_id,
        it.sku,
        it.product_name,
        it.quantity,
        it.unit,
        it.unit_price,
        it.line_total,
      ]
    );
  }

  await db.dbRun(`DELETE FROM po_payments WHERE order_id = ?`, [order.id]);
  for (const p of payments) {
    await db.dbRun(
      `INSERT INTO po_payments
         (id, order_id, payment_date, amount, method, note, balance_after, recorded_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id,
        p.order_id,
        p.payment_date,
        p.amount,
        p.method,
        p.note,
        p.balance_after,
        p.recorded_by,
        p.created_at,
      ]
    );
  }
};

const insertHistoryLocal = async (h: any): Promise<void> => {
  await api().dbRun(
    `INSERT INTO po_history (id, order_id, old_status, new_status, reason, changed_by, changed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       old_status = excluded.old_status,
       new_status = excluded.new_status,
       reason = excluded.reason,
       changed_by = excluded.changed_by,
       changed_at = excluded.changed_at`,
    [h.id, h.order_id, h.old_status, h.new_status, h.reason, h.changed_by, h.changed_at]
  );
};

const buildHistory = (args: {
  orderId: string;
  oldStatus: OrderStatus | null;
  newStatus: OrderStatus;
  reason: string;
  userId: string;
}): any => ({
  id: crypto.randomUUID(),
  order_id: args.orderId,
  old_status: args.oldStatus,
  new_status: args.newStatus,
  reason: (args.reason || '').slice(0, 255),
  changed_by: args.userId,
  changed_at: new Date().toISOString(),
});

/** Every vendor payment creates ONE 'Out' accounting entry linked to the order. */
const buildAccounting = (args: {
  businessId: string;
  orderId: string;
  orderNumber: string;
  vendorName: string;
  vendorCompany: string;
  paymentId: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  balanceAfter: number;
  note?: string;
}): Record<string, unknown> => ({
  business_id: args.businessId,
  transaction_no: genTxnNo(),
  txn_date: args.date,
  customer_name: args.vendorName || args.vendorCompany || '—',
  company_name: args.vendorCompany || null,
  invoice_ref: args.orderNumber,
  type: 'Out',
  amount: args.amount,
  status: args.balanceAfter > 0 ? 'Partially Paid' : 'Paid',
  mode: args.method,
  source_module: 'inventory',
  purchase_order_id: args.orderId,
  purchase_payment_id: args.paymentId,
  notes: `Payment made for Purchase Order ${args.orderNumber} (Balance after: ${args.balanceAfter})${
    args.note ? ` — ${args.note}` : ''
  }`,
});

/** ids of orders that still have unsent local operations */
const pendingOrderIds = async (): Promise<Set<string>> => {
  const queued = await api().dbQuery<{ payload: string }>(
    `SELECT payload FROM sync_queue WHERE table_name = ?`,
    [QUEUE_TABLE]
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
let ordersCache: PurchaseOrder[] | null = null;

// ============================================================
// SYNC — PUSH (local operations → Supabase), replayed in order
// ============================================================
type QueueRow = { id: number; action: SyncAction; payload: string };

let pullRequested = false;
let pushTouchedLocal = false;

const nextFreeOrderNumber = async (businessId: string): Promise<string> => {
  const rows = await fetchAll((from, to) =>
    supabase
      .from('purchase_orders')
      .select('id, order_number')
      .eq('business_id', businessId)
      .order('id')
      .range(from, to)
  );
  const local = await api().dbQuery<{ order_number: string }>(
    `SELECT order_number FROM po_orders WHERE business_id = ?`,
    [businessId]
  );
  return nextOrderNumberFrom([
    ...rows.map((r) => r.order_number as string),
    ...local.map((r) => r.order_number),
  ]);
};

/** audit log only — a failure here must never block the real action */
const pushHistory = async (h: any): Promise<void> => {
  if (!h) return;
  const { error } = await supabase.from('purchase_order_status_history').upsert(
    [
      {
        id: h.id,
        order_id: h.order_id,
        old_status: h.old_status,
        new_status: h.new_status,
        reason: h.reason || null,
        changed_by: h.changed_by,
        changed_at: h.changed_at,
      },
    ],
    { onConflict: 'id' }
  );
  if (error) {
    if (isNetworkError(error)) throw error;
    console.error('Status history save error:', error);
  }
};

const pushAccounting = async (acc: any): Promise<void> => {
  if (!acc) return;
  const exists = await supabase
    .from('accounting_transactions')
    .select('id')
    .eq('purchase_payment_id', acc.purchase_payment_id)
    .limit(1);
  if (exists.error) throw exists.error;
  if ((exists.data ?? []).length > 0) return; // already created (retry)

  let row = { ...acc };
  let { error } = await supabase.from('accounting_transactions').insert([row]);
  if (error && isUniqueViolation(error, 'transaction_no')) {
    row = { ...row, transaction_no: genTxnNo() };
    ({ error } = await supabase.from('accounting_transactions').insert([row]));
  }
  if (error) throw error;
};

const renumberLocal = async (
  orderId: string,
  oldNo: string,
  newNo: string
): Promise<void> => {
  await withLock(async () => {
    await api().dbRun(`UPDATE po_orders SET order_number = ? WHERE id = ?`, [newNo, orderId]);
    await api().dbRun(
      `UPDATE sync_queue SET payload = REPLACE(payload, ?, ?)
        WHERE table_name = ? AND payload LIKE ?`,
      [oldNo, newNo, QUEUE_TABLE, `%"id":"${orderId}"%`]
    );
  });
  pushTouchedLocal = true;
};

const pushCreate = async (p: any): Promise<void> => {
  const order: Record<string, any> = { ...p.order };
  const insertOrder = () => supabase.from('purchase_orders').insert([order]);

  let { error } = await insertOrder();

  // another device already used this number → take the next free one
  if (error && isUniqueViolation(error, 'order_number')) {
    const oldNo = String(order.order_number);
    const newNo = await nextFreeOrderNumber(String(order.business_id));
    order.order_number = newNo;
    ({ error } = await insertOrder());
    if (!error) {
      await renumberLocal(String(order.id), oldNo, newNo);
      if (p.accounting) {
        p.accounting = JSON.parse(JSON.stringify(p.accounting).split(oldNo).join(newNo));
      }
    }
  }
  // order already there (a previous attempt got this far) → continue with the rest
  if (error && !(errCode(error) === '23505' && String(error.message).includes('pkey'))) {
    throw error;
  }

  if ((p.items ?? []).length > 0) {
    const ins = await supabase
      .from('purchase_order_items')
      .upsert(p.items, { onConflict: 'id' });
    if (ins.error) throw ins.error;
  }

  if (p.payment) {
    const pay = await supabase
      .from('purchase_payments')
      .upsert([p.payment], { onConflict: 'id' });
    if (pay.error) throw pay.error;
    await pushAccounting(p.accounting);
  }

  await pushHistory(p.history);
};

const pushReceive = async (p: any): Promise<void> => {
  const { data: claimed, error } = await supabase
    .from('purchase_orders')
    .update({ status: 'Received' })
    .eq('id', p.id)
    .eq('status', 'Pending')
    .select('id');
  if (error) throw error;

  if (!claimed || claimed.length === 0) {
    const cur = await supabase
      .from('purchase_orders')
      .select('status')
      .eq('id', p.id)
      .maybeSingle();
    if (cur.error) throw cur.error;
    if (cur.data?.status !== 'Received') throw new OrderServiceError('NOT_PENDING');
  }

  if ((p.movements ?? []).length > 0) {
    const mv = await supabase
      .from('stock_movements')
      .upsert(p.movements, { onConflict: 'id' });
    if (mv.error) throw mv.error;
  }

  await pushHistory(p.history);
};

const pushCancel = async (p: any): Promise<void> => {
  const { data: upd, error } = await supabase
    .from('purchase_orders')
    .update({ status: 'Cancelled' })
    .eq('id', p.id)
    .eq('status', 'Pending')
    .eq('payment_amount', 0)
    .select('id');
  if (error) throw error;

  if (!upd || upd.length === 0) {
    const cur = await supabase
      .from('purchase_orders')
      .select('status')
      .eq('id', p.id)
      .maybeSingle();
    if (cur.error) throw cur.error;
    if (cur.data?.status !== 'Cancelled') throw new OrderServiceError('CHANGED');
  }

  await pushHistory(p.history);
};

const pushPay = async (p: any): Promise<void> => {
  const pay = p.payment;

  const up = await supabase.from('purchase_payments').upsert([pay], { onConflict: 'id' });
  if (up.error) throw up.error;

  const { data: ord, error } = await supabase
    .from('purchase_orders')
    .select('id, total_amount, payment_amount, balance_due')
    .eq('id', p.id)
    .single();
  if (error) throw error;

  const totalC = toCents(ord.total_amount);
  const paidC = toCents(ord.payment_amount);
  const balC = totalC - paidC;

  // not applied to the order yet (a retry of an applied payment is skipped)
  if (balC > toCents(pay.balance_after)) {
    const newPaidC = Math.min(totalC, paidC + toCents(pay.amount));
    const newBalC = totalC - newPaidC;
    const status: PaymentStatus = newBalC <= 0 ? 'Paid' : 'Partially Paid';
    const upd = await supabase
      .from('purchase_orders')
      .update({
        payment_amount: fromCents(newPaidC),
        balance_due: fromCents(newBalC),
        payment_status: status,
      })
      .eq('id', p.id);
    if (upd.error) throw upd.error;
  }

  await pushAccounting(p.accounting);
};

const pushOp = async (p: any): Promise<void> => {
  switch (p.op) {
    case 'create':
      return pushCreate(p);
    case 'receive':
      return pushReceive(p);
    case 'cancel':
      return pushCancel(p);
    case 'pay':
      return pushPay(p);
    default:
      return; // unknown op → drop
  }
};

/**
 * Replays queued operations on the server, strictly in the order they happened.
 *  - Offline → throws a network error (cycle stops, retried later).
 *  - If one operation of an order fails, the LATER operations of that same
 *    order wait (order matters) but other orders still sync.
 *  - A missing vendor/product on the server (not synced yet) is retried
 *    quietly and only reported if it keeps failing.
 */
const fkFailures = new Map<number, number>();

const pushQueue = async (): Promise<void> => {
  const rows = await api().dbQuery<QueueRow>(
    `SELECT id, action, payload FROM sync_queue
      WHERE table_name = ? ORDER BY id ASC`,
    [QUEUE_TABLE]
  );

  if (rows.length === 0) {
    reportedErrors.clear();
    fkFailures.clear();
    return;
  }

  const blocked = new Set<string>();

  for (const r of rows) {
    let payload: Record<string, any>;
    try {
      payload = JSON.parse(r.payload) as Record<string, any>;
    } catch {
      await api().dbRun(`DELETE FROM sync_queue WHERE id = ?`, [r.id]);
      continue;
    }
    const oid = payload?.id ? String(payload.id) : '';
    if (!oid) {
      await api().dbRun(`DELETE FROM sync_queue WHERE id = ?`, [r.id]);
      continue;
    }
    if (blocked.has(oid)) continue;

    try {
      await pushOp(payload);
      await api().dbRun(`DELETE FROM sync_queue WHERE id = ?`, [r.id]);
      fkFailures.delete(r.id);
    } catch (err) {
      if (isNetworkError(err)) throw err; // offline → stop, retry later
      blocked.add(oid);

      // vendor / product not on the server yet → push them first, retry quietly
      if (errCode(err) === '23503') {
        const n = (fkFailures.get(r.id) ?? 0) + 1;
        fkFailures.set(r.id, n);
        if (n < FK_RETRIES_BEFORE_REPORT) {
          void Promise.allSettled([vendorsService.syncNow(), productService.syncNow()]);
          continue;
        }
      }

      // the order was changed by someone else → this operation can never apply
      const code = errCode(err);
      if (code === 'NOT_PENDING' || code === 'CHANGED') {
        await api().dbRun(`DELETE FROM sync_queue WHERE id = ?`, [r.id]);
        pullRequested = true; // bring the real state back locally
        blocked.delete(oid);
        reportSyncError(`conflict ${r.id}`, err, {
          orderNumber: String(payload.order_number || payload.order?.order_number || ''),
        });
        continue;
      }

      reportSyncError(`push ${payload.op} ${oid}`, err, {
        orderNumber: String(payload.order_number || payload.order?.order_number || ''),
      });
    }
  }

  if (pushTouchedLocal) {
    pushTouchedLocal = false;
    ordersCache = null;
    window.dispatchEvent(new Event(ORDERS_SYNCED_EVENT));
  }
};

// ============================================================
// SYNC — PULL (Supabase → local SQLite)
// ============================================================
/**
 * Downloads all orders (with vendor, items, payments) and applies them
 * locally, EXCEPT orders that still have unsent local operations.
 */
const pullRemote = async (): Promise<void> => {
  const businessId = await getBusinessId();

  const rows = await fetchAll((from, to) =>
    supabase
      .from('purchase_orders')
      .select(ORDER_SELECT)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .order('id')
      .range(from, to)
  );

  const remote = rows.map((r) => ({
    order: orderRowFromRemote(r, businessId),
    items: ((r.items as any[]) || []).map(itemRowFromRemote),
    payments: ((r.payments as any[]) || []).map(paymentRowFromRemote),
  }));

  const changed = await withLock(async () => {
    const pending = await pendingOrderIds();
    const local = await readOrders(businessId);
    const localSig = new Map(local.map((o) => [o.id, orderSig(o)]));
    const names = knownNames();
    const remoteIds = new Set<string>();
    let didChange = false;

    for (const b of remote) {
      remoteIds.add(b.order.id);
      if (pending.has(b.order.id)) continue;
      const model = mapOrderRows(b.order, b.items, b.payments, names);
      if (localSig.get(b.order.id) !== orderSig(model)) {
        await writeOrderBundle(b.order, b.items, b.payments);
        didChange = true;
      }
    }

    for (const l of local) {
      if (!remoteIds.has(l.id) && !pending.has(l.id)) {
        await api().dbRun(`DELETE FROM po_items WHERE order_id = ?`, [l.id]);
        await api().dbRun(`DELETE FROM po_payments WHERE order_id = ?`, [l.id]);
        await api().dbRun(`DELETE FROM po_history WHERE order_id = ?`, [l.id]);
        await api().dbRun(`DELETE FROM po_orders WHERE id = ?`, [l.id]);
        didChange = true;
      }
    }

    // keep the instant-paint snapshot fresh even when the page is not open
    if (didChange) ordersCache = await readOrders(businessId);
    return didChange;
  });

  if (changed) window.dispatchEvent(new Event(ORDERS_SYNCED_EVENT));
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
export const orderService = {
  // ------------------------------------------------------------
  // sync control
  // ------------------------------------------------------------
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
  getCachedOrders(): PurchaseOrder[] | null {
    return ordersCache;
  },

  // ----------------------------------------------------------
  // All purchase orders — ALWAYS local SQLite (instant, works offline)
  // ----------------------------------------------------------
  async getOrders(): Promise<PurchaseOrder[]> {
    await ensureTables();
    const businessId = await getBusinessId();
    const list = await readOrders(businessId);
    ordersCache = list;
    return list;
  },

  // ----------------------------------------------------------
  // Status history of one order (oldest first).
  // Local first; when online, history written on other devices is merged in
  // (with a 4s timeout so a slow network never blocks the modal).
  // ----------------------------------------------------------
  async getStatusHistory(orderId: string): Promise<StatusHistoryEntry[]> {
    await ensureTables();

    if (typeof navigator === 'undefined' || navigator.onLine) {
      try {
        const result = (await Promise.race([
          supabase
            .from('purchase_order_status_history')
            .select('*')
            .eq('order_id', orderId)
            .order('changed_at', { ascending: true }),
          new Promise<never>((_, rej) =>
            setTimeout(() => rej(new Error('timeout')), 4000)
          ),
        ])) as { data: any[] | null; error: any };

        if (!result.error) {
          await withLock(async () => {
            for (const h of (result.data ?? []) as any[]) {
              await insertHistoryLocal({
                id: h.id,
                order_id: h.order_id,
                old_status: h.old_status ?? null,
                new_status: h.new_status,
                reason: h.reason || '',
                changed_by: h.changed_by || '',
                changed_at: String(h.changed_at),
              });
            }
          });
        }
      } catch {
        /* offline / slow / not allowed → local history is enough */
      }
    }

    const rows = await api().dbQuery<any>(
      `SELECT * FROM po_history WHERE order_id = ? ORDER BY changed_at ASC`,
      [orderId]
    );
    const names = knownNames();
    return rows.map(
      (h: any): StatusHistoryEntry => ({
        id: h.id,
        orderId: h.order_id,
        oldStatus: (h.old_status as OrderStatus) || null,
        newStatus: h.new_status as OrderStatus,
        reason: h.reason || '',
        changedBy: names[h.changed_by] || '',
        changedAt: h.changed_at,
      })
    );
  },

  // ----------------------------------------------------------
  // The number the next order will get (shown in the form).
  // The real number is assigned again when the order is saved.
  // ----------------------------------------------------------
  async getNextOrderNumber(): Promise<string> {
    await ensureTables();
    const businessId = await getBusinessId();
    const rows = await api().dbQuery<{ order_number: string }>(
      `SELECT order_number FROM po_orders WHERE business_id = ?`,
      [businessId]
    );
    return nextOrderNumberFrom(rows.map((r) => r.order_number));
  },

  // ----------------------------------------------------------
  // Measuring units — CACHE FIRST (instant, works offline).
  // The cache is refreshed in the background when online.
  // ----------------------------------------------------------
  async getMeasuringUnits(): Promise<MeasuringUnit[]> {
    let list: { id: string; name: string; label?: string }[] = [];
    try {
      const raw = JSON.parse(localStorage.getItem(UNIT_CACHE_KEY) || '[]');
      if (Array.isArray(raw)) list = raw;
    } catch {
      /* ignore */
    }

    const refresh = async (): Promise<any[] | null> => {
      try {
        const fresh = (await Promise.race([
          settingsService.getUnits(),
          new Promise<never>((_, rej) =>
            setTimeout(() => rej(new Error('timeout')), 4000)
          ),
        ])) as any[];
        if (Array.isArray(fresh) && fresh.length > 0) {
          localStorage.setItem(
            UNIT_CACHE_KEY,
            JSON.stringify(
              fresh.map((u) => ({ id: u.id, name: u.name, label: u.label }))
            )
          );
          return fresh;
        }
      } catch {
        /* offline / slow → the cache is enough */
      }
      return null;
    };

    if (
      list.length === 0 &&
      (typeof navigator === 'undefined' || navigator.onLine)
    ) {
      const fresh = await refresh(); // first launch only
      if (fresh) list = fresh;
    } else if (typeof navigator === 'undefined' || navigator.onLine) {
      void refresh(); // update the cache in the background
    }

    const defaultId = localStorage.getItem(DEFAULT_UNIT_KEY) || '';
    return list.map(
      (u): MeasuringUnit => ({
        id: u.id,
        name: u.name,
        label: u.label || u.name,
        isDefault: u.id === defaultId,
      })
    );
  },

  // ----------------------------------------------------------
  // PLACE ORDER — saved locally first (instant, offline OK), pushed later
  //  - prices / names / units are read from local data (not trusted from UI)
  //  - totals are calculated in cents
  //  - optional advance payment -> payment row + accounting 'Out' entry
  // ----------------------------------------------------------
  async createOrder(input: CreateOrderInput): Promise<PurchaseOrder> {
    await ensureTables();
    const businessId = await getBusinessId();
    const user = getLocalUser();
    if (!user.id) throw new Error('User not logged in');

    // ---- validate lines ----
    const lines = input.lines.filter((l) => l.productId);
    if (lines.length === 0) throw new OrderServiceError('INVALID', 'No products');
    const seen = new Set<string>();
    for (const l of lines) {
      if (!Number.isInteger(l.quantity) || l.quantity <= 0) {
        throw new OrderServiceError('INVALID', 'Quantity must be a whole number > 0');
      }
      if (seen.has(l.productId)) {
        throw new OrderServiceError('INVALID', 'Duplicate product in order');
      }
      seen.add(l.productId);
    }
    if (!input.orderDate) throw new OrderServiceError('INVALID', 'Order date is required');
    if (!(input.advanceAmount >= 0)) {
      throw new OrderServiceError('INVALID', 'Advance amount cannot be negative');
    }

    // ---- vendor / products / units (all local) ----
    const [vendors, prods, units] = await Promise.all([
      vendorsService.getVendors(),
      productService.getProducts(),
      orderService.getMeasuringUnits(),
    ]);
    const vendor = vendors.find((v) => v.id === input.vendorId);
    if (!vendor) throw new OrderServiceError('INVALID', 'Vendor not found');
    if (!vendor.active) throw new OrderServiceError('INVALID', 'Vendor is not active');
    const byId = new Map(prods.map((p) => [p.id, p]));

    // ---- money (cents) ----
    let totalCents = 0;
    const itemDrafts = lines.map((l) => {
      const p = byId.get(l.productId);
      if (!p) throw new OrderServiceError('INVALID', 'Product not found');
      // NOTE: unit price used for a purchase order. Change this one line to
      // use cost_price if you want orders priced by purchase cost.
      const unitPriceCents = toCents(p.price);
      const lineCents = unitPriceCents * l.quantity;
      totalCents += lineCents;
      const u = units.find((x) => x.id === p.unit_id);
      return {
        product_id: p.id,
        sku: String(p.sku || '').slice(0, 30),
        product_name: String(p.name || '').slice(0, 150),
        quantity: l.quantity,
        unit: String(u?.label || u?.name || 'piece').slice(0, 40),
        unit_price: fromCents(unitPriceCents),
        line_total: fromCents(lineCents),
      };
    });

    const paidCents = Math.min(totalCents, toCents(input.advanceAmount));
    const balanceCents = totalCents - paidCents;
    const paymentStatus: PaymentStatus =
      balanceCents <= 0 ? 'Paid' : paidCents > 0 ? 'Partially Paid' : 'Unpaid';

    const orderId = await withLock(async () => {
      // number is generated INSIDE the lock → two quick saves never collide
      const existing = await api().dbQuery<{ order_number: string }>(
        `SELECT order_number FROM po_orders WHERE business_id = ?`,
        [businessId]
      );
      const orderNumber = nextOrderNumberFrom(existing.map((r) => r.order_number));
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      const orderRow = {
        id,
        business_id: businessId,
        order_number: orderNumber,
        vendor_id: vendor.id,
        order_date: input.orderDate,
        status: 'Pending',
        total_amount: fromCents(totalCents),
        payment_status: paymentStatus,
        payment_amount: fromCents(paidCents),
        balance_due: fromCents(balanceCents),
        created_by: user.id,
        created_at: now,
        vendor_unique_id: vendor.uniqueId,
        vendor_name: vendor.name,
        vendor_company: vendor.companyName,
        vendor_phone: vendor.phone,
        vendor_address: vendor.address,
        vendor_city: vendor.city,
      };

      const itemRows = itemDrafts.map((d) => ({
        id: crypto.randomUUID(),
        order_id: id,
        ...d,
      }));

      let payRow: any = null;
      let accounting: Record<string, unknown> | null = null;
      if (paidCents > 0) {
        const date = todayISO();
        payRow = {
          id: crypto.randomUUID(),
          order_id: id,
          payment_date: date,
          amount: fromCents(paidCents),
          method: input.advanceMethod,
          note: null,
          balance_after: fromCents(balanceCents),
          recorded_by: user.id,
          created_at: now,
        };
        accounting = buildAccounting({
          businessId,
          orderId: id,
          orderNumber,
          vendorName: vendor.name,
          vendorCompany: vendor.companyName,
          paymentId: payRow.id,
          date,
          amount: fromCents(paidCents),
          method: input.advanceMethod,
          balanceAfter: fromCents(balanceCents),
        });
      }

      const history = buildHistory({
        orderId: id,
        oldStatus: null,
        newStatus: 'Pending',
        reason: input.historyReason,
        userId: user.id,
      });

      await writeOrderBundle(orderRow, itemRows, payRow ? [payRow] : []);
      await insertHistoryLocal(history);
      await api().addToSyncQueue(QUEUE_TABLE, 'INSERT', {
        id,
        op: 'create',
        order_number: orderNumber,
        order: toOrderPayload(orderRow),
        items: itemRows,
        payment: payRow,
        accounting,
        history,
      });
      return id;
    });

    ordersCache = null;
    void syncNow();
    const created = await readOrderById(orderId);
    if (!created) throw new Error('Order could not be saved');
    return created;
  },

  // ----------------------------------------------------------
  // MARK AS RECEIVED  (Pending -> Received)
  //  - local status + product stock change instantly
  //  - the stock change goes through the products queue (like a product edit)
  //  - one stock_movement per item is sent with the receive operation
  // ----------------------------------------------------------
  async receiveOrder(orderId: string, historyReason: string): Promise<void> {
    await ensureTables();
    await productService.getProducts(); // makes sure the local products table exists
    const user = getLocalUser();
    if (!user.id) throw new Error('User not logged in');

    await withLock(async () => {
      const db = api();
      const found = await db.dbQuery<any>(`SELECT * FROM po_orders WHERE id = ?`, [orderId]);
      const order = found[0];
      if (!order) throw new Error('Order not found');
      if (order.status !== 'Pending') throw new OrderServiceError('NOT_PENDING');

      const items = await db.dbQuery<any>(
        `SELECT * FROM po_items WHERE order_id = ?`,
        [orderId]
      );

      const date = todayISO();
      const now = new Date().toISOString();
      const movements: Record<string, unknown>[] = [];

      for (const it of items) {
        const qty = Number(it.quantity) || 0;
        if (qty <= 0) continue;

        // stock change + queue entry happen while the products lock is held,
        // so a background pull can never overwrite the new stock in between
        const moved = await productService.runExclusive(async () => {
          const prod = await db.dbQuery<any>(
            `SELECT * FROM products WHERE id = ?`,
            [it.product_id]
          );
          if (!prod[0]) return null; // product deleted locally
          const before = Number(prod[0].stock) || 0;
          const after = before + qty;

          await db.dbRun(
            `UPDATE products SET stock = ?, updated_at = ? WHERE id = ?`,
            [after, now, it.product_id]
          );
          await db.addToSyncQueue(
            'products',
            'UPDATE',
            toProductPayload({ ...prod[0], stock: after, updated_at: now })
          );
          return { before, after };
        });
        if (!moved) continue;

        movements.push({
          id: crypto.randomUUID(),
          business_id: order.business_id,
          product_id: it.product_id,
          movement_type: 'purchase',
          qty,
          before_qty: moved.before,
          after_qty: moved.after,
          reference: order.order_number,
          purchase_order_id: orderId,
          movement_date: date,
          created_by: user.id,
        });
      }

      await db.dbRun(`UPDATE po_orders SET status = 'Received' WHERE id = ?`, [orderId]);

      const history = buildHistory({
        orderId,
        oldStatus: 'Pending',
        newStatus: 'Received',
        reason: historyReason,
        userId: user.id,
      });
      await insertHistoryLocal(history);

      await db.addToSyncQueue(QUEUE_TABLE, 'UPDATE', {
        id: orderId,
        op: 'receive',
        order_number: order.order_number,
        movements,
        history,
      });
    });

    ordersCache = null;
    productService.invalidateCache(); // Products page must not show the old stock
    void syncNow();
    void productService.syncNow();
  },

  // ----------------------------------------------------------
  // CANCEL  (only Pending orders with NO payments)
  // ----------------------------------------------------------
  async cancelOrder(orderId: string, historyReason: string): Promise<void> {
    await ensureTables();
    const user = getLocalUser();
    if (!user.id) throw new Error('User not logged in');

    await withLock(async () => {
      const db = api();
      const found = await db.dbQuery<any>(`SELECT * FROM po_orders WHERE id = ?`, [orderId]);
      const order = found[0];
      if (!order) throw new Error('Order not found');
      if (order.status !== 'Pending') throw new OrderServiceError('NOT_PENDING');
      if (toCents(order.payment_amount) > 0) throw new OrderServiceError('HAS_PAYMENTS');

      await db.dbRun(`UPDATE po_orders SET status = 'Cancelled' WHERE id = ?`, [orderId]);

      const history = buildHistory({
        orderId,
        oldStatus: 'Pending',
        newStatus: 'Cancelled',
        reason: historyReason,
        userId: user.id,
      });
      await insertHistoryLocal(history);

      await db.addToSyncQueue(QUEUE_TABLE, 'UPDATE', {
        id: orderId,
        op: 'cancel',
        order_number: order.order_number,
        history,
      });
    });

    ordersCache = null;
    void syncNow();
  },

  // ----------------------------------------------------------
  // ADD PAYMENT  (Pending = advance, Received = settle balance)
  //  - amount can never exceed the balance due
  //  - local order totals + payment row change instantly
  //  - creates purchase_payments row + accounting 'Out' entry (on sync)
  // ----------------------------------------------------------
  async addPayment(orderId: string, input: PaymentInput): Promise<void> {
    await ensureTables();
    const user = getLocalUser();
    if (!user.id) throw new Error('User not logged in');

    const amountCents = toCents(input.amount);
    if (!(amountCents > 0)) throw new OrderServiceError('INVALID', 'Amount is required');

    await withLock(async () => {
      const db = api();
      const found = await db.dbQuery<any>(`SELECT * FROM po_orders WHERE id = ?`, [orderId]);
      const order = found[0];
      if (!order) throw new Error('Order not found');
      if (order.status === 'Cancelled') throw new OrderServiceError('NOT_PAYABLE');

      const totalC = toCents(order.total_amount);
      const paidC = toCents(order.payment_amount);
      const balanceC = totalC - paidC;
      if (balanceC <= 0) throw new OrderServiceError('NOT_PAYABLE');
      if (amountCents > balanceC) throw new OrderServiceError('AMOUNT_TOO_HIGH');

      const newPaidC = paidC + amountCents;
      const newBalC = totalC - newPaidC;
      const status: PaymentStatus = newBalC <= 0 ? 'Paid' : 'Partially Paid';

      const date = todayISO();
      const note = input.note?.trim() || null;
      const now = new Date().toISOString();
      const payRow = {
        id: crypto.randomUUID(),
        order_id: orderId,
        payment_date: date,
        amount: fromCents(amountCents),
        method: input.method,
        note: note ? note.slice(0, 255) : null,
        balance_after: fromCents(newBalC),
        recorded_by: user.id,
        created_at: now,
      };

      await db.dbRun(
        `UPDATE po_orders SET payment_amount = ?, balance_due = ?, payment_status = ? WHERE id = ?`,
        [fromCents(newPaidC), fromCents(newBalC), status, orderId]
      );
      await db.dbRun(
        `INSERT INTO po_payments
           (id, order_id, payment_date, amount, method, note, balance_after, recorded_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          payRow.id,
          payRow.order_id,
          payRow.payment_date,
          payRow.amount,
          payRow.method,
          payRow.note,
          payRow.balance_after,
          payRow.recorded_by,
          payRow.created_at,
        ]
      );

      const accounting = buildAccounting({
        businessId: order.business_id,
        orderId,
        orderNumber: order.order_number,
        vendorName: order.vendor_name || '',
        vendorCompany: order.vendor_company || '',
        paymentId: payRow.id,
        date,
        amount: fromCents(amountCents),
        method: input.method,
        balanceAfter: fromCents(newBalC),
        note: note || undefined,
      });

      await db.addToSyncQueue(QUEUE_TABLE, 'UPDATE', {
        id: orderId,
        op: 'pay',
        order_number: order.order_number,
        payment: payRow,
        accounting,
      });
    });

    ordersCache = null;
    void syncNow();
  },
};