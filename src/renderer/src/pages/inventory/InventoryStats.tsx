/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable prettier/prettier */
/* eslint-disable react-refresh/only-export-components */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';


// ============================================================
// 🌍 LANGUAGE
// ============================================================
type Language = 'en' | 'ar' | 'ur' | 'hi';

const T = {
  en: {
    totalProducts: 'Total Products',
    topSellingProduct: 'Top-Selling Product',
    inventoryValue: 'Inventory Value',
    totalCategories: 'Total Categories',
    alerts: 'Stock Alerts',
    lowStockAlert: 'Low Stock',
    outOfStockAlert: 'Out of Stock',
    items: 'items',
    products: 'products',
    clickToView: 'Click to view',
    netQty: 'net qty',
  },
  ar: {
    totalProducts: 'إجمالي المنتجات',
    topSellingProduct: 'المنتج الأكثر مبيعاً',
    inventoryValue: 'قيمة المخزون',
    totalCategories: 'إجمالي الفئات',
    alerts: 'تنبيهات المخزون',
    lowStockAlert: 'مخزون منخفض',
    outOfStockAlert: 'نفد المخزون',
    items: 'عنصر',
    products: 'منتجات',
    clickToView: 'اضغط للعرض',
    netQty: 'صافي الكمية',
  },
  ur: {
    totalProducts: 'کل مصنوعات',
    topSellingProduct: 'سب سے زیادہ بکا ہوا پروڈکٹ',
    inventoryValue: 'انوینٹری ویلیو',
    totalCategories: 'کل کیٹیگریز',
    alerts: 'اسٹاک الرٹس',
    lowStockAlert: 'کم اسٹاک',
    outOfStockAlert: 'اسٹاک ختم',
    items: 'اشیاء',
    products: 'مصنوعات',
    clickToView: 'دیکھنے کے لیے دبائیں',
    netQty: 'نیٹ مقدار',
  },
  hi: {
    totalProducts: 'कुल उत्पाद',
    topSellingProduct: 'सर्वाधिक बिकने वाला उत्पाद',
    inventoryValue: 'इन्वेंट्री मूल्य',
    totalCategories: 'कुल श्रेणियाँ',
    alerts: 'स्टॉक अलर्ट',
    lowStockAlert: 'कम स्टॉक',
    outOfStockAlert: 'स्टॉक से बाहर',
    items: 'आइटम',
    products: 'उत्पाद',
    clickToView: 'देखने के लिए क्लिक करें',
    netQty: 'नेट मात्रा',
  },
} as const;

type StatsT = typeof T['en'];

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
// 🎨 THEME
// ============================================================
const THEME = {
  warmIvory: '#F7F3EA',
  deepForest: '#123C32',
  mutedOlive: '#66745A',
  charcoal: '#252A28',
  warmBrass: '#C49A5A',
};

const CARD_STYLE: React.CSSProperties = {
  background: '#FFFFFF',
  border: `1px solid ${THEME.mutedOlive}30`,
  borderRadius: 16,
  padding: 12,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
};

const SHADOW = '0 4px 12px rgba(37,42,40,0.15)';

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

const getThreshold = (p: Product): number =>
  Number(p.reorderThreshold ?? p.reorderLevel ?? 5);

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
  box: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.3 7 12 12l8.7-5M12 22V12" />
    </svg>
  ),
  trending: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M3 17l6-6 4 4 8-8M14 7h7v7" />
    </svg>
  ),
  money: (
    <svg {...svgBase} className="w-4 h-4">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ),
  layers: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  alert: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
    </svg>
  ),
  xCircle: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6M9 9l6 6" />
    </svg>
  ),
};

