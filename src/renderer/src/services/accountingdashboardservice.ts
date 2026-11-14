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

// ============================================================
// SERVICE
// ============================================================
export const accountingDashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    const businessId = await getCurrentBusinessId();

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
            .select('id, subtotal')
            .eq('business_id', businessId)
            .order('id')
            .range(from, to)
        ),
        fetchAll((from, to) =>
          supabase
            .from('sales_return_items')
            .select(
              'id, return_qty, sales_document_lines(cost_price), sales_returns!inner(business_id)'
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

    let salesReturns = 0;
    for (const r of returns) salesReturns += toCents(r.subtotal);

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
    const totalRevenue = salesRevenue + manualIn - salesReturns - manualReturns;
    const netProfit = totalRevenue - cogs - otherExpenses;
    const cashInBank =
      cashFromDocuments + manualCashIn - (cashToVendors + manualCashOut) - otherExpenses;
    const receivables = documentReceivables + manualReceivable;
    const payables = vendorPayables + manualPayable;

    return {
      totalRevenue: fromCents(totalRevenue),
      netProfit: fromCents(netProfit),
      cashInBank: fromCents(cashInBank),
      payables: fromCents(payables),
      receivables: fromCents(receivables),
      cogs: fromCents(cogs),
      otherExpenses: fromCents(otherExpenses),
    };
  },
};