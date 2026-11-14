import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bgImage from './bg1.png';
import logo from './zakhira-logo.svg';
import { supabase } from '../../lib/supabaseClient'; // <-- APNA SAHI PATH CHECK KAR LENA

type Language = 'en' | 'ar' | 'ur' | 'hi';

// ============================================================
// THEME
// ============================================================
const THEME = {
  warmIvory: '#F7F3EA',
  deepForest: '#123C32',
  mutedOlive: '#66745A',
  charcoal: '#252A28',
  warmBrass: '#C49A5A',
};

const WHITE = '#FFFFFF';

const languages: { code: Language; native: string }[] = [
  { code: 'ar', native: 'العربية' },
  { code: 'ur', native: 'اردو' },
  { code: 'en', native: 'English' },
  { code: 'hi', native: 'हिन्दी' },
];

const t = {
  en: {
    title: 'Login',
    subtitle: 'Access your account and manage your inventory.',
    email: 'Email',
    emailPh: 'Enter your email',
    password: 'Password',
    passwordPh: 'Enter your password',
    remember: 'Remember me',
    forgot: 'Forgot Password?',
    login: 'Login',
    loggingIn: 'Signing in...',
    inventory: 'Inventory Management',
    desc: 'Track stock, sales and purchases in one place. Work in your own language and stay in full control of your business.',
    empty: 'Please enter email and password',
    invalid: 'Invalid email or password.',
    show: 'Show password',
    hide: 'Hide password',
  },
  ar: {
    title: 'تسجيل الدخول',
    subtitle: 'ادخل إلى حسابك وأدر مخزونك.',
    email: 'البريد الإلكتروني',
    emailPh: 'أدخل بريدك الإلكتروني',
    password: 'كلمة المرور',
    passwordPh: 'أدخل كلمة المرور',
    remember: 'تذكرني',
    forgot: 'نسيت كلمة المرور؟',
    login: 'دخول',
    loggingIn: 'جارٍ تسجيل الدخول...',
    inventory: 'إدارة المخزون',
    desc: 'تابع المخزون والمبيعات والمشتريات في مكان واحد. اعمل بلغتك وابقَ مسيطراً على عملك.',
    empty: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور',
    invalid: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    show: 'إظهار كلمة المرور',
    hide: 'إخفاء كلمة المرور',
  },
  ur: {
    title: 'لاگ ان',
    subtitle: 'اپنے اکاؤنٹ تک رسائی حاصل کریں اور اپنی انوینٹری سنبھالیں۔',
    email: 'ای میل',
    emailPh: 'اپنا ای میل درج کریں',
    password: 'پاس ورڈ',
    passwordPh: 'اپنا پاس ورڈ درج کریں',
    remember: 'مجھے یاد رکھیں',
    forgot: 'پاس ورڈ بھول گئے؟',
    login: 'لاگ ان کریں',
    loggingIn: 'لاگ ان ہو رہا ہے...',
    inventory: 'انوینٹری مینجمنٹ',
    desc: 'اسٹاک، فروخت اور خریداری ایک ہی جگہ سنبھالیں۔ اپنی زبان میں کام کریں اور کاروبار پر مکمل کنٹرول رکھیں۔',
    empty: 'ای میل اور پاس ورڈ درج کریں',
    invalid: 'غلط ای میل یا پاس ورڈ',
    show: 'پاس ورڈ دکھائیں',
    hide: 'پاس ورڈ چھپائیں',
  },
  hi: {
    title: 'लॉगिन',
    subtitle: 'अपने खाते में जाएँ और अपनी इन्वेंट्री संभालें।',
    email: 'ईमेल',
    emailPh: 'अपना ईमेल दर्ज करें',
    password: 'पासवर्ड',
    passwordPh: 'अपना पासवर्ड दर्ज करें',
    remember: 'मुझे याद रखें',
    forgot: 'पासवर्ड भूल गए?',
    login: 'लॉगिन करें',
    loggingIn: 'साइन इन हो रहा है...',
    inventory: 'इन्वेंट्री मैनेजमेंट',
    desc: 'स्टॉक, बिक्री और खरीद एक ही जगह संभालें। अपनी भाषा में काम करें और अपने कारोबार पर पूरा नियंत्रण रखें।',
    empty: 'कृपया ईमेल और पासवर्ड दर्ज करें',
    invalid: 'ईमेल या पासवर्ड गलत है',
    show: 'पासवर्ड दिखाएँ',
    hide: 'पासवर्ड छिपाएँ',
  },
} as const;

