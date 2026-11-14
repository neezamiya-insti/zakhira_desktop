/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable prettier/prettier */
/* eslint-disable react-refresh/only-export-components */
import { useCallback, useEffect, useRef, useState } from 'react';
import { THEME } from '@renderer/theme/theme';
import {
  accountingDashboardService,
  type DashboardMetrics,
} from '@renderer/services/accountingdashboardservice';

// Extra accent colours used only by the dashboard cards
// (agar chahein to inhein theme.ts mein move kar sakte hain)
const ACCENT = {
  success: '#3B7A57',
  danger: '#B85C4A',
  purple: '#8A6A9E',
  pink: '#C26B80',
};

// ============================================================
// 🌍 LANGUAGE
// ============================================================
type Language = 'en' | 'ar' | 'ur' | 'hi';

const getStoredLanguage = (): Language => {
  try {
    const u = JSON.parse(localStorage.getItem('zakhira_user') || '{}');
    const lang = u.language as Language;
    return lang === 'ar' || lang === 'ur' || lang === 'hi' ? lang : 'en';
  } catch {
    return 'en';
  }
};

const isRTLLang = (lang: Language): boolean => lang === 'ar' || lang === 'ur';

// ============================================================
// 📝 MINI TRANSLATIONS
// ============================================================
const DASH_T = {
  en: {
    financialOverview: 'Financial Overview',
    totalRevenue: 'Total Revenue',
    netProfit: 'Net Profit',
    cashInBank: 'Cash in Bank',
    payables: 'Payables',
    receivables: 'Receivables',
    cogs: 'Cost of Goods Sold',
    otherExpenses: 'Other Expenses',
    loadError: 'Could not load financial overview.',
    retry: 'Retry',
  },
  ar: {
    financialOverview: 'نظرة مالية',
    totalRevenue: 'إجمالي الإيرادات',
    netProfit: 'صافي الربح',
    cashInBank: 'النقد في البنك',
    payables: 'المستحقات الدائنة',
    receivables: 'المستحقات المدينة',
    cogs: 'تكلفة البضاعة المباعة',
    otherExpenses: 'مصروفات أخرى',
    loadError: 'تعذر تحميل النظرة المالية.',
    retry: 'إعادة المحاولة',
  },
  ur: {
    financialOverview: 'مالیاتی جائزہ',
    totalRevenue: 'کل آمدنی',
    netProfit: 'خالص منافع',
    cashInBank: 'بینک میں نقد',
    payables: 'واجب الادا',
    receivables: 'وصولی',
    cogs: 'فروخت شدہ اشیاء کی لاگت',
    otherExpenses: 'دیگر اخراجات',
    loadError: 'مالیاتی جائزہ لوڈ نہیں ہو سکا۔',
    retry: 'دوبارہ کوشش کریں',
  },
  hi: {
    financialOverview: 'वित्तीय अवलोकन',
    totalRevenue: 'कुल राजस्व',
    netProfit: 'शुद्ध लाभ',
    cashInBank: 'बैंक में नकद',
    payables: 'देय',
    receivables: 'प्राप्य',
    cogs: 'बेचे गए माल की लागत',
    otherExpenses: 'अन्य खर्च',
    loadError: 'वित्तीय अवलोकन लोड नहीं हो सका।',
    retry: 'पुनः प्रयास',
  },
} as const;

// ============================================================
// 🔧 HELPERS
// ============================================================
const formatPrice = (n: number, lang: Language = 'en'): string => {
  const currency = lang === 'ar' || lang === 'ur' ? 'ر.س' : '';
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  // "-0" na dikhe: sirf tab minus lagao jab rounded value sach mein negative ho
  const negative = n < 0 && Number(abs.toFixed(2)) !== 0;
  return `${negative ? '-' : ''}${currency} ${formatted}`.trim();
};

// ============================================================
// 🖼️ ICONS
// ============================================================
const svgBase = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const Icons = {
  wallet: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M18 12a2 2 0 0 0 0 4h4v-4z" />
    </svg>
  ),
  arrowDown: (
    <svg {...svgBase} strokeWidth={2.5} className="w-4 h-4">
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  ),
  arrowUp: (
    <svg {...svgBase} strokeWidth={2.5} className="w-4 h-4">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  ),
  trendUp: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M3 17l6-6 4 4 8-8M14 7h7v7" />
    </svg>
  ),
  bank: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6" />
    </svg>
  ),
  box: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.3 7 12 12l8.7-5M12 22V12" />
    </svg>
  ),
  coin: (
    <svg {...svgBase} className="w-4 h-4">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9 9h4a2 2 0 0 1 0 4H9h4a2 2 0 0 1 0 4H9" />
    </svg>
  ),
  alert: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
    </svg>
  ),
};

