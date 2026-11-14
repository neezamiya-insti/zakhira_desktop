import { supabase, getCurrentBusinessId } from '../lib/supabaseClient';

export type BusinessProfileInput = {
  businessName: string;
  businessNameUr: string;
  businessNameAr: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  logo: string;
};

export type AccountInput = {
  fullName: string;
  email: string;
  phone: string;
  newPassword?: string;
};

export type AccountData = {
  fullName: string;
  phone: string;
  email: string;
};

export const profileService = {
  // 1. Business ka data mangwana
  async getBusinessProfile() {
    const businessId = await getCurrentBusinessId();

    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    if (error) throw error;
    return data;
  },

  // 2. Business ka data update karna
  async updateBusinessProfile(profile: BusinessProfileInput) {
    const businessId = await getCurrentBusinessId();

    const { data, error } = await supabase
      .from('businesses')
      .update({
        name: profile.businessName,
        name_ur: profile.businessNameUr,
        name_ar: profile.businessNameAr,
        phone: profile.phone,
        email: profile.email,
        address: profile.address,
        city: profile.city,
        logo: profile.logo,
        updated_at: new Date().toISOString(),
      })
      .eq('id', businessId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 3. User ka profile (naam, phone) update karna
  async updateProfile(profile: { fullName: string; phone: string }) {
    const userStr = localStorage.getItem('zakhira_user');
    if (!userStr) throw new Error('User not logged in');
    const user = JSON.parse(userStr);

    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: profile.fullName,
        phone: profile.phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 4. Email update karna (Supabase Auth ke zariye)
  async updateEmail(newEmail: string) {
    const { data, error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) throw error;
    return data;
  },

  // 5. Password update karna (Supabase Auth ke zariye)
  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data;
  },

  // 6. Logged-in user ka account data (name, phone, email) mangwana
  async getAccount(): Promise<AccountData> {
    const userStr = localStorage.getItem('zakhira_user');
    if (!userStr) throw new Error('User not logged in');
    const user = JSON.parse(userStr);

    const { data, error } = await supabase
      .from('profiles')
      .select('name, phone')
      .eq('id', user.id)
      .single();
    if (error) throw error;

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;

    return {
      fullName: data?.name ?? '',
      phone: data?.phone ?? '',
      email: authData.user?.email ?? user.email ?? '',
    };
  },
};