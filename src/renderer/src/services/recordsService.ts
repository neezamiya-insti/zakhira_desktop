/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase, getCurrentBusinessId } from '../lib/supabaseClient';

// ============================================================
// TYPES
// ============================================================
export type RecordsDocument = {
  id: string;
  document_type: 'invoice' | 'quotation';
  order_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_company: string | null;
  customer_phone: string | null;
  customer_phone_alt: string | null;
  customer_email: string | null;
  customer_address: string | null;
  customer_city: string | null;
  issue_date: string;
  due_date: string | null;
  sales_channel: 'Online' | 'Offline';
  status: 'Pending' | 'Approved' | 'Rejected';
  currency: string;
  notes: string | null;
  vat_number: string | null;
  vat_rate: number;
  subtotal: number;
  discount_total: number;
  tax_total: number;
  grand_total: number;
  payment_status: 'Unpaid' | 'Partially Paid' | 'Paid';
  payment_method: string | null;
  payment_amount: number;
  payment_date: string | null;
  payment_reference: string | null;
  balance_due: number;
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  lines: any[];
  payments: any[]; // + recorded_by_name
  returns: any[]; // + items[], linked_transaction_no, created_by_name
  history: any[]; // + changed_by_name
};

export type ReturnInput = {
  documentId: string;
  documentRef: string;
  documentStatus: 'Pending' | 'Approved' | 'Rejected';
  customerName: string;
  customerCompany: string;
  date: string;
  reason: string;
  notes?: string;
  items: Array<{
    lineId: string;
    productId: string;
    productName: string;
    price: number;
    originalQty: number;
    returnQty: number;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
  }>;
  subtotal: number;
  taxTotal: number;
  totalReturnAmount: number;
};

export type CompanyInfo = {
  name: string;
  address: string;
  phone: string;
  vat: string;
};

type Status = 'Pending' | 'Approved' | 'Rejected';

// ============================================================
// HELPERS
// ============================================================
const round = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;
const today = (): string => new Date().toISOString().split('T')[0];

const getUser = (): { id: string } => {
  const raw = localStorage.getItem('zakhira_user');
  if (!raw) throw new Error('User not logged in');
  const u = JSON.parse(raw);
  if (!u?.id) throw new Error('User not logged in');
  return { id: u.id };
};

const mapMode = (m?: string | null): 'Cash' | 'Card' | 'Bank Transfer' | 'Other' =>
  m === 'Bank Transfer' ? 'Bank Transfer' : m === 'Card' ? 'Card' : m === 'Other' ? 'Other' : 'Cash';

// transaction_no VARCHAR(20): "TXN-" + 13 digit timestamp (+ small offset) = 17 chars
const txnNo = (offset = 0): string => `TXN-${Date.now() + offset}`;

const unique = <T,>(arr: T[]): T[] => Array.from(new Set(arr.filter(Boolean)));

async function insertInTxn(
  businessId: string,
  doc: any,
  payment: any,
  offset = 0
): Promise<void> {
  const { error } = await supabase.from('accounting_transactions').insert([
    {
      business_id: businessId,
      transaction_no: txnNo(offset),
      txn_date: payment.payment_date || today(),
      customer_name: doc.customer_name,
      company_name: doc.customer_company || '',
      invoice_ref: doc.order_number,
      type: 'In',
      amount: payment.amount,
      status: Number(payment.balance_after) > 0 ? 'Partially Paid' : 'Paid',
      mode: mapMode(payment.method),
      source_module: 'sales',
      sales_document_id: doc.id,
      sales_payment_id: payment.id,
      notes: `Payment received for ${doc.order_number} (Balance after: ${payment.balance_after})${
        payment.note ? ` — ${payment.note}` : ''
      }`,
    },
  ]);
  if (error) throw error;
}

