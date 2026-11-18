import { recordsService, type RecordsDocument } from './recordsService';

const toCents = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};
const fromCents = (c: number): number => Math.round(c) / 100;

const getReturnGrossCents = (salesReturn: Record<string, unknown>): number =>
  toCents(
    salesReturn.total_return_amount ??
      (Number(salesReturn.subtotal || 0) + Number(salesReturn.tax_total || 0))
  );

const getNetReturnCents = (
  document: RecordsDocument,
  salesReturn: Record<string, unknown>
): number => {
  const items = Array.isArray(salesReturn.items)
    ? (salesReturn.items as Record<string, unknown>[])
    : [];
  if (items.length === 0) {
    return Math.max(
      0,
      getReturnGrossCents(salesReturn) - toCents(salesReturn.tax_total)
    );
  }

  return items.reduce((totalC: number, item: Record<string, unknown>) => {
    const line = document.lines.find(
      (candidate: Record<string, unknown>) =>
        String(candidate.id) ===
        String(item.line_id ?? item.lineId ?? '')
    );
    const itemSubtotal = Number(item.subtotal) || 0;
    const itemTax = Number(item.tax_amount ?? item.taxAmount) || 0;
    const grossC = toCents(
      item.total_amount ?? item.totalAmount ?? itemSubtotal + itemTax
    );
    if (!line) {
      return (
        totalC +
        Math.max(0, grossC - toCents(item.tax_amount ?? item.taxAmount))
      );
    }

    const originalQuantity = Number(line.quantity) || 0;
    const returnedQuantity = Number(item.return_qty ?? item.returnQty) || 0;
    const documentSubtotal = Number(document.subtotal) || 0;
    const lineShare =
      documentSubtotal > 0
        ? (Number(line.line_total) || 0) / documentSubtotal
        : 0;
    const lineTaxC = toCents(document.tax_total) * lineShare;
    const returnedTaxC =
      originalQuantity > 0
        ? Math.round((lineTaxC * returnedQuantity) / originalQuantity)
        : 0;

    return totalC + Math.max(0, grossC - returnedTaxC);
  }, 0);
};

export const recordBookStatsService = {
  async getSalesStats() {
    const docs = (await recordsService.getDocuments()).filter(
      (doc) => doc.status === 'Approved'
    );

    if (docs.length === 0) {
      return {
        totalSales: 0,
        receivedAmount: 0,
        returnAmount: 0,
        pendingAmount: 0,
        totalInvoices: 0,
      };
    }

    let salesGrossC = 0;
    let receivedC = 0;
    let pendingC = 0;
    let returnNetC = 0;
    let returnGrossC = 0;

    for (const d of docs) {
      const grand = toCents(d.grand_total);
      const paid = toCents(d.payment_amount);
      const tax = toCents(d.tax_total);
      salesGrossC += grand;

      const receivedGross =
        d.payment_status === 'Paid'
          ? grand
          : d.payment_status === 'Partially Paid'
            ? paid
            : 0;
      if (receivedGross > 0) {
        const receivedTax =
          grand > 0
            ? Math.round((tax * Math.min(receivedGross, grand)) / grand)
            : 0;
        receivedC += receivedGross - receivedTax;
      }

      if (d.payment_status === 'Partially Paid') {
        pendingC += Math.max(0, grand - paid);
      } else if (d.payment_status === 'Unpaid') {
        pendingC += grand;
      }
      for (const returned of d.returns || []) {
        returnNetC += getNetReturnCents(d, returned);
        returnGrossC += getReturnGrossCents(returned);
      }
    }

    return {
      totalSales: fromCents(Math.max(0, salesGrossC - returnGrossC)),
      receivedAmount: fromCents(receivedC - returnNetC),
      returnAmount: fromCents(returnGrossC),
      pendingAmount: fromCents(pendingC),
      totalInvoices: docs.length,
    };
  },
};