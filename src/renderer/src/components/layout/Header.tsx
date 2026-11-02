/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadUnits } from '@renderer/pages/settings/SettingsPage'; // ← adjust path if needed

// ============================================================
// 🎨 FINAL THEME
// ============================================================
const THEME = {
  warmIvory: '#F7F3EA',
  deepForest: '#123C32',
  mutedOlive: '#66745A',
  charcoal: '#252A28',
  warmBrass: '#C49A5A',
};

// ============================================================
// STORAGE
// ============================================================
const PRODUCTS_KEY = 'zakhira_inventory_products';
const FALLBACK_UNIT = 'piece';

// ✅ Product list: 6 rows visible by default, scroll if more
const LIST_ROW_HEIGHT = 36;
const LIST_VISIBLE_ROWS = 6;

type Product = {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  lowStockLevel: number;
  images: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
  unit?: string;
};

const loadProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((p: Partial<Product>) => ({
      ...p,
      unit: (p.unit as string) || FALLBACK_UNIT,
    })) as Product[];
  } catch {
    return [];
  }
};

const unitLabel = (unitName?: string): string => {
  const name = unitName || FALLBACK_UNIT;
  try {
    const units = loadUnits();
    const found = units.find((u) => u.name === name);
    return found ? found.label : name;
  } catch {
    return name;
  }
};

