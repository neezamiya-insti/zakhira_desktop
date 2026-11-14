/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase, getCurrentBusinessId } from '../lib/supabaseClient';

// ============================================================
// TYPES
// ============================================================
export type InventoryChartData = {
  categoryDonut: Array<{ name: string; value: number }>;
  top7Products: Array<{ name: string; qty: number }>;
  inventoryValueByCategory: Array<{ name: string; value: number }>;
  revenueByCategory: Array<{ name: string; value: number }>;
};

export const inventoryChartsService = {
  async getChartData(): Promise<InventoryChartData> {
    const businessId = await getCurrentBusinessId();

    // 1. Products fetch karo
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', businessId)
      .eq('active', true);

    if (prodError) throw prodError;

    // 2. Categories fetch karo (naam ke liye)
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('business_id', businessId);

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
      const { data: linesData } = await supabase
        .from('sales_document_lines')
        .select('*')
        .in('document_id', docIds);
      lines = linesData || [];
    }

    // ============================================================
    // MAPS BANAO (Category ID -> Name, Product ID -> Product)
    // ============================================================
    const categoryMap = new Map<string, string>();
    (categories || []).forEach(c => categoryMap.set(c.id, c.name));

    const productMap = new Map<string, any>();
    (products || []).forEach(p => productMap.set(p.id, p));

    // ============================================================
    // 1. CATEGORY DONUT (Product count by category)
    // ============================================================
    const categoryCountMap = new Map<string, number>();
    (products || []).forEach(p => {
      const catName = p.category_id ? categoryMap.get(p.category_id) || 'Uncategorized' : 'Uncategorized';
      categoryCountMap.set(catName, (categoryCountMap.get(catName) || 0) + 1);
    });

    const categoryDonut = Array.from(categoryCountMap.entries())
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.name !== 'Uncategorized')
      .sort((a, b) => b.value - a.value);

    // ============================================================
    // 2. TOP 7 PRODUCTS (By quantity sold in approved invoices)
    // ============================================================
    const productQtyMap = new Map<string, number>();
    lines.forEach(l => {
      const name = l.material || 'Unknown';
      productQtyMap.set(name, (productQtyMap.get(name) || 0) + Number(l.quantity || 0));
    });

    const top7Products = Array.from(productQtyMap.entries())
      .map(([name, qty]) => ({ name, qty }))
      .filter(d => d.qty > 0)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 7);

    // ============================================================
    // 3. INVENTORY VALUE BY CATEGORY (Stock × Cost Price)
    // ============================================================
    const categoryValueMap = new Map<string, number>();
    (products || []).forEach(p => {
      const catName = p.category_id ? categoryMap.get(p.category_id) || 'Uncategorized' : 'Uncategorized';
      const qty = Number(p.stock || 0);
      const cost = Number(p.cost_price || p.price * 0.6 || 0);
      if (qty > 0 && cost > 0) {
        categoryValueMap.set(catName, (categoryValueMap.get(catName) || 0) + qty * cost);
      }
    });

    const inventoryValueByCategory = Array.from(categoryValueMap.entries())
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .filter(d => d.name !== 'Uncategorized' && d.value > 0)
      .sort((a, b) => b.value - a.value);

    // ============================================================
    // 4. REVENUE BY CATEGORY (Sales from approved invoices)
    // ============================================================
    const revenueMap = new Map<string, number>();
    lines.forEach(l => {
      const prod = productMap.get(l.product_id);
      const catName = prod?.category_id ? categoryMap.get(prod.category_id) || 'Uncategorized' : 'Uncategorized';
      const revenue = Number(l.line_total || 0);
      revenueMap.set(catName, (revenueMap.get(catName) || 0) + revenue);
    });

    const revenueByCategory = Array.from(revenueMap.entries())
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .filter(d => d.name !== 'Uncategorized' && d.value > 0)
      .sort((a, b) => b.value - a.value);

    return {
      categoryDonut,
      top7Products,
      inventoryValueByCategory,
      revenueByCategory,
    };
  }
};