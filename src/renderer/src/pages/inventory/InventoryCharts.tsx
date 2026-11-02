/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable prettier/prettier */
/* eslint-disable react-refresh/only-export-components */
import { useEffect, useMemo, useState } from 'react';

// ============================================================
// 🌍 LANGUAGE (only chart labels)
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
  },
  ar: {
    categoryProductDonut: 'الفئة / المنتج',
    top7Products: 'أفضل 7 منتجات مبيعاً',
    inventoryValueByCategory: 'قيمة المخزون حسب الفئة',
    revenueByCategory: 'الإيرادات حسب الفئة',
    revenue: 'الإيراد',
    byCategory: 'حسب الفئة',
    noData: 'لا توجد بيانات بعد',
  },
  ur: {
    categoryProductDonut: 'کیٹیگری / پروڈکٹ',
    top7Products: 'ٹاپ 7 فروخت شدہ مصنوعات',
    inventoryValueByCategory: 'کیٹیگری کے حساب سے انوینٹری ویلیو',
    revenueByCategory: 'کیٹیگری کے حساب سے آمدنی',
    revenue: 'آمدنی',
    byCategory: 'کیٹیگری کے مطابق',
    noData: 'ابھی کوئی ڈیٹا نہیں',
  },
  hi: {
    categoryProductDonut: 'श्रेणी / उत्पाद',
    top7Products: 'टॉप 7 बिकने वाले उत्पाद',
    inventoryValueByCategory: 'श्रेणी के अनुसार इन्वेंट्री मूल्य',
    revenueByCategory: 'श्रेणी के अनुसार राजस्व',
    revenue: 'राजस्व',
    byCategory: 'श्रेणी के अनुसार',
    noData: 'अभी कोई डेटा नहीं',
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
// 🎨 THEME (unchanged)
// ============================================================
const THEME = {
  warmIvory: '#F7F3EA',
  deepForest: '#123C32',
  mutedOlive: '#66745A',
  charcoal: '#252A28',
  warmBrass: '#C49A5A',
};

// ============================================================
// 🔑 STORAGE
// ============================================================
const PRODUCTS_KEY = 'zakhira_inventory_products';
const DOCUMENTS_KEY = 'zakhira_sales_documents';

const readList = <T,>(key: string): T[] => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
};

// ============================================================
// TYPES
// ============================================================
type Product = {
  id: string;
  name?: string;
  sku?: string;
  active?: boolean;
  category?: string;
  price?: number;
  stock?: number;
  quantity?: number;
  onHand?: number;
  reorderLevel?: number;
  reorderThreshold?: number;
  cost?: number;
  purchasePrice?: number;
  unitCost?: number;
};

type SalesDocLine = {
  id: string;
  productId?: string;
  sku?: string;
  material?: string;
  category?: string;
  quantity?: number;
  unitPrice?: number;
  price?: number;
  lineTotal?: number;
};

type SalesDocument = {
  id: string;
  documentType: 'quotation' | 'invoice';
  status: 'Pending' | 'Approved' | 'Rejected';
  lines?: SalesDocLine[];
};

// ============================================================
// HELPERS
// ============================================================
const roundMoney = (n: number): number =>
  Math.round((n + Number.EPSILON) * 100) / 100;

