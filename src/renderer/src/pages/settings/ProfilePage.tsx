/* eslint-disable prettier/prettier */
/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef, useState } from 'react';
import { THEME } from '@renderer/theme/theme';
import {
  PROFILE_SYNC_ERROR_EVENT,
  profileService,
} from '@renderer/services/profileService';

// ============================================================
// TYPES
// ============================================================
export type Lang = 'en' | 'ar' | 'ur' | 'hi';

export type BusinessProfile = {
  businessName: string;
  businessNameUr: string;
  businessNameAr: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  logo: string;
};

export type UserCredentials = {
  fullName: string;
  email: string;
  phone: string;
  newPassword: string;
  confirmPassword: string;
};

/** Row exactly as it comes from the Supabase `businesses` table */
type DbBusiness = {
  name: string | null;
  name_ur: string | null;
  name_ar: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  logo: string | null;
};

type ErrorInfo = {
  title: string;
  message: string;
  details?: string;
  code?: string;
};

// ============================================================
// TRANSLATIONS (EN, AR, UR, HI)
// ============================================================
const t = {
  en: {
    profileTitle: 'Profile',
    profileSubtitle: 'Your business info and account credentials',
    saved: 'Saved',
    logoTitle: 'Logo',
    logoSubtitle: 'Your business logo',
    noLogo: 'No logo yet',
    uploadLogo: 'Upload logo',
    logoHint: 'PNG, JPG, WebP · Max 1 MB',
    businessInfoTitle: 'Business Information',
    businessInfoSubtitle: 'Your business details',
    businessNameEn: 'Business Name (EN)',
    businessNameUr: 'Name (Urdu)',
    businessNameAr: 'Name (Arabic)',
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
    city: 'City',
    saveProfile: 'Save Profile',
    accountTitle: 'Account Credentials',
    accountSubtitle: 'Update your name, email and password',
    fullName: 'Full Name',
    fullNamePh: 'e.g. Ahmed Al-Farsi',
    emailPh: 'you@business.com',
    phonePh: '+966 50 123 4567',
    changePassword: 'Change Password (optional)',
    newPassword: 'New Password',
    newPasswordPh: 'Min 6 characters',
    confirmPassword: 'Confirm Password',
    confirmPasswordPh: 'Re-enter password',
    cancel: 'Cancel',
    saveChanges: 'Save Changes',
    errName: 'Name is required',
    errEmail: 'Email is required',
    errEmailInvalid: 'Invalid email',
    errPasswordLength: 'Password must be at least 6 characters',
    errPasswordMatch: 'Passwords do not match',
    errLogoType: 'Choose PNG, JPG, or WebP image.',
    errLogoSize: 'Logo must be smaller than 1 MB.',
    errReadFail: 'Could not read the file.',
    errBusinessName: 'Business name is required',
    errorTitle: 'Something went wrong',
    errLoadBusiness: 'Could not load business profile',
    errLoadAccount: 'Could not load account details',
    errSaveProfile: 'Could not save business profile',
    errSaveAccount: 'Could not save account changes',
    errSyncProfile: 'Could not sync profile changes',
    emailPendingNote:
      'Email change requested — check your inbox and confirm the new address.',
    credentialsRequireOnline:
      'Name and phone were saved for sync. Email and password changes require an internet connection.',
    loading: 'Loading…',
    ok: 'OK',
  },
  ar: {
    profileTitle: 'الملف الشخصي',
    profileSubtitle: 'معلومات عملك وبيانات اعتماد الحساب',
    saved: 'تم الحفظ',
    logoTitle: 'الشعار',
    logoSubtitle: 'شعار عملك',
    noLogo: 'لا يوجد شعار بعد',
    uploadLogo: 'تحميل الشعار',
    logoHint: 'PNG, JPG, WebP · بحد أقصى 1 ميجا',
    businessInfoTitle: 'معلومات العمل',
    businessInfoSubtitle: 'تفاصيل عملك',
    businessNameEn: 'اسم العمل (بالإنجليزية)',
    businessNameUr: 'الاسم (أردو)',
    businessNameAr: 'الاسم (عربي)',
    phone: 'الهاتف',
    email: 'البريد الإلكتروني',
    address: 'العنوان',
    city: 'المدينة',
    saveProfile: 'حفظ الملف الشخصي',
    accountTitle: 'بيانات اعتماد الحساب',
    accountSubtitle: 'تحديث اسمك وبريدك الإلكتروني وكلمة المرور',
    fullName: 'الاسم الكامل',
    fullNamePh: 'مثال: أحمد الفارسي',
    emailPh: 'you@business.com',
    phonePh: '+966 50 123 4567',
    changePassword: 'تغيير كلمة المرور (اختياري)',
    newPassword: 'كلمة المرور الجديدة',
    newPasswordPh: '6 أحرف على الأقل',
    confirmPassword: 'تأكيد كلمة المرور',
    confirmPasswordPh: 'أعد إدخال كلمة المرور',
    cancel: 'إلغاء',
    saveChanges: 'حفظ التغييرات',
    errName: 'الاسم مطلوب',
    errEmail: 'البريد الإلكتروني مطلوب',
    errEmailInvalid: 'البريد الإلكتروني غير صالح',
    errPasswordLength: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
    errPasswordMatch: 'كلمات المرور غير متطابقة',
    errLogoType: 'اختر صورة PNG أو JPG أو WebP.',
    errLogoSize: 'يجب أن يكون الشعار أصغر من 1 ميجا.',
    errReadFail: 'تعذر قراءة الملف.',
    errBusinessName: 'اسم العمل مطلوب',
    errorTitle: 'حدث خطأ ما',
    errLoadBusiness: 'تعذر تحميل ملف العمل',
    errLoadAccount: 'تعذر تحميل بيانات الحساب',
    errSaveProfile: 'تعذر حفظ ملف العمل',
    errSaveAccount: 'تعذر حفظ تغييرات الحساب',
    errSyncProfile: 'تعذر مزامنة تغييرات الملف الشخصي',
    emailPendingNote:
      'تم طلب تغيير البريد — تحقق من صندوق الوارد وأكد العنوان الجديد.',
    credentialsRequireOnline:
      'تم حفظ الاسم والهاتف للمزامنة. يتطلب تغيير البريد وكلمة المرور اتصالاً بالإنترنت.',
    loading: 'جارٍ التحميل…',
    ok: 'موافق',
  },
  ur: {
    profileTitle: 'پروفائل',
    profileSubtitle: 'آپ کی کاروباری معلومات اور اکاؤنٹ کی تفصیلات',
    saved: 'محفوظ ہو گیا',
    logoTitle: 'لوگو',
    logoSubtitle: 'آپ کا کاروباری لوگو',
    noLogo: 'ابھی کوئی لوگو نہیں',
    uploadLogo: 'لوگو اپ لوڈ کریں',
    logoHint: 'PNG, JPG, WebP · زیادہ سے زیادہ 1 MB',
    businessInfoTitle: 'کاروباری معلومات',
    businessInfoSubtitle: 'آپ کے کاروبار کی تفصیلات',
    businessNameEn: 'کاروباری نام (انگریزی)',
    businessNameUr: 'نام (اردو)',
    businessNameAr: 'نام (عربی)',
    phone: 'فون',
    email: 'ای میل',
    address: 'پتہ',
    city: 'شہر',
    saveProfile: 'پروفائل محفوظ کریں',
    accountTitle: 'اکاؤنٹ کی معلومات',
    accountSubtitle: 'اپنا نام، ای میل اور پاس ورڈ تبدیل کریں',
    fullName: 'پورا نام',
    fullNamePh: 'مثلاً: احمد الفارسی',
    emailPh: 'you@business.com',
    phonePh: '+966 50 123 4567',
    changePassword: 'پاس ورڈ تبدیل کریں (اختیاری)',
    newPassword: 'نیا پاس ورڈ',
    newPasswordPh: 'کم از کم 6 حروف',
    confirmPassword: 'پاس ورڈ دوبارہ',
    confirmPasswordPh: 'پاس ورڈ دوبارہ درج کریں',
    cancel: 'منسوخ',
    saveChanges: 'تبدیلیاں محفوظ کریں',
    errName: 'نام لازمی ہے',
    errEmail: 'ای میل لازمی ہے',
    errEmailInvalid: 'ای میل غلط ہے',
    errPasswordLength: 'پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے',
    errPasswordMatch: 'پاس ورڈز مماثل نہیں ہیں',
    errLogoType: 'PNG, JPG یا WebP تصویر منتخب کریں۔',
    errLogoSize: 'لوگو 1 MB سے چھوٹا ہونا چاہیے۔',
    errReadFail: 'فائل پڑھی نہیں جا سکی۔',
    errBusinessName: 'کاروباری نام لازمی ہے',
    errorTitle: 'کچھ غلط ہو گیا',
    errLoadBusiness: 'کاروباری پروفائل لوڈ نہیں ہو سکا',
    errLoadAccount: 'اکاؤنٹ کی تفصیلات لوڈ نہیں ہو سکیں',
    errSaveProfile: 'کاروباری پروفائل محفوظ نہیں ہو سکا',
    errSaveAccount: 'اکاؤنٹ کی تبدیلیاں محفوظ نہیں ہو سکیں',
    errSyncProfile: 'پروفائل کی تبدیلیاں سنک نہیں ہو سکیں',
    emailPendingNote:
      'ای میل تبدیلی کی درخواست بھیج دی گئی — ان باکس چیک کر کے نیا پتہ تصدیق کریں۔',
    credentialsRequireOnline:
      'نام اور فون سنک کے لیے محفوظ ہو گئے۔ ای میل اور پاس ورڈ کی تبدیلی کے لیے انٹرنیٹ درکار ہے۔',
    loading: 'لوڈ ہو رہا ہے…',
    ok: 'ٹھیک ہے',
  },
  hi: {
    profileTitle: 'प्रोफ़ाइल',
    profileSubtitle: 'आपकी व्यवसाय की जानकारी और खाता क्रेडेंशियल',
    saved: 'सहेजा गया',
    logoTitle: 'लोगो',
    logoSubtitle: 'आपका व्यवसाय लोगो',
    noLogo: 'अभी तक कोई लोगो नहीं',
    uploadLogo: 'लोगो अपलोड करें',
    logoHint: 'PNG, JPG, WebP · अधिकतम 1 MB',
    businessInfoTitle: 'व्यवसाय की जानकारी',
    businessInfoSubtitle: 'आपके व्यवसाय का विवरण',
    businessNameEn: 'व्यवसाय का नाम (अंग्रेज़ी)',
    businessNameUr: 'नाम (उर्दू)',
    businessNameAr: 'नाम (अरबी)',
    phone: 'फ़ोन',
    email: 'ईमेल',
    address: 'पता',
    city: 'शहर',
    saveProfile: 'प्रोफ़ाइल सहेजें',
    accountTitle: 'खाता क्रेडेंशियल',
    accountSubtitle: 'अपना नाम, ईमेल और पासवर्ड अपडेट करें',
    fullName: 'पूरा नाम',
    fullNamePh: 'जैसे: अहमद अल-फ़ारसी',
    emailPh: 'you@business.com',
    phonePh: '+966 50 123 4567',
    changePassword: 'पासवर्ड बदलें (वैकल्पिक)',
    newPassword: 'नया पासवर्ड',
    newPasswordPh: 'कम से कम 6 अक्षर',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    confirmPasswordPh: 'पासवर्ड फिर से दर्ज करें',
    cancel: 'रद्द करें',
    saveChanges: 'परिवर्तन सहेजें',
    errName: 'नाम आवश्यक है',
    errEmail: 'ईमेल आवश्यक है',
    errEmailInvalid: 'ईमेल अमान्य है',
    errPasswordLength: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए',
    errPasswordMatch: 'पासवर्ड मेल नहीं खाते',
    errLogoType: 'PNG, JPG, या WebP छवि चुनें।',
    errLogoSize: 'लोगो 1 MB से छोटा होना चाहिए।',
    errReadFail: 'फ़ाइल पढ़ी नहीं जा सकी।',
    errBusinessName: 'व्यवसाय का नाम आवश्यक है',
    errorTitle: 'कुछ गलत हो गया',
    errLoadBusiness: 'व्यवसाय प्रोफ़ाइल लोड नहीं हो सकी',
    errLoadAccount: 'खाते का विवरण लोड नहीं हो सका',
    errSaveProfile: 'व्यवसाय प्रोफ़ाइल सहेजी नहीं जा सकी',
    errSaveAccount: 'खाते के परिवर्तन सहेजे नहीं जा सके',
    errSyncProfile: 'प्रोफ़ाइल परिवर्तन सिंक नहीं हो सके',
    emailPendingNote:
      'ईमेल बदलने का अनुरोध भेजा गया — इनबॉक्स देखें और नया पता सत्यापित करें।',
    credentialsRequireOnline:
      'नाम और फ़ोन सिंक के लिए सहेजे गए। ईमेल और पासवर्ड बदलने के लिए इंटरनेट कनेक्शन चाहिए।',
    loading: 'लोड हो रहा है…',
    ok: 'ठीक है',
  },
} as const;

