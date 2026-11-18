/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase, getCurrentBusinessId } from '../lib/supabaseClient';
import { accountingService } from './accountingservice';
import { orderService } from './orderservice';
import { productService } from './productService';
import { recordsService } from './recordsService';

// ============================================================
// TYPES
// ============================================================
export type DashboardStats = {
  totalSales: number;
  netProfit: number;
  receivedAmountTotal: number;
  receivables: number;
  inventoryValue: number;
  supplierPayables: number;
  lowStock: any[];
  outOfStock: any[];
  pendingPOs: any[];
  supplierDue: any[];
  recentInvoices: any[];
  activities: any[];
  monthly: any[];
  onlineSales: number;
  offlineSales: number;
  hasChannelData: boolean;
  top5: any[];
  lowStockDisplay: any[];
};

// ============================================================
// HELPERS
// ============================================================
const toCents = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};
const fromCents = (c: number): number => Math.round(c) / 100;

const one = (rel: any): any => (Array.isArray(rel) ? rel[0] : rel) || {};
const getNetReturnCents = (returnItem: any): number => {
  const line = one(returnItem.sales_document_lines);
  const document = one(line.sales_documents);
  const originalQuantity = Number(line.quantity) || 0;
  const returnedQuantity = Number(returnItem.return_qty) || 0;
  const documentSubtotal = Number(document.subtotal) || 0;
  const lineShare =
    documentSubtotal > 0
      ? (Number(line.line_total) || 0) / documentSubtotal
      : 0;
  const lineTaxCents = toCents(document.tax_total) * lineShare;
  const returnedTaxCents =
    originalQuantity > 0
      ? Math.round((lineTaxCents * returnedQuantity) / originalQuantity)
      : 0;

  return Math.max(0, toCents(returnItem.total_amount) - returnedTaxCents);
};
const BUSINESS_ID_KEY = 'zakhira_business_id';
const DASHBOARD_CACHE_KEY = 'zakhira_dashboard_cache';

