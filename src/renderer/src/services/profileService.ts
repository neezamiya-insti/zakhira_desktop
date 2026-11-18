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

export const PROFILE_SYNC_ERROR_EVENT = 'zakhira:profile-sync-error';

const BUSINESS_CACHE_KEY = 'zakhira_settings';
const BUSINESS_QUEUE_KEY = 'zakhira_profile_business_pending';
const ACCOUNT_QUEUE_KEY = 'zakhira_profile_account_pending';

type PendingAccountProfile = Pick<AccountInput, 'fullName' | 'phone'>;

const isOnline = (): boolean =>
  typeof navigator === 'undefined' || navigator.onLine;

const getStoredUser = (): {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
} => {
  const raw = localStorage.getItem('zakhira_user');
  if (!raw) throw new Error('User not logged in');
  const user = JSON.parse(raw);
  if (!user?.id) throw new Error('User not logged in');
  return user;
};

const patchStoredUser = (
  patch: Partial<Pick<AccountData, 'fullName' | 'phone' | 'email'>>
): void => {
  const user = getStoredUser();
  localStorage.setItem(
    'zakhira_user',
    JSON.stringify({
      ...user,
      ...(patch.fullName !== undefined ? { name: patch.fullName } : {}),
      ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
      ...(patch.email !== undefined ? { email: patch.email } : {}),
    })
  );
};

const readBusinessCache = (): BusinessProfileInput | null => {
  const raw = localStorage.getItem(BUSINESS_CACHE_KEY);
  if (!raw) return null;
  const value = JSON.parse(raw) as Partial<BusinessProfileInput>;
  return {
    businessName: value.businessName || '',
    businessNameUr: value.businessNameUr || '',
    businessNameAr: value.businessNameAr || '',
    phone: value.phone || '',
    email: value.email || '',
    address: value.address || '',
    city: value.city || '',
    logo: value.logo || '',
  };
};

const cacheBusiness = (profile: BusinessProfileInput): void => {
  localStorage.setItem(BUSINESS_CACHE_KEY, JSON.stringify(profile));
};

const toBusinessRow = (
  profile: BusinessProfileInput
): {
  name: string;
  name_ur: string;
  name_ar: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  logo: string;
} => ({
  name: profile.businessName,
  name_ur: profile.businessNameUr,
  name_ar: profile.businessNameAr,
  phone: profile.phone,
  email: profile.email,
  address: profile.address,
  city: profile.city,
  logo: profile.logo,
});

const readPending = <T,>(key: string): T | null => {
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : null;
};

let syncTimer: ReturnType<typeof setInterval> | null = null;
let syncPromise: Promise<void> | null = null;

const reportBackgroundSyncError = (error: unknown): void => {
  console.error('[ProfileSync] background sync failed', error);
  window.dispatchEvent(
    new CustomEvent(PROFILE_SYNC_ERROR_EVENT, { detail: error })
  );
};

const getBusinessId = async (): Promise<string> => {
  if (!isOnline()) throw new Error('Business ID is not available offline');
  return getCurrentBusinessId();
};