type Translations = {
  [K in keyof typeof t['en']]: string;
};

// ============================================================
// STORAGE (local cache only — real data lives in Supabase)
// ============================================================
// Other pages (invoices, print, etc.) may still read this cache.
const PROFILE_KEY = 'zakhira_settings';

const EMPTY_PROFILE: BusinessProfile = {
  businessName: '',
  businessNameUr: '',
  businessNameAr: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  logo: '',
};

const readCachedProfile = (): BusinessProfile => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return EMPTY_PROFILE;
    return { ...EMPTY_PROFILE, ...JSON.parse(raw) };
  } catch {
    return EMPTY_PROFILE;
  }
};

const cacheProfile = (p: BusinessProfile): void => {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {
    /* ignore — cache only */
  }
};

type StoredUser = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  language?: Lang;
};

const readStoredUser = (): StoredUser => {
  try {
    return JSON.parse(localStorage.getItem('zakhira_user') || '{}');
  } catch {
    return {};
  }
};

const patchStoredUser = (patch: Record<string, string>): void => {
  try {
    localStorage.setItem(
      'zakhira_user',
      JSON.stringify({ ...readStoredUser(), ...patch })
    );
  } catch {
    /* ignore */
  }
};

// ============================================================
// BACKEND HELPERS
// ============================================================
const mapBusiness = (r: DbBusiness): BusinessProfile => ({
  businessName: r.name ?? '',
  businessNameUr: r.name_ur ?? '',
  businessNameAr: r.name_ar ?? '',
  phone: r.phone ?? '',
  email: r.email ?? '',
  address: r.address ?? '',
  city: r.city ?? '',
  logo: r.logo ?? '',
});

