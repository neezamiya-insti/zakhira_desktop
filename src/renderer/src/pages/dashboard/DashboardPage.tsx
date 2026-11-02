/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable prettier/prettier */
/* eslint-disable react/no-unescaped-entities */
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

// ============================================================
// 🎨 FINAL THEME (UNCHANGED)
// ============================================================
const THEME = {
  warmIvory: '#F7F3EA',
  deepForest: '#123C32',
  mutedOlive: '#66745A',
  charcoal: '#252A28',
  warmBrass: '#C49A5A',
  success: '#15803d',
  successBg: '#dcfce7',
  warning: '#b45309',
  warningBg: '#fef3c7',
  danger: '#b91c1c',
  dangerBg: '#fee2e2',
  partial: '#1e40af',
  partialBg: '#dbeafe',
};

type Language = 'en' | 'ar' | 'ur' | 'hi';

// ============================================================
// 📖 TRANSLATIONS
// ============================================================
const t = {
  en: {
    dashboard: 'Dashboard',
    welcome: 'Welcome back,',
    welcomeSuffix: "— here's what's happening today.",
    newInvoice: 'New Invoice',
    salesThisMonth: 'Sales This Month',
    pendingInvoices: 'Pending Invoices',
    lowStockItems: 'Low Stock Items',
    accountBalance: 'Account Balance',
    salesOverview: 'Sales Overview',
    revenueTrends: 'Revenue trends over time',
    lowStock: 'Low Stock',
    viewAll: 'View all',
    out: 'Out',
    left: 'left',
    placeOrder: 'Place Order',
    recentInvoices: 'Recent Invoices',
    invoice: 'Invoice',
    customer: 'Customer',
    amount: 'Amount',
    status: 'Status',
    recentActivity: 'Recent Activity',
    quickActions: 'Quick Actions',
    jumpToModules: 'Jump to main modules',
    sales: 'Sales',
    inventory: 'Inventory',
    accounting: 'Accounting',
    loggedInAs: 'Logged in as',
    version: 'Zakhira BMS v1.0',
    paid: 'Paid',
    pending: 'Pending',
    partialPayment: 'Partial Payment',
    overdue: 'Overdue',
    totalSales: 'Total Sales',
    netProfit: 'Net Profit',
    receivedAmount: 'Received Amount',
    receivables: 'Receivables',
    inventoryValue: 'Inventory Value',
    supplierPayables: 'Supplier Payables',
    revenueVsExpenses: 'Revenue vs Expenses vs Profit',
    onlineVsOffline: 'Online vs Offline Sales',
    top5Products: 'Top 5 Products',
    alerts: 'Alerts & Actions',
    lowStockAlert: 'Low-stock products',
    outOfStockAlert: 'Out-of-stock products',
    pendingPOsAlert: 'Pending purchase orders',
    supplierDueAlert: 'Supplier payments due',
    noAlerts: 'All clear',
    items: 'items',
    products: 'products',
    orders: 'orders',
    bills: 'bills',
    revenue: 'Revenue',
    expenses: 'Expenses',
    profit: 'Profit',
    online: 'Online',
    offline: 'Offline',
    prodModernSofa: 'Modern Sofa',
    prodCoffeeTable: 'Coffee Table',
    prodFloorLamp: 'Floor Lamp',
    prodWoodenCabinet: 'Wooden Cabinet',
    custAlRajhi: 'Al-Rajhi Construction',
    custModernHomes: 'Modern Homes Co.',
    custBinLaden: 'Bin Laden Contracting',
    custSaudiBuild: 'Saudi Build Est.',
    custAlFaisal: 'Al-Faisal Trading',
    noData: 'No data yet',
  },
  ar: {
    dashboard: 'لوحة التحكم',
    welcome: 'مرحباً بعودتك،',
    welcomeSuffix: '— إليك ما يحدث اليوم.',
    newInvoice: 'فاتورة جديدة',
    salesThisMonth: 'مبيعات هذا الشهر',
    pendingInvoices: 'الفواتير المعلقة',
    lowStockItems: 'منتجات منخفضة المخزون',
    accountBalance: 'رصيد الحساب',
    salesOverview: 'نظرة عامة على المبيعات',
    revenueTrends: 'اتجاهات الإيرادات عبر الوقت',
    lowStock: 'مخزون منخفض',
    viewAll: 'عرض الكل',
    out: 'نفد',
    left: 'متبقي',
    placeOrder: 'تقديم طلب',
    recentInvoices: 'الفواتير الأخيرة',
    invoice: 'الفاتورة',
    customer: 'العميل',
    amount: 'المبلغ',
    status: 'الحالة',
    recentActivity: 'النشاط الأخير',
    quickActions: 'إجراءات سريعة',
    jumpToModules: 'الانتقال إلى الوحدات الرئيسية',
    sales: 'المبيعات',
    inventory: 'المخزون',
    accounting: 'المحاسبة',
    loggedInAs: 'مسجل الدخول باسم',
    version: 'زخيرة BMS v1.0',
    paid: 'مدفوعة',
    pending: 'معلقة',
    partialPayment: 'مدفوع جزئياً',
    overdue: 'متأخرة',
    totalSales: 'إجمالي المبيعات',
    netProfit: 'صافي الربح',
    receivedAmount: 'المبلغ المستلم',
    receivables: 'المستحقات المدينة',
    inventoryValue: 'قيمة المخزون',
    supplierPayables: 'مستحقات الموردين',
    revenueVsExpenses: 'الإيرادات مقابل المصروفات مقابل الربح',
    onlineVsOffline: 'مبيعات أونلاين مقابل أوفلاين',
    top5Products: 'أفضل 5 منتجات',
    alerts: 'التنبيهات والإجراءات',
    lowStockAlert: 'منتجات منخفضة المخزون',
    outOfStockAlert: 'منتجات نفدت',
    pendingPOsAlert: 'أوامر شراء معلقة',
    supplierDueAlert: 'مدفوعات موردين مستحقة',
    noAlerts: 'كل شيء على ما يرام',
    items: 'عنصر',
    products: 'منتجات',
    orders: 'أوامر',
    bills: 'فواتير',
    revenue: 'الإيراد',
    expenses: 'المصروفات',
    profit: 'الربح',
    online: 'أونلاين',
    offline: 'أوفلاين',
    prodModernSofa: 'أريكة حديثة',
    prodCoffeeTable: 'طاولة قهوة',
    prodFloorLamp: 'مصباح أرضي',
    prodWoodenCabinet: 'خزانة خشبية',
    custAlRajhi: 'الراجحي للإنشاءات',
    custModernHomes: 'شركة منازل حديثة',
    custBinLaden: 'بن لادن للمقاولات',
    custSaudiBuild: 'المؤسسة السعودية للبناء',
    custAlFaisal: 'الفصيل للتجارة',
    noData: 'لا توجد بيانات بعد',
  },
  ur: {
    dashboard: 'ڈیش بورڈ',
    welcome: 'خوش آمدید،',
    welcomeSuffix: '— آج کیا ہو رہا ہے۔',
    newInvoice: 'نئی انوائس',
    salesThisMonth: 'اس ماہ کی فروخت',
    pendingInvoices: 'زیر التواء انوائسز',
    lowStockItems: 'کم اسٹاک اشیاء',
    accountBalance: 'اکاؤنٹ بیلنس',
    salesOverview: 'فروخت کا جائزہ',
    revenueTrends: 'وقت کے ساتھ آمدنی کے رجحانات',
    lowStock: 'کم اسٹاک',
    viewAll: 'سب دیکھیں',
    out: 'ختم',
    left: 'باقی',
    placeOrder: 'آرڈر دیں',
    recentInvoices: 'حالیہ انوائسز',
    invoice: 'انوائس',
    customer: 'کسٹمر',
    amount: 'رقم',
    status: 'حالت',
    recentActivity: 'حالیہ سرگرمی',
    quickActions: 'فوری اقدامات',
    jumpToModules: 'مرکزی ماڈیولز پر جائیں',
    sales: 'فروخت',
    inventory: 'انوینٹری',
    accounting: 'اکاؤنٹنگ',
    loggedInAs: 'لاگ ان بطور',
    version: 'زخیرہ BMS v1.0',
    paid: 'ادا شدہ',
    pending: 'زیر التواء',
    partialPayment: 'جزوی ادائیگی',
    overdue: 'واجب الادا',
    totalSales: 'کل فروخت',
    netProfit: 'خالص منافع',
    receivedAmount: 'موصولہ رقم',
    receivables: 'وصولی',
    inventoryValue: 'انوینٹری ویلیو',
    supplierPayables: 'وینڈر واجبات',
    revenueVsExpenses: 'آمدنی بمقابلہ اخراجات بمقابلہ منافع',
    onlineVsOffline: 'آن لائن بمقابلہ آف لائن فروخت',
    top5Products: 'ٹاپ 5 مصنوعات',
    alerts: 'الرٹس اور اقدامات',
    lowStockAlert: 'کم اسٹاک مصنوعات',
    outOfStockAlert: 'ختم شدہ مصنوعات',
    pendingPOsAlert: 'زیر التواء خریداری آرڈرز',
    supplierDueAlert: 'واجب الادا وینڈر ادائیگیاں',
    noAlerts: 'سب ٹھیک ہے',
    items: 'اشیاء',
    products: 'مصنوعات',
    orders: 'آرڈرز',
    bills: 'بلز',
    revenue: 'آمدنی',
    expenses: 'اخراجات',
    profit: 'منافع',
    online: 'آن لائن',
    offline: 'آف لائن',
    prodModernSofa: 'ماڈرن صوفہ',
    prodCoffeeTable: 'کافی ٹیبل',
    prodFloorLamp: 'فلور لیمپ',
    prodWoodenCabinet: 'لکڑی کی الماری',
    custAlRajhi: 'الراجحی کنسٹرکشن',
    custModernHomes: 'مودرن ہومز کمپنی',
    custBinLaden: 'بن لادن کنٹریکٹنگ',
    custSaudiBuild: 'سعودی بلڈ اسٹیبلشمنٹ',
    custAlFaisal: 'الفصیل ٹریڈنگ',
    noData: 'ابھی کوئی ڈیٹا نہیں',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    welcome: 'वापसी पर स्वागत है,',
    welcomeSuffix: '— आज यहाँ क्या हो रहा है।',
    newInvoice: 'नया इनवॉइस',
    salesThisMonth: 'इस महीने की बिक्री',
    pendingInvoices: 'लंबित इनवॉइस',
    lowStockItems: 'कम स्टॉक आइटम',
    accountBalance: 'खाता शेष',
    salesOverview: 'बिक्री अवलोकन',
    revenueTrends: 'समय के साथ राजस्व रुझान',
    lowStock: 'कम स्टॉक',
    viewAll: 'सभी देखें',
    out: 'खत्म',
    left: 'शेष',
    placeOrder: 'ऑर्डर करें',
    recentInvoices: 'हाल के इनवॉइस',
    invoice: 'इनवॉइस',
    customer: 'ग्राहक',
    amount: 'राशि',
    status: 'स्थिति',
    recentActivity: 'हाल की गतिविधि',
    quickActions: 'त्वरित क्रियाएँ',
    jumpToModules: 'मुख्य मॉड्यूल पर जाएँ',
    sales: 'बिक्री',
    inventory: 'इन्वेंट्री',
    accounting: 'लेखांकन',
    loggedInAs: 'लॉग इन बतौर',
    version: 'ज़खीरा BMS v1.0',
    paid: 'भुगतान हुआ',
    pending: 'लंबित',
    partialPayment: 'आंशिक भुगतान',
    overdue: 'अतिदेय',
    totalSales: 'कुल बिक्री',
    netProfit: 'शुद्ध लाभ',
    receivedAmount: 'प्राप्त राशि',
    receivables: 'प्राप्य',
    inventoryValue: 'इन्वेंट्री मूल्य',
    supplierPayables: 'विक्रेता देय',
    revenueVsExpenses: 'राजस्व बनाम खर्च बनाम लाभ',
    onlineVsOffline: 'ऑनलाइन बनाम ऑफ़लाइन बिक्री',
    top5Products: 'टॉप 5 उत्पाद',
    alerts: 'अलर्ट और क्रियाएँ',
    lowStockAlert: 'कम स्टॉक उत्पाद',
    outOfStockAlert: 'स्टॉक से बाहर उत्पाद',
    pendingPOsAlert: 'लंबित खरीद आदेश',
    supplierDueAlert: 'विक्रेता देय भुगतान',
    noAlerts: 'सब ठीक है',
    items: 'आइटम',
    products: 'उत्पाद',
    orders: 'ऑर्डर',
    bills: 'बिल',
    revenue: 'राजस्व',
    expenses: 'खर्च',
    profit: 'लाभ',
    online: 'ऑनलाइन',
    offline: 'ऑफ़लाइन',
    prodModernSofa: 'आधुनिक सोफा',
    prodCoffeeTable: 'कॉफी टेबल',
    prodFloorLamp: 'फ्लोर लैंप',
    prodWoodenCabinet: 'लकड़ी की अलमारी',
    custAlRajhi: 'अल-राजही कंस्ट्रक्शन',
    custModernHomes: 'मॉडर्न होम्स कंपनी',
    custBinLaden: 'बिन लादेन कॉन्ट्रैक्टिंग',
    custSaudiBuild: 'सऊदी बिल्ड एस्टेब्लिशमेंट',
    custAlFaisal: 'अल-फैसल ट्रेडिंग',
    noData: 'अभी कोई डेटा नहीं',
  },
} as const;