const syncNow = (): Promise<void> => {
  if (!isOnline()) return Promise.resolve();
  if (syncPromise) return syncPromise;

  syncPromise = (async () => {
    const pendingBusiness = readPending<BusinessProfileInput>(BUSINESS_QUEUE_KEY);
    if (pendingBusiness) {
      const businessId = await getBusinessId();
      const { data, error } = await supabase
        .from('businesses')
        .update({
          ...toBusinessRow(pendingBusiness),
          updated_at: new Date().toISOString(),
        })
        .eq('id', businessId)
        .select()
        .single();
      if (error) throw error;
      if (!data) throw new Error('Business profile sync returned no data');

      const latestBusiness = readPending<BusinessProfileInput>(BUSINESS_QUEUE_KEY);
      if (JSON.stringify(latestBusiness) === JSON.stringify(pendingBusiness)) {
        localStorage.removeItem(BUSINESS_QUEUE_KEY);
        cacheBusiness(pendingBusiness);
      }
    }

    const pendingAccount = readPending<PendingAccountProfile>(ACCOUNT_QUEUE_KEY);
    if (pendingAccount) {
      const user = getStoredUser();
      const { error } = await supabase
        .from('profiles')
        .update({
          name: pendingAccount.fullName,
          phone: pendingAccount.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select('id')
        .single();
      if (error) throw error;

      const latestAccount = readPending<PendingAccountProfile>(ACCOUNT_QUEUE_KEY);
      if (JSON.stringify(latestAccount) === JSON.stringify(pendingAccount)) {
        localStorage.removeItem(ACCOUNT_QUEUE_KEY);
      }
    }
  })().finally(() => {
    syncPromise = null;
  });

  return syncPromise;
};

export const profileService = {
  startSyncWorker(): void {
    if (syncTimer) return;
    syncTimer = setInterval(
      () => void syncNow().catch(reportBackgroundSyncError),
      5000
    );
    window.addEventListener('online', () =>
      void syncNow().catch(reportBackgroundSyncError)
    );
    window.addEventListener('focus', () =>
      void syncNow().catch(reportBackgroundSyncError)
    );
    void syncNow().catch(reportBackgroundSyncError);
  },

  syncNow,

  // 1. Business ka data mangwana
  async getBusinessProfile() {
    const pending = readPending<BusinessProfileInput>(BUSINESS_QUEUE_KEY);
    if (pending) return toBusinessRow(pending);

    const cached = readBusinessCache();
    if (!isOnline()) {
      if (!cached) throw new Error('No cached business profile is available offline');
      return toBusinessRow(cached);
    }

    try {
      const businessId = await getBusinessId();
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Business profile query returned no data');
      const profile = {
        businessName: data.name ?? '',
        businessNameUr: data.name_ur ?? '',
        businessNameAr: data.name_ar ?? '',
        phone: data.phone ?? '',
        email: data.email ?? '',
        address: data.address ?? '',
        city: data.city ?? '',
        logo: data.logo ?? '',
      };
      cacheBusiness(profile);
      return data;
    } catch (error) {
      if (!cached) throw error;
      reportBackgroundSyncError(error);
      return toBusinessRow(cached);
    }
  },

  // 2. Business ka data update karna
  async updateBusinessProfile(profile: BusinessProfileInput) {
    localStorage.setItem(BUSINESS_QUEUE_KEY, JSON.stringify(profile));
    cacheBusiness(profile);
    if (isOnline()) await syncNow();
    return toBusinessRow(profile);
  },

  // 3. User ka profile (naam, phone) update karna
  async updateProfile(profile: { fullName: string; phone: string }) {
    localStorage.setItem(ACCOUNT_QUEUE_KEY, JSON.stringify(profile));
    patchStoredUser(profile);
    if (isOnline()) await syncNow();
    return { name: profile.fullName, phone: profile.phone };
  },

  // 4. Email update karna (Supabase Auth ke zariye)
  async updateEmail(newEmail: string) {
    if (!isOnline()) throw new Error('Email changes require an internet connection');
    const { data, error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) throw error;
    return data;
  },

  // 5. Password update karna (Supabase Auth ke zariye)
  async updatePassword(newPassword: string) {
    if (!isOnline()) throw new Error('Password changes require an internet connection');
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data;
  },

  // 6. Logged-in user ka account data (name, phone, email) mangwana
  async getAccount(): Promise<AccountData> {
    const user = getStoredUser();
    const pending = readPending<PendingAccountProfile>(ACCOUNT_QUEUE_KEY);
    if (pending) {
      return {
        ...pending,
        email: user.email ?? '',
      };
    }
    if (!isOnline()) {
      return {
        fullName: user.name ?? '',
        phone: user.phone ?? '',
        email: user.email ?? '',
      };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, phone')
        .eq('id', user.id)
        .single();
      if (error) throw error;

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      const account = {
        fullName: data?.name ?? '',
        phone: data?.phone ?? '',
        email: authData.user?.email ?? user.email ?? '',
      };
      patchStoredUser(account);
      return account;
    } catch (error) {
      if (!user.name && !user.phone && !user.email) throw error;
      reportBackgroundSyncError(error);
      return {
        fullName: user.name ?? '',
        phone: user.phone ?? '',
        email: user.email ?? '',
      };
    }
  },
};