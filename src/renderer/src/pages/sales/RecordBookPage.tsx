/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable prettier/prettier */
/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from 'react';
import SalesCharts from './SalesCharts';
import RecordsSection from './RecordsSection';
import { recordBookStatsService } from '@renderer/services/recordBookStatsService';
import { THEME } from '@renderer/theme/theme';

// ============================================================
// TYPES
// ============================================================
type Language = 'en' | 'ar' | 'ur' | 'hi';

// ============================================================
// STORAGE HELPERS
// ============================================================
const getStoredLanguage = (): Language => {
  try {
    const u = JSON.parse(localStorage.getItem('zakhira_user') || '{}');
    const code = String(u.language || 'en').trim().toLowerCase().slice(0, 2);
    return code === 'ar' || code === 'ur' || code === 'hi' ? code : 'en';
  } catch {
    return 'en';
  }
};

const isRTLLang = (l: Language): boolean => l === 'ar' || l === 'ur';

const formatMoney = (n: number): string => {
  const abs = Math.abs(n);
  return `${n < 0 ? '-' : ''}${abs.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

// ============================================================
// TRANSLATIONS
// ============================================================
const t = {
  en: {
    pageTitle: 'Sales',
    pageSubtitle: 'Track sales performance, payments and invoices',
    totalSales: 'Total Sales',
    receivedAmount: 'Received Amount',
    pendingAmount: 'Pending Amount',
    totalInvoices: 'Total Invoices',
    netSales: 'net sales',
    paidInvoices: 'paid invoices',
    partialInvoices: 'partially paid',
    allIssued: 'issued invoices',
  },
  ar: {
    pageTitle: 'المبيعات',
    pageSubtitle: 'تتبع أداء المبيعات والمدفوعات والفواتير',
    totalSales: 'إجمالي المبيعات',
    receivedAmount: 'المبلغ المستلم',
    pendingAmount: 'المبلغ المعلق',
    totalInvoices: 'إجمالي الفواتير',
    netSales: 'صافي المبيعات',
    paidInvoices: 'فواتير مدفوعة',
    partialInvoices: 'مدفوعة جزئياً',
    allIssued: 'فواتير صادرة',
  },
  ur: {
    pageTitle: 'فروخت',
    pageSubtitle: 'فروخت کی کارکردگی، ادائیگیاں اور انوائسز ٹریک کریں',
    totalSales: 'کل فروخت',
    receivedAmount: 'موصولہ رقم',
    pendingAmount: 'زیر التواء رقم',
    totalInvoices: 'کل انوائسز',
    netSales: 'نیٹ سیلز',
    paidInvoices: 'ادا شدہ انوائسز',
    partialInvoices: 'جزوی ادا شدہ',
    allIssued: 'جاری انوائسز',
  },
  hi: {
    pageTitle: 'बिक्री',
    pageSubtitle: 'बिक्री प्रदर्शन, भुगतान और इनवॉइस ट्रैक करें',
    totalSales: 'कुल बिक्री',
    receivedAmount: 'प्राप्त राशि',
    pendingAmount: 'लंबित राशि',
    totalInvoices: 'कुल इनवॉइस',
    netSales: 'नेट बिक्री',
    paidInvoices: 'भुगतान इनवॉइस',
    partialInvoices: 'आंशिक भुगतान',
    allIssued: 'जारी इनवॉइस',
  },
} as const;

type TrType = { [K in keyof (typeof t)['en']]: string };

// ============================================================
// ICONS
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
  invoice: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  ),
  money: (
    <svg {...svgBase} className="w-4 h-4">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ),
  clock: (
    <svg {...svgBase} className="w-4 h-4">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  trendingUp: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M3 17l6-6 4 4 8-8M14 7h7v7" />
    </svg>
  ),
};

// ============================================================
// STAT CARD
// ============================================================
function StatCard({
  label,
  value,
  icon,
  color,
  hint,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  hint?: string;
}): React.JSX.Element {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: `1px solid ${THEME.mutedOlive}30`,
        borderRadius: 16,
        padding: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: color,
          color: THEME.warmIvory,
          boxShadow: '0 4px 12px rgba(37,42,40,0.15)',
        }}
      >
        {icon}
      </div>
      <div className="min-w-0 text-start">
        <p
          className="text-base font-bold truncate"
          style={{ color: THEME.charcoal }}
        >
          {value}
        </p>
        <p
          className="text-[9px] uppercase tracking-wider font-bold truncate"
          style={{ color: THEME.mutedOlive }}
        >
          {label}
        </p>
        {hint && (
          <p
            className="text-[9px] font-bold mt-0.5 truncate"
            style={{ color: THEME.warmBrass }}
          >
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function RecordBookPage(): React.JSX.Element {
  const [stats, setStats] = useState({
    totalSales: 0,
    receivedAmount: 0,
    pendingAmount: 0,
    totalInvoices: 0,
  });
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<Language>(() => getStoredLanguage());

  // Sync language changes
  useEffect(() => {
    const sync = () => setLanguage(getStoredLanguage());
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  // Fetch stats from Supabase
  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await recordBookStatsService.getSalesStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load stats:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Refresh when RecordsSection changes something
  useEffect(() => {
    const refresh = () => fetchStats();
    window.addEventListener('zakhira:sales-updated', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('zakhira:sales-updated', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const tr: TrType = t[language];
  const isRTL = isRTLLang(language);

  return (
    <div
      className="min-h-screen p-4 lg:p-5"
      style={{ background: THEME.warmIvory }}
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={language}
    >
      {/* HEADER */}
      <div className="mb-4">
        <h1 className="text-xl font-bold" style={{ color: THEME.deepForest }}>
          {tr.pageTitle}
        </h1>
        <p className="mt-1 text-[12px]" style={{ color: THEME.mutedOlive }}>
          {tr.pageSubtitle}
        </p>
      </div>

      {/* 4 STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard
          label={tr.totalSales}
          value={loading ? '...' : formatMoney(stats.totalSales)}
          icon={Icons.trendingUp}
          color={THEME.deepForest}
          hint={tr.netSales}
        />
        <StatCard
          label={tr.receivedAmount}
          value={loading ? '...' : formatMoney(stats.receivedAmount)}
          icon={Icons.money}
          color={THEME.deepForest}
          hint={tr.paidInvoices}
        />
        <StatCard
          label={tr.pendingAmount}
          value={loading ? '...' : formatMoney(stats.pendingAmount)}
          icon={Icons.clock}
          color={THEME.warmBrass}
          hint={tr.partialInvoices}
        />
        <StatCard
          label={tr.totalInvoices}
          value={loading ? '...' : String(stats.totalInvoices)}
          icon={Icons.invoice}
          color={THEME.mutedOlive}
          hint={tr.allIssued}
        />
      </div>

      {/* RECORD BOOK SECTION */}
      <RecordsSection />

      {/* 5 CHARTS */}
      <div className="mb-4">
        <SalesCharts />
      </div>
    </div>
  );
}