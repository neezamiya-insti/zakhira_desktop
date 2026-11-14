/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase, getCurrentBusinessId } from '../lib/supabaseClient';

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
  }
}

// ============================================================
// HELPERS
// ============================================================
const PAGE = 1000;

// Money is calculated in whole cents (integers) so there are no
// floating point errors like 0.1 + 0.2 = 0.30000000000000004.
const toCents = (n: number): number => Math.round((Number(n) + Number.EPSILON) * 100);
const fromCents = (c: number): number => c / 100;

const todayISO = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

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

// an embedded many-to-one relation can come back as object or [object]
const one = (v: any): any => (Array.isArray(v) ? v[0] : v) || null;

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

async function getUserId(): Promise<string> {
  const local = getLocalUser();
  if (local.id) return local.id;
  const { data } = await supabase.auth.getUser();
  if (data?.user?.id) return data.user.id;
  throw new Error('User not logged in');
}

// profiles RLS only lets a user read their own row, so other people's
// names may come back empty -> the page simply hides the name then.
async function loadProfileNames(ids: string[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  const me = getLocalUser();
  if (me.id && me.name) out[me.id] = me.name;

  const unique = Array.from(new Set(ids.filter(Boolean))).filter((id) => !out[id]);
  for (let i = 0; i < unique.length; i += 50) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', unique.slice(i, i + 50));
      (data || []).forEach((p: any) => {
        if (p?.id && p?.name) out[p.id] = p.name;
      });
    } catch {
      /* ignore — names are optional */
    }
  }
  return out;
}

const genTxnNo = (): string =>
  `TXN-${Date.now()}${Math.floor(Math.random() * 90 + 10)}`; // max 19 chars (column is 20)

const ORDER_SELECT = `*,
  vendor:vendors(id, unique_id, name, company_name, phone, address, city),
  items:purchase_order_items(*),
  payments:purchase_payments(*)`;

const mapPayment = (p: any): PurchasePayment => ({
  id: p.id,
  date: String(p.payment_date || '').slice(0, 10),
  amount: Number(p.amount) || 0,
  method: p.method as PaymentMethod,
  note: p.note || undefined,
  balanceAfter: Number(p.balance_after) || 0,
  createdAt: p.created_at,
});