/** Supabase throws plain objects (message/details/hint/code); Auth throws Error subclasses */
const describeError = (err: unknown): Omit<ErrorInfo, 'title'> => {
  if (err && typeof err === 'object') {
    const e = err as {
      message?: string;
      details?: string;
      hint?: string;
      code?: string;
      status?: number;
    };
    const details = [
      e.details,
      e.hint ? `Hint: ${e.hint}` : '',
      e.status ? `Status: ${e.status}` : '',
    ]
      .filter(Boolean)
      .join('\n');
    return {
      message: e.message || JSON.stringify(err),
      details: details || undefined,
      code: e.code,
    };
  }
  return { message: String(err) };
};

// ============================================================
// ICONS
// ============================================================
const ICON_PATHS = {
  building: 'M3 21h18M4 10h16M5 10V21M19 10V21M8 10v11M16 10v11M12 3 2 10h20L12 3z',
  image: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM10 8.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM21 15l-5-5L5 21',
  upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
  save: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8',
  check: 'M20 6 9 17l-5-5',
  alert: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  eyeOff: 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22',
  x: 'M18 6 6 18M6 6l12 12',
} as const;

type IconName = keyof typeof ICON_PATHS;

const Icon = ({
  name,
  className = 'w-4 h-4',
  strokeWidth = 2,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}): React.JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d={ICON_PATHS[name]} />
  </svg>
);

