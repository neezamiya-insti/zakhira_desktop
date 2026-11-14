/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase, getCurrentBusinessId } from '../lib/supabaseClient';

// ============================================================
// TYPES (UI shape — same field names the AccountingPage already uses)
// ============================================================
export type TransactionType = 'In' | 'Out' | 'Return';
export type PaymentMode = 'Cash' | 'Card' | 'Bank Transfer' | 'Other';
export type TxnStatus = 'Paid' | 'Partially Paid' | 'Returned';

export type AccountingTransaction = {
  id: string;
  transactionNo: string;
  date: string;
  customerName: string;
  companyName: string;
  invoiceRef: string;
  invoiceFile?: string;
  invoiceFileName?: string;
  type: TransactionType;
  amount: number;
  status: TxnStatus;
  mode: PaymentMode;
  linkedInvoiceId?: string; // sales_documents.id
  sourceDocumentId?: string; // sales_documents.id
  sourceModule?: 'sales' | 'inventory' | 'manual';
  notes?: string;
  createdAt: string;
  hasReturn?: boolean;
  returnTransactionId?: string;
  originalTransactionId?: string; // transaction_no of the original "In" entry
  returnNumber?: string;
};

export type NewTransactionInput = {
  type: TransactionType;
  date: string;
  customerName: string;
  companyName?: string;
  invoiceRef?: string;
  invoiceFile?: string;
  invoiceFileName?: string;
  amount: number;
  status: TxnStatus;
  mode: PaymentMode;
  notes?: string;
  // only for type === 'Return'
  originalTransactionDbId?: string; // accounting_transactions.id of the original "In" row
  salesDocumentId?: string; // sales_documents.id (if the original came from sales)
};

