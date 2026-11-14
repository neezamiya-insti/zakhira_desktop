/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase, getCurrentBusinessId } from '../lib/supabaseClient';

// ============================================================
// TYPES (UI shape — same field names the VendorsPage already uses)
// ============================================================
export type Vendor = {
  id: string; // vendors.id (uuid)
  uniqueId: string; // vendors.unique_id  e.g. VND-0001
  name: string;
  companyName: string;
  phone: string;
  address: string;
  city: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type VendorInput = {
  name: string;
  companyName: string;
  phone: string;
  address: string;
  city: string;
};

/** Thrown by deleteVendor when purchase orders still point to the vendor. */
export class VendorHasOrdersError extends Error {
  count: number;
  constructor(count: number) {
    super('Vendor has purchase orders');
    this.name = 'VendorHasOrdersError';
    this.count = count;
  }
}

// ============================================================
// HELPERS
// ============================================================
const PAGE = 1000;

// Supabase returns max 1000 rows per request -> page through everything.
async function fetchAll(
  build: (
    from: number,
    to: number
  ) => PromiseLike<{ data: any[] | null; error: any }>
): Promise<any[]> {
  const rows: any[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await build(from, from + PAGE - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < PAGE) break;
  }
  return rows;
}

const mapRow = (row: any): Vendor => ({
  id: row.id,
  uniqueId: row.unique_id,
  name: row.name || '',
  companyName: row.company_name || '',
  phone: row.phone || '',
  address: row.address || '',
  city: row.city || '',
  active: !!row.active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// next "VND-0001" for this business (max of existing numbers + 1)
async function nextUniqueId(businessId: string): Promise<string> {
  const rows = await fetchAll((from, to) =>
    supabase
      .from('vendors')
      .select('id, unique_id')
      .eq('business_id', businessId)
      .order('id')
      .range(from, to)
  );
  let max = 0;
  for (const r of rows) {
    const m = String(r.unique_id || '').match(/^VND-(\d+)$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `VND-${String(max + 1).padStart(4, '0')}`;
}

// ============================================================
// SERVICE
// ============================================================
export const vendorsService = {
  // ----------------------------------------------------------
  // All vendors of the current business (newest first)
  // ----------------------------------------------------------
  async getVendors(): Promise<Vendor[]> {
    const businessId = await getCurrentBusinessId();
    const rows = await fetchAll((from, to) =>
      supabase
        .from('vendors')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .order('id')
        .range(from, to)
    );
    return rows.map(mapRow);
  },

  // ----------------------------------------------------------
  // { vendorId: number of purchase orders } (all statuses)
  // ----------------------------------------------------------
  async getOrderCounts(): Promise<Record<string, number>> {
    const businessId = await getCurrentBusinessId();
    const rows = await fetchAll((from, to) =>
      supabase
        .from('purchase_orders')
        .select('id, vendor_id')
        .eq('business_id', businessId)
        .order('id')
        .range(from, to)
    );
    const counts: Record<string, number> = {};
    for (const r of rows) {
      counts[r.vendor_id] = (counts[r.vendor_id] || 0) + 1;
    }
    return counts;
  },

  // ----------------------------------------------------------
  // The id the next new vendor will get (shown in the form)
  // ----------------------------------------------------------
  async getNextUniqueId(): Promise<string> {
    const businessId = await getCurrentBusinessId();
    return nextUniqueId(businessId);
  },

  // ----------------------------------------------------------
  // Create (unique_id is generated here; retried if two users clash)
  // ----------------------------------------------------------
  async createVendor(input: VendorInput): Promise<Vendor> {
    const businessId = await getCurrentBusinessId();

    for (let attempt = 0; attempt < 4; attempt++) {
      const unique_id = await nextUniqueId(businessId);
      const { data, error } = await supabase
        .from('vendors')
        .insert([
          {
            business_id: businessId,
            unique_id,
            name: input.name,
            company_name: input.companyName,
            phone: input.phone,
            address: input.address,
            city: input.city,
            active: true,
          },
        ])
        .select()
        .single();

      if (!error) return mapRow(data);
      // duplicate (business_id, unique_id) -> somebody else took it, retry
      if ((error as any).code === '23505' && attempt < 3) continue;
      throw error;
    }
    throw new Error('Could not generate a unique vendor id');
  },

  // ----------------------------------------------------------
  // Update details (updated_at is set by the DB trigger)
  // ----------------------------------------------------------
  async updateVendor(id: string, input: VendorInput): Promise<Vendor> {
    const businessId = await getCurrentBusinessId();
    const { data, error } = await supabase
      .from('vendors')
      .update({
        name: input.name,
        company_name: input.companyName,
        phone: input.phone,
        address: input.address,
        city: input.city,
      })
      .eq('id', id)
      .eq('business_id', businessId)
      .select()
      .single();
    if (error) throw error;
    return mapRow(data);
  },

  // ----------------------------------------------------------
  // Activate / deactivate
  // ----------------------------------------------------------
  async setVendorActive(id: string, active: boolean): Promise<Vendor> {
    const businessId = await getCurrentBusinessId();
    const { data, error } = await supabase
      .from('vendors')
      .update({ active })
      .eq('id', id)
      .eq('business_id', businessId)
      .select()
      .single();
    if (error) throw error;
    return mapRow(data);
  },

  // ----------------------------------------------------------
  // Delete — refused (VendorHasOrdersError) if purchase orders exist
  // ----------------------------------------------------------
  async deleteVendor(id: string): Promise<void> {
    const businessId = await getCurrentBusinessId();

    const countOrders = async (): Promise<number> => {
      const { count, error } = await supabase
        .from('purchase_orders')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .eq('vendor_id', id);
      if (error) throw error;
      return count || 0;
    };

    const before = await countOrders();
    if (before > 0) throw new VendorHasOrdersError(before);

    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id)
      .eq('business_id', businessId);

    if (error) {
      // 23503 = foreign key violation (an order was created in the meantime)
      if ((error as any).code === '23503') {
        throw new VendorHasOrdersError(Math.max(1, await countOrders()));
      }
      throw error;
    }
  },
};