// ============================================================
// STYLES (all colors come from THEME)
// ============================================================
const labelCls = 'block text-[9px] font-bold mb-1 uppercase tracking-wider';
const btnCls =
  'h-9 px-4 rounded-full text-[13px] font-bold cursor-pointer transition-all duration-300 hover:brightness-95 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed';
const primaryStyle: React.CSSProperties = {
  background: THEME.warmBrass,
  color: '#FFFFFF',
};
const ghostStyle: React.CSSProperties = {
  background: THEME.warmIvory,
  color: THEME.mutedOlive,
  border: `2px solid ${THEME.mutedOlive}33`,
};
const cardStyle: React.CSSProperties = {
  background: '#FFFFFF',
  border: `1px solid ${THEME.mutedOlive}1A`,
};
const errTextCls = 'text-[10px] font-semibold mt-1 px-1.5';
const ERR_COLOR = '#dc2626';

function TextInput({
  value,
  onChange,
  type = 'text',
  dir,
  placeholder,
  mono = false,
  error = false,
  padEnd = false,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  dir?: 'ltr' | 'rtl';
  placeholder?: string;
  mono?: boolean;
  error?: boolean;
  padEnd?: boolean;
  disabled?: boolean;
}): React.JSX.Element {
  const [focus, setFocus] = useState(false);
  return (
    <input
      type={type}
      dir={dir}
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      className={`w-full h-9 px-3 rounded-full border-2 text-[13px] focus:outline-none transition-all ${
        mono ? 'font-mono' : ''
      }`}
      style={{
        background: error
          ? '#fef2f2'
          : focus
          ? '#FFFFFF'
          : `${THEME.warmIvory}99`,
        borderColor: error
          ? '#fca5a5'
          : focus
          ? THEME.warmBrass
          : `${THEME.mutedOlive}33`,
        color: THEME.charcoal,
        paddingInlineEnd: padEnd ? 40 : undefined,
      }}
    />
  );
}

