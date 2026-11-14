import { supabase, getCurrentBusinessId } from '../lib/supabaseClient';

// ============================================================
// TYPES
// ============================================================
export type DocumentLineInput = {
  productId: string;
  material: string;
  sku: string;
  category?: string;
  costPrice: number;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountValue: number;
  lineTotal: number;
};

export type SalesDocumentInput = {
  documentType: 'invoice' | 'quotation';
  orderNumber: string;
  customerId: string | null;
  customerName: string;
  customerCompany?: string;
  customerPhone?: string;
  customerPhoneAlt?: string;
  customerEmail?: string;
  customerAddress?: string;
  customerCity?: string;
  issueDate: string;
  dueDate?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  currency: string;
  notes?: string;
  vatNumber?: string;
  vatRate: number;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  paymentStatus: 'Unpaid' | 'Partially Paid' | 'Paid';
  paymentMethod?: string | null;
  paymentAmount: number;
  balanceDue: number;
  lines: DocumentLineInput[];
};

export const salesService = {
  // ============================================================
  // 📄 CREATE DOCUMENT (INVOICE / QUOTATION)
  // ============================================================
  async createDocument(data: SalesDocumentInput) {
    const businessId = await getCurrentBusinessId();
    const userStr = localStorage.getItem('zakhira_user');
    if (!userStr) throw new Error("User not logged in");
    const user = JSON.parse(userStr);

    // 1. Main Document Insert
    const { data: doc, error: docError } = await supabase
      .from('sales_documents')
      .insert([{
        business_id: businessId,
        document_type: data.documentType,
        order_number: data.orderNumber,
        customer_id: data.customerId || null,
        customer_name: data.customerName,
        customer_company: data.customerCompany || null,
        customer_phone: data.customerPhone || null,
        customer_phone_alt: data.customerPhoneAlt || null,
        customer_email: data.customerEmail || null,
        customer_address: data.customerAddress || null,
        customer_city: data.customerCity || null,
        issue_date: data.issueDate,
        due_date: data.dueDate || data.issueDate,
        status: data.status,
        currency: data.currency,
        notes: data.notes || null,
        vat_number: data.vatNumber || null,
        vat_rate: data.vatRate,
        subtotal: data.subtotal,
        discount_total: data.discountTotal,
        tax_total: data.taxTotal,
        grand_total: data.grandTotal,
        payment_status: data.paymentStatus,
        payment_method: data.paymentMethod || null,
        payment_amount: data.paymentAmount,
        balance_due: data.balanceDue,
        created_by: user.id,
      }])
      .select()
      .single();

    if (docError) throw docError;

    // 2. Lines Insert
    if (data.lines.length > 0) {
      const lines = data.lines.map(line => ({
        document_id: doc.id,
        product_id: line.productId,
        material: line.material,
        sku: line.sku,
        category: line.category || null,
        description: line.description || null,
        cost_price: line.costPrice,
        quantity: line.quantity,
        unit_price: line.unitPrice,
        discount_type: 'percentage',
        discount_value: line.discountValue,
        line_total: line.lineTotal,
      }));

      const { error: linesError } = await supabase
        .from('sales_document_lines')
        .insert(lines);

      if (linesError) throw linesError;
    }

    // 3. Payment Insert (Agar paisa mila hai)
    if (data.paymentAmount > 0) {
      const { error: payError } = await supabase
        .from('sales_payments')
        .insert([{
          document_id: doc.id,
          payment_date: data.issueDate,
          amount: data.paymentAmount,
          method: data.paymentMethod || 'Cash',
          balance_after: data.balanceDue,
          recorded_by: user.id,
        }]);

      if (payError) console.error("Payment save error:", payError);
    }

    // 4. Accounting Insert
    if (data.paymentAmount > 0) {
      await supabase.from('accounting_transactions').insert([{
        business_id: businessId,
        transaction_no: `TXN-${Date.now()}`,
        txn_date: data.issueDate,
        customer_name: data.customerName,
        company_name: data.customerCompany || '',
        invoice_ref: data.orderNumber,
        type: 'In',
        amount: data.paymentAmount,
        status: data.paymentStatus === 'Paid' ? 'Paid' : 'Partially Paid',
        mode: data.paymentMethod === 'Bank Transfer' ? 'Bank Transfer' : data.paymentMethod === 'Card' ? 'Card' : 'Cash',
        source_module: 'sales',
        sales_document_id: doc.id,
      }]);
    }

    // 5. Stock Update (Sirf Invoice ke liye)
    if (data.documentType === 'invoice') {
      for (const line of data.lines) {
        // Pehle current stock nikaalo
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', line.productId)
          .single();

        if (product) {
          const newStock = product.stock - line.quantity;
          
          // Update product stock
          await supabase
            .from('products')
            .update({ stock: Math.max(0, newStock) })
            .eq('id', line.productId);

          // Stock movement log
          await supabase.from('stock_movements').insert([{
            business_id: businessId,
            product_id: line.productId,
            movement_type: 'sale',
            qty: -line.quantity,
            before_qty: product.stock,
            after_qty: Math.max(0, newStock),
            reference: data.orderNumber,
            sales_document_id: doc.id,
            movement_date: data.issueDate,
            created_by: user.id,
          }]);
        }
      }
    }

    return doc;
  },

  // ============================================================
  // 📄 GET DOCUMENTS
  // ============================================================
  async getDocuments(type?: 'invoice' | 'quotation') {
    const businessId = await getCurrentBusinessId();
    
    let query = supabase
      .from('sales_documents')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('document_type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // ============================================================
  // 📄 GET DOCUMENT LINES
  // ============================================================
  async getDocumentLines(documentId: string) {
    const { data, error } = await supabase
      .from('sales_document_lines')
      .select('*')
      .eq('document_id', documentId);

    if (error) throw error;
    return data || [];
  }
};