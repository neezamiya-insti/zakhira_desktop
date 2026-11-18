/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase, getCurrentBusinessId } from '../lib/supabaseClient';

// ============================================================
// TYPES
// ============================================================
export type MonthPoint = {
  key: string;
  revenue: number;
  expenses: number;
  profit: number;
  inflow: number;
  outflow: number;
};

export type ChartsData = {
  months: MonthPoint[];
  heat: number[][];
  expenseTotals: {
    cogs: number;
    salaries: number;
    personalUse: number;
    other: number;
    purchases?: number;
  };
};

// ============================================================
// HELPERS
// ============================================================
const PAGE = 1000;
const MONTHS = 6;
const BUSINESS_ID_KEY = 'zakhira_business_id';
const CHARTS_CACHE_KEY = 'zakhira_accounting_charts_cache';

type CachedChartsData = {
  businessId: string;
  userId: string;
  data: ChartsData;
};

const toCents = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};
const fromCents = (c: number): number => Math.round(c) / 100;

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

const isYMD = (s: unknown): s is string =>
  typeof s === 'string' && /^\d{4}-\d{2}-\d{2}/.test(s);

const weekdayOf = (ymd: string): number =>
  new Date(
    Number(ymd.slice(0, 4)),
    Number(ymd.slice(5, 7)) - 1,
    Number(ymd.slice(8, 10))
  ).getDay();