type CachedDashboard = {
  businessId: string;
  userId: string;
  stats: DashboardStats;
  otherExpensesC: number;
  monthlyExpensesC: Record<string, number>;
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

const isDashboardStats = (value: unknown): value is DashboardStats => {
  if (!value || typeof value !== 'object') return false;
  const stats = value as Record<string, unknown>;
  return (
    [
      'totalSales',
      'netProfit',
      'receivedAmountTotal',
      'receivables',
      'inventoryValue',
      'supplierPayables',
      'onlineSales',
      'offlineSales',
    ].every(
      (key) => typeof stats[key] === 'number' && Number.isFinite(stats[key])
    ) &&
    typeof stats.hasChannelData === 'boolean' &&
    [
      'lowStock',
      'outOfStock',
      'pendingPOs',
      'supplierDue',
      'recentInvoices',
      'activities',
      'monthly',
      'top5',
      'lowStockDisplay',
    ].every((key) => Array.isArray(stats[key]))
  );
};

const getCachedDashboard = (): CachedDashboard | null => {
  try {
    const cached = JSON.parse(
      localStorage.getItem(DASHBOARD_CACHE_KEY) || 'null'
    ) as CachedDashboard | null;
    if (
      !cached?.businessId ||
      !isDashboardStats(cached.stats) ||
      !Number.isFinite(cached.otherExpensesC) ||
      !cached.monthlyExpensesC ||
      typeof cached.monthlyExpensesC !== 'object' ||
      Array.isArray(cached.monthlyExpensesC) ||
      !Object.values(cached.monthlyExpensesC).every(
        (amount) => typeof amount === 'number' && Number.isFinite(amount)
      )
    ) {
      return null;
    }

    const businessId = localStorage.getItem(BUSINESS_ID_KEY);
    const userId = getUserId();
    if (
      (businessId && businessId !== cached.businessId) ||
      (userId && cached.userId && userId !== cached.userId) ||
      (!businessId && !userId)
    ) {
      return null;
    }
    return cached;
  } catch {
    return null;
  }
};

const saveCachedDashboard = (snapshot: CachedDashboard): void => {
  try {
    localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.warn('Could not cache dashboard data', error);
  }
};

const calculateDashboardStats = (
  documents: any[],
  products: any[],
  transactions: any[],
  expenses: any[],
  purchaseOrders: any[],
  salesReturns: any[],
  returnItems: any[],
  cachedOtherExpensesC?: number,
  channelDocuments: any[] = documents
): DashboardStats => {
  const manual = transactions.filter((transaction) => transaction.source_module === 'manual');
  const isManualReturn = (transaction: any) =>
    transaction.type === 'Return' ||
    (transaction.type === 'Out' && transaction.status === 'Returned');

  let salesRevenueC = 0;
  let salesGrossC = 0;
  for (const document of documents) {
    salesGrossC += toCents(document.grand_total);
    salesRevenueC +=
      toCents(document.grand_total) - toCents(document.tax_total);
  }
  let manualInC = 0;
  let manualReturnsC = 0;
  for (const transaction of manual) {
    const amount = toCents(transaction.amount);
    if (isManualReturn(transaction)) manualReturnsC += amount;
    else if (transaction.type === 'In') manualInC += amount;
  }
  let salesReturnsC = 0;
  let salesReturnsGrossC = 0;
  const returnsWithItems = new Set<string>();
  for (const returnItem of returnItems) {
    const returnId = String(returnItem.return_id ?? '');
    if (returnId) returnsWithItems.add(returnId);
    salesReturnsC += getNetReturnCents(returnItem);
    salesReturnsGrossC += toCents(returnItem.total_amount);
  }
  for (const salesReturn of salesReturns) {
    if (!returnsWithItems.has(String(salesReturn.id))) {
      salesReturnsGrossC += toCents(salesReturn.total_return_amount);
      salesReturnsC += Math.max(
        0,
        toCents(salesReturn.total_return_amount) - toCents(salesReturn.tax_total)
      );
    }
  }
  const totalRevenueC = Math.max(
    0,
    salesRevenueC + manualInC - salesReturnsC - manualReturnsC
  );
  const totalSalesC = Math.max(
    0,
    salesGrossC + manualInC - salesReturnsGrossC - manualReturnsC
  );

  let cogsC = 0;
  for (const document of documents) {
    for (const line of document.sales_document_lines || []) {
      const quantity = Number(line.quantity || 0);
      if (quantity > 0) cogsC += Math.round(quantity * toCents(line.cost_price));
    }
  }
  for (const returnItem of returnItems) {
    const quantity = Number(returnItem.return_qty || 0);
    const cost = toCents(one(returnItem.sales_document_lines).cost_price);
    if (quantity > 0) cogsC -= Math.round(quantity * cost);
  }
  cogsC = Math.max(0, cogsC);

  const otherExpensesC =
    cachedOtherExpensesC ??
    expenses.reduce((sum, expense) => sum + toCents(expense.amount), 0);
  const netProfit = fromCents(totalRevenueC - cogsC - otherExpensesC);

  const receivedAmountTotal = fromCents(
    documents.reduce((sum, document) => {
      const grand = toCents(document.grand_total);
      const receivedGross =
        document.payment_status === 'Paid'
          ? grand
          : document.payment_status === 'Partially Paid'
            ? toCents(document.payment_amount)
            : 0;
      const taxReceived =
        grand > 0
          ? Math.round(
              (toCents(document.tax_total) * Math.min(receivedGross, grand)) /
                grand
            )
          : 0;
      return sum + receivedGross - taxReceived;
    }, 0) - salesReturnsC
  );

  const receivables = fromCents(
    documents.reduce((sum, document) => {
      const balance =
        toCents(document.grand_total) - toCents(document.payment_amount);
      return sum + (balance > 0 ? balance : 0);
    }, 0)
  );
  const supplierPayables = fromCents(
    purchaseOrders.reduce((sum, order) => sum + toCents(order.balance_due), 0)
  );

  let inventoryValueC = 0;
  for (const product of products) {
    const quantity = Number(product.stock || 0);
    const cost = toCents(product.cost_price);
    if (quantity > 0 && cost > 0) {
      inventoryValueC += Math.round(quantity * cost);
    }
  }
  const inventoryValue = fromCents(inventoryValueC);

  const lowStock = products.filter((product) => {
    const quantity = Number(product.stock || 0);
    const threshold = Number(product.low_stock_level || 5);
    return product.active !== false && quantity > 0 && quantity <= threshold;
  });
  const outOfStock = products.filter((product) => {
    const quantity = Number(product.stock || 0);
    return product.active !== false && quantity <= 0;
  });
  const pendingPOs = purchaseOrders.filter((order) => order.status === 'Pending');
  const supplierDue = purchaseOrders.filter(
    (order) => Number(order.balance_due || 0) > 0
  );

  const recentInvoices = [...documents]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5)
    .map((document) => ({
      id: document.order_number,
      customer: document.customer_name,
      amount: Number(document.grand_total),
      status:
        document.payment_amount >= document.grand_total
          ? 'Paid'
          : document.payment_amount > 0
            ? 'Partial Payment'
            : 'Pending',
    }));

  const activities = [...transactions]
    .sort(
      (a, b) =>
        new Date(b.created_at || b.txn_date).getTime() -
        new Date(a.created_at || a.txn_date).getTime()
    )
    .slice(0, 5)
    .map((transaction) => {
      const isReturn = isManualReturn(transaction);
      return {
        id: transaction.id,
        type: isReturn
          ? 'return'
          : transaction.type === 'In'
            ? 'sale'
            : transaction.type === 'Out'
              ? 'purchase'
              : 'payment',
        message: isReturn
          ? `Return: ${transaction.invoice_ref || transaction.transaction_no} (${transaction.amount})`
          : transaction.type === 'In'
            ? `${transaction.invoice_ref || transaction.transaction_no} — ${transaction.customer_name || 'Sale'} (${transaction.amount})`
            : transaction.type === 'Out'
              ? `Purchase: ${transaction.customer_name || 'Supplier'} (${transaction.amount})`
              : `Return: ${transaction.invoice_ref || transaction.transaction_no} (${transaction.amount})`,
        time: new Date(
          transaction.created_at || transaction.txn_date
        ).toLocaleDateString(),
      };
    });

  const monthsMap = new Map<
    string,
    { key: string; label: string; revenue: number; expenses: number }
  >();
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthKey(date);
    const label = date.toLocaleDateString('en-GB', {
      month: 'short',
      year: '2-digit',
    });
    monthsMap.set(key, { key, label, revenue: 0, expenses: 0 });
  }
  for (const document of documents) {
    const bucket = monthsMap.get(monthKey(document.issue_date));
    if (!bucket) continue;
    bucket.revenue +=
      toCents(document.grand_total) - toCents(document.tax_total);
    for (const line of document.sales_document_lines || []) {
      const quantity = Number(line.quantity || 0);
      if (quantity > 0) {
        bucket.expenses += Math.round(quantity * toCents(line.cost_price));
      }
    }
  }
  for (const transaction of manual) {
    const bucket = monthsMap.get(monthKey(transaction.txn_date));
    if (!bucket) continue;
    if (isManualReturn(transaction)) {
      bucket.revenue -= toCents(transaction.amount);
    } else if (transaction.type === 'In') {
      bucket.revenue += toCents(transaction.amount);
    }
  }
  const monthlyReturnsWithItems = new Set<string>();
  for (const returnItem of returnItems) {
    const returnId = String(returnItem.return_id ?? '');
    if (returnId) monthlyReturnsWithItems.add(returnId);
    const bucket = monthsMap.get(
      monthKey(one(returnItem.sales_returns).created_at)
    );
    if (bucket) bucket.revenue -= getNetReturnCents(returnItem);
    if (bucket) {
      const quantity = Number(returnItem.return_qty || 0);
      const cost = toCents(one(returnItem.sales_document_lines).cost_price);
      if (quantity > 0) bucket.expenses -= Math.round(quantity * cost);
    }
  }
  for (const salesReturn of salesReturns) {
    if (monthlyReturnsWithItems.has(String(salesReturn.id))) continue;
    const bucket = monthsMap.get(monthKey(salesReturn.created_at));
    if (bucket) {
      bucket.revenue -= Math.max(
        0,
        toCents(salesReturn.total_return_amount) -
          toCents(salesReturn.tax_total)
      );
    }
  }
  for (const expense of expenses) {
    const bucket = monthsMap.get(monthKey(expense.expense_date));
    if (bucket) bucket.expenses += toCents(expense.amount);
  }

  const monthly = Array.from(monthsMap.values()).map((bucket) => {
    const expensesC = Math.max(0, bucket.expenses);
    return {
      key: bucket.key,
      label: bucket.label,
      revenue: fromCents(bucket.revenue),
      expenses: fromCents(expensesC),
      profit: fromCents(bucket.revenue - expensesC),
    };
  });

  let onlineDocC = 0;
  let offlineDocC = 0;
  for (const document of channelDocuments) {
    if (document.status === 'Rejected') continue;
    const net =
      toCents(document.grand_total) - toCents(document.tax_total);
    if ((document.sales_channel || '').toLowerCase() === 'online') {
      onlineDocC += net;
    } else {
      offlineDocC += net;
    }
  }
  const docsNetC = onlineDocC + offlineDocC;
  const netDocumentSalesC = Math.max(0, docsNetC - salesReturnsC);
  const onlineShare = docsNetC > 0 ? onlineDocC / docsNetC : 0;
  const onlineC = Math.round(netDocumentSalesC * onlineShare);
  const offlineC = netDocumentSalesC - onlineC;
  const onlineSales = fromCents(onlineC);
  const offlineSales = fromCents(Math.max(0, offlineC));
  const hasChannelData = onlineC + offlineC > 0;

  const productMap = new Map<string, { qty: number; revenue: number }>();
  for (const document of documents) {
    for (const line of document.sales_document_lines || []) {
      const name = line.material || 'Unknown';
      const quantity = Number(line.quantity || 0);
      const revenue = Number(line.line_total || 0);
      const current = productMap.get(name) || { qty: 0, revenue: 0 };
      current.qty += quantity;
      current.revenue += revenue;
      productMap.set(name, current);
    }
  }
  const top5 = Array.from(productMap.entries())
    .map(([name, value]) => ({
      name,
      qty: value.qty,
      revenue: value.revenue,
    }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const lowStockDisplay = lowStock.slice(0, 4).map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    stock: Number(product.stock),
  }));

  return {
    totalSales: fromCents(totalSalesC),
    netProfit,
    receivedAmountTotal,
    receivables,
    inventoryValue,
    supplierPayables,
    lowStock,
    outOfStock,
    pendingPOs,
    supplierDue,
    recentInvoices,
    activities,
    monthly,
    onlineSales,
    offlineSales,
    hasChannelData,
    top5,
    lowStockDisplay,
  };
};

