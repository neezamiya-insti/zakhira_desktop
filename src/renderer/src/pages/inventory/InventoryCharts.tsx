/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable prettier/prettier */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import {
  inventoryChartsService,
  type InventoryChartData,
} from '@renderer/services/inventoryChartsService';
import { THEME } from '@renderer/theme/theme';

// ============================================================
// 🌍 LANGUAGE
// ============================================================
type Language = 'en' | 'ar' | 'ur' | 'hi';

const T = {
  en: {
    categoryProductDonut: 'Category / Product',
    top7Products: 'Top 7 Products Sold',
    inventoryValueByCategory: 'Inventory Value by Category',
    revenueByCategory: 'Revenue by Category',
    revenue: 'Revenue',
    byCategory: 'by Category',
    noData: 'No data yet',
    loading: 'Loading charts...',
  },
  ar: {
    categoryProductDonut: 'الفئة / المنتج',
    top7Products: 'أفضل 7 منتجات مبيعاً',
    inventoryValueByCategory: 'قيمة المخزون حسب الفئة',
    revenueByCategory: 'الإيرادات حسب الفئة',
    revenue: 'الإيراد',
    byCategory: 'حسب الفئة',
    noData: 'لا توجد بيانات بعد',
    loading: 'جارٍ تحميل الرسوم...',
  },
  ur: {
    categoryProductDonut: 'کیٹیگری / پروڈکٹ',
    top7Products: 'ٹاپ 7 فروخت شدہ مصنوعات',
    inventoryValueByCategory: 'کیٹیگری کے حساب سے انوینٹری ویلیو',
    revenueByCategory: 'کیٹیگری کے حساب سے آمدنی',
    revenue: 'آمدنی',
    byCategory: 'کیٹیگری کے مطابق',
    noData: 'ابھی کوئی ڈیٹا نہیں',
    loading: 'چارٹس لوڈ ہو رہے ہیں...',
  },
  hi: {
    categoryProductDonut: 'श्रेणी / उत्पाद',
    top7Products: 'टॉप 7 बिकने वाले उत्पाद',
    inventoryValueByCategory: 'श्रेणी के अनुसार इन्वेंट्री मूल्य',
    revenueByCategory: 'श्रेणी के अनुसार राजस्व',
    revenue: 'राजस्व',
    byCategory: 'श्रेणी के अनुसार',
    noData: 'अभी कोई डेटा नहीं',
    loading: 'चार्ट लोड हो रहे हैं...',
  },
} as const;

type ChartsT = typeof T['en'];

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

