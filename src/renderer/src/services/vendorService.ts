import { supabase, getCurrentBusinessId } from '../lib/supabaseClient';

// ============================================================
// TYPES
// ============================================================
export type Vendor = {
  id: string;
  unique_id: string;
  name: string;
  company_name: string;
  phone: string;
  vat_number: string | null;
  address: string;
  city: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type VendorInput = {
  name: string;
  companyName: string;
  phone: string;
  address: string;
  city: string;
};

export const vendorService = {
  // ============================================================
  // 📋 GET ALL VENDORS
  // ============================================================
  async getVendors(): Promise<Vendor[]> {
    const businessId = await getCurrentBusinessId();

    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // ============================================================
  // ➕ CREATE VENDOR
  // ============================================================
  async createVendor(vendor: VendorInput): Promise<Vendor> {
    const businessId = await getCurrentBusinessId();

    // Unique ID generate karo (VND-0001, VND-0002, ...)
    const { data: existing } = await supabase
      .from('vendors')
      .select('unique_id')
      .eq('business_id', businessId);

    const numbers = (existing || [])
      .map((v) => {
        const m = v.unique_id.match(/VND-(\d+)/);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter((n) => n > 0);

    const max = numbers.length ? Math.max(...numbers) : 0;
    const uniqueId = `VND-${String(max + 1).padStart(4, '0')}`;

    const { data, error } = await supabase
      .from('vendors')
      .insert([
        {
          business_id: businessId,
          unique_id: uniqueId,
          name: vendor.name,
          company_name: vendor.companyName,
          phone: vendor.phone,
          address: vendor.address,
          city: vendor.city,
          active: true,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ============================================================
  // ✏️ UPDATE VENDOR
  // ============================================================
  async updateVendor(id: string, vendor: VendorInput): Promise<Vendor> {
    const { data, error } = await supabase
      .from('vendors')
      .update({
        name: vendor.name,
        company_name: vendor.companyName,
        phone: vendor.phone,
        address: vendor.address,
        city: vendor.city,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ============================================================
  // 🗑️ DELETE VENDOR
  // ============================================================
  async deleteVendor(id: string): Promise<void> {
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ============================================================
  // 🔄 TOGGLE ACTIVE STATUS
  // ============================================================
  async toggleActive(id: string, active: boolean): Promise<Vendor> {
    const { data, error } = await supabase
      .from('vendors')
      .update({
        active: !active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ============================================================
  // 📦 GET ORDER COUNT (vendor ke orders count karne ke liye)
  // ============================================================
  async getOrderCount(vendorId: string): Promise<number> {
    const { count, error } = await supabase
      .from('purchase_orders')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendorId);

    if (error) throw error;
    return count || 0;
  },
};