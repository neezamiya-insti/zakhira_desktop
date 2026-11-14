/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase, getCurrentBusinessId } from '../lib/supabaseClient';

// ============================================================
// TYPES
// ============================================================
export type ChartData = {
  monthlySales: { month: string; value: number }[];
  onlineSales: number;
  offlineSales: number;
  topProducts: { name: string; qty: number; revenue: number }[];
  statusCounts: {
    paid: number;
    partial: number;
    unpaid: number;
    pending: number;
    rejected: number;
  };
  orderPatterns: number[][];
};

// ============================================================
// HELPERS
// ============================================================
// true  = Quotation + Invoice dono count honge (Dashboard / Accounting jaisa)
// false = sirf invoices
const INCLUDE_QUOTATIONS = true;

const toCents = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};
const fromCents = (c: number): number => Math.round(c) / 100;

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

const isCounted = (d: any): boolean =>
  INCLUDE_QUOTATIONS || String(d.document_type || '').toLowerCase() === 'invoice';

const isManualReturn = (t: any): boolean =>
  t.type === 'Return' || (t.type === 'Out' && t.status === 'Returned');

// ============================================================
// SERVICE
// ============================================================
export const salesChartsService = {
  async getChartData(): Promise<ChartData> {
    const businessId = await getCurrentBusinessId();

    const [docs, lines, salesReturns, manual] = await Promise.all([
      // 1. Saare documents (status counts ke liye Pending/Rejected bhi chahiye)
      fetchAll((from, to) =>
        supabase
          .from('sales_documents')
          .select('id, document_type, status, payment_status, issue_date, created_at, tax_total, grand_total, sales_channel')
          .eq('business_id', businessId)
          .order('id')
          .range(from, to)
      ),
      // 2. Lines (sirf Approved documents ki)
      fetchAll((from, to) =>
        supabase
          .from('sales_document_lines')
          .select('id, document_id, material, quantity, line_total, sales_documents!inner(business_id, status, document_type)')
          .eq('sales_documents.business_id', businessId)
          .eq('sales_documents.status', 'Approved')
          .order('id')
          .range(from, to)
      ),
      // 3. Sales returns
      fetchAll((from, to) =>
        supabase
          .from('sales_returns')
          .select('id, subtotal, created_at')
          .eq('business_id', businessId)
          .order('id')
          .range(from, to)
      ),
      // 4. Manual ledger entries
      fetchAll((from, to) =>
        supabase
          .from('accounting_transactions')
          .select('id, type, status, amount, txn_date')
          .eq('business_id', businessId)
          .eq('source_module', 'manual')
          .order('id')
          .range(from, to)
      ),
    ]);

    if (docs.length === 0 && manual.length === 0) {
      return {
        monthlySales: [],
        onlineSales: 0,
        offlineSales: 0,
        topProducts: [],
        statusCounts: { paid: 0, partial: 0, unpaid: 0, pending: 0, rejected: 0 },
        orderPatterns: Array.from({ length: 7 }, () => Array(12).fill(0)),
      };
    }

    const approvedDocs = docs.filter((d) => d.status === 'Approved');
    const countedDocs = docs.filter(isCounted);

    // A. Monthly Sales (last 6 months) - ex-tax, minus returns
    const now = new Date();
    const buckets = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        key: monthKey(d),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        valueC: 0,
      };
    });
    const bucketByKey = new Map(buckets.map((b) => [b.key, b]));

    for (const d of approvedDocs) {
      if (!isCounted(d)) continue;
      const b = bucketByKey.get(monthKey(d.issue_date || d.created_at));
      if (b) b.valueC += toCents(d.grand_total) - toCents(d.tax_total);
    }
    for (const t of manual) {
      const b = bucketByKey.get(monthKey(t.txn_date));
      if (!b) continue;
      if (isManualReturn(t)) b.valueC -= toCents(t.amount);
      else if (t.type === 'In') b.valueC += toCents(t.amount);
    }
    for (const r of salesReturns) {
      const b = bucketByKey.get(monthKey(r.created_at));
      if (b) b.valueC -= toCents(r.subtotal);
    }

    // B. Online vs Offline (ex-tax) - returns proportionally adjusted
    let onlineC = 0;
    let offlineC = 0;
    for (const d of approvedDocs) {
      if (!isCounted(d)) continue;
      const net = toCents(d.grand_total) - toCents(d.tax_total);
      if (String(d.sales_channel || '').toLowerCase() === 'online') onlineC += net;
      else offlineC += net;
    }

    // ✅ Returns ko proportionally adjust karo (Online vs Offline)
    const totalReturnsC = salesReturns.reduce((s, r) => s + toCents(r.subtotal), 0);
    const docsNetC = onlineC + offlineC;
    if (docsNetC > 0 && totalReturnsC > 0) {
      const onlineShare = onlineC / docsNetC;
      onlineC = Math.max(0, onlineC - Math.round(totalReturnsC * onlineShare));
      offlineC = docsNetC - onlineC;
    }

    // C. Top Products (approved docs, Dashboard jaisa)
    const productMap = new Map<string, { qty: number; revenue: number }>();
    for (const l of lines) {
      const doc = Array.isArray(l.sales_documents) ? l.sales_documents[0] : l.sales_documents;
      if (!doc || !isCounted(doc)) continue;
      const name = l.material || 'Unknown';
      const cur = productMap.get(name) || { qty: 0, revenue: 0 };
      cur.qty += Number(l.quantity || 0);
      cur.revenue += Number(l.line_total || 0);
      productMap.set(name, cur);
    }
    const topProducts = Array.from(productMap.entries())
      .map(([name, v]) => ({ name, qty: v.qty, revenue: v.revenue }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // D. Status Counts
    const statusCounts = { paid: 0, partial: 0, unpaid: 0, pending: 0, rejected: 0 };
    for (const d of countedDocs) {
      if (d.status === 'Rejected') statusCounts.rejected++;
      else if (d.status === 'Pending') statusCounts.pending++;
      else if (d.payment_status === 'Paid') statusCounts.paid++;
      else if (d.payment_status === 'Partially Paid') statusCounts.partial++;
      else statusCounts.unpaid++;
    }

    // E. Order Patterns (day x 2-hour slot)
    const orderPatterns = Array.from({ length: 7 }, () => Array(12).fill(0));
    for (const d of countedDocs) {
      if (d.status === 'Rejected') continue;
      const dt = new Date(d.created_at || d.issue_date);
      if (isNaN(dt.getTime())) continue;
      orderPatterns[dt.getDay()][Math.floor(dt.getHours() / 2)]++;
    }

    return {
      monthlySales: buckets.map((b) => ({ month: b.month, value: fromCents(b.valueC) })),
      onlineSales: fromCents(onlineC),
      offlineSales: fromCents(offlineC),
      topProducts,
      statusCounts,
      orderPatterns,
    };
  },
};