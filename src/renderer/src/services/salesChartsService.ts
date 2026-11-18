/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase, getCurrentBusinessId } from '../lib/supabaseClient';
import { accountingService } from './accountingservice';
import { recordsService } from './recordsService';

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
const BUSINESS_ID_KEY = 'zakhira_business_id';
const CACHE_KEY = 'zakhira_sales_charts_cache';

type CachedChartData = {
  businessId: string;
  userId: string;
  data: ChartData;
};

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

const getUserId = (): string => {
  try {
    const user = JSON.parse(localStorage.getItem('zakhira_user') || '{}') as {
      id?: string;
    };
    return user.id || '';
  } catch {
    return '';
  }
};

const isChartData = (value: unknown): value is ChartData => {
  if (!value || typeof value !== 'object') return false;
  const data = value as Record<string, any>;
  return (
    Array.isArray(data.monthlySales) &&
    data.monthlySales.every(
      (point: any) =>
        typeof point.month === 'string' &&
        typeof point.value === 'number' &&
        Number.isFinite(point.value)
    ) &&
    ['onlineSales', 'offlineSales'].every(
      (field) => typeof data[field] === 'number' && Number.isFinite(data[field])
    ) &&
    Array.isArray(data.topProducts) &&
    data.topProducts.every(
      (product: any) =>
        typeof product.name === 'string' &&
        ['qty', 'revenue'].every(
          (field) =>
            typeof product[field] === 'number' &&
            Number.isFinite(product[field])
        )
    ) &&
    !!data.statusCounts &&
    ['paid', 'partial', 'unpaid', 'pending', 'rejected'].every(
      (field) =>
        typeof data.statusCounts[field] === 'number' &&
        Number.isFinite(data.statusCounts[field])
    ) &&
    Array.isArray(data.orderPatterns) &&
    data.orderPatterns.length === 7 &&
    data.orderPatterns.every(
      (row: unknown) =>
        Array.isArray(row) &&
        row.length === 12 &&
        row.every(
          (count: unknown) =>
            typeof count === 'number' && Number.isFinite(count)
        )
    )
  );
};

const getCachedChartData = (): ChartData | null => {
  try {
    const cached = JSON.parse(
      localStorage.getItem(CACHE_KEY) || 'null'
    ) as CachedChartData | null;
    if (!cached || !cached.businessId || !isChartData(cached.data)) return null;

    const businessId = localStorage.getItem(BUSINESS_ID_KEY);
    const userId = getUserId();
    if (
      (businessId && businessId !== cached.businessId) ||
      (userId && cached.userId && userId !== cached.userId) ||
      (!businessId && !userId)
    ) {
      return null;
    }
    return cached.data;
  } catch {
    return null;
  }
};

const saveCachedChartData = (businessId: string, data: ChartData): void => {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ businessId, userId: getUserId(), data } satisfies CachedChartData)
    );
  } catch (error) {
    console.warn('Could not cache sales charts data', error);
  }
};

const getBusinessId = async (): Promise<string> => {
  const cached = localStorage.getItem(BUSINESS_ID_KEY);
  if (cached) return cached;
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error('Business ID is not cached for offline use');
  }
  const id = await getCurrentBusinessId();
  localStorage.setItem(BUSINESS_ID_KEY, id);
  return id;
};

