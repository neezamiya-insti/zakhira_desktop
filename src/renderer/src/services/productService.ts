import { supabase, getCurrentBusinessId } from '../lib/supabaseClient';

// ============================================================
// TYPES
// ============================================================
export type Product = {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  cost_price: number;
  stock: number;
  low_stock_level: number;
  active: boolean;
  unit_id: string;
  category_id: string | null;
  image_url: string | null; // <-- Nayi line
  created_at: string;
  updated_at: string;
};

export type ProductInput = {
  sku: string;
  name: string;
  description: string;
  price: number;
  cost_price: number;
  stock: number;
  low_stock_level: number;
  unit_id: string;
  category_id: string | null;
  image_url?: string | null; // <-- Nayi line
};

export type Category = {
  id: string;
  name: string;
};

export const productService = {
  // ============================================================
  // 📦 PRODUCTS
  // ============================================================
  
  async getProducts(): Promise<Product[]> {
    const businessId = await getCurrentBusinessId();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createProduct(product: ProductInput) {
    const businessId = await getCurrentBusinessId();
    const { data, error } = await supabase
      .from('products')
      .insert([{
        business_id: businessId,
        sku: product.sku,
        name: product.name,
        description: product.description,
        price: product.price,
        cost_price: product.cost_price,
        stock: product.stock,
        low_stock_level: product.low_stock_level,
        unit_id: product.unit_id,
        category_id: product.category_id,
        image_url: product.image_url || null, // <-- Nayi line
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateProduct(id: string, product: ProductInput) {
    const { data, error } = await supabase
      .from('products')
      .update({
        sku: product.sku,
        name: product.name,
        description: product.description,
        price: product.price,
        cost_price: product.cost_price,
        stock: product.stock,
        low_stock_level: product.low_stock_level,
        unit_id: product.unit_id,
        category_id: product.category_id,
        image_url: product.image_url, // <-- Nayi line
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // ============================================================
  // 🖼️ IMAGE UPLOAD
  // ============================================================
  
  async uploadProductImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    // 1. Storage mein upload karo
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (error) throw error;

    // 2. Public URL nikaalo
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  },

  // ============================================================
  // 🏷️ CATEGORIES
  // ============================================================
  
  async getCategories(): Promise<Category[]> {
    const businessId = await getCurrentBusinessId();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('business_id', businessId)
      .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createCategory(name: string) {
    const businessId = await getCurrentBusinessId();
    const { data, error } = await supabase
      .from('categories')
      .insert([{ business_id: businessId, name }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};