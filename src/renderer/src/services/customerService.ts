import { supabase, getCurrentBusinessId } from '../lib/supabaseClient';

export type CustomerInput = {
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  phone_alt?: string | null;
  address?: string | null;
  city?: string | null;
};

export const customerService = {
  // 1. Saare customers mangwana
  async getCustomers() {
    const businessId = await getCurrentBusinessId();
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // 2. Naya customer banana
  async createCustomer(customer: CustomerInput) {
    const businessId = await getCurrentBusinessId();

    const { data, error } = await supabase
      .from('customers')
      .insert([
        {
          business_id: businessId,
          name: customer.name,
          company: customer.company,
          email: customer.email,
          phone: customer.phone,
          phone_alt: customer.phone_alt,
          address: customer.address,
          city: customer.city,
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 3. Customer update karna
  async updateCustomer(id: string, customer: CustomerInput) {
    const { data, error } = await supabase
      .from('customers')
      .update({
        name: customer.name,
        company: customer.company,
        email: customer.email,
        phone: customer.phone,
        phone_alt: customer.phone_alt,
        address: customer.address,
        city: customer.city,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 4. Customer delete karna
  async deleteCustomer(id: string) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};