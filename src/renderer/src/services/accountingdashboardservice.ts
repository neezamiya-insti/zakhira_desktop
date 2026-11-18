/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase, getCurrentBusinessId } from '../lib/supabaseClient';

// ============================================================
// TYPES
// ============================================================
export type DashboardMetrics = {
  totalRevenue: number;
  netProfit: number;
  cashInBank: number;
  payables: number;
  receivables: number;
  cogs: number;
  otherExpenses: number;
};

// ============================================================
// HELPERS
// ============================================================
const PAGE = 1000;
const BUSINESS_ID_KEY = 'zakhira_business_id';
const METRICS_CACHE_KEY = 'zakhira_accounting_dashboard_metrics';
const METRIC_FIELDS: (keyof DashboardMetrics)[] = [
  'totalRevenue',
  'netProfit',
  'cashInBank',
  'payables',
  'receivables',
  'cogs',
  'otherExpenses',
];

type CachedMetrics = {
  businessId: string;
  userId: string;
  metrics: DashboardMetrics;
};

const toCents = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};
const fromCents = (c: number): number => Math.round(c) / 100;

const isMetrics = (value: unknown): value is DashboardMetrics => {
  if (!value || typeof value !== 'object') return false;
  const metrics = value as Record<string, unknown>;
  return METRIC_FIELDS.every(
    (field) => typeof metrics[field] === 'number' && Number.isFinite(metrics[field])
  );
};

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

const saveCachedMetrics = (
  businessId: string,
  metrics: DashboardMetrics
): void => {
  try {
    localStorage.setItem(
      METRICS_CACHE_KEY,
      JSON.stringify({ businessId, userId: getUserId(), metrics } satisfies CachedMetrics)
    );
  } catch (error) {
    console.warn('Could not cache accounting dashboard metrics', error);
  }
};

const getCachedMetrics = (): DashboardMetrics | null => {
  try {
    const value = JSON.parse(
      localStorage.getItem(METRICS_CACHE_KEY) || 'null'
    ) as CachedMetrics | null;
    if (!value || !value.businessId || !isMetrics(value.metrics)) return null;

    const businessId = localStorage.getItem(BUSINESS_ID_KEY);
    const userId = getUserId();
    if (
      (businessId && businessId !== value.businessId) ||
      (userId && value.userId && userId !== value.userId) ||
      (!businessId && !userId)
    ) {
      return null;
    }
    return value.metrics;
  } catch {
    return null;
  }
};

