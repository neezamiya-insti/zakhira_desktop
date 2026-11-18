/* eslint-disable prettier/prettier */
/* eslint-disable react-refresh/only-export-components */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ============================================================
// TYPES
// ============================================================
type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';
type OrderStatus = 'Pending' | 'Received' | 'Cancelled';

type Product = {
  id: string;
  sku: string;
  name: string;
  description: string;
  category?: string; // empty / missing = "Uncategorized"
  price: number;
  stock: number;
  lowStockLevel: number;
  images: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type Vendor = {
  id: string;
  uniqueId: string;
  name: string;
  companyName: string;
  phone: string;
  vatNumber: string;
  address: string;
  city: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type OrderItem = {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type Order = {
  id: string;
  orderNumber: string;
  vendorId: string;
  vendor: {
    uniqueId: string;
    name: string;
    companyName: string;
    phone: string;
    vatNumber: string;
    address: string;
    city: string;
  };
  orderDate: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdBy: string;
  createdAt: string;
};

type StockAdjustment = {
  id: string;
  productId: string;
  change: number;
  previousStock: number;
  newStock: number;
  reason: string;
  adjustedBy: string;
  adjustedAt: string;
};

type SortBy = 'name' | 'price' | 'stock' | 'date' | 'category';

// ============================================================
// SVG ICONS
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
  plus: (
    <svg {...svgBase} strokeWidth={2.5} className="w-4 h-4">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  search: (
    <svg {...svgBase} className="w-4 h-4">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  ),
  x: (
    <svg {...svgBase} strokeWidth={2.5} className="w-3.5 h-3.5">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  check: (
    <svg {...svgBase} strokeWidth={2.5} className="w-3.5 h-3.5">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  eye: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  edit: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
    </svg>
  ),
  trash: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  box: (
    <svg {...svgBase} className="w-5 h-5">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.3 7 12 12l8.7-5M12 22V12" />
    </svg>
  ),
  truck: (
    <svg {...svgBase} className="w-5 h-5">
      <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  clock: (
    <svg {...svgBase} className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  money: (
    <svg {...svgBase} className="w-5 h-5">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ),
  sliders: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
    </svg>
  ),
  archive: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <rect x="2" y="3" width="20" height="5" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M10 12h4" />
    </svg>
  ),
  restore: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  ),
  alert: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
    </svg>
  ),
  chevronLeft: (
    <svg {...svgBase} strokeWidth={2.5} className="w-3.5 h-3.5">
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),
  chevronRight: (
    <svg {...svgBase} strokeWidth={2.5} className="w-3.5 h-3.5">
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  upload: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  ),
  image: (
    <svg {...svgBase} className="w-4 h-4">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  ),
  adjust: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <path d="M12 20V10M18 20V4M6 20v-4" />
    </svg>
  ),
  tag: (
    <svg {...svgBase} className="w-3 h-3 flex-shrink-0">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" />
    </svg>
  ),
};

// ============================================================
// CONSTANTS
// ============================================================
const PRODUCTS_KEY = 'zakhira_inventory_products';
const VENDORS_KEY = 'zakhira_inventory_vendors';
const ORDERS_KEY = 'zakhira_inventory_orders';
const ADJUSTMENTS_KEY = 'zakhira_inventory_stock_adjustments';
const ORDERS_FILTER_HANDOFF = 'zakhira_inventory_orders_filter';

const PAGE_SIZE = 8;
const MAX_IMAGES = 5;
const DEFAULT_LOW_STOCK = 5;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const UNCATEGORIZED = 'Uncategorized';
const MAX_CATEGORY_LENGTH = 40;

// ============================================================
// HELPERS
// ============================================================
const uid = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const roundMoney = (n: number): number =>
  Math.round((n + Number.EPSILON) * 100) / 100;

const formatMoney = (n: number): string =>
  `SAR ${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const formatDate = (iso: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

const isWholeNumber = (s: string): boolean => /^\d+$/.test(s.trim());

const getStockStatus = (
  p: Pick<Product, 'stock' | 'lowStockLevel'>
): StockStatus =>
  p.stock === 0
    ? 'Out of Stock'
    : p.stock <= p.lowStockLevel
    ? 'Low Stock'
    : 'In Stock';

const generateSKU = (existing: Product[]): string => {
  const numbers = existing
    .map((p) => {
      const m = p.sku.match(/SKU-(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter((n) => n > 0);
  const max = numbers.length ? Math.max(...numbers) : 0;
  return `SKU-${String(max + 1).padStart(4, '0')}`;
};

// ---------- category helpers ----------
const hasCategory = (p: Pick<Product, 'category'>): boolean =>
  (p.category ?? '').trim() !== '';

const getCategory = (p: Pick<Product, 'category'>): string =>
  (p.category ?? '').trim() || UNCATEGORIZED;

// Unique, sorted list of the real category names used by products
const categoryNames = (list: Product[]): string[] =>
  Array.from(
    new Set(list.map((p) => (p.category ?? '').trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

// Clean user input; re-use the existing spelling if the same name already exists
const normalizeCategory = (raw: string, existing: string[]): string => {
  const clean = raw.trim().replace(/\s+/g, ' ').slice(0, MAX_CATEGORY_LENGTH);
  if (!clean || clean.toLowerCase() === UNCATEGORIZED.toLowerCase()) return '';
  return existing.find((c) => c.toLowerCase() === clean.toLowerCase()) ?? clean;
};

// Resize + compress image so localStorage doesn't fill up
const processImageFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Not a valid image'));
      img.onload = () => {
        const scale = Math.min(1, 800 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not process image'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.82));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });

const getCurrentUser = (): { id: string; name: string } => {
  try {
    const u = JSON.parse(localStorage.getItem('zakhira_user') || '{}');
    return {
      id: u.id || u._id || u.email || '',
      name: u.name || u.fullName || u.username || u.email || 'User',
    };
  } catch {
    return { id: '', name: 'User' };
  }
};

// ============================================================
// STORAGE
// ============================================================
const loadProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveProducts = (list: Product[]): boolean => {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
};

const loadVendors = (): Vendor[] => {
  try {
    const raw = localStorage.getItem(VENDORS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const loadOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const loadAdjustments = (): StockAdjustment[] => {
  try {
    const raw = localStorage.getItem(ADJUSTMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveAdjustments = (list: StockAdjustment[]): boolean => {
  try {
    localStorage.setItem(ADJUSTMENTS_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
};

// ============================================================
// STYLES
// ============================================================
const labelCls =
  'block text-[10px] font-bold text-dark mb-1.5 uppercase tracking-wider';
const inputCls =
  'w-full h-10 px-4 rounded-full border-2 border-supporting/20 bg-primary/30 text-dark text-sm placeholder:text-supporting/40 focus:outline-none focus:border-secondary focus:bg-white transition-all';
const textareaCls =
  'w-full px-4 py-2.5 rounded-2xl border-2 border-supporting/20 bg-primary/30 text-dark text-sm placeholder:text-supporting/40 focus:outline-none focus:border-secondary focus:bg-white transition-all resize-none';
const thCls =
  'text-[10px] font-bold text-supporting uppercase tracking-wider px-4 py-2.5';
const primaryBtn =
  'h-10 px-5 rounded-full bg-secondary text-primary text-sm font-bold cursor-pointer transition-all duration-300 hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed';
const ghostBtn =
  'h-10 px-5 rounded-full bg-primary text-supporting text-sm font-bold cursor-pointer border-2 border-supporting/20 hover:bg-white hover:text-dark transition-all flex items-center justify-center gap-2';

// ============================================================
// MODAL
// ============================================================
let modalSeq = 0;
const modalStack: number[] = [];

function Modal({
  title,
  subtitle,
  onClose,
  children,
  maxWidth = 'max-w-lg',
  z = 'z-50',
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  z?: 'z-50' | 'z-[60]';
}): React.JSX.Element {
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });
  useEffect(() => {
    const id = ++modalSeq;
    modalStack.push(id);
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && modalStack[modalStack.length - 1] === id) {
        closeRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      const i = modalStack.indexOf(id);
      if (i >= 0) modalStack.splice(i, 1);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 ${z} bg-black/40 flex items-center justify-center p-4`}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`bg-white rounded-3xl w-full ${maxWidth} max-h-[92vh] flex flex-col shadow-xl`}
      >
        <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b border-supporting/10">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-dark">{title}</h2>
            {subtitle && (
              <p className="text-xs text-supporting mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 flex-shrink-0 rounded-full bg-primary text-supporting flex items-center justify-center cursor-pointer hover:bg-red-50 hover:text-red-600 transition"
          >
            {Icons.x}
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ============================================================
// CONFIRM MODAL
// ============================================================
function ConfirmModal({
  title,
  message,
  confirmLabel,
  danger = false,
  reasonLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  reasonLabel?: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}): React.JSX.Element {
  const [reason, setReason] = useState('');
  return (
    <Modal title={title} onClose={onCancel} maxWidth="max-w-sm" z="z-[60]">
      <p className="text-sm text-supporting mb-4">{message}</p>
      {reasonLabel && (
        <div className="mb-4">
          <label className={labelCls}>{reasonLabel}</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className={textareaCls}
          />
        </div>
      )}
      <div className="flex gap-2">
        <button onClick={onCancel} className={`${ghostBtn} flex-1`}>
          Cancel
        </button>
        <button
          onClick={() => onConfirm(reason)}
          className={`flex-1 h-10 rounded-full text-white text-sm font-bold cursor-pointer transition ${
            danger ? 'bg-red-600 hover:bg-red-700' : 'bg-secondary hover:shadow-md'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

// ============================================================
// PAGINATION
// ============================================================
function Pagination({
  page,
  total,
  onPage,
  pageSize = PAGE_SIZE,
}: {
  page: number;
  total: number;
  onPage: (p: number) => void;
  pageSize?: number;
}): React.JSX.Element | null {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-supporting/10">
      <p className="text-xs text-supporting">
        Showing{' '}
        <b className="text-dark">
          {from}–{to}
        </b>{' '}
        of <b className="text-dark">{total}</b>
      </p>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="w-8 h-8 rounded-full bg-primary text-supporting border border-supporting/20 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition"
        >
          {Icons.chevronLeft}
        </button>
        {Array.from({ length: pageCount }, (_, i) => i + 1)
          .filter(
            (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1
          )
          .map((p, idx, arr) => (
            <span key={p} className="flex items-center gap-1.5">
              {idx > 0 && p - arr[idx - 1] > 1 && (
                <span className="text-supporting text-xs">…</span>
              )}
              <button
                onClick={() => onPage(p)}
                className={`min-w-8 h-8 px-2 rounded-full text-xs font-bold cursor-pointer transition ${
                  p === page
                    ? 'bg-secondary text-primary'
                    : 'bg-primary text-supporting hover:bg-white'
                }`}
              >
                {p}
              </button>
            </span>
          ))}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= pageCount}
          className="w-8 h-8 rounded-full bg-primary text-supporting border border-supporting/20 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition"
        >
          {Icons.chevronRight}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// STOCK BADGE
// ============================================================
function StockBadge({ status }: { status: StockStatus }): React.JSX.Element {
  return (
    <span
      className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
        status === 'In Stock'
          ? 'bg-green-100 text-green-700'
          : status === 'Low Stock'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-red-100 text-red-700'
      }`}
    >
      {status}
    </span>
  );
}

// ============================================================
// CATEGORY FIELD (input + suggestions + quick-pick chips)
// ============================================================
function CategoryField({
  id,
  value,
  onChange,
  existing,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  existing: string[];
}): React.JSX.Element {
  return (
    <div>
      <input
        list={id}
        value={value}
        maxLength={MAX_CATEGORY_LENGTH}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Furniture, Electronics..."
        className={inputCls}
      />
      <datalist id={id}>
        {existing.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      {existing.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {existing.map((c) => {
            const active = value.trim().toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                type="button"
                onClick={() => onChange(c)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer border transition ${
                  active
                    ? 'bg-secondary text-primary border-secondary'
                    : 'bg-primary text-supporting border-supporting/20 hover:bg-white hover:text-dark'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      )}
      <p className="text-[10px] text-supporting mt-1.5 px-2">
        Pick an existing category or type a new one. Leave empty for{' '}
        {UNCATEGORIZED}.
      </p>
    </div>
  );
}

// ============================================================
// ADD PRODUCT MODAL
// ============================================================
function AddProductModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (p: Product) => void;
}): React.JSX.Element {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [lowStockLevel, setLowStockLevel] = useState(String(DEFAULT_LOW_STOCK));
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const [nextSKU] = useState(() => generateSKU(loadProducts()));
  const [existingCategories] = useState(() => categoryNames(loadProducts()));

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = e.target.files;
    if (!files) return;
    const remaining = MAX_IMAGES - images.length;
    const toAdd = Array.from(files).slice(0, remaining);
    setUploading(true);
    setError('');
    try {
      const processed: string[] = [];
      for (const f of toAdd) {
        if (!ALLOWED_IMAGE_TYPES.includes(f.type)) {
          setError('Only JPG, PNG, WEBP allowed');
          continue;
        }
        const dataUrl = await processImageFile(f);
        processed.push(dataUrl);
      }
      setImages((prev) => [...prev, ...processed]);
    } catch {
      setError('Could not process image');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (idx: number): void => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const submit = (): void => {
    if (!name.trim()) return setError('Product name is required');
    if (!price || Number(price) <= 0) return setError('Price must be greater than 0');
    if (stock === '' || !isWholeNumber(stock)) return setError('Stock must be a whole number (0 or more)');
    if (images.length === 0) return setError('At least 1 image is required');

    const list = loadProducts();
    const now = new Date().toISOString();
    const newProduct: Product = {
      id: uid('prd'),
      sku: nextSKU,
      name: name.trim(),
      description: description.trim(),
      category: normalizeCategory(category, categoryNames(list)),
      price: roundMoney(Number(price)),
      stock: Number(stock),
      lowStockLevel: Number(lowStockLevel) || DEFAULT_LOW_STOCK,
      images,
      active: true,
      createdAt: now,
      updatedAt: now,
    };
    const ok = saveProducts([newProduct, ...list]);
    if (!ok) return setError('Could not save — storage may be full.');
    onSaved(newProduct);
  };

  return (
    <Modal
      title="Add Product"
      subtitle={`SKU: ${nextSKU} (auto-generated)`}
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Modern Sofa"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <CategoryField
              id="zk-add-category-options"
              value={category}
              onChange={setCategory}
              existing={existingCategories}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Optional description..."
            className={textareaCls}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>
              Price (SAR) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="1250"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>
              Stock <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="10"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Low Stock Alert At</label>
            <input
              type="number"
              min="0"
              step="1"
              value={lowStockLevel}
              onChange={(e) => setLowStockLevel(e.target.value)}
              placeholder="5"
              className={inputCls}
            />
          </div>
        </div>

        {/* Images */}
        <div>
          <label className={labelCls}>
            Images ({images.length}/{MAX_IMAGES}) <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-2xl overflow-hidden border-2 border-supporting/20"
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center cursor-pointer hover:bg-red-600 transition"
                >
                  {Icons.x}
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-1 left-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-secondary text-primary">
                    Thumbnail
                  </span>
                )}
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <label className="aspect-square rounded-2xl border-2 border-dashed border-supporting/30 flex flex-col items-center justify-center cursor-pointer hover:border-secondary hover:bg-primary/30 transition">
                <span className="text-supporting">
                  {uploading ? Icons.clock : Icons.upload}
                </span>
                <span className="text-[9px] text-supporting mt-1 font-bold">
                  {uploading ? 'Processing...' : 'Upload'}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleFiles}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
          </div>
          <p className="text-[10px] text-supporting mt-1.5 px-2">
            JPG, PNG, WEBP • Max {MAX_IMAGES} images • First image = thumbnail
          </p>
        </div>

        {error && (
          <div className="p-2.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            {Icons.alert}
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-supporting/10">
          <button onClick={submit} className={primaryBtn} disabled={uploading}>
            {Icons.check}
            <span>Save Product</span>
          </button>
          <button onClick={onClose} className={ghostBtn}>
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================
// SET CATEGORY MODAL
// ============================================================
function CategoryModal({
  product,
  onClose,
  onSaved,
}: {
  product: Product;
  onClose: () => void;
  onSaved: () => void;
}): React.JSX.Element {
  const [existing] = useState(() => categoryNames(loadProducts()));
  const [value, setValue] = useState((product.category ?? '').trim());
  const [error, setError] = useState('');

  const submit = (): void => {
    const next = normalizeCategory(value, existing);
    const now = new Date().toISOString();
    const updated = loadProducts().map((p) =>
      p.id === product.id ? { ...p, category: next, updatedAt: now } : p
    );
    if (!saveProducts(updated)) {
      setError('Could not save — storage may be full.');
      return;
    }
    onSaved();
  };

  return (
    <Modal
      title="Set Category"
      subtitle={`${product.sku} — ${product.name}`}
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <label className={labelCls}>Category</label>
      <CategoryField
        id="zk-edit-category-options"
        value={value}
        onChange={(v) => {
          setValue(v);
          setError('');
        }}
        existing={existing}
      />

      {error && (
        <div className="mt-4 p-2.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          {Icons.alert}
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-3 pt-5 mt-5 border-t border-supporting/10">
        <button onClick={submit} className={primaryBtn}>
          {Icons.check}
          <span>Save Category</span>
        </button>
        <button onClick={onClose} className={ghostBtn}>
          Cancel
        </button>
      </div>
    </Modal>
  );
}

// ============================================================
// PRODUCT PREVIEW MODAL
// ============================================================
function ProductPreviewModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}): React.JSX.Element {
  const [activeImg, setActiveImg] = useState(0);
  const status = getStockStatus(product);

  return (
    <Modal
      title="Product Preview"
      subtitle={product.sku}
      onClose={onClose}
      maxWidth="max-w-3xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-primary border border-supporting/10 flex items-center justify-center">
            {product.images[activeImg] ? (
              <img
                src={product.images[activeImg]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-supporting/40">{Icons.image}</span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImg(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 cursor-pointer ${
                    activeImg === idx ? 'border-secondary' : 'border-supporting/20'
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-supporting uppercase tracking-wider">
                SKU
              </p>
              <p className="text-sm font-mono font-bold text-dark mt-1">
                {product.sku}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-supporting uppercase tracking-wider">
                Category
              </p>
              <p className="text-sm font-bold text-dark mt-1">
                {getCategory(product)}
              </p>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-supporting uppercase tracking-wider">
              Name
            </p>
            <p className="text-lg font-bold text-dark mt-1">{product.name}</p>
          </div>
          {product.description && (
            <div>
              <p className="text-[10px] font-bold text-supporting uppercase tracking-wider">
                Description
              </p>
              <p className="text-sm text-dark mt-1">{product.description}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-supporting uppercase tracking-wider">
                Price
              </p>
              <p className="text-base font-bold text-secondary mt-1">
                {formatMoney(product.price)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-supporting uppercase tracking-wider">
                Stock
              </p>
              <p
                className={`text-base font-bold mt-1 ${
                  product.stock === 0
                    ? 'text-red-600'
                    : product.stock <= product.lowStockLevel
                    ? 'text-amber-600'
                    : 'text-dark'
                }`}
              >
                {product.stock}
              </p>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-supporting uppercase tracking-wider mb-1.5">
              Status
            </p>
            <StockBadge status={status} />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-supporting/10">
            <div>
              <p className="text-[10px] font-bold text-supporting uppercase tracking-wider">
                Created
              </p>
              <p className="text-xs text-dark mt-1">
                {formatDate(product.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-supporting uppercase tracking-wider">
                Updated
              </p>
              <p className="text-xs text-dark mt-1">
                {formatDate(product.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================
// ADJUST STOCK MODAL
// ============================================================
function AdjustStockModal({
  product,
  onClose,
  onSaved,
}: {
  product: Product;
  onClose: () => void;
  onSaved: () => void;
}): React.JSX.Element {
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const change = isWholeNumber(amount)
    ? (mode === 'add' ? 1 : -1) * Number(amount)
    : 0;
  const newStock = product.stock + change;

  const submit = (): void => {
    if (!amount || !isWholeNumber(amount) || Number(amount) <= 0) {
      setError('Enter a whole number greater than 0');
      return;
    }
    if (!reason.trim()) {
      setError('Reason is required');
      return;
    }
    if (newStock < 0) {
      setError(`Stock cannot go below 0 (current: ${product.stock})`);
      return;
    }

    const list = loadProducts();
    const now = new Date().toISOString();
    const user = getCurrentUser();

    const updated = list.map((p) =>
      p.id === product.id ? { ...p, stock: newStock, updatedAt: now } : p
    );
    if (!saveProducts(updated)) {
      setError('Could not save — storage may be full.');
      return;
    }

    const adj: StockAdjustment = {
      id: uid('adj'),
      productId: product.id,
      change,
      previousStock: product.stock,
      newStock,
      reason: reason.trim(),
      adjustedBy: user.name,
      adjustedAt: now,
    };
    saveAdjustments([adj, ...loadAdjustments()]);
    onSaved();
  };

  return (
    <Modal
      title="Adjust Stock"
      subtitle={`${product.sku} — ${product.name}`}
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <div className="bg-primary/40 rounded-2xl p-4 mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-supporting uppercase tracking-wider">
            Current
          </p>
          <p className="text-2xl font-bold text-dark">{product.stock}</p>
        </div>
        <span className="text-supporting text-2xl">→</span>
        <div className="text-right">
          <p className="text-[10px] font-bold text-supporting uppercase tracking-wider">
            New
          </p>
          <p
            className={`text-2xl font-bold ${
              newStock < 0
                ? 'text-red-600'
                : newStock === 0
                ? 'text-amber-600'
                : 'text-green-600'
            }`}
          >
            {newStock}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className={labelCls}>Adjustment Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode('add')}
              className={`h-10 rounded-full text-sm font-bold cursor-pointer transition ${
                mode === 'add'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-primary text-supporting hover:bg-white'
              }`}
            >
              + Add Stock
            </button>
            <button
              type="button"
              onClick={() => setMode('remove')}
              className={`h-10 rounded-full text-sm font-bold cursor-pointer transition ${
                mode === 'remove'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-primary text-supporting hover:bg-white'
              }`}
            >
              − Remove Stock
            </button>
          </div>
        </div>

        <div>
          <label className={labelCls}>
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 10"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="e.g. Restock from vendor / Damaged goods"
            className={textareaCls}
          />
        </div>

        {error && (
          <div className="p-2.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            {Icons.alert}
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-5 mt-5 border-t border-supporting/10">
        <button onClick={submit} className={primaryBtn}>
          {Icons.check}
          <span>Apply Adjustment</span>
        </button>
        <button onClick={onClose} className={ghostBtn}>
          Cancel
        </button>
      </div>
    </Modal>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function ProductsPage(): React.JSX.Element {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>(() => loadProducts());
  const [orders, setOrders] = useState<Order[]>(() => loadOrders());
  const [vendors] = useState<Vendor[]>(() => loadVendors());

  // UI
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modals
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [categoryProduct, setCategoryProduct] = useState<Product | null>(null);
  const [archiveProduct, setArchiveProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | StockStatus>('All');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);

  const refresh = (): void => {
    setProducts(loadProducts());
    setOrders(loadOrders());
  };

  const showSuccess = (msg: string): void => {
    setSuccessMsg(msg);
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const showError = (msg: string): void => {
    setErrorMsg(msg);
    setSuccessMsg('');
    setTimeout(() => setErrorMsg(''), 3500);
  };

  // ============================================================
  // DERIVED
  // ============================================================
  const activeProducts = products.filter((p) => p.active);
  const outOfStockProducts = activeProducts.filter((p) => p.stock === 0);

  // Purchasing Amount = Pending + Received (excludes Cancelled)
  const totalPurchasingAmount = useMemo(
    () =>
      roundMoney(
        orders
          .filter((o) => o.status !== 'Cancelled')
          .reduce((s, o) => s + o.totalAmount, 0)
      ),
    [orders]
  );
  const pendingOrdersCount = useMemo(
    () => orders.filter((o) => o.status === 'Pending').length,
    [orders]
  );

  // Category options (with counts) for the products in the current view
  const categoryOptions = useMemo(() => {
    const counts = new Map<string, number>();
    products
      .filter((p) => (showArchived ? !p.active : p.active))
      .forEach((p) => {
        const c = getCategory(p);
        counts.set(c, (counts.get(c) ?? 0) + 1);
      });
    const named = Array.from(counts.keys())
      .filter((c) => c !== UNCATEGORIZED)
      .sort((a, b) => a.localeCompare(b));
    const list = counts.has(UNCATEGORIZED) ? [...named, UNCATEGORIZED] : named;
    return list.map((name) => ({ name, count: counts.get(name) ?? 0 }));
  }, [products, showArchived]);

  // If the chosen category no longer exists in this view, fall back to "All"
  const activeCategory = categoryOptions.some((c) => c.name === categoryFilter)
    ? categoryFilter
    : 'All';

  const filtered = useMemo(() => {
    let list = products.filter((p) => (showArchived ? !p.active : p.active));

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          getCategory(p).toLowerCase().includes(q)
      );
    }

    if (activeCategory !== 'All') {
      list = list.filter((p) => getCategory(p) === activeCategory);
    }

    if (statusFilter !== 'All') {
      list = list.filter((p) => getStockStatus(p) === statusFilter);
    }

    const min = priceMin === '' ? -Infinity : Number(priceMin);
    const max = priceMax === '' ? Infinity : Number(priceMax);
    list = list.filter((p) => p.price >= min && p.price <= max);

    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'stock') return a.stock - b.stock;
      if (sortBy === 'category') {
        // A–Z by category, "Uncategorized" last, then by name
        const aHas = hasCategory(a);
        const bHas = hasCategory(b);
        if (aHas !== bHas) return aHas ? -1 : 1;
        return (
          getCategory(a).localeCompare(getCategory(b)) ||
          a.name.localeCompare(b.name)
        );
      }
      return b.createdAt.localeCompare(a.createdAt);
    });

    return list;
  }, [
    products,
    search,
    activeCategory,
    statusFilter,
    priceMin,
    priceMax,
    sortBy,
    showArchived,
  ]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearFilters = (): void => {
    setSearch('');
    setCategoryFilter('All');
    setStatusFilter('All');
    setPriceMin('');
    setPriceMax('');
    setSortBy('date');
    setPage(1);
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    activeCategory !== 'All' ||
    statusFilter !== 'All' ||
    priceMin !== '' ||
    priceMax !== '' ||
    sortBy !== 'date';

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleCreated = (p: Product): void => {
    refresh();
    setShowAddProduct(false);
    showSuccess(`Product created — ${p.sku}`);
  };

  const handleAdjustSaved = (): void => {
    refresh();
    setAdjustProduct(null);
    showSuccess('Stock adjusted');
  };

  const handleCategorySaved = (): void => {
    refresh();
    setCategoryProduct(null);
    showSuccess('Category updated');
  };

  const handleArchiveToggle = (p: Product): void => {
    const now = new Date().toISOString();
    const list = loadProducts().map((x) =>
      x.id === p.id ? { ...x, active: !x.active, updatedAt: now } : x
    );
    if (!saveProducts(list)) {
      showError('Could not update — storage may be full.');
      setArchiveProduct(null);
      return;
    }
    refresh();
    setArchiveProduct(null);
    showSuccess(p.active ? `Archived — ${p.sku}` : `Restored — ${p.sku}`);
  };

  const handleDelete = (p: Product): void => {
    const hasHistory = orders.some((o) =>
      o.items.some((it) => it.productId === p.id)
    );
    if (hasHistory) {
      showError(
        `${p.name} has order history and cannot be deleted. Archive it instead.`
      );
      setDeleteTarget(null);
      return;
    }
    const list = loadProducts().filter((x) => x.id !== p.id);
    if (!saveProducts(list)) {
      showError('Could not delete — storage may be full.');
      setDeleteTarget(null);
      return;
    }
    refresh();
    setDeleteTarget(null);
    showSuccess(`Deleted — ${p.sku}`);
  };

  const handlePendingOrdersClick = (): void => {
    try {
      localStorage.setItem(ORDERS_FILTER_HANDOFF, 'Pending');
    } catch {
      /* ignore */
    }
    navigate('/inventory/orders');
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-primary p-6 lg:p-8">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">Inventory — Products</h1>
        <p className="text-supporting mt-1.5 text-sm">
          Manage products and watch stock levels by tauheed khan
        </p>
      </div>

      {/* BANNERS */}
      {successMsg && (
        <div className="mb-4 px-4 py-3 rounded-full border-2 bg-green-50 border-green-200 text-green-700 text-xs font-bold flex items-center gap-2">
          {Icons.check}
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 px-4 py-3 rounded-full border-2 bg-red-50 border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
          {Icons.alert}
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Products"
          value={String(activeProducts.length)}
          icon={Icons.box}
          color="bg-secondary"
        />
        <StatCard
          label="Total Vendors"
          value={String(vendors.filter((v) => v.active).length)}
          icon={Icons.truck}
          color="bg-accent"
        />
        <StatCard
          label="Purchasing Amount"
          value={formatMoney(totalPurchasingAmount)}
          icon={Icons.money}
          color="bg-blue-600"
          hint="Pending + Received"
        />
        <StatCard
          label="Pending Orders"
          value={String(pendingOrdersCount)}
          icon={Icons.clock}
          color="bg-amber-500"
          onClick={handlePendingOrdersClick}
          hint={pendingOrdersCount > 0 ? 'Click to view' : undefined}
        />
      </div>

      {/* OUT OF STOCK ALERTS */}
      {outOfStockProducts.length > 0 && (
        <div className="bg-red-50 rounded-3xl border-2 border-red-200 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-red-600">{Icons.alert}</span>
            <h2 className="text-sm font-bold text-red-700">
              Out of Stock Alerts ({outOfStockProducts.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {outOfStockProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 bg-white rounded-2xl px-3 py-2 border border-red-200"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-dark truncate">
                    {p.name}
                  </p>
                  <p className="text-[10px] text-supporting font-mono">
                    {p.sku}
                  </p>
                </div>
                <StockBadge status="Out of Stock" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setShowAddProduct(true)}
          className={primaryBtn}
        >
          {Icons.plus}
          <span>Add Product</span>
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-3xl border border-supporting/10 p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-supporting">{Icons.sliders}</span>
          <h3 className="text-xs font-bold text-dark uppercase tracking-wider">
            Filters
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
          {/* Search */}
          <div className="md:col-span-2 xl:col-span-2">
            <label className={labelCls}>Search</label>
            <div className="relative">
              <span className="absolute top-1/2 -translate-y-1/2 left-4 text-supporting pointer-events-none">
                {Icons.search}
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Name, SKU, category, description..."
                className={`${inputCls} pl-11`}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className={labelCls}>Category</label>
            <select
              value={activeCategory}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className={`${inputCls} cursor-pointer`}
            >
              <option value="All">All Categories</option>
              {categoryOptions.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.count})
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className={labelCls}>Stock Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as typeof statusFilter);
                setPage(1);
              }}
              className={`${inputCls} cursor-pointer`}
            >
              <option value="All">All</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          {/* Price range */}
          <div>
            <label className={labelCls}>Price Range (SAR)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={priceMin}
                onChange={(e) => {
                  setPriceMin(e.target.value);
                  setPage(1);
                }}
                placeholder="Min"
                className={inputCls}
              />
              <input
                type="number"
                value={priceMax}
                onChange={(e) => {
                  setPriceMax(e.target.value);
                  setPage(1);
                }}
                placeholder="Max"
                className={inputCls}
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className={labelCls}>Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as SortBy);
                setPage(1);
              }}
              className={`${inputCls} cursor-pointer`}
            >
              <option value="date">Date Added (newest)</option>
              <option value="category">Category (A–Z)</option>
              <option value="name">Name (A–Z)</option>
              <option value="price">Price (low → high)</option>
              <option value="stock">Stock (low → high)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-supporting/10">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => {
                setShowArchived(e.target.checked);
                setPage(1);
              }}
              className="w-4 h-4 rounded cursor-pointer accent-secondary"
            />
            <span className="text-xs font-bold text-dark">
              Show archived products
            </span>
          </label>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-[11px] font-bold text-accent hover:underline cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* PRODUCT LIST */}
      <div className="bg-white rounded-3xl border border-supporting/10 overflow-hidden">
        <div className="px-5 py-3 border-b border-supporting/10 bg-primary/20">
          <h2 className="text-sm font-bold text-dark">
            Products{' '}
            <span className="text-xs font-normal">({filtered.length})</span>
          </h2>
        </div>

        {paginated.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-supporting/10 bg-primary/20">
                    <th className={`text-left ${thCls} w-20`}>Image</th>
                    <th className={`text-left ${thCls} w-28`}>SKU</th>
                    <th className={`text-left ${thCls}`}>Name</th>
                    <th className={`text-left ${thCls} w-40`}>Category</th>
                    <th className={`text-center ${thCls} w-24`}>Stock</th>
                    <th className={`text-right ${thCls} w-28`}>Price</th>
                    <th className={`text-center ${thCls} w-36`}>
                      Manual Stock
                    </th>
                    <th className={`text-center ${thCls} w-36`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((p) => {
                    const status = getStockStatus(p);
                    const isLowOrOut = status !== 'In Stock';
                    return (
                      <tr
                        key={p.id}
                        className={`border-b border-supporting/5 transition ${
                          isLowOrOut ? 'bg-red-50/60' : 'hover:bg-primary/30'
                        }`}
                      >
                        {/* Image */}
                        <td className="px-4 py-3">
                          <div className="w-12 h-12 rounded-2xl bg-primary border border-supporting/10 flex items-center justify-center overflow-hidden">
                            {p.images[0] ? (
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-supporting/40">
                                {Icons.image}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="px-4 py-3 text-xs font-mono font-bold text-dark">
                          {p.sku}
                        </td>

                        {/* Name + description + status badge */}
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-dark truncate max-w-[220px]">
                            {p.name}
                          </p>
                          {p.description && (
                            <p className="text-[10px] text-supporting truncate max-w-[220px] mt-0.5">
                              {p.description}
                            </p>
                          )}
                          {isLowOrOut && (
                            <div className="mt-1">
                              <StockBadge status={status} />
                            </div>
                          )}
                        </td>

                        {/* Category (click to change) */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setCategoryProduct(p)}
                            title="Change category"
                            className={`inline-flex items-center gap-1 max-w-[140px] px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer border transition ${
                              hasCategory(p)
                                ? 'bg-primary text-dark border-supporting/20 hover:bg-secondary hover:text-primary'
                                : 'bg-transparent text-supporting border-dashed border-supporting/40 hover:bg-primary'
                            }`}
                          >
                            {Icons.tag}
                            <span className="truncate">{getCategory(p)}</span>
                          </button>
                        </td>

                        {/* Stock */}
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`text-sm font-bold ${
                              p.stock === 0
                                ? 'text-red-600'
                                : p.stock <= p.lowStockLevel
                                ? 'text-amber-600'
                                : 'text-dark'
                            }`}
                          >
                            {p.stock}
                          </span>
                          <p className="text-[9px] text-supporting mt-0.5">
                            low: {p.lowStockLevel}
                          </p>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3 text-right text-sm font-bold text-dark whitespace-nowrap">
                          {formatMoney(p.price)}
                        </td>

                        {/* Manual adjust */}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setAdjustProduct(p)}
                            className="px-2.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold cursor-pointer hover:bg-blue-500 hover:text-white transition inline-flex items-center gap-1"
                          >
                            {Icons.adjust}
                            <span>Adjust</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setPreviewProduct(p)}
                              title="Preview"
                              className="w-7 h-7 rounded-full bg-primary text-supporting hover:bg-secondary hover:text-primary transition flex items-center justify-center cursor-pointer"
                            >
                              {Icons.eye}
                            </button>
                            <button
                              onClick={() => setArchiveProduct(p)}
                              title={p.active ? 'Archive' : 'Restore'}
                              className={`w-7 h-7 rounded-full transition flex items-center justify-center cursor-pointer ${
                                p.active
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-500 hover:text-white'
                                  : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-500 hover:text-white'
                              }`}
                            >
                              {p.active ? Icons.archive : Icons.restore}
                            </button>
                            <button
                              onClick={() => setDeleteTarget(p)}
                              title="Delete"
                              className="w-7 h-7 rounded-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-500 hover:text-white transition flex items-center justify-center cursor-pointer"
                            >
                              {Icons.trash}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              total={filtered.length}
              onPage={setPage}
            />
          </>
        ) : (
          <div className="py-16 text-center">
            <p className="text-sm text-supporting">No products found</p>
            <button
              onClick={() => setShowAddProduct(true)}
              className="mt-3 text-xs font-bold text-accent hover:underline cursor-pointer"
            >
              Add your first product
            </button>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showAddProduct && (
        <AddProductModal
          onClose={() => setShowAddProduct(false)}
          onSaved={handleCreated}
        />
      )}

      {previewProduct && (
        <ProductPreviewModal
          product={previewProduct}
          onClose={() => setPreviewProduct(null)}
        />
      )}

      {adjustProduct && (
        <AdjustStockModal
          product={adjustProduct}
          onClose={() => setAdjustProduct(null)}
          onSaved={handleAdjustSaved}
        />
      )}

      {categoryProduct && (
        <CategoryModal
          product={categoryProduct}
          onClose={() => setCategoryProduct(null)}
          onSaved={handleCategorySaved}
        />
      )}

      {archiveProduct && (
        <ConfirmModal
          title={archiveProduct.active ? 'Archive Product' : 'Restore Product'}
          message={
            archiveProduct.active
              ? `${archiveProduct.name} will be hidden from the main list. Historical orders remain intact.`
              : `${archiveProduct.name} will be restored to the main list.`
          }
          confirmLabel={archiveProduct.active ? 'Archive' : 'Restore'}
          onConfirm={() => handleArchiveToggle(archiveProduct)}
          onCancel={() => setArchiveProduct(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Product"
          message={`Delete ${deleteTarget.name} (${deleteTarget.sku})? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ============================================================
// STAT CARD (local)
// ============================================================
function StatCard({
  label,
  value,
  icon,
  color,
  onClick,
  hint,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
  hint?: string;
}): React.JSX.Element {
  const inner = (
    <>
      <div
        className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white flex-shrink-0`}
        style={{
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 10px rgba(0,0,0,0.1)',
        }}
      >
        {icon}
      </div>
      <div className="min-w-0 text-left">
        <p className="text-lg font-bold text-dark truncate">{value}</p>
        <p className="text-[10px] text-supporting uppercase tracking-wider font-bold truncate">
          {label}
        </p>
        {hint && (
          <p className="text-[10px] text-secondary font-bold mt-0.5">{hint}</p>
        )}
      </div>
    </>
  );
  const cls =
    'bg-white rounded-3xl p-4 border border-supporting/10 flex items-center gap-3';
  return onClick ? (
    <button
      onClick={onClick}
      className={`${cls} cursor-pointer hover:shadow-md hover:border-secondary/30 transition w-full`}
    >
      {inner}
    </button>
  ) : (
    <div className={cls}>{inner}</div>
  );
}