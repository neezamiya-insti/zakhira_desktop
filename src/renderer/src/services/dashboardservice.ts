/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase, getCurrentBusinessId } from '../lib/supabaseClient';

// ============================================================
// TYPES
// ============================================================
export type DashboardStats = {
  totalSales: number;
  netProfit: number;
  receivedAmountTotal: number;
  receivables: number;
  inventoryValue: number;
  supplierPayables: number;
  lowStock: any[];
  outOfStock: any[];
  pendingPOs: any[];
  supplierDue: any[];
  recentInvoices: any[];
  activities: any[];
  monthly: any[];
  onlineSales: number;
  offlineSales: number;
  hasChannelData: boolean;
  top5: any[];
  lowStockDisplay: any[];
};

// ============================================================
// HELPERS
// ============================================================
const toCents = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};
const fromCents = (c: number): number => Math.round(c) / 100;

const one = (rel: any): any => (Array.isArray(rel) ? rel[0] : rel) || {};

const monthKey = (v: unknown): string => {
  const dt = new Date(v as any);
  if (isNaN(dt.getTime())) return '';
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
};

const fetchAll = async (
  build: (from: number, to: number) => PromiseLike<{ data: any[] | null; error: any }>
): Promise<any[]> => {
  const rows: any[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await build(from, from + PAGE - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < PAGE) break;
  }
  return rows;
};

