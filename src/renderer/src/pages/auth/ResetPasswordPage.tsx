import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const translations = {
  en: {
    title: 'Reset Password',
    subtitle: 'Choose a new password for your account.',
    password: 'New password',
    confirmPassword: 'Confirm new password',
    save: 'Save New Password',
    saving: 'Updating password...',
    backToLogin: 'Back to Login',
    invalidLink: 'This reset link is invalid or expired. Request a new one from the login page.',
    passwordTooShort: 'Password must be at least 8 characters.',
    passwordMismatch: 'Passwords do not match.',
    updateFailed: 'Could not update your password. Request a new reset link and try again.',
    updateSuccess: 'Your password has been updated. Please sign in with your new password.',
    signOutWarning:
      'Your password was updated, but this device could not clear the recovery session. Close and reopen the app before signing in.',
  },
  ar: {
    title: 'إعادة تعيين كلمة المرور',
    subtitle: 'اختر كلمة مرور جديدة لحسابك.',
    password: 'كلمة المرور الجديدة',
    confirmPassword: 'تأكيد كلمة المرور الجديدة',
    save: 'حفظ كلمة المرور الجديدة',
    saving: 'جارٍ تحديث كلمة المرور...',
    backToLogin: 'العودة إلى تسجيل الدخول',
    invalidLink: 'رابط إعادة التعيين غير صالح أو منتهي. اطلب رابطاً جديداً من صفحة تسجيل الدخول.',
    passwordTooShort: 'يجب ألا تقل كلمة المرور عن 8 أحرف.',
    passwordMismatch: 'كلمتا المرور غير متطابقتين.',
    updateFailed: 'تعذر تحديث كلمة المرور. اطلب رابط إعادة تعيين جديداً وحاول مرة أخرى.',
    updateSuccess: 'تم تحديث كلمة المرور. سجّل الدخول باستخدام كلمة المرور الجديدة.',
    signOutWarning:
      'تم تحديث كلمة المرور، لكن تعذر مسح جلسة الاستعادة من هذا الجهاز. أغلق التطبيق وافتحه قبل تسجيل الدخول.',
  },
  ur: {
    title: 'پاس ورڈ ری سیٹ کریں',
    subtitle: 'اپنے اکاؤنٹ کے لیے نیا پاس ورڈ منتخب کریں۔',
    password: 'نیا پاس ورڈ',
    confirmPassword: 'نئے پاس ورڈ کی تصدیق',
    save: 'نیا پاس ورڈ محفوظ کریں',
    saving: 'پاس ورڈ اپ ڈیٹ ہو رہا ہے...',
    backToLogin: 'لاگ ان پر واپس جائیں',
    invalidLink: 'یہ ری سیٹ لنک غلط یا ختم ہو چکا ہے۔ لاگ ان صفحے سے نیا لنک لیں۔',
    passwordTooShort: 'پاس ورڈ کم از کم 8 حروف کا ہونا چاہیے۔',
    passwordMismatch: 'پاس ورڈ ایک جیسے نہیں ہیں۔',
    updateFailed: 'پاس ورڈ اپ ڈیٹ نہیں ہو سکا۔ نیا ری سیٹ لنک لے کر دوبارہ کوشش کریں۔',
    updateSuccess: 'پاس ورڈ اپ ڈیٹ ہو گیا ہے۔ نئے پاس ورڈ سے لاگ ان کریں۔',
    signOutWarning:
      'پاس ورڈ اپ ڈیٹ ہو گیا، لیکن اس ڈیوائس سے ریکوری سیشن صاف نہیں ہو سکا۔ لاگ ان سے پہلے ایپ بند کر کے دوبارہ کھولیں۔',
  },
  hi: {
    title: 'पासवर्ड रीसेट करें',
    subtitle: 'अपने खाते के लिए नया पासवर्ड चुनें।',
    password: 'नया पासवर्ड',
    confirmPassword: 'नए पासवर्ड की पुष्टि करें',
    save: 'नया पासवर्ड सेव करें',
    saving: 'पासवर्ड अपडेट हो रहा है...',
    backToLogin: 'लॉगिन पर वापस जाएँ',
    invalidLink: 'यह रीसेट लिंक अमान्य या समाप्त हो गया है। लॉगिन पेज से नया लिंक माँगें।',
    passwordTooShort: 'पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।',
    passwordMismatch: 'दोनों पासवर्ड मेल नहीं खाते।',
    updateFailed: 'पासवर्ड अपडेट नहीं हो सका। नया रीसेट लिंक लेकर फिर कोशिश करें।',
    updateSuccess: 'पासवर्ड अपडेट हो गया है। नए पासवर्ड से लॉगिन करें।',
    signOutWarning:
      'पासवर्ड अपडेट हो गया, लेकिन इस डिवाइस से रिकवरी सेशन साफ़ नहीं हो सका। लॉगिन से पहले ऐप बंद करके फिर खोलें।',
  },
} as const;