async function fetchAll(
  build: (from: number, to: number) => PromiseLike<{ data: any[] | null; error: any }>
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

const one = (rel: any): any => (Array.isArray(rel) ? rel[0] : rel) || {};

// ============================================================
// SERVICE
// ============================================================
export const accountingDashboardService = {
  /** Synchronous last-known metrics for instant rendering and offline use. */
  getCachedMetrics,

  async getMetrics(): Promise<DashboardMetrics> {
    const cached = getCachedMetrics();
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (cached) return cached;
      throw new Error('Accounting dashboard has no saved offline metrics yet');
    }

    const businessId = await getBusinessId();

    const [documents, orders, manual, expenses, lines, returns, returnItems] =
      await Promise.all([
        // ✅ CHANGE 1: document_type filter hataya (ab Quotation + Invoice dono aayenge)
        // Sirf Approved status wale
        fetchAll((from, to) =>
          supabase
            .from('sales_documents')
            .select('id, grand_total, tax_total, payment_amount, balance_due')
            .eq('business_id', businessId)
            .eq('status', 'Approved') // <-- Sirf Approved
            .order('id')
            .range(from, to)
        ),
        fetchAll((from, to) =>
          supabase
            .from('purchase_orders')
            .select('id, payment_amount, balance_due')
            .eq('business_id', businessId)
            .neq('status', 'Cancelled')
            .order('id')
            .range(from, to)
        ),
        fetchAll((from, to) =>
          supabase
            .from('accounting_transactions')
            .select('id, type, status, amount')
            .eq('business_id', businessId)
            .eq('source_module', 'manual')
            .order('id')
            .range(from, to)
        ),
        fetchAll((from, to) =>
          supabase
            .from('expenses')
            .select('id, amount')
            .eq('business_id', businessId)
            .order('id')
            .range(from, to)
        ),
        // ✅ CHANGE 2: COGS ke liye bhi document_type filter hataya
        fetchAll((from, to) =>
          supabase
            .from('sales_document_lines')
            .select(
              'id, quantity, cost_price, sales_documents!inner(business_id, status)'
            )
            .eq('sales_documents.business_id', businessId)
            .eq('sales_documents.status', 'Approved')
            .order('id')
            .range(from, to)
        ),
        fetchAll((from, to) =>
          supabase
            .from('sales_returns')
            .select('id, tax_total, total_return_amount')
            .eq('business_id', businessId)
            .order('id')
            .range(from, to)
        ),
        fetchAll((from, to) =>
          supabase
            .from('sales_return_items')
            .select(
              'id, return_id, return_qty, total_amount, sales_document_lines!inner(quantity, line_total, cost_price, sales_documents!inner(subtotal, tax_total)), sales_returns!inner(business_id)'
            )
            .eq('sales_returns.business_id', businessId)
            .order('id')
            .range(from, to)
        ),
      ]);

    // ---------------- Sales side (now includes quotations) ----------------
    let salesRevenue = 0;
    let cashFromDocuments = 0;
    let documentReceivables = 0;

    for (const d of documents) {
      salesRevenue += toCents(d.grand_total) - toCents(d.tax_total);
      cashFromDocuments += toCents(d.payment_amount);
      documentReceivables += Math.max(0, toCents(d.balance_due));
    }

    let salesReturnCashOutflow = 0;
    for (const r of returns) {
      salesReturnCashOutflow += toCents(r.total_return_amount);
    }

    let salesReturns = 0;
    const returnsWithItems = new Set<string>();
    for (const ri of returnItems) {
      returnsWithItems.add(String(ri.return_id));
      const line = one(ri.sales_document_lines);
      const document = one(line.sales_documents);
      const originalQty = Number(line.quantity) || 0;
      const returnedQty = Number(ri.return_qty) || 0;
      const documentSubtotal = Number(document.subtotal) || 0;
      const lineShare =
        documentSubtotal > 0 ? (Number(line.line_total) || 0) / documentSubtotal : 0;
      const lineTaxCents = toCents(document.tax_total) * lineShare;
      const returnedTaxCents =
        originalQty > 0 ? Math.round((lineTaxCents * returnedQty) / originalQty) : 0;

      salesReturns += Math.max(0, toCents(ri.total_amount) - returnedTaxCents);
    }
    for (const r of returns) {
      if (!returnsWithItems.has(String(r.id))) {
        salesReturns += Math.max(
          0,
          toCents(r.total_return_amount) - toCents(r.tax_total)
        );
      }
    }

    // ---------------- Purchase side ----------------
    let cashToVendors = 0;
    let vendorPayables = 0;
    for (const o of orders) {
      cashToVendors += toCents(o.payment_amount);
      vendorPayables += Math.max(0, toCents(o.balance_due));
    }

    // ---------------- Manual ledger ----------------
    let manualIn = 0;
    let manualReturns = 0;
    let manualCashIn = 0;
    let manualCashOut = 0;
    let manualReceivable = 0;
    let manualPayable = 0;

    for (const t of manual) {
      const amt = toCents(t.amount);
      const isReturn =
        t.type === 'Return' || (t.type === 'Out' && t.status === 'Returned');

      if (isReturn) {
        manualReturns += amt;
        manualCashOut += amt;
      } else if (t.type === 'In') {
        manualIn += amt;
        if (t.status === 'Paid') manualCashIn += amt;
        else if (t.status === 'Partially Paid') manualReceivable += amt;
      } else if (t.type === 'Out') {
        if (t.status === 'Paid') manualCashOut += amt;
        else if (t.status === 'Partially Paid') manualPayable += amt;
      }
    }

    // ---------------- Expenses ----------------
    let otherExpenses = 0;
    for (const e of expenses) otherExpenses += toCents(e.amount);

    // ---------------- COGS ----------------
    let cogs = 0;
    for (const l of lines) {
      const qty = Number(l.quantity) || 0;
      if (qty > 0) cogs += qty * toCents(l.cost_price);
    }
    for (const ri of returnItems) {
      const qty = Number(ri.return_qty) || 0;
      const cost = toCents(one(ri.sales_document_lines).cost_price);
      if (qty > 0) cogs -= qty * cost;
    }
    cogs = Math.max(0, cogs);

    // ---------------- Final figures ----------------
    const totalRevenue = Math.max(
      0,
      salesRevenue + manualIn - salesReturns - manualReturns
    );
    const netProfit = totalRevenue - cogs - otherExpenses;
    const cashInBank =
      cashFromDocuments +
      manualCashIn -
      (cashToVendors + manualCashOut + salesReturnCashOutflow) -
      otherExpenses;
    const receivables = documentReceivables + manualReceivable;
    const payables = vendorPayables + manualPayable;

    const metrics = {
      totalRevenue: fromCents(totalRevenue),
      netProfit: fromCents(netProfit),
      cashInBank: fromCents(cashInBank),
      payables: fromCents(payables),
      receivables: fromCents(receivables),
      cogs: fromCents(cogs),
      otherExpenses: fromCents(otherExpenses),
    };
    saveCachedMetrics(businessId, metrics);
    return metrics;
  },
};