// ============================================================
// SERVICE
// ============================================================
export const dashboardService = {
  async getDashboardData(): Promise<DashboardStats> {
    const businessId = await getCurrentBusinessId();

    const [
      documents,
      products,
      transactions,
      expenses,
      purchaseOrders,
      salesReturns,
      returnItems,
    ] = await Promise.all([
      // 1. Sales Documents (Invoices + Quotations) - Approved only
      fetchAll((from, to) =>
        supabase
          .from('sales_documents')
          .select('id, document_type, order_number, status, issue_date, created_at, subtotal, tax_total, grand_total, payment_amount, payment_status, sales_channel, customer_name, customer_company, sales_document_lines(id, product_id, material, category, cost_price, quantity, unit_price, line_total)')
          .eq('business_id', businessId)
          .eq('status', 'Approved')
          .order('id')
          .range(from, to)
      ),
      // 2. Products
      fetchAll((from, to) =>
        supabase
          .from('products')
          .select('id, sku, name, stock, low_stock_level, cost_price, active')
          .eq('business_id', businessId)
          .order('id')
          .range(from, to)
      ),
      // 3. Transactions
      fetchAll((from, to) =>
        supabase
          .from('accounting_transactions')
          .select('id, transaction_no, txn_date, customer_name, company_name, invoice_ref, type, amount, status, mode, created_at, sales_document_id, source_module')
          .eq('business_id', businessId)
          .order('id')
          .range(from, to)
      ),
      // 4. Expenses
      fetchAll((from, to) =>
        supabase
          .from('expenses')
          .select('id, expense_date, category, amount')
          .eq('business_id', businessId)
          .order('id')
          .range(from, to)
      ),
      // 5. Purchase Orders
      fetchAll((from, to) =>
        supabase
          .from('purchase_orders')
          .select('id, order_number, status, total_amount, balance_due, created_at')
          .eq('business_id', businessId)
          .order('id')
          .range(from, to)
      ),
      // 6. Sales Returns
      fetchAll((from, to) =>
        supabase
          .from('sales_returns')
          .select('id, subtotal, created_at')
          .eq('business_id', businessId)
          .order('id')
          .range(from, to)
      ),
      // 7. Sales Return Items (for COGS reversal)
      fetchAll((from, to) =>
        supabase
          .from('sales_return_items')
          .select('id, return_qty, sales_document_lines(cost_price), sales_returns!inner(business_id, created_at)')
          .eq('sales_returns.business_id', businessId)
          .order('id')
          .range(from, to)
      ),
    ]);

    // ============================================================
    // CALCULATIONS
    // ============================================================

    const manual = transactions.filter((t) => t.source_module === 'manual');
    const isManualReturn = (t: any) =>
      t.type === 'Return' || (t.type === 'Out' && t.status === 'Returned');

    // 1. Revenue (ex-tax) in cents
    let salesRevenueC = 0;
    for (const d of documents) {
      salesRevenueC += toCents(d.grand_total) - toCents(d.tax_total);
    }
    let manualInC = 0;
    let manualReturnsC = 0;
    for (const t of manual) {
      const amt = toCents(t.amount);
      if (isManualReturn(t)) manualReturnsC += amt;
      else if (t.type === 'In') manualInC += amt;
    }
    let salesReturnsC = 0;
    for (const r of salesReturns) salesReturnsC += toCents(r.subtotal);

    const totalRevenueC = salesRevenueC + manualInC - salesReturnsC - manualReturnsC;

    // 2. COGS (minus returned goods)
    let cogsC = 0;
    for (const d of documents) {
      for (const l of d.sales_document_lines || []) {
        const qty = Number(l.quantity || 0);
        if (qty > 0) cogsC += Math.round(qty * toCents(l.cost_price));
      }
    }
    for (const ri of returnItems) {
      const qty = Number(ri.return_qty || 0);
      const cost = toCents(one(ri.sales_document_lines).cost_price);
      if (qty > 0) cogsC -= Math.round(qty * cost);
    }
    cogsC = Math.max(0, cogsC);

    // 3. Other Expenses
    const otherExpensesC = expenses.reduce((s, e) => s + toCents(e.amount), 0);

    // 4. Net Profit
    const totalRevenue = fromCents(totalRevenueC);
    const netProfit = fromCents(totalRevenueC - cogsC - otherExpensesC);

    // 5. Received Amount (Documents se, taake Sales page se match kare)
    const receivedAmountTotal = fromCents(
      documents.reduce((s, d) => {
        const grand = toCents(d.grand_total);
        const paid = toCents(d.payment_amount);
        if (d.payment_status === 'Paid') return s + grand;
        if (d.payment_status === 'Partially Paid') return s + paid;
        return s;
      }, 0)
    );

    // 6. Receivables
    const receivables = fromCents(
      documents.reduce((s, d) => {
        const balance = toCents(d.grand_total) - toCents(d.payment_amount);
        return s + (balance > 0 ? balance : 0);
      }, 0)
    );

    // 7. Supplier Payables
    const supplierPayables = fromCents(
      purchaseOrders.reduce((s, po) => s + toCents(po.balance_due), 0)
    );

    // 8. Inventory Value
    let inventoryValueC = 0;
    for (const p of products) {
      const qty = Number(p.stock || 0);
      const cost = toCents(p.cost_price);
      if (qty > 0 && cost > 0) inventoryValueC += Math.round(qty * cost);
    }
    const inventoryValue = fromCents(inventoryValueC);

    // 9. Alerts
    const lowStock = products.filter((p) => {
      const qty = Number(p.stock || 0);
      const th = Number(p.low_stock_level || 5);
      return p.active !== false && qty > 0 && qty <= th;
    });
    const outOfStock = products.filter((p) => {
      const qty = Number(p.stock || 0);
      return p.active !== false && qty <= 0;
    });
    const pendingPOs = purchaseOrders.filter((po) => po.status === 'Pending');
    const supplierDue = purchaseOrders.filter((po) => Number(po.balance_due || 0) > 0);

    // 10. Recent Invoices
    const recentInvoices = [...documents]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map((d) => ({
        id: d.order_number,
        customer: d.customer_name,
        amount: Number(d.grand_total),
        status:
          d.payment_amount >= d.grand_total
            ? 'Paid'
            : d.payment_amount > 0
              ? 'Partial Payment'
              : 'Pending',
      }));

    // 11. Recent Activity
    const activities = [...transactions]
      .sort(
        (a, b) =>
          new Date(b.created_at || b.txn_date).getTime() -
          new Date(a.created_at || a.txn_date).getTime()
      )
      .slice(0, 5)
      .map((t) => ({
        id: t.id,
        type: t.type === 'In' ? 'sale' : t.type === 'Out' ? 'purchase' : 'payment',
        message:
          t.type === 'In'
            ? `${t.invoice_ref || t.transaction_no} — ${t.customer_name || 'Sale'} (${t.amount})`
            : t.type === 'Out'
              ? `Purchase: ${t.customer_name || 'Supplier'} (${t.amount})`
              : `Return: ${t.invoice_ref || t.transaction_no} (${t.amount})`,
        time: new Date(t.created_at || t.txn_date).toLocaleDateString(),
      }));

    // 12. Monthly buckets
    const monthsMap = new Map<
      string,
      { key: string; label: string; revenue: number; expenses: number }
    >();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = monthKey(d);
      const label = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
      monthsMap.set(key, { key, label, revenue: 0, expenses: 0 });
    }

    for (const d of documents) {
      const bucket = monthsMap.get(monthKey(d.issue_date));
      if (!bucket) continue;
      bucket.revenue += toCents(d.grand_total) - toCents(d.tax_total);
      for (const l of d.sales_document_lines || []) {
        const qty = Number(l.quantity || 0);
        if (qty > 0) bucket.expenses += Math.round(qty * toCents(l.cost_price));
      }
    }
    for (const t of manual) {
      const bucket = monthsMap.get(monthKey(t.txn_date));
      if (!bucket) continue;
      if (isManualReturn(t)) bucket.revenue -= toCents(t.amount);
      else if (t.type === 'In') bucket.revenue += toCents(t.amount);
    }
    for (const r of salesReturns) {
      const bucket = monthsMap.get(monthKey(r.created_at));
      if (bucket) bucket.revenue -= toCents(r.subtotal);
    }
    for (const ri of returnItems) {
      const bucket = monthsMap.get(monthKey(one(ri.sales_returns).created_at));
      if (!bucket) continue;
      const qty = Number(ri.return_qty || 0);
      const cost = toCents(one(ri.sales_document_lines).cost_price);
      if (qty > 0) bucket.expenses -= Math.round(qty * cost);
    }
    for (const e of expenses) {
      const bucket = monthsMap.get(monthKey(e.expense_date));
      if (bucket) bucket.expenses += toCents(e.amount);
    }

    const monthly = Array.from(monthsMap.values()).map((b) => {
      const expensesC = Math.max(0, b.expenses);
      return {
        key: b.key,
        label: b.label,
        revenue: fromCents(b.revenue),
        expenses: fromCents(expensesC),
        profit: fromCents(b.revenue - expensesC),
      };
    });

    // 13. Online vs Offline
    let onlineDocC = 0;
    let offlineDocC = 0;
    for (const d of documents) {
      const net = toCents(d.grand_total) - toCents(d.tax_total);
      if ((d.sales_channel || '').toLowerCase() === 'online') onlineDocC += net;
      else offlineDocC += net;
    }
    const docsNetC = onlineDocC + offlineDocC;
    const adjustmentC = totalRevenueC - docsNetC;
    const onlineShare = docsNetC > 0 ? onlineDocC / docsNetC : 0;
    const onlineC = Math.max(0, onlineDocC + Math.round(adjustmentC * onlineShare));
    const offlineC = totalRevenueC - onlineC;
    const onlineSales = fromCents(onlineC);
    const offlineSales = fromCents(Math.max(0, offlineC));
    const hasChannelData = onlineC + offlineC > 0;

    // 14. Top 5 Products
    const productMap = new Map<string, { qty: number; revenue: number }>();
    for (const d of documents) {
      for (const l of d.sales_document_lines || []) {
        const name = l.material || 'Unknown';
        const qty = Number(l.quantity || 0);
        const rev = Number(l.line_total || 0);
        const cur = productMap.get(name) || { qty: 0, revenue: 0 };
        cur.qty += qty;
        cur.revenue += rev;
        productMap.set(name, cur);
      }
    }
    const top5 = Array.from(productMap.entries())
      .map(([name, v]) => ({ name, qty: v.qty, revenue: v.revenue }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // 15. Low stock display
    const lowStockDisplay = lowStock.slice(0, 4).map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      stock: Number(p.stock),
    }));

    return {
      totalSales: totalRevenue,
      netProfit,
      receivedAmountTotal,
      receivables,
      inventoryValue,
      supplierPayables,
      lowStock,
      outOfStock,
      pendingPOs,
      supplierDue,
      recentInvoices,
      activities,
      monthly,
      onlineSales,
      offlineSales,
      hasChannelData,
      top5,
      lowStockDisplay,
    };
  },
};