// ============================================================
// SVG ICONS
// ============================================================
const Icons = {
  money: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  invoice: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  ),
  alert: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  ),
  bank: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M3 21h18M4 10h16M5 10V21M19 10V21M8 10v11M16 10v11M12 3 2 10h20L12 3z" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  arrowUp: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  ),
  arrowDown: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  ),
  arrowRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
  package: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.3 7 12 12l8.7-5M12 22V12" />
    </svg>
  ),
  creditCard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  ),
  box: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.3 7 12 12l8.7-5M12 22V12" />
    </svg>
  ),
  document: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  ),
  sales: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  inventory: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.3 7 12 12l8.7-5M12 22V12" />
    </svg>
  ),
  accounting: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8M8 10h8M8 14h4M8 18h8" />
    </svg>
  ),
};

// ============================================================
// TYPES
// ============================================================
type Transaction = {
  id: string;
  transactionNo: string;
  date: string;
  customerName: string;
  companyName: string;
  invoiceRef: string;
  type: 'In' | 'Out' | 'Return';
  amount: number;
  status: 'Paid' | 'Partially Paid' | 'Pending' | 'Returned';
  mode: string;
  createdAt: string;
  sourceDocumentId?: string;
};

type SalesDocLine = {
  id: string;
  material?: string;
  quantity?: number;
  unitPrice?: number;
  lineTotal?: number;
  costPrice?: number;
  category?: string;
};

