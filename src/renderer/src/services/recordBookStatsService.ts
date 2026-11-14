import { supabase, getCurrentBusinessId } from '../lib/supabaseClient';

const toCents = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};
const fromCents = (c: number): number => Math.round(c) / 100;

export const recordBookStatsService = {
  async getSalesStats() {
    const businessId = await getCurrentBusinessId();

    const [docsRes, returnsRes] = await Promise.all([
      supabase
        .from('sales_documents')
        .select('id, grand_total, tax_total, payment_amount, payment_status')
        .eq('business_id', businessId)
        .eq('status', 'Approved'), // Quotation + Invoice both
      supabase
        .from('sales_returns')
        .select('id, subtotal')
        .eq('business_id', businessId),
    ]);

    if (docsRes.error) throw docsRes.error;
    if (returnsRes.error) throw returnsRes.error;

    const docs = docsRes.data || [];
    const returns = returnsRes.data || [];

    if (docs.length === 0) {
      return { totalSales: 0, receivedAmount: 0, pendingAmount: 0, totalInvoices: 0 };
    }

    // Net sales = (grand_total - tax_total) - returns  (same as Accounting)
    let salesC = 0;
    let receivedC = 0;
    let pendingC = 0;

    for (const d of docs) {
      const grand = toCents(d.grand_total);
      const paid = toCents(d.payment_amount);
      salesC += grand - toCents(d.tax_total);

      if (d.payment_status === 'Paid') {
        receivedC += grand;
      } else if (d.payment_status === 'Partially Paid') {
        receivedC += paid;
        pendingC += Math.max(0, grand - paid);
      } else if (d.payment_status === 'Unpaid') {
        pendingC += grand;
      }
    }

    let returnsC = 0;
    for (const r of returns) returnsC += toCents(r.subtotal);

    return {
      totalSales: fromCents(salesC - returnsC),
      receivedAmount: fromCents(receivedC),
      pendingAmount: fromCents(pendingC),
      totalInvoices: docs.length,
    };
  },
};