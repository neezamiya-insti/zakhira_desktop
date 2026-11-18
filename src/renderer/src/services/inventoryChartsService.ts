/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase, getCurrentBusinessId } from '../lib/supabaseClient';
import { productService, type Product } from './productService';
import { recordsService } from './recordsService';

// ============================================================
// TYPES
// ============================================================
export type InventoryChartData = {
  categoryDonut: Array<{ name: string; value: number }>;
  top7Products: Array<{ name: string; qty: number }>;
  inventoryValueByCategory: Array<{ name: string; value: number }>;
  revenueByCategory: Array<{ name: string; value: number }>;
};

const BUSINESS_ID_KEY = 'zakhira_business_id';
const CACHE_KEY = 'zakhira_inventory_charts_cache';

type CachedInventoryChartData = {
  businessId: string;
  userId: string;
  data: InventoryChartData;
};

const isChartData = (value: unknown): value is InventoryChartData => {
  if (!value || typeof value !== 'object') return false;
  const data = value as Record<string, unknown>;
  return (
    ['categoryDonut', 'inventoryValueByCategory', 'revenueByCategory'].every(
      (key) =>
        Array.isArray(data[key]) &&
        (data[key] as unknown[]).every(
          (item) =>
            !!item &&
            typeof item === 'object' &&
            typeof (item as { name?: unknown }).name === 'string' &&
            typeof (item as { value?: unknown }).value === 'number' &&
            Number.isFinite((item as { value: number }).value)
        )
    ) &&
    Array.isArray(data.top7Products) &&
    data.top7Products.every(
      (item) =>
        !!item &&
        typeof item === 'object' &&
        typeof (item as { name?: unknown }).name === 'string' &&
        typeof (item as { qty?: unknown }).qty === 'number' &&
        Number.isFinite((item as { qty: number }).qty)
    )
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

const getCachedChartData = (): InventoryChartData | null => {
  try {
    const cached = JSON.parse(
      localStorage.getItem(CACHE_KEY) || 'null'
    ) as CachedInventoryChartData | null;
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

const saveCachedChartData = (
  businessId: string,
  data: InventoryChartData
): void => {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ businessId, userId: getUserId(), data } satisfies CachedInventoryChartData)
    );
  } catch (error) {
    console.warn('Could not cache inventory charts data', error);
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

type ChartDocument = {
  document_type: string;
  status: string;
  lines: Array<{
    material?: string | null;
    quantity?: unknown;
    product_id?: string | null;
    line_total?: unknown;
  }>;
};

const buildChartData = (
  products: Product[],
  categories: Array<{ id: string; name: string }>,
  documents: ChartDocument[]
): InventoryChartData => {
  const activeProducts = products.filter((product) => product.active);
  const categoryMap = new Map(
    categories.map((category) => [category.id, category.name])
  );
  const productMap = new Map(activeProducts.map((product) => [product.id, product]));
  const approvedInvoices = documents.filter(
    (document) =>
      document.document_type === 'invoice' && document.status === 'Approved'
  );

  const categoryCountMap = new Map<string, number>();
  for (const product of activeProducts) {
    const name = product.category_id
      ? categoryMap.get(product.category_id) || 'Uncategorized'
      : 'Uncategorized';
    categoryCountMap.set(name, (categoryCountMap.get(name) || 0) + 1);
  }
  const categoryDonut = Array.from(categoryCountMap.entries())
    .map(([name, value]) => ({ name, value }))
    .filter((item) => item.name !== 'Uncategorized')
    .sort((a, b) => b.value - a.value);

  const productQtyMap = new Map<string, number>();
  for (const document of approvedInvoices) {
    for (const line of document.lines || []) {
      const name = line.material || 'Unknown';
      productQtyMap.set(
        name,
        (productQtyMap.get(name) || 0) + Number(line.quantity || 0)
      );
    }
  }
  const top7Products = Array.from(productQtyMap.entries())
    .map(([name, qty]) => ({ name, qty }))
    .filter((item) => item.qty > 0)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 7);

  const categoryValueMap = new Map<string, number>();
  for (const product of activeProducts) {
    const name = product.category_id
      ? categoryMap.get(product.category_id) || 'Uncategorized'
      : 'Uncategorized';
    const quantity = Number(product.stock || 0);
    const cost = Number(product.cost_price || product.price * 0.6 || 0);
    if (quantity > 0 && cost > 0) {
      categoryValueMap.set(
        name,
        (categoryValueMap.get(name) || 0) + quantity * cost
      );
    }
  }
  const inventoryValueByCategory = Array.from(categoryValueMap.entries())
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .filter((item) => item.name !== 'Uncategorized' && item.value > 0)
    .sort((a, b) => b.value - a.value);

  const revenueMap = new Map<string, number>();
  for (const document of approvedInvoices) {
    for (const line of document.lines || []) {
      const product = productMap.get(String(line.product_id || ''));
      const name = product?.category_id
        ? categoryMap.get(product.category_id) || 'Uncategorized'
        : 'Uncategorized';
      revenueMap.set(
        name,
        (revenueMap.get(name) || 0) + Number(line.line_total || 0)
      );
    }
  }
  const revenueByCategory = Array.from(revenueMap.entries())
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .filter((item) => item.name !== 'Uncategorized' && item.value > 0)
    .sort((a, b) => b.value - a.value);

  return {
    categoryDonut,
    top7Products,
    inventoryValueByCategory,
    revenueByCategory,
  };
};

export const inventoryChartsService = {
  /** Last successful chart snapshot for an immediate first render. */
  getCachedChartData,

  /** Calculates chart data from local SQLite records, so this also works offline. */
  async getChartData(): Promise<InventoryChartData> {
    const [products, categories, documents] = await Promise.all([
      productService.getProducts(),
      productService.getCategories(),
      recordsService.getDocuments(),
    ]);
    const data = buildChartData(products, categories, documents);
    const businessId = await getBusinessId();
    saveCachedChartData(businessId, data);
    return data;
  },

  /** Refreshes the snapshot from Supabase after the local-first view is ready. */
  async syncChartData(): Promise<InventoryChartData> {
    const businessId = await getBusinessId();
    // 1. Products fetch karo
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', businessId)
      .eq('active', true);

    if (prodError) throw prodError;

    // 2. Categories fetch karo (naam ke liye)
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('business_id', businessId);
    if (categoryError) throw categoryError;

    // 3. Sales Documents fetch karo (sirf approved invoices)
    const { data: documents, error: docError } = await supabase
      .from('sales_documents')
      .select('id, document_type, status')
      .eq('business_id', businessId)
      .eq('document_type', 'invoice')
      .eq('status', 'Approved');

    if (docError) throw docError;

    // 4. Lines fetch karo un documents ke liye
    let lines: any[] = [];
    if (documents && documents.length > 0) {
      const docIds = documents.map(d => d.id);
      const { data: linesData, error: linesError } = await supabase
        .from('sales_document_lines')
        .select('*')
        .in('document_id', docIds);
      if (linesError) throw linesError;
      lines = linesData || [];
    }

    const data = buildChartData(
      products || [],
      categories || [],
      (documents || []).map((document) => ({
        document_type: document.document_type,
        status: document.status,
        lines: lines.filter((line) => line.document_id === document.id),
      }))
    );
    saveCachedChartData(businessId, data);
    return data;
  },
};