type SalesDocument = {
  id: string;
  documentType?: string;
  orderNumber: string;
  status?: string;
  issueDate?: string;
  createdAt?: string;
  subtotal?: number;
  taxTotal?: number;
  grandTotal?: number;
  salesChannel?: 'Online' | 'Offline' | string;
  customerSnapshot?: { name?: string; company?: string };
  lines?: SalesDocLine[];
};

type ExpenseRecord = {
  id: string;
  date: string;
  category: string;
  amount: number;
};

type InventoryProduct = {
  id: string;
  name: string;
  sku?: string;
  stock?: number;
  quantity?: number;
  onHand?: number;
  reorderLevel?: number;
  reorderThreshold?: number;
  cost?: number;
  purchasePrice?: number;
  unitCost?: number;
  active?: boolean;
};

type PurchaseOrder = {
  id: string;
  orderNumber?: string;
  status?: string;
  remainingQty?: number;
  total?: number;
  dueDate?: string;
  createdAt?: string;
};

type StatCard = {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  bg: string;
  path: string;
};

type RecentInvoice = {
  id: string;
  customer: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Partial Payment' | 'Overdue';
};

type LowStockProduct = {
  id: string;
  name: string;
  sku: string;
  stock: number;
};

type Activity = {
  id: string;
  type: 'sale' | 'purchase' | 'payment' | 'stock';
  message: string;
  time: string;
};

type MonthlyBucket = {
  key: string;
  label: string;
  revenue: number;
  expenses: number;
  profit: number;
};

// ============================================================
// STORAGE KEYS
// ============================================================
const TXN_KEY = 'zakhira_transactions';
const DOCS_KEY = 'zakhira_sales_documents';
const EXP_KEY = 'zakhira_expenses';
const INV_KEY = 'zakhira_inventory_products';
const PO_KEY = 'zakhira_purchase_orders';

