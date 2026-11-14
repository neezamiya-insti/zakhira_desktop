/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable prettier/prettier */
/* eslint-disable react-refresh/only-export-components */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { THEME } from '@renderer/theme/theme';
import {
  accountingChartsService,
  type ChartsData,
} from '@renderer/services/accountingchartsservice';

// Extra accent colours used only by the charts
// (agar chahein to inhein theme.ts mein move kar sakte hain)
const ACCENT = {
  success: '#3B7A57',
  danger: '#B85C4A',
  purple: '#8A6A9E',
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

const LOCALES: Record<Language, string> = {
  en: 'en-GB',
  ar: 'ar-SA',
  ur: 'ur-PK',
  hi: 'hi-IN',
};

// ============================================================
// 📝 MINI TRANSLATIONS (only chart labels)
// ============================================================
const DASH_T = {
  en: {
    revenueVsExpenses: 'Revenue vs Expenses vs Profit',
    cashFlow: 'Cash Flow',
    monthlyCheck: 'Monthly Overview',
    expenseBreakdown: 'Expense Breakdown',
    revenue: 'Revenue',
    expenses: 'Expenses',
    profit: 'Profit',
    inflow: 'Inflow',
    outflow: 'Outflow',
    noChartData: 'No data for selected period',
    salaries: 'Salaries',
    personalUse: 'Personal Use',
    other: 'Other',
    cogs: 'Cost of Goods Sold',
    levelVeryLow: 'Very Low',
    levelLow: 'Low',
    levelNormal: 'Normal',
    levelHigh: 'High',
    levelPeak: 'Peak',
    activity: 'Cash activity',
    loading: 'Loading...',
    loadError: 'Could not load charts.',
    retry: 'Retry',
  },
  ar: {
    revenueVsExpenses: 'الإيرادات مقابل المصروفات مقابل الربح',
    cashFlow: 'التدفق النقدي',
    monthlyCheck: 'نظرة شهرية',
    expenseBreakdown: 'تفصيل المصروفات',
    revenue: 'الإيراد',
    expenses: 'المصروفات',
    profit: 'الربح',
    inflow: 'تدفق داخل',
    outflow: 'تدفق خارج',
    noChartData: 'لا توجد بيانات للفترة المحددة',
    salaries: 'الرواتب',
    personalUse: 'استخدام شخصي',
    other: 'أخرى',
    cogs: 'تكلفة البضاعة المباعة',
    levelVeryLow: 'منخفض جداً',
    levelLow: 'منخفض',
    levelNormal: 'عادي',
    levelHigh: 'مرتفع',
    levelPeak: 'ذروة',
    activity: 'النشاط النقدي',
    loading: 'جارٍ التحميل...',
    loadError: 'تعذر تحميل الرسوم البيانية.',
    retry: 'إعادة المحاولة',
  },
  ur: {
    revenueVsExpenses: 'آمدنی بمقابلہ اخراجات بمقابلہ منافع',
    cashFlow: 'کیش فلو',
    monthlyCheck: 'ماہانہ جائزہ',
    expenseBreakdown: 'اخراجات کی تفصیل',
    revenue: 'آمدنی',
    expenses: 'اخراجات',
    profit: 'منافع',
    inflow: 'آمد',
    outflow: 'اخراج',
    noChartData: 'منتخب مدت کے لیے کوئی ڈیٹا نہیں',
    salaries: 'تنخواہیں',
    personalUse: 'ذاتی استعمال',
    other: 'دیگر',
    cogs: 'فروخت شدہ اشیاء کی لاگت',
    levelVeryLow: 'بہت کم',
    levelLow: 'کم',
    levelNormal: 'عام',
    levelHigh: 'زیادہ',
    levelPeak: 'عروج',
    activity: 'کیش سرگرمی',
    loading: 'لوڈ ہو رہا ہے...',
    loadError: 'چارٹس لوڈ نہیں ہو سکے۔',
    retry: 'دوبارہ کوشش کریں',
  },
  hi: {
    revenueVsExpenses: 'राजस्व बनाम खर्च बनाम लाभ',
    cashFlow: 'नकदी प्रवाह',
    monthlyCheck: 'मासिक अवलोकन',
    expenseBreakdown: 'खर्च का विवरण',
    revenue: 'राजस्व',
    expenses: 'खर्च',
    profit: 'लाभ',
    inflow: 'आवक',
    outflow: 'जावक',
    noChartData: 'चयनित अवधि के लिए कोई डेटा नहीं',
    salaries: 'वेतन',
    personalUse: 'व्यक्तिगत उपयोग',
    other: 'अन्य',
    cogs: 'बेचे गए माल की लागत',
    levelVeryLow: 'बहुत कम',
    levelLow: 'कम',
    levelNormal: 'सामान्य',
    levelHigh: 'उच्च',
    levelPeak: 'चरम',
    activity: 'नकद गतिविधि',
    loading: 'लोड हो रहा है...',
    loadError: 'चार्ट लोड नहीं हो सके।',
    retry: 'पुनः प्रयास',
  },
} as const;

type DashT = { [K in keyof (typeof DASH_T)['en']]: string };

// ============================================================
// 🔧 HELPERS
// ============================================================
const formatPrice = (n: number, lang: Language = 'en'): string => {
  const currency = lang === 'ar' || lang === 'ur' ? 'ر.س' : 'SAR';
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const negative = n < 0 && Number(abs.toFixed(2)) !== 0;
  return `${negative ? '-' : ''}${currency} ${formatted}`;
};

const formatShortMonth = (key: string): string => {
  const [y, m] = key.split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
};

const compact = (n: number): string => {
  const a = Math.abs(n);
  const s =
    a >= 1e6
      ? `${(a / 1e6).toFixed(1)}M`
      : a >= 1e3
        ? `${(a / 1e3).toFixed(1)}k`
        : a.toFixed(0);
  return n < 0 ? `-${s}` : s;
};

const niceMax = (v: number): number => {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const m = v / p;
  const step = [1, 2, 4, 8, 10].find((s) => m <= s) ?? 10;
  return step * p;
};

// ============================================================
// 🧮 VIEW TYPES
// ============================================================
type MonthlyBucket = {
  key: string;
  label: string;
  revenue: number;
  expenses: number;
  profit: number;
  inflow: number;
  outflow: number;
};

type PieSlice = { name: string; amount: number; color: string };

type HeatData = {
  labels: string[];
  cells: number[][];
};

// ============================================================
// 📈 CHARTS
// ============================================================
function EmptyChart({
  tr,
  height,
  text,
}: {
  tr: DashT;
  height: number;
  text?: string;
}): React.JSX.Element {
  return (
    <div
      className="flex items-center justify-center text-[11px] italic"
      style={{ height, color: THEME.mutedOlive }}
    >
      {text ?? tr.noChartData}
    </div>
  );
}

// ------------------------------------------------------------
// 1) BAR-LINE CHART — Revenue + Expenses bars, Profit line, dual axis
// ------------------------------------------------------------
function RevenueExpensesProfitChart({
  data,
  tr,
}: {
  data: MonthlyBucket[];
  tr: DashT;
}): React.JSX.Element {
  const rows = data.slice(-6);
  if (rows.length === 0) return <EmptyChart tr={tr} height={192} />;

  const W = 600;
  const H = 290;
  const pad = { top: 18, right: 58, bottom: 36, left: 58 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;

  const leftMax = niceMax(
    Math.max(...rows.map((d) => Math.max(d.revenue, d.expenses)), 0)
  );
  const rMaxRaw = Math.max(...rows.map((d) => d.profit), 0);
  const rMinRaw = Math.min(...rows.map((d) => d.profit), 0);
  const rMax = rMaxRaw > 0 ? niceMax(rMaxRaw) : 0;
  const rMin = rMinRaw < 0 ? -niceMax(-rMinRaw) : 0;
  const rTop = rMax === rMin ? 1 : rMax;

  const groupW = iW / rows.length;
  const barW = Math.min(groupW * 0.32, 38);
  const xC = (i: number) => pad.left + groupW * i + groupW / 2;
  const yL = (v: number) => pad.top + iH - (Math.max(0, v) / leftMax) * iH;
  const hL = (v: number) => (Math.max(0, v) / leftMax) * iH;
  const yR = (v: number) => pad.top + iH - ((v - rMin) / (rTop - rMin)) * iH;

  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const linePath = rows
    .map((b, i) => `${i === 0 ? 'M' : 'L'} ${xC(i)} ${yR(b.profit)}`)
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
    >
      {ticks.map((r) => {
        const y = pad.top + iH * (1 - r);
        return (
          <g key={r}>
            <line
              x1={pad.left}
              x2={W - pad.right}
              y1={y}
              y2={y}
              stroke={THEME.mutedOlive}
              strokeOpacity="0.2"
              strokeWidth="1.5"
            />
            <text
              x={pad.left - 10}
              y={y + 4}
              textAnchor="end"
              fontSize="12"
              fill={THEME.charcoal}
            >
              {compact(leftMax * r)}
            </text>
            <text
              x={W - pad.right + 10}
              y={y + 4}
              textAnchor="start"
              fontSize="12"
              fill={THEME.charcoal}
            >
              {compact(rMin + (rTop - rMin) * r)}
            </text>
          </g>
        );
      })}

      {rows.map((_, i) => (
        <line
          key={`v-${i}`}
          x1={pad.left + groupW * i}
          x2={pad.left + groupW * i}
          y1={pad.top}
          y2={pad.top + iH}
          stroke={THEME.mutedOlive}
          strokeOpacity="0.2"
          strokeWidth="1.5"
        />
      ))}

      <rect
        x={pad.left}
        y={pad.top}
        width={iW}
        height={iH}
        fill="none"
        stroke={THEME.mutedOlive}
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />

      {rows.map((b, i) => (
        <g key={b.key}>
          <rect
            x={xC(i) - barW - 1}
            y={yL(b.revenue)}
            width={barW}
            height={hL(b.revenue)}
            fill={THEME.deepForest}
          >
            <title>{`${b.label} — ${tr.revenue}: ${formatPrice(b.revenue)}`}</title>
          </rect>
          <rect
            x={xC(i) + 1}
            y={yL(b.expenses)}
            width={barW}
            height={hL(b.expenses)}
            fill={ACCENT.danger}
          >
            <title>{`${b.label} — ${tr.expenses}: ${formatPrice(b.expenses)}`}</title>
          </rect>
        </g>
      ))}

      <path
        d={linePath}
        fill="none"
        stroke={THEME.warmBrass}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {rows.map((b, i) => (
        <g key={`p-${b.key}`}>
          <circle
            cx={xC(i)}
            cy={yR(b.profit)}
            r={4.5}
            fill={THEME.warmBrass}
            stroke="#FFFFFF"
            strokeWidth={1.5}
          >
            <title>{`${b.label} — ${tr.profit}: ${formatPrice(b.profit)}`}</title>
          </circle>
          <text
            x={xC(i)}
            y={H - 12}
            textAnchor="middle"
            fontSize="12"
            fill={THEME.charcoal}
          >
            {b.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ------------------------------------------------------------
// 2) HEATMAP — Cash Flow (weekday x month)
// ------------------------------------------------------------
const HEAT_LEVELS: {
  key: 'levelVeryLow' | 'levelLow' | 'levelNormal' | 'levelHigh' | 'levelPeak';
  color: string;
  opacity: number;
}[] = [
  { key: 'levelVeryLow', color: THEME.warmIvory, opacity: 1 },
  { key: 'levelLow', color: THEME.mutedOlive, opacity: 0.4 },
  { key: 'levelNormal', color: THEME.mutedOlive, opacity: 1 },
  { key: 'levelHigh', color: THEME.warmBrass, opacity: 1 },
  { key: 'levelPeak', color: ACCENT.danger, opacity: 1 },
];

const heatLevel = (v: number, max: number): number => {
  if (v <= 0 || max <= 0) return 0;
  const r = v / max;
  if (r < 0.15) return 0;
  if (r < 0.4) return 1;
  if (r < 0.65) return 2;
  if (r < 0.85) return 3;
  return 4;
};

function CashFlowHeatChart({
  heat,
  tr,
  language,
}: {
  heat: HeatData;
  tr: DashT;
  language: Language;
}): React.JSX.Element {
  const cols = heat.labels.length;
  if (cols === 0) return <EmptyChart tr={tr} height={160} />;

  const order = [6, 5, 4, 3, 2, 1, 0];
  const dayName = (idx: number): string =>
    new Date(2024, 0, 7 + idx).toLocaleDateString(LOCALES[language], {
      weekday: 'long',
    });

  const max = Math.max(...heat.cells.flat(), 0);

  const W = 600;
  const left = 100;
  const right = 10;
  const top = 10;
  const bottom = 32;
  const cellH = 32;
  const H = top + order.length * cellH + bottom;
  const cellW = (W - left - right) / cols;

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {order.map((dayIdx, row) => (
          <g key={dayIdx}>
            <text
              x={left - 8}
              y={top + row * cellH + cellH / 2 + 3}
              textAnchor="end"
              fontSize="12"
              fill={THEME.charcoal}
            >
              {dayName(dayIdx)}
            </text>
            {heat.cells[dayIdx].map((v, c) => {
              const lvl = HEAT_LEVELS[heatLevel(v, max)];
              return (
                <rect
                  key={c}
                  x={left + c * cellW}
                  y={top + row * cellH}
                  width={cellW}
                  height={cellH}
                  fill={lvl.color}
                  fillOpacity={lvl.opacity}
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                >
                  <title>{`${dayName(dayIdx)} • ${heat.labels[c]} — ${tr.activity}: ${formatPrice(v)}`}</title>
                </rect>
              );
            })}
          </g>
        ))}
        {heat.labels.map((lb, c) => (
          <text
            key={lb}
            x={left + c * cellW + cellW / 2}
            y={H - 10}
            textAnchor="middle"
            fontSize="12"
            fill={THEME.charcoal}
          >
            {lb}
          </text>
        ))}
      </svg>

      <div className="flex items-center justify-center gap-3 flex-wrap mt-2">
        {HEAT_LEVELS.map((l) => (
          <span
            key={l.key}
            className="flex items-center gap-1 text-[9px] font-bold"
            style={{ color: THEME.charcoal }}
          >
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{
                background: l.color,
                opacity: l.opacity,
                border: '1px solid rgba(102,116,90,0.25)',
              }}
            />
            {tr[l.key]}
          </span>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// 3) MULTI-SERIES HORIZONTAL BAR — Monthly Overview
//    Bars match the thickness of the Revenue vs Expenses chart
// ------------------------------------------------------------
function MonthlyCheckChart({
  data,
  tr,
}: {
  data: MonthlyBucket[];
  tr: DashT;
}): React.JSX.Element {
  const rows = data.slice(-4);
  if (rows.length === 0) return <EmptyChart tr={tr} height={160} />;

  const series: {
    key: 'revenue' | 'expenses' | 'inflow' | 'outflow';
    label: string;
    color: string;
  }[] = [
    { key: 'revenue', label: tr.revenue, color: THEME.deepForest },
    { key: 'expenses', label: tr.expenses, color: ACCENT.danger },
    { key: 'inflow', label: tr.inflow, color: ACCENT.success },
    { key: 'outflow', label: tr.outflow, color: THEME.warmBrass },
  ];

  const barH = 26;
  const barGap = 6;
  const groupGap = 26;
  const groupH = series.length * barH + (series.length - 1) * barGap;

  const W = 600;
  const pad = { top: 18, right: 64, bottom: 40, left: 80 };
  const iW = W - pad.left - pad.right;
  const iH = rows.length * groupH + (rows.length - 1) * groupGap;
  const H = pad.top + iH + pad.bottom;

  const maxV = niceMax(
    Math.max(
      ...rows.flatMap((r) => series.map((s) => Math.max(0, r[s.key]))),
      0
    )
  );
  const x = (v: number) => pad.left + (Math.max(0, v) / maxV) * iW;
  const ticks = [0, 0.2, 0.4, 0.6, 0.8, 1];

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {ticks.map((r) => (
          <g key={r}>
            <line
              x1={pad.left + iW * r}
              x2={pad.left + iW * r}
              y1={pad.top}
              y2={pad.top + iH}
              stroke={THEME.mutedOlive}
              strokeOpacity="0.45"
              strokeWidth="1.5"
              strokeDasharray="1 3"
            />
            <text
              x={pad.left + iW * r}
              y={pad.top + iH + 22}
              textAnchor="middle"
              fontSize="12"
              fill={THEME.charcoal}
            >
              {compact(maxV * r)}
            </text>
          </g>
        ))}

        {rows.map((m, gi) => {
          const gy = pad.top + gi * (groupH + groupGap);
          return (
            <g key={m.key}>
              <text
                x={pad.left - 8}
                y={gy + groupH / 2 + 4}
                textAnchor="end"
                fontSize="12"
                fill={THEME.mutedOlive}
              >
                {m.label}
              </text>
              {gi < rows.length - 1 && (
                <line
                  x1={pad.left}
                  x2={pad.left + iW}
                  y1={gy + groupH + groupGap / 2}
                  y2={gy + groupH + groupGap / 2}
                  stroke={THEME.mutedOlive}
                  strokeOpacity="0.45"
                  strokeWidth="1.5"
                  strokeDasharray="1 3"
                />
              )}
              {series.map((s, si) => {
                const v = Math.max(0, m[s.key]);
                const by = gy + si * (barH + barGap);
                return (
                  <g key={s.key}>
                    <rect
                      x={pad.left}
                      y={by}
                      width={Math.max(x(v) - pad.left, 1)}
                      height={barH}
                      fill={s.color}
                    >
                      <title>{`${m.label} — ${s.label}: ${formatPrice(v)}`}</title>
                    </rect>
                    <text
                      x={x(v) + 6}
                      y={by + barH / 2 + 4}
                      fontSize="12"
                      fontWeight="700"
                      fill={THEME.charcoal}
                    >
                      {compact(v)}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      <div className="flex items-center justify-center gap-3 flex-wrap mt-2">
        {series.map((s) => (
          <span
            key={s.key}
            className="flex items-center gap-1 text-[9px] font-bold"
            style={{ color: THEME.charcoal }}
          >
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ background: s.color }}
            />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// 4) DONUT CHART — Expense Breakdown
// ------------------------------------------------------------
function ExpensePieChart({
  slices,
  tr,
}: {
  slices: PieSlice[];
  tr: DashT;
}): React.JSX.Element {
  const total = slices.reduce((s, x) => s + x.amount, 0);
  if (slices.length === 0 || total <= 0)
    return <EmptyChart tr={tr} height={160} />;

  const cx = 100;
  const cy = 100;
  const rO = 92;
  const rI = 54;
  const rM = (rO + rI) / 2;
  const TAU = Math.PI * 2;

  const arcs = slices.map((s, idx) => {
    const frac = s.amount / total;
    const before = slices
      .slice(0, idx)
      .reduce((sum, x) => sum + x.amount / total, 0);
    const start = -Math.PI / 2 + before * TAU;
    const end = start + frac * TAU;
    const mid = (start + end) / 2;
    const large = frac > 0.5 ? 1 : 0;
    const pt = (r: number, a: number) =>
      `${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`;
    const d = [
      `M ${pt(rO, start)}`,
      `A ${rO} ${rO} 0 ${large} 1 ${pt(rO, end)}`,
      `L ${pt(rI, end)}`,
      `A ${rI} ${rI} 0 ${large} 0 ${pt(rI, start)}`,
      'Z',
    ].join(' ');
    return {
      ...s,
      d,
      frac,
      pct: Math.round(frac * 100),
      lx: cx + rM * Math.cos(mid),
      ly: cy + rM * Math.sin(mid),
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <svg viewBox="0 0 200 200" className="w-52 h-52 flex-shrink-0">
        {arcs.length === 1 ? (
          <circle
            cx={cx}
            cy={cy}
            r={rM}
            fill="none"
            stroke={arcs[0].color}
            strokeWidth={rO - rI}
          >
            <title>{`${arcs[0].name}: ${formatPrice(arcs[0].amount)}`}</title>
          </circle>
        ) : (
          arcs.map((a) => (
            <path
              key={a.name}
              d={a.d}
              fill={a.color}
              stroke="#FFFFFF"
              strokeWidth={1.5}
            >
              <title>{`${a.name}: ${formatPrice(a.amount)}`}</title>
            </path>
          ))
        )}
        {arcs.map((a) =>
          a.frac >= 0.04 ? (
            <text
              key={`t-${a.name}`}
              x={arcs.length === 1 ? cx : a.lx}
              y={arcs.length === 1 ? cy - rM : a.ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="14"
              fontWeight="700"
              fill="#FFFFFF"
            >
              {a.pct}%
            </text>
          ) : null
        )}
      </svg>

      <div className="flex-1 space-y-1.5 w-full min-w-0">
        {arcs.map((a) => (
          <div
            key={a.name}
            className="flex items-center justify-between gap-2 text-[10px]"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ background: a.color }}
              />
              <span
                className="font-semibold truncate"
                style={{ color: THEME.charcoal }}
              >
                {a.name}
              </span>
            </div>
            <span
              className="font-bold whitespace-nowrap"
              style={{ color: THEME.mutedOlive }}
            >
              {formatPrice(a.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 🚀 MAIN COMPONENT (zero props — data accountingChartsService se)
// ============================================================
export default function AccountingCharts(): React.JSX.Element {
  const language = getStoredLanguage();
  const tr = DASH_T[language];
  const rtl = isRTLLang(language);

  const [data, setData] = useState<ChartsData | null>(null);
  const [error, setError] = useState(false);

  // sirf sabse naya request apna result set kare (race condition se bachao)
  const requestId = useRef(0);

  const load = useCallback(async (): Promise<void> => {
    const myId = ++requestId.current;
    try {
      const d = await accountingChartsService.getChartsData();
      if (myId !== requestId.current) return;
      setData(d);
      setError(false);
    } catch (e) {
      console.error('Charts data failed', e);
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

  const view = useMemo(() => {
    if (!data) return null;

    // agar poori window mein koi activity nahi to "No data" dikhao
    const hasActivity = data.months.some(
      (m) =>
        m.revenue !== 0 || m.expenses !== 0 || m.inflow !== 0 || m.outflow !== 0
    );

    const monthly: MonthlyBucket[] = hasActivity
      ? data.months.map((m) => ({ ...m, label: formatShortMonth(m.key) }))
      : [];

    const heat: HeatData = hasActivity
      ? { labels: monthly.map((m) => m.label), cells: data.heat }
      : { labels: [], cells: [] };

    const t = data.expenseTotals;
    const slices: PieSlice[] = [
      { name: tr.cogs, amount: t.cogs, color: THEME.warmBrass },
      { name: tr.salaries, amount: t.salaries, color: ACCENT.purple },
      { name: tr.personalUse, amount: t.personalUse, color: ACCENT.danger },
      { name: tr.other, amount: t.other, color: THEME.mutedOlive },
    ].filter((s) => s.amount > 0);

    return { monthly, heat, slices };
  }, [data, tr]);

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(102,116,90,0.1)',
  } as const;

  if (!view) {
    return (
      <div dir={rtl ? 'rtl' : 'ltr'}>
        <div
          className="rounded-2xl p-6 text-center text-[11px] flex items-center justify-center gap-2"
          style={{ ...cardStyle, color: THEME.mutedOlive }}
        >
          {error ? (
            <>
              <span>{tr.loadError}</span>
              <button
                type="button"
                onClick={() => void load()}
                className="font-bold hover:underline cursor-pointer"
                style={{ color: THEME.warmBrass }}
              >
                {tr.retry}
              </button>
            </>
          ) : (
            <span>{tr.loading}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div dir={rtl ? 'rtl' : 'ltr'}>
      {error && (
        <div
          className="mb-3 flex items-center gap-2 text-[10px] font-semibold"
          style={{ color: THEME.charcoal }}
        >
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Revenue vs Expenses vs Profit */}
        <div className="rounded-2xl p-3.5 min-w-0" style={cardStyle}>
          <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
            <h3
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: THEME.deepForest }}
            >
              {tr.revenueVsExpenses}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="flex items-center gap-1 text-[9px] font-bold"
                style={{ color: THEME.mutedOlive }}
              >
                <span
                  className="w-2 h-2 rounded-sm"
                  style={{ background: THEME.deepForest }}
                />
                {tr.revenue}
              </span>
              <span
                className="flex items-center gap-1 text-[9px] font-bold"
                style={{ color: THEME.mutedOlive }}
              >
                <span
                  className="w-2 h-2 rounded-sm"
                  style={{ background: ACCENT.danger }}
                />
                {tr.expenses}
              </span>
              <span
                className="flex items-center gap-1 text-[9px] font-bold"
                style={{ color: THEME.mutedOlive }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: THEME.warmBrass }}
                />
                {tr.profit}
              </span>
            </div>
          </div>
          <RevenueExpensesProfitChart data={view.monthly} tr={tr} />
        </div>

        {/* Cash Flow (Heatmap) */}
        <div className="rounded-2xl p-3.5 min-w-0" style={cardStyle}>
          <h3
            className="text-[10px] font-bold uppercase tracking-wider mb-2"
            style={{ color: THEME.deepForest }}
          >
            {tr.cashFlow}
          </h3>
          <CashFlowHeatChart heat={view.heat} tr={tr} language={language} />
        </div>

        {/* Monthly Overview */}
        <div className="rounded-2xl p-3.5 min-w-0" style={cardStyle}>
          <h3
            className="text-[10px] font-bold uppercase tracking-wider mb-2"
            style={{ color: THEME.deepForest }}
          >
            {tr.monthlyCheck}
          </h3>
          <MonthlyCheckChart data={view.monthly} tr={tr} />
        </div>

        {/* Expense Breakdown */}
        <div className="rounded-2xl p-3.5 min-w-0" style={cardStyle}>
          <h3
            className="text-[10px] font-bold uppercase tracking-wider mb-2"
            style={{ color: THEME.deepForest }}
          >
            {tr.expenseBreakdown}
          </h3>
          <ExpensePieChart slices={view.slices} tr={tr} />
        </div>
      </div>
    </div>
  );
}