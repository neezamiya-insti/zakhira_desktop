/* eslint-disable prettier/prettier */
/* eslint-disable react/no-unescaped-entities */
import { useState, useMemo } from 'react';

// ============================================================
// SVG ICONS
// ============================================================
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
  quotation: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8M9 22v-4M15 22v-4" />
    </svg>
  ),
  invoice: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
};

// ============================================================
// TYPES
// ============================================================
type RecordStatus = 'Pending' | 'Approved' | 'Rejected';
type PaymentMethod = 'Cash' | 'Card' | 'Bank Transfer';

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

type TimeRange = '7d' | '30d' | '3m' | '6m' | '1y' | 'all';
type TabKey = 'quotation' | 'invoice' | 'pending' | 'approved';

// ============================================================
// STORAGE
// ============================================================
const PAYMENT_METHODS: { id: PaymentMethod; label: string; labelUr: string }[] = [
  { id: 'Cash', label: 'Cash', labelUr: 'نقد' },
  { id: 'Card', label: 'Card', labelUr: 'کارڈ' },
  { id: 'Bank Transfer', label: 'Bank Transfer', labelUr: 'بینک ٹرانسفر' },
];

const STORAGE_KEY = 'zakhira_sales_records';

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

// ============================================================
// HELPERS
// ============================================================
const formatPrice = (n: number): string => `SAR ${n.toLocaleString('en-US')}`;

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

const startOfDay = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const addDays = (d: Date, n: number): Date => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