const formatMoney = (n: number): string =>
  `SAR ${n.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (iso: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return `${String(d.getDate()).padStart(2, '0')}/${String(
    d.getMonth() + 1
  ).padStart(2, '0')}/${d.getFullYear()}`;
};

const getStockStatus = (p: Pick<Product, 'stock' | 'lowStockLevel'>) =>
  p.stock === 0
    ? 'out'
    : p.stock <= p.lowStockLevel
      ? 'low'
      : 'in';

// ============================================================
// ICONS (Compact)
// ============================================================
const IconSearch = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const IconChevron = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const IconX = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

const IconImage = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
  </svg>
);

// ============================================================
// PRODUCT DETAIL MODAL
// ============================================================
type ProductDetailModalProps = {
  onClose: () => void;
  language: 'en' | 'ar' | 'ur' | 'hi';
  isRTL: boolean;
};
function ProductDetailModal({
  onClose,
  language,
  isRTL,
}: ProductDetailModalProps): React.JSX.Element {
  const [allProducts] = useState<Product[]>(() => loadProducts());
  const [selectedId, setSelectedId] = useState<string>('');
  const [query, setQuery] = useState('');
  // ✅ Open by default so the first 6 products show as soon as the modal opens
  const [dropdownOpen, setDropdownOpen] = useState(true);
  const [highlightedIdx, setHighlightedIdx] = useState(0);
  const [activeImg, setActiveImg] = useState(0);

  // ✅ Reset highlight DURING render when query changes
  const [prevQuery, setPrevQuery] = useState(query);
  if (prevQuery !== query) {
    setPrevQuery(query);
    setHighlightedIdx(0);
  }

  // ✅ Reset active image DURING render when selectedId changes
  const [prevSelectedId, setPrevSelectedId] = useState(selectedId);
  if (prevSelectedId !== selectedId) {
    setPrevSelectedId(selectedId);
    setActiveImg(0);
  }

  const searchRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = allProducts.find((p) => p.id === selectedId) || null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allProducts;
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
    );
  }, [allProducts, query]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (dropdownOpen) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [dropdownOpen]);

  // Keep highlighted row visible while using arrow keys
  useEffect(() => {
    if (!dropdownOpen || !listRef.current) return;
    const el = listRef.current;
    const top = highlightedIdx * LIST_ROW_HEIGHT;
    const bottom = top + LIST_ROW_HEIGHT;
    if (top < el.scrollTop) el.scrollTop = top;
    else if (bottom > el.scrollTop + el.clientHeight)
      el.scrollTop = bottom - el.clientHeight;
  }, [highlightedIdx, dropdownOpen]);

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent): void => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSelect = (id: string): void => {
    setSelectedId(id);
    setDropdownOpen(false);
    setQuery('');
  };

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const pick = filtered[highlightedIdx];
      if (pick) handleSelect(pick.id);
    } else if (e.key === 'Escape') {
      setDropdownOpen(false);
    }
  };

  // Labels
  const L =
    language === 'ur'
      ? {
          title: 'پروڈکٹ کی تفصیل',
          selectProduct: 'پروڈکٹ منتخب کریں',
          searchPh: 'نام یا SKU سے تلاش کریں...',
          noResults: 'کوئی مصنوعات نہیں ملی',
          selectHint: 'تفصیل دیکھنے کے لیے پروڈکٹ منتخب کریں',
          close: 'بند کریں',
          sku: 'SKU',
          name: 'نام',
          desc: 'تفصیل',
          price: 'قیمت',
          stock: 'اسٹاک',
          unit: 'یونٹ',
          lowAt: 'کم اسٹاک الرٹ',
          status: 'حالت',
          created: 'بنایا گیا',
          updated: 'اپ ڈیٹ ہوا',
          inStock: 'دستیاب',
          lowStock: 'کم اسٹاک',
          outOfStock: 'اسٹاک ختم',
          images: 'تصاویر',
        }
      : language === 'ar'
        ? {
            title: 'تفاصيل المنتج',
            selectProduct: 'اختر المنتج',
            searchPh: 'ابحث بالاسم أو SKU...',
            noResults: 'لا توجد منتجات',
            selectHint: 'اختر منتجاً لعرض التفاصيل',
            close: 'إغلاق',
            sku: 'SKU',
            name: 'الاسم',
            desc: 'الوصف',
            price: 'السعر',
            stock: 'المخزون',
            unit: 'الوحدة',
            lowAt: 'تنبيه المخزون عند',
            status: 'الحالة',
            created: 'أُنشئ',
            updated: 'حُدّث',
            inStock: 'متوفر',
            lowStock: 'مخزون منخفض',
            outOfStock: 'نفد المخزون',
            images: 'الصور',
          }
        : language === 'hi'
          ? {
              title: 'उत्पाद विवरण',
              selectProduct: 'उत्पाद चुनें',
              searchPh: 'नाम या SKU से खोजें...',
              noResults: 'कोई उत्पाद नहीं मिला',
              selectHint: 'विवरण देखने के लिए उत्पाद चुनें',
              close: 'बंद करें',
              sku: 'SKU',
              name: 'नाम',
              desc: 'विवरण',
              price: 'मूल्य',
              stock: 'स्टॉक',
              unit: 'इकाई',
              lowAt: 'कम स्टॉक अलर्ट',
              status: 'स्थिति',
              created: 'बनाया गया',
              updated: 'अपडेट हुआ',
              inStock: 'स्टॉक में',
              lowStock: 'कम स्टॉक',
              outOfStock: 'स्टॉक ख़त्म',
              images: 'चित्र',
            }
          : {
              title: 'Product Detail',
              selectProduct: 'Select Product',
              searchPh: 'Search by name or SKU...',
              noResults: 'No products found',
              selectHint: 'Select a product to see its details',
              close: 'Close',
              sku: 'SKU',
              name: 'Name',
              desc: 'Description',
              price: 'Price',
              stock: 'Stock',
              unit: 'Unit',
              lowAt: 'Low stock alert at',
              status: 'Status',
              created: 'Created',
              updated: 'Updated',
              inStock: 'In Stock',
              lowStock: 'Low Stock',
              outOfStock: 'Out of Stock',
              images: 'Images',
            };

  const status = selected ? getStockStatus(selected) : null;
  const statusLabel =
    status === 'in'
      ? L.inStock
      : status === 'low'
        ? L.lowStock
        : status === 'out'
          ? L.outOfStock
          : '';

  // ✅ Real Theme only for status colors
  const statusColor =
    status === 'in'
      ? { bg: 'rgba(102,116,90,0.15)', color: THEME.deepForest }
      : status === 'low'
        ? { bg: 'rgba(196,154,90,0.25)', color: THEME.charcoal }
        : { bg: THEME.charcoal, color: THEME.warmIvory };

  // Read-only input style (looks like a form field but not editable)
  const readonlyInputStyle = (isMono = false): React.CSSProperties => ({
    width: '100%',
    height: 34,
    padding: '0 12px',
    borderRadius: 9999,
    border: `2px solid ${THEME.mutedOlive}30`,
    backgroundColor: 'rgba(102,116,90,0.06)',
    color: THEME.charcoal,
    fontSize: 12,
    fontWeight: 500,
    fontFamily: isMono ? 'monospace' : 'inherit',
    cursor: 'default',
    outline: 'none',
    pointerEvents: 'none',
    userSelect: 'text',
  });

  const readonlyTextareaStyle = (): React.CSSProperties => ({
    width: '100%',
    minHeight: 50,
    padding: '8px 12px',
    borderRadius: 12,
    border: `2px solid ${THEME.mutedOlive}30`,
    backgroundColor: 'rgba(102,116,90,0.06)',
    color: THEME.charcoal,
    fontSize: 12,
    fontWeight: 500,
    cursor: 'default',
    outline: 'none',
    pointerEvents: 'none',
    userSelect: 'text',
    resize: 'none',
    lineHeight: 1.4,
  });

  const readonlyLabelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 4,
    color: THEME.mutedOlive,
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(37,42,40,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl"
        style={{
          backgroundColor: THEME.warmIvory,
          borderRadius: 20,
          border: `1px solid ${THEME.mutedOlive}30`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between gap-3 px-5 pt-4 pb-3"
          style={{ borderBottom: `1px solid ${THEME.mutedOlive}20` }}
        >
          <div className="min-w-0">
            <h2
              className="text-sm font-bold"
              style={{ color: THEME.deepForest }}
            >
              {L.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label={L.close}
            className="w-7 h-7 flex-shrink-0 flex items-center justify-center cursor-pointer transition"
            style={{
              borderRadius: 9999,
              backgroundColor: 'rgba(102,116,90,0.15)',
              color: THEME.deepForest,
            }}
          >
            <IconX className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 overflow-y-auto">
          {/* Select Product field */}
          <label
            className="block text-[9px] font-bold mb-1 uppercase tracking-wider"
            style={{ color: THEME.charcoal }}
          >
            {L.selectProduct}
          </label>
          <div ref={wrapperRef} className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className="w-full h-9 px-3 rounded-full border-2 text-[13px] flex items-center justify-between gap-2 cursor-pointer transition"
              style={{
                borderColor: THEME.mutedOlive + '40',
                backgroundColor: THEME.warmIvory,
                color: selected ? THEME.charcoal : THEME.mutedOlive,
              }}
            >
              <span className="truncate text-start">
                {selected
                  ? `${selected.name} — ${selected.sku}`
                  : L.selectProduct}
              </span>
              <span
                className="transition-transform"
                style={{
                  transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                  color: THEME.mutedOlive,
                }}
              >
                <IconChevron className="w-3.5 h-3.5" />
              </span>
            </button>

            {dropdownOpen && (
              <div
                className="mt-1.5 w-full shadow-lg"
                style={{
                  borderRadius: 12,
                  border: `2px solid ${THEME.mutedOlive}30`,
                  backgroundColor: '#FFFFFF',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Search box */}
                <div
                  className="p-1.5"
                  style={{ borderBottom: `1px solid ${THEME.mutedOlive}20` }}
                >
                  <div className="relative">
                    <span
                      className="absolute top-1/2 -translate-y-1/2 left-2.5 pointer-events-none"
                      style={{ color: THEME.mutedOlive }}
                    >
                      <IconSearch className="w-3.5 h-3.5" />
                    </span>
                    <input
                      ref={searchRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleSearchKey}
                      placeholder={L.searchPh}
                      className="w-full h-8 pl-8 pr-2.5 rounded-full text-[12px] focus:outline-none"
                      style={{
                        border: `1px solid ${THEME.mutedOlive}40`,
                        backgroundColor: THEME.warmIvory,
                        color: THEME.charcoal,
                      }}
                    />
                  </div>
                </div>

                {/* List — 6 products visible by default, scroll if more */}
                <div
                  ref={listRef}
                  className="overflow-y-auto"
                  style={{
                    maxHeight: LIST_ROW_HEIGHT * LIST_VISIBLE_ROWS,
                    minHeight:
                      filtered.length === 0
                        ? undefined
                        : Math.min(filtered.length, LIST_VISIBLE_ROWS) *
                          LIST_ROW_HEIGHT,
                  }}
                >
                  {filtered.length === 0 ? (
                    <p
                      className="px-3 py-4 text-center text-[11px]"
                      style={{ color: THEME.mutedOlive }}
                    >
                      {L.noResults}
                    </p>
                  ) : (
                    filtered.map((p, idx) => {
                      const isHighlighted = idx === highlightedIdx;
                      const isSelected = p.id === selectedId;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelect(p.id)}
                          onMouseEnter={() => setHighlightedIdx(idx)}
                          className="w-full text-start px-3 text-[12px] transition cursor-pointer flex items-center justify-between gap-2"
                          style={{
                            height: LIST_ROW_HEIGHT,
                            backgroundColor: isHighlighted
                              ? 'rgba(196,154,90,0.15)'
                              : isSelected
                                ? 'rgba(102,116,90,0.1)'
                                : 'transparent',
                            color: THEME.charcoal,
                            fontWeight: isSelected ? 700 : 500,
                          }}
                        >
                          <span className="truncate">
                            {p.name} —{' '}
                            <span
                              className="font-mono text-[10px]"
                              style={{ color: THEME.mutedOlive }}
                            >
                              {p.sku}
                            </span>
                          </span>
                          <span
                            className="text-[9px] whitespace-nowrap"
                            style={{ color: THEME.mutedOlive }}
                          >
                            {formatMoney(p.price)}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Hint / Empty state */}
          {!selected && !dropdownOpen && (
            <div
              className="mt-4 py-8 text-center"
              style={{
                borderRadius: 12,
                border: `2px dashed ${THEME.mutedOlive}30`,
                backgroundColor: 'rgba(102,116,90,0.05)',
              }}
            >
              <p className="text-[13px]" style={{ color: THEME.mutedOlive }}>
                {L.selectHint}
              </p>
            </div>
          )}

          {/* Product details — READ-ONLY form style */}
          {selected && (
            <div className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image side */}
                <div>
                  <div
                    className="aspect-square overflow-hidden flex items-center justify-center"
                    style={{
                      borderRadius: 12,
                      backgroundColor: '#FFFFFF',
                      border: `1px solid ${THEME.mutedOlive}30`,
                    }}
                  >
                    {selected.images[activeImg] ? (
                      <img
                        src={selected.images[activeImg]}
                        alt={selected.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span style={{ color: THEME.mutedOlive + '80' }}>
                        <IconImage className="w-8 h-8" />
                      </span>
                    )}
                  </div>
                  {selected.images.length > 1 && (
                    <div className="flex gap-1.5 mt-1.5 overflow-x-auto">
                      {selected.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImg(idx)}
                          className="w-10 h-10 overflow-hidden flex-shrink-0 cursor-pointer"
                          style={{
                            borderRadius: 8,
                            border: `2px solid ${
                              activeImg === idx
                                ? THEME.deepForest
                                : THEME.mutedOlive + '40'
                            }`,
                          }}
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

                {/* Info side — read-only input fields */}
                <div className="space-y-2.5">
                  {/* Name */}
                  <div>
                    <span style={readonlyLabelStyle}>{L.name}</span>
                    <input
                      type="text"
                      value={selected.name}
                      readOnly
                      tabIndex={-1}
                      style={readonlyInputStyle()}
                    />
                  </div>

                  {/* SKU */}
                  <div>
                    <span style={readonlyLabelStyle}>{L.sku}</span>
                    <input
                      type="text"
                      value={selected.sku}
                      readOnly
                      tabIndex={-1}
                      style={readonlyInputStyle(true)}
                    />
                  </div>

                  {/* Description (only if exists) */}
                  {selected.description && (
                    <div>
                      <span style={readonlyLabelStyle}>{L.desc}</span>
                      <textarea
                        value={selected.description}
                        readOnly
                        tabIndex={-1}
                        rows={2}
                        style={readonlyTextareaStyle()}
                      />
                    </div>
                  )}

                  {/* Price + Stock row */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <span style={readonlyLabelStyle}>{L.price}</span>
                      <input
                        type="text"
                        value={formatMoney(selected.price)}
                        readOnly
                        tabIndex={-1}
                        style={{
                          ...readonlyInputStyle(),
                          color: THEME.deepForest,
                          fontWeight: 700,
                        }}
                      />
                    </div>
                    <div>
                      <span style={readonlyLabelStyle}>{L.stock}</span>
                      <input
                        type="text"
                        value={`${selected.stock} ${unitLabel(selected.unit)}`}
                        readOnly
                        tabIndex={-1}
                        style={{
                          ...readonlyInputStyle(),
                          color:
                            status === 'out'
                              ? THEME.charcoal
                              : status === 'low'
                                ? THEME.warmBrass
                                : THEME.deepForest,
                          fontWeight: 700,
                        }}
                      />
                    </div>
                  </div>

                  {/* Unit — separate row */}
                  <div>
                    <span style={readonlyLabelStyle}>{L.unit}</span>
                    <input
                      type="text"
                      value={unitLabel(selected.unit)}
                      readOnly
                      tabIndex={-1}
                      style={readonlyInputStyle()}
                    />
                  </div>

                  {/* Status — badge as input-like field */}
                  <div>
                    <span style={readonlyLabelStyle}>{L.status}</span>
                    <div
                      className="flex items-center"
                      style={{
                        height: 34,
                        padding: '0 12px',
                        borderRadius: 9999,
                        border: `2px solid ${THEME.mutedOlive}30`,
                        backgroundColor: 'rgba(102,116,90,0.06)',
                      }}
                    >
                      <span
                        className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: statusColor.bg,
                          color: statusColor.color,
                        }}
                      >
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates row — also read-only inputs */}
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 pt-3"
                style={{ borderTop: `1px solid ${THEME.mutedOlive}20` }}
              >
                <div>
                  <span style={readonlyLabelStyle}>{L.created}</span>
                  <input
                    type="text"
                    value={formatDate(selected.createdAt)}
                    readOnly
                    tabIndex={-1}
                    style={readonlyInputStyle()}
                  />
                </div>
                <div>
                  <span style={readonlyLabelStyle}>{L.updated}</span>
                  <input
                    type="text"
                    value={formatDate(selected.updatedAt)}
                    readOnly
                    tabIndex={-1}
                    style={readonlyInputStyle()}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-2.5 flex justify-end"
          style={{ borderTop: `1px solid ${THEME.mutedOlive}20` }}
        >
          <button
            onClick={onClose}
            className="h-8 px-4 rounded-full text-[13px] font-bold cursor-pointer transition"
            style={{
              backgroundColor: THEME.deepForest,
              color: THEME.warmIvory,
            }}
          >
            {L.close}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// HEADER
// ============================================================
type HeaderProps = {
  isRTL: boolean;
  language: 'en' | 'ar' | 'ur' | 'hi';
  onToggleCollapse: () => void;
  isCollapsed: boolean;
};

export default function Header({
  isRTL,
  language,
  onToggleCollapse,
  isCollapsed,
}: HeaderProps): React.JSX.Element {
  const navigate = useNavigate();
  const [showProductDetail, setShowProductDetail] = useState(false);

  const menuToggleLabel = isCollapsed
    ? language === 'ur'
      ? 'مینو کھولیں'
      : language === 'ar'
        ? 'فتح القائمة'
        : language === 'hi'
          ? 'मेनू खोलें'
          : 'Open menu'
    : language === 'ur'
      ? 'مینو بند کریں'
      : language === 'ar'
        ? 'إغلاق القائمة'
        : language === 'hi'
          ? 'मेनू बंद करें'
          : 'Close menu';

  const createInvoiceLabel =
    language === 'ur'
      ? 'انوائس بنائیں'
      : language === 'ar'
        ? 'إنشاء فاتورة'
        : language === 'hi'
          ? 'इनवॉइस बनाएं'
          : 'Create Invoice';

  const productDetailLabel =
    language === 'ur'
      ? 'پروڈکٹ کی تفصیل'
      : language === 'ar'
        ? 'تفاصيل المنتج'
        : language === 'hi'
          ? 'उत्पाद विवरण'
          : 'Product Detail';

  return (
    <>
      <header
        dir={isRTL ? 'rtl' : 'ltr'}
        className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-2.5 sm:px-5"
        style={{
          background: THEME.deepForest,
          borderBottom: `1px solid ${THEME.warmIvory}15`,
          boxShadow: '0 2px 8px rgba(18, 60, 50, 0.25)',
        }}
      >
        {/* LEFT — Menu toggle */}
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={menuToggleLabel}
            title={menuToggleLabel}
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center transition cursor-pointer ${
              isCollapsed ? 'rounded-full' : 'rounded-lg'
            }`}
            style={{
              background: THEME.warmBrass,
              color: THEME.warmIvory,
              boxShadow:
                'inset 0 1px 0 rgba(247,243,234,0.25), 0 4px 12px rgba(196,154,90,0.35)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(0.95)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          >
            {isCollapsed ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4.5 w-4.5"
                aria-hidden="true"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="h-4.5 w-4.5"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* RIGHT — Product Detail + Create Invoice (fully rounded) */}
        <div className="flex flex-shrink-0 items-center gap-1.5">
          {/* Product Detail button */}
          <button
            onClick={() => setShowProductDetail(true)}
            className="flex items-center justify-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold transition sm:px-4 sm:text-[12px] cursor-pointer"
            style={{
              background: 'transparent',
              color: THEME.warmIvory,
              border: `1.5px solid ${THEME.warmBrass}80`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${THEME.warmBrass}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3 w-3"
              aria-hidden="true"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <path d="M3.3 7 12 12l8.7-5M12 22V12" />
            </svg>
            {productDetailLabel}
          </button>

          {/* Create Invoice button */}
          <button
            onClick={() => navigate('/sales')}
            className="flex items-center justify-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold transition sm:px-4 sm:text-[12px] cursor-pointer"
            style={{
              background: THEME.warmBrass,
              color: THEME.warmIvory,
              boxShadow:
                'inset 0 1px 0 rgba(247,243,234,0.25), 0 4px 12px rgba(196,154,90,0.35)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(0.95)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-3 w-3"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            {createInvoiceLabel}
          </button>
        </div>
      </header>

      {/* Product Detail Modal */}
      {showProductDetail && (
        <ProductDetailModal
          onClose={() => setShowProductDetail(false)}
          language={language}
          isRTL={isRTL}
        />
      )}
    </>
  );
}