export type RealInvoiceLine = {
  id: string;
  material: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type RealInvoice = {
  id: string;
  orderNumber: string;
  status: string;
  issueDate: string;
  createdAt: string;
  notes: string;
  vatRate: number;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  createdBy: string; // profile name
  customerSnapshot: {
    name: string;
    company: string;
    phone: string;
    address: string;
    city: string;
  };
  lines: RealInvoiceLine[];
};

// ============================================================
// HELPERS
// ============================================================
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PAGE = 1000;

const mapRow = (
  row: any,
  idToNo: Map<string, string>,
  returnNoByTxnId: Map<string, string>
): AccountingTransaction => ({
  id: row.id,
  transactionNo: row.transaction_no,
  date: row.txn_date,
  customerName: row.customer_name || '',
  companyName: row.company_name || '',
  invoiceRef: row.invoice_ref || '—',
  invoiceFile: row.invoice_file || undefined,
  invoiceFileName: row.invoice_file_name || undefined,
  type: row.type,
  amount: Number(row.amount),
  status: row.status,
  mode: row.mode,
  linkedInvoiceId: row.sales_document_id || undefined,
  sourceDocumentId: row.sales_document_id || undefined,
  sourceModule: row.source_module,
  notes: row.notes || undefined,
  createdAt: row.created_at,
  hasReturn: !!row.has_return,
  originalTransactionId: row.original_transaction_id
    ? idToNo.get(row.original_transaction_id) || undefined
    : undefined,
  returnNumber: returnNoByTxnId.get(row.id) || undefined,
});

// next "TXN-YYYY-0001" for this business
async function nextTransactionNo(businessId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `TXN-${year}-`;
  const { data } = await supabase
    .from('accounting_transactions')
    .select('transaction_no')
    .eq('business_id', businessId)
    .like('transaction_no', `${prefix}%`)
    .order('transaction_no', { ascending: false })
    .limit(1);
  const last = data && data[0] ? Number(String(data[0].transaction_no).split('-')[2]) : 0;
  const n = Number.isFinite(last) ? last : 0;
  return `${prefix}${String(n + 1).padStart(4, '0')}`;
}

// ============================================================
// SERVICE
// ============================================================
export const accountingService = {
  // ----------------------------------------------------------
  // All transactions for the current business (paged past 1000 rows)
  // ----------------------------------------------------------
  async getTransactions(): Promise<AccountingTransaction[]> {
    const businessId = await getCurrentBusinessId();

    const rows: any[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase
        .from('accounting_transactions')
        .select('*')
        .eq('business_id', businessId)
        .order('txn_date', { ascending: false })
        .order('created_at', { ascending: false })
        .range(from, from + PAGE - 1);
      if (error) throw error;
      rows.push(...(data || []));
      if (!data || data.length < PAGE) break;
    }

    const idToNo = new Map<string, string>(rows.map((r) => [r.id, r.transaction_no]));

    // return numbers (sales_returns.linked_transaction_id -> return_number)
    const { data: rets } = await supabase
      .from('sales_returns')
      .select('return_number, linked_transaction_id')
      .eq('business_id', businessId);
    const returnNoByTxnId = new Map<string, string>(
      (rets || [])
        .filter((r: any) => r.linked_transaction_id)
        .map((r: any) => [r.linked_transaction_id as string, r.return_number as string])
    );

    return rows.map((r) => mapRow(r, idToNo, returnNoByTxnId));
  },

  // ----------------------------------------------------------
  // Create a manual entry (In / Out / Return)
  // ----------------------------------------------------------
  async createTransaction(input: NewTransactionInput): Promise<AccountingTransaction> {
    const businessId = await getCurrentBusinessId();
    const isReturn = input.type === 'Return';

    if (isReturn && !input.originalTransactionDbId) {
      throw new Error('Return needs a linked original transaction');
    }

    let created: any = null;
    for (let attempt = 0; attempt < 4; attempt++) {
      const transaction_no = await nextTransactionNo(businessId);
      const { data, error } = await supabase
        .from('accounting_transactions')
        .insert([
          {
            business_id: businessId,
            transaction_no,
            txn_date: input.date,
            customer_name: input.customerName,
            company_name: input.companyName || null,
            invoice_ref: input.invoiceRef && input.invoiceRef !== '—' ? input.invoiceRef : null,
            type: input.type,
            amount: input.amount,
            status: isReturn ? 'Returned' : input.status,
            mode: input.mode,
            source_module: 'manual',
            sales_document_id: isReturn ? input.salesDocumentId || null : null,
            original_transaction_id: isReturn ? input.originalTransactionDbId || null : null,
            invoice_file: input.invoiceFile || null,
            invoice_file_name: input.invoiceFileName || null,
            notes: input.notes || null,
          },
        ])
        .select()
        .single();

      if (!error) {
        created = data;
        break;
      }
      // duplicate transaction_no (race) -> retry with the next number
      if ((error as any).code === '23505' && attempt < 3) continue;
      throw error;
    }

    if (isReturn && input.originalTransactionDbId) {
      await supabase
        .from('accounting_transactions')
        .update({ has_return: true })
        .eq('id', input.originalTransactionDbId);
    }

    const originalNo = created.original_transaction_id
      ? (
          await supabase
            .from('accounting_transactions')
            .select('transaction_no')
            .eq('id', created.original_transaction_id)
            .maybeSingle()
        ).data?.transaction_no
      : undefined;

    const idToNo = new Map<string, string>();
    if (created.original_transaction_id && originalNo) {
      idToNo.set(created.original_transaction_id, originalNo);
    }
    return mapRow(created, idToNo, new Map());
  },

  // ----------------------------------------------------------
  // Delete an entry (and clear has_return on the original if needed)
  // ----------------------------------------------------------
  async deleteTransaction(id: string): Promise<void> {
    const { data: row } = await supabase
      .from('accounting_transactions')
      .select('id, original_transaction_id')
      .eq('id', id)
      .maybeSingle();

    const { error } = await supabase.from('accounting_transactions').delete().eq('id', id);
    if (error) throw error;

    if (row?.original_transaction_id) {
      const { count } = await supabase
        .from('accounting_transactions')
        .select('id', { count: 'exact', head: true })
        .eq('original_transaction_id', row.original_transaction_id);
      if (!count) {
        await supabase
          .from('accounting_transactions')
          .update({ has_return: false })
          .eq('id', row.original_transaction_id);
      }
    }
  },

  // ----------------------------------------------------------
  // The real sales document behind a transaction (by id, else by order number)
  // ----------------------------------------------------------
  async getRealInvoice(id?: string, orderNumber?: string): Promise<RealInvoice | null> {
    const businessId = await getCurrentBusinessId();

    let doc: any = null;
    if (id && UUID_RE.test(id)) {
      const { data } = await supabase
        .from('sales_documents')
        .select('*')
        .eq('id', id)
        .eq('business_id', businessId)
        .maybeSingle();
      doc = data;
    }
    if (!doc && orderNumber && orderNumber !== '—') {
      const { data } = await supabase
        .from('sales_documents')
        .select('*')
        .eq('business_id', businessId)
        .eq('order_number', orderNumber)
        .maybeSingle();
      doc = data;
    }
    if (!doc) return null;

    const [{ data: lines }, { data: profile }] = await Promise.all([
      supabase.from('sales_document_lines').select('*').eq('document_id', doc.id),
      supabase.from('profiles').select('name, email').eq('id', doc.created_by).maybeSingle(),
    ]);

    return {
      id: doc.id,
      orderNumber: doc.order_number,
      status: doc.status,
      issueDate: doc.issue_date,
      createdAt: doc.created_at,
      notes: doc.notes || '',
      vatRate: Number(doc.vat_rate) || 0,
      subtotal: Number(doc.subtotal) || 0,
      discountTotal: Number(doc.discount_total) || 0,
      taxTotal: Number(doc.tax_total) || 0,
      grandTotal: Number(doc.grand_total) || 0,
      createdBy: profile?.name || profile?.email || '',
      customerSnapshot: {
        name: doc.customer_name || '',
        company: doc.customer_company || '',
        phone: doc.customer_phone || doc.customer_phone_alt || '',
        address: doc.customer_address || '',
        city: doc.customer_city || '',
      },
      lines: (lines || []).map((l: any) => ({
        id: l.id,
        material: l.material,
        quantity: Number(l.quantity),
        unitPrice: Number(l.unit_price),
        lineTotal: Number(l.line_total),
      })),
    };
  },
};