type Language = keyof typeof translations;

const resolveLanguage = (): Language => {
  try {
    const storedUser = JSON.parse(localStorage.getItem('zakhira_user') || '{}');
    const stored = storedUser.language;
    return stored && stored in translations ? (stored as Language) : 'en';
  } catch {
    return 'en';
  }
};

export default function ResetPasswordPage(): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const [language] = useState<Language>(resolveLanguage);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const tr = translations[language];
  const isRtl = language === 'ar' || language === 'ur';
  const recoveryError = (location.state as { recoveryError?: string } | null)?.recoveryError;
  const isInvalidLink = recoveryError === 'invalid_link';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError('');
    setNotice('');

    if (recoveryError === 'invalid_link') {
      setError(tr.invalidLink);
      return;
    }
    if (password.length < 8) {
      setError(tr.passwordTooShort);
      return;
    }
    if (password !== confirmPassword) {
      setError(tr.passwordMismatch);
      return;
    }

    setSubmitting(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        setError(tr.invalidLink);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        console.error('Password update failed:', updateError.message);
        setError(tr.updateFailed);
        return;
      }

      const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' });
      sessionStorage.removeItem('zakhira_authenticated');
      localStorage.removeItem('zakhira_user');

      if (signOutError) {
        console.error('Could not clear recovery session:', signOutError.message);
        setNotice(tr.signOutWarning);
      } else {
        setNotice(tr.updateSuccess);
      }
      setCompleted(true);
    } catch (submitError) {
      console.error('Password reset failed:', submitError);
      setError(tr.updateFailed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      dir={isRtl ? 'rtl' : 'ltr'}
      className="flex min-h-screen items-center justify-center bg-[#F7F3EA] px-5 py-10"
      style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}
    >
      <section className="w-full max-w-[420px] rounded-2xl border border-[#C49A5A]/40 bg-white p-7 shadow-xl">
        <h1 className="text-2xl font-bold text-[#123C32]">{tr.title}</h1>
        <p className="mt-1.5 text-[13px] text-[#252A28]">{tr.subtitle}</p>

        {(error || (isInvalidLink && tr.invalidLink)) && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700"
          >
            {error || tr.invalidLink}
          </div>
        )}
        {notice && (
          <div
            role="status"
            className={`mt-4 rounded-lg border px-3 py-2 text-[12px] ${
              completed && notice === tr.updateSuccess
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-amber-200 bg-amber-50 text-amber-800'
            }`}
          >
            {notice}
          </div>
        )}

        {completed ? (
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="mt-5 h-10 w-full rounded-full bg-[#C49A5A] text-[13px] font-semibold text-white hover:brightness-95"
          >
            {tr.backToLogin}
          </button>
        ) : (
          <>
            <form onSubmit={(event) => void handleSubmit(event)} className="mt-5 flex flex-col">
              <label htmlFor="new-password" className="mb-1 text-[13px] font-medium text-[#252A28]">
                {tr.password}
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-10 w-full rounded-lg border border-[#66745A] bg-transparent px-3 text-[13px] text-[#252A28] outline-none focus:border-[#C49A5A] focus:ring-2 focus:ring-[#C49A5A]/30"
              />

              <label
                htmlFor="confirm-new-password"
                className="mb-1 mt-3.5 text-[13px] font-medium text-[#252A28]"
              >
                {tr.confirmPassword}
              </label>
              <input
                id="confirm-new-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-10 w-full rounded-lg border border-[#66745A] bg-transparent px-3 text-[13px] text-[#252A28] outline-none focus:border-[#C49A5A] focus:ring-2 focus:ring-[#C49A5A]/30"
              />

              <button
                type="submit"
                disabled={submitting || isInvalidLink}
                className="mt-5 h-10 w-full rounded-full bg-[#C49A5A] text-[13px] font-semibold text-white hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? tr.saving : tr.save}
              </button>
            </form>
            {isInvalidLink && (
              <button
                type="button"
                onClick={() => navigate('/login', { replace: true })}
                className="mt-3 h-10 w-full rounded-full border border-[#123C32] text-[13px] font-semibold text-[#123C32] hover:bg-[#123C32]/5"
              >
                {tr.backToLogin}
              </button>
            )}
          </>
        )}
      </section>
    </main>
  );
}