// ============================================================
// SERVICE
// ============================================================
export const recordsService = {
  // ----------------------------------------------------------
  // All documents with lines, payments, returns (+items) and history
  // ----------------------------------------------------------
  async getDocuments(): Promise<RecordsDocument[]> {
    const businessId = await getCurrentBusinessId();

    const { data: docs, error } = await supabase
      .from('sales_documents')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!docs || docs.length === 0) return [];

    const ids = docs.map((d) => d.id);

    const [lines, payments, returns, history] = await Promise.all([
      supabase.from('sales_document_lines').select('*').in('document_id', ids),
      supabase.from('sales_payments').select('*').in('document_id', ids).order('created_at', { ascending: true }),
      supabase.from('sales_returns').select('*').in('document_id', ids).order('created_at', { ascending: true }),
      supabase.from('sales_status_history').select('*').in('document_id', ids).order('changed_at', { ascending: true }),
    ]);

    const returnRows = returns.data || [];
    const returnIds = returnRows.map((r) => r.id);
    const linkedTxnIds = unique(returnRows.map((r) => r.linked_transaction_id));

    const [retItems, txns] = await Promise.all([
      returnIds.length
        ? supabase.from('sales_return_items').select('*').in('return_id', returnIds)
        : Promise.resolve({ data: [] as any[] }),
      linkedTxnIds.length
        ? supabase.from('accounting_transactions').select('id, transaction_no').in('id', linkedTxnIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    // profile names (created_by / recorded_by / changed_by are UUIDs)
    const profileIds = unique<string>([
      ...docs.map((d) => d.created_by),
      ...(payments.data || []).map((p) => p.recorded_by),
      ...returnRows.map((r) => r.created_by),
      ...(history.data || []).map((h) => h.changed_by),
    ]);
    const { data: profiles } = profileIds.length
      ? await supabase.from('profiles').select('id, name, email').in('id', profileIds)
      : { data: [] as any[] };
    const nameOf = (id?: string | null): string => {
      const p = (profiles || []).find((x: any) => x.id === id);
      return p?.name || p?.email || '';
    };
    const txnNoOf = (id?: string | null): string =>
      ((txns.data || []).find((t: any) => t.id === id) as any)?.transaction_no || '';

    return docs.map((doc) => ({
      ...doc,
      created_by_name: nameOf(doc.created_by),
      lines: (lines.data || []).filter((l) => l.document_id === doc.id),
      payments: (payments.data || [])
        .filter((p) => p.document_id === doc.id)
        .map((p) => ({ ...p, recorded_by_name: nameOf(p.recorded_by) })),
      returns: returnRows
        .filter((r) => r.document_id === doc.id)
        .map((r) => ({
          ...r,
          items: ((retItems.data || []) as any[]).filter((i) => i.return_id === r.id),
          linked_transaction_no: txnNoOf(r.linked_transaction_id),
          created_by_name: nameOf(r.created_by),
        })),
      history: (history.data || [])
        .filter((h) => h.document_id === doc.id)
        .map((h) => ({ ...h, changed_by_name: nameOf(h.changed_by) })),
    })) as RecordsDocument[];
  },

  // ----------------------------------------------------------
  // Company info for printing
  // ----------------------------------------------------------
  async getCompanyInfo(): Promise<CompanyInfo> {
    const businessId = await getCurrentBusinessId();
    const { data } = await supabase
      .from('businesses')
      .select('name, address, city, phone, vat_number')
      .eq('id', businessId)
      .single();
    return {
      name: data?.name || 'Zakhira',
      address: [data?.address, data?.city].filter(Boolean).join(', '),
      phone: data?.phone || '',
      vat: data?.vat_number || '',
    };
  },

  // ----------------------------------------------------------
  // Status change + history (+ accounting cleanup on reject)
  // ----------------------------------------------------------
  async updateStatus(documentId: string, oldStatus: Status, newStatus: Status, reason: string) {
    const user = getUser();

    const { data, error } = await supabase
      .from('sales_documents')
      .update({ status: newStatus })
      .eq('id', documentId)
      .select()
      .single();
    if (error) throw error;

    const { error: hErr } = await supabase.from('sales_status_history').insert([
      {
        document_id: documentId,
        old_status: oldStatus,
        new_status: newStatus,
        reason: reason.slice(0, 255),
        changed_by: user.id,
      },
    ]);
    if (hErr) throw hErr;

    if (newStatus === 'Rejected') {
      await supabase
        .from('accounting_transactions')
        .delete()
        .eq('sales_document_id', documentId)
        .eq('type', 'In');
    }

    return data;
  },

  // ----------------------------------------------------------
  // Add payment (totals computed from DB, not from the UI)
  // ----------------------------------------------------------
  async addPayment(documentId: string, p: { amount: number; method: string; note?: string }) {
    const businessId = await getCurrentBusinessId();
    const user = getUser();

    const { data: current, error: curErr } = await supabase
      .from('sales_documents')
      .select('*')
      .eq('id', documentId)
      .single();
    if (curErr) throw curErr;

    const grand = Number(current.grand_total);
    const paid = Number(current.payment_amount || 0);
    const remaining = round(grand - paid);
    if (!(p.amount > 0) || p.amount > remaining + 0.001) throw new Error('Invalid payment amount');

    const newPaid = round(paid + p.amount);
    const newBalance = round(Math.max(0, grand - newPaid));
    const newStatus = newBalance <= 0 ? 'Paid' : 'Partially Paid';

    const { data: payRow, error: payErr } = await supabase
      .from('sales_payments')
      .insert([
        {
          document_id: documentId,
          payment_date: today(),
          amount: p.amount,
          method: mapMode(p.method),
          note: p.note ? p.note.slice(0, 255) : null,
          balance_after: newBalance,
          recorded_by: user.id,
        },
      ])
      .select()
      .single();
    if (payErr) throw payErr;

    const { data: doc, error: docErr } = await supabase
      .from('sales_documents')
      .update({
        payment_status: newStatus,
        payment_amount: newPaid,
        balance_due: newBalance,
        payment_method: current.payment_method || mapMode(p.method),
        payment_date: today(),
        payment_reference: p.note ? p.note.slice(0, 255) : current.payment_reference,
      })
      .eq('id', documentId)
      .select()
      .single();
    if (docErr) throw docErr;

    await insertInTxn(businessId, doc, payRow);
    return doc;
  },

  // ----------------------------------------------------------
  // If a document lost its accounting rows (e.g. it was rejected before),
  // recreate them from its payments.
  // ----------------------------------------------------------
  async ensureAccountingForPayments(documentId: string) {
    const businessId = await getCurrentBusinessId();
    const { data: existing } = await supabase
      .from('accounting_transactions')
      .select('id')
      .eq('sales_document_id', documentId)
      .eq('type', 'In')
      .limit(1);
    if (existing && existing.length > 0) return;

    const { data: doc } = await supabase.from('sales_documents').select('*').eq('id', documentId).single();
    const { data: pays } = await supabase
      .from('sales_payments')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: true });
    if (!doc || !pays) return;

    for (let i = 0; i < pays.length; i++) {
      await insertInTxn(businessId, doc, pays[i], i);
    }
  },

  // ----------------------------------------------------------
  // Approve (optionally with a payment)
  // NOTE: stock is NOT touched here — salesService.createDocument
  // already deducts stock when an invoice is created.
  // ----------------------------------------------------------
  async approveDocument(
    documentId: string,
    oldStatus: Status,
    payment?: { amount: number; method: string; note?: string }
  ) {
    await this.ensureAccountingForPayments(documentId);
    if (payment && payment.amount > 0) {
      await this.addPayment(documentId, payment);
    }
    return this.updateStatus(documentId, oldStatus, 'Approved', 'Approved');
  },

  // ----------------------------------------------------------
  // Return
  // ----------------------------------------------------------
  async addReturn(input: ReturnInput) {
    const businessId = await getCurrentBusinessId();
    const user = getUser();

    // Return number: RET-YYYY-0001 (max + 1 for this year)
    const year = new Date().getFullYear();
    const prefix = `RET-${year}-`;
    const { data: last } = await supabase
      .from('sales_returns')
      .select('return_number')
      .eq('business_id', businessId)
      .like('return_number', `${prefix}%`)
      .order('return_number', { ascending: false })
      .limit(1);
    const lastNum = last && last[0] ? Number(last[0].return_number.split('-')[2]) || 0 : 0;
    const returnNumber = `${prefix}${String(lastNum + 1).padStart(4, '0')}`;

    // original "In" transaction (for linking)
    const { data: originals } = await supabase
      .from('accounting_transactions')
      .select('id')
      .eq('sales_document_id', input.documentId)
      .eq('type', 'In')
      .order('created_at', { ascending: false })
      .limit(1);
    const originalTxnId = originals && originals[0] ? originals[0].id : null;

    // 1. accounting "Out" entry
    const { data: txn, error: accErr } = await supabase
      .from('accounting_transactions')
      .insert([
        {
          business_id: businessId,
          transaction_no: txnNo(),
          txn_date: input.date,
          customer_name: input.customerName,
          company_name: input.customerCompany || '',
          invoice_ref: input.documentRef,
          type: 'Out',
          amount: input.totalReturnAmount,
          status: 'Returned',
          mode: 'Other',
          source_module: 'sales',
          sales_document_id: input.documentId,
          original_transaction_id: originalTxnId,
          notes: `Return ${returnNumber}: ${input.reason}${input.notes ? ` — ${input.notes}` : ''}`,
        },
      ])
      .select()
      .single();
    if (accErr) throw accErr;

    // mark original "In" rows as having a return
    await supabase
      .from('accounting_transactions')
      .update({ has_return: true })
      .eq('sales_document_id', input.documentId)
      .eq('type', 'In');

    // 2. return header
    const { data: ret, error: retErr } = await supabase
      .from('sales_returns')
      .insert([
        {
          business_id: businessId,
          return_number: returnNumber,
          document_id: input.documentId,
          linked_transaction_id: txn.id,
          return_date: input.date,
          reason: input.reason.slice(0, 255),
          notes: input.notes ? input.notes.slice(0, 255) : null,
          subtotal: input.subtotal,
          tax_total: input.taxTotal,
          total_return_amount: input.totalReturnAmount,
          created_by: user.id,
        },
      ])
      .select()
      .single();
    if (retErr) throw retErr;

    // 3. return items
    const { error: itemsErr } = await supabase.from('sales_return_items').insert(
      input.items.map((it) => ({
        return_id: ret.id,
        line_id: it.lineId,
        product_name: it.productName,
        price: it.price,
        original_qty: it.originalQty,
        return_qty: it.returnQty,
        subtotal: it.subtotal,
        tax_amount: it.taxAmount,
        total_amount: it.totalAmount,
      }))
    );
    if (itemsErr) throw itemsErr;

    // 4. stock back in
    for (const it of input.items) {
      if (!it.productId) continue;
      const { data: product } = await supabase
        .from('products')
        .select('stock')
        .eq('id', it.productId)
        .single();
      if (!product) continue;
      const after = Number(product.stock) + it.returnQty;
      await supabase.from('products').update({ stock: after }).eq('id', it.productId);
      await supabase.from('stock_movements').insert([
        {
          business_id: businessId,
          product_id: it.productId,
          movement_type: 'return',
          qty: it.returnQty,
          before_qty: product.stock,
          after_qty: after,
          reference: returnNumber,
          sales_document_id: input.documentId,
          movement_date: input.date,
          created_by: user.id,
        },
      ]);
    }

    // 5. history entry (new_status is NOT NULL, so keep current status)
    await supabase.from('sales_status_history').insert([
      {
        document_id: input.documentId,
        old_status: input.documentStatus,
        new_status: input.documentStatus,
        reason: `Returned ${input.items.length} item(s) — ${returnNumber}`.slice(0, 255),
        changed_by: user.id,
      },
    ]);

    return { ...ret, linked_transaction_no: txn.transaction_no as string };
  },
};