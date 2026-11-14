import { supabase, getCurrentBusinessId } from '../lib/supabaseClient';

// ============================================================
// TYPES
// ============================================================
export type MeasuringUnit = {
  id: string;
  name: string;
  label: string;
};

export type SalesFormField = {
  id: string;
  label: string;
  labelUr: string;
  required: boolean;
  sort_order?: number;
};

export type PrintFormat = 'A4' | 'A5' | 'thermal80' | 'thermal58';

export const settingsService = {
  // ============================================================
  // 📏 MEASURING UNITS
  // ============================================================
  async getUnits(): Promise<MeasuringUnit[]> {
    const businessId = await getCurrentBusinessId();
    
    const { data, error } = await supabase
      .from('measuring_units')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async addUnit(unit: { name: string; label: string }) {
    const businessId = await getCurrentBusinessId();
    
    const { data, error } = await supabase
      .from('measuring_units')
      .insert([{ business_id: businessId, name: unit.name, label: unit.label }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateUnit(id: string, unit: { name: string; label: string }) {
    const { data, error } = await supabase
      .from('measuring_units')
      .update({ name: unit.name, label: unit.label })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteUnit(id: string) {
    const { error } = await supabase
      .from('measuring_units')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ============================================================
  // 📝 SALES FORM FIELDS
  // ============================================================
  async getSalesFormFields(): Promise<SalesFormField[]> {
    const businessId = await getCurrentBusinessId();
    
    const { data, error } = await supabase
      .from('sales_form_fields')
      .select('*')
      .eq('business_id', businessId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return (data || []).map(f => ({
      id: f.id,
      label: f.label,
      labelUr: f.label_ur || '',
      required: f.required,
      sort_order: f.sort_order
    }));
  },

  async saveSalesFormFields(fields: SalesFormField[]) {
    const businessId = await getCurrentBusinessId();

    // Pehle purani fields delete karo (kyunki edit/delete/add sab ho sakta hai)
    const { error: deleteError } = await supabase
      .from('sales_form_fields')
      .delete()
      .eq('business_id', businessId);

    if (deleteError) throw deleteError;

    if (fields.length === 0) return [];

    // Phir nayi fields insert karo
    const rows = fields.map((f, index) => ({
      business_id: businessId,
      label: f.label,
      label_ur: f.labelUr,
      required: f.required,
      sort_order: index
    }));

    const { data, error } = await supabase
      .from('sales_form_fields')
      .insert(rows)
      .select();

    if (error) throw error;
    return data;
  },

  // ============================================================
  // 🖨️ APP SETTINGS (Print Format)
  // ============================================================
  async getAppSettings() {
    const businessId = await getCurrentBusinessId();
    const userStr = localStorage.getItem('zakhira_user');
    if (!userStr) throw new Error("User not logged in");
    const user = JSON.parse(userStr);

    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('business_id', businessId)
      .eq('profile_id', user.id)
      .maybeSingle();

    if (error) throw error;
    
    // Agar pehle se settings nahi hain, to default return karo
    if (!data) {
      return {
        default_print_format: 'A4' as PrintFormat,
        last_print_format: null
      };
    }
    
    return data;
  },

  async savePrintFormat(format: PrintFormat) {
    const businessId = await getCurrentBusinessId();
    const userStr = localStorage.getItem('zakhira_user');
    if (!userStr) throw new Error("User not logged in");
    const user = JSON.parse(userStr);

    // Check karo ke settings pehle se hain ya nahi
    const { data: existing } = await supabase
      .from('app_settings')
      .select('id')
      .eq('business_id', businessId)
      .eq('profile_id', user.id)
      .maybeSingle();

    if (existing) {
      // Update
      const { error } = await supabase
        .from('app_settings')
        .update({ default_print_format: format, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      // Insert
      const { error } = await supabase
        .from('app_settings')
        .insert([{
          business_id: businessId,
          profile_id: user.id,
          default_print_format: format
        }]);
      if (error) throw error;
    }
  }
};