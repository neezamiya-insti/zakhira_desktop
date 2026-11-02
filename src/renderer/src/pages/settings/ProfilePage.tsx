/* eslint-disable prettier/prettier */
/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from 'react';

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
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
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
  },
} as const;

// ✅ FIX: Type is now flexible enough to accept ANY of the 4 languages,
// not just the English literal strings.
type Translations = {
  [K in keyof typeof t['en']]: string;
};

// ============================================================
// STORAGE
// ============================================================
const PROFILE_KEY = 'zakhira_settings';
const CREDENTIALS_KEY = 'zakhira_credentials';

const DEFAULT_PROFILE: BusinessProfile = {
  businessName: 'Zakhira Furniture Co.',
  businessNameUr: 'زخیرہ فرنیچر کمپنی',
  businessNameAr: 'شركة زخيرة للأثاث',
  phone: '+966 50 123 4567',
  email: 'info@zakhira.sa',
  address: 'King Fahd Road, Building 12',
  city: 'Riyadh',
  logo: '',
};

const DEFAULT_CREDENTIALS: UserCredentials = {
  fullName: '',
  email: '',
  phone: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

// ============================================================
// ICONS
// ============================================================
const ICON_PATHS = {
  building: 'M3 21h18M4 10h16M5 10V21M19 10V21M8 10v11M16 10v11M12 3 2 10h20L12 3z',
  clipboard: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z',
  image: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM10 8.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM21 15l-5-5L5 21',
  upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
  save: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8',
  check: 'M20 6 9 17l-5-5',
  alert: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  lock: 'M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zM7 11V7a5 5 0 0 1 10 0v4',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 0-8 0 4 4 0 0 0 8 0z',
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 7l-10 6L2 7',
  phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  eyeOff: 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22',
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
// STYLES (real theme — literal hex values) [COMPACT]
// ============================================================
const labelCls =
  'block text-[9px] font-bold text-[#252A28] mb-1 uppercase tracking-wider';
const inputCls =
  'w-full h-9 px-3 rounded-full border-2 border-[#66745A]/20 bg-[#F7F3EA]/60 text-[#252A28] text-[13px] placeholder:text-[#66745A]/40 focus:outline-none focus:border-[#C49A5A] focus:bg-white transition-all';
const primaryBtn =
  'h-9 px-4 rounded-full bg-[#C49A5A] text-white text-[13px] font-bold cursor-pointer transition-all duration-300 hover:brightness-95 hover:shadow-md flex items-center justify-center gap-1.5 disabled:opacity-40';
const ghostBtn =
  'h-9 px-4 rounded-full bg-[#F7F3EA] text-[#66745A] text-[13px] font-bold cursor-pointer border-2 border-[#66745A]/20 hover:bg-white hover:text-[#252A28] transition-all flex items-center justify-center gap-1.5';

// ============================================================
// MAIN
// ============================================================
export default function ProfilePage(): React.JSX.Element {
  const user = JSON.parse(localStorage.getItem('zakhira_user') || '{}');
  const language: Lang = user.language || 'en';
  const isRTL = language === 'ar' || language === 'ur';

  const tr: Translations = t[language];

  const [profile, setProfile] = useState<BusinessProfile>(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (!raw) return DEFAULT_PROFILE;
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_PROFILE, ...parsed };
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [credentials, setCredentials] = useState<UserCredentials>(() => {
    try {
      const raw = localStorage.getItem(CREDENTIALS_KEY);
      if (!raw)
        return {
          ...DEFAULT_CREDENTIALS,
          fullName: user.name || '',
          email: user.email || '',
        };
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_CREDENTIALS, ...parsed };
    } catch {
      return DEFAULT_CREDENTIALS;
    }
  });

  const [logoError, setLogoError] = useState('');
  const [saved, setSaved] = useState(false);
  const [credErrors, setCredErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState<{
    current: boolean;
    new: boolean;
    confirm: boolean;
  }>({ current: false, new: false, confirm: false });

  // Auto-save profile
  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
      /* ignore */
    }
  }, [profile]);

  const showSaved = (): void => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
      setLogoError('');
    };
    reader.onerror = () => setLogoError(tr.errReadFail);
    reader.readAsDataURL(file);
  };

  const handleSaveCredentials = (): void => {
    const errs: Record<string, string> = {};
    if (!credentials.fullName.trim()) errs.fullName = tr.errName;
    if (!credentials.email.trim()) errs.email = tr.errEmail;
    else if (!/^\S+@\S+\.\S+$/.test(credentials.email))
      errs.email = tr.errEmailInvalid;
    if (credentials.newPassword) {
      if (credentials.newPassword.length < 6)
        errs.newPassword = tr.errPasswordLength;
      if (credentials.newPassword !== credentials.confirmPassword)
        errs.confirmPassword = tr.errPasswordMatch;
    }

    setCredErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const savedCreds = JSON.parse(
        localStorage.getItem(CREDENTIALS_KEY) || '{}'
      );
      const merged: UserCredentials = {
        ...DEFAULT_CREDENTIALS,
        ...savedCreds,
        fullName: credentials.fullName,
        email: credentials.email,
        phone: credentials.phone,
      };
      if (credentials.newPassword) {
        merged.currentPassword = credentials.newPassword;
      }
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(merged));
    } catch {
      /* ignore */
    }

    setCredentials((c) => ({
      ...c,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }));
    showSaved();
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={language}
      className="min-h-screen bg-[#F7F3EA] p-4 lg:p-5"
    >
      {/* HEADER */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#123C32]">
            {tr.profileTitle}
          </h1>
          <p className="text-[#66745A] mt-1 text-[12px]">
            {tr.profileSubtitle}
          </p>
        </div>

        {saved && (
          <div className="px-3 py-1.5 rounded-full bg-[#dcfce7] border-2 border-[#86efac] text-[#15803d] text-[10px] font-bold flex items-center gap-1.5">
            <Icon name="check" className="w-3 h-3" strokeWidth={3} />
            <span>{tr.saved}</span>
          </div>
        )}
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT: LOGO */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-[#66745A]/10 p-3.5 sticky top-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#C49A5A] flex items-center justify-center text-white">
                <Icon name="image" className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-[13px] font-bold text-[#123C32]">
                  {tr.logoTitle}
                </h2>
                <p className="text-[9px] text-[#66745A]">
                  {tr.logoSubtitle}
                </p>
              </div>
            </div>

            <div className="flex h-36 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#66745A]/30 bg-[#F7F3EA]/60 p-3 mb-2.5">
              {profile.logo.startsWith('data:image/') ? (
                <img
                  src={profile.logo}
                  alt="Logo"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="space-y-1.5 text-center text-[#66745A]">
                  <div className="flex justify-center text-[#C49A5A]">
                    <Icon name="image" className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <p className="text-[11px] font-medium">
                    {tr.noLogo}
                  </p>
                </div>
              )}
            </div>

            <label className={`${primaryBtn} w-full cursor-pointer`}>
              <Icon name="upload" className="w-3.5 h-3.5" />
              <span>{tr.uploadLogo}</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
            <p className="mt-1.5 text-[9px] text-[#66745A] text-center">
              {tr.logoHint}
            </p>
            {logoError && (
              <p className="mt-1.5 text-[10px] font-semibold text-red-600 flex items-center gap-1">
                <Icon name="alert" className="w-3 h-3" />
                <span>{logoError}</span>
              </p>
            )}
          </div>
        </div>

        {/* RIGHT: FORM + CREDENTIALS */}
        <div className="lg:col-span-2 space-y-4">
          {/* BUSINESS INFO */}
          <div className="bg-white rounded-2xl border border-[#66745A]/10 p-3.5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#123C32] flex items-center justify-center text-[#F7F3EA]">
                <Icon name="building" className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-[13px] font-bold text-[#123C32]">
                  {tr.businessInfoTitle}
                </h2>
                <p className="text-[9px] text-[#66745A]">
                  {tr.businessInfoSubtitle}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className={labelCls}>
                  {tr.businessNameEn}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profile.businessName}
                  onChange={(e) =>
                    setProfile({ ...profile, businessName: e.target.value })
                  }
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>
                    {tr.businessNameUr}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={profile.businessNameUr}
                    onChange={(e) =>
                      setProfile({ ...profile, businessNameUr: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    {tr.businessNameAr}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={profile.businessNameAr}
                    onChange={(e) =>
                      setProfile({ ...profile, businessNameAr: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>
                    {tr.phone}
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    className={`${inputCls} font-mono`}
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    {tr.email}
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>
                  {tr.address}
                </label>
                <input
                  type="text"
                  value={profile.address}
                  onChange={(e) =>
                    setProfile({ ...profile, address: e.target.value })
                  }
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>
                  {tr.city}
                </label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) =>
                    setProfile({ ...profile, city: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
            </div>

            <div className="mt-3.5 flex justify-end">
              <button onClick={showSaved} className={primaryBtn}>
                <Icon name="save" className="w-3.5 h-3.5" />
                <span>{tr.saveProfile}</span>
              </button>
            </div>
          </div>

          {/* CREDENTIALS */}
          <div className="bg-white rounded-2xl border border-[#66745A]/10 p-3.5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#C49A5A] flex items-center justify-center text-white">
                <Icon name="shield" className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-[13px] font-bold text-[#123C32]">
                  {tr.accountTitle}
                </h2>
                <p className="text-[9px] text-[#66745A]">
                  {tr.accountSubtitle}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>
                    {tr.fullName}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={credentials.fullName}
                    onChange={(e) =>
                      setCredentials({ ...credentials, fullName: e.target.value })
                    }
                    placeholder={tr.fullNamePh}
                    className={`${inputCls} ${
                      credErrors.fullName ? '!border-red-300 !bg-red-50' : ''
                    }`}
                  />
                  {credErrors.fullName && (
                    <p className="text-[10px] font-semibold text-red-600 mt-1 px-1.5">
                      {credErrors.fullName}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>
                    {tr.email}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={credentials.email}
                    onChange={(e) =>
                      setCredentials({ ...credentials, email: e.target.value })
                    }
                    placeholder={tr.emailPh}
                    className={`${inputCls} ${
                      credErrors.email ? '!border-red-300 !bg-red-50' : ''
                    }`}
                  />
                  {credErrors.email && (
                    <p className="text-[10px] font-semibold text-red-600 mt-1 px-1.5">
                      {credErrors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className={labelCls}>
                  {tr.phone}
                </label>
                <input
                  type="tel"
                  value={credentials.phone}
                  onChange={(e) =>
                    setCredentials({ ...credentials, phone: e.target.value })
                  }
                  placeholder={tr.phonePh}
                  className={`${inputCls} font-mono`}
                />
              </div>

              <div className="pt-2.5 border-t border-[#66745A]/10">
                <p className="text-[9px] font-bold text-[#66745A] uppercase tracking-wider mb-2.5">
                  {tr.changePassword}
                </p>

                <div className="space-y-3">
                  <div>
                    <label className={labelCls}>
                      {tr.newPassword}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.new ? 'text' : 'password'}
                        value={credentials.newPassword}
                        onChange={(e) =>
                          setCredentials({
                            ...credentials,
                            newPassword: e.target.value,
                          })
                        }
                        placeholder={tr.newPasswordPh}
                        className={`${inputCls} pr-10 ${
                          credErrors.newPassword
                            ? '!border-red-300 !bg-red-50'
                            : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((p) => ({ ...p, new: !p.new }))
                        }
                        className="absolute top-1/2 -translate-y-1/2 right-2.5 text-[#66745A] hover:text-[#252A28] cursor-pointer"
                      >
                        <Icon
                          name={showPassword.new ? 'eyeOff' : 'eye'}
                          className="w-3.5 h-3.5"
                        />
                      </button>
                    </div>
                    {credErrors.newPassword && (
                      <p className="text-[10px] font-semibold text-red-600 mt-1 px-1.5">
                        {credErrors.newPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={labelCls}>
                      {tr.confirmPassword}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.confirm ? 'text' : 'password'}
                        value={credentials.confirmPassword}
                        onChange={(e) =>
                          setCredentials({
                            ...credentials,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder={tr.confirmPasswordPh}
                        className={`${inputCls} pr-10 ${
                          credErrors.confirmPassword
                            ? '!border-red-300 !bg-red-50'
                            : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((p) => ({
                            ...p,
                            confirm: !p.confirm,
                          }))
                        }
                        className="absolute top-1/2 -translate-y-1/2 right-2.5 text-[#66745A] hover:text-[#252A28] cursor-pointer"
                      >
                        <Icon
                          name={showPassword.confirm ? 'eyeOff' : 'eye'}
                          className="w-3.5 h-3.5"
                        />
                      </button>
                    </div>
                    {credErrors.confirmPassword && (
                      <p className="text-[10px] font-semibold text-red-600 mt-1 px-1.5">
                        {credErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3.5 flex justify-end gap-2.5">
              <button
                onClick={() =>
                  setCredentials({
                    ...DEFAULT_CREDENTIALS,
                    fullName: user.name || '',
                    email: user.email || '',
                  })
                }
                className={ghostBtn}
              >
                {tr.cancel}
              </button>
              <button onClick={handleSaveCredentials} className={primaryBtn}>
                <Icon name="save" className="w-3.5 h-3.5" />
                <span>{tr.saveChanges}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}