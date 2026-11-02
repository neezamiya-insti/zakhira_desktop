/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable prettier/prettier */
/* eslint-disable react-refresh/only-export-components */
import { useCallback, useEffect, useMemo, useState } from 'react';

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

// ============================================================
// TYPES
// ============================================================
export type TransactionType = 'In' | 'Out' | 'Return';
export type PaymentMode = 'Cash' | 'Card' | 'Bank Transfer' | 'Other';
export type TransactionStatus =
  | 'Paid'
  | 'Partially Paid'
  | 'Pending'
  | 'Returned';

type Transaction = {
  id: string;
  transactionNo: string;
  date: string;
  customerName: string;
  companyName: string;
  invoiceRef: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  mode: PaymentMode;
  sourceDocumentId?: string;
  amountPaid?: number;
  balanceDue?: number;
};

export type WeeklyReportData = {
  weekKey: string;
  label: string;
  startISO: string;
  endISO: string;

  totalSales: number;
  totalPaymentsReceived: number;
  outstandingBalances: number;

  totalPurchases: number;
  totalExpenses: number;

  netProfitLoss: number;

  paymentsByMethod: Record<string, number>;

  partialPaymentsReceived: number;
  amountStillDue: number;

  topSellingProducts: Array<{ name: string; qty: number; revenue: number }>;

  generatedAt: string;

  // Flag to identify sample/demo reports
  isSample?: boolean;
  // Flag for the week that is still running (updates automatically)
  isLive?: boolean;
};

// ============================================================
// ⏱️ AUTO-GENERATE SCHEDULE
// ============================================================
type IntervalUnit = 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks';

type Schedule = {
  enabled: boolean;
  value: number;
  unit: IntervalUnit;
  autoSave: boolean; // save the PDF straight to the Downloads folder
};

const SCHEDULE_KEY = 'zakhira_report_schedule_v2';

const UNIT_MS: Record<IntervalUnit, number> = {
  seconds: 1000,
  minutes: 60 * 1000,
  hours: 60 * 60 * 1000,
  days: 24 * 60 * 60 * 1000,
  weeks: 7 * 24 * 60 * 60 * 1000,
};

const UNIT_ORDER: IntervalUnit[] = ['seconds', 'minutes', 'hours', 'days', 'weeks'];
const MAX_INTERVAL_MS = 365 * UNIT_MS.days;

// Default: 1 week selected. Auto is OFF until the user presses Apply / switches Auto ON.
const DEFAULT_SCHEDULE: Schedule = {
  enabled: false,
  value: 1,
  unit: 'weeks',
  autoSave: true,
};

const PRESETS: Array<{ value: number; unit: IntervalUnit }> = [
  { value: 1, unit: 'seconds' },
  { value: 30, unit: 'seconds' },
  { value: 1, unit: 'minutes' },
  { value: 1, unit: 'hours' },
  { value: 1, unit: 'days' },
  { value: 1, unit: 'weeks' },
];

const scheduleToMs = (s: { value: number; unit: IntervalUnit }): number =>
  s.value * UNIT_MS[s.unit];

const loadSchedule = (): Schedule => {
  try {
    const raw = localStorage.getItem(SCHEDULE_KEY);
    if (!raw) return DEFAULT_SCHEDULE;
    const p = JSON.parse(raw);
    const unit: IntervalUnit = UNIT_ORDER.includes(p?.unit)
      ? p.unit
      : DEFAULT_SCHEDULE.unit;
    const value = Number(p?.value);
    if (!Number.isInteger(value) || value < 1) return DEFAULT_SCHEDULE;
    if (value * UNIT_MS[unit] > MAX_INTERVAL_MS) return DEFAULT_SCHEDULE;
    return {
      enabled: p?.enabled !== false,
      value,
      unit,
      autoSave: p?.autoSave !== false,
    };
  } catch {
    return DEFAULT_SCHEDULE;
  }
};