const buildChartData = (
  docs: any[],
  lines: any[],
  salesReturns: any[],
  manual: any[]
): ChartData => {
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
    const b = bucketByKey.get(monthKey(r.created_at || r.return_date));
    if (b) b.valueC -= toCents(r.subtotal);
  }

  let onlineC = 0;
  let offlineC = 0;
  for (const d of countedDocs) {
    if (d.status === 'Rejected') continue;
    const net = toCents(d.grand_total) - toCents(d.tax_total);
    if (String(d.sales_channel || '').toLowerCase() === 'online') onlineC += net;
    else offlineC += net;
  }

  const docsNetC = onlineC + offlineC;
  const totalReturnsC = salesReturns.reduce(
    (sum, r) => sum + toCents(r.subtotal),
    0
  );
  if (docsNetC > 0) {
    const netSalesC = Math.max(0, docsNetC - totalReturnsC);
    const onlineShare = onlineC / docsNetC;
    onlineC = Math.round(netSalesC * onlineShare);
    offlineC = netSalesC - onlineC;
  }

  const productMap = new Map<string, { qty: number; revenue: number }>();
  for (const line of lines) {
    const doc = Array.isArray(line.sales_documents)
      ? line.sales_documents[0]
      : line.sales_documents;
    if (!doc || !isCounted(doc)) continue;
    const name = line.material || 'Unknown';
    const current = productMap.get(name) || { qty: 0, revenue: 0 };
    current.qty += Number(line.quantity || 0);
    current.revenue += Number(line.line_total || 0);
    productMap.set(name, current);
  }
  const topProducts = Array.from(productMap.entries())
    .map(([name, value]) => ({ name, qty: value.qty, revenue: value.revenue }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const statusCounts = { paid: 0, partial: 0, unpaid: 0, pending: 0, rejected: 0 };
  for (const d of countedDocs) {
    if (d.status === 'Rejected') statusCounts.rejected++;
    else if (d.status === 'Pending') statusCounts.pending++;
    else if (d.payment_status === 'Paid') statusCounts.paid++;
    else if (d.payment_status === 'Partially Paid') statusCounts.partial++;
    else statusCounts.unpaid++;
  }

  const orderPatterns = Array.from({ length: 7 }, () => Array(12).fill(0));
  for (const d of countedDocs) {
    if (d.status === 'Rejected') continue;
    const dt = new Date(d.created_at || d.issue_date);
    if (isNaN(dt.getTime())) continue;
    orderPatterns[dt.getDay()][Math.floor(dt.getHours() / 2)]++;
  }

  return {
    monthlySales: buckets.map((bucket) => ({
      month: bucket.month,
      value: fromCents(bucket.valueC),
    })),
    onlineSales: fromCents(onlineC),
    offlineSales: fromCents(offlineC),
    topProducts,
    statusCounts,
    orderPatterns,
  };
};

// ============================================================
// SERVICE
// ============================================================
export const salesChartsService = {
  /** Last successful snapshot for instant rendering and offline fallback. */
  getCachedChartData,

  /** Calculates chart data from local SQLite documents and ledger entries. */
  async getChartData(): Promise<ChartData> {
    const [docs, transactions] = await Promise.all([
      recordsService.getDocuments(),
      accountingService.getTransactions(),
    ]);
    const lines = docs
      .filter((document) => document.status === 'Approved')
      .flatMap((document) =>
        (document.lines || []).map((line) => ({
          ...line,
          sales_documents: { document_type: document.document_type },
        }))
      );
    const salesReturns = docs.flatMap((document) => document.returns || []);
    const manual = transactions
      .filter((transaction) => transaction.sourceModule === 'manual')
      .map((transaction) => ({
        type: transaction.type,
        status: transaction.status,
        amount: transaction.amount,
        txn_date: transaction.date,
      }));
    const data = buildChartData(docs, lines, salesReturns, manual);
    saveCachedChartData(await getBusinessId(), data);
    return data;
  },

  /** Refreshes chart data from Supabase without delaying the local-first view. */
  async syncChartData(): Promise<ChartData> {
    const businessId = await getBusinessId();
    const [docs, lines, salesReturns, manual] = await Promise.all([
      // All documents are needed for status counts.
      fetchAll((from, to) =>
        supabase
          .from('sales_documents')
          .select('id, document_type, status, payment_status, issue_date, created_at, tax_total, grand_total, sales_channel')
          .eq('business_id', businessId)
          .order('id')
          .range(from, to)
      ),
      // Lines are only needed for approved documents.
      fetchAll((from, to) =>
        supabase
          .from('sales_document_lines')
          .select('id, document_id, material, quantity, line_total, sales_documents!inner(business_id, status, document_type)')
          .eq('sales_documents.business_id', businessId)
          .eq('sales_documents.status', 'Approved')
          .order('id')
          .range(from, to)
      ),
      fetchAll((from, to) =>
        supabase
          .from('sales_returns')
          .select('id, subtotal, created_at')
          .eq('business_id', businessId)
          .order('id')
          .range(from, to)
      ),
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
    const data = buildChartData(docs, lines, salesReturns, manual);
    saveCachedChartData(businessId, data);
    return data;
  },
};