// ============================================================
// HELPERS
// ============================================================
const loadJSON = <T,>(key: string): T[] => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const fmt = (n: number): string => {
  const abs = Math.abs(n);
  return `${n < 0 ? '-' : ''}${abs.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const formatShortMonth = (key: string): string => {
  const [y, m] = key.split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
};

const getMonthKey = (iso: string): string | null => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const isReturn = (t: Transaction): boolean =>
  t.type === 'Return' || (t.type === 'Out' && t.status === 'Returned');

const receivedAmount = (t: Transaction): number =>
  t.status === 'Paid' ? t.amount : 0;

const dueAmount = (t: Transaction): number =>
  t.status === 'Paid' || t.status === 'Returned' ? 0 : t.amount;

// ============================================================
// CHART HELPERS
// ============================================================
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

const EmptyChart = ({ height }: { height: number }): React.JSX.Element => (
  <div
    className="flex items-center justify-center"
    style={{ height, color: THEME.mutedOlive, fontSize: 11 }}
  >
    —
  </div>
);

// ============================================================
// BAR-LINE CHART (Revenue + Expenses bars, Profit line, dual axis)
// ============================================================
const BarLineChart = ({
  data,
}: {
  data: MonthlyBucket[];
}): React.JSX.Element => {
  if (data.length === 0) return <EmptyChart height={220} />;

  const W = 600;
  const H = 260;
  const pad = { top: 15, right: 50, bottom: 30, left: 50 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;

  const leftMax = niceMax(
    Math.max(...data.map((d) => Math.max(d.revenue, d.expenses)), 0)
  );
  const rMaxRaw = Math.max(...data.map((d) => d.profit), 0);
  const rMinRaw = Math.min(...data.map((d) => d.profit), 0);
  const rMax = rMaxRaw > 0 ? niceMax(rMaxRaw) : 0;
  const rMin = rMinRaw < 0 ? -niceMax(-rMinRaw) : 0;
  const rTop = rMax === rMin ? 1 : rMax;

  const groupW = iW / data.length;
  const barW = Math.min(groupW * 0.3, 28);
  const xC = (i: number) => pad.left + groupW * i + groupW / 2;
  const yL = (v: number) => pad.top + iH - (Math.max(0, v) / leftMax) * iH;
  const hL = (v: number) => (Math.max(0, v) / leftMax) * iH;
  const yR = (v: number) => pad.top + iH - ((v - rMin) / (rTop - rMin)) * iH;

  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const linePath = data
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
              strokeWidth="1"
            />
            <text
              x={pad.left - 8}
              y={y + 3}
              textAnchor="end"
              fontSize="10"
              fill={THEME.charcoal}
            >
              {compact(leftMax * r)}
            </text>
            <text
              x={W - pad.right + 8}
              y={y + 3}
              textAnchor="start"
              fontSize="10"
              fill={THEME.charcoal}
            >
              {compact(rMin + (rTop - rMin) * r)}
            </text>
          </g>
        );
      })}

      {data.map((_, i) => (
        <line
          key={`v-${i}`}
          x1={pad.left + groupW * i}
          x2={pad.left + groupW * i}
          y1={pad.top}
          y2={pad.top + iH}
          stroke={THEME.mutedOlive}
          strokeOpacity="0.2"
          strokeWidth="1"
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
        strokeWidth="1"
      />

      {data.map((b, i) => (
        <g key={b.key}>
          <rect
            x={xC(i) - barW - 1}
            y={yL(b.revenue)}
            width={barW}
            height={hL(b.revenue)}
            fill={THEME.deepForest}
          >
            <title>{`${b.label} — Revenue: ${fmt(b.revenue)}`}</title>
          </rect>
          <rect
            x={xC(i) + 1}
            y={yL(b.expenses)}
            width={barW}
            height={hL(b.expenses)}
            fill={THEME.danger}
          >
            <title>{`${b.label} — Expenses: ${fmt(b.expenses)}`}</title>
          </rect>
        </g>
      ))}

      <path
        d={linePath}
        fill="none"
        stroke={THEME.warmBrass}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((b, i) => (
        <g key={`p-${b.key}`}>
          <circle
            cx={xC(i)}
            cy={yR(b.profit)}
            r={3.5}
            fill={THEME.warmBrass}
            stroke="#FFFFFF"
            strokeWidth={1.5}
          >
            <title>{`${b.label} — Profit: ${fmt(b.profit)}`}</title>
          </circle>
          <text
            x={xC(i)}
            y={H - 10}
            textAnchor="middle"
            fontSize="10"
            fill={THEME.charcoal}
          >
            {b.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

// ============================================================
// PIE CHART (Online vs Offline)
// ============================================================
const PieChart = ({
  slices,
}: {
  slices: { label: string; value: number; color: string }[];
}): React.JSX.Element => {
  const total = slices.reduce((s, x) => s + x.value, 0);
  if (total <= 0) return <EmptyChart height={180} />;

  const cx = 100;
  const cy = 100;
  const r = 88;
  const visible = slices.filter((s) => s.value > 0);

  const parts = visible.map((s, idx) => {
      const frac = s.value / total;
      const before = visible
        .slice(0, idx)
        .reduce((sum, x) => sum + x.value / total, 0);
      const start = -Math.PI / 2 + before * 2 * Math.PI;
      const end = start + frac * 2 * Math.PI;
      const mid = (start + end) / 2;
      const x1 = cx + r * Math.cos(start);
      const y1 = cy + r * Math.sin(start);
      const x2 = cx + r * Math.cos(end);
      const y2 = cy + r * Math.sin(end);
      const large = frac > 0.5 ? 1 : 0;
      return {
        ...s,
        pct: Math.round(frac * 100),
        path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`,
        lx: cx + r * 0.6 * Math.cos(mid),
        ly: cy + r * 0.6 * Math.sin(mid),
      };
    });

  return (
    <svg viewBox="0 0 200 200" className="w-full h-auto max-w-[200px] mx-auto">
      <circle cx={cx} cy={cy} r={r + 6} fill={THEME.warmIvory} />
      {parts.length === 1 ? (
        <circle cx={cx} cy={cy} r={r} fill={parts[0].color} />
      ) : (
        parts.map((p) => (
          <path
            key={p.label}
            d={p.path}
            fill={p.color}
            stroke={THEME.warmIvory}
            strokeWidth={2}
          >
            <title>{`${p.label}: ${fmt(p.value)}`}</title>
          </path>
        ))
      )}
      {parts.map((p) => (
        <text
          key={`t-${p.label}`}
          x={parts.length === 1 ? cx : p.lx}
          y={parts.length === 1 ? cy : p.ly}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fontWeight="700"
          fill="#FFFFFF"
        >
          {p.pct}%
        </text>
      ))}
    </svg>
  );
};