const fmt = (n: number): string => {
  const abs = Math.abs(n);
  return `${n < 0 ? '-' : ''}${abs.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const norm = (s?: string): string => (s || '').trim().toLowerCase();

const getQty = (p: Product): number =>
  Number(p.onHand ?? p.stock ?? p.quantity ?? 0);

const getPrice = (p: Product): number => Number(p.price ?? 0);

const getCost = (p: Product): number => {
  const explicit = Number(p.unitCost ?? p.cost ?? p.purchasePrice ?? 0);
  if (explicit > 0) return explicit;
  const price = getPrice(p);
  return price > 0 ? price * 0.6 : 0;
};

const getCategory = (p: Product): string => {
  const cat = (p.category || '').trim();
  return cat && cat !== 'Uncategorized' ? cat : 'Uncategorized';
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
// 🎭 FALLBACK DATA — only used when real data is empty
// ============================================================
const FALLBACK_DONUT = [
  { name: 'Electronics', value: 7 },
  { name: 'Clothing', value: 10 },
  { name: 'Food & Beverage', value: 20 },
  { name: 'Books & Media', value: 13 },
  { name: 'Home & Garden', value: 50 },
];

const FALLBACK_TOP7 = [
  { name: 'Laptop', qty: 64 },
  { name: 'Mouse', qty: 57 },
  { name: 'Keyboard', qty: 67 },
  { name: 'Monitor', qty: 93 },
  { name: 'Printer', qty: 87 },
  { name: 'Headset', qty: 48 },
  { name: 'Webcam', qty: 35 },
];

const FALLBACK_INV_VALUE = [
  { name: 'Electronics', value: 89 },
  { name: 'Clothing', value: 57 },
  { name: 'Food & Bev.', value: 37 },
  { name: 'Books', value: 28 },
  { name: 'Garden', value: 19 },
];

const FALLBACK_REVENUE = [
  { name: 'Electronics', value: 31 },
  { name: 'Clothing', value: 22 },
  { name: 'Food & Beverage', value: 19 },
  { name: 'Books & Media', value: 15 },
  { name: 'Home & Garden', value: 8 },
  { name: 'Other', value: 5 },
];

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
// 📈 CHART 1: Category Donut — SMALLER
// ============================================================
function CategoryDonut({
  data,
}: {
  data: Array<{ name: string; value: number }>;
}): React.JSX.Element {
  const cx = 100;
  const cy = 100;
  const ro = 88; // was 96 → smaller
  const ri = 60; // was 63 → smaller
  const arcs = buildArcs(data);

  return (
    <svg
      viewBox="0 0 200 200"
      className="w-full max-w-[180px] h-auto mx-auto block" // was 240
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
// 📈 CHART 2: Top 7 Products — SMALLER
// ============================================================
function Top7ProductsChart({
  data,
}: {
  data: Array<{ name: string; qty: number }>;
}): React.JSX.Element {
  const W = 320; // was 340
  const H = 150; // was 170
  const pad = { top: 16, right: 8, bottom: 26, left: 28 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;

  const maxQty = Math.max(...data.map((d) => d.qty), 1);
  const scale = niceScale(maxQty, 4);
  const groupW = iW / data.length;
  const barW = Math.min(groupW * 0.4, 26); // narrower bars

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
// 📈 CHART 3: Inventory Value by Category — SMALLER
// ============================================================
function InventoryValueByCategoryChart({
  data,
}: {
  data: Array<{ name: string; value: number }>;
}): React.JSX.Element {
  const rows = data.slice(0, 6);
  const maxVal = Math.max(...rows.map((d) => d.value), 1);
  const scale = niceScale(maxVal, 4);

  const W = 320; // was 340
  const labelW = 76; // was 84
  const x0 = labelW + 6;
  const cw = 190; // was 200
  const barH = 14; // was 16
  const gap = 8; // was 9
  const top = 6;
  const axisY = top + rows.length * (barH + gap) - gap + 8;
  const H = axisY + 22; // was +24

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
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
// 📈 CHART 4: Revenue by Category — SMALLER (matches left donut)
// ============================================================
function RevenueByCategoryChart({
  data,
  tr,
}: {
  data: Array<{ name: string; value: number }>;
  tr: ChartsT;
}): React.JSX.Element {
  const W = 300; // was 320
  const H = 200; // was 240
  const cx = W / 2;
  const cy = H / 2;
  const ro = 78; // was 92
  const ri = 28; // was 32
  const rMid = (ro + ri) / 2;
  const ringW = ro - ri;
  const CHAR_W = 4.2;
  const arcs = buildArcs(data);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full max-w-[300px] h-auto mx-auto block" // was 320
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
// 🚀 MAIN INDEPENDENT COMPONENT (zero props)
// ============================================================
export default function InventoryCharts(): React.JSX.Element {
  const [language, setLanguage] = useState<Language>(() => getStoredLanguage());
  const tr = T[language] as ChartsT;
  const isRTL = isRTLLang(language);

  const [products, setProducts] = useState<Product[]>(() =>
    readList<Product>(PRODUCTS_KEY)
  );
  const [documents, setDocuments] = useState<SalesDocument[]>(() =>
    readList<SalesDocument>(DOCUMENTS_KEY)
  );

  useEffect(() => {
    const reload = (): void => {
      setProducts(readList<Product>(PRODUCTS_KEY));
      setDocuments(readList<SalesDocument>(DOCUMENTS_KEY));
    };
    const syncLang = (): void => setLanguage(getStoredLanguage());

    window.addEventListener('focus', reload);
    window.addEventListener('storage', reload);
    window.addEventListener('storage', syncLang);
    window.addEventListener('focus', syncLang);
    window.addEventListener(
      'zakhira:inventory-updated',
      reload as EventListener
    );
    window.addEventListener('zakhira:sales-updated', reload as EventListener);

    return () => {
      window.removeEventListener('focus', reload);
      window.removeEventListener('storage', reload);
      window.removeEventListener('storage', syncLang);
      window.removeEventListener('focus', syncLang);
      window.removeEventListener(
        'zakhira:inventory-updated',
        reload as EventListener
      );
      window.removeEventListener(
        'zakhira:sales-updated',
        reload as EventListener
      );
    };
  }, []);

  // ==========================================================
  // Revenue-by-category computation (product lookup by
  // productId → sku → name to resolve missing category)
  // ==========================================================
  const revenueByCategory = useMemo(() => {
    const validInvoices = documents.filter(
      (d) => d.documentType === 'invoice' && d.status === 'Approved'
    );

    const byId = new Map<string, Product>();
    const bySku = new Map<string, Product>();
    const byName = new Map<string, Product>();
    products.forEach((p) => {
      if (p.id) byId.set(String(p.id), p);
      if (p.sku) bySku.set(norm(p.sku), p);
      if (p.name) byName.set(norm(p.name), p);
    });

    const findProduct = (l: SalesDocLine): Product | undefined =>
      (l.productId ? byId.get(String(l.productId)) : undefined) ||
      (l.sku ? bySku.get(norm(l.sku)) : undefined) ||
      (l.material ? byName.get(norm(l.material)) : undefined);

    const categoryRevenueMap = new Map<string, number>();

    for (const d of validInvoices) {
      for (const l of d.lines || []) {
        const prod = findProduct(l);
        const qty = Number(l.quantity || 0);
        const unit = Number(l.unitPrice ?? l.price ?? prod?.price ?? 0);
        const revenue = Number(l.lineTotal || 0) || qty * unit;

        const lineCat = (l.category || '').trim();
        const prodCat = (prod?.category || '').trim();
        const cat =
          (lineCat && lineCat !== 'Uncategorized' ? lineCat : '') ||
          (prodCat && prodCat !== 'Uncategorized' ? prodCat : '') ||
          'Uncategorized';

        categoryRevenueMap.set(
          cat,
          (categoryRevenueMap.get(cat) || 0) + revenue
        );
      }
    }

    return Array.from(categoryRevenueMap.entries())
      .map(([name, value]) => ({ name, value: roundMoney(value) }))
      .sort((a, b) => b.value - a.value);
  }, [documents, products]);

  // ==========================================================
  // Chart data — real first, fallback only if empty
  // ==========================================================
  const chartData = useMemo(() => {
    const active = products.filter((p) => p.active !== false);

    const catValueMap = new Map<string, number>();
    active.forEach((p) => {
      const cat = getCategory(p);
      const qty = getQty(p);
      const cost = getCost(p);
      if (qty > 0 && cost > 0) {
        catValueMap.set(cat, (catValueMap.get(cat) || 0) + qty * cost);
      }
    });

    const realCategoryValues = Array.from(catValueMap.entries())
      .map(([name, value]) => ({ name, value: roundMoney(value) }))
      .sort((a, b) => b.value - a.value);

    const realCategoryClean = realCategoryValues.filter(
      (d) => d.name !== 'Uncategorized' && d.value > 0
    );

    const revenueAll = revenueByCategory.filter((d) => d.value > 0);
    const revenueNamed = revenueAll.filter((d) => d.name !== 'Uncategorized');
    const realRevenue = revenueNamed.length > 0 ? revenueNamed : revenueAll;

    const hasInv = realCategoryClean.length > 0;
    const hasRevenue = realRevenue.length > 0;

    // Top 7 from approved invoice lines
    const productMap = new Map<string, number>();
    const byId = new Map<string, Product>();
    const bySku = new Map<string, Product>();
    const byName = new Map<string, Product>();
    products.forEach((p) => {
      if (p.id) byId.set(String(p.id), p);
      if (p.sku) bySku.set(norm(p.sku), p);
      if (p.name) byName.set(norm(p.name), p);
    });
    const findProduct = (l: SalesDocLine): Product | undefined =>
      (l.productId ? byId.get(String(l.productId)) : undefined) ||
      (l.sku ? bySku.get(norm(l.sku)) : undefined) ||
      (l.material ? byName.get(norm(l.material)) : undefined);

    for (const d of documents.filter(
      (x) => x.documentType === 'invoice' && x.status === 'Approved'
    )) {
      for (const l of d.lines || []) {
        const prod = findProduct(l);
        const name = l.material || prod?.name || 'Unknown';
        const qty = Number(l.quantity || 0);
        productMap.set(name, (productMap.get(name) || 0) + qty);
      }
    }
    const realTop7 = Array.from(productMap.entries())
      .map(([name, qty]) => ({ name, qty }))
      .filter((d) => d.qty > 0)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 7);

    return {
      categoryDonut: hasInv ? realCategoryClean : FALLBACK_DONUT,
      inventoryValueByCategory: hasInv ? realCategoryClean : FALLBACK_INV_VALUE,
      top7: realTop7.length > 0 ? realTop7 : FALLBACK_TOP7,
      revenueByCategory: hasRevenue ? realRevenue : FALLBACK_REVENUE,
    };
  }, [products, documents, revenueByCategory]);

  const noData = chartData.categoryDonut.length === 0;

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
          <CategoryDonut data={chartData.categoryDonut} />
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
          <Top7ProductsChart data={chartData.top7} />
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
            data={chartData.inventoryValueByCategory}
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
            data={chartData.revenueByCategory}
            tr={tr}
          />
        </div>
      </div>
    </div>
  );
}