const getLocalDashboardData = async (
  cached: CachedDashboard
): Promise<DashboardStats> => {
  const [records, products, transactions, orders] = await Promise.all([
    recordsService.getDocuments(),
    productService.getProducts(),
    accountingService.getTransactions(),
    orderService.getOrders(),
  ]);
  const documents = records
    .filter((document) => document.status === 'Approved')
    .map((document) => ({
      ...document,
      sales_document_lines: document.lines || [],
    }));
  const channelDocuments = records.filter(
    (document) => document.status !== 'Rejected'
  );
  const localTransactions = transactions.map((transaction) => ({
    id: transaction.id,
    transaction_no: transaction.transactionNo,
    txn_date: transaction.date,
    customer_name: transaction.customerName,
    company_name: transaction.companyName,
    invoice_ref: transaction.invoiceRef,
    type: transaction.type,
    amount: transaction.amount,
    status: transaction.status,
    mode: transaction.mode,
    created_at: transaction.createdAt,
    sales_document_id: transaction.sourceDocumentId,
    source_module: transaction.sourceModule,
  }));
  const purchaseOrders = orders.map((order) => ({
    id: order.id,
    order_number: order.orderNumber,
    status: order.status,
    total_amount: order.totalAmount,
    balance_due: order.balanceDue,
    created_at: order.createdAt,
  }));
  const salesReturns = records.flatMap((document) => document.returns || []);
  const returnItems = records.flatMap((document) =>
    (document.returns || []).flatMap((salesReturn: any) =>
      (salesReturn.items || []).map((item: any) => {
        const line = (document.lines || []).find(
          (entry: any) =>
            String(entry.id) ===
            String(item.line_id ?? item.lineId ?? '')
        );
        return {
          return_id: item.return_id ?? salesReturn.id,
          return_qty: item.return_qty ?? item.returnQty,
          total_amount: item.total_amount ?? item.totalAmount,
          sales_document_lines: line
            ? {
                ...line,
                sales_documents: {
                  subtotal: document.subtotal,
                  tax_total: document.tax_total,
                },
              }
            : null,
          sales_returns: {
            id: salesReturn.id,
            created_at:
              salesReturn.created_at ||
              salesReturn.return_date ||
              salesReturn.date,
          },
        };
      })
    )
  );
  const expenses = Object.entries(cached.monthlyExpensesC).map(
    ([key, amountC]) => ({
      expense_date: `${key}-01`,
      amount: fromCents(amountC),
    })
  );

  return calculateDashboardStats(
    documents,
    products,
    localTransactions,
    expenses,
    purchaseOrders,
    salesReturns,
    returnItems,
    cached.otherExpensesC,
    channelDocuments
  );
};

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