// ============================================================
// VERTICAL BAR CHART (Top 5 Products, value on top of bars)
// 🔧 Only change: thinner bars (barW). Colors/fill/corners/grid = original.
// ============================================================
const BarChart = ({
  data,
}: {
  data: { name: string; value: number }[];
}): React.JSX.Element => {
  if (data.length === 0) return <EmptyChart height={180} />;

  const colors = [
    THEME.deepForest,
    THEME.warmBrass,
    THEME.mutedOlive,
    THEME.charcoal,
    THEME.success,
  ];
  const W = 500;
  const H = 230;
  const pad = { top: 25, right: 10, bottom: 35, left: 40 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;
  const maxV = niceMax(Math.max(...data.map((d) => d.value), 0));
  const groupW = iW / data.length;
  // 🔽 thinner bars — was Math.min(groupW * 0.5, 60)
  const barW = Math.min(groupW * 0.28, 34);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
    >
      {[0, 0.25, 0.5, 0.75, 1].map((r) => {
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
              strokeWidth="1"
            />
            <text
              x={pad.left - 6}
              y={y + 3}
              textAnchor="end"
              fontSize="10"
              fill={THEME.mutedOlive}
            >
              {compact(maxV * r)}
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const h = (d.value / maxV) * iH;
        const x = pad.left + groupW * i + (groupW - barW) / 2;
        const y = pad.top + iH - h;
        const label = d.name.length > 12 ? `${d.name.slice(0, 11)}…` : d.name;
        return (
          <g key={d.name}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={2}
              fill={colors[i % colors.length]}
            >
              <title>{`${d.name}: ${d.value}`}</title>
            </rect>
            <text
              x={x + barW / 2}
              y={y - 6}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill={THEME.charcoal}
            >
              {d.value}
            </text>
            <text
              x={x + barW / 2}
              y={H - 14}
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
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function DashboardPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);

  const user = JSON.parse(localStorage.getItem('zakhira_user') || '{}');
  const userName = user.email ? user.email.split('@')[0] : 'Owner';
  const userRole = user.role || 'owner';

  const [language, setLanguage] = useState<Language>(
    (user.language as Language) || 'en'
  );

  useEffect(() => {
    const sync = () => {
      const u = JSON.parse(localStorage.getItem('zakhira_user') || '{}');
      if (u.language) setLanguage(u.language as Language);
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  useEffect(() => {
    const reload = () => setTick((v) => v + 1);
    window.addEventListener('focus', reload);
    window.addEventListener('zakhira:sales-updated', reload as EventListener);
    return () => {
      window.removeEventListener('focus', reload);
      window.removeEventListener(
        'zakhira:sales-updated',
        reload as EventListener
      );
    };
  }, []);

  const tr = t[language];

  const data = useMemo(() => {
    const transactions = loadJSON<Transaction>(TXN_KEY);
    const documents = loadJSON<SalesDocument>(DOCS_KEY);
    const expenses = loadJSON<ExpenseRecord>(EXP_KEY);
    const products = loadJSON<InventoryProduct>(INV_KEY);
    const pos = loadJSON<PurchaseOrder>(PO_KEY);

    // --------------------------
    // 6 Cards (Section 8)
    // --------------------------
    const ins = transactions.filter((x) => x.type === 'In');
    const returns = transactions.filter(isReturn);
    const outs = transactions.filter(
      (x) => x.type === 'Out' && x.status !== 'Returned'
    );

    const totalSales =
      ins.reduce((s, t) => s + t.amount, 0) -
      returns.reduce((s, t) => s + t.amount, 0);

    let cogs = 0;
    for (const d of documents) {
      for (const l of d.lines || []) {
        const q = Number(l.quantity || 0);
        const c = Number(l.costPrice || 0);
        if (q > 0 && c > 0) cogs += q * c;
      }
    }
    if (cogs === 0 && totalSales > 0) cogs = totalSales * 0.6;

    const otherExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const netProfit = totalSales - cogs - otherExpenses;

    const receivedAmountTotal = ins.reduce((s, t) => s + receivedAmount(t), 0);
    const receivables = ins.reduce((s, t) => s + dueAmount(t), 0);
    const supplierPayables = outs.reduce((s, t) => s + dueAmount(t), 0);

    let inventoryValue = 0;
    for (const p of products) {
      const qty = Number(p.onHand ?? p.stock ?? p.quantity ?? 0);
      const cost = Number(p.unitCost ?? p.cost ?? p.purchasePrice ?? 0);
      if (qty > 0 && cost > 0) inventoryValue += qty * cost;
    }

    const cashOutflow =
      outs.reduce((s, t) => s + t.amount, 0) + otherExpenses;
    const accountBalance = receivedAmountTotal - cashOutflow;

    // --------------------------
    // Alerts (Section 8.2)
    // --------------------------
    const lowStock = products.filter((p) => {
      const qty = Number(p.onHand ?? p.stock ?? p.quantity ?? 0);
      const th = Number(p.reorderThreshold ?? p.reorderLevel ?? 5);
      return p.active !== false && qty > 0 && qty <= th;
    });
    const outOfStock = products.filter((p) => {
      const qty = Number(p.onHand ?? p.stock ?? p.quantity ?? 0);
      return p.active !== false && qty <= 0;
    });
    const pendingPOs = pos.filter(
      (po) => po.status === 'Approved' && Number(po.remainingQty || 0) > 0
    );
    const now = new Date();
    const alertWindow = new Date();
    alertWindow.setDate(now.getDate() + 7);
    const supplierDue = outs.filter((t) => {
      const d = new Date(t.date);
      return dueAmount(t) > 0 && d <= alertWindow;
    });

    // --------------------------
    // Recent Invoices — with Partial Payment status
    // --------------------------
    const recentInvoices: RecentInvoice[] = [...ins]
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, 5)
      .map((t) => {
        let status: 'Paid' | 'Pending' | 'Partial Payment' | 'Overdue' = 'Paid';
        if (t.status === 'Partially Paid') {
          const days = Math.floor(
            (Date.now() - new Date(t.date).getTime()) / (1000 * 60 * 60 * 24)
          );
          status = days > 30 ? 'Overdue' : 'Partial Payment';
        } else if (t.status === 'Pending') {
          const days = Math.floor(
            (Date.now() - new Date(t.date).getTime()) / (1000 * 60 * 60 * 24)
          );
          status = days > 30 ? 'Overdue' : 'Pending';
        } else if (t.status === 'Returned') {
          status = 'Pending';
        }
        return {
          id: t.invoiceRef || t.transactionNo,
          customer: t.customerName || t.companyName || '—',
          amount: t.amount,
          status,
        };
      });

    // --------------------------
    // Recent Activity
    // --------------------------
    const activitySource = [...transactions]
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.date).getTime() -
          new Date(a.createdAt || a.date).getTime()
      )
      .slice(0, 5);

    const activities: Activity[] = activitySource.map((t) => {
      const type: Activity['type'] =
        t.type === 'In' ? 'sale' : t.type === 'Out' ? 'purchase' : 'payment';
      const when = new Date(t.createdAt || t.date);
      const diffMs = Date.now() - when.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      let time = '';
      if (diffMin < 60) time = `${diffMin} min`;
      else if (diffMin < 1440) time = `${Math.floor(diffMin / 60)} hr`;
      else time = `${Math.floor(diffMin / 1440)} d`;
      return {
        id: t.id,
        type,
        message:
          t.type === 'In'
            ? `${t.invoiceRef || t.transactionNo} — ${
                t.customerName || 'Sale'
              } (${fmt(t.amount)})`
            : t.type === 'Out'
              ? `Purchase: ${t.customerName || 'Supplier'} (${fmt(t.amount)})`
              : `Return: ${t.invoiceRef || t.transactionNo} (${fmt(t.amount)})`,
        time,
      };
    });

    // --------------------------
    // Monthly buckets
    // --------------------------
    const bMap = new Map<string, MonthlyBucket>();
    const addB = (iso: string): MonthlyBucket | null => {
      const k = getMonthKey(iso);
      if (!k) return null;
      let b = bMap.get(k);
      if (!b) {
        b = {
          key: k,
          label: formatShortMonth(k),
          revenue: 0,
          expenses: 0,
          profit: 0,
        };
        bMap.set(k, b);
      }
      return b;
    };
    for (const t of transactions) {
      const b = addB(t.date);
      if (!b) continue;
      if (t.type === 'In') b.revenue += t.amount;
      else if (t.type === 'Return') b.revenue -= t.amount;
      else if (t.type === 'Out' && t.status !== 'Returned')
        b.expenses += t.amount;
    }
    for (const e of expenses) {
      const b = addB(e.date);
      if (!b) continue;
      b.expenses += e.amount;
    }
    bMap.forEach((b) => {
      b.profit = b.revenue - b.expenses;
    });
    const monthly = Array.from(bMap.values())
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6);

    // --------------------------
    // Online vs Offline
    // --------------------------
    let onlineSales = 0;
    let offlineSales = 0;
    for (const t of ins) {
      const doc = documents.find(
        (d) => d.orderNumber === t.invoiceRef || d.id === t.sourceDocumentId
      );
      const channel = (doc?.salesChannel || '').toLowerCase();
      if (channel === 'online') onlineSales += t.amount;
      else offlineSales += t.amount;
    }
    const hasChannelData = onlineSales + offlineSales > 0;

    // --------------------------
    // Top 5 products
    // --------------------------
    const productMap = new Map<string, { qty: number; revenue: number }>();
    for (const d of documents) {
      for (const l of d.lines || []) {
        const name = l.material || 'Unknown';
        const q = Number(l.quantity || 0);
        const r = Number(l.lineTotal || 0);
        const cur = productMap.get(name) || { qty: 0, revenue: 0 };
        cur.qty += q;
        cur.revenue += r;
        productMap.set(name, cur);
      }
    }
    const top5 = Array.from(productMap.entries())
      .map(([name, v]) => ({ name, qty: v.qty, revenue: v.revenue }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // --------------------------
    // Low stock display
    // --------------------------
    const lowStockDisplay: LowStockProduct[] = lowStock.slice(0, 4).map((p) => ({
      id: p.id,
      name: p.name || '—',
      sku: p.sku || '—',
      stock: Number(p.onHand ?? p.stock ?? p.quantity ?? 0),
    }));

    const pendingInvoicesCount = ins.filter(
      (t) => t.status === 'Pending' || t.status === 'Partially Paid'
    ).length;

    return {
      totalSales,
      netProfit,
      receivedAmountTotal,
      receivables,
      inventoryValue,
      supplierPayables,
      accountBalance,
      lowStock,
      outOfStock,
      pendingPOs,
      supplierDue,
      recentInvoices,
      activities,
      monthly,
      onlineSales,
      offlineSales,
      hasChannelData,
      top5,
      lowStockDisplay,
      pendingInvoicesCount,
    };
  }, [tick]);

  const formatCurrency = (n: number): string => fmt(n);

  const getStatusStyle = (status: string): { bg: string; color: string } => {
    switch (status) {
      case 'Paid':
        return { bg: THEME.successBg, color: THEME.success };
      case 'Pending':
        return { bg: THEME.warningBg, color: THEME.warning };
      case 'Partial Payment':
        return { bg: THEME.partialBg, color: THEME.partial };
      case 'Overdue':
        return { bg: THEME.dangerBg, color: THEME.danger };
      default:
        return { bg: '#f3f4f6', color: '#4b5563' };
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'Paid':
        return tr.paid;
      case 'Pending':
        return tr.pending;
      case 'Partial Payment':
        return tr.partialPayment;
      case 'Overdue':
        return tr.overdue;
      default:
        return status;
    }
  };

  const getActivityIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'sale':
        return Icons.money;
      case 'purchase':
        return Icons.package;
      case 'payment':
        return Icons.creditCard;
      case 'stock':
        return Icons.alert;
      default:
        return Icons.document;
    }
  };

  const STATS: StatCard[] = [
    {
      id: 'sales',
      label: tr.totalSales,
      value: fmt(data.totalSales),
      change: '',
      trend: 'up',
      icon: Icons.money,
      bg: THEME.deepForest,
      path: '/accounting',
    },
    {
      id: 'profit',
      label: tr.netProfit,
      value: fmt(data.netProfit),
      change: '',
      trend: data.netProfit >= 0 ? 'up' : 'down',
      icon: Icons.money,
      bg: THEME.warmBrass,
      path: '/accounting',
    },
    {
      id: 'received',
      label: tr.receivedAmount,
      value: fmt(data.receivedAmountTotal),
      change: '',
      trend: 'up',
      icon: Icons.creditCard,
      bg: THEME.mutedOlive,
      path: '/accounting',
    },
    {
      id: 'receivables',
      label: tr.receivables,
      value: fmt(data.receivables),
      change: '',
      trend: 'down',
      icon: Icons.invoice,
      bg: THEME.charcoal,
      path: '/accounting',
    },
    {
      id: 'inventory',
      label: tr.inventoryValue,
      value: fmt(data.inventoryValue),
      change: '',
      trend: 'up',
      icon: Icons.package,
      bg: THEME.deepForest,
      path: '/inventory',
    },
    {
      id: 'payables',
      label: tr.supplierPayables,
      value: fmt(data.supplierPayables),
      change: '',
      trend: 'down',
      icon: Icons.box,
      bg: THEME.warmBrass,
      path: '/inventory/orders',
    },
  ];

  const quickActions = [
    { label: tr.sales, path: '/sales', icon: Icons.sales },
    { label: tr.inventory, path: '/inventory', icon: Icons.inventory },
    { label: tr.accounting, path: '/accounting', icon: Icons.accounting },
  ];

  return (
    <div
      className="min-h-screen p-4 lg:p-5"
      style={{ background: THEME.warmIvory }}
    >
      {/* HEADER */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: THEME.deepForest }}>
            {tr.dashboard}
          </h1>
          <p
            className="mt-1 text-[12px] leading-relaxed"
            style={{ color: THEME.mutedOlive }}
          >
            {tr.welcome}{' '}
            <span
              className="capitalize font-bold"
              style={{ color: THEME.warmBrass }}
            >
              {userName}
            </span>{' '}
            {tr.welcomeSuffix}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/sales')}
            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-1.5"
            style={{
              background: THEME.warmBrass,
              color: THEME.warmIvory,
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 12px -4px rgba(196,154,90,0.5)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(0.95)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          >
            {Icons.plus}
            <span>{tr.newInvoice}</span>
          </button>
        </div>
      </div>

      {/* STAT CARDS — 🔧 label chhota, number bara + bold */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
        {STATS.map((stat) => (
          <button
            key={stat.id}
            onClick={() => navigate(stat.path)}
            className="group rounded-xl p-3 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 text-start min-w-0"
            style={{
              background: '#fff',
              border: `1px solid ${THEME.mutedOlive}20`,
              boxShadow: '0 1px 2px rgba(18,60,50,0.04)',
            }}
          >
            <div className="flex items-start justify-between mb-3 gap-1">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                style={{
                  background: stat.bg,
                  color: THEME.warmIvory,
                  boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.2), 0 3px 8px rgba(0,0,0,0.12)',
                }}
              >
                {stat.icon}
              </div>
              {stat.change && (
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0"
                  style={
                    stat.trend === 'up'
                      ? { background: THEME.successBg, color: THEME.success }
                      : { background: THEME.dangerBg, color: THEME.danger }
                  }
                >
                  {stat.trend === 'up' ? Icons.arrowUp : Icons.arrowDown}
                  {stat.change}
                </span>
              )}
            </div>
            {/* 🔽 smaller label */}
            <p
              className="text-[8px] font-semibold uppercase tracking-wider mb-1 truncate"
              style={{ color: THEME.mutedOlive }}
            >
              {stat.label}
            </p>
            {/* 🔼 bigger + bolder number */}
          <p
  className="text-[18px] font-bold break-words leading-tight tabular-nums"
  style={{ color: THEME.charcoal }}
>
  {stat.value}
</p>
          </button>
        ))}
      </div>

      {/* ALERTS PANEL */}
      <div
        className="rounded-xl p-3.5 mb-4"
        style={{
          background: '#fff',
          border: `1px solid ${THEME.mutedOlive}20`,
        }}
      >
        <h2
          className="text-[13px] font-bold mb-3"
          style={{ color: THEME.deepForest }}
        >
          {tr.alerts}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <button
            onClick={() => navigate('/inventory')}
            className="flex items-center gap-2 p-2 rounded-lg text-start cursor-pointer transition"
            style={{ background: THEME.warningBg }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: THEME.warning, color: '#fff' }}
            >
              {Icons.alert}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-[10px] font-bold truncate"
                style={{ color: THEME.warning }}
              >
                {tr.lowStockAlert}
              </p>
              <p
                className="text-[12px] font-bold"
                style={{ color: THEME.charcoal }}
              >
                {data.lowStock.length} {tr.items}
              </p>
            </div>
          </button>
          <button
            onClick={() => navigate('/inventory')}
            className="flex items-center gap-2 p-2 rounded-lg text-start cursor-pointer transition"
            style={{ background: THEME.dangerBg }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: THEME.danger, color: '#fff' }}
            >
              {Icons.box}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-[10px] font-bold truncate"
                style={{ color: THEME.danger }}
              >
                {tr.outOfStockAlert}
              </p>
              <p
                className="text-[12px] font-bold"
                style={{ color: THEME.charcoal }}
              >
                {data.outOfStock.length} {tr.products}
              </p>
            </div>
          </button>
          <button
            onClick={() => navigate('/inventory/orders')}
            className="flex items-center gap-2 p-2 rounded-lg text-start cursor-pointer transition"
            style={{ background: '#e0e7ff' }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: '#4f46e5', color: '#fff' }}
            >
              {Icons.document}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-[10px] font-bold truncate"
                style={{ color: '#4f46e5' }}
              >
                {tr.pendingPOsAlert}
              </p>
              <p
                className="text-[12px] font-bold"
                style={{ color: THEME.charcoal }}
              >
                {data.pendingPOs.length} {tr.orders}
              </p>
            </div>
          </button>
          <button
            onClick={() => navigate('/accounting')}
            className="flex items-center gap-2 p-2 rounded-lg text-start cursor-pointer transition"
            style={{ background: THEME.warningBg }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: THEME.warning, color: '#fff' }}
            >
              {Icons.creditCard}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-[10px] font-bold truncate"
                style={{ color: THEME.warning }}
              >
                {tr.supplierDueAlert}
              </p>
              <p
                className="text-[12px] font-bold"
                style={{ color: THEME.charcoal }}
              >
                {data.supplierDue.length} {tr.bills}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ROW 1: BAR-LINE + PIE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div
          className="lg:col-span-2 rounded-xl p-3.5 min-w-0"
          style={{
            background: '#fff',
            border: `1px solid ${THEME.mutedOlive}20`,
          }}
        >
          <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
            <h2
              className="text-[13px] font-bold"
              style={{ color: THEME.deepForest }}
            >
              {tr.revenueVsExpenses}
            </h2>
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
                  style={{ background: THEME.danger }}
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
          <BarLineChart data={data.monthly} />
        </div>

        <div
          className="rounded-xl p-3.5 min-w-0"
          style={{
            background: '#fff',
            border: `1px solid ${THEME.mutedOlive}20`,
          }}
        >
          <h2
            className="text-[13px] font-bold mb-3"
            style={{ color: THEME.deepForest }}
          >
            {tr.onlineVsOffline}
          </h2>
          {data.hasChannelData ? (
            <>
              <PieChart
                slices={[
                  {
                    label: tr.online,
                    value: data.onlineSales,
                    color: THEME.deepForest,
                  },
                  {
                    label: tr.offline,
                    value: data.offlineSales,
                    color: THEME.warmBrass,
                  },
                ]}
              />
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span
                    className="flex items-center gap-1.5"
                    style={{ color: THEME.deepForest }}
                  >
                    <span
                      className="w-2 h-2 rounded-sm"
                      style={{ background: THEME.deepForest }}
                    />
                    {tr.online}
                  </span>
                  <span style={{ color: THEME.charcoal }}>
                    {fmt(data.onlineSales)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span
                    className="flex items-center gap-1.5"
                    style={{ color: THEME.warmBrass }}
                  >
                    <span
                      className="w-2 h-2 rounded-sm"
                      style={{ background: THEME.warmBrass }}
                    />
                    {tr.offline}
                  </span>
                  <span style={{ color: THEME.charcoal }}>
                    {fmt(data.offlineSales)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <p
              className="text-[11px] italic text-center py-4"
              style={{ color: THEME.mutedOlive }}
            >
              {tr.noData}
            </p>
          )}
        </div>
      </div>

      {/* ROW 2: TOP 5 BAR CHART + LOW STOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div
          className="lg:col-span-2 rounded-xl p-3.5 min-w-0"
          style={{
            background: '#fff',
            border: `1px solid ${THEME.mutedOlive}20`,
          }}
        >
          <h2
            className="text-[13px] font-bold mb-3"
            style={{ color: THEME.deepForest }}
          >
            {tr.top5Products}
          </h2>
          <BarChart
            data={data.top5.map((p) => ({ name: p.name, value: p.qty }))}
          />
        </div>

        <div
          className="rounded-xl p-3.5"
          style={{
            background: '#fff',
            border: `1px solid ${THEME.mutedOlive}20`,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-[13px] font-bold"
              style={{ color: THEME.deepForest }}
            >
              {tr.lowStock}
            </h2>
            <button
              onClick={() => navigate('/inventory')}
              className="text-[10px] font-bold cursor-pointer transition flex items-center gap-1 hover:underline"
              style={{ color: THEME.warmBrass }}
            >
              {tr.viewAll}
              {Icons.arrowRight}
            </button>
          </div>

          <div className="space-y-1.5">
            {data.lowStockDisplay.length === 0 ? (
              <p
                className="text-[11px] text-center py-4"
                style={{ color: THEME.mutedOlive }}
              >
                {tr.noData}
              </p>
            ) : (
              data.lowStockDisplay.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200"
                  style={{ background: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = THEME.warmIvory;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: THEME.warmIvory,
                      color: THEME.deepForest,
                    }}
                  >
                    {Icons.box}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[12px] font-semibold truncate"
                      style={{ color: THEME.charcoal }}
                    >
                      {p.name}
                    </p>
                    <p
                      className="text-[9px] mt-0.5 font-mono"
                      style={{ color: THEME.mutedOlive }}
                    >
                      {p.sku}
                    </p>
                  </div>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap"
                    style={
                      p.stock === 0
                        ? { background: THEME.dangerBg, color: THEME.danger }
                        : { background: THEME.warningBg, color: THEME.warning }
                    }
                  >
                    {p.stock === 0 ? tr.out : `${p.stock} ${tr.left}`}
                  </span>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => navigate('/inventory/orders')}
            className="w-full mt-3 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
            style={{
              border: `2px solid ${THEME.warmBrass}`,
              color: THEME.warmBrass,
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = THEME.warmBrass;
              e.currentTarget.style.color = THEME.warmIvory;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = THEME.warmBrass;
            }}
          >
            {tr.placeOrder}
          </button>
        </div>
      </div>

      {/* RECENT INVOICES + ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div
          className="lg:col-span-2 rounded-xl p-3.5"
          style={{
            background: '#fff',
            border: `1px solid ${THEME.mutedOlive}20`,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-[13px] font-bold"
              style={{ color: THEME.deepForest }}
            >
              {tr.recentInvoices}
            </h2>
            <button
              onClick={() => navigate('/sales')}
              className="text-[10px] font-bold cursor-pointer transition flex items-center gap-1 hover:underline"
              style={{ color: THEME.warmBrass }}
            >
              {tr.viewAll}
              {Icons.arrowRight}
            </button>
          </div>

          {data.recentInvoices.length === 0 ? (
            <p
              className="text-[11px] italic text-center py-6"
              style={{ color: THEME.mutedOlive }}
            >
              {tr.noData}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    style={{
                      borderBottom: `1px solid ${THEME.mutedOlive}20`,
                    }}
                  >
                    <th
                      className="text-left text-[9px] font-bold uppercase tracking-wider pb-2"
                      style={{ color: THEME.mutedOlive }}
                    >
                      {tr.invoice}
                    </th>
                    <th
                      className="text-left text-[9px] font-bold uppercase tracking-wider pb-2"
                      style={{ color: THEME.mutedOlive }}
                    >
                      {tr.customer}
                    </th>
                    <th
                      className="text-left text-[9px] font-bold uppercase tracking-wider pb-2"
                      style={{ color: THEME.mutedOlive }}
                    >
                      {tr.amount}
                    </th>
                    <th
                      className="text-left text-[9px] font-bold uppercase tracking-wider pb-2"
                      style={{ color: THEME.mutedOlive }}
                    >
                      {tr.status}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentInvoices.map((inv) => {
                    const st = getStatusStyle(inv.status);
                    return (
                      <tr
                        key={inv.id}
                        className="cursor-pointer transition-all duration-200"
                        style={{
                          borderBottom: `1px solid ${THEME.mutedOlive}10`,
                        }}
                        onClick={() => navigate('/sales')}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `${THEME.warmIvory}80`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <td
                          className="py-2 text-[12px] font-semibold font-mono"
                          style={{ color: THEME.charcoal }}
                        >
                          {inv.id}
                        </td>
                        <td
                          className="py-2 text-[12px] truncate max-w-[150px]"
                          style={{ color: THEME.mutedOlive }}
                        >
                          {inv.customer}
                        </td>
                        <td
                          className="py-2 text-[12px] font-semibold whitespace-nowrap"
                          style={{ color: THEME.charcoal }}
                        >
                          {formatCurrency(inv.amount)}
                        </td>
                        <td className="py-2">
                          <span
                            className="text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                            style={{ background: st.bg, color: st.color }}
                          >
                            {getStatusLabel(inv.status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div
          className="rounded-xl p-3.5"
          style={{
            background: '#fff',
            border: `1px solid ${THEME.mutedOlive}20`,
          }}
        >
          <h2
            className="text-[13px] font-bold mb-3"
            style={{ color: THEME.deepForest }}
          >
            {tr.recentActivity}
          </h2>
          {data.activities.length === 0 ? (
            <p
              className="text-[11px] italic text-center py-6"
              style={{ color: THEME.mutedOlive }}
            >
              {tr.noData}
            </p>
          ) : (
            <div className="space-y-2">
              {data.activities.map((a) => (
                <div
                  key={a.id}
                  className="flex gap-2 cursor-pointer rounded-lg p-2 -m-2 transition-all duration-200"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = THEME.warmIvory;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: THEME.warmIvory,
                      color: THEME.deepForest,
                      boxShadow:
                        'inset 0 1px 0 rgba(255,255,255,0.5), 0 1px 3px rgba(0,0,0,0.06)',
                    }}
                  >
                    {getActivityIcon(a.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[12px] leading-relaxed"
                      style={{ color: THEME.charcoal }}
                    >
                      {a.message}
                    </p>
                    <p
                      className="text-[9px] mt-0.5"
                      style={{ color: THEME.mutedOlive }}
                    >
                      {a.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div
        className="rounded-xl p-3.5"
        style={{ background: THEME.deepForest }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3
              className="text-[13px] font-bold"
              style={{ color: THEME.warmIvory }}
            >
              {tr.quickActions}
            </h3>
            <p
              className="text-[10px] mt-0.5"
              style={{ color: `${THEME.warmIvory}80` }}
            >
              {tr.jumpToModules}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickActions.map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-1.5"
                style={{
                  background: `${THEME.warmIvory}15`,
                  border: `1px solid ${THEME.warmIvory}25`,
                  color: THEME.warmIvory,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = THEME.warmBrass;
                  e.currentTarget.style.borderColor = THEME.warmBrass;
                  e.currentTarget.style.boxShadow =
                    '0 3px 8px rgba(196,154,90,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `${THEME.warmIvory}15`;
                  e.currentTarget.style.borderColor = `${THEME.warmIvory}25`;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span className="flex items-center">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div
        className="mt-4 text-center text-[10px]"
        style={{ color: THEME.mutedOlive }}
      >
        {tr.loggedInAs}{' '}
        <span className="capitalize font-bold" style={{ color: THEME.charcoal }}>
          {userRole}
        </span>{' '}
        • {tr.version}
      </div>
    </div>
  );
}