// Format date as DD/MM/YYYY
const formatDate = (dateStr: string): string => {
  const d = parseDate(dateStr);
  if (!d) return dateStr || '—';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${d.getFullYear()}`;
};

// ============================================================
// LINE CHART (Dynamic with Search)
// ============================================================
const LineChart = ({
  data,
  formatValue,
}: {
  data: { label: string; value: number }[];
  formatValue: (n: number) => string;
}): React.JSX.Element => {
  const width = 800;
  const height = 240;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values, 1);
  const minValue = 0;

  const points = data.map((d, i) => {
    const x =
      data.length === 1
        ? padding.left + chartWidth / 2
        : padding.left + (i / (data.length - 1)) * chartWidth;
    const y =
      padding.top +
      chartHeight -
      ((d.value - minValue) / (maxValue - minValue)) * chartHeight;
    return { x, y, value: d.value, label: d.label };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaPath =
    `M ${points[0].x} ${padding.top + chartHeight} ` +
    points.map((p) => `L ${p.x} ${p.y}`).join(' ') +
    ` L ${points[points.length - 1].x} ${padding.top + chartHeight} Z`;

  const yGridLines = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const value = minValue + (maxValue - minValue) * (1 - ratio);
    const y = padding.top + chartHeight * ratio;
    return { value, y };
  });

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="recordsAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#123C32" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#123C32" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="recordsLineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#123C32" />
            <stop offset="100%" stopColor="#66745A" />
          </linearGradient>
        </defs>

        {yGridLines.map((g, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={g.y}
              x2={width - padding.right}
              y2={g.y}
              stroke="#66745A"
              strokeOpacity="0.1"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text
              x={padding.left - 10}
              y={g.y + 4}
              textAnchor="end"
              fontSize="10"
              fill="#66745A"
              fontWeight="600"
            >
              {g.value >= 1000
                ? `${(g.value / 1000).toFixed(1)}k`
                : g.value.toFixed(0)}
            </text>
          </g>
        ))}

        <line
          x1={padding.left}
          y1={padding.top + chartHeight}
          x2={width - padding.right}
          y2={padding.top + chartHeight}
          stroke="#66745A"
          strokeOpacity="0.3"
          strokeWidth="1"
        />

        <path d={areaPath} fill="url(#recordsAreaGradient)" />

        <path
          d={linePath}
          fill="none"
          stroke="url(#recordsLineGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p, i) => (
          <g key={i} className="group cursor-pointer">
            <circle cx={p.x} cy={p.y} r="12" fill="transparent" />
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#123C32"
              stroke="#F7F3EA"
              strokeWidth="2"
            />
            <g
              className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              transform={`translate(${p.x}, ${p.y - 40})`}
            >
              <rect x="-50" y="-22" width="100" height="26" rx="13" fill="#252A28" />
              <text
                x="0"
                y="-5"
                textAnchor="middle"
                fontSize="10"
                fill="#F7F3EA"
                fontWeight="700"
              >
                {formatValue(p.value)}
              </text>
            </g>
            <text
              x={p.x}
              y={padding.top + chartHeight + 20}
              textAnchor="middle"
              fontSize="11"
              fill="#66745A"
              fontWeight="600"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// ============================================================
// DEMO DATA — Add Customer aur Sales page ke saath same (3 records)
// ============================================================
const toISO = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const DEMO_CUSTOMERS = [
  { id: 'C-1001', name: 'Al Noor Trading Co.', phone: '+966501234567', email: 'alnoor@example.com', address: 'King Fahd Rd', city: 'Riyadh' },
  { id: 'C-1002', name: 'Gulf Builders LLC', phone: '+966502345678', email: 'gulf@example.com', address: 'Tahlia St', city: 'Jeddah' },
  { id: 'C-1003', name: 'Desert Rose Interiors', phone: '+966503456789', email: 'desert@example.com', address: 'Corniche Rd', city: 'Dammam' },
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

// INV Approved, QT Approved, INV Rejected
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
// FILTER HELPERS
// ============================================================
const RANGE_DAYS: Record<string, number> = {
  '7d': 7,
  '30d': 30,
  '3m': 90,
  '6m': 180,
  '1y': 365,
};

const inTimeRange = (r: SalesRecord, range: TimeRange): boolean => {
  const days = RANGE_DAYS[range];
  if (!days) return true; // 'all'
  const fromDate = addDays(startOfDay(new Date()), -days);
  const recDate = parseDate(r.invoiceDate);
  return !!recDate && recDate >= fromDate;
};

const matchesCustomerQuery = (r: SalesRecord, query: string): boolean => {
  const q = query.toLowerCase().replace(/\s/g, '');
  const phone = r.phone.replace(/\D/g, '');
  const phoneQ = q.replace(/\D/g, '');
  return (
    r.customerId.toLowerCase().includes(q) ||
    r.customerName.toLowerCase().includes(q) ||
    (!!phoneQ && phone.includes(phoneQ)) ||
    r.recordNo.toLowerCase().includes(q)
  );
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
export default function SalesRecordPage(): React.JSX.Element {
  // Sales page jo records save karta hai wahi yahan dikhte hain (same localStorage key).
  // Pehli baar => 3 demo records.
  const [records, setRecords] = useState<SalesRecord[]>(() => loadRecords());

  // Active tab
  const [activeTab, setActiveTab] = useState<TabKey>('quotation');

  // Pehla customer — jab tak Search na ho, graph isi ka dikhta hai
  const defaultCustomerId = records[0]?.customerId ?? '';
  const defaultCustomerName = records[0]?.customerName ?? '';

  // Filters (inputs)
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [customerNumber, setCustomerNumber] = useState(defaultCustomerId);

  // Applied search — table ko drive karta hai (shuru mein sab customers ke records)
  const [appliedSearch, setAppliedSearch] = useState<{
    timeRange: TimeRange;
    customerNumber: string;
  }>({ timeRange: '30d', customerNumber: '' });

  // false => graph pehle customer ka; true => graph Search ke filters ka
  const [hasSearched, setHasSearched] = useState(false);

  // Invoice preview popup + payment method picker (invoice approve par)
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [payPickId, setPayPickId] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<PaymentMethod | ''>('');
  // Return popup: kaunsa invoice + har item ki wapsi ki quantity
  const [returnPickId, setReturnPickId] = useState<string | null>(null);
  const [returnQtys, setReturnQtys] = useState<Record<string, string>>({});

  // ============================================================
  // SEARCH HANDLERS
  // ============================================================
  const handleSearch = (): void => {
    setAppliedSearch({
      timeRange,
      customerNumber: customerNumber.trim(),
    });
    setHasSearched(true);
  };

  const handleClear = (): void => {
    setTimeRange('30d');
    setCustomerNumber(defaultCustomerId);
    setAppliedSearch({ timeRange: '30d', customerNumber: '' });
    setHasSearched(false);
  };

  // ============================================================
  // FILTER LOGIC — Based on APPLIED search
  // ============================================================
  const filteredRecords = useMemo(
    () =>
      records.filter((r) => {
        if (!inTimeRange(r, appliedSearch.timeRange)) return false;
        if (
          appliedSearch.customerNumber &&
          !matchesCustomerQuery(r, appliedSearch.customerNumber)
        )
          return false;
        return true;
      }),
    [records, appliedSearch]
  );

  // Graph ke records: Search se pehle => pehla customer, baad mein => applied filters
  const chartRecords = useMemo(
    () =>
      hasSearched
        ? filteredRecords
        : records.filter(
            (r) =>
              !!defaultCustomerId &&
              r.customerId === defaultCustomerId &&
              inTimeRange(r, appliedSearch.timeRange)
          ),
    [hasSearched, filteredRecords, records, defaultCustomerId, appliedSearch.timeRange]
  );

  const chartSubtitle = hasSearched
    ? appliedSearch.customerNumber
      ? `Filter: ${appliedSearch.customerNumber}`
      : 'All customers'
    : defaultCustomerId
      ? `${defaultCustomerName} (${defaultCustomerId})`
      : 'No customer yet';

  // ============================================================
  // TABS — Split filtered records
  // ============================================================
  const quotations = filteredRecords.filter((r) => r.recordNo.startsWith('QT-'));
  const invoices = filteredRecords.filter((r) => r.recordNo.startsWith('INV-'));
  const pendingRecords = filteredRecords.filter((r) => r.status === 'Pending');
  const approvedRecords = filteredRecords.filter((r) => r.status === 'Approved');

  const currentList =
    activeTab === 'quotation'
      ? quotations
      : activeTab === 'invoice'
        ? invoices
        : activeTab === 'pending'
          ? pendingRecords
          : approvedRecords;

  // ============================================================
  // CHART DATA
  // ============================================================
  const chartData = useMemo(() => {
    const today = startOfDay(new Date());
    const approved = chartRecords
      .filter((r) => r.status === 'Approved')
      .map((r) => ({ date: parseDate(r.invoiceDate), total: r.total }))
      .filter((r): r is { date: Date; total: number } => r.date !== null);

    const sumRange = (start: Date, end: Date): number =>
      approved
        .filter((r) => r.date >= start && r.date <= end)
        .reduce((s, r) => s + r.total, 0);

    const sumMonth = (y: number, m: number): number =>
      approved
        .filter((r) => r.date.getFullYear() === y && r.date.getMonth() === m)
        .reduce((s, r) => s + r.total, 0);

    const buckets: { label: string; value: number }[] = [];
    const range = appliedSearch.timeRange;

    if (range === '7d') {
      for (let i = 6; i >= 0; i--) {
        const d = addDays(today, -i);
        buckets.push({
          label: d.toLocaleDateString('en-US', { weekday: 'short' }),
          value: sumRange(d, d),
        });
      }
    } else if (range === '30d' || range === '3m') {
      const count = range === '30d' ? 10 : 13;
      const step = range === '30d' ? 3 : 7;
      for (let b = 0; b < count; b++) {
        const end = addDays(today, -(count - 1 - b) * step);
        const start = addDays(end, -(step - 1));
        buckets.push({
          label: start.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
          value: sumRange(start, end),
        });
      }
    } else if (range === '6m' || range === '1y') {
      const months = range === '6m' ? 6 : 12;
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        buckets.push({
          label: d.toLocaleDateString('en-US', { month: 'short' }),
          value: sumMonth(d.getFullYear(), d.getMonth()),
        });
      }
    } else {
      if (approved.length === 0) return [{ label: '—', value: 0 }];
      const times = approved.map((r) => r.date.getTime());
      const earliest = new Date(Math.min(...times));
      const latest = new Date(Math.max(...times));
      const cursor = new Date(earliest.getFullYear(), earliest.getMonth(), 1);
      const endCursor = new Date(latest.getFullYear(), latest.getMonth(), 1);
      while (cursor <= endCursor) {
        buckets.push({
          label: cursor.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          value: sumMonth(cursor.getFullYear(), cursor.getMonth()),
        });
        cursor.setMonth(cursor.getMonth() + 1);
      }
    }
    return buckets;
  }, [chartRecords, appliedSearch.timeRange]);

  const totalRevenue = useMemo(
    () => chartData.reduce((sum, b) => sum + b.value, 0),
    [chartData]
  );

  // ============================================================
  // HANDLERS
  // ============================================================
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

  const handleDeleteRecord = (id: string): void => {
    const updated = records.filter((r) => r.id !== id);
    saveRecords(updated);
    setRecords(updated);
  };

  const sendRecord = (record: SalesRecord): void => {
    const phone = record.phone.replace(/\D/g, '');
    const paid = record.paymentMethod ? `\nPaid via: ${record.paymentMethod}` : '';
    const msg = `Hello ${record.customerName},\n\nRegarding ${record.recordNo}\nTotal: ${formatPrice(record.total)}${paid}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const switchTab = (tab: TabKey): void => {
    setActiveTab(tab);
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
            <span>Approve</span>
          </button>
        )}
        {/* Return: SIRF approved invoice par (material wapis => invoice se minus) */}
        {isInvoice && record.status === 'Approved' && record.items.length > 0 && (
          <button
            onClick={() => openReturn(record)}
            className={`${btn} bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-500 hover:text-white`}
          >
            {Icons.undo}
            <span>Return</span>
          </button>
        )}
        {/* Reject: quotation + invoice dono */}
        {record.status !== 'Rejected' && (
          <button
            onClick={() => handleReject(record.id)}
            className={`${btn} bg-red-50 text-red-700 border border-red-200 hover:bg-red-500 hover:text-white`}
          >
            {Icons.x}
            <span>Reject</span>
          </button>
        )}
        {/* Send: SIRF invoice par */}
        {isInvoice && record.status !== 'Rejected' && (
          <button
            onClick={() => sendRecord(record)}
            className={`${btn} bg-green-500 text-white hover:bg-green-600`}
          >
            {Icons.whatsapp}
            <span>Send</span>
          </button>
        )}
      </div>
    );
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-primary p-6 lg:p-8">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">Sales Records</h1>
        <p className="text-supporting mt-1.5 text-sm">
          Track, filter, and analyze all quotations & invoices
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-3xl border border-supporting/10 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
          {/* Time Range */}
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-dark mb-1.5 uppercase tracking-wider">
              Time Range
            </label>
            <div className="flex gap-1 bg-primary rounded-full p-1">
              {(['7d', '30d', '3m', '6m', '1y', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`flex-1 px-2 py-1.5 rounded-full text-[10px] font-bold cursor-pointer transition-all duration-200 ${
                    timeRange === range
                      ? 'bg-secondary text-primary shadow-sm'
                      : 'text-supporting hover:text-dark hover:bg-white'
                  }`}
                >
                  {range === 'all' ? 'All' : range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Number Search */}
          <div className="lg:w-72">
            <label className="block text-[10px] font-bold text-dark mb-1.5 uppercase tracking-wider">
              Customer Number / ID
            </label>
            <div className="relative">
              <span className="absolute top-1/2 -translate-y-1/2 start-4 text-supporting pointer-events-none">
                {Icons.search}
              </span>
              <input
                type="text"
                value={customerNumber}
                onChange={(e) => setCustomerNumber(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                placeholder="e.g. C-1042 or +96650..."
                className="w-full h-10 ps-10 pe-4 rounded-full border-2 border-supporting/20 bg-primary/30 text-dark text-sm placeholder:text-supporting/40 focus:outline-none focus:border-secondary focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="h-10 px-5 bg-secondary text-primary text-sm font-bold cursor-pointer rounded-full transition-all duration-300 hover:shadow-md flex items-center gap-2"
            >
              {Icons.search}
              <span>Search</span>
            </button>
            <button
              onClick={handleClear}
              className="h-10 px-4 bg-primary text-supporting text-sm font-bold cursor-pointer rounded-full border-2 border-supporting/20 hover:bg-white hover:text-dark transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* CHART */}
      <div className="bg-white rounded-3xl p-6 border border-supporting/10 mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="text-base font-bold text-dark">Sales Trend</h2>
            <p className="text-supporting text-xs mt-1">
              Approved sales revenue — <span className="font-semibold text-dark">{chartSubtitle}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-supporting uppercase tracking-wider font-bold">
              Total Revenue
            </p>
            <p className="text-xl font-bold text-secondary">
              {formatPrice(totalRevenue)}
            </p>
          </div>
        </div>
        {chartData.some((b) => b.value > 0) ? (
          <LineChart data={chartData} formatValue={formatPrice} />
        ) : (
          <div className="py-16 text-center text-supporting text-sm">
            Is period mein koi Approved sale nahi mili — filters change karke dekhein
          </div>
        )}
      </div>

      {/* TABS */}
      <div className="bg-white rounded-[2rem] border border-supporting/10 p-2 mb-4 flex flex-wrap gap-2">
        {/* Quotation */}
        <button
          onClick={() => switchTab('quotation')}
          className={`flex-1 min-w-[120px] py-2.5 rounded-full text-sm font-bold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'quotation'
              ? 'bg-blue-500 text-white shadow-md'
              : 'text-supporting hover:bg-primary'
          }`}
        >
          {Icons.quotation}
          <span>Quotations</span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              activeTab === 'quotation' ? 'bg-white/20' : 'bg-supporting/10'
            }`}
          >
            {quotations.length}
          </span>
        </button>

        {/* Invoice */}
        <button
          onClick={() => switchTab('invoice')}
          className={`flex-1 min-w-[120px] py-2.5 rounded-full text-sm font-bold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'invoice'
              ? 'bg-accent text-white shadow-md'
              : 'text-supporting hover:bg-primary'
          }`}
        >
          {Icons.invoice}
          <span>Invoices</span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              activeTab === 'invoice' ? 'bg-white/20' : 'bg-supporting/10'
            }`}
          >
            {invoices.length}
          </span>
        </button>

        {/* Pending */}
        <button
          onClick={() => switchTab('pending')}
          className={`flex-1 min-w-[120px] py-2.5 rounded-full text-sm font-bold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-amber-500 text-white shadow-md'
              : 'text-supporting hover:bg-primary'
          }`}
        >
          {Icons.clock}
          <span>Pending</span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              activeTab === 'pending' ? 'bg-white/20' : 'bg-supporting/10'
            }`}
          >
            {pendingRecords.length}
          </span>
        </button>

        {/* Approved */}
        <button
          onClick={() => switchTab('approved')}
          className={`flex-1 min-w-[120px] py-2.5 rounded-full text-sm font-bold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'approved'
              ? 'bg-green-600 text-white shadow-md'
              : 'text-supporting hover:bg-primary'
          }`}
        >
          {Icons.check}
          <span>Approved</span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              activeTab === 'approved' ? 'bg-white/20' : 'bg-supporting/10'
            }`}
          >
            {approvedRecords.length}
          </span>
        </button>
      </div>

      {/* RECORDS TABLE */}
      <div className="bg-white rounded-3xl border border-supporting/10 overflow-hidden">
        <div
          className={`px-5 py-3 border-b border-supporting/10 ${
            activeTab === 'quotation'
              ? 'bg-blue-50'
              : activeTab === 'invoice'
                ? 'bg-amber-50'
                : activeTab === 'pending'
                  ? 'bg-yellow-50'
                  : 'bg-green-50'
          }`}
        >
          <h2
            className={`text-sm font-bold ${
              activeTab === 'quotation'
                ? 'text-blue-700'
                : activeTab === 'invoice'
                  ? 'text-amber-700'
                  : activeTab === 'pending'
                    ? 'text-yellow-700'
                    : 'text-green-700'
            }`}
          >
            {activeTab === 'quotation'
              ? 'Quotations'
              : activeTab === 'invoice'
                ? 'Invoices'
                : activeTab === 'pending'
                  ? 'Pending'
                  : 'Approved'}{' '}
            <span className="text-xs font-normal">({currentList.length})</span>
          </h2>
        </div>

        {currentList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-supporting/10 bg-primary/20">
                  <th className="text-left text-[10px] font-bold text-supporting uppercase tracking-wider px-4 py-2.5">
                    No.
                  </th>
                  <th className="text-left text-[10px] font-bold text-supporting uppercase tracking-wider px-4 py-2.5">
                    Customer
                  </th>
                  <th className="text-left text-[10px] font-bold text-supporting uppercase tracking-wider px-4 py-2.5">
                    Date
                  </th>
                  <th className="text-left text-[10px] font-bold text-supporting uppercase tracking-wider px-4 py-2.5">
                    Invoice / Amount
                  </th>
                  <th className="text-center text-[10px] font-bold text-supporting uppercase tracking-wider px-4 py-2.5">
                    Status
                  </th>
                  <th className="text-right text-[10px] font-bold text-supporting uppercase tracking-wider px-4 py-2.5">
                    Actions
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
                          {isQuotation ? <>Quotation</> : <>Invoice</>}
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
                            <span>Preview</span>
                          </button>
                          <span className="text-sm font-bold text-secondary whitespace-nowrap">
                            {formatPrice(record.total)}
                          </span>
                        </div>
                        {record.returns && record.returns.length > 0 && (
                          <p className="text-[10px] font-bold text-amber-700 mt-1">
                            Returned: -{formatPrice(record.returns.reduce((s, x) => s + x.amount, 0))}
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
            <p className="text-sm text-supporting">No records yet</p>
            <p className="text-xs text-supporting mt-2">
              Try changing filters or search
            </p>
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
                    <>Quotation Preview</>
                  ) : (
                    <>Invoice Preview</>
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
                  Customer
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
                  Details
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
                      Material
                    </th>
                    <th className="text-center text-[10px] font-bold text-supporting uppercase tracking-wider px-3 py-2">
                      Qty
                    </th>
                    <th className="text-right text-[10px] font-bold text-supporting uppercase tracking-wider px-3 py-2">
                      Price
                    </th>
                    <th className="text-center text-[10px] font-bold text-supporting uppercase tracking-wider px-3 py-2">
                      Disc
                    </th>
                    <th className="text-right text-[10px] font-bold text-supporting uppercase tracking-wider px-4 py-2">
                      Total
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
                <span className="font-bold text-dark">Amount:</span>
                <span className="text-lg font-bold text-secondary">{formatPrice(previewRecord.total)}</span>
              </div>
            </div>

            {previewRecord.status === 'Approved' && previewRecord.paymentMethod && (
              <div className="mb-5 px-4 py-2.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-bold flex items-center gap-2">
                {Icons.check}
                <span>
                  Paid via: {previewRecord.paymentMethod}
                </span>
              </div>
            )}

            {previewRecord.returns && previewRecord.returns.length > 0 && (
              <div className="mb-5 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <p className="font-bold mb-1.5">Returned material</p>
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
                <span>Delete</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewId(null)}
                  className="px-4 py-2 rounded-full bg-primary text-supporting border border-supporting/20 text-xs font-bold cursor-pointer hover:bg-white hover:text-dark transition"
                >
                  Close
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
              Return Material
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
                      Qty: {item.quantity} × {formatPrice(item.price)}
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
                <span className="text-supporting">Refund:</span>
                <span className="font-bold text-red-600">-{formatPrice(returnRefund)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-supporting">New Total:</span>
                <span className="font-bold text-secondary">{formatPrice(returnPreview.total)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={closeReturn}
                className="flex-1 h-10 rounded-full bg-primary text-supporting border-2 border-supporting/20 text-sm font-bold cursor-pointer hover:bg-white hover:text-dark transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmReturn}
                disabled={returnRefund <= 0}
                className="flex-1 h-10 rounded-full bg-amber-500 text-white text-sm font-bold cursor-pointer hover:bg-amber-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirm Return
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
              Select Payment Method
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
                  <span className="flex-1 text-left">{m.label}</span>
                  {payMethod === m.id && Icons.check}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPayPickId(null)}
                className="flex-1 h-10 rounded-full bg-primary text-supporting border-2 border-supporting/20 text-sm font-bold cursor-pointer hover:bg-white hover:text-dark transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmApprove}
                disabled={!payMethod}
                className="flex-1 h-10 rounded-full bg-green-600 text-white text-sm font-bold cursor-pointer hover:bg-green-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}