// ============================================================
// HELPERS
// ============================================================
const fmt = (n: number): string => {
  const abs = Math.abs(n);
  return `${n < 0 ? '-' : ''}${abs.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const short = (s: string, n: number): string =>
  s.length > n ? `${s.slice(0, Math.max(n - 1, 1))}…` : s;

const niceScale = (max: number, ticks = 4): { step: number; max: number } => {
  const safe = Math.max(max, 1);
  const raw = safe / ticks;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / mag;
  const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  const step = m * mag;
  return { step, max: step * ticks };
};

// ============================================================
// 🍩 RING HELPERS
// ============================================================
type SliceStyle = { fill: string; opacity: number; text: string };

const SLICE_STYLES: SliceStyle[] = [
  { fill: THEME.deepForest, opacity: 1, text: '#FFFFFF' },
  { fill: THEME.warmBrass, opacity: 1, text: '#FFFFFF' },
  { fill: THEME.mutedOlive, opacity: 1, text: '#FFFFFF' },
  { fill: THEME.charcoal, opacity: 1, text: '#FFFFFF' },
  { fill: THEME.mutedOlive, opacity: 0.3, text: THEME.charcoal },
  { fill: THEME.warmBrass, opacity: 0.35, text: THEME.charcoal },
];

const sliceStyleAt = (i: number, n: number): SliceStyle => {
  let idx = i % SLICE_STYLES.length;
  if (i === n - 1 && n > 1 && idx === 0) idx = 2;
  return SLICE_STYLES[idx];
};

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
};

const ringPath = (
  cx: number,
  cy: number,
  ro: number,
  ri: number,
  start: number,
  end: number
): string => {
  const safeEnd = Math.min(end, start + 359.99);
  const o0 = polar(cx, cy, ro, start);
  const o1 = polar(cx, cy, ro, safeEnd);
  const i0 = polar(cx, cy, ri, start);
  const i1 = polar(cx, cy, ri, safeEnd);
  const large = safeEnd - start > 180 ? 1 : 0;
  return [
    `M ${o0.x} ${o0.y}`,
    `A ${ro} ${ro} 0 ${large} 1 ${o1.x} ${o1.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${ri} ${ri} 0 ${large} 0 ${i0.x} ${i0.y}`,
    'Z',
  ].join(' ');
};

type Arc = {
  name: string;
  value: number;
  pct: number;
  start: number;
  end: number;
  mid: number;
  style: SliceStyle;
};

const buildArcs = (data: Array<{ name: string; value: number }>): Arc[] => {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let angle = -90;
  return data.map((d, i) => {
    const span = (d.value / total) * 360;
    const start = angle;
    const end = angle + span;
    angle = end;
    return {
      ...d,
      pct: (d.value / total) * 100,
      start,
      end,
      mid: start + span / 2,
      style: sliceStyleAt(i, data.length),
    };
  });
};

// ============================================================
// 📈 CHART 1: Category Donut
// ============================================================
function CategoryDonut({
  data,
}: {
  data: Array<{ name: string; value: number }>;
}): React.JSX.Element {
  const cx = 100;
  const cy = 100;
  const ro = 88;
  const ri = 60;
  const arcs = buildArcs(data);

  return (
    <svg
      viewBox="0 0 200 200"
      className="w-full max-w-[180px] h-auto mx-auto block"
    >
      {arcs.map((a) => {
        const p = polar(cx, cy, (ro + ri) / 2, a.mid);
        return (
          <g key={a.name}>
            <path
              d={ringPath(cx, cy, ro, ri, a.start, a.end)}
              fill={a.style.fill}
              opacity={a.style.opacity}
              stroke="#FFFFFF"
              strokeWidth={1}
              strokeLinejoin="round"
            >
              <title>{`${a.name}: ${a.pct.toFixed(0)}%`}</title>
            </path>
            {a.pct >= 4 && (
              <text
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="9"
                fontWeight="600"
                fill={a.style.text}
                style={{ pointerEvents: 'none' }}
              >
                {Math.round(a.pct)}%
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ============================================================
// 📈 CHART 2: Top 7 Products
// ============================================================
function Top7ProductsChart({
  data,
}: {
  data: Array<{ name: string; qty: number }>;
}): React.JSX.Element {
  const W = 320;
  const H = 150;
  const pad = { top: 16, right: 8, bottom: 26, left: 28 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;

  const maxQty = Math.max(...data.map((d) => d.qty), 1);
  const scale = niceScale(maxQty, 4);
  const groupW = iW / data.length;
  const barW = Math.min(groupW * 0.4, 26);

  const tierColor = (q: number): string => {
    const r = q / maxQty;
    if (r >= 0.8) return THEME.deepForest;
    if (r >= 0.6) return THEME.warmBrass;
    return THEME.charcoal;
  };

  const ticks = [0, 1, 2, 3, 4].map((i) => i * scale.step);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto block"
      preserveAspectRatio="xMidYMid meet"
    >
      {ticks.map((t) => {
        const y = pad.top + iH - (t / scale.max) * iH;
        return (
          <g key={t}>
            <line
              x1={pad.left}
              x2={W - pad.right}
              y1={y}
              y2={y}
              stroke={THEME.mutedOlive}
              strokeOpacity={t === 0 ? 0.5 : 0.18}
              strokeWidth={0.8}
            />
            <text
              x={pad.left - 4}
              y={y}
              textAnchor="end"
              dominantBaseline="central"
              fontSize="7"
              fill={THEME.charcoal}
            >
              {fmt(t)}
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const xc = pad.left + groupW * i + groupW / 2;
        const h = (d.qty / scale.max) * iH;
        return (
          <g key={`${d.name}-${i}`}>
            <rect
              x={xc - barW / 2}
              y={pad.top + iH - h}
              width={barW}
              height={h}
              fill={tierColor(d.qty)}
            >
              <title>{`${d.name}: ${fmt(d.qty)}`}</title>
            </rect>
            <text
              x={xc}
              y={pad.top + iH - h - 3}
              textAnchor="middle"
              fontSize="7.5"
              fontWeight="700"
              fill={THEME.charcoal}
            >
              {fmt(d.qty)}
            </text>
            <text
              x={xc}
              y={pad.top + iH + 12}
              textAnchor="middle"
              fontSize="7"
              fill={THEME.charcoal}
            >
              {short(d.name, 9)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ============================================================
// 📈 CHART 3: Inventory Value by Category
// ============================================================
function InventoryValueByCategoryChart({
  data,
}: {
  data: Array<{ name: string; value: number }>;
}): React.JSX.Element {
  const rows = data.slice(0, 6);
  const maxVal = Math.max(...rows.map((d) => d.value), 1);
  const scale = niceScale(maxVal, 4);

  const W = 320;
  const labelW = 76;
  const x0 = labelW + 6;
  const cw = 190;
  const barH = 14;
  const gap = 8;
  const top = 6;
  const axisY = top + rows.length * (barH + gap) - gap + 8;
  const H = axisY + 22;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto block"
      style={{ direction: 'ltr' }}
    >
      {rows.map((d, i) => {
        const y = top + i * (barH + gap);
        const w = Math.max((d.value / scale.max) * cw, 2);
        return (
          <g key={d.name}>
            <text
              x={labelW}
              y={y + barH / 2}
              textAnchor="end"
              dominantBaseline="central"
              fontSize="8.5"
              fill={THEME.charcoal}
            >
              {short(d.name, 13)}
            </text>
            <rect
              x={x0}
              y={y}
              width={w}
              height={barH}
              fill={THEME.deepForest}
            >
              <title>{`${d.name}: ${fmt(d.value)}`}</title>
            </rect>
            <text
              x={x0 + w + 5}
              y={y + barH / 2}
              dominantBaseline="central"
              fontSize="8.5"
              fontWeight="700"
              fill={THEME.deepForest}
            >
              {fmt(d.value)}
            </text>
          </g>
        );
      })}

      <line
        x1={x0}
        x2={x0 + cw}
        y1={axisY}
        y2={axisY}
        stroke={THEME.mutedOlive}
        strokeOpacity={0.5}
        strokeWidth={0.8}
      />
      {[0, 1, 2, 3, 4].map((i) => {
        const x = x0 + (i * cw) / 4;
        return (
          <line
            key={i}
            x1={x}
            x2={x}
            y1={axisY}
            y2={axisY + 3}
            stroke={THEME.mutedOlive}
            strokeOpacity={0.5}
            strokeWidth={0.8}
          />
        );
      })}
      <text
        x={x0}
        y={axisY + 13}
        textAnchor="middle"
        fontSize="8"
        fill={THEME.charcoal}
      >
        0
      </text>
      <text
        x={x0 + cw}
        y={axisY + 13}
        textAnchor="middle"
        fontSize="8"
        fill={THEME.charcoal}
      >
        {fmt(scale.max)}
      </text>
    </svg>
  );
}

// ============================================================
// 📈 CHART 4: Revenue by Category
// ============================================================
function RevenueByCategoryChart({
  data,
  tr,
}: {
  data: Array<{ name: string; value: number }>;
  tr: ChartsT;
}): React.JSX.Element {
  const W = 300;
  const H = 200;
  const cx = W / 2;
  const cy = H / 2;
  const ro = 78;
  const ri = 28;
  const rMid = (ro + ri) / 2;
  const ringW = ro - ri;
  const CHAR_W = 4.2;
  const arcs = buildArcs(data);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full max-w-[300px] h-auto mx-auto block"
    >
      {arcs.map((a) => {
        const arcLen = (2 * Math.PI * rMid * a.pct) / 100;
        const usable = Math.min(ringW * 0.82, arcLen * 0.88);
        const maxChars = Math.floor(usable / CHAR_W);
        const inside = maxChars >= 6;

        const pIn = polar(cx, cy, rMid, a.mid);
        const pOut = polar(cx, cy, ro + 8, a.mid);
        const rightSide = Math.cos((a.mid * Math.PI) / 180) >= 0;

        return (
          <g key={a.name}>
            <path
              d={ringPath(cx, cy, ro, ri, a.start, a.end)}
              fill={a.style.fill}
              opacity={a.style.opacity}
              stroke="#FFFFFF"
              strokeWidth={2}
              strokeLinejoin="round"
            >
              <title>{`${a.name}: ${a.pct.toFixed(0)}%`}</title>
            </path>

            {inside ? (
              <text
                x={pIn.x}
                y={pIn.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="7.5"
                fill={a.style.text}
                style={{ pointerEvents: 'none' }}
              >
                <tspan x={pIn.x} dy="-0.6em">
                  {short(a.name, maxChars)}
                </tspan>
                <tspan x={pIn.x} dy="1.3em" fontWeight="600">
                  {Math.round(a.pct)}%
                </tspan>
              </text>
            ) : (
              <text
                x={pOut.x}
                y={pOut.y}
                textAnchor={rightSide ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize="7.5"
                fill={THEME.charcoal}
                style={{ pointerEvents: 'none' }}
              >
                <tspan x={pOut.x} dy="-0.6em">
                  {short(a.name, 14)}
                </tspan>
                <tspan x={pOut.x} dy="1.3em" fontWeight="600">
                  {Math.round(a.pct)}%
                </tspan>
              </text>
            )}
          </g>
        );
      })}

      <text
        x={cx}
        y={cy - 3}
        textAnchor="middle"
        fontSize="8.5"
        fontWeight="700"
        fill={THEME.charcoal}
      >
        {short(tr.revenue, 10)}
      </text>
      <text
        x={cx}
        y={cy + 8}
        textAnchor="middle"
        fontSize="7"
        fill={THEME.charcoal}
      >
        {short(tr.byCategory, 12)}
      </text>
    </svg>
  );
}

// ============================================================
// 🚀 MAIN COMPONENT (Connected to Backend)
// ============================================================
export default function InventoryCharts(): React.JSX.Element {
  const [language, setLanguage] = useState<Language>(() => getStoredLanguage());
  const [data, setData] = useState<InventoryChartData>(
    () =>
      inventoryChartsService.getCachedChartData() || {
        categoryDonut: [],
        top7Products: [],
        inventoryValueByCategory: [],
        revenueByCategory: [],
      }
  );
  const [loading, setLoading] = useState(
    () => inventoryChartsService.getCachedChartData() === null
  );
  const tr = T[language] as ChartsT;
  const isRTL = isRTLLang(language);

  // Sync language changes
  useEffect(() => {
    const syncLang = () => setLanguage(getStoredLanguage());
    window.addEventListener('storage', syncLang);
    window.addEventListener('focus', syncLang);
    return () => {
      window.removeEventListener('storage', syncLang);
      window.removeEventListener('focus', syncLang);
    };
  }, []);

  // Load local SQLite data first. A remote refresh follows without blocking it.
  const fetchCharts = async (syncOnline = false): Promise<void> => {
    try {
      const result = await inventoryChartsService.getChartData();
      setData(result);
    } catch (error) {
      console.error('Failed to load local inventory charts:', error);
    } finally {
      setLoading(false);
    }

    if (syncOnline && navigator.onLine) {
      try {
        const result = await inventoryChartsService.syncChartData();
        setData(result);
      } catch (error) {
        console.error('Failed to sync inventory charts:', error);
      }
    }
  };

  useEffect(() => {
    void fetchCharts(true);
  }, []);

  // Local writes and background pulls should update charts without waiting on the network.
  useEffect(() => {
    const reloadLocal = (): void => {
      void fetchCharts();
    };
    const syncOnline = (): void => {
      void fetchCharts(true);
    };
    window.addEventListener('zakhira:inventory-updated', reloadLocal);
    window.addEventListener('zakhira:sales-updated', reloadLocal);
    window.addEventListener('zakhira:products-synced', reloadLocal);
    window.addEventListener('zakhira:records-synced', reloadLocal);
    window.addEventListener('online', syncOnline);
    window.addEventListener('focus', syncOnline);
    return () => {
      window.removeEventListener('zakhira:inventory-updated', reloadLocal);
      window.removeEventListener('zakhira:sales-updated', reloadLocal);
      window.removeEventListener('zakhira:products-synced', reloadLocal);
      window.removeEventListener('zakhira:records-synced', reloadLocal);
      window.removeEventListener('online', syncOnline);
      window.removeEventListener('focus', syncOnline);
    };
  }, []);

  const noData =
    data.categoryDonut.length === 0 &&
    data.top7Products.length === 0 &&
    data.inventoryValueByCategory.length === 0 &&
    data.revenueByCategory.length === 0;

  // ============================================================
  // ✅ LOADING STATE (Blank ke bajaye spinner)
  // ============================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-4 animate-spin"
            style={{
              borderColor: `${THEME.mutedOlive}30`,
              borderTopColor: THEME.warmBrass,
            }}
          />
          <p className="text-[12px]" style={{ color: THEME.mutedOlive }}>
            {tr.loading}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-3">
      {noData && (
        <p
          className="text-[11px] italic text-center"
          style={{ color: THEME.mutedOlive }}
        >
          {tr.noData}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div
          className="rounded-2xl p-3 min-w-0"
          style={{
            background: '#FFFFFF',
            border: `1px solid ${THEME.mutedOlive}30`,
          }}
        >
          <h3
            className="text-[10px] font-bold uppercase tracking-wider mb-2"
            style={{ color: THEME.deepForest }}
          >
            {tr.categoryProductDonut}
          </h3>
          <CategoryDonut data={data.categoryDonut} />
        </div>

        <div
          className="rounded-2xl p-3 min-w-0"
          style={{
            background: '#FFFFFF',
            border: `1px solid ${THEME.mutedOlive}30`,
          }}
        >
          <h3
            className="text-[10px] font-bold uppercase tracking-wider mb-2"
            style={{ color: THEME.deepForest }}
          >
            {tr.top7Products}
          </h3>
          <Top7ProductsChart data={data.top7Products} />
        </div>

        <div
          className="rounded-2xl p-3 min-w-0"
          style={{
            background: '#FFFFFF',
            border: `1px solid ${THEME.mutedOlive}30`,
          }}
        >
          <h3
            className="text-[10px] font-bold uppercase tracking-wider mb-2"
            style={{ color: THEME.deepForest }}
          >
            {tr.inventoryValueByCategory}
          </h3>
          <InventoryValueByCategoryChart
            data={data.inventoryValueByCategory}
          />
        </div>

        <div
          className="rounded-2xl p-3 min-w-0"
          style={{
            background: '#FFFFFF',
            border: `1px solid ${THEME.mutedOlive}30`,
          }}
        >
          <h3
            className="text-[10px] font-bold uppercase tracking-wider mb-2"
            style={{ color: THEME.deepForest }}
          >
            {tr.revenueByCategory}
          </h3>
          <RevenueByCategoryChart
            data={data.revenueByCategory}
            tr={tr}
          />
        </div>
      </div>
    </div>
  );
}