// ============================================================
// 📊 FINANCIAL CARD — clean flat style (same as main dashboard)
// ============================================================
function FinancialCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: React.ReactNode;
}): React.JSX.Element {
  return (
    <div
      className="group rounded-xl p-3 text-start min-w-0 w-full transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: '#fff',
        border: '1px solid rgba(102,116,90,0.2)',
        boxShadow: '0 1px 2px rgba(18,60,50,0.04)',
      }}
    >
      <div className="flex items-start justify-between mb-3 gap-1">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
          style={{
            background: color,
            color: THEME.warmIvory,
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.2), 0 3px 8px rgba(0,0,0,0.12)',
          }}
        >
          {icon}
        </div>
      </div>
      <p
        className="text-[8px] font-semibold uppercase tracking-wider mb-1 truncate"
        style={{ color: THEME.mutedOlive }}
      >
        {label}
      </p>
      <p
        className="text-[18px] font-bold break-words leading-tight tabular-nums"
        style={{ color: THEME.charcoal }}
      >
        {value}
      </p>
    </div>
  );
}

// ============================================================
// 🚀 MAIN COMPONENT
// ============================================================
export default function AccountingDashboard(): React.JSX.Element {
  const language = getStoredLanguage();
  const tr = DASH_T[language];
  const rtl = isRTLLang(language);

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [error, setError] = useState(false);

  // sirf sabse naya request apna result set kare (race condition se bachao)
  const requestId = useRef(0);

  const load = useCallback(async (): Promise<void> => {
    const myId = ++requestId.current;
    try {
      const m = await accountingDashboardService.getMetrics();
      if (myId !== requestId.current) return;
      setMetrics(m);
      setError(false);
    } catch (e) {
      console.error('Dashboard metrics failed', e);
      if (myId !== requestId.current) return;
      setError(true);
    }
  }, []);

  useEffect(() => {
    void load();

    const reload = (): void => {
      void load();
    };
    window.addEventListener('focus', reload);
    window.addEventListener('zakhira:sales-updated', reload as EventListener);
    return () => {
      requestId.current++; // unmount ke baad koi setState na ho
      window.removeEventListener('focus', reload);
      window.removeEventListener(
        'zakhira:sales-updated',
        reload as EventListener
      );
    };
  }, [load]);

  // jab tak data nahi aaya "—" dikhao
  const show = (n: number | undefined): string =>
    metrics && n !== undefined ? formatPrice(n, language) : '—';

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} className="space-y-4">
      <div
        className="rounded-2xl p-3.5"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(102,116,90,0.1)',
        }}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span style={{ color: THEME.warmBrass }}>{Icons.trendUp}</span>
            <h3
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: THEME.deepForest }}
            >
              {tr.financialOverview}
            </h3>
          </div>

          {error && (
            <div
              className="flex items-center gap-2 text-[10px] font-semibold"
              style={{ color: THEME.charcoal }}
            >
              <span style={{ color: THEME.warmBrass }}>{Icons.alert}</span>
              <span>{tr.loadError}</span>
              <button
                type="button"
                onClick={() => void load()}
                className="font-bold hover:underline cursor-pointer"
                style={{ color: THEME.warmBrass }}
              >
                {tr.retry}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
          <FinancialCard
            label={tr.netProfit}
            value={show(metrics?.netProfit)}
            color={
              metrics && metrics.netProfit < 0 ? ACCENT.danger : ACCENT.success
            }
            icon={Icons.wallet}
          />
          <FinancialCard
            label={tr.totalRevenue}
            value={show(metrics?.totalRevenue)}
            color={THEME.deepForest}
            icon={Icons.trendUp}
          />
          <FinancialCard
            label={tr.cashInBank}
            value={show(metrics?.cashInBank)}
            color={THEME.warmBrass}
            icon={Icons.bank}
          />
          <FinancialCard
            label={tr.receivables}
            value={show(metrics?.receivables)}
            color={ACCENT.purple}
            icon={Icons.arrowDown}
          />
          <FinancialCard
            label={tr.payables}
            value={show(metrics?.payables)}
            color={ACCENT.danger}
            icon={Icons.arrowUp}
          />
          <FinancialCard
            label={tr.cogs}
            value={show(metrics?.cogs)}
            color={THEME.mutedOlive}
            icon={Icons.box}
          />
          <FinancialCard
            label={tr.otherExpenses}
            value={show(metrics?.otherExpenses)}
            color={ACCENT.pink}
            icon={Icons.coin}
          />
        </div>
      </div>
    </div>
  );
}