const monthKeys = (): string[] => {
  const now = new Date();
  return Array.from({ length: MONTHS }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (MONTHS - 1 - i), 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isChartsData = (value: unknown): value is ChartsData => {
  if (!value || typeof value !== 'object') return false;
  const data = value as Record<string, any>;
  return (
    Array.isArray(data.months) &&
    data.months.every(
      (month: Record<string, unknown>) =>
        typeof month.key === 'string' &&
        ['revenue', 'expenses', 'profit', 'inflow', 'outflow'].every((field) =>
          isFiniteNumber(month[field])
        )
    ) &&
    Array.isArray(data.heat) &&
    data.heat.length === 7 &&
    data.heat.every(
      (row: unknown) =>
        Array.isArray(row) &&
        row.length === data.months.length &&
        row.every(isFiniteNumber)
    ) &&
    !!data.expenseTotals &&
    ['cogs', 'salaries', 'personalUse', 'other'].every((field) =>
      isFiniteNumber(data.expenseTotals[field])
    ) &&
    (data.expenseTotals.purchases === undefined ||
      isFiniteNumber(data.expenseTotals.purchases))
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

const getCachedChartsData = (): ChartsData | null => {
  try {
    const cached = JSON.parse(
      localStorage.getItem(CHARTS_CACHE_KEY) || 'null'
    ) as CachedChartsData | null;
    if (!cached || !cached.businessId || !isChartsData(cached.data)) return null;

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

const saveCachedChartsData = (businessId: string, data: ChartsData): void => {
  try {
    localStorage.setItem(
      CHARTS_CACHE_KEY,
      JSON.stringify({ businessId, userId: getUserId(), data } satisfies CachedChartsData)
    );
  } catch (error) {
    console.warn('Could not cache accounting charts data', error);
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

type Bucket = {
  revenue: number;
  cogs: number;
  otherExp: number;
  inflow: number;
  outflow: number;
};

// ============================================================
// SERVICE
// ============================================================
export const accountingChartsService = {
  /** Synchronous last-known chart data for instant rendering and offline use. */
  getCachedChartsData,

  async getChartsData(): Promise<ChartsData> {
    const cached = getCachedChartsData();
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (cached) return cached;
      throw new Error('Accounting charts have no saved offline data yet');
    }

    const businessId = await getBusinessId();

    const [
      documents,
      salesPayments,
      returns,
      lines,
      returnItems,
      orders,
      purchasePayments,
      manual,
      expenses,
    ] = await Promise.all([
      // ✅ CHANGE: document_type IN ('invoice', 'quotation') & status = 'Approved'
      fetchAll((from, to) =>
        supabase
          .from('sales_documents')
          .select('id, document_type, issue_date, grand_total, tax_total, payment_amount, payment_date')
          .eq('business_id', businessId)
          .in('document_type', ['invoice', 'quotation'])
          .eq('status', 'Approved')
          .order('id')
          .range(from, to)
      ),
      // ✅ CHANGE: sales_payments bhi Quotation + Invoice dono ki
      fetchAll((from, to) =>
        supabase
          .from('sales_payments')
          .select(
            'id, document_id, payment_date, amount, sales_documents!inner(business_id, document_type, status)'
          )
          .eq('sales_documents.business_id', businessId)
          .in('sales_documents.document_type', ['invoice', 'quotation'])
          .eq('sales_documents.status', 'Approved')
          .order('id')
          .range(from, to)
      ),
      fetchAll((from, to) =>
        supabase
          .from('sales_returns')
          .select('id, return_date, subtotal')
          .eq('business_id', businessId)
          .order('id')
          .range(from, to)
      ),
      // ✅ CHANGE: COGS bhi Quotation + Invoice dono ka
      fetchAll((from, to) =>
        supabase
          .from('sales_document_lines')
          .select(
            'id, quantity, cost_price, sales_documents!inner(issue_date, business_id, document_type, status)'
          )
          .eq('sales_documents.business_id', businessId)
          .in('sales_documents.document_type', ['invoice', 'quotation'])
          .eq('sales_documents.status', 'Approved')
          .order('id')
          .range(from, to)
      ),
      fetchAll((from, to) =>
        supabase
          .from('sales_return_items')
          .select(
            'id, return_qty, sales_document_lines(cost_price), sales_returns!inner(business_id, return_date)'
          )
          .eq('sales_returns.business_id', businessId)
          .order('id')
          .range(from, to)
      ),
      fetchAll((from, to) =>
        supabase
          .from('purchase_orders')
          .select('id, order_date, payment_amount')
          .eq('business_id', businessId)
          .neq('status', 'Cancelled')
          .order('id')
          .range(from, to)
      ),
      fetchAll((from, to) =>
        supabase
          .from('purchase_payments')
          .select(
            'id, order_id, payment_date, amount, purchase_orders!inner(business_id, status)'
          )
          .eq('purchase_orders.business_id', businessId)
          .neq('purchase_orders.status', 'Cancelled')
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
      fetchAll((from, to) =>
        supabase
          .from('expenses')
          .select('id, expense_date, category, amount')
          .eq('business_id', businessId)
          .order('id')
          .range(from, to)
      ),
    ]);

    // ---------------- month window + accumulators ----------------
    const keys = monthKeys();
    const keyIndex: Record<string, number> = {};
    const buckets: Record<string, Bucket> = {};
    keys.forEach((k, i) => {
      keyIndex[k] = i;
      buckets[k] = { revenue: 0, cogs: 0, otherExp: 0, inflow: 0, outflow: 0 };
    });
    const heat: number[][] = Array.from({ length: 7 }, () => keys.map(() => 0));

    const bucketOf = (ymd: unknown): Bucket | undefined =>
      isYMD(ymd) ? buckets[ymd.slice(0, 7)] : undefined;

    const addHeat = (ymd: string, cents: number): void => {
      const idx = keyIndex[ymd.slice(0, 7)];
      if (idx === undefined) return;
      heat[weekdayOf(ymd)][idx] += Math.abs(cents);
    };
    const addRevenue = (ymd: unknown, cents: number): void => {
      const b = bucketOf(ymd);
      if (b) b.revenue += cents;
    };
    const addCogs = (ymd: unknown, cents: number): void => {
      const b = bucketOf(ymd);
      if (b) b.cogs += cents;
    };
    const addInflow = (ymd: unknown, cents: number): void => {
      const b = bucketOf(ymd);
      if (!b || !isYMD(ymd)) return;
      b.inflow += cents;
      addHeat(ymd, cents);
    };
    const addOutflow = (ymd: unknown, cents: number): void => {
      const b = bucketOf(ymd);
      if (!b || !isYMD(ymd)) return;
      b.outflow += cents;
      addHeat(ymd, cents);
    };

    // ---------------- Sales ----------------
    const paidByDoc = new Map<string, number>();
    for (const p of salesPayments) {
      const c = toCents(p.amount);
      addInflow(p.payment_date, c);
      paidByDoc.set(p.document_id, (paidByDoc.get(p.document_id) || 0) + c);
    }
    for (const d of documents) {
      addRevenue(d.issue_date, toCents(d.grand_total) - toCents(d.tax_total));
      const residual = toCents(d.payment_amount) - (paidByDoc.get(d.id) || 0);
      if (residual > 0) addInflow(d.payment_date || d.issue_date, residual);
    }

    // ---------------- Returns ----------------
    for (const r of returns) addRevenue(r.return_date, -toCents(r.subtotal));

    // ---------------- COGS ----------------
    let cogsTotal = 0;
    for (const l of lines) {
      const qty = Number(l.quantity) || 0;
      if (qty <= 0) continue;
      const c = qty * toCents(l.cost_price);
      cogsTotal += c;
      addCogs(one(l.sales_documents).issue_date, c);
    }
    for (const ri of returnItems) {
      const qty = Number(ri.return_qty) || 0;
      if (qty <= 0) continue;
      const c = qty * toCents(one(ri.sales_document_lines).cost_price);
      cogsTotal -= c;
      addCogs(one(ri.sales_returns).return_date, -c);
    }
    cogsTotal = Math.max(0, cogsTotal);

    // ---------------- Purchases ----------------
    const paidByOrder = new Map<string, number>();
    let purchasesTotal = 0;
    for (const p of purchasePayments) {
      const c = toCents(p.amount);
      addOutflow(p.payment_date, c);
      purchasesTotal += c;
      paidByOrder.set(p.order_id, (paidByOrder.get(p.order_id) || 0) + c);
    }
    for (const o of orders) {
      const residual = toCents(o.payment_amount) - (paidByOrder.get(o.id) || 0);
      if (residual > 0) {
        purchasesTotal += residual;
        addOutflow(o.order_date, residual);
      }
    }

    // ---------------- Manual ----------------
    for (const t of manual) {
      const amt = toCents(t.amount);
      const isReturn =
        t.type === 'Return' || (t.type === 'Out' && t.status === 'Returned');

      if (isReturn) {
        addRevenue(t.txn_date, -amt);
      } else if (t.type === 'In') {
        addRevenue(t.txn_date, amt);
        if (t.status === 'Paid') addInflow(t.txn_date, amt);
      } else if (t.type === 'Out') {
        if (t.status === 'Paid') addOutflow(t.txn_date, amt);
      }
    }

    // ---------------- Expenses ----------------
    let salaries = 0;
    let personalUse = 0;
    let otherCat = 0;
    for (const e of expenses) {
      const amt = toCents(e.amount);
      const cat = String(e.category || '').trim().toLowerCase();
      if (cat === 'salaries' || cat === 'salary') salaries += amt;
      else if (cat === 'personal use' || cat === 'personal') personalUse += amt;
      else otherCat += amt;

      const b = bucketOf(e.expense_date);
      if (b) b.otherExp += amt;
      addOutflow(e.expense_date, amt);
    }

    // ---------------- Final ----------------
    const months: MonthPoint[] = keys.map((k) => {
      const b = buckets[k];
      const expensesC = b.cogs + b.otherExp;
      return {
        key: k,
        revenue: fromCents(b.revenue),
        expenses: fromCents(expensesC),
        profit: fromCents(b.revenue - expensesC),
        inflow: fromCents(b.inflow),
        outflow: fromCents(b.outflow),
      };
    });

    const result = {
      months,
      heat: heat.map((row) => row.map(fromCents)),
      expenseTotals: {
        cogs: fromCents(cogsTotal),
        salaries: fromCents(salaries),
        personalUse: fromCents(personalUse),
        other: fromCents(otherCat),
        purchases: fromCents(purchasesTotal),
      },
    };
    saveCachedChartsData(businessId, result);
    return result;
  },
};