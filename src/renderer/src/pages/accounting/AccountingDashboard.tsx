/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable prettier/prettier */
/* eslint-disable react-refresh/only-export-components */
import { useEffect, useMemo, useState } from 'react';


// ============================================================
// 🎨 THEME
// ============================================================
const THEME = {
  warmIvory: '#F7F3EA',
  deepForest: '#123C32',
  mutedOlive: '#66745A',
  charcoal: '#252A28',
  warmBrass: '#C49A5A',
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
  },
} as const;

// ============================================================
// 📦 TYPES
// ============================================================
type TransactionType = 'In' | 'Out' | 'Return';

type Transaction = {
  id: string;
  transactionNo: string;
  date: string;
  customerName: string;
  companyName: string;
  invoiceRef: string;
  type: TransactionType;
  amount: number;
  status: 'Paid' | 'Partially Paid' | 'Pending' | 'Returned';
  mode: string;
};

type SalesDocLine = {
  id: string;
  quantity?: number;
  costPrice?: number;
};

type SalesDocument = {
  id: string;
  orderNumber: string;
  issueDate?: string;
  createdAt?: string;
  lines?: SalesDocLine[];
};

type ExpenseRecord = {
  id: string;
  date: string;
  category: string;
  amount: number;
};

// ============================================================
// 🔑 STORAGE KEYS
// ============================================================
const TRANSACTIONS_STORAGE_KEY = 'zakhira_transactions';
const DOCUMENTS_KEY = 'zakhira_sales_documents';
const EXPENSES_KEY = 'zakhira_expenses';

const loadTransactions = (): Transaction[] => {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
};

const loadDocuments = (): SalesDocument[] => {
  try {
    const raw = localStorage.getItem(DOCUMENTS_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
};

const loadExpenses = (): ExpenseRecord[] => {
  try {
    const raw = localStorage.getItem(EXPENSES_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
};

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
  return `${n < 0 ? '-' : ''}${currency} ${formatted}`.trim();
};

const isReturnEntry = (t: Transaction): boolean =>
  t.type === 'Return' || (t.type === 'Out' && t.status === 'Returned');

const receivedAmount = (t: Transaction): number => {
  if (t.status === 'Paid') return t.amount;
  return 0;
};

const dueAmount = (t: Transaction): number => {
  if (t.status === 'Paid') return 0;
  if (t.status === 'Partially Paid' || t.status === 'Pending') return t.amount;
  return 0;
};

// ============================================================
// 🧮 METRICS
// ============================================================
const computeMetrics = (
  transactions: Transaction[],
  documents: SalesDocument[],
  expenses: ExpenseRecord[]
) => {
  const ins = transactions.filter((t) => t.type === 'In');
  const returns = transactions.filter(isReturnEntry);
  const outs = transactions.filter(
    (t) => t.type === 'Out' && t.status !== 'Returned'
  );

  const grossSales = ins.reduce((s, t) => s + t.amount, 0);
  const totalReturns = returns.reduce((s, t) => s + t.amount, 0);
  const totalRevenue = grossSales - totalReturns;

  let cogs = 0;
  for (const d of documents) {
    for (const l of d.lines || []) {
      const qty = Number(l.quantity || 0);
      const cost = Number(l.costPrice || 0);
      if (qty > 0 && cost > 0) cogs += qty * cost;
    }
  }
  if (cogs === 0 && totalRevenue > 0) cogs = totalRevenue * 0.6;

  const otherExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - cogs - otherExpenses;

  const cashInflow = ins.reduce((s, t) => s + receivedAmount(t), 0);
  const cashOutflow = outs.reduce((s, t) => s + t.amount, 0) + otherExpenses;
  const cashInBank = cashInflow - cashOutflow;

  const receivables = ins.reduce((s, t) => s + dueAmount(t), 0);
  const payables = outs.reduce((s, t) => s + dueAmount(t), 0);

  return {
    totalRevenue,
    netProfit,
    cashInBank,
    payables,
    receivables,
    cogs,
    otherExpenses,
  };
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

  const [transactions, setTransactions] = useState<Transaction[]>(
    loadTransactions
  );
  const [documents, setDocuments] = useState<SalesDocument[]>(loadDocuments);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(loadExpenses);

  useEffect(() => {
    const reload = (): void => {
      setTransactions(loadTransactions());
      setDocuments(loadDocuments());
      setExpenses(loadExpenses());
    };
    window.addEventListener('focus', reload);
    window.addEventListener('zakhira:sales-updated', reload as EventListener);
    window.addEventListener('storage', reload);
    return () => {
      window.removeEventListener('focus', reload);
      window.removeEventListener(
        'zakhira:sales-updated',
        reload as EventListener
      );
      window.removeEventListener('storage', reload);
    };
  }, []);

  const metrics = useMemo(
    () => computeMetrics(transactions, documents, expenses),
    [transactions, documents, expenses]
  );

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} className="space-y-4">
      {/* 📊 FINANCIAL OVERVIEW — clean flat cards like main dashboard */}
      <div
        className="rounded-2xl p-3.5"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(102,116,90,0.1)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span style={{ color: THEME.warmBrass }}>{Icons.trendUp}</span>
          <h3
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: THEME.deepForest }}
          >
            {tr.financialOverview}
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
          <FinancialCard
            label={tr.netProfit}
            value={formatPrice(metrics.netProfit, language)}
            color={metrics.netProfit >= 0 ? THEME.success : THEME.danger}
            icon={Icons.wallet}
          />
          <FinancialCard
            label={tr.totalRevenue}
            value={formatPrice(metrics.totalRevenue, language)}
            color={THEME.deepForest}
            icon={Icons.trendUp}
          />
          <FinancialCard
            label={tr.cashInBank}
            value={formatPrice(metrics.cashInBank, language)}
            color={THEME.warmBrass}
            icon={Icons.bank}
          />
          <FinancialCard
            label={tr.receivables}
            value={formatPrice(metrics.receivables, language)}
            color={THEME.purple}
            icon={Icons.arrowDown}
          />
          <FinancialCard
            label={tr.payables}
            value={formatPrice(metrics.payables, language)}
            color={THEME.danger}
            icon={Icons.arrowUp}
          />
          <FinancialCard
            label={tr.cogs}
            value={formatPrice(metrics.cogs, language)}
            color={THEME.mutedOlive}
            icon={Icons.box}
          />
          <FinancialCard
            label={tr.otherExpenses}
            value={formatPrice(metrics.otherExpenses, language)}
            color={THEME.pink}
            icon={Icons.coin}
          />
        </div>
      </div>

  
    </div>
  );
}