// ============================================================
// SERVICE
// ============================================================
export const dashboardService = {
  /** Synchronous snapshot for an immediate dashboard render. */
  getCachedDashboardData(): DashboardStats | null {
    return getCachedDashboard()?.stats ?? null;
  },

  /** Recalculates from SQLite and retains last-synced expense data. */
  async getLocalDashboardData(): Promise<DashboardStats> {
    const cached = getCachedDashboard();
    if (!cached) {
      throw new Error(
        'Dashboard has no saved offline data; connect once to load expenses'
      );
    }
    const stats = await getLocalDashboardData(cached);
    saveCachedDashboard({ ...cached, stats });
    return stats;
  },

  async getDashboardData(): Promise<DashboardStats> {
    const cached = getCachedDashboard();
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (!cached) {
        throw new Error(
          'Dashboard has no saved offline data; connect once to load expenses'
        );
      }
      const stats = await getLocalDashboardData(cached);
      saveCachedDashboard({ ...cached, stats });
      return stats;
    }

    const businessId = await getCurrentBusinessId();
    localStorage.setItem(BUSINESS_ID_KEY, businessId);

    const [
      documents,
      products,
      transactions,
      expenses,
      purchaseOrders,
      salesReturns,
      returnItems,
    ] = await Promise.all([
      // 1. All documents support channel totals; calculations filter approved sales.
      fetchAll((from, to) =>
        supabase
          .from('sales_documents')
          .select('id, document_type, order_number, status, issue_date, created_at, subtotal, tax_total, grand_total, payment_amount, payment_status, sales_channel, customer_name, customer_company, sales_document_lines(id, product_id, material, category, cost_price, quantity, unit_price, line_total)')
          .eq('business_id', businessId)
          .order('id')
          .range(from, to)
      ),
      // 2. Products
      fetchAll((from, to) =>
        supabase
          .from('products')
          .select('id, sku, name, stock, low_stock_level, cost_price, active')
          .eq('business_id', businessId)
          .order('id')
          .range(from, to)
      ),
      // 3. Transactions
      fetchAll((from, to) =>
        supabase
          .from('accounting_transactions')
          .select('id, transaction_no, txn_date, customer_name, company_name, invoice_ref, type, amount, status, mode, created_at, sales_document_id, source_module')
          .eq('business_id', businessId)
          .order('id')
          .range(from, to)
      ),
      // 4. Expenses
      fetchAll((from, to) =>
        supabase
          .from('expenses')
          .select('id, expense_date, category, amount')
          .eq('business_id', businessId)
          .order('id')
          .range(from, to)
      ),
      // 5. Purchase Orders
      fetchAll((from, to) =>
        supabase
          .from('purchase_orders')
          .select('id, order_number, status, total_amount, balance_due, created_at')
          .eq('business_id', businessId)
          .order('id')
          .range(from, to)
      ),
      // 6. Sales Returns
      fetchAll((from, to) =>
        supabase
          .from('sales_returns')
          .select('id, subtotal, tax_total, total_return_amount, created_at')
          .eq('business_id', businessId)
          .order('id')
          .range(from, to)
      ),
      // 7. Sales Return Items (for COGS reversal)
      fetchAll((from, to) =>
        supabase
          .from('sales_return_items')
          .select('id, return_id, return_qty, total_amount, sales_document_lines(quantity, line_total, cost_price, sales_documents!inner(subtotal, tax_total)), sales_returns!inner(business_id, created_at)')
          .eq('sales_returns.business_id', businessId)
          .order('id')
          .range(from, to)
      ),
    ]);

    const channelDocuments = documents.filter(
      (document) => document.status !== 'Rejected'
    );
    const approvedDocuments = documents
      .filter((document) => document.status === 'Approved')
      .map((document) => ({
        ...document,
        sales_document_lines: document.sales_document_lines || [],
      }));
    const stats = calculateDashboardStats(
      approvedDocuments,
      products,
      transactions,
      expenses,
      purchaseOrders,
      salesReturns,
      returnItems,
      undefined,
      channelDocuments
    );
    const monthlyExpensesC = expenses.reduce(
      (totals: Record<string, number>, expense) => {
        const key = monthKey(expense.expense_date);
        if (key) totals[key] = (totals[key] || 0) + toCents(expense.amount);
        return totals;
      },
      {}
    );
    saveCachedDashboard({
      businessId,
      userId: getUserId(),
      stats,
      otherExpensesC: expenses.reduce(
        (sum, expense) => sum + toCents(expense.amount),
        0
      ),
      monthlyExpensesC,
    });
    return stats;
  },
};