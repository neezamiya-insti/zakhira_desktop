/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable prettier/prettier */
/* eslint-disable react-refresh/only-export-components */
import { useEffect, useMemo, useState } from 'react';

// ============================================================
// THEME (unchanged)
// ============================================================
const THEME = {
  warmIvory: '#F7F3EA',
  deepForest: '#123C32',
  mutedOlive: '#66745A',
  charcoal: '#252A28',
  warmBrass: '#C49A5A',
};

// ============================================================
// TYPES
// ============================================================
type Language = 'en' | 'ar' | 'ur' | 'hi';

type DocLine = {
  material?: string;
  quantity?: number;
  lineTotal?: number;
};

type DocumentRecord = {
  id: string;
  documentType: 'quotation' | 'invoice';
  status: 'Pending' | 'Approved' | 'Rejected';
  paymentStatus: 'Unpaid' | 'Partially Paid' | 'Paid';
  grandTotal: number;
  paymentAmount: number;
  subtotal?: number;
  taxTotal?: number;
  issueDate: string;
  createdAt: string;
  salesChannel?: 'Online' | 'Offline' | string;
  lines?: DocLine[];
};

// ============================================================
// STORAGE
// ============================================================
const DOCUMENTS_KEY = 'zakhira_sales_documents';

const loadDocuments = (): DocumentRecord[] => {
  try {
    const raw = localStorage.getItem(DOCUMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

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

const LOCALES: Record<Language, string> = {
  en: 'en-GB',
  ar: 'ar-SA',
  ur: 'ur-PK',
  hi: 'hi-IN',
};

// ⚠️ NO "SAR" prefix — plain number only
const formatMoney = (n: number): string => {
  const abs = Math.abs(n);
  return `${n < 0 ? '-' : ''}${abs.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
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
// TRANSLATIONS (only chart labels)
// ============================================================
const t = {
  en: {
    salesPerformance: 'Sales Performance',
    onlineVsOffline: 'Online vs Offline Sales',
    orderPatterns: 'Order Patterns',
    topSelling: 'Top-Selling Products',
    invoiceStatus: 'Invoice Status',
    online: 'Online',
    offline: 'Offline',
    noChartData: 'No data yet',
    orders: 'orders',
    units: 'units',
    sales: 'Sales',
    levelVeryLow: 'Very Low',
    levelLow: 'Low',
    levelNormal: 'Normal',
    levelHigh: 'High',
    levelPeak: 'Peak',
    stPaid: 'Paid',
    stPartial: 'Partially Paid',
    stUnpaid: 'Unpaid',
    stPending: 'Pending Approval',
    stRejected: 'Rejected',
    total: 'Total',
  },
  ar: {
    salesPerformance: 'أداء المبيعات',
    onlineVsOffline: 'مبيعات أونلاين مقابل أوفلاين',
    orderPatterns: 'أنماط الطلبات',
    topSelling: 'المنتجات الأكثر مبيعاً',
    invoiceStatus: 'حالة الفواتير',
    online: 'أونلاين',
    offline: 'أوفلاين',
    noChartData: 'لا توجد بيانات بعد',
    orders: 'طلبات',
    units: 'وحدات',
    sales: 'المبيعات',
    levelVeryLow: 'منخفض جداً',
    levelLow: 'منخفض',
    levelNormal: 'عادي',
    levelHigh: 'مرتفع',
    levelPeak: 'ذروة',
    stPaid: 'مدفوعة',
    stPartial: 'مدفوعة جزئياً',
    stUnpaid: 'غير مدفوعة',
    stPending: 'بانتظار الموافقة',
    stRejected: 'مرفوضة',
    total: 'الإجمالي',
  },
  ur: {
    salesPerformance: 'فروخت کی کارکردگی',
    onlineVsOffline: 'آن لائن بمقابلہ آف لائن فروخت',
    orderPatterns: 'آرڈر کے رجحانات',
    topSelling: 'سب سے زیادہ بکنے والی مصنوعات',
    invoiceStatus: 'انوائس کی حالت',
    online: 'آن لائن',
    offline: 'آف لائن',
    noChartData: 'ابھی کوئی ڈیٹا نہیں',
    orders: 'آرڈرز',
    units: 'یونٹس',
    sales: 'فروخت',
    levelVeryLow: 'بہت کم',
    levelLow: 'کم',
    levelNormal: 'عام',
    levelHigh: 'زیادہ',
    levelPeak: 'عروج',
    stPaid: 'ادا شدہ',
    stPartial: 'جزوی ادا شدہ',
    stUnpaid: 'غیر ادا شدہ',
    stPending: 'منظوری کے منتظر',
    stRejected: 'مسترد',
    total: 'کل',
  },
  hi: {
    salesPerformance: 'बिक्री प्रदर्शन',
    onlineVsOffline: 'ऑनलाइन बनाम ऑफ़लाइन बिक्री',
    orderPatterns: 'ऑर्डर पैटर्न',
    topSelling: 'सबसे ज़्यादा बिकने वाले उत्पाद',
    invoiceStatus: 'इनवॉइस की स्थिति',
    online: 'ऑनलाइन',
    offline: 'ऑफ़लाइन',
    noChartData: 'अभी कोई डेटा नहीं',
    orders: 'ऑर्डर',
    units: 'यूनिट',
    sales: 'बिक्री',
    levelVeryLow: 'बहुत कम',
    levelLow: 'कम',
    levelNormal: 'सामान्य',
    levelHigh: 'उच्च',
    levelPeak: 'चरम',
    stPaid: 'भुगतान हुआ',
    stPartial: 'आंशिक भुगतान',
    stUnpaid: 'अवैतनिक',
    stPending: 'अनुमोदन लंबित',
    stRejected: 'अस्वीकृत',
    total: 'कुल',
  },
} as const;

type TrType = { [K in keyof (typeof t)['en']]: string };

// ============================================================
// CHART CARD WRAPPER
// ============================================================
function ChartCard({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div
      className={`rounded-2xl p-3 min-w-0 ${className || ''}`}
      style={{
        background: '#FFFFFF',
        border: `1px solid ${THEME.mutedOlive}30`,
      }}
    >
      <h3
        className="text-[10px] font-bold uppercase tracking-wider mb-2"
        style={{ color: THEME.deepForest }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function EmptyChart({
  tr,
  height,
}: {
  tr: TrType;
  height: number;
}): React.JSX.Element {
  return (
    <div
      className="flex items-center justify-center text-[11px] italic"
      style={{ height, color: THEME.mutedOlive }}
    >
      {tr.noChartData}
    </div>
  );
}

// ============================================================
// 1) SALES PERFORMANCE — line chart (monthly) — SMALLER
// ============================================================
type SalesPoint = { key: string; label: string; value: number };

function SalesPerformanceChart({
  data,
  tr,
}: {
  data: SalesPoint[];
  tr: TrType;
}): React.JSX.Element {
  if (data.length === 0 || data.every((d) => d.value === 0))
    return <EmptyChart tr={tr} height={160} />;

  const W = 600;
  const H = 200; // ← was 260, now smaller
  const pad = { top: 20, right: 20, bottom: 28, left: 48 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;
  const maxV = niceMax(Math.max(...data.map((d) => d.value), 0));

  const x = (i: number) =>
    data.length > 1
      ? pad.left + (i / (data.length - 1)) * iW
      : pad.left + iW / 2;
  const y = (v: number) => pad.top + iH - (v / maxV) * iH;

  const line = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.value)}`)
    .join(' ');
  const area = `${line} L ${x(data.length - 1)} ${pad.top + iH} L ${x(0)} ${pad.top + iH} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="salesAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={THEME.deepForest} stopOpacity="0.28" />
          <stop offset="100%" stopColor={THEME.deepForest} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {[0, 0.25, 0.5, 0.75, 1].map((r) => {
        const gy = pad.top + iH * (1 - r);
        return (
          <g key={r}>
            <line
              x1={pad.left}
              x2={W - pad.right}
              y1={gy}
              y2={gy}
              stroke={THEME.mutedOlive}
              strokeOpacity="0.25"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />
            <text
              x={pad.left - 8}
              y={gy + 3}
              textAnchor="end"
              fontSize="10"
              fill={THEME.charcoal}
            >
              {compact(maxV * r)}
            </text>
          </g>
        );
      })}

      <path d={area} fill="url(#salesAreaGrad)" />
      <path
        d={line}
        fill="none"
        stroke={THEME.deepForest}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {data.map((d, i) => (
        <g key={d.key}>
          <circle
            cx={x(i)}
            cy={y(d.value)}
            r={4}
            fill={THEME.deepForest}
            stroke="#FFFFFF"
            strokeWidth={1.8}
          >
            <title>{`${d.label} — ${tr.sales}: ${formatMoney(d.value)}`}</title>
          </circle>
          <text
            x={x(i)}
            y={y(d.value) - 8}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill={THEME.charcoal}
          >
            {d.value > 0 ? compact(d.value) : ''}
          </text>
          <text
            x={x(i)}
            y={H - 10}
            textAnchor="middle"
            fontSize="10"
            fill={THEME.charcoal}
          >
            {d.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ============================================================
// 2) ONLINE vs OFFLINE — simple pie chart (flat colors, outside labels)
// ============================================================
function ChannelPieChart({
  online,
  offline,
  tr,
}: {
  online: number;
  offline: number;
  tr: TrType;
}): React.JSX.Element {
  const total = online + offline;
  if (total <= 0) return <EmptyChart tr={tr} height={160} />;

  const cx = 170;
  const cy = 110;
  const r = 80;

  const slices = [
    { label: tr.online, value: online, color: THEME.deepForest },
    { label: tr.offline, value: offline, color: THEME.warmBrass },
  ].filter((s) => s.value > 0);

  // 3 o'clock se shuru, anti-clockwise
  let angle = 0;
  const parts = slices.map((s) => {
    const frac = s.value / total;
    const start = angle;
    const end = angle - frac * Math.PI * 2;
    angle = end;
    const mid = slices.length === 1 ? -Math.PI / 4 : (start + end) / 2;
    const large = frac > 0.5 ? 1 : 0;
    const cos = Math.cos(mid);
    return {
      ...s,
      pct: Math.round(frac * 100),
      d: `M ${cx} ${cy} L ${cx + r * Math.cos(start)} ${cy + r * Math.sin(start)} A ${r} ${r} 0 ${large} 0 ${cx + r * Math.cos(end)} ${cy + r * Math.sin(end)} Z`,
      lx: cx + (r + 12) * cos,
      ly: cy + (r + 12) * Math.sin(mid),
      anchor: cos > 0.15 ? 'start' : cos < -0.15 ? 'end' : 'middle',
    };
  });

  return (
    <div>
      <svg viewBox="0 0 340 220" className="w-full h-auto max-w-[280px] mx-auto">
        {parts.length === 1 ? (
          <circle cx={cx} cy={cy} r={r} fill={parts[0].color} />
        ) : (
          parts.map((p) => (
            <path key={p.label} d={p.d} fill={p.color} stroke="#fff" strokeWidth={1}>
              <title>{`${p.label}: ${formatMoney(p.value)}`}</title>
            </path>
          ))
        )}
        {parts.map((p) => (
          <text
            key={`t-${p.label}`}
            x={p.lx}
            y={p.ly}
            textAnchor={p.anchor as 'start' | 'end' | 'middle'}
            dominantBaseline="middle"
            fontSize="12"
            fill={THEME.charcoal}
          >
            {p.label} {p.pct}%
          </text>
        ))}
      </svg>

      <div className="mt-2 space-y-1">
        {slices.map((s) => (
          <div
            key={s.label}
            className="flex items-center justify-between text-[10px] font-bold"
          >
            <span className="flex items-center gap-1.5" style={{ color: THEME.charcoal }}>
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
              {s.label}
            </span>
            <span style={{ color: THEME.mutedOlive }}>{formatMoney(s.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 3) ORDER PATTERNS — heatmap — SMALLER
// ============================================================
const HEAT_LEVELS: {
  key: 'levelVeryLow' | 'levelLow' | 'levelNormal' | 'levelHigh' | 'levelPeak';
  color: string;
  opacity: number;
}[] = [
  { key: 'levelVeryLow', color: THEME.warmIvory, opacity: 1 },
  { key: 'levelLow', color: THEME.mutedOlive, opacity: 0.4 },
  { key: 'levelNormal', color: THEME.mutedOlive, opacity: 1 },
  { key: 'levelHigh', color: THEME.warmBrass, opacity: 1 },
  { key: 'levelPeak', color: THEME.deepForest, opacity: 1 },
];

const heatLevel = (v: number, max: number): number => {
  if (v <= 0 || max <= 0) return 0;
  const r = v / max;
  if (r < 0.25) return 1;
  if (r < 0.5) return 2;
  if (r < 0.8) return 3;
  return 4;
};

const slotLabel = (h: number): string =>
  `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? 'AM' : 'PM'}`;

function OrderPatternsHeat({
  cells,
  tr,
  language,
}: {
  cells: number[][];
  tr: TrType;
  language: Language;
}): React.JSX.Element {
  const max = Math.max(...cells.flat(), 0);
  if (max <= 0) return <EmptyChart tr={tr} height={160} />;

  const order = [6, 5, 4, 3, 2, 1, 0];
  const dayName = (idx: number): string =>
    new Date(2024, 0, 7 + idx).toLocaleDateString(LOCALES[language], {
      weekday: 'long',
    });

  const W = 700;
  const left = 90;
  const right = 10;
  const top = 8;
  const bottom = 28;
  const cellH = 26; // ← was 32, now smaller
  const slots = 12;
  const cellW = (W - left - right) / slots;
  const H = top + order.length * cellH + bottom;

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
              fontSize="10"
              fill={THEME.charcoal}
            >
              {dayName(dayIdx)}
            </text>
            {cells[dayIdx].map((v, c) => {
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
                  strokeWidth={1.2}
                >
                  <title>{`${dayName(dayIdx)} ${slotLabel(c * 2)}–${slotLabel(c * 2 + 2)}: ${v} ${tr.orders}`}</title>
                </rect>
              );
            })}
          </g>
        ))}
        {Array.from({ length: slots }, (_, c) => (
          <text
            key={c}
            x={left + c * cellW + cellW / 2}
            y={H - 10}
            textAnchor="middle"
            fontSize="9"
            fill={THEME.charcoal}
          >
            {slotLabel(c * 2)}
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
                border: `1px solid ${THEME.mutedOlive}40`,
              }}
            />
            {tr[l.key]}
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 4) TOP-SELLING PRODUCTS — bar chart — SMALLER
// ============================================================
function TopProductsChart({
  data,
  tr,
}: {
  data: { name: string; qty: number; revenue: number }[];
  tr: TrType;
}): React.JSX.Element {
  if (data.length === 0) return <EmptyChart tr={tr} height={160} />;

  const colors = [
    THEME.deepForest,
    THEME.warmBrass,
    THEME.mutedOlive,
    THEME.charcoal,
    THEME.deepForest,
  ];
  const W = 600;
  const H = 220; // ← was 270, now smaller
  const pad = { top: 24, right: 16, bottom: 36, left: 44 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;
  const maxV = niceMax(Math.max(...data.map((d) => d.qty), 0));
  const groupW = iW / data.length;
  const barW = Math.min(groupW * 0.4, 34); // narrower, matches inventory chart

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
    >
      {[0, 0.25, 0.5, 0.75, 1].map((r) => {
        const gy = pad.top + iH * (1 - r);
        return (
          <g key={r}>
            <line
              x1={pad.left}
              x2={W - pad.right}
              y1={gy}
              y2={gy}
              stroke={THEME.mutedOlive}
              strokeOpacity="0.25"
              strokeWidth="1.2"
            />
            <text
              x={pad.left - 6}
              y={gy + 3}
              textAnchor="end"
              fontSize="10"
              fill={THEME.charcoal}
            >
              {compact(maxV * r)}
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const h = (d.qty / maxV) * iH;
        const bx = pad.left + groupW * i + (groupW - barW) / 2;
        const by = pad.top + iH - h;
        const label = d.name.length > 12 ? `${d.name.slice(0, 11)}…` : d.name;
        return (
          <g key={d.name}>
            <rect
              x={bx}
              y={by}
              width={barW}
              height={Math.max(h, 1)}
              rx={3}
              fill={colors[i % colors.length]}
            >
              <title>{`${d.name}: ${d.qty} ${tr.units} • ${formatMoney(d.revenue)}`}</title>
            </rect>
            <text
              x={bx + barW / 2}
              y={by - 6}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill={THEME.charcoal}
            >
              {d.qty}
            </text>
            <text
              x={bx + barW / 2}
              y={H - 12}
              textAnchor="middle"
              fontSize="10"
              fill={THEME.charcoal}
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ============================================================
// 5) INVOICE STATUS — donut chart — SMALLER
// ============================================================
type StatusSlice = {
  name: string;
  value: number;
  color: string;
  opacity: number;
};

function InvoiceStatusDonut({
  slices,
  tr,
}: {
  slices: StatusSlice[];
  tr: TrType;
}): React.JSX.Element {
  const visible = slices.filter((s) => s.value > 0);
  const total = visible.reduce((s, x) => s + x.value, 0);
  if (visible.length === 0 || total <= 0)
    return <EmptyChart tr={tr} height={160} />;

  const cx = 100;
  const cy = 100;
  const rO = 82; // ← was 92
  const rI = 50; // ← was 56
  const rM = (rO + rI) / 2;
  const TAU = Math.PI * 2;

  const arcs = visible.map((s, idx) => {
    const frac = s.value / total;
    const before = visible
      .slice(0, idx)
      .reduce((sum, x) => sum + x.value / total, 0);
    const start = -Math.PI / 2 + before * TAU;
    const end = start + frac * TAU;
    const mid = (start + end) / 2;
    const large = frac > 0.5 ? 1 : 0;
    const pt = (rad: number, a: number) =>
      `${cx + rad * Math.cos(a)} ${cy + rad * Math.sin(a)}`;
    return {
      ...s,
      frac,
      pct: Math.round(frac * 100),
      d: [
        `M ${pt(rO, start)}`,
        `A ${rO} ${rO} 0 ${large} 1 ${pt(rO, end)}`,
        `L ${pt(rI, end)}`,
        `A ${rI} ${rI} 0 ${large} 0 ${pt(rI, start)}`,
        'Z',
      ].join(' '),
      lx: cx + rM * Math.cos(mid),
      ly: cy + rM * Math.sin(mid),
    };
  });

  return (
    <div>
      <svg
        viewBox="0 0 200 200"
        className="w-full h-auto max-w-[160px] mx-auto" // ← was 210, now smaller
      >
        {arcs.length === 1 ? (
          <circle
            cx={cx}
            cy={cy}
            r={rM}
            fill="none"
            stroke={arcs[0].color}
            strokeOpacity={arcs[0].opacity}
            strokeWidth={rO - rI}
          >
            <title>{`${arcs[0].name}: ${arcs[0].value}`}</title>
          </circle>
        ) : (
          arcs.map((a) => (
            <path
              key={a.name}
              d={a.d}
              fill={a.color}
              fillOpacity={a.opacity}
              stroke="#FFFFFF"
              strokeWidth={1.2}
            >
              <title>{`${a.name}: ${a.value}`}</title>
            </path>
          ))
        )}
        {arcs.map((a) =>
          a.frac >= 0.05 ? (
            <text
              key={`t-${a.name}`}
              x={arcs.length === 1 ? cx : a.lx}
              y={arcs.length === 1 ? cy - rM : a.ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fontWeight="700"
              fill="#FFFFFF"
            >
              {a.pct}%
            </text>
          ) : null
        )}
        <text
          x={cx}
          y={cy - 3}
          textAnchor="middle"
          fontSize="18"
          fontWeight="700"
          fill={THEME.deepForest}
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          fontSize="9"
          fill={THEME.mutedOlive}
        >
          {tr.total}
        </text>
      </svg>

      <div className="mt-2 space-y-1">
        {arcs.map((a) => (
          <div
            key={a.name}
            className="flex items-center justify-between gap-2 text-[10px] font-bold"
          >
            <span
              className="flex items-center gap-1.5 min-w-0"
              style={{ color: THEME.charcoal }}
            >
              <span
                className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ background: a.color, opacity: a.opacity }}
              />
              <span className="truncate">{a.name}</span>
            </span>
            <span style={{ color: THEME.mutedOlive }}>{a.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 🚀 MAIN INDEPENDENT COMPONENT (zero props)
// ============================================================
export default function SalesCharts(): React.JSX.Element {
  const [documents, setDocuments] = useState<DocumentRecord[]>(() =>
    loadDocuments()
  );
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

  // Sync documents when parent updates them
  useEffect(() => {
    const refresh = () => setDocuments(loadDocuments());
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('zakhira:sales-updated', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('zakhira:sales-updated', refresh);
    };
  }, []);

  const tr: TrType = t[language];
  const isRTL = isRTLLang(language);

  const charts = useMemo(() => {
    const invoices = documents.filter((d) => d.documentType === 'invoice');
    const approved = invoices.filter((d) => d.status === 'Approved');
    const netOf = (d: DocumentRecord): number => d.subtotal ?? d.grandTotal;

    // 1) Sales Performance — last 6 months
    const now = new Date();
    const months: SalesPoint[] = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: d.toLocaleDateString(LOCALES[language], { month: 'short' }),
        value: 0,
      };
    });
    for (const d of approved) {
      const dt = new Date(d.issueDate || d.createdAt);
      if (isNaN(dt.getTime())) continue;
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      const m = months.find((x) => x.key === key);
      if (m) m.value += netOf(d);
    }

    // 2) Online vs Offline
    let online = 0;
    let offline = 0;
    for (const d of approved) {
      if (String(d.salesChannel || '').toLowerCase() === 'online')
        online += netOf(d);
      else offline += netOf(d);
    }

    // 3) Order Patterns
    const cells: number[][] = Array.from({ length: 7 }, () =>
      Array.from({ length: 12 }, () => 0)
    );
    for (const d of invoices) {
      if (d.status === 'Rejected') continue;
      const dt = new Date(d.createdAt || d.issueDate);
      if (isNaN(dt.getTime())) continue;
      cells[dt.getDay()][Math.floor(dt.getHours() / 2)] += 1;
    }

    // 4) Top-Selling Products — top 5
    const prodMap = new Map<string, { qty: number; revenue: number }>();
    for (const d of approved) {
      for (const l of d.lines || []) {
        const name = l.material || '—';
        const cur = prodMap.get(name) || { qty: 0, revenue: 0 };
        cur.qty += Number(l.quantity || 0);
        cur.revenue += Number(l.lineTotal || 0);
        prodMap.set(name, cur);
      }
    }
    const top5 = Array.from(prodMap.entries())
      .map(([name, v]) => ({ name, qty: v.qty, revenue: v.revenue }))
      .filter((p) => p.qty > 0)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // 5) Invoice Status
    const count = {
      paid: 0,
      partial: 0,
      unpaid: 0,
      pending: 0,
      rejected: 0,
    };
    for (const d of invoices) {
      if (d.status === 'Rejected') count.rejected += 1;
      else if (d.status === 'Pending') count.pending += 1;
      else if (d.paymentStatus === 'Paid') count.paid += 1;
      else if (d.paymentStatus === 'Partially Paid') count.partial += 1;
      else count.unpaid += 1;
    }

    return { months, online, offline, cells, top5, count };
  }, [documents, language]);

  const statusSlices: StatusSlice[] = [
    {
      name: tr.stPaid,
      value: charts.count.paid,
      color: THEME.deepForest,
      opacity: 1,
    },
    {
      name: tr.stPartial,
      value: charts.count.partial,
      color: THEME.warmBrass,
      opacity: 1,
    },
    {
      name: tr.stUnpaid,
      value: charts.count.unpaid,
      color: THEME.charcoal,
      opacity: 1,
    },
    {
      name: tr.stPending,
      value: charts.count.pending,
      color: THEME.mutedOlive,
      opacity: 1,
    },
    {
      name: tr.stRejected,
      value: charts.count.rejected,
      color: THEME.mutedOlive,
      opacity: 0.45,
    },
  ];

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={language}
      className="grid grid-cols-1 lg:grid-cols-3 gap-3"
    >
      <ChartCard title={tr.salesPerformance} className="lg:col-span-2">
        <SalesPerformanceChart data={charts.months} tr={tr} />
      </ChartCard>

      <ChartCard title={tr.onlineVsOffline}>
        <ChannelPieChart
          online={charts.online}
          offline={charts.offline}
          tr={tr}
        />
      </ChartCard>

      <ChartCard title={tr.topSelling} className="lg:col-span-2">
        <TopProductsChart data={charts.top5} tr={tr} />
      </ChartCard>

      <ChartCard title={tr.invoiceStatus}>
        <InvoiceStatusDonut slices={statusSlices} tr={tr} />
      </ChartCard>

      <ChartCard title={tr.orderPatterns} className="lg:col-span-3">
        <OrderPatternsHeat
          cells={charts.cells}
          tr={tr}
          language={language}
        />
      </ChartCard>
    </div>
  );
}