// ============================================================
// ERROR MODAL (backend errors popup)
// ============================================================
function ErrorModal({
  info,
  okLabel,
  onClose,
}: {
  info: ErrorInfo;
  okLabel: string;
  onClose: () => void;
}): React.JSX.Element {
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: `${THEME.charcoal}80`, backdropFilter: 'blur(4px)' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="rounded-2xl w-full max-w-md max-h-[92vh] flex flex-col shadow-xl"
        style={{ background: THEME.warmIvory }}
      >
        <div
          className="flex items-start justify-between gap-3 px-5 pt-5 pb-3"
          style={{ borderBottom: `1px solid ${THEME.mutedOlive}20` }}
        >
          <h2 className="text-sm font-bold" style={{ color: THEME.deepForest }}>
            {info.title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center cursor-pointer"
            style={{
              background: `${THEME.mutedOlive}15`,
              color: THEME.mutedOlive,
            }}
          >
            <Icon name="x" className="w-3 h-3" strokeWidth={2.5} />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto">
          <div className="flex items-start gap-2 mb-3">
            <span className="mt-0.5" style={{ color: ERR_COLOR }}>
              <Icon name="alert" className="w-3.5 h-3.5" />
            </span>
            <p
              className="text-[13px] font-semibold break-words"
              style={{ color: THEME.charcoal }}
            >
              {info.message}
            </p>
          </div>
          {(info.details || info.code) && (
            <div
              dir="ltr"
              className="rounded-xl p-2.5 mb-3 text-[11px] font-mono break-all whitespace-pre-wrap"
              style={{
                background: '#FFFFFF',
                border: `1px solid ${THEME.mutedOlive}30`,
                color: THEME.mutedOlive,
              }}
            >
              {info.code ? `Code: ${info.code}\n` : ''}
              {info.details}
            </div>
          )}
          <button
            onClick={onClose}
            className={`${btnCls} w-full`}
            style={primaryStyle}
          >
            {okLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN
// ============================================================
type AccountBaseline = { fullName: string; email: string; phone: string };

export default function ProfilePage(): React.JSX.Element {
  const user = readStoredUser();
  const language: Lang = (['en', 'ar', 'ur', 'hi'] as Lang[]).includes(
    user.language as Lang
  )
    ? (user.language as Lang)
    : 'en';
  const isRTL = language === 'ar' || language === 'ur';
  const tr: Translations = t[language];

  const [profile, setProfile] = useState<BusinessProfile>(readCachedProfile);

  const [baseline, setBaseline] = useState<AccountBaseline>({
    fullName: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
  });
  const [credentials, setCredentials] = useState<UserCredentials>({
    fullName: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    newPassword: '',
    confirmPassword: '',
  });
  const profileEdited = useRef(false);
  const credentialsEdited = useRef(false);

  const [loading, setLoading] = useState(() => !localStorage.getItem(PROFILE_KEY));
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [notice, setNotice] = useState('');

  const [logoError, setLogoError] = useState('');
  const [saved, setSaved] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [credErrors, setCredErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState<{
    new: boolean;
    confirm: boolean;
  }>({ new: false, confirm: false });

  /** Logs to console AND shows the popup */
  const reportError = (title: string, err: unknown): void => {
    console.error(`[Profile] ${title}`, err);
    setErrorInfo({ title, ...describeError(err) });
  };

  // Load cached values first, then refresh from Supabase when available.
  useEffect(() => {
    let alive = true;
    const handleSyncError = (event: Event): void => {
      reportError(tr.errSyncProfile, (event as CustomEvent<unknown>).detail);
    };
    window.addEventListener(PROFILE_SYNC_ERROR_EVENT, handleSyncError);
    profileService.startSyncWorker();

    const load = async (): Promise<void> => {
      const [bizR, accR] = await Promise.allSettled([
        profileService.getBusinessProfile(),
        profileService.getAccount(),
      ]);
      if (!alive) return;

      if (bizR.status === 'fulfilled') {
        const mapped = mapBusiness(bizR.value as DbBusiness);
        if (!profileEdited.current) {
          setProfile(mapped);
          cacheProfile(mapped);
        }
      } else {
        reportError(tr.errLoadBusiness, bizR.reason);
      }

      if (accR.status === 'fulfilled') {
        const acc: AccountBaseline = {
          fullName: accR.value.fullName || user.name || '',
          email: accR.value.email || user.email || '',
          phone: accR.value.phone || user.phone || '',
        };
        if (!credentialsEdited.current) {
          setBaseline(acc);
          setCredentials((c) => ({ ...c, ...acc }));
        }
      } else {
        reportError(tr.errLoadAccount, accR.reason);
      }

      setLoading(false);
    };
    void load();
    return () => {
      alive = false;
      window.removeEventListener(PROFILE_SYNC_ERROR_EVENT, handleSyncError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showSaved = (): void => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateProfile = (next: BusinessProfile): void => {
    profileEdited.current = true;
    setProfile(next);
  };

  const updateCredentials = (next: UserCredentials): void => {
    credentialsEdited.current = true;
    setCredentials(next);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const supported = ['image/png', 'image/jpeg', 'image/webp'];
    if (!supported.includes(file.type)) {
      setLogoError(tr.errLogoType);
      return;
    }
    if (file.size > 1024 * 1024) {
      setLogoError(tr.errLogoSize);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        setLogoError(tr.errReadFail);
        return;
      }
      setProfile((p) => ({ ...p, logo: result }));
      profileEdited.current = true;
      setLogoError('');
    };
    reader.onerror = () => setLogoError(tr.errReadFail);
    reader.readAsDataURL(file);
  };

  // ---------- SAVE BUSINESS PROFILE ----------
  const handleSaveProfile = async (): Promise<void> => {
    if (savingProfile) return;
    if (!profile.businessName.trim()) {
      setProfileErrors({ businessName: tr.errBusinessName });
      return;
    }
    setProfileErrors({});
    setSavingProfile(true);
    try {
      const row = await profileService.updateBusinessProfile({
        ...profile,
        businessName: profile.businessName.trim(),
      });
      const mapped = mapBusiness(row as DbBusiness);
      setProfile(mapped);
      cacheProfile(mapped);
      profileEdited.current = false;
      showSaved();
    } catch (err) {
      reportError(tr.errSaveProfile, err); // console + popup
    } finally {
      setSavingProfile(false);
    }
  };

  // ---------- SAVE ACCOUNT (name/phone → email → password) ----------
  const handleSaveAccount = async (): Promise<void> => {
    if (savingAccount) return;
    const errs: Record<string, string> = {};
    if (!credentials.fullName.trim()) errs.fullName = tr.errName;
    if (!credentials.email.trim()) errs.email = tr.errEmail;
    else if (!/^\S+@\S+\.\S+$/.test(credentials.email.trim()))
      errs.email = tr.errEmailInvalid;
    if (credentials.newPassword) {
      if (credentials.newPassword.length < 6)
        errs.newPassword = tr.errPasswordLength;
      if (credentials.newPassword !== credentials.confirmPassword)
        errs.confirmPassword = tr.errPasswordMatch;
    }

    setCredErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const fullName = credentials.fullName.trim();
    const phone = credentials.phone.trim();
    const newEmail = credentials.email.trim();

    setSavingAccount(true);
    setNotice('');
    try {
      // 1) name + phone (profiles table)
      await profileService.updateProfile({ fullName, phone });
      patchStoredUser({ name: fullName, phone });
      setBaseline((b) => ({ ...b, fullName, phone }));

      // 2) email (Supabase Auth) — only if it changed
      let emailPending = false;
      const emailChanged =
        newEmail.toLowerCase() !== baseline.email.toLowerCase();
      const requiresConnection =
        !navigator.onLine && (emailChanged || Boolean(credentials.newPassword));
      if (requiresConnection) {
        setNotice(tr.credentialsRequireOnline);
        showSaved();
        return;
      }

      if (emailChanged) {
        const res = await profileService.updateEmail(newEmail);
        if (res.user?.email?.toLowerCase() === newEmail.toLowerCase()) {
          patchStoredUser({ email: newEmail });
        } else {
          emailPending = true; // Supabase waits for email confirmation
        }
        setBaseline((b) => ({ ...b, email: newEmail }));
      }

      // 3) password (Supabase Auth) — only if filled
      if (credentials.newPassword) {
        await profileService.updatePassword(credentials.newPassword);
      }

      setCredentials((c) => ({ ...c, newPassword: '', confirmPassword: '' }));
      credentialsEdited.current = false;
      if (emailPending) setNotice(tr.emailPendingNote);
      showSaved();
    } catch (err) {
      reportError(tr.errSaveAccount, err); // console + popup
    } finally {
      setSavingAccount(false);
    }
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={language}
      className="min-h-screen p-4 lg:p-5"
      style={{ background: THEME.warmIvory }}
    >
      {/* HEADER */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: THEME.deepForest }}>
            {tr.profileTitle}
          </h1>
          <p className="mt-1 text-[12px]" style={{ color: THEME.mutedOlive }}>
            {loading ? tr.loading : tr.profileSubtitle}
          </p>
        </div>

        {saved && (
          <div
            className="px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1.5"
            style={{
              background: '#dcfce7',
              border: '2px solid #86efac',
              color: '#15803d',
            }}
          >
            <Icon name="check" className="w-3 h-3" strokeWidth={3} />
            <span>{tr.saved}</span>
          </div>
        )}
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT: LOGO */}
        <div className="lg:col-span-1">
          <div
            className="rounded-2xl p-3.5 sticky top-5"
            style={cardStyle}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: THEME.warmBrass, color: '#FFFFFF' }}
              >
                <Icon name="image" className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2
                  className="text-[13px] font-bold"
                  style={{ color: THEME.deepForest }}
                >
                  {tr.logoTitle}
                </h2>
                <p className="text-[9px]" style={{ color: THEME.mutedOlive }}>
                  {tr.logoSubtitle}
                </p>
              </div>
            </div>

            <div
              className="flex h-36 w-full items-center justify-center overflow-hidden rounded-xl p-3 mb-2.5"
              style={{
                border: `2px dashed ${THEME.mutedOlive}4D`,
                background: `${THEME.warmIvory}99`,
              }}
            >
              {profile.logo.startsWith('data:image/') ||
              profile.logo.startsWith('http') ? (
                <img
                  src={profile.logo}
                  alt="Logo"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div
                  className="space-y-1.5 text-center"
                  style={{ color: THEME.mutedOlive }}
                >
                  <div
                    className="flex justify-center"
                    style={{ color: THEME.warmBrass }}
                  >
                    <Icon name="image" className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <p className="text-[11px] font-medium">{tr.noLogo}</p>
                </div>
              )}
            </div>

            <label className={`${btnCls} w-full`} style={primaryStyle}>
              <Icon name="upload" className="w-3.5 h-3.5" />
              <span>{tr.uploadLogo}</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
            <p
              className="mt-1.5 text-[9px] text-center"
              style={{ color: THEME.mutedOlive }}
            >
              {tr.logoHint}
            </p>
            {logoError && (
              <p
                className="mt-1.5 text-[10px] font-semibold flex items-center gap-1"
                style={{ color: ERR_COLOR }}
              >
                <Icon name="alert" className="w-3 h-3" />
                <span>{logoError}</span>
              </p>
            )}
          </div>
        </div>

        {/* RIGHT: FORM + CREDENTIALS */}
        <div className="lg:col-span-2 space-y-4">
          {/* BUSINESS INFO */}
          <div className="rounded-2xl p-3.5" style={cardStyle}>
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: THEME.deepForest, color: THEME.warmIvory }}
              >
                <Icon name="building" className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2
                  className="text-[13px] font-bold"
                  style={{ color: THEME.deepForest }}
                >
                  {tr.businessInfoTitle}
                </h2>
                <p className="text-[9px]" style={{ color: THEME.mutedOlive }}>
                  {tr.businessInfoSubtitle}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className={labelCls} style={{ color: THEME.charcoal }}>
                  {tr.businessNameEn}{' '}
                  <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <TextInput
                  value={profile.businessName}
                  error={!!profileErrors.businessName}
                  onChange={(v) =>
                    updateProfile({ ...profile, businessName: v })
                  }
                />
                {profileErrors.businessName && (
                  <p className={errTextCls} style={{ color: ERR_COLOR }}>
                    {profileErrors.businessName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls} style={{ color: THEME.charcoal }}>
                    {tr.businessNameUr}
                  </label>
                  <TextInput
                    dir="rtl"
                    value={profile.businessNameUr}
                    onChange={(v) =>
                      updateProfile({ ...profile, businessNameUr: v })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls} style={{ color: THEME.charcoal }}>
                    {tr.businessNameAr}
                  </label>
                  <TextInput
                    dir="rtl"
                    value={profile.businessNameAr}
                    onChange={(v) =>
                      updateProfile({ ...profile, businessNameAr: v })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls} style={{ color: THEME.charcoal }}>
                    {tr.phone}
                  </label>
                  <TextInput
                    type="tel"
                    mono
                    value={profile.phone}
                    onChange={(v) => updateProfile({ ...profile, phone: v })}
                  />
                </div>
                <div>
                  <label className={labelCls} style={{ color: THEME.charcoal }}>
                    {tr.email}
                  </label>
                  <TextInput
                    type="email"
                    value={profile.email}
                    onChange={(v) => updateProfile({ ...profile, email: v })}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls} style={{ color: THEME.charcoal }}>
                  {tr.address}
                </label>
                <TextInput
                  value={profile.address}
                  onChange={(v) => updateProfile({ ...profile, address: v })}
                />
              </div>

              <div>
                <label className={labelCls} style={{ color: THEME.charcoal }}>
                  {tr.city}
                </label>
                <TextInput
                  value={profile.city}
                  onChange={(v) => updateProfile({ ...profile, city: v })}
                />
              </div>
            </div>

            <div className="mt-3.5 flex justify-end">
              <button
                onClick={() => void handleSaveProfile()}
                disabled={savingProfile || loading}
                className={btnCls}
                style={primaryStyle}
              >
                <Icon name="save" className="w-3.5 h-3.5" />
                <span>{tr.saveProfile}</span>
              </button>
            </div>
          </div>

          {/* CREDENTIALS */}
          <div className="rounded-2xl p-3.5" style={cardStyle}>
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: THEME.warmBrass, color: '#FFFFFF' }}
              >
                <Icon name="shield" className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2
                  className="text-[13px] font-bold"
                  style={{ color: THEME.deepForest }}
                >
                  {tr.accountTitle}
                </h2>
                <p className="text-[9px]" style={{ color: THEME.mutedOlive }}>
                  {tr.accountSubtitle}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls} style={{ color: THEME.charcoal }}>
                    {tr.fullName} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <TextInput
                    value={credentials.fullName}
                    error={!!credErrors.fullName}
                    placeholder={tr.fullNamePh}
                    onChange={(v) =>
                      updateCredentials({ ...credentials, fullName: v })
                    }
                  />
                  {credErrors.fullName && (
                    <p className={errTextCls} style={{ color: ERR_COLOR }}>
                      {credErrors.fullName}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelCls} style={{ color: THEME.charcoal }}>
                    {tr.email} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <TextInput
                    type="email"
                    value={credentials.email}
                    error={!!credErrors.email}
                    placeholder={tr.emailPh}
                    onChange={(v) =>
                      updateCredentials({ ...credentials, email: v })
                    }
                  />
                  {credErrors.email && (
                    <p className={errTextCls} style={{ color: ERR_COLOR }}>
                      {credErrors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className={labelCls} style={{ color: THEME.charcoal }}>
                  {tr.phone}
                </label>
                <TextInput
                  type="tel"
                  mono
                  value={credentials.phone}
                  placeholder={tr.phonePh}
                  onChange={(v) =>
                    updateCredentials({ ...credentials, phone: v })
                  }
                />
              </div>

              <div
                className="pt-2.5"
                style={{ borderTop: `1px solid ${THEME.mutedOlive}1A` }}
              >
                <p
                  className="text-[9px] font-bold uppercase tracking-wider mb-2.5"
                  style={{ color: THEME.mutedOlive }}
                >
                  {tr.changePassword}
                </p>

                <div className="space-y-3">
                  <div>
                    <label
                      className={labelCls}
                      style={{ color: THEME.charcoal }}
                    >
                      {tr.newPassword}
                    </label>
                    <div className="relative">
                      <TextInput
                        type={showPassword.new ? 'text' : 'password'}
                        value={credentials.newPassword}
                        error={!!credErrors.newPassword}
                        placeholder={tr.newPasswordPh}
                        padEnd
                        onChange={(v) =>
                          updateCredentials({ ...credentials, newPassword: v })
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((p) => ({ ...p, new: !p.new }))
                        }
                        className="absolute top-1/2 -translate-y-1/2 end-2.5 cursor-pointer"
                        style={{ color: THEME.mutedOlive }}
                      >
                        <Icon
                          name={showPassword.new ? 'eyeOff' : 'eye'}
                          className="w-3.5 h-3.5"
                        />
                      </button>
                    </div>
                    {credErrors.newPassword && (
                      <p className={errTextCls} style={{ color: ERR_COLOR }}>
                        {credErrors.newPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className={labelCls}
                      style={{ color: THEME.charcoal }}
                    >
                      {tr.confirmPassword}
                    </label>
                    <div className="relative">
                      <TextInput
                        type={showPassword.confirm ? 'text' : 'password'}
                        value={credentials.confirmPassword}
                        error={!!credErrors.confirmPassword}
                        placeholder={tr.confirmPasswordPh}
                        padEnd
                        onChange={(v) =>
                          updateCredentials({
                            ...credentials,
                            confirmPassword: v,
                          })
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((p) => ({
                            ...p,
                            confirm: !p.confirm,
                          }))
                        }
                        className="absolute top-1/2 -translate-y-1/2 end-2.5 cursor-pointer"
                        style={{ color: THEME.mutedOlive }}
                      >
                        <Icon
                          name={showPassword.confirm ? 'eyeOff' : 'eye'}
                          className="w-3.5 h-3.5"
                        />
                      </button>
                    </div>
                    {credErrors.confirmPassword && (
                      <p className={errTextCls} style={{ color: ERR_COLOR }}>
                        {credErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {notice && (
              <p
                className="mt-3 text-[11px] font-semibold flex items-center gap-1.5"
                style={{ color: THEME.deepForest }}
              >
                <Icon name="check" className="w-3 h-3" strokeWidth={3} />
                <span>{notice}</span>
              </p>
            )}

            <div className="mt-3.5 flex justify-end gap-2.5">
              <button
                onClick={() => {
                  setCredentials({
                    ...baseline,
                    newPassword: '',
                    confirmPassword: '',
                  });
                  credentialsEdited.current = false;
                  setCredErrors({});
                  setNotice('');
                }}
                className={btnCls}
                style={ghostStyle}
              >
                {tr.cancel}
              </button>
              <button
                onClick={() => void handleSaveAccount()}
                disabled={savingAccount || loading}
                className={btnCls}
                style={primaryStyle}
              >
                <Icon name="save" className="w-3.5 h-3.5" />
                <span>{tr.saveChanges}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {errorInfo && (
        <ErrorModal
          info={errorInfo}
          okLabel={tr.ok}
          onClose={() => setErrorInfo(null)}
        />
      )}
    </div>
  );
}