// ============================================================
// 🧱 STAT CARD
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
    <div style={CARD_STYLE}>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: color, color: THEME.warmIvory, boxShadow: SHADOW }}
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
// 🚀 MAIN COMPONENT
// ============================================================
export default function InventoryStats(): React.JSX.Element {
  const navigate = useNavigate();

  const [language, setLanguage] = useState<Language>(() => getStoredLanguage());
  const tr = T[language] as StatsT;
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
  // 📊 CARDS
  // ==========================================================
  const stats = useMemo(() => {
    const active = products.filter((p) => p.active !== false);

    const totalProducts = active.length;

    const inventoryValue = active.reduce((s, p) => {
      const q = getQty(p);
      const c = getCost(p);
      return q > 0 && c > 0 ? s + q * c : s;
    }, 0);

    const categorySet = new Set<string>();
    active.forEach((p) => {
      const cat = (p.category || '').trim();
      if (cat && cat !== 'Uncategorized') categorySet.add(cat);
    });
    const totalCategories = categorySet.size;

    return {
      totalProducts,
      inventoryValue: roundMoney(inventoryValue),
      totalCategories,
    };
  }, [products]);

  // ==========================================================
  // 📊 TOP-SELLING PRODUCT
  // ==========================================================
  const topSelling = useMemo(() => {
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

    const productMap = new Map<string, number>();
    for (const d of validInvoices) {
      for (const l of d.lines || []) {
        const prod = findProduct(l);
        const name = l.material || prod?.name || 'Unknown';
        const qty = Number(l.quantity || 0);
        productMap.set(name, (productMap.get(name) || 0) + qty);
      }
    }

    let best: { name: string; qty: number } | null = null;
    productMap.forEach((qty, name) => {
      if (!best || qty > best.qty) best = { name, qty };
    });
    return best as { name: string; qty: number } | null;
  }, [documents, products]);

  // ==========================================================
  // 📊 ALERTS
  // ==========================================================
  const alerts = useMemo(() => {
    const active = products.filter((p) => p.active !== false);

    const lowStock = active.filter((p) => {
      const q = getQty(p);
      const t = getThreshold(p);
      return q > 0 && q <= t;
    });

    const outOfStock = active.filter((p) => getQty(p) <= 0);

    return { lowStock, outOfStock };
  }, [products]);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-3">
      {/* 4 CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label={tr.totalProducts}
          value={String(stats.totalProducts)}
          icon={Icons.box}
          color={THEME.deepForest}
        />
        <StatCard
          label={tr.topSellingProduct}
          value={
            topSelling
              ? topSelling.name.length > 16
                ? `${topSelling.name.slice(0, 14)}…`
                : topSelling.name
              : '—'
          }
          icon={Icons.trending}
          color={THEME.warmBrass}
          hint={topSelling ? `${topSelling.qty} ${tr.netQty}` : undefined}
        />
        <StatCard
          label={tr.inventoryValue}
          value={fmt(stats.inventoryValue)}
          icon={Icons.money}
          color={THEME.mutedOlive}
        />
        <StatCard
          label={tr.totalCategories}
          value={String(stats.totalCategories)}
          icon={Icons.layers}
          color={THEME.charcoal}
        />
      </div>

      {/* 2 ALERTS */}
      <div
        className="rounded-2xl p-3"
        style={{
          background: '#FFFFFF',
          border: `1px solid ${THEME.mutedOlive}30`,
        }}
      >
        <h3
          className="text-[10px] font-bold uppercase tracking-wider mb-2"
          style={{ color: THEME.deepForest }}
        >
          {tr.alerts}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={() => navigate('/inventory')}
            className="flex items-center gap-2 p-2 rounded-lg text-start cursor-pointer transition hover:brightness-95"
            style={{
              background: 'rgba(196,154,90,0.12)',
              border: `1px solid ${THEME.warmBrass}40`,
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: THEME.warmBrass, color: '#FFFFFF' }}
            >
              {Icons.alert}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-[10px] font-bold truncate"
                style={{ color: THEME.warmBrass }}
              >
                {tr.lowStockAlert}
              </p>
              <p
                className="text-[13px] font-bold"
                style={{ color: THEME.charcoal }}
              >
                {alerts.lowStock.length} {tr.items}
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/inventory')}
            className="flex items-center gap-2 p-2 rounded-lg text-start cursor-pointer transition hover:brightness-95"
            style={{
              background: 'rgba(37,42,40,0.08)',
              border: `1px solid ${THEME.charcoal}30`,
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: THEME.charcoal, color: '#FFFFFF' }}
            >
              {Icons.xCircle}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-[10px] font-bold truncate"
                style={{ color: THEME.charcoal }}
              >
                {tr.outOfStockAlert}
              </p>
              <p
                className="text-[13px] font-bold"
                style={{ color: THEME.charcoal }}
              >
                {alerts.outOfStock.length} {tr.products}
              </p>
            </div>
          </button>
        </div>
      </div>

   
   
    </div>
  );
}