// ============================================================
// ICONS
// ============================================================
const ICON_PATHS = {
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  eyeOff:
    'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22',
  alert:
    'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  arrow: 'M5 12h14M13 6l6 6-6 6',
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
// LANGUAGE STRIP
// ============================================================
const LanguageStrip = ({
  language,
  onChange,
  className = '',
  style,
}: {
  language: Language;
  onChange: (l: Language) => void;
  className?: string;
  style?: React.CSSProperties;
}): React.JSX.Element => (
  <div
    dir="ltr"
    role="group"
    aria-label="Language"
    className={`flex items-center justify-center gap-1 px-2 ${className}`}
    style={{ background: THEME.warmBrass, zIndex: 50, pointerEvents: 'auto', ...style }}
  >
    {languages.map((lang) => {
      const active = language === lang.code;
      return (
        <button
          key={lang.code}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange(lang.code);
          }}
          aria-pressed={active}
          className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#123C32]"
          style={{
            cursor: 'pointer',
            background: active ? THEME.deepForest : 'transparent',
            color: active ? THEME.warmIvory : THEME.deepForest,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {lang.native}
        </button>
      );
    })}
  </div>
);

// ============================================================
// LOGIN PAGE
// ============================================================
const inputClass =
  'w-full h-10 rounded-lg border bg-transparent px-3 text-[13px] text-[#252A28] placeholder:text-[#66745A]/70 focus:outline-none focus:border-[#C49A5A] focus:ring-2 focus:ring-[#C49A5A]/30 transition text-start';

const BG_SIZE = '24%';
const BG_POSITION = 'right top';
const GREEN_CONTENT_LEFT = '20%';

export default function LoginPage(): React.JSX.Element {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [language, setLanguage] = useState<Language>('en');
  const [remember, setRemember] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const tr = t[language];
  const isRtl = language === 'ar' || language === 'ur';
  const dir = isRtl ? 'rtl' : 'ltr';

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError(tr.empty);
      return;
    }

    setLoading(true);

    try {
      console.log("Attempting Supabase login for:", email);
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      // Logs for debugging
      console.log("Supabase Auth Response:", data);
      if (authError) {
        console.error("Supabase Auth Error:", authError.message);
        setError(tr.invalid);
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log("Login successful! User:", data.user.id);
        
        localStorage.setItem('zakhira_user', JSON.stringify({ 
          email: data.user.email, 
          id: data.user.id,
          role: 'owner', 
          language 
        }));
        
        sessionStorage.setItem('zakhira_authenticated', 'true');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Catch Error:", err);
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div
      dir="ltr"
      className="relative min-h-screen w-full overflow-hidden"
      style={{ background: THEME.warmIvory, fontFamily: "'Poppins', system-ui, sans-serif" }}
    >
      {/* ============ GREEN PANEL (desktop) ============ */}
      <div
        className="hidden lg:block absolute top-0 bottom-0 w-[60%] z-20"
        style={{
          backgroundColor: THEME.deepForest,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: BG_SIZE,
          backgroundPosition: BG_POSITION,
          backgroundRepeat: 'no-repeat',
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 23% 100%)',
          right: 0,
        }}
      >
        <LanguageStrip
          language={language}
          onChange={setLanguage}
          className="absolute top-0 h-9 w-[40%] rounded-b-xl"
          style={{ left: 0 }}
        />

        <div
          className="absolute top-1/2 -translate-y-1/2"
          style={{ left: GREEN_CONTENT_LEFT }}
        >
          <div dir={dir} className="text-start">
            <h2
              dir="ltr"
              className="text-4xl font-bold leading-none text-start"
              style={{ color: WHITE, letterSpacing: '0.04em' }}
            >
              ZAKHIRA
            </h2>
            <p className="mt-2.5 text-xl font-semibold" style={{ color: THEME.warmBrass }}>
              {tr.inventory}
            </p>
            <p className="mt-2.5 w-[300px] text-[13px] leading-relaxed" style={{ color: WHITE }}>
              {tr.desc}
            </p>
          </div>
        </div>
      </div>

      {/* ============ MOBILE: strip across the top ============ */}
      <LanguageStrip
        language={language}
        onChange={setLanguage}
        className="lg:hidden relative z-20 h-9 w-full"
      />

      {/* ============ LOGIN SIDE ============ */}
      <div className="relative z-10 flex min-h-screen flex-col px-6 pt-1 pb-5 sm:px-10 lg:w-[53%] lg:px-12 lg:pt-1 lg:pb-6 max-lg:min-h-[calc(100vh-2.25rem)]">
        <div className="-mt-7 -mb-6 flex w-full justify-center lg:w-[calc(40vw-3rem)]">
          <img
            src={logo}
            alt="ZAKHIRA"
            className="h-48 w-auto select-none"
            draggable={false}
          />
        </div>

        <div className="flex flex-1 items-center">
          <div className="w-full max-w-[400px] lg:ms-[calc(6%+3rem)]">
            {/* ===== Form CARD ===== */}
            <div
              dir={dir}
              className="rounded-2xl border p-7 text-start"
              style={{
                background: WHITE,
                borderColor: 'rgba(196,154,90,0.35)',
                boxShadow:
                  '0 20px 45px -12px rgba(18,60,50,0.22), 0 4px 12px rgba(18,60,50,0.08)',
              }}
            >
              <h1 className="text-2xl font-bold leading-tight" style={{ color: THEME.deepForest }}>
                {tr.title}
              </h1>
              <p className="mt-1.5 text-[13px]" style={{ color: THEME.charcoal }}>
                {tr.subtitle}
              </p>

              {error && (
                <div
                  role="alert"
                  className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] text-red-700"
                >
                  <Icon name="alert" className="mt-px h-3.5 w-3.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="mt-5 flex flex-col">
                {/* Email */}
                <label htmlFor="email" className="mb-1 text-[13px] font-medium" style={{ color: THEME.charcoal }}>
                  {tr.email}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  placeholder={tr.emailPh}
                  autoComplete="email"
                  className={inputClass}
                  style={{ borderColor: THEME.mutedOlive }}
                />

                {/* Password */}
                <label htmlFor="password" className="mb-1 mt-3.5 text-[13px] font-medium" style={{ color: THEME.charcoal }}>
                  {tr.password}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    placeholder={tr.passwordPh}
                    autoComplete="current-password"
                    className={`${inputClass} pe-10`}
                    style={{ borderColor: THEME.mutedOlive }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? tr.hide : tr.show}
                    className="absolute inset-y-0 end-0 flex items-center px-3 transition-colors hover:text-[#C49A5A]"
                    style={{ color: THEME.mutedOlive, cursor: 'pointer' }}
                  >
                    <Icon name={showPassword ? 'eyeOff' : 'eye'} className="w-4 h-4" />
                  </button>
                </div>

                {/* Remember + Forgot */}
                <div className="mt-2.5 flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-[11px]" style={{ color: THEME.charcoal, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRemember(e.target.checked)}
                      className="h-3 w-3 rounded accent-[#123C32]"
                      style={{ cursor: 'pointer' }}
                    />
                    {tr.remember}
                  </label>
                  <button
                    type="button"
                    className="text-[11px] font-medium hover:underline"
                    style={{ color: THEME.deepForest, cursor: 'pointer' }}
                  >
                    {tr.forgot}
                  </button>
                </div>

                {/* Login button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-5 flex h-10 w-full items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold transition-[filter,transform] duration-200 hover:brightness-95 active:scale-[0.99] disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#123C32] focus-visible:ring-offset-2"
                  style={{
                    backgroundColor: THEME.warmBrass,
                    color: WHITE,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? (
                    <>
                      <span
                        className="h-3.5 w-3.5 animate-spin rounded-full border-2"
                        style={{ borderColor: 'rgba(255,255,255,0.4)', borderTopColor: WHITE }}
                      />
                      {tr.loggingIn}
                    </>
                  ) : (
                    <>
                      {tr.login}
                      <Icon
                        name="arrow"
                        className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`}
                        strokeWidth={3}
                      />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}