const saveSchedule = (s: Schedule): void => {
  try {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
};

// ============================================================
// 🌍 LANGUAGE
// ============================================================
type Language = 'en' | 'ar' | 'ur' | 'hi';

const t = {
  en: {
    pageTitle: 'Weekly Reports',
    pageSubtitle: 'Saturday → Friday • View, filter and download weekly summaries',
    back: 'Back',
    week: 'Week',
    netProfit: 'Net Profit',
    netLoss: 'Net Loss',
    downloadPdfShort: 'Download PDF',
    weeklyReportDocTitle: 'Weekly Report',
    selectWeek: 'Select Week',
    reportFilters: 'Report Filters',
    reportSearch: 'Search in report',
    reportSearchPh: 'Search products, methods...',
    reportDateFrom: 'Week From',
    reportDateTo: 'Week To',
    noMatchingReports: 'No reports match the filters',
    resetReportFilters: 'Reset Report Filters',
    noReportsYet:
      'First report will be available after the current week closes on Friday.',
    noReportsAtAll: 'No reports yet',
    reportsCount: (n: number) => `${n} report${n !== 1 ? 's' : ''}`,
    wTotalSales: 'Total Sales',
    wPaymentsReceived: 'Total Payments Received',
    wOutstanding: 'Outstanding Balances',
    wPurchasesExpenses: 'Purchases & Expenses',
    wTotalPurchases: 'Total Purchases',
    wTotalExpenses: 'Total Expenses',
    wNetResult: 'Net Profit / Loss',
    wPaymentsByMethod: 'Payments by Method',
    wPartialPayments: 'Partial Payments',
    wPartialReceived: 'Partial Payments Received',
    wAmountDue: 'Amount Still Due',
    wTopProducts: 'Top-Selling Products',
    wProductCol: 'Product',
    wQty: 'Qty',
    wRevenue: 'Revenue',
    wNoPayments: 'No payments',
    wNoProducts: 'No product data available',
    wMethod: 'Method',
    wAmount: 'Amount',
    generatedBy: 'Generated by Zakhira BMS',
    detailedStats: 'Detailed Breakdown',
    viewFullReport: 'View Full Breakdown',
    hideFullReport: 'Hide Breakdown',
    sampleBadge: 'SAMPLE',
    sampleReportNote: 'This is a sample report for preview',
    apply: 'Apply',
    vsLastWeek: 'vs. last week',
    // ---- new ----
    autoTitle: 'Auto-Generate Reports',
    autoSubtitle: 'Pick a time — the report is generated once when it ends, then Auto turns OFF',
    every: 'Every',
    unitSeconds: 'Seconds',
    unitMinutes: 'Minutes',
    unitHours: 'Hours',
    unitDays: 'Days',
    uSec: 's',
    uMin: 'm',
    uHour: 'h',
    uDay: 'd',
    generateNow: 'Generate Now',
    autoOn: 'Auto ON',
    autoOff: 'Auto OFF',
    lastGenerated: 'Last generated',
    nextIn: 'Next report in',
    autoPaused: 'Auto-generation is off',
    invalidInterval: 'Enter a whole number of 1 or more (max 365 days)',
    liveBadge: 'LIVE',
    liveNote: 'Week in progress — updates automatically',
    quickPick: 'Quick pick',
    kpiReports: 'Reports',
    collected: 'Collected',
    generatedAtLabel: 'Generated',
    realLabel: 'Real',
    autoSaveLabel: 'Auto-save PDF to Downloads',
    savedToDownloads: 'Saved to Downloads',
    saveFailed: 'Could not save the file',
    printLabel: 'Print',
    savedShort: 'Saved',
    unitWeeks: 'Weeks',
    uWeek: 'w',
    autoDone: 'Report generated once. Turn Auto ON or choose a time to generate again.',
  },
  ar: {
    pageTitle: 'التقارير الأسبوعية',
    pageSubtitle: 'السبت ← الجمعة • اعرض وفلتر وحمّل التقارير الأسبوعية',
    back: 'رجوع',
    week: 'الأسبوع',
    netProfit: 'صافي الربح',
    netLoss: 'صافي الخسارة',
    downloadPdfShort: 'تحميل PDF',
    weeklyReportDocTitle: 'تقرير أسبوعي',
    selectWeek: 'اختر الأسبوع',
    reportFilters: 'فلاتر التقرير',
    reportSearch: 'بحث في التقرير',
    reportSearchPh: 'ابحث في المنتجات، الطرق...',
    reportDateFrom: 'الأسبوع من',
    reportDateTo: 'الأسبوع إلى',
    noMatchingReports: 'لا توجد تقارير مطابقة للفلاتر',
    resetReportFilters: 'إعادة تعيين فلاتر التقرير',
    noReportsYet:
      'أول تقرير سيكون متاحًا بعد إغلاق الأسبوع الحالي يوم الجمعة.',
    noReportsAtAll: 'لا توجد تقارير بعد',
    reportsCount: (n: number) => `${n} تقرير`,
    wTotalSales: 'إجمالي المبيعات',
    wPaymentsReceived: 'إجمالي المدفوعات المستلمة',
    wOutstanding: 'الأرصدة المستحقة',
    wPurchasesExpenses: 'المشتريات والمصروفات',
    wTotalPurchases: 'إجمالي المشتريات',
    wTotalExpenses: 'إجمالي المصروفات',
    wNetResult: 'صافي الربح / الخسارة',
    wPaymentsByMethod: 'المدفوعات حسب الطريقة',
    wPartialPayments: 'المدفوعات الجزئية',
    wPartialReceived: 'المدفوعات الجزئية المستلمة',
    wAmountDue: 'المبلغ المستحق',
    wTopProducts: 'المنتجات الأكثر مبيعاً',
    wProductCol: 'المنتج',
    wQty: 'الكمية',
    wRevenue: 'الإيرادات',
    wNoPayments: 'لا توجد مدفوعات',
    wNoProducts: 'لا توجد بيانات منتجات',
    wMethod: 'الطريقة',
    wAmount: 'المبلغ',
    generatedBy: 'تم إنشاؤه بواسطة زخيرة',
    detailedStats: 'التفاصيل الكاملة',
    viewFullReport: 'عرض التفاصيل',
    hideFullReport: 'إخفاء التفاصيل',
    sampleBadge: 'عينة',
    sampleReportNote: 'هذا تقرير عينة للمعاينة',
    apply: 'تطبيق',
    vsLastWeek: 'مقارنة بالأسبوع الماضي',
    // ---- new ----
    autoTitle: 'إنشاء التقارير تلقائيًا',
    autoSubtitle: 'اختر وقتًا — يُنشأ التقرير مرة واحدة عند انتهائه ثم يتوقف التلقائي',
    every: 'كل',
    unitSeconds: 'ثوانٍ',
    unitMinutes: 'دقائق',
    unitHours: 'ساعات',
    unitDays: 'أيام',
    uSec: 'ث',
    uMin: 'د',
    uHour: 'س',
    uDay: 'ي',
    generateNow: 'إنشاء الآن',
    autoOn: 'تلقائي: تشغيل',
    autoOff: 'تلقائي: إيقاف',
    lastGenerated: 'آخر إنشاء',
    nextIn: 'التقرير التالي خلال',
    autoPaused: 'الإنشاء التلقائي متوقف',
    invalidInterval: 'أدخل عددًا صحيحًا 1 أو أكثر (الحد الأقصى 365 يومًا)',
    liveBadge: 'مباشر',
    liveNote: 'الأسبوع جارٍ — يتحدث تلقائيًا',
    quickPick: 'اختيار سريع',
    kpiReports: 'التقارير',
    collected: 'المحصّل',
    generatedAtLabel: 'أُنشئ',
    realLabel: 'حقيقي',
    autoSaveLabel: 'حفظ PDF تلقائيًا في التنزيلات',
    savedToDownloads: 'تم الحفظ في التنزيلات',
    saveFailed: 'تعذّر حفظ الملف',
    printLabel: 'طباعة',
    savedShort: 'تم الحفظ',
    unitWeeks: 'أسابيع',
    uWeek: 'أسبوع',
    autoDone: 'تم إنشاء التقرير مرة واحدة. شغّل التلقائي أو اختر وقتًا لإنشائه مرة أخرى.',
  },
  ur: {
    pageTitle: 'ہفتہ وار رپورٹس',
    pageSubtitle: 'ہفتہ ← جمعہ • دیکھیں، فلٹر کریں اور ہفتہ وار خلاصے ڈاؤن لوڈ کریں',
    back: 'واپس',
    week: 'ہفتہ',
    netProfit: 'خالص منافع',
    netLoss: 'خالص نقصان',
    downloadPdfShort: 'PDF ڈاؤن لوڈ کریں',
    weeklyReportDocTitle: 'ہفتہ وار رپورٹ',
    selectWeek: 'ہفتہ منتخب کریں',
    reportFilters: 'رپورٹ فلٹرز',
    reportSearch: 'رپورٹ میں تلاش',
    reportSearchPh: 'مصنوعات، طریقے تلاش کریں...',
    reportDateFrom: 'ہفتہ سے',
    reportDateTo: 'ہفتہ تک',
    noMatchingReports: 'کوئی رپورٹ فلٹرز سے مماثل نہیں',
    resetReportFilters: 'رپورٹ فلٹرز ری سیٹ کریں',
    noReportsYet:
      'پہلی رپورٹ موجودہ ہفتہ جمعہ کو ختم ہونے کے بعد دستیاب ہوگی۔',
    noReportsAtAll: 'ابھی کوئی رپورٹ نہیں',
    reportsCount: (n: number) => `${n} رپورٹس`,
    wTotalSales: 'کل فروخت',
    wPaymentsReceived: 'کل موصولہ ادائیگیاں',
    wOutstanding: 'واجب الادا بیلنس',
    wPurchasesExpenses: 'خریداری اور اخراجات',
    wTotalPurchases: 'کل خریداری',
    wTotalExpenses: 'کل اخراجات',
    wNetResult: 'خالص منافع / نقصان',
    wPaymentsByMethod: 'طریقہ وار ادائیگیاں',
    wPartialPayments: 'جزوی ادائیگیاں',
    wPartialReceived: 'موصولہ جزوی ادائیگیاں',
    wAmountDue: 'واجب الادا رقم',
    wTopProducts: 'سب سے زیادہ فروخت ہونے والی مصنوعات',
    wProductCol: 'مصنوعات',
    wQty: 'تعداد',
    wRevenue: 'آمدنی',
    wNoPayments: 'کوئی ادائیگی نہیں',
    wNoProducts: 'کوئی مصنوعات کا ڈیٹا نہیں',
    wMethod: 'طریقہ',
    wAmount: 'رقم',
    generatedBy: 'Zakhira BMS کی طرف سے تیار کردہ',
    detailedStats: 'تفصیلی جائزہ',
    viewFullReport: 'مکمل جائزہ دیکھیں',
    hideFullReport: 'جائزہ چھپائیں',
    sampleBadge: 'نمونہ',
    sampleReportNote: 'یہ پیش نظارہ کے لیے ایک نمونہ رپورٹ ہے',
    apply: 'لاگو کریں',
    vsLastWeek: 'پچھلے ہفتے کے مقابلے',
    // ---- new ----
    autoTitle: 'خودکار رپورٹ جنریشن',
    autoSubtitle: 'وقت منتخب کریں — ختم ہونے پر رپورٹ ایک بار بنے گی، پھر آٹو آف ہو جائے گا',
    every: 'ہر',
    unitSeconds: 'سیکنڈ',
    unitMinutes: 'منٹ',
    unitHours: 'گھنٹے',
    unitDays: 'دن',
    uSec: 'سیکنڈ',
    uMin: 'منٹ',
    uHour: 'گھنٹہ',
    uDay: 'دن',
    generateNow: 'ابھی بنائیں',
    autoOn: 'آٹو آن',
    autoOff: 'آٹو آف',
    lastGenerated: 'آخری بار بنائی گئی',
    nextIn: 'اگلی رپورٹ میں',
    autoPaused: 'خودکار جنریشن بند ہے',
    invalidInterval: '1 یا اس سے زیادہ پورا عدد درج کریں (زیادہ سے زیادہ 365 دن)',
    liveBadge: 'لائیو',
    liveNote: 'ہفتہ جاری ہے — خود بخود اپ ڈیٹ ہوتا ہے',
    quickPick: 'فوری انتخاب',
    kpiReports: 'رپورٹس',
    collected: 'وصول شدہ',
    generatedAtLabel: 'بنائی گئی',
    realLabel: 'اصل',
    autoSaveLabel: 'PDF خودکار طور پر ڈاؤن لوڈز میں محفوظ کریں',
    savedToDownloads: 'ڈاؤن لوڈز میں محفوظ ہو گئی',
    saveFailed: 'فائل محفوظ نہیں ہو سکی',
    printLabel: 'پرنٹ',
    savedShort: 'محفوظ',
    unitWeeks: 'ہفتے',
    uWeek: 'ہفتہ',
    autoDone: 'رپورٹ ایک بار بن گئی۔ دوبارہ بنانے کے لیے آٹو آن کریں یا وقت منتخب کریں۔',
  },
  hi: {
    pageTitle: 'साप्ताहिक रिपोर्ट',
    pageSubtitle: 'शनिवार → शुक्रवार • देखें, फ़िल्टर करें और साप्ताहिक सारांश डाउनलोड करें',
    back: 'वापस',
    week: 'सप्ताह',
    netProfit: 'शुद्ध लाभ',
    netLoss: 'शुद्ध हानि',
    downloadPdfShort: 'PDF डाउनलोड करें',
    weeklyReportDocTitle: 'साप्ताहिक रिपोर्ट',
    selectWeek: 'सप्ताह चुनें',
    reportFilters: 'रिपोर्ट फ़िल्टर',
    reportSearch: 'रिपोर्ट में खोजें',
    reportSearchPh: 'उत्पाद, विधियाँ खोजें...',
    reportDateFrom: 'सप्ताह से',
    reportDateTo: 'सप्ताह तक',
    noMatchingReports: 'कोई रिपोर्ट फ़िल्टर से मेल नहीं खाती',
    resetReportFilters: 'रिपोर्ट फ़िल्टर रीसेट करें',
    noReportsYet:
      'पहली रिपोर्ट चालू सप्ताह शुक्रवार को बंद होने के बाद उपलब्ध होगी।',
    noReportsAtAll: 'अभी कोई रिपोर्ट नहीं',
    reportsCount: (n: number) => `${n} रिपोर्ट`,
    wTotalSales: 'कुल बिक्री',
    wPaymentsReceived: 'कुल प्राप्त भुगतान',
    wOutstanding: 'बकाया शेष',
    wPurchasesExpenses: 'खरीद और खर्च',
    wTotalPurchases: 'कुल खरीद',
    wTotalExpenses: 'कुल खर्च',
    wNetResult: 'शुद्ध लाभ / हानि',
    wPaymentsByMethod: 'विधि के अनुसार भुगतान',
    wPartialPayments: 'आंशिक भुगतान',
    wPartialReceived: 'प्राप्त आंशिक भुगतान',
    wAmountDue: 'बकाया राशि',
    wTopProducts: 'सर्वाधिक बिकने वाले उत्पाद',
    wProductCol: 'उत्पाद',
    wQty: 'मात्रा',
    wRevenue: 'राजस्व',
    wNoPayments: 'कोई भुगतान नहीं',
    wNoProducts: 'कोई उत्पाद डेटा उपलब्ध नहीं',
    wMethod: 'विधि',
    wAmount: 'राशि',
    generatedBy: 'Zakhira BMS द्वारा उत्पन्न',
    detailedStats: 'विस्तृत विवरण',
    viewFullReport: 'पूरा विवरण देखें',
    hideFullReport: 'विवरण छिपाएँ',
    sampleBadge: 'नमूना',
    sampleReportNote: 'यह पूर्वावलोकन के लिए एक नमूना रिपोर्ट है',
    apply: 'लागू करें',
    vsLastWeek: 'पिछले सप्ताह की तुलना में',
    // ---- new ----
    autoTitle: 'स्वचालित रिपोर्ट जनरेशन',
    autoSubtitle: 'समय चुनें — समाप्त होने पर रिपोर्ट एक बार बनेगी, फिर ऑटो बंद हो जाएगा',
    every: 'हर',
    unitSeconds: 'सेकंड',
    unitMinutes: 'मिनट',
    unitHours: 'घंटे',
    unitDays: 'दिन',
    uSec: 'सेकंड',
    uMin: 'मिनट',
    uHour: 'घंटा',
    uDay: 'दिन',
    generateNow: 'अभी बनाएँ',
    autoOn: 'ऑटो चालू',
    autoOff: 'ऑटो बंद',
    lastGenerated: 'अंतिम बार बनी',
    nextIn: 'अगली रिपोर्ट में',
    autoPaused: 'स्वचालित जनरेशन बंद है',
    invalidInterval: '1 या अधिक पूर्ण संख्या दर्ज करें (अधिकतम 365 दिन)',
    liveBadge: 'लाइव',
    liveNote: 'सप्ताह जारी है — अपने आप अपडेट होता है',
    quickPick: 'त्वरित चयन',
    kpiReports: 'रिपोर्ट',
    collected: 'वसूला गया',
    generatedAtLabel: 'बनी',
    realLabel: 'असली',
    autoSaveLabel: 'PDF अपने आप डाउनलोड्स में सेव करें',
    savedToDownloads: 'डाउनलोड्स में सेव हो गई',
    saveFailed: 'फ़ाइल सेव नहीं हो सकी',
    printLabel: 'प्रिंट',
    savedShort: 'सेव हुई',
    unitWeeks: 'सप्ताह',
    uWeek: 'सप्ताह',
    autoDone: 'रिपोर्ट एक बार बन गई। दोबारा बनाने के लिए ऑटो चालू करें या समय चुनें।',
  },
} as const;

type Translations = {
  [K in keyof typeof t['en']]: typeof t['en'][K] extends (arg: infer A) => string
    ? (arg: A) => string
    : string;
};

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

// ============================================================
// STORAGE KEYS
// ============================================================
const TRANSACTIONS_STORAGE_KEY = 'zakhira_transactions';
const DOCUMENTS_KEY = 'zakhira_sales_documents';

// ============================================================
// 🖨️ PRINT HELPER
// ============================================================
const printHtmlDocument = (html: string): void => {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  const doc = iframe.contentDocument || win?.document;
  if (!win || !doc) {
    iframe.remove();
    return;
  }

  let removed = false;
  const cleanup = (): void => {
    if (removed) return;
    removed = true;
    setTimeout(() => iframe.remove(), 500);
  };

  doc.open();
  doc.write(html);
  doc.close();

  win.addEventListener('afterprint', cleanup);

  setTimeout(() => {
    try {
      win.focus();
      win.print();
    } catch {
      cleanup();
      return;
    }
    setTimeout(cleanup, 120000);
  }, 400);
};

// ============================================================
// STORAGE HELPERS
// ============================================================
const loadTransactions = (): Transaction[] => {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// ============================================================
// HELPERS
// ============================================================
const formatPrice = (n: number, lang: Language = 'en'): string => {
  const currency = lang === 'ar' || lang === 'ur' ? 'ر.س' : 'SAR';
  return `${currency} ${n.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const formatClock = (msOrIso: number | string): string => {
  const d = new Date(msOrIso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const isReturnEntry = (t: Transaction): boolean =>
  t.type === 'Return' || (t.type === 'Out' && t.status === 'Returned');

const receivedAmount = (t: Transaction): number => {
  if (typeof t.amountPaid === 'number') return Math.max(0, t.amountPaid);
  if (t.status === 'Paid') return t.amount;
  if (t.status === 'Partially Paid') {
    if (typeof t.balanceDue === 'number')
      return Math.max(0, t.amount - t.balanceDue);
    return 0;
  }
  return 0;
};

const dueAmount = (t: Transaction): number => {
  if (typeof t.balanceDue === 'number') return Math.max(0, t.balanceDue);
  if (t.status === 'Paid') return 0;
  if (t.status === 'Partially Paid') {
    if (typeof t.amountPaid === 'number')
      return Math.max(0, t.amount - t.amountPaid);
    return t.amount;
  }
  return t.amount;
};

// ============================================================
// 📅 WEEK HELPERS (Saturday → Friday)
// ============================================================
const offsetFromSaturday = (day: number): number => (day + 1) % 7;

const getWeekKey = (saturdayStart: Date): string => {
  const y = saturdayStart.getFullYear();
  const m = String(saturdayStart.getMonth() + 1).padStart(2, '0');
  const d = String(saturdayStart.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatWeekLabel = (start: Date, end: Date): string => {
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  return `${fmt(start)} – ${fmt(end)}`;
};

const getWeekRange = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const offset = offsetFromSaturday(d.getDay());

  const start = new Date(d);
  start.setDate(d.getDate() - offset);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return {
    weekKey: getWeekKey(start),
    start,
    end,
    label: formatWeekLabel(start, end),
  };
};

const getLastClosedWeek = (now: Date = new Date()) => {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const diffToFriday = (today.getDay() + 2) % 7;
  const lastFriday = new Date(today);
  lastFriday.setDate(today.getDate() - diffToFriday);
  return getWeekRange(lastFriday);
};

const enumerateWeeks = (from: Date, to: Date) => {
  const out: ReturnType<typeof getWeekRange>[] = [];
  const cursor = new Date(getWeekRange(from).start);
  const limit = getWeekRange(to).start;
  while (cursor.getTime() <= limit.getTime()) {
    out.push(getWeekRange(cursor));
    cursor.setDate(cursor.getDate() + 7);
  }
  return out;
};

// ============================================================
// 📊 WEEKLY REPORT BUILDER
// ============================================================
const buildWeeklyReport = (
  allTxns: Transaction[],
  start: Date,
  end: Date,
  weekKey: string,
  label: string
): WeeklyReportData => {
  const startMs = start.getTime();
  const endMs = end.getTime();

  const inWeek = allTxns.filter((t) => {
    const ms = new Date(t.date).getTime();
    return ms >= startMs && ms <= endMs;
  });

  const ins = inWeek.filter((t) => t.type === 'In');
  const outs = inWeek.filter(
    (t) => t.type === 'Out' && t.status !== 'Returned'
  );
  const returns = inWeek.filter(isReturnEntry);

  const totalReturns = returns.reduce((s, t) => s + t.amount, 0);
  const totalSales = ins.reduce((s, t) => s + t.amount, 0) - totalReturns;

  const totalPaymentsReceived = ins.reduce((s, t) => s + receivedAmount(t), 0);
  const outstandingBalances = ins.reduce((s, t) => s + dueAmount(t), 0);

  const partialIns = ins.filter((t) => t.status === 'Partially Paid');
  const partialPaymentsReceived = partialIns.reduce(
    (s, t) => s + receivedAmount(t),
    0
  );
  const amountStillDue = ins.reduce((s, t) => s + dueAmount(t), 0);

  const totalPurchases = outs.reduce((s, t) => s + t.amount, 0);
  const totalExpenses = totalPurchases;

  const paymentsByMethod: Record<string, number> = {};
  ins.forEach((t) => {
    const m = t.mode || 'Other';
    paymentsByMethod[m] = (paymentsByMethod[m] || 0) + receivedAmount(t);
  });

  const topSellingProducts: Array<{
    name: string;
    qty: number;
    revenue: number;
  }> = [];
  try {
    const docsRaw = localStorage.getItem(DOCUMENTS_KEY);
    if (docsRaw) {
      const docs = JSON.parse(docsRaw);
      const productMap = new Map<string, { qty: number; revenue: number }>();
      if (Array.isArray(docs)) {
        for (const doc of docs) {
          const docDateMs = new Date(
            doc.date || doc.createdAt || doc.issueDate || 0
          ).getTime();
          if (docDateMs < startMs || docDateMs > endMs) continue;
          const items =
            doc.items || doc.products || doc.lines || doc.lineItems || [];
          if (!Array.isArray(items)) continue;
          for (const it of items) {
            const name =
              it.name ||
              it.productName ||
              it.material ||
              it.description ||
              'Unknown';
            const qty = Number(it.qty || it.quantity || 0);
            const revenue = Number(it.total || it.lineTotal || it.amount || 0);
            const cur = productMap.get(name) || { qty: 0, revenue: 0 };
            cur.qty += qty;
            cur.revenue += revenue;
            productMap.set(name, cur);
          }
        }
      }
      topSellingProducts.push(
        ...Array.from(productMap.entries())
          .map(([name, v]) => ({ name, qty: v.qty, revenue: v.revenue }))
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 10)
      );
    }
  } catch {
    /* ignore */
  }

  return {
    weekKey,
    label,
    startISO: start.toISOString(),
    endISO: end.toISOString(),
    totalSales,
    totalPaymentsReceived,
    outstandingBalances,
    totalPurchases,
    totalExpenses,
    netProfitLoss: totalSales - totalPurchases - totalExpenses,
    paymentsByMethod,
    partialPaymentsReceived,
    amountStillDue,
    topSellingProducts,
    generatedAt: new Date().toISOString(),
    isSample: false,
    isLive: false,
  };
};

// ============================================================
// 🎭 ALWAYS-AVAILABLE SAMPLE REPORTS (4 hardcoded)
// ============================================================
const generateSampleReports = (): WeeklyReportData[] => {
  const lastClosed = getLastClosedWeek();

  const samples: Array<{
    sales: number;
    received: number;
    purchases: number;
    expenses: number;
    partial: number;
    methods: Record<string, number>;
    products: Array<{ name: string; qty: number; revenue: number }>;
  }> = [
    {
      sales: 42500,
      received: 38000,
      purchases: 12500,
      expenses: 3200,
      partial: 6200,
      methods: {
        Cash: 17100,
        Card: 11400,
        'Bank Transfer': 5700,
        Other: 3800,
      },
      products: [
        { name: 'Basmati Rice 5kg', qty: 128, revenue: 19200 },
        { name: 'Sunflower Oil 1L', qty: 96, revenue: 8640 },
        { name: 'Wheat Flour 10kg', qty: 74, revenue: 5920 },
        { name: 'Sugar 1kg', qty: 65, revenue: 3250 },
        { name: 'Green Tea 250g', qty: 48, revenue: 2880 },
      ],
    },
    {
      sales: 36800,
      received: 31200,
      purchases: 10800,
      expenses: 2600,
      partial: 5400,
      methods: {
        Cash: 14040,
        Card: 9360,
        'Bank Transfer': 4680,
        Other: 3120,
      },
      products: [
        { name: 'Basmati Rice 5kg', qty: 102, revenue: 15300 },
        { name: 'Red Lentils 1kg', qty: 88, revenue: 7040 },
        { name: 'Sunflower Oil 1L', qty: 79, revenue: 7110 },
        { name: 'Chickpeas 1kg', qty: 54, revenue: 4320 },
        { name: 'Dates Premium 500g', qty: 42, revenue: 3780 },
      ],
    },
    {
      sales: 47200,
      received: 44100,
      purchases: 14200,
      expenses: 3800,
      partial: 8100,
      methods: {
        Cash: 19845,
        Card: 13230,
        'Bank Transfer': 6615,
        Other: 4410,
      },
      products: [
        { name: 'Cooking Oil 5L', qty: 145, revenue: 21750 },
        { name: 'Basmati Rice 5kg', qty: 134, revenue: 20100 },
        { name: 'Milk Powder 900g', qty: 92, revenue: 11040 },
        { name: 'Wheat Flour 10kg', qty: 86, revenue: 6880 },
        { name: 'Sugar 1kg', qty: 72, revenue: 3600 },
      ],
    },
    {
      sales: 39100,
      received: 32800,
      purchases: 11900,
      expenses: 2900,
      partial: 5900,
      methods: {
        Cash: 14760,
        Card: 9840,
        'Bank Transfer': 4920,
        Other: 3280,
      },
      products: [
        { name: 'Sunflower Oil 1L', qty: 118, revenue: 10620 },
        { name: 'Basmati Rice 5kg', qty: 98, revenue: 14700 },
        { name: 'Red Lentils 1kg', qty: 81, revenue: 6480 },
        { name: 'Green Tea 250g', qty: 56, revenue: 3360 },
        { name: 'Dates Premium 500g', qty: 47, revenue: 4230 },
      ],
    },
  ];

  return samples.map((s, i) => {
    const weekStart = new Date(lastClosed.start);
    weekStart.setDate(weekStart.getDate() - i * 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const outstandingBalances = s.sales - s.received;
    const netProfitLoss = s.sales - s.purchases - s.expenses;

    return {
      // Prefix weekKey with 'sample-' so it never collides with real weeks
      weekKey: `sample-${getWeekKey(weekStart)}`,
      label: formatWeekLabel(weekStart, weekEnd),
      startISO: weekStart.toISOString(),
      endISO: weekEnd.toISOString(),
      totalSales: s.sales,
      totalPaymentsReceived: s.received,
      outstandingBalances,
      totalPurchases: s.purchases,
      totalExpenses: s.expenses,
      netProfitLoss,
      paymentsByMethod: s.methods,
      partialPaymentsReceived: s.partial,
      amountStillDue: outstandingBalances,
      topSellingProducts: s.products,
      generatedAt: new Date().toISOString(),
      isSample: true,
      isLive: false,
    };
  });
};

// ============================================================
// 📄 WEEKLY REPORT PDF DOWNLOAD
// ============================================================
const downloadWeeklyReportPdf = (
  r: WeeklyReportData,
  lang: Language,
  tr: Translations
): void => {
  const fmt = (n: number) => formatPrice(n, lang);

  const methodRows =
    Object.keys(r.paymentsByMethod).length > 0
      ? Object.entries(r.paymentsByMethod)
          .map(([m, v]) => `<tr><td>${m}</td><td class="r">${fmt(v)}</td></tr>`)
          .join('')
      : `<tr><td colspan="2" style="text-align:center;color:${THEME.mutedOlive}">${tr.wNoPayments}</td></tr>`;

  const productRows =
    r.topSellingProducts.length > 0
      ? r.topSellingProducts
          .map(
            (p, i) =>
              `<tr><td>${i + 1}</td><td>${p.name}</td><td class="r">${p.qty}</td><td class="r">${fmt(p.revenue)}</td></tr>`
          )
          .join('')
      : `<tr><td colspan="4" style="text-align:center;color:${THEME.mutedOlive}">${tr.wNoProducts}</td></tr>`;

  const isProfit = r.netProfitLoss >= 0;
  const isRTL = lang === 'ar' || lang === 'ur';
  const noteText = r.isSample
    ? `${tr.sampleBadge} — ${tr.sampleReportNote}`
    : r.isLive
      ? `${tr.liveBadge} — ${tr.liveNote}`
      : '';
  const sampleNote = noteText
    ? `<div style="margin-top:8px;padding:6px 10px;background:rgba(196,154,90,0.15);border-radius:999px;font-size:10px;color:${THEME.warmBrass};text-align:center;font-weight:700;letter-spacing:1px">${noteText}</div>`
    : '';

  const html = `<!doctype html><html dir="${isRTL ? 'rtl' : 'ltr'}"><head><meta charset="utf-8">
<title>${tr.weeklyReportDocTitle} — ${r.label}</title>
<style>
*{box-sizing:border-box}
body{font-family:Arial,Helvetica,sans-serif;color:${THEME.charcoal};margin:0;padding:32px}
.head{border-bottom:3px solid ${THEME.deepForest};padding-bottom:16px;margin-bottom:24px}
.co{font-size:22px;font-weight:700;color:${THEME.deepForest}}
.range{font-size:16px;font-weight:700;margin-top:6px;color:${THEME.warmBrass}}
h2{font-size:12px;text-transform:uppercase;letter-spacing:2px;color:${THEME.deepForest};margin:22px 0 10px;border-bottom:1px solid ${THEME.mutedOlive}40;padding-bottom:6px}
table{width:100%;border-collapse:collapse;font-size:12px}
th{background:${THEME.warmIvory};text-align:left;padding:8px;border:1px solid ${THEME.mutedOlive}40;font-size:10px;text-transform:uppercase}
td{padding:8px;border:1px solid ${THEME.mutedOlive}40}
.r{text-align:right}
.profit{color:${THEME.deepForest};font-weight:700}
.loss{color:${THEME.warmBrass};font-weight:700}
.foot{margin-top:28px;font-size:10px;color:${THEME.mutedOlive};text-align:center;border-top:1px solid ${THEME.mutedOlive}40;padding-top:10px}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>

<div class="head">
  <div class="co">Zakhira Accounting</div>
  <div class="range">${r.label}</div>
  ${sampleNote}
</div>

<h2>${tr.wTotalSales} / ${tr.wPaymentsReceived}</h2>
<table>
<tr><td>${tr.wTotalSales}</td><td class="r">${fmt(r.totalSales)}</td></tr>
<tr><td>${tr.wPaymentsReceived}</td><td class="r">${fmt(r.totalPaymentsReceived)}</td></tr>
<tr><td>${tr.wOutstanding}</td><td class="r">${fmt(r.outstandingBalances)}</td></tr>
</table>

<h2>${tr.wPurchasesExpenses}</h2>
<table>
<tr><td>${tr.wTotalPurchases}</td><td class="r">${fmt(r.totalPurchases)}</td></tr>
<tr><td>${tr.wTotalExpenses}</td><td class="r">${fmt(r.totalExpenses)}</td></tr>
</table>

<h2>${tr.wNetResult}</h2>
<table>
<tr>
  <td>${isProfit ? tr.netProfit : tr.netLoss}</td>
  <td class="r ${isProfit ? 'profit' : 'loss'}">${fmt(Math.abs(r.netProfitLoss))}</td>
</tr>
</table>

<h2>${tr.wPaymentsByMethod}</h2>
<table>
<tr><th>${tr.wMethod}</th><th class="r">${tr.wAmount}</th></tr>
${methodRows}
</table>

<h2>${tr.wPartialPayments}</h2>
<table>
<tr><td>${tr.wPartialReceived}</td><td class="r">${fmt(r.partialPaymentsReceived)}</td></tr>
<tr><td>${tr.wAmountDue}</td><td class="r">${fmt(r.amountStillDue)}</td></tr>
</table>

<h2>${tr.wTopProducts}</h2>
<table>
<tr><th>#</th><th>${tr.wProductCol}</th><th class="r">${tr.wQty}</th><th class="r">${tr.wRevenue}</th></tr>
${productRows}
</table>

<div class="foot">${tr.generatedBy}</div>
</body></html>`;

  printHtmlDocument(html);
};

// ============================================================
// 📥 REAL PDF FILE (no print dialog) — saved straight to Downloads
// ============================================================
// Helvetica character widths (chars 32..126, 1/1000 em) for right-aligning text
const HELV_WIDTHS = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556,
  278, 278, 584, 584, 584, 556, 1015,
  667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667,
  778, 722, 667, 611, 722, 667, 944, 667, 667, 611,
  278, 278, 278, 469, 556, 333,
  556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556,
  556, 333, 500, 278, 556, 500, 722, 500, 500, 500,
  334, 260, 334, 584,
];

const pdfSanitize = (s: string): string =>
  String(s).replace(/[–—]/g, '-').replace(/[^\x20-\x7E]/g, '?');

const pdfEscape = (s: string): string =>
  pdfSanitize(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const pdfTextWidth = (s: string, size: number, bold: boolean): number => {
  const clean = pdfSanitize(s);
  let total = 0;
  for (let i = 0; i < clean.length; i++) {
    total += HELV_WIDTHS[clean.charCodeAt(i) - 32] ?? 556;
  }
  return (total / 1000) * size * (bold ? 1.05 : 1);
};

const pdfFit = (s: string, maxW: number, size: number, bold: boolean): string => {
  if (pdfTextWidth(s, size, bold) <= maxW) return s;
  let out = s;
  while (out.length > 1 && pdfTextWidth(out + '...', size, bold) > maxW) {
    out = out.slice(0, -1);
  }
  return out + '...';
};

const pdfRgb = (hex: string): string => {
  const n = parseInt(hex.replace('#', ''), 16);
  const c = (v: number) => (v / 255).toFixed(3);
  return `${c((n >> 16) & 255)} ${c((n >> 8) & 255)} ${c(n & 255)}`;
};

const assemblePdf = (pages: string[]): Blob => {
  const objs: string[] = [];
  objs[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objs[2] = `<< /Type /Pages /Kids [${pages
    .map((_, i) => `${5 + 2 * i} 0 R`)
    .join(' ')}] /Count ${pages.length} >>`;
  objs[3] =
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
  objs[4] =
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
  pages.forEach((content, i) => {
    objs[5 + 2 * i] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + 2 * i} 0 R >>`;
    objs[6 + 2 * i] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
  });

  let out = '%PDF-1.4\n';
  const offsets: number[] = [];
  for (let i = 1; i < objs.length; i++) {
    offsets[i] = out.length;
    out += `${i} 0 obj\n${objs[i]}\nendobj\n`;
  }
  const xref = out.length;
  out += `xref\n0 ${objs.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < objs.length; i++) {
    out += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  out += `trailer\n<< /Size ${objs.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([out], { type: 'application/pdf' });
};

const buildReportPdf = (r: WeeklyReportData): Blob => {
  const W = 595;
  const H = 842;
  const M = 40;
  const ROW = 20;
  const pages: string[] = [];
  let ops: string[] = [];
  let y = M;
  const fmt = (n: number) => formatPrice(n, 'en');

  const text = (
    s: string,
    x: number,
    base: number,
    size: number,
    bold: boolean,
    color: string,
    align: 'l' | 'r' | 'c' = 'l'
  ): void => {
    const w = pdfTextWidth(s, size, bold);
    const px = align === 'r' ? x - w : align === 'c' ? x - w / 2 : x;
    ops.push(
      `BT /${bold ? 'F2' : 'F1'} ${size} Tf ${pdfRgb(color)} rg 1 0 0 1 ${px.toFixed(2)} ${(H - base).toFixed(2)} Tm (${pdfEscape(s)}) Tj ET`
    );
  };
  const rect = (x: number, top: number, w: number, h: number, color: string): void => {
    ops.push(
      `${pdfRgb(color)} rg ${x.toFixed(2)} ${(H - top - h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`
    );
  };
  const hline = (top: number, color: string): void => {
    ops.push(
      `${pdfRgb(color)} RG 0.6 w ${M} ${(H - top).toFixed(2)} m ${W - M} ${(H - top).toFixed(2)} l S`
    );
  };

  const startPage = (first: boolean): void => {
    if (ops.length) pages.push(ops.join('\n'));
    ops = [];
    y = M;
    if (first) {
      rect(0, 0, W, 78, THEME.deepForest);
      text('Zakhira Accounting', M, 36, 18, true, THEME.warmIvory);
      text('Weekly Report', M, 56, 10, false, THEME.warmBrass);
      text(r.label, W - M, 36, 12, true, THEME.warmBrass, 'r');
      const note = r.isSample ? 'SAMPLE REPORT' : r.isLive ? 'LIVE - WEEK IN PROGRESS' : '';
      if (note) text(note, W - M, 56, 8, true, THEME.warmIvory, 'r');
      y = 78 + 22;
    }
  };

  const section = (title: string, need: number): void => {
    if (y + need > H - 50) startPage(false);
    text(title.toUpperCase(), M, y + 10, 9, true, THEME.deepForest);
    y += 16;
    hline(y, THEME.mutedOlive);
    y += 6;
  };

  const kv = (
    label: string,
    value: string,
    idx: number,
    valueColor: string = THEME.charcoal,
    bold = false
  ): void => {
    if (idx % 2 === 0) rect(M, y, W - 2 * M, ROW, THEME.warmIvory);
    text(label, M + 8, y + 14, 10, false, THEME.charcoal);
    text(value, W - M - 8, y + 14, 10, bold, valueColor, 'r');
    y += ROW;
  };

  startPage(true);

  section('Sales & Payments', ROW * 3 + 30);
  kv('Total Sales', fmt(r.totalSales), 0);
  kv('Total Payments Received', fmt(r.totalPaymentsReceived), 1);
  kv('Outstanding Balances', fmt(r.outstandingBalances), 2);
  y += 12;

  section('Purchases & Expenses', ROW * 2 + 30);
  kv('Total Purchases', fmt(r.totalPurchases), 0);
  kv('Total Expenses', fmt(r.totalExpenses), 1);
  y += 12;

  const profit = r.netProfitLoss >= 0;
  section('Net Profit / Loss', ROW + 30);
  kv(
    profit ? 'Net Profit' : 'Net Loss',
    fmt(Math.abs(r.netProfitLoss)),
    0,
    profit ? THEME.deepForest : THEME.warmBrass,
    true
  );
  y += 12;

  const methods = Object.entries(r.paymentsByMethod);
  section('Payments by Method', ROW * (methods.length + 1) + 30);
  rect(M, y, W - 2 * M, ROW, THEME.mutedOlive);
  text('Method', M + 8, y + 14, 9, true, THEME.warmIvory);
  text('Amount', W - M - 8, y + 14, 9, true, THEME.warmIvory, 'r');
  y += ROW;
  if (methods.length === 0) {
    text('No payments', W / 2, y + 14, 10, false, THEME.mutedOlive, 'c');
    y += ROW;
  } else {
    methods.forEach(([m, v], i) => kv(m, fmt(v), i));
  }
  y += 12;

  section('Partial Payments', ROW * 2 + 30);
  kv('Partial Payments Received', fmt(r.partialPaymentsReceived), 0);
  kv('Amount Still Due', fmt(r.amountStillDue), 1);
  y += 12;

  const prods = r.topSellingProducts;
  section('Top-Selling Products', ROW * 3 + 30);
  const qtyX = W - M - 130;
  const drawProdHeader = (): void => {
    rect(M, y, W - 2 * M, ROW, THEME.mutedOlive);
    text('#', M + 8, y + 14, 9, true, THEME.warmIvory);
    text('Product', M + 30, y + 14, 9, true, THEME.warmIvory);
    text('Qty', qtyX, y + 14, 9, true, THEME.warmIvory, 'r');
    text('Revenue', W - M - 8, y + 14, 9, true, THEME.warmIvory, 'r');
    y += ROW;
  };
  drawProdHeader();
  if (prods.length === 0) {
    text('No product data available', W / 2, y + 14, 10, false, THEME.mutedOlive, 'c');
    y += ROW;
  } else {
    prods.forEach((p, i) => {
      if (y + ROW > H - 50) {
        startPage(false);
        drawProdHeader();
      }
      if (i % 2 === 0) rect(M, y, W - 2 * M, ROW, THEME.warmIvory);
      text(String(i + 1), M + 8, y + 14, 10, false, THEME.charcoal);
      text(pdfFit(p.name, qtyX - (M + 30) - 40, 10, false), M + 30, y + 14, 10, false, THEME.charcoal);
      text(String(p.qty), qtyX, y + 14, 10, false, THEME.charcoal, 'r');
      text(fmt(p.revenue), W - M - 8, y + 14, 10, false, THEME.charcoal, 'r');
      y += ROW;
    });
  }

  text(
    `Generated by Zakhira BMS - ${new Date().toLocaleString('en-GB')}`,
    W / 2,
    H - 28,
    8,
    false,
    THEME.mutedOlive,
    'c'
  );
  pages.push(ops.join('\n'));
  return assemblePdf(pages);
};

const pad2 = (n: number): string => String(n).padStart(2, '0');

// Builds the PDF and saves it into the browser/app Downloads folder. Returns the file name.
const savePdf = (r: WeeklyReportData): string => {
  const now = new Date();
  const stamp = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}_${pad2(now.getHours())}-${pad2(now.getMinutes())}-${pad2(now.getSeconds())}`;
  const ws = new Date(r.startISO);
  const weekStart = `${ws.getFullYear()}-${pad2(ws.getMonth() + 1)}-${pad2(ws.getDate())}`;
  const suffix = r.isSample ? '_Sample' : r.isLive ? '_Live' : '';
  const name = `Zakhira_Weekly_Report_${weekStart}${suffix}_${stamp}.pdf`;

  const blob = buildReportPdf(r);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 2000);
  return name;
};

// ============================================================
// 🔧 BUILD ALL REPORTS = real (+ live current week) + sample
// ============================================================
const buildAllReports = (txns: Transaction[]): WeeklyReportData[] => {
  const sampleReports = generateSampleReports();
  const realReports: WeeklyReportData[] = [];

  if (txns.length > 0) {
    const dates = txns
      .map((t) => new Date(t.date).getTime())
      .filter((n) => !isNaN(n));

    if (dates.length > 0) {
      const earliest = new Date(Math.min(...dates));
      const lastClosed = getLastClosedWeek();
      const weeks = enumerateWeeks(earliest, lastClosed.end);

      for (const w of weeks) {
        realReports.push(
          buildWeeklyReport(txns, w.start, w.end, w.weekKey, w.label)
        );
      }

      // Current (running) week — so frequent auto-generation shows real changes
      const cur = getWeekRange(new Date());
      const existing = realReports.find((r) => r.weekKey === cur.weekKey);
      if (existing) {
        existing.isLive = true;
      } else {
        const live = buildWeeklyReport(
          txns,
          cur.start,
          cur.end,
          `live-${cur.weekKey}`,
          cur.label
        );
        live.isLive = true;
        realReports.push(live);
      }
    }
  }

  const sortedReal = realReports.sort(
    (a, b) => new Date(b.startISO).getTime() - new Date(a.startISO).getTime()
  );
  const sortedSample = sampleReports.sort(
    (a, b) => new Date(b.startISO).getTime() - new Date(a.startISO).getTime()
  );

  return [...sortedReal, ...sortedSample];
};

// ============================================================
// STYLES
// ============================================================
const cardStyle: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  border: '1px solid rgba(102,116,90,0.14)',
  boxShadow: '0 1px 2px rgba(18,60,50,0.04)',
};

const fieldCls =
  'w-full h-10 rounded-full border text-[12px] ps-9 pe-3 focus:outline-none transition-colors border-[rgba(102,116,90,0.2)] focus:border-[#C49A5A]';

const fieldStyle: React.CSSProperties = {
  backgroundColor: 'rgba(247,243,234,0.6)',
  color: THEME.charcoal,
};

const pillFieldCls =
  'h-10 rounded-full border text-[13px] font-bold px-4 focus:outline-none transition-colors border-[rgba(102,116,90,0.25)] focus:border-[#C49A5A]';

// ============================================================
// ICONS
// ============================================================
const svgBase = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const ic = (d: string, cls = 'w-4 h-4') => (
  <svg {...svgBase} className={cls} aria-hidden="true">
    <path d={d} />
  </svg>
);

const Icons = {
  pdf: ic(
    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8'
  ),
  calendar: ic(
    'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    'w-3.5 h-3.5'
  ),
  close: ic('M18 6 6 18M6 6l12 12', 'w-3.5 h-3.5'),
  filter: ic('M3 5h18l-7 8v6l-4 2v-8z'),
  clock: ic('M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2', 'w-5 h-5'),
  refresh: ic(
    'M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5',
    'w-3.5 h-3.5'
  ),
  download: ic(
    'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
    'w-3.5 h-3.5'
  ),
  chevron: ic('m6 9 6 6 6-6', 'w-3.5 h-3.5'),
  chart: ic('M3 3v18h18M7 15l4-4 3 3 5-6', 'w-5 h-5'),
  print: ic(
    'M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z',
    'w-3.5 h-3.5'
  ),
  check: ic('M20 6 9 17l-5-5', 'w-2.5 h-2.5'),
};

// ============================================================
// SMALL UI PIECES
// ============================================================
function Badge({
  text,
  tone,
}: {
  text: string;
  tone: 'brass' | 'forest';
}): React.JSX.Element {
  return (
    <span
      className="text-[9px] font-bold px-2 py-0.5 rounded-full leading-none tracking-wide"
      style={
        tone === 'brass'
          ? { backgroundColor: 'rgba(196,154,90,0.2)', color: THEME.warmBrass }
          : { backgroundColor: THEME.deepForest, color: THEME.warmIvory }
      }
    >
      {text}
    </span>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <div
      className="min-w-0 rounded-2xl px-3 py-2"
      style={{ backgroundColor: 'rgba(247,243,234,0.7)' }}
    >
      <p
        className="text-[10px] font-semibold truncate"
        style={{ color: THEME.mutedOlive }}
      >
        {label}
      </p>
      <p
        className="text-[12.5px] font-bold mt-0.5 break-words"
        style={{ color: THEME.charcoal }}
      >
        {value}
      </p>
    </div>
  );
}

function KpiCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}): React.JSX.Element {
  return (
    <div className="rounded-3xl px-4 py-3 min-w-0" style={cardStyle}>
      <div className="flex items-center gap-2">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: accent || THEME.warmBrass }}
        />
        <p
          className="text-[10px] font-semibold uppercase tracking-wider truncate"
          style={{ color: THEME.mutedOlive }}
        >
          {label}
        </p>
      </div>
      <p
        className="text-[16px] font-bold mt-1 break-words"
        style={{ color: accent || THEME.deepForest }}
      >
        {value}
      </p>
    </div>
  );
}

function ReportCard({
  report,
  tr,
  lang,
  onDownload,
}: {
  report: WeeklyReportData;
  tr: Translations;
  lang: Language;
  onDownload: (r: WeeklyReportData) => void;
}): React.JSX.Element {
  const [justSaved, setJustSaved] = useState(false);
  const positive = report.netProfitLoss >= 0;
  return (
    <div
      className="rounded-3xl p-4 flex flex-col gap-3 w-full min-w-0 transition-shadow hover:shadow-md"
      style={{
        ...cardStyle,
        borderColor:
          report.isLive
            ? 'rgba(18,60,50,0.45)'
            : report.isSample
              ? 'rgba(196,154,90,0.4)'
              : 'rgba(102,116,90,0.14)',
      }}
    >
      {/* Top: week + badges */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: THEME.mutedOlive }}
            >
              {tr.week}
            </span>
            {report.isLive && <Badge text={tr.liveBadge} tone="forest" />}
            {report.isSample && <Badge text={tr.sampleBadge} tone="brass" />}
          </div>
          <p
            className="text-[13px] font-bold leading-snug"
            style={{ color: THEME.deepForest }}
          >
            {report.label}
          </p>
        </div>
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: 'rgba(196,154,90,0.15)',
            color: THEME.warmBrass,
          }}
        >
          {Icons.pdf}
        </span>
      </div>

      {/* Net result */}
      <div
        className="rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2"
        style={{
          backgroundColor: positive
            ? 'rgba(18,60,50,0.07)'
            : 'rgba(196,154,90,0.16)',
        }}
      >
        <span
          className="text-[11px] font-semibold"
          style={{ color: THEME.mutedOlive }}
        >
          {positive ? tr.netProfit : tr.netLoss}
        </span>
        <span
          className="text-[16px] font-bold"
          style={{ color: positive ? THEME.deepForest : THEME.warmBrass }}
        >
          {formatPrice(Math.abs(report.netProfitLoss), lang)}
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <Stat label={tr.wTotalSales} value={formatPrice(report.totalSales, lang)} />
        <Stat
          label={tr.wPaymentsReceived}
          value={formatPrice(report.totalPaymentsReceived, lang)}
        />
        <Stat
          label={tr.wOutstanding}
          value={formatPrice(report.outstandingBalances, lang)}
        />
        <Stat
          label={tr.wTotalPurchases}
          value={formatPrice(report.totalPurchases, lang)}
        />
      </div>

      {/* Footer */}
      <div
        className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-3 border-t mt-auto"
        style={{ borderColor: 'rgba(102,116,90,0.12)' }}
      >
        <span
          className="text-[10px] whitespace-nowrap"
          style={{ color: THEME.mutedOlive }}
        >
          {tr.generatedAtLabel} {formatClock(report.generatedAt)}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => downloadWeeklyReportPdf(report, lang, tr)}
            title={tr.printLabel}
            aria-label={tr.printLabel}
            className="h-8 w-8 flex-shrink-0 rounded-full border flex items-center justify-center cursor-pointer transition hover:brightness-95"
            style={{
              backgroundColor: THEME.warmIvory,
              color: THEME.deepForest,
              borderColor: 'rgba(102,116,90,0.25)',
            }}
          >
            {Icons.print}
          </button>
          <button
            type="button"
            onClick={() => {
              onDownload(report);
              setJustSaved(true);
              setTimeout(() => setJustSaved(false), 2000);
            }}
            title={tr.downloadPdfShort}
            className="h-8 px-3.5 flex-shrink-0 whitespace-nowrap leading-none rounded-full text-[11px] font-bold cursor-pointer flex items-center justify-center gap-1.5 transition hover:brightness-110"
            style={{
              backgroundColor: justSaved ? THEME.mutedOlive : THEME.deepForest,
              color: THEME.warmIvory,
            }}
          >
            <span className="flex-shrink-0">
              {justSaved ? Icons.check : Icons.download}
            </span>
            <span className="whitespace-nowrap">
              {justSaved ? tr.savedShort : tr.downloadPdfShort}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ⏱️ SCHEDULE STATUS (own 1-second clock so the page doesn't re-render)
// ============================================================
function ScheduleStatus({
  enabled,
  lastRunAt,
  nextRunAt,
  totalMs,
  tr,
  lastSavedName,
  saveError,
  done,
}: {
  enabled: boolean;
  lastRunAt: number;
  nextRunAt: number | null;
  totalMs: number;
  tr: Translations;
  lastSavedName: string | null;
  saveError: boolean;
  done: boolean;
}): React.JSX.Element {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const formatDuration = (ms: number): string => {
    const total = Math.max(0, Math.ceil(ms / 1000));
    const d = Math.floor(total / 86400);
    const h = Math.floor((total % 86400) / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const parts: string[] = [];
    if (d > 0) parts.push(`${d} ${tr.uDay}`);
    if (d > 0 || h > 0) parts.push(`${h} ${tr.uHour}`);
    if (d > 0 || h > 0 || m > 0) parts.push(`${m} ${tr.uMin}`);
    parts.push(`${s} ${tr.uSec}`);
    return parts.join(' ');
  };

  const remaining = nextRunAt ? Math.max(0, nextRunAt - now) : 0;
  const progress =
    enabled && nextRunAt && totalMs > 0
      ? Math.max(0, Math.min(100, (1 - remaining / totalMs) * 100))
      : 0;

  return (
    <div className="mt-3">
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: 'rgba(102,116,90,0.15)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000 ease-linear"
          style={{
            width: `${progress}%`,
            backgroundColor: THEME.warmBrass,
          }}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 mt-2">
        <span className="text-[11px]" style={{ color: THEME.mutedOlive }}>
          {tr.lastGenerated}:{' '}
          <b style={{ color: THEME.charcoal }}>{formatClock(lastRunAt)}</b>
        </span>
        <span className="text-[11px]" style={{ color: THEME.mutedOlive }}>
          {enabled && nextRunAt ? (
            <>
              {tr.nextIn}:{' '}
              <b style={{ color: THEME.deepForest }}>{formatDuration(remaining)}</b>
            </>
          ) : (
            done ? tr.autoDone : tr.autoPaused
          )}
        </span>
      </div>
      {saveError ? (
        <p className="text-[11px] font-bold mt-2" style={{ color: THEME.warmBrass }}>
          {tr.saveFailed}
        </p>
      ) : lastSavedName ? (
        <p
          className="text-[11px] mt-2 flex items-start gap-1.5 break-all"
          style={{ color: THEME.mutedOlive }}
        >
          <span
            className="mt-[1px] w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: THEME.deepForest, color: THEME.warmIvory }}
          >
            {Icons.check}
          </span>
          <span>
            {tr.savedToDownloads}:{' '}
            <b style={{ color: THEME.deepForest }}>{lastSavedName}</b>
          </span>
        </p>
      ) : null}
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function WeeklyReportsPage(): React.JSX.Element {
  const language = getStoredLanguage();
  const tr = t[language] as Translations;
  const rtl = isRTLLang(language);

  const [reports, setReports] = useState<WeeklyReportData[]>(() =>
    buildAllReports(loadTransactions())
  );
  const [reportFrom, setReportFrom] = useState('');
  const [reportTo, setReportTo] = useState('');

  // ---- schedule state ----
  const [schedule, setSchedule] = useState<Schedule>(() => loadSchedule());
  const [draftValue, setDraftValue] = useState<string>(() =>
    String(loadSchedule().value)
  );
  const [draftUnit, setDraftUnit] = useState<IntervalUnit>(
    () => loadSchedule().unit
  );
  const [intervalError, setIntervalError] = useState(false);
  const [lastRunAt, setLastRunAt] = useState<number>(() => Date.now());
  const [nextRunAt, setNextRunAt] = useState<number | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [lastSavedName, setLastSavedName] = useState<string | null>(null);
  const [saveError, setSaveError] = useState(false);
  const [autoDone, setAutoDone] = useState(false);

  const saveReportFile = useCallback((r: WeeklyReportData): void => {
    try {
      const name = savePdf(r);
      setLastSavedName(name);
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, []);

  // Rebuild the reports and (optionally) save the newest report as a PDF in Downloads
  const generateAndSave = useCallback(
    (save: boolean): void => {
      const fresh = buildAllReports(loadTransactions());
      setReports(fresh);
      setLastRunAt(Date.now());
      if (save) {
        const pick = fresh.find((r) => !r.isSample) ?? fresh[0];
        if (pick) saveReportFile(pick);
      }
    },
    [saveReportFile]
  );

  // Refresh on screen only (no file) — used for storage / focus events
  const regenerate = useCallback((): void => {
    generateAndSave(false);
  }, [generateAndSave]);

  // Auto-generate timer (checks every 500ms so very long intervals never overflow setTimeout)
  useEffect(() => {
    if (!schedule.enabled) {
      setNextRunAt(null);
      return;
    }
    const ms = scheduleToMs(schedule);
    const next = Date.now() + ms;
    setNextRunAt(next);
    const id = setInterval(() => {
      if (Date.now() >= next) {
        // ONE-SHOT: generate once, then switch Auto OFF
        clearInterval(id);
        generateAndSave(schedule.autoSave);
        const done: Schedule = { ...schedule, enabled: false };
        setSchedule(done);
        saveSchedule(done);
        setNextRunAt(null);
        setAutoDone(true);
      }
    }, 500);
    return () => clearInterval(id);
  }, [schedule, resetKey, generateAndSave]);

  // Refresh when transactions change
  useEffect(() => {
    const onStorage = (e: StorageEvent): void => {
      if (
        e.key === TRANSACTIONS_STORAGE_KEY ||
        e.key === DOCUMENTS_KEY ||
        e.key === 'zakhira_user'
      ) {
        regenerate();
      }
    };
    const onCustom = (): void => regenerate();
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onCustom);
    window.addEventListener('zakhira:sales-updated', onCustom as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onCustom);
      window.removeEventListener('zakhira:sales-updated', onCustom as EventListener);
    };
  }, [regenerate]);

  const updateSchedule = (next: Schedule): void => {
    setSchedule(next);
    saveSchedule(next);
  };

  const applyInterval = (value: number, unit: IntervalUnit): void => {
    if (
      !Number.isInteger(value) ||
      value < 1 ||
      value * UNIT_MS[unit] > MAX_INTERVAL_MS
    ) {
      setIntervalError(true);
      return;
    }
    setIntervalError(false);
    setAutoDone(false);
    setDraftValue(String(value));
    setDraftUnit(unit);
    updateSchedule({ enabled: true, value, unit, autoSave: schedule.autoSave });
  };

  const handleApply = (): void => {
    applyInterval(Number(draftValue), draftUnit);
  };

  const handleToggle = (): void => {
    setAutoDone(false);
    updateSchedule({ ...schedule, enabled: !schedule.enabled });
  };

  const handleGenerateNow = (): void => {
    generateAndSave(true); // always saves a PDF when the user clicks
    setResetKey((k) => k + 1); // restart the countdown from now
  };

  const handleAutoSaveToggle = (): void => {
    updateSchedule({ ...schedule, autoSave: !schedule.autoSave });
  };

  const unitText: Record<IntervalUnit, string> = {
    seconds: tr.unitSeconds,
    minutes: tr.unitMinutes,
    hours: tr.unitHours,
    days: tr.unitDays,
    weeks: tr.unitWeeks,
  };
  const unitShort: Record<IntervalUnit, string> = {
    seconds: tr.uSec,
    minutes: tr.uMin,
    hours: tr.uHour,
    days: tr.uDay,
    weeks: tr.uWeek,
  };

  const dirty =
    draftValue !== String(schedule.value) || draftUnit !== schedule.unit;

  // ---- filters ----
  const filteredReports = useMemo(() => {
    let list = [...reports];
    if (reportFrom) {
      const fromMs = new Date(reportFrom).getTime();
      list = list.filter((r) => new Date(r.startISO).getTime() >= fromMs);
    }
    if (reportTo) {
      const toMs = new Date(reportTo).getTime() + 86400000;
      list = list.filter((r) => new Date(r.endISO).getTime() <= toMs);
    }
    return list.sort(
      (a, b) => new Date(b.startISO).getTime() - new Date(a.startISO).getTime()
    );
  }, [reports, reportFrom, reportTo]);

  const hasFilters = reportFrom !== '' || reportTo !== '';
  const resetFilters = (): void => {
    setReportFrom('');
    setReportTo('');
  };

  const realCount = reports.filter((r) => !r.isSample).length;
  const sampleCount = reports.filter((r) => r.isSample).length;

  // KPI totals (real data only when available, so demo numbers never mix in)
  const kpi = useMemo(() => {
    const real = filteredReports.filter((r) => !r.isSample);
    const src = real.length > 0 ? real : filteredReports;
    return {
      count: src.length,
      sales: src.reduce((s, r) => s + r.totalSales, 0),
      received: src.reduce((s, r) => s + r.totalPaymentsReceived, 0),
      net: src.reduce((s, r) => s + r.netProfitLoss, 0),
    };
  }, [filteredReports]);

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className="min-h-screen p-4 lg:p-6"
      style={{ backgroundColor: THEME.warmIvory }}
    >
      {/* HERO HEADER */}
      <div
        className="rounded-3xl px-5 py-4 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
        style={{
          background: THEME.deepForest,
          boxShadow: '0 6px 18px rgba(18,60,50,0.22)',
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: THEME.warmBrass,
              color: THEME.warmIvory,
              boxShadow:
                'inset 0 1px 0 rgba(247,243,234,0.25), 0 4px 12px rgba(196,154,90,0.35)',
            }}
          >
            {Icons.chart}
          </span>
          <div className="min-w-0">
            <h1 className="text-lg font-bold" style={{ color: THEME.warmIvory }}>
              {tr.pageTitle}
            </h1>
            <p className="text-[11px]" style={{ color: 'rgba(247,243,234,0.7)' }}>
              {tr.pageSubtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {realCount > 0 && (
            <span
              className="text-[10px] font-bold px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: 'rgba(247,243,234,0.14)',
                color: THEME.warmIvory,
              }}
            >
              {realCount} {tr.realLabel}
            </span>
          )}
          {sampleCount > 0 && (
            <span
              className="text-[10px] font-bold px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: 'rgba(196,154,90,0.25)',
                color: THEME.warmBrass,
              }}
            >
              {sampleCount} {tr.sampleBadge}
            </span>
          )}
        </div>
      </div>

      {/* AUTO-GENERATE SCHEDULE */}
      <div className="rounded-3xl p-4 mb-4" style={cardStyle}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: 'rgba(196,154,90,0.16)',
                color: THEME.warmBrass,
              }}
            >
              {Icons.clock}
            </span>
            <div className="min-w-0">
              <h2 className="text-[13px] font-bold" style={{ color: THEME.deepForest }}>
                {tr.autoTitle}
              </h2>
              <p className="text-[11px]" style={{ color: THEME.mutedOlive }}>
                {tr.autoSubtitle}
              </p>
            </div>
          </div>

          {/* ON / OFF switch */}
          <button
            type="button"
            role="switch"
            aria-checked={schedule.enabled}
            onClick={handleToggle}
            className="flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            <span
              className="text-[11px] font-bold"
              style={{
                color: schedule.enabled ? THEME.deepForest : THEME.mutedOlive,
              }}
            >
              {schedule.enabled ? tr.autoOn : tr.autoOff}
            </span>
            <span
              className="relative inline-block w-11 h-6 rounded-full transition-colors"
              style={{
                backgroundColor: schedule.enabled
                  ? THEME.deepForest
                  : 'rgba(102,116,90,0.3)',
              }}
            >
              <span
                className="absolute top-[3px] w-[18px] h-[18px] rounded-full transition-all"
                style={{
                  backgroundColor: THEME.warmIvory,
                  insetInlineStart: schedule.enabled ? 23 : 3,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                }}
              />
            </span>
          </button>
        </div>

        {/* Interval controls */}
        <div className="mt-4 flex flex-wrap items-end gap-2.5">
          <div>
            <label
              className="block text-[10px] font-semibold mb-1"
              style={{ color: THEME.charcoal }}
            >
              {tr.every}
            </label>
            <input
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              value={draftValue}
              onChange={(e) => {
                setDraftValue(e.target.value);
                setIntervalError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApply();
              }}
              className={`${pillFieldCls} w-28 text-center`}
              style={{
                ...fieldStyle,
                borderColor: intervalError ? THEME.warmBrass : undefined,
              }}
            />
          </div>

          <div className="relative">
            <label
              className="block text-[10px] font-semibold mb-1 invisible"
              aria-hidden="true"
            >
              {tr.every}
            </label>
            <select
              value={draftUnit}
              onChange={(e) => {
                setDraftUnit(e.target.value as IntervalUnit);
                setIntervalError(false);
              }}
              className={`${pillFieldCls} appearance-none pe-9 cursor-pointer min-w-[130px]`}
              style={fieldStyle}
            >
              {UNIT_ORDER.map((u) => (
                <option key={u} value={u}>
                  {unitText[u]}
                </option>
              ))}
            </select>
            <span
              className="absolute end-3.5 bottom-[13px] pointer-events-none"
              style={{ color: THEME.mutedOlive }}
            >
              {Icons.chevron}
            </span>
          </div>

          <button
            type="button"
            onClick={handleApply}
            className="h-10 px-5 rounded-full text-[12px] font-bold cursor-pointer transition hover:brightness-95"
            style={{
              background: THEME.warmBrass,
              color: THEME.warmIvory,
              boxShadow: dirty
                ? 'inset 0 1px 0 rgba(247,243,234,0.25), 0 4px 12px rgba(196,154,90,0.45)'
                : 'inset 0 1px 0 rgba(247,243,234,0.25)',
              opacity: dirty || !schedule.enabled ? 1 : 0.75,
            }}
          >
            {tr.apply}
          </button>

          <button
            type="button"
            onClick={handleGenerateNow}
            className="h-10 px-4 rounded-full text-[12px] font-bold cursor-pointer flex items-center gap-1.5 transition hover:brightness-110"
            style={{ backgroundColor: THEME.deepForest, color: THEME.warmIvory }}
          >
            {Icons.refresh}
            {tr.generateNow}
          </button>
        </div>

        {intervalError && (
          <p className="text-[11px] font-semibold mt-2" style={{ color: THEME.warmBrass }}>
            {tr.invalidInterval}
          </p>
        )}

        {/* Quick picks */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-semibold me-1" style={{ color: THEME.mutedOlive }}>
            {tr.quickPick}
          </span>
          {PRESETS.map((p) => {
            const active =
              schedule.enabled &&
              schedule.value === p.value &&
              schedule.unit === p.unit;
            return (
              <button
                key={`${p.value}-${p.unit}`}
                type="button"
                onClick={() => applyInterval(p.value, p.unit)}
                className="h-7 px-3 rounded-full text-[11px] font-bold cursor-pointer border transition"
                style={{
                  backgroundColor: active ? THEME.deepForest : THEME.warmIvory,
                  color: active ? THEME.warmIvory : THEME.deepForest,
                  borderColor: active ? THEME.deepForest : 'rgba(102,116,90,0.25)',
                }}
              >
                {p.value} {unitShort[p.unit]}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={schedule.autoSave}
          onClick={handleAutoSaveToggle}
          className="mt-3 h-8 px-3.5 rounded-full text-[11px] font-bold cursor-pointer flex items-center gap-2 border transition"
          style={{
            backgroundColor: schedule.autoSave
              ? 'rgba(18,60,50,0.08)'
              : THEME.warmIvory,
            color: THEME.deepForest,
            borderColor: schedule.autoSave
              ? 'rgba(18,60,50,0.4)'
              : 'rgba(102,116,90,0.25)',
          }}
        >
          <span
            className="w-4 h-4 rounded-full flex items-center justify-center border"
            style={{
              backgroundColor: schedule.autoSave ? THEME.deepForest : 'transparent',
              borderColor: schedule.autoSave ? THEME.deepForest : THEME.mutedOlive,
              color: THEME.warmIvory,
            }}
          >
            {schedule.autoSave && Icons.check}
          </span>
          {tr.autoSaveLabel}
        </button>

        <ScheduleStatus
          enabled={schedule.enabled}
          lastRunAt={lastRunAt}
          nextRunAt={nextRunAt}
          totalMs={scheduleToMs(schedule)}
          tr={tr}
          lastSavedName={lastSavedName}
          saveError={saveError}
          done={autoDone}
        />
      </div>

      {reports.length === 0 ? (
        <div className="rounded-3xl p-8 text-center" style={cardStyle}>
          <h3 className="text-[13px] font-bold mb-1" style={{ color: THEME.deepForest }}>
            {tr.noReportsAtAll}
          </h3>
          <p className="text-[11px]" style={{ color: THEME.mutedOlive }}>
            {tr.noReportsYet}
          </p>
        </div>
      ) : (
        <>
          {/* KPI STRIP */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <KpiCard label={tr.kpiReports} value={String(kpi.count)} />
            <KpiCard label={tr.wTotalSales} value={formatPrice(kpi.sales, language)} />
            <KpiCard
              label={tr.wPaymentsReceived}
              value={formatPrice(kpi.received, language)}
              accent={THEME.mutedOlive}
            />
            <KpiCard
              label={kpi.net >= 0 ? tr.netProfit : tr.netLoss}
              value={formatPrice(Math.abs(kpi.net), language)}
              accent={kpi.net >= 0 ? THEME.deepForest : THEME.warmBrass}
            />
          </div>

          {/* FILTERS */}
          <div className="rounded-3xl p-4 mb-4" style={cardStyle}>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
              {(
                [
                  [tr.reportDateFrom, reportFrom, setReportFrom],
                  [tr.reportDateTo, reportTo, setReportTo],
                ] as const
              ).map(([label, value, set]) => (
                <div key={label} className="min-w-0">
                  <label
                    className="block text-[10px] font-semibold mb-1"
                    style={{ color: THEME.charcoal }}
                  >
                    {label}
                  </label>
                  <div className="relative">
                    <span
                      className="absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none"
                      style={{ color: THEME.mutedOlive }}
                    >
                      {Icons.calendar}
                    </span>
                    <input
                      type="date"
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      className={fieldCls}
                      style={fieldStyle}
                    />
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-2">
                <span
                  className="text-[11px] font-bold px-3 h-10 rounded-full flex items-center"
                  style={{
                    backgroundColor: 'rgba(102,116,90,0.1)',
                    color: THEME.mutedOlive,
                  }}
                >
                  {filteredReports.length} / {reports.length}
                </span>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="h-10 px-4 rounded-full border text-[12px] font-bold cursor-pointer flex items-center gap-1.5 border-[rgba(102,116,90,0.2)]"
                    style={{ backgroundColor: THEME.warmIvory, color: THEME.mutedOlive }}
                  >
                    {Icons.close}
                    {tr.resetReportFilters}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* REPORT CARDS — 3 per row */}
          {filteredReports.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.map((r) => (
                <ReportCard
                  key={r.weekKey}
                  report={r}
                  tr={tr}
                  lang={language}
                  onDownload={saveReportFile}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl p-6 text-center" style={cardStyle}>
              <p className="text-[12px]" style={{ color: THEME.mutedOlive }}>
                {tr.noMatchingReports}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}