const mapOrder = (row: any, names: Record<string, string>): PurchaseOrder => {
  const v = one(row.vendor) || {};
  const total = Number(row.total_amount) || 0;
  const paid = Number(row.payment_amount) || 0;
  const balance =
    row.balance_due === null || row.balance_due === undefined
      ? fromCents(Math.max(0, toCents(total) - toCents(paid)))
      : Number(row.balance_due) || 0;

  return {
    id: row.id,
    orderNumber: row.order_number,
    vendorId: row.vendor_id,
    vendor: {
      uniqueId: v.unique_id || '',
      name: v.name || '',
      companyName: v.company_name || '',
      phone: v.phone || '',
      address: v.address || '',
      city: v.city || '',
    },
    orderDate: String(row.order_date || '').slice(0, 10),
    status: row.status as OrderStatus,
    items: (row.items || []).map(
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
    totalAmount: total,
    paymentStatus: row.payment_status as PaymentStatus,
    paymentAmount: paid,
    balanceDue: balance,
    payments: (row.payments || [])
      .map(mapPayment)
      .sort((a: PurchasePayment, b: PurchasePayment) =>
        a.createdAt.localeCompare(b.createdAt)
      ),
    createdBy: names[row.created_by] || '',
    createdAt: row.created_at,
  };
};

// next "ORD-0001" for this business (max of existing numbers + 1)
async function nextOrderNumber(businessId: string): Promise<string> {
  const rows = await fetchAll((from, to) =>
    supabase
      .from('purchase_orders')
      .select('id, order_number')
      .eq('business_id', businessId)
      .order('id')
      .range(from, to)
  );
  let max = 0;
  for (const r of rows) {
    const m = String(r.order_number || '').match(/^ORD-(\d+)$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `ORD-${String(max + 1).padStart(4, '0')}`;
}

async function fetchOrder(businessId: string, id: string): Promise<PurchaseOrder> {
  const { data, error } = await supabase
    .from('purchase_orders')
    .select(ORDER_SELECT)
    .eq('id', id)
    .eq('business_id', businessId)
    .single();
  if (error) throw error;
  const names = await loadProfileNames([data.created_by]);
  return mapOrder(data, names);
}

// Every vendor payment creates ONE 'Out' accounting entry linked to the order.
async function insertAccounting(args: {
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
}): Promise<void> {
  const { error } = await supabase.from('accounting_transactions').insert([
    {
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
    },
  ]);
  if (error) throw new OrderServiceError('ACCOUNTING', error.message);
}

// best-effort cleanup when a multi-step create fails half way
async function rollbackOrder(businessId: string, orderId: string): Promise<void> {
  try {
    await supabase
      .from('accounting_transactions')
      .delete()
      .eq('business_id', businessId)
      .eq('purchase_order_id', orderId);
    await supabase
      .from('purchase_orders')
      .delete()
      .eq('business_id', businessId)
      .eq('id', orderId); // items / payments / history are removed by CASCADE
  } catch {
    /* ignore */
  }
}

async function addHistory(args: {
  orderId: string;
  oldStatus: OrderStatus | null;
  newStatus: OrderStatus;
  reason: string;
  userId: string;
}): Promise<void> {
  // audit log only — a failure here must never undo the real action
  const { error } = await supabase.from('purchase_order_status_history').insert([
    {
      order_id: args.orderId,
      old_status: args.oldStatus,
      new_status: args.newStatus,
      reason: args.reason.slice(0, 255) || null,
      changed_by: args.userId,
    },
  ]);
  if (error) console.error('Status history save error:', error);
}

// ============================================================
// SERVICE
// ============================================================
export const orderService = {
  // ----------------------------------------------------------
  // All purchase orders of the current business (newest first)
  // ----------------------------------------------------------
  async getOrders(): Promise<PurchaseOrder[]> {
    const businessId = await getCurrentBusinessId();
    const rows = await fetchAll((from, to) =>
      supabase
        .from('purchase_orders')
        .select(ORDER_SELECT)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .order('id')
        .range(from, to)
    );
    const names = await loadProfileNames(rows.map((r) => r.created_by));
    return rows.map((r) => mapOrder(r, names));
  },

  // ----------------------------------------------------------
  // Status history of one order (oldest first)
  // ----------------------------------------------------------
  async getStatusHistory(orderId: string): Promise<StatusHistoryEntry[]> {
    const businessId = await getCurrentBusinessId();

    // make sure the order belongs to this business
    const { data: ord, error: oErr } = await supabase
      .from('purchase_orders')
      .select('id')
      .eq('id', orderId)
      .eq('business_id', businessId)
      .maybeSingle();
    if (oErr) throw oErr;
    if (!ord) return [];

    const { data, error } = await supabase
      .from('purchase_order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('changed_at', { ascending: true });
    if (error) throw error;

    const rows = data || [];
    const names = await loadProfileNames(rows.map((h: any) => h.changed_by));
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
    const businessId = await getCurrentBusinessId();
    return nextOrderNumber(businessId);
  },

  // ----------------------------------------------------------
  // Measuring units of this business (+ the user's default one)
  // ----------------------------------------------------------
  async getMeasuringUnits(): Promise<MeasuringUnit[]> {
    const businessId = await getCurrentBusinessId();
    const { data, error } = await supabase
      .from('measuring_units')
      .select('id, name, label')
      .eq('business_id', businessId)
      .order('name', { ascending: true });
    if (error) throw error;

    let defaultId = '';
    try {
      const userId = await getUserId();
      const { data: s } = await supabase
        .from('app_settings')
        .select('default_unit_id')
        .eq('profile_id', userId)
        .eq('business_id', businessId)
        .maybeSingle();
      defaultId = (s as any)?.default_unit_id || '';
    } catch {
      /* default unit is optional */
    }

    return (data || []).map(
      (u: any): MeasuringUnit => ({
        id: u.id,
        name: u.name,
        label: u.label || u.name,
        isDefault: u.id === defaultId,
      })
    );
  },

  // ----------------------------------------------------------
  // PLACE ORDER
  //  - prices / names / units are read from the DB (not trusted from UI)
  //  - totals are calculated in cents
  //  - optional advance payment -> purchase_payments + accounting 'Out'
  //  - if any step fails, everything created so far is removed
  // ----------------------------------------------------------
  async createOrder(input: CreateOrderInput): Promise<PurchaseOrder> {
    const businessId = await getCurrentBusinessId();
    const userId = await getUserId();

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

    // ---- vendor ----
    const { data: vendor, error: vErr } = await supabase
      .from('vendors')
      .select('id, unique_id, name, company_name, active')
      .eq('id', input.vendorId)
      .eq('business_id', businessId)
      .single();
    if (vErr) throw vErr;
    if (!vendor.active) throw new OrderServiceError('INVALID', 'Vendor is not active');

    // ---- products (fresh price / sku / unit from the DB) ----
    const { data: prods, error: pErr } = await supabase
      .from('products')
      .select('id, sku, name, price, active, unit:measuring_units(name, label)')
      .in('id', lines.map((l) => l.productId))
      .eq('business_id', businessId);
    if (pErr) throw pErr;
    const byId = new Map<string, any>((prods || []).map((p: any) => [p.id, p]));

    // ---- money (cents) ----
    let totalCents = 0;
    const itemRows = lines.map((l) => {
      const p = byId.get(l.productId);
      if (!p) throw new OrderServiceError('INVALID', 'Product not found');
      // NOTE: unit price used for a purchase order. Change this one line to
      // use cost_price if you want orders priced by purchase cost.
      const unitPriceCents = toCents(p.price);
      const lineCents = unitPriceCents * l.quantity;
      totalCents += lineCents;
      const u = one(p.unit);
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

    // ---- order header (retry if two users get the same number) ----
    let order: { id: string; order_number: string } | null = null;
    for (let attempt = 0; attempt < 4; attempt++) {
      const orderNumber = await nextOrderNumber(businessId);
      const { data, error } = await supabase
        .from('purchase_orders')
        .insert([
          {
            business_id: businessId,
            order_number: orderNumber,
            vendor_id: vendor.id,
            order_date: input.orderDate,
            status: 'Pending',
            total_amount: fromCents(totalCents),
            payment_status: paymentStatus,
            payment_amount: fromCents(paidCents),
            balance_due: fromCents(balanceCents),
            created_by: userId,
          },
        ])
        .select('id, order_number')
        .single();

      if (!error) {
        order = data as { id: string; order_number: string };
        break;
      }
      if ((error as any).code === '23505' && attempt < 3) continue;
      throw error;
    }
    if (!order) throw new Error('Could not generate a unique order number');

    // ---- items + advance payment + accounting ----
    try {
      const { error: itemsErr } = await supabase
        .from('purchase_order_items')
        .insert(itemRows.map((r) => ({ ...r, order_id: order!.id })));
      if (itemsErr) throw itemsErr;

      if (paidCents > 0) {
        const date = todayISO();
        const { data: pay, error: payErr } = await supabase
          .from('purchase_payments')
          .insert([
            {
              order_id: order.id,
              payment_date: date,
              amount: fromCents(paidCents),
              method: input.advanceMethod,
              balance_after: fromCents(balanceCents),
              recorded_by: userId,
            },
          ])
          .select('id')
          .single();
        if (payErr) throw payErr;

        await insertAccounting({
          businessId,
          orderId: order.id,
          orderNumber: order.order_number,
          vendorName: vendor.name,
          vendorCompany: vendor.company_name,
          paymentId: pay.id,
          date,
          amount: fromCents(paidCents),
          method: input.advanceMethod,
          balanceAfter: fromCents(balanceCents),
        });
      }
    } catch (e) {
      await rollbackOrder(businessId, order.id);
      throw e;
    }

    await addHistory({
      orderId: order.id,
      oldStatus: null,
      newStatus: 'Pending',
      reason: input.historyReason,
      userId,
    });

    return fetchOrder(businessId, order.id);
  },

  // ----------------------------------------------------------
  // MARK AS RECEIVED  (Pending -> Received)
  //  - status is "claimed" atomically first (no double receive)
  //  - product stock += ordered qty, one stock_movement per item
  //  - if a step fails, stock and status are put back
  // ----------------------------------------------------------
  async receiveOrder(orderId: string, historyReason: string): Promise<void> {
    const businessId = await getCurrentBusinessId();
    const userId = await getUserId();

    const { data: order, error: oErr } = await supabase
      .from('purchase_orders')
      .select('id, order_number, status')
      .eq('id', orderId)
      .eq('business_id', businessId)
      .single();
    if (oErr) throw oErr;
    if (order.status !== 'Pending') throw new OrderServiceError('NOT_PENDING');

    const { data: items, error: iErr } = await supabase
      .from('purchase_order_items')
      .select('product_id, quantity')
      .eq('order_id', orderId);
    if (iErr) throw iErr;

    // claim: only one request can move Pending -> Received
    const { data: claimed, error: cErr } = await supabase
      .from('purchase_orders')
      .update({ status: 'Received' })
      .eq('id', orderId)
      .eq('business_id', businessId)
      .eq('status', 'Pending')
      .select('id');
    if (cErr) throw cErr;
    if (!claimed || claimed.length === 0) throw new OrderServiceError('NOT_PENDING');

    const applied: { productId: string; qty: number }[] = [];
    const date = todayISO();

    try {
      for (const it of items || []) {
        const qty = Number(it.quantity) || 0;
        if (qty <= 0) continue;

        const { data: p, error: pErr } = await supabase
          .from('products')
          .select('stock')
          .eq('id', it.product_id)
          .eq('business_id', businessId)
          .single();
        if (pErr) throw pErr;

        const before = Number(p.stock) || 0;
        const after = before + qty;

        const { error: uErr } = await supabase
          .from('products')
          .update({ stock: after })
          .eq('id', it.product_id)
          .eq('business_id', businessId);
        if (uErr) throw uErr;
        applied.push({ productId: it.product_id, qty });

        const { error: mErr } = await supabase.from('stock_movements').insert([
          {
            business_id: businessId,
            product_id: it.product_id,
            movement_type: 'purchase',
            qty,
            before_qty: before,
            after_qty: after,
            reference: order.order_number,
            purchase_order_id: orderId,
            movement_date: date,
            created_by: userId,
          },
        ]);
        if (mErr) throw mErr;
      }
    } catch (e) {
      // ---- undo ----
      try {
        for (const a of applied) {
          const { data: p } = await supabase
            .from('products')
            .select('stock')
            .eq('id', a.productId)
            .eq('business_id', businessId)
            .single();
          if (p) {
            await supabase
              .from('products')
              .update({ stock: Math.max(0, (Number(p.stock) || 0) - a.qty) })
              .eq('id', a.productId)
              .eq('business_id', businessId);
          }
        }
        await supabase
          .from('stock_movements')
          .delete()
          .eq('business_id', businessId)
          .eq('purchase_order_id', orderId)
          .eq('movement_type', 'purchase');
        await supabase
          .from('purchase_orders')
          .update({ status: 'Pending' })
          .eq('id', orderId)
          .eq('business_id', businessId)
          .eq('status', 'Received');
      } catch {
        /* ignore */
      }
      throw e;
    }

    await addHistory({
      orderId,
      oldStatus: 'Pending',
      newStatus: 'Received',
      reason: historyReason,
      userId,
    });
  },

  // ----------------------------------------------------------
  // CANCEL  (only Pending orders with NO payments)
  // ----------------------------------------------------------
  async cancelOrder(orderId: string, historyReason: string): Promise<void> {
    const businessId = await getCurrentBusinessId();
    const userId = await getUserId();

    const { data: order, error } = await supabase
      .from('purchase_orders')
      .select('id, status, payment_amount')
      .eq('id', orderId)
      .eq('business_id', businessId)
      .single();
    if (error) throw error;
    if (order.status !== 'Pending') throw new OrderServiceError('NOT_PENDING');
    if (toCents(order.payment_amount) > 0) throw new OrderServiceError('HAS_PAYMENTS');

    const { data: upd, error: uErr } = await supabase
      .from('purchase_orders')
      .update({ status: 'Cancelled' })
      .eq('id', orderId)
      .eq('business_id', businessId)
      .eq('status', 'Pending')
      .eq('payment_amount', 0) // a payment added in the meantime blocks the cancel
      .select('id');
    if (uErr) throw uErr;
    if (!upd || upd.length === 0) throw new OrderServiceError('CHANGED');

    await addHistory({
      orderId,
      oldStatus: 'Pending',
      newStatus: 'Cancelled',
      reason: historyReason,
      userId,
    });
  },

  // ----------------------------------------------------------
  // ADD PAYMENT  (Pending = advance, Received = settle balance)
  //  - amount can never exceed the balance due
  //  - order totals are updated with a guard (no double payment race)
  //  - creates purchase_payments row + accounting 'Out' entry
  // ----------------------------------------------------------
  async addPayment(orderId: string, input: PaymentInput): Promise<void> {
    const businessId = await getCurrentBusinessId();
    const userId = await getUserId();

    const amountCents = toCents(input.amount);
    if (!(amountCents > 0)) throw new OrderServiceError('INVALID', 'Amount is required');

    const { data: cur, error } = await supabase
      .from('purchase_orders')
      .select(
        'id, order_number, status, total_amount, payment_amount, balance_due, payment_status, vendor:vendors(name, company_name)'
      )
      .eq('id', orderId)
      .eq('business_id', businessId)
      .single();
    if (error) throw error;

    if (cur.status === 'Cancelled') throw new OrderServiceError('NOT_PAYABLE');

    const totalC = toCents(cur.total_amount);
    const paidC = toCents(cur.payment_amount);
    const balanceC = totalC - paidC;
    if (balanceC <= 0) throw new OrderServiceError('NOT_PAYABLE');
    if (amountCents > balanceC) throw new OrderServiceError('AMOUNT_TOO_HIGH');

    const newPaidC = paidC + amountCents;
    const newBalC = totalC - newPaidC;
    const newStatus: PaymentStatus = newBalC <= 0 ? 'Paid' : 'Partially Paid';

    // 1) guarded update: only succeeds if nobody paid in the meantime
    const { data: upd, error: uErr } = await supabase
      .from('purchase_orders')
      .update({
        payment_amount: fromCents(newPaidC),
        balance_due: fromCents(newBalC),
        payment_status: newStatus,
      })
      .eq('id', orderId)
      .eq('business_id', businessId)
      .eq('payment_amount', cur.payment_amount)
      .select('id');
    if (uErr) throw uErr;
    if (!upd || upd.length === 0) throw new OrderServiceError('CHANGED');

    const revertOrder = async (): Promise<void> => {
      try {
        await supabase
          .from('purchase_orders')
          .update({
            payment_amount: cur.payment_amount,
            balance_due: cur.balance_due,
            payment_status: cur.payment_status,
          })
          .eq('id', orderId)
          .eq('business_id', businessId);
      } catch {
        /* ignore */
      }
    };

    // 2) payment row
    const date = todayISO();
    const note = input.note?.trim() || null;
    const { data: pay, error: payErr } = await supabase
      .from('purchase_payments')
      .insert([
        {
          order_id: orderId,
          payment_date: date,
          amount: fromCents(amountCents),
          method: input.method,
          note: note ? note.slice(0, 255) : null,
          balance_after: fromCents(newBalC),
          recorded_by: userId,
        },
      ])
      .select('id')
      .single();
    if (payErr) {
      await revertOrder();
      throw payErr;
    }

    // 3) accounting entry
    try {
      const v = one(cur.vendor) || {};
      await insertAccounting({
        businessId,
        orderId,
        orderNumber: cur.order_number,
        vendorName: v.name || '',
        vendorCompany: v.company_name || '',
        paymentId: pay.id,
        date,
        amount: fromCents(amountCents),
        method: input.method,
        balanceAfter: fromCents(newBalC),
        note: note || undefined,
      });
    } catch (e) {
      try {
        await supabase.from('purchase_payments').delete().eq('id', pay.id);
      } catch {
        /* ignore */
      }
      await revertOrder();
      throw e;
    }
  },
};