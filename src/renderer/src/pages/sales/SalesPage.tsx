/* eslint-disable prettier/prettier */
import { useState } from 'react';
import {
  loadSalesFormFields,
  SalesFormFieldId,
} from './salesFormFields';

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
  eye: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  undo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  ),
  cash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ),
  card: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  ),
  bank: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M2 10l10-6 10 6" />
    </svg>
  ),
  user: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  calendar: (
    <svg {...svgBase} className="w-4 h-4">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  package: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.3 7 12 12l8.7-5M12 22V12" />
    </svg>
  ),
  note: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  ),
  invoice: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  ),
  quotation: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8M9 22v-4M15 22v-4" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  ),
  print: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  ),
  check: (
    <svg {...svgBase} strokeWidth={2.5} className="w-3.5 h-3.5">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  x: (
    <svg {...svgBase} strokeWidth={2.5} className="w-3.5 h-3.5">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  clock: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  edit: (
    <svg {...svgBase} className="w-3 h-3">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
    </svg>
  ),
  trash: (
    <svg {...svgBase} className="w-3 h-3">
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  chevron: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  plus: (
    <svg {...svgBase} strokeWidth={2.5} className="w-3.5 h-3.5">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
};

// ============================================================
// TYPES
// ============================================================
type RecordStatus = 'Pending' | 'Approved' | 'Rejected';
type PaymentMethod = 'Cash' | 'Card' | 'Bank Transfer';
type CustomerStatus = 'Pending' | 'Approved' | 'Rejected';
type TabId = 'quotation' | 'invoice' | 'pending' | 'approved';

type LineItem = {
  id: string;
  material: string;
  quantity: number;
  price: number;
  discount: number;
};

type ReturnEntry = {
  id: string;
  date: string;
  items: { material: string; quantity: number; amount: number }[];
  amount: number; // invoice total mein se kitna kam hua
};

type SalesRecord = {
  id: string;
  recordNo: string;
  customerId: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  referenceNo: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string;
  items: LineItem[];
  subtotal: number;
  discountTotal: number;
  tax: number;
  total: number;
  notes: string;
  status: RecordStatus;
  paymentMethod?: PaymentMethod; // invoice approve par select hota hai
  returns?: ReturnEntry[]; // wapis aaya hua material (history)
};

// Add Customer page jo customers save karta hai (sirf wo fields jo yahan chahiye)
type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  status: CustomerStatus;
};

// ============================================================
// DATE HELPERS (local time — UTC wali date shift ka masla nahi)
// ============================================================
const toISO = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const startOfDay = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const addDays = (d: Date, n: number): Date => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

// Safe local-date parser (ISO, DD/MM/YYYY, ya koi bhi format)
const parseDate = (s: string): Date | null => {
  if (!s || s === '—') return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]);
  const dmy = /^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})/.exec(s);
  if (dmy) return new Date(+dmy[3], +dmy[2] - 1, +dmy[1]);
  const d = new Date(s);
  return isNaN(d.getTime())
    ? null
    : new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

// DD/MM/YYYY
const formatDate = (dateStr: string): string => {
  const d = parseDate(dateStr);
  if (!d) return dateStr || '—';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${d.getFullYear()}`;
};

// ============================================================
// DEMO DATA — Add Customer aur Sales Record page ke saath same
// ============================================================
const DEMO_CUSTOMERS: Customer[] = [
  { id: 'C-1001', name: 'Al Noor Trading Co.', phone: '+966501234567', email: 'alnoor@example.com', address: 'King Fahd Rd', city: 'Riyadh', status: 'Approved' },
  { id: 'C-1002', name: 'Gulf Builders LLC', phone: '+966502345678', email: 'gulf@example.com', address: 'Tahlia St', city: 'Jeddah', status: 'Approved' },
  { id: 'C-1003', name: 'Desert Rose Interiors', phone: '+966503456789', email: 'desert@example.com', address: 'Corniche Rd', city: 'Dammam', status: 'Pending' },
];

const makeDemoRecord = (
  id: string,
  recordNo: string,
  custIdx: number,
  daysAgo: number,
  status: RecordStatus,
  items: Omit<LineItem, 'id'>[],
  paymentTerms: string,
  referenceNo: string,
  notes: string,
  paymentMethod?: PaymentMethod
): SalesRecord => {
  const cust = DEMO_CUSTOMERS[custIdx];
  const date = addDays(startOfDay(new Date()), -daysAgo);
  const lineItems: LineItem[] = items.map((it, k) => ({ ...it, id: `${id}-item-${k}` }));
  const sub = lineItems.reduce((s, it) => s + it.quantity * it.price, 0);
  const disc = Math.round(
    lineItems.reduce((s, it) => s + (it.quantity * it.price * it.discount) / 100, 0)
  );
  const taxAmt = Math.round((sub - disc) * 0.15);
  return {
    id,
    recordNo,
    customerId: cust.id,
    customerName: cust.name,
    phone: cust.phone,
    email: cust.email,
    address: cust.address,
    city: cust.city,
    referenceNo,
    invoiceDate: toISO(date),
    dueDate: toISO(addDays(date, 15)),
    paymentTerms,
    items: lineItems,
    subtotal: sub,
    discountTotal: disc,
    tax: taxAmt,
    total: sub - disc + taxAmt,
    notes,
    status,
    paymentMethod,
  };
};

// 3 default demo records: INV Approved, QT Approved, INV Rejected
const getDefaultRecords = (): SalesRecord[] => {
  const year = new Date().getFullYear();
  return [
    makeDemoRecord(
      'dummy-rec-1', `INV-${year}-1001`, 0, 2, 'Approved',
      [
        { material: 'Marble Tiles 60x60', quantity: 40, price: 85, discount: 5 },
        { material: 'Cement Bag 50kg', quantity: 100, price: 18, discount: 0 },
      ],
      'Net 30', 'REF-5001', 'Delivery within 3 working days', 'Bank Transfer'
    ),
    makeDemoRecord(
      'dummy-rec-2', `QT-${year}-101`, 1, 5, 'Approved',
      [
        { material: 'Porcelain Floor Tiles', quantity: 30, price: 60, discount: 0 },
        { material: 'PVC Pipes 4"', quantity: 20, price: 32, discount: 10 },
      ],
      'Net 15', 'REF-5002', '—'
    ),
    makeDemoRecord(
      'dummy-rec-3', `INV-${year}-1002`, 2, 1, 'Rejected',
      [
        { material: 'Wall Paint 20L', quantity: 12, price: 210, discount: 5 },
        { material: 'LED Panel Light', quantity: 25, price: 45, discount: 0 },
      ],
      'Immediate', 'REF-5003', 'Customer cancelled the order'
    ),
  ];
};

// ============================================================
// STORAGE
// ============================================================
const PAYMENT_METHODS: { id: PaymentMethod; label: string; labelUr: string }[] = [
  { id: 'Cash', label: 'Cash', labelUr: 'نقد' },
  { id: 'Card', label: 'Card', labelUr: 'کارڈ' },
  { id: 'Bank Transfer', label: 'Bank Transfer', labelUr: 'بینک ٹرانسفر' },
];

const STORAGE_KEY = 'zakhira_sales_records';
const CUSTOMERS_KEY = 'zakhira_customers';

// Purane builds ke saved demo/test records ignore hote hain
const isLegacyDemoId = (id: string): boolean => /^(rec-00\d|demo-\d+|demo-rec-\d+)$/.test(id);

// Real (saved) records + 3 dummy records hamesha saath dikhte hain.
// Dummy par Approve/Reject karein to unka status bhi save ho jata hai.
const loadRecords = (): SalesRecord[] => {
  const defaults = getDefaultRecords();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return defaults;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaults;
    const cleaned = (parsed as SalesRecord[]).filter((r) => !isLegacyDemoId(r.id));
    const missingDummies = defaults.filter((d) => !cleaned.some((r) => r.id === d.id));
    return [...cleaned, ...missingDummies];
  } catch {
    return defaults;
  }
};

const saveRecords = (records: SalesRecord[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

// Add Customer page ke customers (same key). Pehli baar => 3 demo customers.
const loadCustomers = (): Customer[] => {
  try {
    const raw = localStorage.getItem(CUSTOMERS_KEY);
    if (raw === null) return DEMO_CUSTOMERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Customer[]) : [];
  } catch {
    return DEMO_CUSTOMERS;
  }
};

// ============================================================
// HELPERS
// ============================================================
const formatPrice = (n: number): string => `SAR ${n.toLocaleString('en-US')}`;
const generateId = (): string => `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const todayStr = (): string => toISO(new Date());
const daysLater = (days: number): string => toISO(addDays(new Date(), days));
const dash = (v: string): string => (v === '—' ? '' : v);

// Next sequential number, e.g. QT-2026-103. Lives outside the component so
// the React purity lint rule doesn't see Date/random calls in render scope.
const nextRecordNo = (prefix: 'QT' | 'INV', existing: SalesRecord[]): string => {
  const year = new Date().getFullYear();
  const base = prefix === 'QT' ? 100 : 1000;
  const numbers = existing
    .filter((r) => r.recordNo.startsWith(`${prefix}-${year}-`))
    .map((r) => Number(r.recordNo.split('-')[2]))
    .filter((n) => !Number.isNaN(n));
  return `${prefix}-${year}-${Math.max(base, ...numbers) + 1}`;
};

const labelCls = 'block text-[10px] font-bold text-dark mb-1.5 uppercase tracking-wider';
const inputCls =
  'w-full h-10 px-4 rounded-full border-2 border-supporting/20 bg-primary/30 text-dark text-sm placeholder:text-supporting/40 focus:outline-none focus:border-secondary focus:bg-white transition-all';
const thCls = 'text-[10px] font-bold text-supporting uppercase tracking-wider px-3 py-2';

const EMPTY_FORM = {
  customerId: '',
  customerName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  referenceNo: '',
  invoiceDate: '',
  dueDate: '',
  paymentTerms: 'Net 30',
  notes: '',
};

// ============================================================
// RETURN HELPER — wapis aaya material invoice se minus hota hai
// aur subtotal / discount / tax / total dobara calculate hote hain
// ============================================================
const round2 = (n: number): number => Math.round(n * 100) / 100;

const applyReturnToRecord = (
  record: SalesRecord,
  qtys: Record<string, number>,
  entryId: string,
  dateStr: string
): SalesRecord => {
  const returned: ReturnEntry['items'] = [];
  const newItems: LineItem[] = [];
  record.items.forEach((it) => {
    const q = Math.min(Math.max(Math.floor(qtys[it.id] || 0), 0), it.quantity);
    if (q > 0) {
      returned.push({
        material: it.material,
        quantity: q,
        amount: round2(q * it.price * (1 - it.discount / 100)),
      });
    }
    const left = it.quantity - q;
    if (left > 0) newItems.push({ ...it, quantity: left });
  });
  if (returned.length === 0) return record;

  const sub = newItems.reduce((sum, it) => sum + it.quantity * it.price, 0);
  const disc = round2(
    newItems.reduce((sum, it) => sum + (it.quantity * it.price * it.discount) / 100, 0)
  );
  const taxAmt = Math.round((sub - disc) * 0.15);
  const newTotal = round2(sub - disc + taxAmt);

  const entry: ReturnEntry = {
    id: entryId,
    date: dateStr,
    items: returned,
    amount: round2(record.total - newTotal),
  };

  return {
    ...record,
    items: newItems,
    subtotal: sub,
    discountTotal: disc,
    tax: taxAmt,
    total: newTotal,
    returns: [...(record.returns ?? []), entry],
  };
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function SalesPage(): React.JSX.Element {
  const user = JSON.parse(localStorage.getItem('zakhira_user') || '{}');
  const language: 'en' | 'ar' | 'ur' = user.language || 'en';
  const isRTL = language === 'ar' || language === 'ur';
  const tr = (en: string, ur: string): string => (language === 'ur' ? ur : en);

  const [records, setRecords] = useState<SalesRecord[]>(() => loadRecords());
  const [customers] = useState<Customer[]>(() => loadCustomers());
  const [salesFormFields] = useState(loadSalesFormFields);
  const [activeTab, setActiveTab] = useState<TabId>('quotation');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  // Invoice preview popup + payment method picker (invoice approve par)
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [payPickId, setPayPickId] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<PaymentMethod | ''>('');
  // Return popup: kaunsa invoice + har item ki wapsi ki quantity
  const [returnPickId, setReturnPickId] = useState<string | null>(null);
  const [returnQtys, setReturnQtys] = useState<Record<string, string>>({});

  // Rejected customers dropdown mein nahi dikhte
  const selectableCustomers = customers.filter((c) => c.status !== 'Rejected');

  const [form, setForm] = useState({
    ...EMPTY_FORM,
    invoiceDate: todayStr(),
    dueDate: daysLater(30),
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [formError, setFormError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const [lineForm, setLineForm] = useState({
    material: '',
    quantity: '1',
    price: '',
    discount: '0',
  });

  // Fields shown/hidden from Settings > Sales Form
  const isFieldEnabled = (id: SalesFormFieldId): boolean =>
    salesFormFields.some((field) => field.id === id);
  const getFieldLabel = (id: SalesFormFieldId): string =>
    salesFormFields.find((field) => field.id === id)?.[
      language === 'ur' ? 'labelUr' : 'label'
    ] || '';
  const isFieldRequired = (id: SalesFormFieldId): boolean =>
    salesFormFields.find((field) => field.id === id)?.required ?? false;
  const anyEnabled = (ids: SalesFormFieldId[]): boolean =>
    ids.some((id) => isFieldEnabled(id));

  // Derived
  const quotations = records.filter((r) => r.recordNo.startsWith('QT-'));
  const invoices = records.filter((r) => r.recordNo.startsWith('INV-'));
  const approvedList = records.filter((r) => r.status === 'Approved');
  const pendingList = records.filter((r) => r.status === 'Pending');
  const rejectedList = records.filter((r) => r.status === 'Rejected');

  const currentList: SalesRecord[] =
    activeTab === 'quotation'
      ? quotations
      : activeTab === 'invoice'
      ? invoices
      : activeTab === 'pending'
      ? pendingList
      : approvedList;

  const totalRevenue = approvedList.reduce((sum, r) => sum + r.total, 0);
  const pendingCount = pendingList.length;
  const approvedCount = approvedList.length;
  const rejectedCount = rejectedList.length;

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const discountTotal = lineItems.reduce(
    (sum, item) => sum + (item.quantity * item.price * item.discount) / 100,
    0
  );
  const afterDiscount = subtotal - discountTotal;
  const tax = Math.round(afterDiscount * 0.15);
  const total = afterDiscount + tax;

  // Tab config
  const tabsConfig: {
    id: TabId;
    label: string;
    icon: React.ReactNode;
    count: number;
    activeCls: string;
    headerCls: string;
    headerTextCls: string;
    borderCls: string;
    emptyText: string;
  }[] = [
    {
      id: 'quotation',
      label: language === 'ur' ? 'کوٹیشنز' : 'Quotations',
      icon: Icons.quotation,
      count: quotations.length,
      activeCls: 'bg-blue-500 text-white shadow-md',
      headerCls: 'bg-blue-50',
      headerTextCls: 'text-blue-700',
      borderCls: 'border-blue-200',
      emptyText: language === 'ur' ? 'ابھی کوئی کوٹیشن نہیں' : 'No quotations yet',
    },
    {
      id: 'invoice',
      label: language === 'ur' ? 'انوائسز' : 'Invoices',
      icon: Icons.invoice,
      count: invoices.length,
      activeCls: 'bg-accent text-white shadow-md',
      headerCls: 'bg-amber-50',
      headerTextCls: 'text-amber-700',
      borderCls: 'border-amber-200',
      emptyText: language === 'ur' ? 'ابھی کوئی انوائس نہیں' : 'No invoices yet',
    },
    {
      id: 'pending',
      label: language === 'ur' ? 'زیر التواء' : 'Pending',
      icon: Icons.clock,
      count: pendingList.length,
      activeCls: 'bg-amber-500 text-white shadow-md',
      headerCls: 'bg-yellow-50',
      headerTextCls: 'text-yellow-700',
      borderCls: 'border-yellow-200',
      emptyText: language === 'ur' ? 'کوئی زیر التواء ریکارڈ نہیں' : 'No pending records yet',
    },
    {
      id: 'approved',
      label: language === 'ur' ? 'منظور شدہ' : 'Approved',
      icon: Icons.check,
      count: approvedCount,
      activeCls: 'bg-green-600 text-white shadow-md',
      headerCls: 'bg-green-50',
      headerTextCls: 'text-green-700',
      borderCls: 'border-green-200',
      emptyText: language === 'ur' ? 'کوئی منظور شدہ ریکارڈ نہیں' : 'No approved records yet',
    },
  ];
  const activeTabConfig = tabsConfig.find((t) => t.id === activeTab) ?? tabsConfig[0];

  // Customer select => saari customer fields auto-fill
  const handleSelectCustomer = (id: string): void => {
    setSelectedCustomerId(id);
    const c = customers.find((x) => x.id === id);
    if (!c) return;
    setForm((prev) => ({
      ...prev,
      customerId: c.id,
      customerName: c.name,
      phone: c.phone,
      email: dash(c.email),
      address: dash(c.address),
      city: dash(c.city),
    }));
    setFormError('');
  };

  // Line handlers
  const handleAddLineItem = (): void => {
    if (
      (isFieldEnabled('material') && !lineForm.material.trim()) ||
      (isFieldEnabled('price') && !lineForm.price.trim())
    ) {
      setFormError(
        language === 'ur'
          ? 'تمام دکھائے گئے لازمی اشیاء کے فیلڈز درج کریں'
          : 'Fill in the visible required item fields'
      );
      return;
    }
    const newItem: LineItem = {
      id: `li-${Date.now()}`,
      material: lineForm.material.trim() || 'Item',
      quantity: Number(lineForm.quantity) || 1,
      price: Number(lineForm.price) || 0,
      discount: Number(lineForm.discount) || 0,
    };
    setLineItems((prev) => [...prev, newItem]);
    setLineForm({ material: '', quantity: '1', price: '', discount: '0' });
    setFormError('');
  };

  const handleRemoveLineItem = (id: string): void => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const resetForm = (): void => {
    setForm({
      ...EMPTY_FORM,
      invoiceDate: todayStr(),
      dueDate: daysLater(30),
    });
    setSelectedCustomerId('');
    setLineItems([]);
    setFormError('');
    setEditingId(null);
    setLineForm({ material: '', quantity: '1', price: '', discount: '0' });
  };

  const validateForm = (): boolean => {
    if (isFieldEnabled('customerId') && !form.customerId.trim()) {
      setFormError(language === 'ur' ? 'Customer ID درج کریں' : 'Enter Customer ID');
      return false;
    }
    if (isFieldEnabled('customerName') && !form.customerName.trim()) {
      setFormError(language === 'ur' ? 'Customer Name درج کریں' : 'Enter Customer Name');
      return false;
    }
    if (isFieldEnabled('phone') && !form.phone.trim()) {
      setFormError(language === 'ur' ? 'Phone درج کریں' : 'Enter Phone');
      return false;
    }
    if (
      lineItems.length === 0 &&
      (isFieldEnabled('material') || isFieldEnabled('price'))
    ) {
      setFormError(language === 'ur' ? 'کم از کم ایک material شامل کریں' : 'Add at least one material');
      return false;
    }
    return true;
  };

  const buildRecord = (prefix: 'QT' | 'INV'): SalesRecord => {
    const existing = editingId ? records.find((r) => r.id === editingId) : null;

    return {
      id: editingId || generateId(),
      recordNo: existing ? existing.recordNo : nextRecordNo(prefix, records),
      customerId: form.customerId.trim(),
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || '—',
      address: form.address.trim() || '—',
      city: form.city.trim() || '—',
      referenceNo: form.referenceNo.trim() || '—',
      invoiceDate: form.invoiceDate,
      dueDate: form.dueDate,
      paymentTerms: form.paymentTerms,
      items: lineItems,
      subtotal,
      discountTotal,
      tax,
      total,
      notes: form.notes.trim() || '—',
      // Edit karne par purana status barqarar rahe, naya record Pending se shuru
      status: existing ? existing.status : 'Pending',
      paymentMethod: existing?.paymentMethod,
    };
  };

  const handleSendInquiry = (): void => {
    if (!validateForm()) return;
    const newRecord = buildRecord('QT');
    const updated = editingId
      ? records.map((r) => (r.id === editingId ? newRecord : r))
      : [newRecord, ...records];
    saveRecords(updated);
    setRecords(updated);

    const message =
      language === 'ur'
        ? `السلام علیکم ${newRecord.customerName},\n\nآپ کا کوٹیشن ${newRecord.recordNo} تیار ہے۔\nکل رقم: ${formatPrice(total)}\n\nبراہ کرم جائزہ لیں۔`
        : `Hello ${newRecord.customerName},\n\nYour quotation ${newRecord.recordNo} is ready.\nTotal: ${formatPrice(total)}\n\nPlease review.`;

    const phone = newRecord.phone.replace(/\D/g, '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');

    setSuccessMsg(
      language === 'ur' ? 'کوٹیشن quotations میں چلا گیا' : 'Quotation moved to Quotations'
    );
    setTimeout(() => setSuccessMsg(''), 3000);
    setActiveTab('quotation');
    resetForm();
  };

  const handlePrint = (): void => {
    if (!validateForm()) return;
    const newRecord = buildRecord('INV');
    const updated = editingId
      ? records.map((r) => (r.id === editingId ? newRecord : r))
      : [newRecord, ...records];
    saveRecords(updated);
    setRecords(updated);
    window.print();

    setSuccessMsg(
      language === 'ur' ? 'انوائس invoice میں چلا گیا' : 'Invoice moved to Invoice section'
    );
    setTimeout(() => setSuccessMsg(''), 3000);
    setActiveTab('invoice');
    resetForm();
  };

  // Status badalna. Approved par payment method save hota hai; Return/Reject par hat jata hai.
  const applyStatus = (id: string, status: RecordStatus, method?: PaymentMethod): void => {
    const updated = records.map((r) =>
      r.id === id
        ? {
            ...r,
            status,
            paymentMethod: status === 'Approved' ? method ?? r.paymentMethod : undefined,
          }
        : r
    );
    saveRecords(updated);
    setRecords(updated);
  };

  // Invoice approve => pehle payment method poochho. Quotation seedha approve.
  const handleApprove = (record: SalesRecord): void => {
    if (record.recordNo.startsWith('INV-')) {
      setPayMethod('');
      setPayPickId(record.id);
    } else {
      applyStatus(record.id, 'Approved');
    }
  };

  const confirmApprove = (): void => {
    if (!payPickId || !payMethod) return;
    applyStatus(payPickId, 'Approved', payMethod);
    setPayPickId(null);
    setPayMethod('');
  };

  const handleReject = (id: string): void => applyStatus(id, 'Rejected');

  // Return = customer ne material wapis kiya. Status wahi rehta hai (Approved);
  // wapis aaya material invoice se minus hota hai aur invoice update ho jata hai.
  const openReturn = (record: SalesRecord): void => {
    setReturnQtys({});
    setReturnPickId(record.id);
  };

  const closeReturn = (): void => {
    setReturnPickId(null);
    setReturnQtys({});
  };

  const confirmReturn = (): void => {
    const rec = records.find((r) => r.id === returnPickId);
    if (!rec) return;
    const nums: Record<string, number> = {};
    Object.entries(returnQtys).forEach(([k, v]) => {
      nums[k] = Number(v) || 0;
    });
    const updatedRec = applyReturnToRecord(rec, nums, `ret-${Date.now()}`, toISO(new Date()));
    if (updatedRec === rec) return;
    const updated = records.map((r) => (r.id === rec.id ? updatedRec : r));
    saveRecords(updated);
    setRecords(updated);
    closeReturn();
  };

  const previewRecord = records.find((r) => r.id === previewId) ?? null;
  const payPickRecord = records.find((r) => r.id === payPickId) ?? null;
  const returnPickRecord = records.find((r) => r.id === returnPickId) ?? null;
  const returnQtyNums: Record<string, number> = {};
  Object.entries(returnQtys).forEach(([k, v]) => {
    returnQtyNums[k] = Number(v) || 0;
  });
  const returnPreview = returnPickRecord
    ? applyReturnToRecord(returnPickRecord, returnQtyNums, 'preview', returnPickRecord.invoiceDate)
    : null;
  const returnRefund =
    returnPickRecord && returnPreview ? round2(returnPickRecord.total - returnPreview.total) : 0;

  const sendRecord = (record: SalesRecord): void => {
    const phone = record.phone.replace(/\D/g, '');
    const paid = record.paymentMethod
      ? language === 'ur'
        ? `\nادائیگی: ${record.paymentMethod}`
        : `\nPaid via: ${record.paymentMethod}`
      : '';
    const msg =
      language === 'ur'
        ? `السلام علیکم ${record.customerName},\n\n${record.recordNo}\nکل رقم: ${formatPrice(record.total)}${paid}`
        : `Hello ${record.customerName},\n\nRegarding ${record.recordNo}\nTotal: ${formatPrice(record.total)}${paid}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleEditRecord = (record: SalesRecord): void => {
    setEditingId(record.id);
    setSelectedCustomerId(
      customers.some((c) => c.id === record.customerId) ? record.customerId : ''
    );
    setForm({
      customerId: record.customerId,
      customerName: record.customerName,
      phone: record.phone,
      email: dash(record.email),
      address: dash(record.address),
      city: dash(record.city),
      referenceNo: dash(record.referenceNo),
      invoiceDate: record.invoiceDate,
      dueDate: record.dueDate,
      paymentTerms: record.paymentTerms,
      notes: dash(record.notes),
    });
    setLineItems(record.items);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteRecord = (id: string): void => {
    const updated = records.filter((r) => r.id !== id);
    saveRecords(updated);
    setRecords(updated);
  };

  // Quotation: Approve + Reject.
  // Invoice: Approve (payment popup) / Return (payment nahi aayi) / Reject / Send.
  const renderActions = (record: SalesRecord): React.ReactNode => {
    const isInvoice = record.recordNo.startsWith('INV-');
    const btn =
      'px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap';
    return (
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        {/* Approve: quotation + invoice dono */}
        {record.status !== 'Approved' && (
          <button
            onClick={() => handleApprove(record)}
            className={`${btn} bg-green-50 text-green-700 border border-green-200 hover:bg-green-500 hover:text-white`}
          >
            {Icons.check}
            <span>{tr('Approve','منظور')}</span>
          </button>
        )}
        {/* Return: SIRF approved invoice par (material wapis => invoice se minus) */}
        {isInvoice && record.status === 'Approved' && record.items.length > 0 && (
          <button
            onClick={() => openReturn(record)}
            className={`${btn} bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-500 hover:text-white`}
          >
            {Icons.undo}
            <span>{tr('Return','واپس')}</span>
          </button>
        )}
        {/* Reject: quotation + invoice dono */}
        {record.status !== 'Rejected' && (
          <button
            onClick={() => handleReject(record.id)}
            className={`${btn} bg-red-50 text-red-700 border border-red-200 hover:bg-red-500 hover:text-white`}
          >
            {Icons.x}
            <span>{tr('Reject','مسترد')}</span>
          </button>
        )}
        {/* Send: SIRF invoice par */}
        {isInvoice && record.status !== 'Rejected' && (
          <button
            onClick={() => sendRecord(record)}
            className={`${btn} bg-green-500 text-white hover:bg-green-600`}
          >
            {Icons.whatsapp}
            <span>{tr('Send','بھیجیں')}</span>
          </button>
        )}
      </div>
    );
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-primary p-6 lg:p-8 [&_button]:rounded-full [&_input]:rounded-full [&_select]:rounded-full [&_textarea]:rounded-2xl"
    >
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">
          {language === 'ur' ? 'فروخت' : language === 'ar' ? 'المبيعات' : 'Sales'}
        </h1>
        <p className="text-supporting mt-1.5 text-sm">
          {language === 'ur'
            ? 'انوائس اور کوٹیشنز کا انتظام'
            : 'Create, track, and approve invoices & quotations'}
        </p>
      </div>

      {/* SUCCESS */}
      {successMsg && (
        <div className="mb-4 px-4 py-3 rounded-full bg-green-50 border-2 border-green-200 text-green-700 text-xs font-bold flex items-center gap-2">
          {Icons.check}
          <span>{successMsg}</span>
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: language === 'ur' ? 'کل آمدنی' : 'Total Revenue',
            value: formatPrice(totalRevenue),
            color: 'bg-secondary',
          },
          {
            label: language === 'ur' ? 'زیر التواء' : 'Pending',
            value: String(pendingCount),
            color: 'bg-accent',
          },
          {
            label: language === 'ur' ? 'منظور' : 'Approved',
            value: String(approvedCount),
            color: 'bg-green-600',
          },
          {
            label: language === 'ur' ? 'مسترد' : 'Rejected',
            value: String(rejectedCount),
            color: 'bg-red-500',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-3xl p-4 border border-supporting/10 flex items-center gap-3"
          >
            <div
              className={`w-10 h-10 rounded-full ${stat.color} flex items-center justify-center text-white flex-shrink-0`}
              style={{
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 10px rgba(0,0,0,0.1)',
              }}
            >
              {Icons.invoice}
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-dark truncate">{stat.value}</p>
              <p className="text-[10px] text-supporting uppercase tracking-wider font-bold truncate">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* FORM */}
      <div className="bg-white rounded-3xl border border-supporting/10 p-6 mb-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white flex-shrink-0"
            style={{
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 10px rgba(196,154,90,0.3)',
            }}
          >
            {Icons.invoice}
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-dark">
              {editingId
                ? language === 'ur'
                  ? 'ریکارڈ میں ترمیم'
                  : 'Edit Record'
                : language === 'ur'
                ? 'نیا انوائس / کوٹیشن'
                : 'New Invoice / Quotation'}
            </h2>
            <p className="text-xs text-supporting mt-0.5">
              {language === 'ur'
                ? 'تمام مطلوبہ تفصیلات درج کریں'
                : 'Fill in all required details'}
            </p>
          </div>
          {editingId && (
            <button
              onClick={resetForm}
              className="px-4 py-1.5 rounded-full bg-primary text-supporting text-xs font-bold cursor-pointer hover:bg-red-50 hover:text-red-600 transition flex items-center gap-1.5"
            >
              {Icons.x}
              <span>{language === 'ur' ? 'منسوخ' : 'Cancel Edit'}</span>
            </button>
          )}
        </div>

        {/* Section 1: Customer Info */}
        {anyEnabled(['customerId', 'customerName', 'phone', 'email', 'city', 'address']) && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-secondary">{Icons.user}</span>
              <h3 className="text-xs font-bold text-dark uppercase tracking-wider">
                {language === 'ur' ? 'کسٹمر کی معلومات' : 'Customer Information'}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Customer picker — select karte hi neeche ki fields auto-fill */}
              <div className="md:col-span-3">
                <label className={labelCls}>
                  {language === 'ur' ? 'موجودہ کسٹمر منتخب کریں' : 'Select Customer'}
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleSelectCustomer(e.target.value)}
                  className={`${inputCls} cursor-pointer`}
                >
                  <option value="">
                    {language === 'ur' ? 'کسٹمر منتخب کریں' : '— Select a customer —'}
                  </option>
                  {selectableCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} — {c.name}
                      {c.status === 'Pending' ? ' (Pending)' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-supporting mt-1.5 px-2">
                  {selectableCustomers.length === 0
                    ? language === 'ur'
                      ? 'ابھی کوئی کسٹمر نہیں — پہلے Add Customer پیج سے شامل کریں'
                      : 'No customers yet — add one from the Add Customer page'
                    : language === 'ur'
                    ? 'تفصیلات خود بخود بھر جاتی ہیں، آپ ترمیم بھی کر سکتے ہیں'
                    : 'Details fill in automatically — you can still edit them'}
                </p>
              </div>

              {isFieldEnabled('customerId') && (
                <div>
                  <label className={labelCls}>
                    {getFieldLabel('customerId')}{' '}
                    {isFieldRequired('customerId') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={form.customerId}
                    onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                    placeholder="C-1049"
                    className={inputCls}
                  />
                </div>
              )}
              {isFieldEnabled('customerName') && (
                <div>
                  <label className={labelCls}>
                    {getFieldLabel('customerName')}{' '}
                    {isFieldRequired('customerName') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    placeholder="Al-Rajhi Construction"
                    className={inputCls}
                  />
                </div>
              )}
              {isFieldEnabled('phone') && (
                <div>
                  <label className={labelCls}>
                    {getFieldLabel('phone')}{' '}
                    {isFieldRequired('phone') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+966 50 123 4567"
                    className={`${inputCls} font-mono`}
                  />
                </div>
              )}
              {isFieldEnabled('email') && (
                <div>
                  <label className={labelCls}>{getFieldLabel('email')}</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="info@customer.sa"
                    className={inputCls}
                  />
                </div>
              )}
              {isFieldEnabled('city') && (
                <div>
                  <label className={labelCls}>{getFieldLabel('city')}</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Riyadh"
                    className={inputCls}
                  />
                </div>
              )}
              {isFieldEnabled('address') && (
                <div>
                  <label className={labelCls}>{getFieldLabel('address')}</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Street, Building, Area"
                    className={inputCls}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section 2: Invoice Details */}
        {anyEnabled(['referenceNo', 'invoiceDate', 'dueDate', 'paymentTerms']) && (
          <div className="mb-6 pt-5 border-t border-supporting/10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-secondary">{Icons.calendar}</span>
              <h3 className="text-xs font-bold text-dark uppercase tracking-wider">
                {language === 'ur' ? 'انوائس کی تفصیلات' : 'Invoice Details'}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {isFieldEnabled('referenceNo') && (
                <div>
                  <label className={labelCls}>{getFieldLabel('referenceNo')}</label>
                  <input
                    type="text"
                    value={form.referenceNo}
                    onChange={(e) => setForm({ ...form, referenceNo: e.target.value })}
                    placeholder="PO-2025-078"
                    className={`${inputCls} font-mono`}
                  />
                </div>
              )}
              {isFieldEnabled('invoiceDate') && (
                <div>
                  <label className={labelCls}>
                    {getFieldLabel('invoiceDate')}{' '}
                    {isFieldRequired('invoiceDate') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="date"
                    value={form.invoiceDate}
                    onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })}
                    className={inputCls}
                  />
                </div>
              )}
              {isFieldEnabled('dueDate') && (
                <div>
                  <label className={labelCls}>
                    {getFieldLabel('dueDate')}{' '}
                    {isFieldRequired('dueDate') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className={inputCls}
                  />
                </div>
              )}
              {isFieldEnabled('paymentTerms') && (
                <div>
                  <label className={labelCls}>{getFieldLabel('paymentTerms')}</label>
                  <select
                    value={form.paymentTerms}
                    onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                    className={`${inputCls} cursor-pointer`}
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 45">Net 45</option>
                    <option value="Net 60">Net 60</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section 3: Line Items */}
        <div className="mb-6 pt-5 border-t border-supporting/10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-secondary">{Icons.package}</span>
            <h3 className="text-xs font-bold text-dark uppercase tracking-wider">
              {language === 'ur' ? 'اشیاء' : 'Materials / Items'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
            {isFieldEnabled('material') && (
              <div>
                <label className={labelCls}>
                  {getFieldLabel('material')}{' '}
                  {isFieldRequired('material') && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={lineForm.material}
                  onChange={(e) => setLineForm({ ...lineForm, material: e.target.value })}
                  placeholder="Modern Sofa"
                  className={inputCls}
                />
              </div>
            )}
            {isFieldEnabled('quantity') && (
              <div>
                <label className={labelCls}>
                  {getFieldLabel('quantity')}{' '}
                  {isFieldRequired('quantity') && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="number"
                  min="1"
                  value={lineForm.quantity}
                  onChange={(e) => setLineForm({ ...lineForm, quantity: e.target.value })}
                  className={inputCls}
                />
              </div>
            )}
            {isFieldEnabled('price') && (
              <div>
                <label className={labelCls}>
                  {getFieldLabel('price')}{' '}
                  {isFieldRequired('price') && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="number"
                  min="0"
                  value={lineForm.price}
                  onChange={(e) => setLineForm({ ...lineForm, price: e.target.value })}
                  placeholder="650"
                  className={inputCls}
                />
              </div>
            )}
            {isFieldEnabled('discount') && (
              <div>
                <label className={labelCls}>{getFieldLabel('discount')}</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={lineForm.discount}
                  onChange={(e) => setLineForm({ ...lineForm, discount: e.target.value })}
                  className={inputCls}
                />
              </div>
            )}
            <div className="flex items-end">
              <button
                onClick={handleAddLineItem}
                className="h-10 rounded-full bg-secondary px-5 text-primary text-xs font-bold cursor-pointer transition-all duration-300 hover:shadow-md flex items-center justify-center gap-1.5"
              >
                {Icons.plus}
                <span>{language === 'ur' ? 'شامل' : 'Add'}</span>
              </button>
            </div>
          </div>

          {formError && (
            <div className="mb-3 px-4 py-2.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {formError}
            </div>
          )}

          {lineItems.length > 0 && (
            <div className="border border-supporting/10 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-primary/30 border-b border-supporting/10">
                    <th className={`text-left ${thCls}`}>
                      {language === 'ur' ? 'میٹیریل' : 'Material'}
                    </th>
                    <th className={`text-center ${thCls} w-16`}>
                      {language === 'ur' ? 'مقدار' : 'Qty'}
                    </th>
                    <th className={`text-right ${thCls} w-24`}>
                      {language === 'ur' ? 'قیمت' : 'Price'}
                    </th>
                    <th className={`text-center ${thCls} w-20`}>
                      {language === 'ur' ? 'ڈسکاؤنٹ' : 'Disc %'}
                    </th>
                    <th className={`text-right ${thCls} w-28`}>
                      {language === 'ur' ? 'کل' : 'Total'}
                    </th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => {
                    const itemTotal = item.quantity * item.price;
                    const itemDiscount = (itemTotal * item.discount) / 100;
                    const finalTotal = itemTotal - itemDiscount;
                    return (
                      <tr key={item.id} className="border-b border-supporting/5">
                        <td className="px-3 py-2.5 text-sm font-semibold text-dark">
                          {item.material}
                        </td>
                        <td className="px-3 py-2.5 text-center text-sm text-supporting">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-2.5 text-right text-sm text-supporting">
                          {formatPrice(item.price)}
                        </td>
                        <td className="px-3 py-2.5 text-center text-sm text-supporting">
                          {item.discount > 0 ? `${item.discount}%` : '—'}
                        </td>
                        <td className="px-3 py-2.5 text-right text-sm font-bold text-dark">
                          {formatPrice(finalTotal)}
                        </td>
                        <td className="px-2 py-2.5 text-center">
                          <button
                            onClick={() => handleRemoveLineItem(item.id)}
                            className="w-7 h-7 rounded-full bg-primary text-red-500 flex items-center justify-center cursor-pointer hover:bg-red-500 hover:text-white transition"
                          >
                            {Icons.trash}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-primary/20">
                  <tr className="border-t border-supporting/10">
                    <td colSpan={4} className="px-3 py-2 text-right text-[11px] font-bold text-supporting uppercase tracking-wider">
                      {language === 'ur' ? 'ذیلی کل' : 'Subtotal'}
                    </td>
                    <td className="px-3 py-2 text-right text-sm font-bold text-dark">
                      {formatPrice(subtotal)}
                    </td>
                    <td></td>
                  </tr>
                  {discountTotal > 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-2 text-right text-[11px] font-bold text-supporting uppercase tracking-wider">
                        {language === 'ur' ? 'ڈسکاؤنٹ' : 'Discount'}
                      </td>
                      <td className="px-3 py-2 text-right text-sm font-bold text-red-600">
                        -{formatPrice(discountTotal)}
                      </td>
                      <td></td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={4} className="px-3 py-2 text-right text-[11px] font-bold text-supporting uppercase tracking-wider">
                      {language === 'ur' ? 'ٹیکس (15%)' : 'Tax (15%)'}
                    </td>
                    <td className="px-3 py-2 text-right text-sm font-bold text-dark">
                      {formatPrice(tax)}
                    </td>
                    <td></td>
                  </tr>
                  <tr className="border-t-2 border-secondary/30">
                    <td colSpan={4} className="px-3 py-3 text-right text-xs font-bold text-dark uppercase tracking-wider">
                      {language === 'ur' ? 'کل رقم' : 'Grand Total'}
                    </td>
                    <td className="px-3 py-3 text-right text-base font-bold text-secondary">
                      {formatPrice(total)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Section 4: Notes */}
        {isFieldEnabled('notes') && (
          <div className="mb-6 pt-5 border-t border-supporting/10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-secondary">{Icons.note}</span>
              <h3 className="text-xs font-bold text-dark uppercase tracking-wider">
                {getFieldLabel('notes')}
              </h3>
            </div>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={
                language === 'ur'
                  ? 'ڈیلیوری، ادائیگی، یا دیگر شرائط...'
                  : 'Delivery, payment, or other terms...'
              }
              rows={2}
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-supporting/20 bg-primary/30 text-dark text-sm placeholder:text-supporting/40 focus:outline-none focus:border-secondary focus:bg-white transition-all resize-none"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-3 pt-5 border-t border-supporting/10">
          <button
            onClick={handleSendInquiry}
            className="h-10 w-full sm:w-auto px-5 rounded-full bg-green-500 text-white text-sm font-bold cursor-pointer transition-all duration-300 hover:bg-green-600 hover:shadow-md flex items-center justify-center gap-2"
          >
            {Icons.whatsapp}
            <span>
              {editingId
                ? language === 'ur'
                  ? 'اپڈیٹ اور واٹس ایپ'
                  : 'Update & WhatsApp'
                : language === 'ur'
                ? 'واٹس ایپ پر بھیجیں'
                : 'Send Inquiry (WhatsApp)'}
            </span>
          </button>

          <button
            onClick={handlePrint}
            className="h-10 w-full sm:w-auto px-5 rounded-full bg-accent text-white text-sm font-bold cursor-pointer transition-all duration-300 hover:brightness-95 hover:shadow-md flex items-center justify-center gap-2"
          >
            {Icons.print}
            <span>
              {editingId
                ? language === 'ur'
                  ? 'اپڈیٹ اور پرنٹ'
                  : 'Update & Print'
                : language === 'ur'
                ? 'پرنٹ کریں'
                : 'Print (Invoice)'}
            </span>
          </button>
        </div>
      </div>

      {/* TABS (4) */}
      <div className="bg-white rounded-[2rem] border border-supporting/10 p-2 mb-4 grid grid-cols-2 lg:grid-cols-4 gap-2">
        {tabsConfig.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
            }}
            className={`py-2.5 rounded-full text-sm font-bold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === tab.id
                ? tab.activeCls
                : 'text-supporting hover:bg-primary'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-supporting/10'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* RECORDS TABLE */}
      <div className="bg-white rounded-3xl border border-supporting/10 overflow-hidden">
        <div
          className={`px-5 py-3 border-b border-supporting/10 ${activeTabConfig.headerCls}`}
        >
          <h2 className={`text-sm font-bold ${activeTabConfig.headerTextCls}`}>
            {activeTabConfig.label}{' '}
            <span className="text-xs font-normal">({currentList.length})</span>
          </h2>
        </div>

        {currentList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-supporting/10 bg-primary/20">
                  <th className="text-left text-[10px] font-bold text-supporting uppercase tracking-wider px-4 py-2.5">
                    {tr('No.','نمبر')}
                  </th>
                  <th className="text-left text-[10px] font-bold text-supporting uppercase tracking-wider px-4 py-2.5">
                    {tr('Customer','کسٹمر')}
                  </th>
                  <th className="text-left text-[10px] font-bold text-supporting uppercase tracking-wider px-4 py-2.5">
                    {tr('Date','تاریخ')}
                  </th>
                  <th className="text-left text-[10px] font-bold text-supporting uppercase tracking-wider px-4 py-2.5">
                    {tr('Invoice / Amount','انوائس / رقم')}
                  </th>
                  <th className="text-center text-[10px] font-bold text-supporting uppercase tracking-wider px-4 py-2.5">
                    {tr('Status','حالت')}
                  </th>
                  <th className="text-right text-[10px] font-bold text-supporting uppercase tracking-wider px-4 py-2.5">
                    {tr('Actions','ایکشنز')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentList.map((record) => {
                  const isQuotation = record.recordNo.startsWith('QT-');
                  return (
                    <tr
                      key={record.id}
                      className="border-b border-supporting/5 hover:bg-primary/30 transition"
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-dark font-mono">{record.recordNo}</p>
                        <span
                          className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            isQuotation ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {isQuotation ? <>{tr('Quotation','کوٹیشن')}</> : <>{tr('Invoice','انوائس')}</>}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-dark truncate max-w-[180px]">
                          {record.customerName}
                        </p>
                        <p className="text-[10px] text-supporting font-mono mt-0.5">
                          {record.customerId}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-dark whitespace-nowrap">
                        {formatDate(record.invoiceDate)}
                      </td>
                      {/* Invoice preview + amount ek hi column mein */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => setPreviewId(record.id)}
                            className="px-3 py-1.5 rounded-full bg-primary text-dark border border-supporting/20 text-xs font-bold cursor-pointer hover:bg-secondary hover:text-primary hover:border-secondary transition flex items-center gap-1.5"
                          >
                            {Icons.eye}
                            <span>{tr('Preview','پریویو')}</span>
                          </button>
                          <span className="text-sm font-bold text-secondary whitespace-nowrap">
                            {formatPrice(record.total)}
                          </span>
                        </div>
                        {record.returns && record.returns.length > 0 && (
                          <p className="text-[10px] font-bold text-amber-700 mt-1">
                            {tr('Returned','واپس')}: -{formatPrice(record.returns.reduce((s, x) => s + x.amount, 0))}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            record.status === 'Approved'
                              ? 'bg-green-100 text-green-700'
                              : record.status === 'Rejected'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {record.status}
                        </span>
                        {record.status === 'Approved' && record.paymentMethod && (
                          <p className="text-[10px] font-bold text-supporting mt-1">
                            {record.paymentMethod}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">{renderActions(record)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-sm text-supporting">{activeTabConfig.emptyText}</p>
          </div>
        )}
      </div>

      {/* INVOICE PREVIEW */}
      {previewRecord && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setPreviewId(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <p className="text-[10px] font-bold text-supporting uppercase tracking-wider">
                  {previewRecord.recordNo.startsWith('QT-') ? (
                    <>{tr('Quotation Preview','کوٹیشن پریویو')}</>
                  ) : (
                    <>{tr('Invoice Preview','انوائس پریویو')}</>
                  )}
                </p>
                <h3 className="text-xl font-bold text-dark font-mono mt-0.5">
                  {previewRecord.recordNo}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    previewRecord.status === 'Approved'
                      ? 'bg-green-100 text-green-700'
                      : previewRecord.status === 'Rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {previewRecord.status}
                </span>
                <button
                  onClick={() => setPreviewId(null)}
                  className="w-8 h-8 rounded-full bg-primary text-supporting flex items-center justify-center cursor-pointer hover:bg-red-50 hover:text-red-600 transition"
                >
                  {Icons.x}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div className="bg-primary/30 rounded-2xl p-4">
                <h4 className="text-[10px] font-bold text-supporting uppercase tracking-wider mb-3">
                  {tr('Customer','کسٹمر')}
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between gap-3">
                    <span className="text-supporting">Name:</span>
                    <span className="font-semibold text-dark text-right">{previewRecord.customerName}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-supporting">ID:</span>
                    <span className="font-mono font-bold text-dark">{previewRecord.customerId}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-supporting">Phone:</span>
                    <span className="font-mono text-dark">{previewRecord.phone}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-supporting">City:</span>
                    <span className="text-dark">{previewRecord.city}</span>
                  </div>
                </div>
              </div>
              <div className="bg-primary/30 rounded-2xl p-4">
                <h4 className="text-[10px] font-bold text-supporting uppercase tracking-wider mb-3">
                  {tr('Details','تفصیلات')}
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between gap-3">
                    <span className="text-supporting">Date:</span>
                    <span className="font-semibold text-dark">{formatDate(previewRecord.invoiceDate)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-supporting">Due:</span>
                    <span className="font-semibold text-dark">{formatDate(previewRecord.dueDate)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-supporting">Terms:</span>
                    <span className="text-dark">{previewRecord.paymentTerms}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-supporting">Ref:</span>
                    <span className="font-mono text-dark">{previewRecord.referenceNo}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-supporting/10 rounded-2xl overflow-hidden mb-5">
              <table className="w-full">
                <thead>
                  <tr className="bg-primary/30 border-b border-supporting/10">
                    <th className="text-left text-[10px] font-bold text-supporting uppercase tracking-wider px-4 py-2">
                      {tr('Material','میٹیریل')}
                    </th>
                    <th className="text-center text-[10px] font-bold text-supporting uppercase tracking-wider px-3 py-2">
                      {tr('Qty','مقدار')}
                    </th>
                    <th className="text-right text-[10px] font-bold text-supporting uppercase tracking-wider px-3 py-2">
                      {tr('Price','قیمت')}
                    </th>
                    <th className="text-center text-[10px] font-bold text-supporting uppercase tracking-wider px-3 py-2">
                      {tr('Disc','ڈسکاؤنٹ')}
                    </th>
                    <th className="text-right text-[10px] font-bold text-supporting uppercase tracking-wider px-4 py-2">
                      {tr('Total','کل')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {previewRecord.items.map((item) => {
                    const itemTotal = item.quantity * item.price;
                    const finalTotal = itemTotal - (itemTotal * item.discount) / 100;
                    return (
                      <tr key={item.id} className="border-b border-supporting/5">
                        <td className="px-4 py-2 text-sm font-semibold text-dark">{item.material}</td>
                        <td className="px-3 py-2 text-center text-sm text-supporting">{item.quantity}</td>
                        <td className="px-3 py-2 text-right text-sm text-supporting">{formatPrice(item.price)}</td>
                        <td className="px-3 py-2 text-center text-sm text-supporting">
                          {item.discount > 0 ? `${item.discount}%` : '—'}
                        </td>
                        <td className="px-4 py-2 text-right text-sm font-bold text-dark">{formatPrice(finalTotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="ml-auto max-w-xs space-y-1.5 text-xs mb-5">
              <div className="flex justify-between">
                <span className="text-supporting">Subtotal:</span>
                <span className="font-semibold text-dark">{formatPrice(previewRecord.subtotal)}</span>
              </div>
              {previewRecord.discountTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-supporting">Discount:</span>
                  <span className="font-semibold text-red-600">-{formatPrice(previewRecord.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-supporting">Tax (15%):</span>
                <span className="font-semibold text-dark">{formatPrice(previewRecord.tax)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-supporting/10">
                <span className="font-bold text-dark">{tr('Amount','رقم')}:</span>
                <span className="text-lg font-bold text-secondary">{formatPrice(previewRecord.total)}</span>
              </div>
            </div>

            {previewRecord.status === 'Approved' && previewRecord.paymentMethod && (
              <div className="mb-5 px-4 py-2.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-bold flex items-center gap-2">
                {Icons.check}
                <span>
                  {tr('Paid via','ادائیگی')}: {previewRecord.paymentMethod}
                </span>
              </div>
            )}

            {previewRecord.returns && previewRecord.returns.length > 0 && (
              <div className="mb-5 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <p className="font-bold mb-1.5">{tr('Returned material','واپس شدہ مال')}</p>
                {previewRecord.returns.map((ret) => (
                  <div key={ret.id} className="mb-1.5 last:mb-0">
                    <p className="font-semibold">
                      {formatDate(ret.date)} — -{formatPrice(ret.amount)}
                    </p>
                    {ret.items.map((it, i) => (
                      <p key={i} className="text-[11px] ps-3">
                        {it.material} × {it.quantity} ({formatPrice(it.amount)})
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {previewRecord.notes && previewRecord.notes !== '—' && (
              <div className="mb-5 px-4 py-3 rounded-2xl bg-primary/30 text-xs text-supporting">
                {previewRecord.notes}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-supporting/10">
              <button
                onClick={() => {
                  handleDeleteRecord(previewRecord.id);
                  setPreviewId(null);
                }}
                className="px-4 py-2 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-bold cursor-pointer hover:bg-red-500 hover:text-white transition flex items-center gap-1.5"
              >
                {Icons.trash}
                <span>{tr('Delete','حذف')}</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleEditRecord(previewRecord);
                    setPreviewId(null);
                  }}
                  className="px-4 py-2 rounded-full bg-secondary text-primary text-xs font-bold cursor-pointer hover:shadow-md transition flex items-center gap-1.5"
                >
                  {Icons.edit}
                  <span>{tr('Edit','ترمیم')}</span>
                </button>
                <button
                  onClick={() => setPreviewId(null)}
                  className="px-4 py-2 rounded-full bg-primary text-supporting border border-supporting/20 text-xs font-bold cursor-pointer hover:bg-white hover:text-dark transition"
                >
                  {tr('Close','بند کریں')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RETURN MATERIAL POPUP */}
      {returnPickRecord && returnPreview && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4"
          onClick={closeReturn}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-dark">
              {tr('Return Material','مال واپسی')}
            </h3>
            <p className="text-xs text-supporting mt-1 mb-4">
              {returnPickRecord.recordNo} — {formatPrice(returnPickRecord.total)}
            </p>

            <div className="border border-supporting/10 rounded-2xl overflow-hidden mb-4">
              {returnPickRecord.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-3 border-b border-supporting/5 last:border-b-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-dark truncate">{item.material}</p>
                    <p className="text-[10px] text-supporting mt-0.5">
                      {tr('Qty','مقدار')}: {item.quantity} × {formatPrice(item.price)}
                      {item.discount > 0 ? ` (-${item.discount}%)` : ''}
                    </p>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={item.quantity}
                    value={returnQtys[item.id] ?? ''}
                    placeholder="0"
                    onChange={(e) => {
                      const raw = Number(e.target.value);
                      const clamped =
                        e.target.value === '' ? '' : String(Math.min(Math.max(raw, 0), item.quantity));
                      setReturnQtys({ ...returnQtys, [item.id]: clamped });
                    }}
                    className="w-20 h-9 px-3 rounded-full border-2 border-supporting/20 bg-primary/30 text-dark text-sm text-center focus:outline-none focus:border-secondary focus:bg-white transition-all"
                  />
                </div>
              ))}
            </div>

            <div className="px-4 py-3 rounded-2xl bg-primary/30 text-xs space-y-1.5 mb-5">
              <div className="flex justify-between">
                <span className="text-supporting">{tr('Refund','واپسی رقم')}:</span>
                <span className="font-bold text-red-600">-{formatPrice(returnRefund)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-supporting">{tr('New Total','نیا کل')}:</span>
                <span className="font-bold text-secondary">{formatPrice(returnPreview.total)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={closeReturn}
                className="flex-1 h-10 rounded-full bg-primary text-supporting border-2 border-supporting/20 text-sm font-bold cursor-pointer hover:bg-white hover:text-dark transition"
              >
                {tr('Cancel','منسوخ')}
              </button>
              <button
                onClick={confirmReturn}
                disabled={returnRefund <= 0}
                className="flex-1 h-10 rounded-full bg-amber-500 text-white text-sm font-bold cursor-pointer hover:bg-amber-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {tr('Confirm Return','واپسی کنفرم کریں')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT METHOD PICKER (invoice approve) */}
      {payPickRecord && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4"
          onClick={() => setPayPickId(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-dark">
              {tr('Select Payment Method','ادائیگی کا طریقہ منتخب کریں')}
            </h3>
            <p className="text-xs text-supporting mt-1 mb-4">
              {payPickRecord.recordNo} — {formatPrice(payPickRecord.total)}
            </p>
            <div className="grid grid-cols-1 gap-2 mb-5">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPayMethod(m.id)}
                  className={`h-11 px-4 rounded-full border-2 text-sm font-bold cursor-pointer transition-all flex items-center gap-2.5 ${
                    payMethod === m.id
                      ? 'bg-secondary text-primary border-secondary'
                      : 'bg-primary/30 text-dark border-supporting/20 hover:border-secondary'
                  }`}
                >
                  {m.id === 'Cash' ? Icons.cash : m.id === 'Card' ? Icons.card : Icons.bank}
                  <span className="flex-1 text-left">{language === 'ur' ? m.labelUr : m.label}</span>
                  {payMethod === m.id && Icons.check}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPayPickId(null)}
                className="flex-1 h-10 rounded-full bg-primary text-supporting border-2 border-supporting/20 text-sm font-bold cursor-pointer hover:bg-white hover:text-dark transition"
              >
                {tr('Cancel','منسوخ')}
              </button>
              <button
                onClick={confirmApprove}
                disabled={!payMethod}
                className="flex-1 h-10 rounded-full bg-green-600 text-white text-sm font-bold cursor-pointer hover:bg-green-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {tr('Approve','منظور')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}