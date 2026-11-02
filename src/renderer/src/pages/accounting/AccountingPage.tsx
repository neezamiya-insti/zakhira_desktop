/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable prettier/prettier */
/* eslint-disable react-refresh/only-export-components */
import { useEffect, useMemo, useState } from 'react';
import AccountingDashboard from './AccountingDashboard';
import AccountingCharts from './AccountingCharts';

// ============================================================
// 🎨 THEME
// ============================================================
const THEME = {
  warmIvory: '#F7F3EA',
  deepForest: '#123C32',
  mutedOlive: '#66745A',
  charcoal: '#252A28',
  warmBrass: '#C49A5A',
  success: '#3B7A57',
  danger: '#B85C4A',
  purple: '#8A6A9E',
  pink: '#C26B80',
};

// ============================================================
// TYPES
// ============================================================
export type TransactionType = 'In' | 'Out' | 'Return';
export type PaymentMode = 'Cash' | 'Card' | 'Bank Transfer' | 'Other';

export type Transaction = {
  id: string;
  transactionNo: string;
  date: string;
  customerName: string;
  companyName: string;
  invoiceRef: string;
  invoiceFile?: string;
  invoiceFileName?: string;
  type: TransactionType;
  amount: number;
  status: 'Paid' | 'Partially Paid' | 'Returned'; // ✅ 'Pending' removed
  mode: PaymentMode;
  linkedInvoiceId?: string;
  sourceDocumentId?: string;
  sourceModule?: 'sales' | 'inventory' | 'manual';
  notes?: string;
  createdAt: string;
  hasReturn?: boolean;
  returnTransactionId?: string;
  originalTransactionId?: string;
  returnNumber?: string;
};

type TxnStatus = Transaction['status'];

// ============================================================
// 🌍 LANGUAGE
// ============================================================
type Language = 'en' | 'ar' | 'ur' | 'hi';

const t = {
  en: {
    pageTitle: 'Accounting',
    pageSubtitle: 'Track In, Out, and Return transactions',
    exportPdf: 'Export PDF',
    newEntry: 'New Entry',
    statAll: 'All',
    statIn: 'In',
    statOut: 'Out',
    statReturn: 'Return',
    totalSuffix: (amount: string) => `${amount} total`,
    filters: 'Filters',
    search: 'Search',
    searchPh: 'Txn no, customer, company, invoice...',
    sort: 'Sort',
    sortRecent: 'Recent first',
    sortOldest: 'Oldest first',
    sortAmountHigh: 'Amount: High first',
    sortAmountLow: 'Amount: Low first',
    transactionMode: 'Transaction Mode',
    all: 'All',
    dateRangePreset: 'Date Range (preset)',
    preset7d: '7 Days',
    preset30d: '30 Days',
    preset3m: '3 Months',
    preset6m: '6 Months',
    preset1y: '1 Year',
    customFrom: 'Custom From',
    customTo: 'Custom To',
    clearFilters: 'Clear Filters',
    showing: 'Showing',
    entries: 'entries',
    net: 'Net',
    colDate: 'Date',
    colTxnCustomer: 'Txn / Customer',
    colInvoice: 'Invoice',
    colMode: 'Mode',
    colType: 'Type',
    colAmount: 'Amount',
    colStatus: 'Status',
    noEntries: 'No entries found',
    noEntriesFiltered: 'Try adjusting your filters',
    noEntriesFirst: 'Create your first transaction',
    createFirst: 'Create First Entry',
    newEntryTitle: 'New Entry',
    newEntrySubtitle: 'Record a transaction (In / Out / Return)',
    typeLabel: 'Type',
    linkOriginalInvoice: 'Link to Original Invoice',
    selectInvoice: 'Select an invoice to link',
    change: 'Change',
    customerName: 'Customer Name',
    customerNamePh: 'e.g. Ahmed Al-Farsi',
    companyName: 'Company Name',
    companyNamePh: 'e.g. Al-Farsi Trading',
    invoiceRef: 'Invoice Reference',
    invoiceRefPh: 'INV-2025-1042',
    invoiceFile: 'Invoice File (optional)',
    invoiceFilePh: 'Upload image or PDF (max 2MB)',
    amountSar: 'Amount (SAR)',
    date: 'Date',
    status: 'Status',
    paid: 'Paid',
    pending: 'Pending',
    returned: 'Returned',
    transactionModeLabel: 'Transaction Mode',
    notes: 'Notes',
    notesReturnPh: 'e.g. Customer returned item — wrong size',
    notesPh: 'Additional details...',
    saveEntry: 'Save Entry',
    cancel: 'Cancel',
    errCustomer: 'Customer name is required',
    errAmount: 'Amount must be greater than 0',
    errDate: 'Date is required',
    errLinkInvoice: 'Please link the original invoice for this return',
    errFileTooLarge: 'File too large (max 2MB)',
    amountLabel: 'Amount',
    customer: 'Customer',
    transaction: 'Transaction',
    txnNo: 'Txn No:',
    invoiceRefLabel: 'Invoice Ref:',
    modeLabel: 'Mode:',
    dateLabel: 'Date:',
    linkedOriginalInvoice: 'Linked Original Invoice',
    originalAmount: 'Original Amount',
    open: 'Open',
    linkedReturns: (n: number) => `Linked Returns (${n})`,
    hasReturn: 'HAS RETURN',
    attachedInvoice: 'Attached Invoice',
    downloadInvoice: 'Download Invoice',
    autoEntryFrom: (mod: string) => `Auto entry from ${mod}`,
    linkInvoiceTitle: 'Link to Original Invoice',
    linkInvoiceSubtitle: 'Select the credited invoice this return applies to',
    searchInvoicePh: 'Search by invoice, customer, txn no.',
    noInvoices: 'No invoices available to link',
    noMatchingInvoices: 'No matching invoices',
    deleteTitle: 'Delete Entry?',
    deleteConfirm: (no: string) => `Delete ${no}? This cannot be undone.`,
    delete: 'Delete',
    reportTitle: 'REPORT',
    reportGenerated: 'Transaction Report',
    generatedBy: 'Generated by Zakhira BMS',
    copied: 'Copied',
    typeIn: 'In',
    typeOut: 'Out',
    typeReturn: 'Return',
    statusPaid: 'Paid',
    statusPartial: 'Partially Paid',
    // ✅ statusPending removed
    statusReturned: 'Returned',
    fieldCustomerName: 'Customer Name',
    fieldCompanyName: 'Company Name',
    fieldTxnNo: 'Transaction No',
    fieldInvoiceRef: 'Invoice Ref',
    fieldMode: 'Payment Mode',
    fieldDate: 'Date',
    fieldType: 'Type',
    fieldStatus: 'Status',
    fieldAmount: 'Amount',
    fieldNotes: 'Notes',
    realInvoiceDetails: 'Real Invoice Details',
    realInvoiceTitle: (n: string) => `Original Invoice — ${n}`,
    billTo: 'Bill To',
    items: 'Items',
    subtotal: 'Subtotal',
    discount: 'Discount',
    vat: 'VAT',
    grandTotal: 'Grand Total',
    product: 'Product',
    qty: 'Qty',
    price: 'Price',
    total: 'Total',
    issueDate: 'Issue Date',
    createdBy: 'Created By',
    close: 'Close',
    invoiceNotFound: 'Invoice details not available — the source document may have been deleted.',
  },
  ar: {
    pageTitle: 'المحاسبة',
    pageSubtitle: 'تتبع معاملات الدخول والخروج والمرتجعات',
    exportPdf: 'تصدير PDF',
    newEntry: 'قيد جديد',
    statAll: 'الكل',
    statIn: 'دخول',
    statOut: 'خروج',
    statReturn: 'مرتجع',
    totalSuffix: (amount: string) => `${amount} الإجمالي`,
    filters: 'الفلاتر',
    search: 'بحث',
    searchPh: 'رقم القيد، العميل، الشركة، الفاتورة...',
    sort: 'ترتيب',
    sortRecent: 'الأحدث أولاً',
    sortOldest: 'الأقدم أولاً',
    sortAmountHigh: 'المبلغ: الأعلى أولاً',
    sortAmountLow: 'المبلغ: الأدنى أولاً',
    transactionMode: 'طريقة الدفع',
    all: 'الكل',
    dateRangePreset: 'نطاق التاريخ (سريع)',
    preset7d: '7 أيام',
    preset30d: '30 يوم',
    preset3m: '3 أشهر',
    preset6m: '6 أشهر',
    preset1y: 'سنة',
    customFrom: 'من تاريخ',
    customTo: 'إلى تاريخ',
    clearFilters: 'مسح الفلاتر',
    showing: 'عرض',
    entries: 'قيود',
    net: 'الصافي',
    colDate: 'التاريخ',
    colTxnCustomer: 'القيد / العميل',
    colInvoice: 'الفاتورة',
    colMode: 'الطريقة',
    colType: 'النوع',
    colAmount: 'المبلغ',
    colStatus: 'الحالة',
    noEntries: 'لا توجد قيود',
    noEntriesFiltered: 'جرّب تعديل الفلاتر',
    noEntriesFirst: 'أنشئ أول معاملة',
    createFirst: 'إنشاء أول قيد',
    newEntryTitle: 'قيد جديد',
    newEntrySubtitle: 'تسجيل معاملة (دخول / خروج / مرتجع)',
    typeLabel: 'النوع',
    linkOriginalInvoice: 'ربط بالفاتورة الأصلية',
    selectInvoice: 'اختر فاتورة للربط',
    change: 'تغيير',
    customerName: 'اسم العميل',
    customerNamePh: 'مثال: أحمد الفارسي',
    companyName: 'اسم الشركة',
    companyNamePh: 'مثال: الفارسي للتجارة',
    invoiceRef: 'مرجع الفاتورة',
    invoiceRefPh: 'INV-2025-1042',
    invoiceFile: 'ملف الفاتورة (اختياري)',
    invoiceFilePh: 'ارفع صورة أو PDF (بحد أقصى 2 ميجا)',
    amountSar: 'المبلغ (ريال)',
    date: 'التاريخ',
    status: 'الحالة',
    paid: 'مدفوع',
    pending: 'معلق',
    returned: 'مرتجع',
    transactionModeLabel: 'طريقة الدفع',
    notes: 'ملاحظات',
    notesReturnPh: 'مثال: العميل أرجع المنتج — مقاس خاطئ',
    notesPh: 'تفاصيل إضافية...',
    saveEntry: 'حفظ القيد',
    cancel: 'إلغاء',
    errCustomer: 'اسم العميل مطلوب',
    errAmount: 'يجب أن يكون المبلغ أكبر من 0',
    errDate: 'التاريخ مطلوب',
    errLinkInvoice: 'يرجى ربط الفاتورة الأصلية لهذا المرتجع',
    errFileTooLarge: 'الملف كبير جداً (بحد أقصى 2 ميجا)',
    amountLabel: 'المبلغ',
    customer: 'العميل',
    transaction: 'المعاملة',
    txnNo: 'رقم القيد:',
    invoiceRefLabel: 'مرجع الفاتورة:',
    modeLabel: 'الطريقة:',
    dateLabel: 'التاريخ:',
    linkedOriginalInvoice: 'الفاتورة الأصلية المرتبطة',
    originalAmount: 'المبلغ الأصلي',
    open: 'فتح',
    linkedReturns: (n: number) => `المرتجعات المرتبطة (${n})`,
    hasReturn: 'يوجد مرتجع',
    attachedInvoice: 'الفاتورة المرفقة',
    downloadInvoice: 'تحميل الفاتورة',
    autoEntryFrom: (mod: string) => `قيد تلقائي من ${mod}`,
    linkInvoiceTitle: 'ربط بالفاتورة الأصلية',
    linkInvoiceSubtitle: 'اختر الفاتورة المدينة التي ينطبق عليها هذا المرتجع',
    searchInvoicePh: 'ابحث بالفاتورة، العميل، رقم القيد.',
    noInvoices: 'لا توجد فواتير للربط',
    noMatchingInvoices: 'لا توجد فواتير مطابقة',
    deleteTitle: 'حذف القيد؟',
    deleteConfirm: (no: string) => `حذف ${no}؟ لا يمكن التراجع.`,
    delete: 'حذف',
    reportTitle: 'تقرير',
    reportGenerated: 'تقرير المعاملات',
    generatedBy: 'تم إنشاؤه بواسطة زخيرة',
    copied: 'تم النسخ',
    typeIn: 'دخول',
    typeOut: 'خروج',
    typeReturn: 'مرتجع',
    statusPaid: 'مدفوع',
    statusPartial: 'مدفوع جزئياً',
    statusReturned: 'مرتجع',
    fieldCustomerName: 'اسم العميل',
    fieldCompanyName: 'اسم الشركة',
    fieldTxnNo: 'رقم القيد',
    fieldInvoiceRef: 'مرجع الفاتورة',
    fieldMode: 'طريقة الدفع',
    fieldDate: 'التاريخ',
    fieldType: 'النوع',
    fieldStatus: 'الحالة',
    fieldAmount: 'المبلغ',
    fieldNotes: 'ملاحظات',
    realInvoiceDetails: 'تفاصيل الفاتورة الأصلية',
    realInvoiceTitle: (n: string) => `الفاتورة الأصلية — ${n}`,
    billTo: 'فاتورة إلى',
    items: 'العناصر',
    subtotal: 'المجموع الفرعي',
    discount: 'الخصم',
    vat: 'ضريبة القيمة المضافة',
    grandTotal: 'الإجمالي',
    product: 'المنتج',
    qty: 'الكمية',
    price: 'السعر',
    total: 'المجموع',
    issueDate: 'تاريخ الإصدار',
    createdBy: 'أنشأها',
    close: 'إغلاق',
    invoiceNotFound: 'تفاصيل الفاتورة غير متوفرة — قد يكون المستند المصدر محذوفاً.',
  },
  ur: {
    pageTitle: 'اکاؤنٹنگ',
    pageSubtitle: 'ان، آؤٹ اور ریٹرن لین دین ٹریک کریں',
    exportPdf: 'PDF ایکسپورٹ',
    newEntry: 'نیا اندراج',
    statAll: 'سب',
    statIn: 'ان',
    statOut: 'آؤٹ',
    statReturn: 'ریٹرن',
    totalSuffix: (amount: string) => `${amount} کل`,
    filters: 'فلٹرز',
    search: 'تلاش',
    searchPh: 'ٹرانزیکشن نمبر، گاہک، کمپنی، انوائس...',
    sort: 'ترتیب',
    sortRecent: 'حالیہ پہلے',
    sortOldest: 'پرانا پہلے',
    sortAmountHigh: 'رقم: زیادہ پہلے',
    sortAmountLow: 'رقم: کم پہلے',
    transactionMode: 'ادائیگی کا طریقہ',
    all: 'سب',
    dateRangePreset: 'تاریخ کی حد (پریسیٹ)',
    preset7d: '7 دن',
    preset30d: '30 دن',
    preset3m: '3 ماہ',
    preset6m: '6 ماہ',
    preset1y: '1 سال',
    customFrom: 'سے تاریخ',
    customTo: 'تک تاریخ',
    clearFilters: 'فلٹرز صاف کریں',
    showing: 'دکھا رہے ہیں',
    entries: 'اندراجات',
    net: 'نیٹ',
    colDate: 'تاریخ',
    colTxnCustomer: 'ٹرانزیکشن / گاہک',
    colInvoice: 'انوائس',
    colMode: 'طریقہ',
    colType: 'قسم',
    colAmount: 'رقم',
    colStatus: 'حالت',
    noEntries: 'کوئی اندراج نہیں ملا',
    noEntriesFiltered: 'فلٹرز ایڈجسٹ کریں',
    noEntriesFirst: 'اپنی پہلی ٹرانزیکشن بنائیں',
    createFirst: 'پہلا اندراج بنائیں',
    newEntryTitle: 'نیا اندراج',
    newEntrySubtitle: 'ٹرانزیکشن ریکارڈ کریں (ان / آؤٹ / ریٹرن)',
    typeLabel: 'قسم',
    linkOriginalInvoice: 'اصل انوائس سے لنک کریں',
    selectInvoice: 'لنک کرنے کے لیے انوائس منتخب کریں',
    change: 'تبدیل کریں',
    customerName: 'گاہک کا نام',
    customerNamePh: 'مثلاً: احمد الفارسی',
    companyName: 'کمپنی کا نام',
    companyNamePh: 'مثلاً: الفارسی ٹریڈنگ',
    invoiceRef: 'انوائس ریفرنس',
    invoiceRefPh: 'INV-2025-1042',
    invoiceFile: 'انوائس فائل (اختیاری)',
    invoiceFilePh: 'تصویر یا PDF اپ لوڈ کریں (زیادہ سے زیادہ 2MB)',
    amountSar: 'رقم (ریال)',
    date: 'تاریخ',
    status: 'حالت',
    paid: 'ادا شدہ',
    pending: 'زیر التواء',
    returned: 'واپس شدہ',
    transactionModeLabel: 'ادائیگی کا طریقہ',
    notes: 'نوٹس',
    notesReturnPh: 'مثلاً: گاہک نے آئٹم واپس کیا — غلط سائز',
    notesPh: 'اضافی تفصیلات...',
    saveEntry: 'اندراج محفوظ کریں',
    cancel: 'منسوخ',
    errCustomer: 'گاہک کا نام لازمی ہے',
    errAmount: 'رقم 0 سے زیادہ ہونی چاہیے',
    errDate: 'تاریخ لازمی ہے',
    errLinkInvoice: 'براہ کرم اس ریٹرن کے لیے اصل انوائس لنک کریں',
    errFileTooLarge: 'فائل بہت بڑی ہے (زیادہ سے زیادہ 2MB)',
    amountLabel: 'رقم',
    customer: 'گاہک',
    transaction: 'ٹرانزیکشن',
    txnNo: 'ٹرانزیکشن نمبر:',
    invoiceRefLabel: 'انوائس ریفرنس:',
    modeLabel: 'طریقہ:',
    dateLabel: 'تاریخ:',
    linkedOriginalInvoice: 'لنک شدہ اصل انوائس',
    originalAmount: 'اصل رقم',
    open: 'کھولیں',
    linkedReturns: (n: number) => `لنک شدہ ریٹرنز (${n})`,
    hasReturn: 'ریٹرن موجود',
    attachedInvoice: 'منسلک انوائس',
    downloadInvoice: 'انوائس ڈاؤن لوڈ کریں',
    autoEntryFrom: (mod: string) => `${mod} سے خودکار اندراج`,
    linkInvoiceTitle: 'اصل انوائس سے لنک کریں',
    linkInvoiceSubtitle: 'وہ کریڈٹ انوائس منتخب کریں جس پر یہ ریٹرن لاگو ہوتا ہے',
    searchInvoicePh: 'انوائس، گاہک، ٹرانزیکشن نمبر سے تلاش کریں۔',
    noInvoices: 'لنک کرنے کے لیے کوئی انوائس نہیں',
    noMatchingInvoices: 'کوئی مماثل انوائس نہیں',
    deleteTitle: 'اندراج حذف کریں؟',
    deleteConfirm: (no: string) => `${no} حذف کریں؟ اسے واپس نہیں کیا جا سکتا۔`,
    delete: 'حذف کریں',
    reportTitle: 'رپورٹ',
    reportGenerated: 'ٹرانزیکشن رپورٹ',
    generatedBy: 'Zakhira BMS کی طرف سے تیار کردہ',
    copied: 'کاپی ہو گیا',
    typeIn: 'ان',
    typeOut: 'آؤٹ',
    typeReturn: 'ریٹرن',
    statusPaid: 'ادا شدہ',
    statusPartial: 'جزوی ادا شدہ',
    statusReturned: 'واپس شدہ',
    fieldCustomerName: 'گاہک کا نام',
    fieldCompanyName: 'کمپنی کا نام',
    fieldTxnNo: 'ٹرانزیکشن نمبر',
    fieldInvoiceRef: 'انوائس ریفرنس',
    fieldMode: 'ادائیگی کا طریقہ',
    fieldDate: 'تاریخ',
    fieldType: 'قسم',
    fieldStatus: 'حالت',
    fieldAmount: 'رقم',
    fieldNotes: 'نوٹس',
    realInvoiceDetails: 'اصل انوائس کی تفصیلات',
    realInvoiceTitle: (n: string) => `اصل انوائس — ${n}`,
    billTo: 'بل بنام',
    items: 'اشیاء',
    subtotal: 'ذیلی مجموعہ',
    discount: 'رعایت',
    vat: 'ویٹ',
    grandTotal: 'کل رقم',
    product: 'پروڈکٹ',
    qty: 'مقدار',
    price: 'قیمت',
    total: 'کل',
    issueDate: 'اجرا کی تاریخ',
    createdBy: 'بنایا',
    close: 'بند کریں',
    invoiceNotFound: 'انوائس کی تفصیلات دستیاب نہیں — ماخذ دستاویز حذف ہو سکتی ہے۔',
  },
  hi: {
    pageTitle: 'लेखांकन',
    pageSubtitle: 'इन, आउट और रिटर्न लेनदेन ट्रैक करें',
    exportPdf: 'PDF निर्यात करें',
    newEntry: 'नई प्रविष्टि',
    statAll: 'सभी',
    statIn: 'इन',
    statOut: 'आउट',
    statReturn: 'रिटर्न',
    totalSuffix: (amount: string) => `${amount} कुल`,
    filters: 'फ़िल्टर',
    search: 'खोजें',
    searchPh: 'ट्रांजैक्शन नंबर, ग्राहक, कंपनी, चालान...',
    sort: 'क्रमबद्ध करें',
    sortRecent: 'हाल का पहले',
    sortOldest: 'पुराना पहले',
    sortAmountHigh: 'राशि: अधिक पहले',
    sortAmountLow: 'राशि: कम पहले',
    transactionMode: 'भुगतान मोड',
    all: 'सभी',
    dateRangePreset: 'तारीख़ सीमा (प्रीसेट)',
    preset7d: '7 दिन',
    preset30d: '30 दिन',
    preset3m: '3 महीने',
    preset6m: '6 महीने',
    preset1y: '1 वर्ष',
    customFrom: 'से तारीख़',
    customTo: 'तक तारीख़',
    clearFilters: 'फ़िल्टर हटाएँ',
    showing: 'दिखा रहे हैं',
    entries: 'प्रविष्टियाँ',
    net: 'नेट',
    colDate: 'तारीख़',
    colTxnCustomer: 'ट्रांजैक्शन / ग्राहक',
    colInvoice: 'चालान',
    colMode: 'मोड',
    colType: 'प्रकार',
    colAmount: 'राशि',
    colStatus: 'स्थिति',
    noEntries: 'कोई प्रविष्टि नहीं मिली',
    noEntriesFiltered: 'फ़िल्टर समायोजित करें',
    noEntriesFirst: 'अपना पहला लेनदेन बनाएँ',
    createFirst: 'पहली प्रविष्टि बनाएँ',
    newEntryTitle: 'नई प्रविष्टि',
    newEntrySubtitle: 'लेनदेन दर्ज करें (इन / आउट / रिटर्न)',
    typeLabel: 'प्रकार',
    linkOriginalInvoice: 'मूल चालान से लिंक करें',
    selectInvoice: 'लिंक करने के लिए चालान चुनें',
    change: 'बदलें',
    customerName: 'ग्राहक का नाम',
    customerNamePh: 'जैसे: अहमद अल-फ़ारसी',
    companyName: 'कंपनी का नाम',
    companyNamePh: 'जैसे: अल-फ़ारसी ट्रेडिंग',
    invoiceRef: 'चालान संदर्भ',
    invoiceRefPh: 'INV-2025-1042',
    invoiceFile: 'चालान फ़ाइल (वैकल्पिक)',
    invoiceFilePh: 'छवि या PDF अपलोड करें (अधिकतम 2MB)',
    amountSar: 'राशि (SAR)',
    date: 'तारीख़',
    status: 'स्थिति',
    paid: 'भुगतान हुआ',
    pending: 'लंबित',
    returned: 'वापस किया गया',
    transactionModeLabel: 'भुगतान मोड',
    notes: 'नोट्स',
    notesReturnPh: 'जैसे: ग्राहक ने आइटम वापस किया — गलत आकार',
    notesPh: 'अतिरिक्त विवरण...',
    saveEntry: 'प्रविष्टि सहेजें',
    cancel: 'रद्द करें',
    errCustomer: 'ग्राहक का नाम आवश्यक है',
    errAmount: 'राशि 0 से अधिक होनी चाहिए',
    errDate: 'तारीख़ आवश्यक है',
    errLinkInvoice: 'कृपया इस रिटर्न के लिए मूल चालान लिंक करें',
    errFileTooLarge: 'फ़ाइल बहुत बड़ी है (अधिकतम 2MB)',
    amountLabel: 'राशि',
    customer: 'ग्राहक',
    transaction: 'लेनदेन',
    txnNo: 'ट्रांजैक्शन नंबर:',
    invoiceRefLabel: 'चालान संदर्भ:',
    modeLabel: 'मोड:',
    dateLabel: 'तारीख़:',
    linkedOriginalInvoice: 'लिंक किया गया मूल चालान',
    originalAmount: 'मूल राशि',
    open: 'खोलें',
    linkedReturns: (n: number) => `लिंक किए गए रिटर्न (${n})`,
    hasReturn: 'रिटर्न मौजूद',
    attachedInvoice: 'संलग्न चालान',
    downloadInvoice: 'चालान डाउनलोड करें',
    autoEntryFrom: (mod: string) => `${mod} से स्वतः प्रविष्टि`,
    linkInvoiceTitle: 'मूल चालान से लिंक करें',
    linkInvoiceSubtitle: 'वह क्रेडिट चालान चुनें जिस पर यह रिटर्न लागू होता है',
    searchInvoicePh: 'चालान, ग्राहक, ट्रांजैक्शन नंबर से खोजें।',
    noInvoices: 'लिंक करने के लिए कोई चालान उपलब्ध नहीं',
    noMatchingInvoices: 'कोई मिलता-जुलता चालान नहीं',
    deleteTitle: 'प्रविष्टि हटाएँ?',
    deleteConfirm: (no: string) => `${no} हटाएँ? यह पूर्ववत नहीं हो सकता।`,
    delete: 'हटाएँ',
    reportTitle: 'रिपोर्ट',
    reportGenerated: 'लेनदेन रिपोर्ट',
    generatedBy: 'Zakhira BMS द्वारा उत्पन्न',
    copied: 'कॉपी हो गया',
    typeIn: 'इन',
    typeOut: 'आउट',
    typeReturn: 'रिटर्न',
    statusPaid: 'भुगतान हुआ',
    statusPartial: 'आंशिक भुगतान',
    statusReturned: 'वापस किया गया',
    fieldCustomerName: 'ग्राहक का नाम',
    fieldCompanyName: 'कंपनी का नाम',
    fieldTxnNo: 'ट्रांजैक्शन नंबर',
    fieldInvoiceRef: 'चालान संदर्भ',
    fieldMode: 'भुगतान मोड',
    fieldDate: 'तारीख़',
    fieldType: 'प्रकार',
    fieldStatus: 'स्थिति',
    fieldAmount: 'राशि',
    fieldNotes: 'नोट्स',
    realInvoiceDetails: 'मूल चालान विवरण',
    realInvoiceTitle: (n: string) => `मूल चालान — ${n}`,
    billTo: 'बिल टू',
    items: 'आइटम',
    subtotal: 'उप-योग',
    discount: 'छूट',
    vat: 'वैट',
    grandTotal: 'कुल योग',
    product: 'उत्पाद',
    qty: 'मात्रा',
    price: 'कीमत',
    total: 'कुल',
    issueDate: 'जारी तिथि',
    createdBy: 'बनाया',
    close: 'बंद करें',
    invoiceNotFound: 'चालान विवरण उपलब्ध नहीं — स्रोत दस्तावेज़ हटाया गया हो सकता है।',
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
// STORAGE
// ============================================================
export const TRANSACTIONS_STORAGE_KEY = 'zakhira_transactions';
const DOCUMENTS_KEY = 'zakhira_sales_documents';

const HANDOFF_VIEW_TXN_KEY = 'zakhira_accounting_view_txn';

// ✅ MIGRATION: Purane 'Pending' transactions → 'Partially Paid'
const migratePendingToPartial = (): void => {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    if (!raw) return;
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return;

    let changed = false;
    const updated = list.map((t: { status?: string }) => {
      if (t.status === 'Pending') {
        changed = true;
        return { ...t, status: 'Partially Paid' };
      }
      return t;
    });

    if (changed) {
      localStorage.setItem(
        TRANSACTIONS_STORAGE_KEY,
        JSON.stringify(updated)
      );
    }
  } catch {
    /* ignore */
  }
};

const loadTransactions = (): Transaction[] => {
  try {
    migratePendingToPartial(); // ✅ Auto-migrate
    const raw = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveTransactions = (list: Transaction[]): void => {
  try {
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
};

// ============================================================
// 📄 REAL INVOICE / SALES DOCS
// ============================================================
type SalesDocLine = {
  id: string;
  material?: string;
  quantity?: number;
  unitPrice?: number;
  lineTotal?: number;
  costPrice?: number;
  discountType?: string;
  discountValue?: number;
};

type SalesDocument = {
  id: string;
  documentType?: string;
  orderNumber: string;
  status?: string;
  issueDate?: string;
  createdAt?: string;
  notes?: string;
  vatNumber?: string;
  vatRate?: number;
  subtotal?: number;
  discountTotal?: number;
  taxTotal?: number;
  grandTotal?: number;
  createdBy?: string;
  customerSnapshot?: {
    name?: string;
    company?: string;
    phone?: string;
    address?: string;
    city?: string;
  };
  lines?: SalesDocLine[];
};

// ============================================================
// AUTO-FIX: Sync orphan returns into invoices
// ============================================================
type DocumentRecordMin = {
  id: string;
  orderNumber: string;
  returnRecords?: Array<{
    returnId: string;
    returnNumber: string;
    date: string;
    reason: string;
    notes?: string;
    items: unknown[];
    totalReturnAmount: number;
    linkedTransactionId: string;
    createdBy: string;
    createdAt: string;
  }>;
};

const autoSyncReturnsIntoInvoices = (): void => {
  try {
    const txnsRaw = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    const docsRaw = localStorage.getItem(DOCUMENTS_KEY);
    if (!txnsRaw || !docsRaw) return;

    const txns: Transaction[] = JSON.parse(txnsRaw);
    const docs: DocumentRecordMin[] = JSON.parse(docsRaw);

    const returnTxns = txns.filter(
      (t) => t.type === 'Return' || (t.type === 'Out' && t.status === 'Returned')
    );
    if (returnTxns.length === 0) return;

    let docsChanged = false;
    let txnsChanged = false;
    const updatedTxns = [...txns];

    for (const retTxn of returnTxns) {
      const invoice = docs.find((d) => d.orderNumber === retTxn.invoiceRef);
      if (!invoice) continue;

      const existingReturn = (invoice.returnRecords || []).find(
        (r) => r.linkedTransactionId === retTxn.transactionNo
      );
      if (existingReturn) {
        const txnIdx = updatedTxns.findIndex((t) => t.id === retTxn.id);
        if (txnIdx >= 0 && !updatedTxns[txnIdx].linkedInvoiceId) {
          const origTxn = updatedTxns.find(
            (t) => t.type === 'In' && t.invoiceRef === retTxn.invoiceRef
          );
          updatedTxns[txnIdx] = {
            ...updatedTxns[txnIdx],
            linkedInvoiceId: invoice.id,
            originalTransactionId:
              origTxn?.transactionNo ||
              updatedTxns[txnIdx].originalTransactionId,
          };
          txnsChanged = true;
        }
        continue;
      }

      const newReturn = {
        returnId: `ret-auto-${retTxn.id}`,
        returnNumber:
          retTxn.returnNumber ||
          `RET-AUTO-${retTxn.transactionNo.replace('TXN-', '')}`,
        date: retTxn.date,
        reason:
          retTxn.notes?.replace(/^Return[^:]*:\s*/, '') || 'Auto-synced return',
        notes: retTxn.notes,
        items: [],
        totalReturnAmount: retTxn.amount,
        linkedTransactionId: retTxn.transactionNo,
        createdBy: 'System (auto-sync)',
        createdAt: retTxn.createdAt,
      };

      if (!invoice.returnRecords) invoice.returnRecords = [];
      invoice.returnRecords.push(newReturn);
      docsChanged = true;

      const txnIdx = updatedTxns.findIndex((t) => t.id === retTxn.id);
      if (txnIdx >= 0 && !updatedTxns[txnIdx].linkedInvoiceId) {
        const origTxn = updatedTxns.find(
          (t) => t.type === 'In' && t.invoiceRef === retTxn.invoiceRef
        );
        updatedTxns[txnIdx] = {
          ...updatedTxns[txnIdx],
          linkedInvoiceId: invoice.id,
          originalTransactionId:
            origTxn?.transactionNo || updatedTxns[txnIdx].originalTransactionId,
        };
        txnsChanged = true;
      }
    }

    if (docsChanged)
      localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(docs));
    if (txnsChanged)
      localStorage.setItem(
        TRANSACTIONS_STORAGE_KEY,
        JSON.stringify(updatedTxns)
      );
  } catch {
    /* ignore */
  }
};

const loadRealInvoice = (invoiceIdOrRef: string): SalesDocument | null => {
  try {
    const raw = localStorage.getItem(DOCUMENTS_KEY);
    if (!raw) return null;
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return null;
    const found =
      list.find((d: SalesDocument) => d.id === invoiceIdOrRef) ||
      list.find((d: SalesDocument) => d.orderNumber === invoiceIdOrRef);
    return found || null;
  } catch {
    return null;
  }
};

// ============================================================
// CONSTANTS
// ============================================================
type MainTab = 'All' | 'In' | 'Out' | 'Return';
type DatePreset = 'All' | '7d' | '30d' | '3m' | '6m' | '1y';
type SortOption = 'recent' | 'oldest' | 'amount-high' | 'amount-low';

const PAYMENT_MODES: PaymentMode[] = ['Cash', 'Card', 'Bank Transfer', 'Other'];

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
  wallet: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M18 12a2 2 0 0 0 0 4h4v-4z" />
    </svg>
  ),
  arrowDown: (
    <svg {...svgBase} strokeWidth={2.5} className="w-3.5 h-3.5">
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  ),
  arrowUp: (
    <svg {...svgBase} strokeWidth={2.5} className="w-3.5 h-3.5">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  ),
  return: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
    </svg>
  ),
  search: (
    <svg {...svgBase} className="w-4 h-4">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  ),
  plus: (
    <svg {...svgBase} strokeWidth={2.5} className="w-4 h-4">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  trash: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  close: (
    <svg {...svgBase} strokeWidth={2.5} className="w-3.5 h-3.5">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  check: (
    <svg {...svgBase} strokeWidth={2.5} className="w-3.5 h-3.5">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  copy: (
    <svg {...svgBase} className="w-3 h-3">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  pdf: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  ),
  upload: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  ),
  link: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  sliders: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
    </svg>
  ),
  alert: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
    </svg>
  ),
  chevron: (
    <svg {...svgBase} strokeWidth={2.5} className="w-3.5 h-3.5 flex-shrink-0">
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  eye: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  external: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6M10 14 21 3" />
    </svg>
  ),
};

// ============================================================
// HELPERS
// ============================================================
const formatPrice = (n: number, lang: Language = 'en'): string => {
  const currency = lang === 'ar' || lang === 'ur' ? 'ر.س' : 'SAR';
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${n < 0 ? '-' : ''}${currency} ${formatted}`;
};

const todayISO = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatDate = (iso: string, lang: Language = 'en'): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const locale =
    lang === 'ar'
      ? 'ar-SA'
      : lang === 'ur'
        ? 'ur-PK'
        : lang === 'hi'
          ? 'hi-IN'
          : 'en-GB';
  try {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }
};

const uid = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const genTxnNo = (existing: Transaction[]): string => {
  const year = new Date().getFullYear();
  const prefix = `TXN-${year}-`;
  const numbers = existing
    .filter((t) => t.transactionNo.startsWith(prefix))
    .map((t) => Number(t.transactionNo.split('-')[2]))
    .filter((n) => !Number.isNaN(n));
  const max = numbers.length ? Math.max(...numbers) : 0;
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
};

// 🎨 TYPE TONE
type Tone = {
  bg: string;
  text: string;
  border: string;
  icon: string;
  solid: string;
};

const getTypeTone = (type: TransactionType): Tone => {
  if (type === 'In')
    return {
      bg: 'rgba(102,116,90,0.15)',
      text: THEME.deepForest,
      border: 'rgba(102,116,90,0.3)',
      icon: THEME.deepForest,
      solid: THEME.deepForest,
    };
  if (type === 'Out')
    return {
      bg: 'rgba(37,42,40,0.08)',
      text: THEME.charcoal,
      border: 'rgba(37,42,40,0.2)',
      icon: THEME.charcoal,
      solid: THEME.charcoal,
    };
  return {
    bg: 'rgba(196,154,90,0.15)',
    text: THEME.warmBrass,
    border: 'rgba(196,154,90,0.4)',
    icon: THEME.warmBrass,
    solid: THEME.warmBrass,
  };
};

const typeLabel = (t: TransactionType, tr: Translations): string =>
  t === 'In' ? tr.typeIn : t === 'Out' ? tr.typeOut : tr.typeReturn;

// ✅ Pending case removed
const statusLabel = (s: TxnStatus, tr: Translations): string =>
  s === 'Paid'
    ? tr.statusPaid
    : s === 'Partially Paid'
      ? tr.statusPartial
      : tr.statusReturned;

// ✅ Pending tone removed
const getStatusTone = (s: TxnStatus): Tone => {
  if (s === 'Paid')
    return {
      bg: 'rgba(102,116,90,0.15)',
      text: THEME.deepForest,
      border: 'rgba(102,116,90,0.3)',
      icon: THEME.deepForest,
      solid: THEME.deepForest,
    };
  if (s === 'Partially Paid')
    return {
      bg: 'rgba(196,154,90,0.3)',
      text: THEME.charcoal,
      border: 'rgba(196,154,90,0.6)',
      icon: THEME.warmBrass,
      solid: THEME.warmBrass,
    };
  return {
    bg: 'rgba(196,154,90,0.25)',
    text: THEME.charcoal,
    border: 'rgba(196,154,90,0.5)',
    icon: THEME.warmBrass,
    solid: THEME.warmBrass,
  };
};

const isWithinDays = (iso: string, days: number): boolean => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return true;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return d >= cutoff;
};

const isWithinMonths = (iso: string, months: number): boolean => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return true;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return d >= cutoff;
};

const isReturnEntry = (t: Transaction): boolean =>
  t.type === 'Return' || (t.type === 'Out' && t.status === 'Returned');

// ✅ Return kis original "In" entry ki hai — sirf usi par "HAS RETURN" dikhega
const getReturnOwnerIds = (all: Transaction[]): Set<string> => {
  const ids = new Set<string>();
  for (const r of all.filter(isReturnEntry)) {
    // 1) Pehle return mein saved originalTransactionId se dhoondo
    let owner = all.find(
      (t) => t.type === 'In' && t.transactionNo === r.originalTransactionId
    );
    // 2) Na mile to same invoice ki sabse pehli In entry
    if (!owner && r.invoiceRef && r.invoiceRef !== '—') {
      owner = all
        .filter((t) => t.type === 'In' && t.invoiceRef === r.invoiceRef)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )[0];
    }
    if (owner) ids.add(owner.id);
  }
  return ids;
};

// ============================================================
// STYLES
// ============================================================
const labelCls =
  'block text-[9px] font-bold mb-1 uppercase tracking-wider';
const inputCls =
  'w-full h-9 px-3 rounded-full border-2 text-[13px] focus:outline-none transition-all';
const textareaCls =
  'w-full px-3 py-2 rounded-xl border-2 text-[13px] focus:outline-none transition-all resize-none';
const primaryBtn =
  'h-9 px-4 rounded-full text-[13px] font-bold cursor-pointer transition-all duration-300 hover:brightness-95 hover:shadow-md flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed';
const ghostBtn =
  'h-9 px-4 rounded-full text-[13px] font-bold cursor-pointer border-2 transition-all flex items-center justify-center gap-1.5';

const inputStyle = (): React.CSSProperties => ({
  borderColor: 'rgba(102,116,90,0.2)',
  backgroundColor: 'rgba(247,243,234,0.6)',
  color: THEME.charcoal,
});

const readonlyInputStyle = (): React.CSSProperties => ({
  borderColor: 'rgba(102,116,90,0.2)',
  backgroundColor: 'rgba(247,243,234,0.6)',
  color: THEME.charcoal,
  cursor: 'default',
});

const primaryBtnStyle: React.CSSProperties = {
  backgroundColor: THEME.warmBrass,
  color: '#FFFFFF',
};

const ghostBtnStyle: React.CSSProperties = {
  backgroundColor: THEME.warmIvory,
  color: THEME.mutedOlive,
  borderColor: 'rgba(102,116,90,0.2)',
};

// ============================================================
// MODAL
// ============================================================
function Modal({
  title,
  subtitle,
  onClose,
  children,
  maxWidth = 'max-w-lg',
  headerRight,
  zIndex = 50,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  headerRight?: React.ReactNode;
  zIndex?: number;
}): React.JSX.Element {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(37,42,40,0.4)',
        zIndex,
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full ${maxWidth} max-h-[92vh] flex flex-col shadow-xl`}
        style={{ backgroundColor: '#FFFFFF', borderRadius: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b"
          style={{ borderColor: 'rgba(102,116,90,0.1)' }}
        >
          <div className="min-w-0">
            <h2
              className="text-sm font-bold"
              style={{ color: THEME.deepForest }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className="text-[11px] mt-0.5"
                style={{ color: THEME.mutedOlive }}
              >
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {headerRight}
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center cursor-pointer transition"
              style={{
                backgroundColor: THEME.warmIvory,
                color: THEME.mutedOlive,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  'rgba(196,154,90,0.15)';
                e.currentTarget.style.color = THEME.warmBrass;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = THEME.warmIvory;
                e.currentTarget.style.color = THEME.mutedOlive;
              }}
            >
              {Icons.close}
            </button>
          </div>
        </div>
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================
function StatCard({
  label,
  value,
  sub,
  icon,
  tone,
  active,
  onClick,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  tone: 'green' | 'red' | 'amber' | 'neutral';
  active: boolean;
  onClick: () => void;
}): React.JSX.Element {
  const toneColors: Record<typeof tone, string> = {
    green: THEME.deepForest,
    red: THEME.charcoal,
    amber: THEME.warmBrass,
    neutral: THEME.warmBrass,
  };
  const toneTexts: Record<typeof tone, string> = {
    green: THEME.deepForest,
    red: THEME.charcoal,
    amber: THEME.warmBrass,
    neutral: THEME.warmBrass,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl p-3 border-2 flex items-center gap-2.5 cursor-pointer transition text-left"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: active ? THEME.warmBrass : 'rgba(102,116,90,0.1)',
        boxShadow: active ? '0 4px 12px rgba(196,154,90,0.2)' : 'none',
      }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
        style={{
          backgroundColor: toneColors[tone],
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 10px rgba(37,42,40,0.12)',
        }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="text-sm font-bold truncate"
          style={{ color: toneTexts[tone] }}
        >
          {value}
        </p>
        <p
          className="text-[9px] uppercase tracking-wider font-bold truncate"
          style={{ color: THEME.mutedOlive }}
        >
          {label}
        </p>
        {sub && (
          <p
            className="text-[9px] mt-0.5 truncate"
            style={{ color: THEME.mutedOlive }}
          >
            {sub}
          </p>
        )}
      </div>
    </button>
  );
}

// ============================================================
// REAL INVOICE MODAL
// ============================================================
function RealInvoiceModal({
  invoiceIdOrRef,
  tr,
  lang,
  onClose,
}: {
  invoiceIdOrRef: string;
  tr: Translations;
  lang: Language;
  onClose: () => void;
}): React.JSX.Element {
  const doc = useMemo(() => loadRealInvoice(invoiceIdOrRef), [invoiceIdOrRef]);

  if (!doc) {
    return (
      <Modal
        title={tr.realInvoiceDetails}
        onClose={onClose}
        maxWidth="max-w-md"
        zIndex={70}
      >
        <p className="text-[13px]" style={{ color: THEME.mutedOlive }}>
          {tr.invoiceNotFound}
        </p>
      </Modal>
    );
  }

  const lines = doc.lines || [];

  return (
    <Modal
      title={tr.realInvoiceTitle(doc.orderNumber)}
      subtitle={doc.status ? `${tr.fieldStatus}: ${doc.status}` : undefined}
      onClose={onClose}
      maxWidth="max-w-3xl"
      zIndex={70}
    >
      <div className="space-y-3">
        <div
          className="rounded-xl p-3 space-y-2"
          style={{ backgroundColor: 'rgba(247,243,234,0.6)' }}
        >
          <h3
            className="text-[9px] font-bold uppercase tracking-wider"
            style={{ color: THEME.mutedOlive }}
          >
            {tr.billTo}
          </h3>

          <div>
            <label className={labelCls} style={{ color: THEME.charcoal }}>
              {tr.fieldCustomerName}
            </label>
            <input
              type="text"
              value={doc.customerSnapshot?.name || '—'}
              readOnly
              className={inputCls}
              style={readonlyInputStyle()}
            />
          </div>

          {doc.customerSnapshot?.company && (
            <div>
              <label className={labelCls} style={{ color: THEME.charcoal }}>
                {tr.fieldCompanyName}
              </label>
              <input
                type="text"
                value={doc.customerSnapshot.company}
                readOnly
                className={inputCls}
                style={readonlyInputStyle()}
              />
            </div>
          )}

          {doc.customerSnapshot?.phone && (
            <div>
              <label className={labelCls} style={{ color: THEME.charcoal }}>
                Phone
              </label>
              <input
                type="text"
                value={doc.customerSnapshot.phone}
                readOnly
                dir="ltr"
                className={inputCls}
                style={readonlyInputStyle()}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={labelCls} style={{ color: THEME.charcoal }}>
              {tr.fieldInvoiceRef}
            </label>
            <input
              type="text"
              value={doc.orderNumber}
              readOnly
              className={`${inputCls} font-mono`}
              style={readonlyInputStyle()}
            />
          </div>
          <div>
            <label className={labelCls} style={{ color: THEME.charcoal }}>
              {tr.issueDate}
            </label>
            <input
              type="text"
              value={formatDate(doc.issueDate || doc.createdAt || '', lang)}
              readOnly
              className={inputCls}
              style={readonlyInputStyle()}
            />
          </div>
          <div>
            <label className={labelCls} style={{ color: THEME.charcoal }}>
              {tr.fieldStatus}
            </label>
            <input
              type="text"
              value={doc.status || '—'}
              readOnly
              className={inputCls}
              style={readonlyInputStyle()}
            />
          </div>
          <div>
            <label className={labelCls} style={{ color: THEME.charcoal }}>
              {tr.createdBy}
            </label>
            <input
              type="text"
              value={doc.createdBy || '—'}
              readOnly
              className={inputCls}
              style={readonlyInputStyle()}
            />
          </div>
        </div>

        {lines.length > 0 && (
          <div>
            <h3
              className="text-[9px] font-bold uppercase tracking-wider mb-2"
              style={{ color: THEME.mutedOlive }}
            >
              {tr.items}
            </h3>
            <div
              className="rounded-xl overflow-hidden border"
              style={{ borderColor: 'rgba(102,116,90,0.2)' }}
            >
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: 'rgba(247,243,234,0.6)' }}>
                    <th
                      className="text-left text-[9px] font-bold uppercase tracking-wider px-3 py-2"
                      style={{ color: THEME.mutedOlive }}
                    >
                      {tr.product}
                    </th>
                    <th
                      className="text-center text-[9px] font-bold uppercase tracking-wider px-3 py-2 w-16"
                      style={{ color: THEME.mutedOlive }}
                    >
                      {tr.qty}
                    </th>
                    <th
                      className="text-right text-[9px] font-bold uppercase tracking-wider px-3 py-2 w-24"
                      style={{ color: THEME.mutedOlive }}
                    >
                      {tr.price}
                    </th>
                    <th
                      className="text-right text-[9px] font-bold uppercase tracking-wider px-3 py-2 w-28"
                      style={{ color: THEME.mutedOlive }}
                    >
                      {tr.total}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => (
                    <tr
                      key={l.id}
                      style={{
                        borderTop: '1px solid rgba(102,116,90,0.1)',
                      }}
                    >
                      <td
                        className="px-3 py-1.5 text-[12px] font-semibold"
                        style={{ color: THEME.charcoal }}
                      >
                        {l.material || '—'}
                      </td>
                      <td
                        className="px-3 py-1.5 text-center text-[12px]"
                        style={{ color: THEME.mutedOlive }}
                      >
                        {l.quantity || 0}
                      </td>
                      <td
                        className="px-3 py-1.5 text-right text-[12px]"
                        style={{ color: THEME.mutedOlive }}
                      >
                        {formatPrice(l.unitPrice || 0, lang)}
                      </td>
                      <td
                        className="px-3 py-1.5 text-right text-[12px] font-bold"
                        style={{ color: THEME.charcoal }}
                      >
                        {formatPrice(l.lineTotal || 0, lang)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div
          className="rounded-xl p-3 space-y-2"
          style={{ backgroundColor: 'rgba(247,243,234,0.5)' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className={labelCls} style={{ color: THEME.charcoal }}>
                {tr.subtotal}
              </label>
              <input
                type="text"
                value={formatPrice(doc.subtotal || 0, lang)}
                readOnly
                className={inputCls}
                style={readonlyInputStyle()}
              />
            </div>
            {(doc.discountTotal || 0) > 0 && (
              <div>
                <label className={labelCls} style={{ color: THEME.charcoal }}>
                  {tr.discount}
                </label>
                <input
                  type="text"
                  value={`-${formatPrice(doc.discountTotal || 0, lang)}`}
                  readOnly
                  className={inputCls}
                  style={readonlyInputStyle()}
                />
              </div>
            )}
            {(doc.taxTotal || 0) > 0 && (
              <div>
                <label className={labelCls} style={{ color: THEME.charcoal }}>
                  {tr.vat} ({doc.vatRate || 0}%)
                </label>
                <input
                  type="text"
                  value={formatPrice(doc.taxTotal || 0, lang)}
                  readOnly
                  className={inputCls}
                  style={readonlyInputStyle()}
                />
              </div>
            )}
            <div>
              <label className={labelCls} style={{ color: THEME.charcoal }}>
                {tr.grandTotal}
              </label>
              <input
                type="text"
                value={formatPrice(doc.grandTotal || 0, lang)}
                readOnly
                className={`${inputCls} font-bold`}
                style={{
                  ...readonlyInputStyle(),
                  color: THEME.warmBrass,
                  borderColor: 'rgba(196,154,90,0.4)',
                }}
              />
            </div>
          </div>
        </div>

        {doc.notes && (
          <div>
            <label className={labelCls} style={{ color: THEME.charcoal }}>
              {tr.fieldNotes}
            </label>
            <textarea
              value={doc.notes}
              readOnly
              rows={2}
              className={textareaCls}
              style={{ ...readonlyInputStyle(), resize: 'none' }}
            />
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className={ghostBtn}
            style={ghostBtnStyle}
          >
            {tr.close}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================
// INVOICE PICKER MODAL
// ============================================================
function InvoicePickerModal({
  invoices,
  onSelect,
  onClose,
  tr,
  lang,
}: {
  invoices: Transaction[];
  onSelect: (inv: Transaction) => void;
  onClose: () => void;
  tr: Translations;
  lang: Language;
}): React.JSX.Element {
  const [q, setQ] = useState('');
  const needle = q.trim().toLowerCase();
  const filtered = invoices.filter(
    (inv) =>
      inv.transactionNo.toLowerCase().includes(needle) ||
      inv.invoiceRef.toLowerCase().includes(needle) ||
      inv.customerName.toLowerCase().includes(needle) ||
      inv.companyName.toLowerCase().includes(needle)
  );

  return (
    <Modal
      title={tr.linkInvoiceTitle}
      subtitle={tr.linkInvoiceSubtitle}
      onClose={onClose}
      maxWidth="max-w-lg"
      zIndex={60}
    >
      <div className="space-y-2.5">
        <div className="relative">
          <span
            className="absolute top-1/2 -translate-y-1/2 left-3 pointer-events-none"
            style={{ color: THEME.mutedOlive }}
          >
            {Icons.search}
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tr.searchInvoicePh}
            className={`${inputCls} pl-9`}
            style={inputStyle()}
          />
        </div>

        <div className="space-y-1 max-h-96 overflow-y-auto">
          {invoices.length === 0 ? (
            <p
              className="text-sm text-center py-6"
              style={{ color: THEME.mutedOlive }}
            >
              {tr.noInvoices}
            </p>
          ) : filtered.length === 0 ? (
            <p
              className="text-sm text-center py-6"
              style={{ color: THEME.mutedOlive }}
            >
              {tr.noMatchingInvoices}
            </p>
          ) : (
            filtered.map((inv) => (
              <button
                key={inv.id}
                type="button"
                onClick={() => onSelect(inv)}
                className="w-full text-left p-2.5 rounded-xl border-2 cursor-pointer transition"
                style={{
                  borderColor: 'rgba(102,116,90,0.15)',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = THEME.warmBrass;
                  e.currentTarget.style.backgroundColor =
                    'rgba(247,243,234,0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    'rgba(102,116,90,0.15)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-sm font-bold font-mono truncate"
                      style={{ color: THEME.charcoal }}
                    >
                      {inv.invoiceRef}
                    </p>
                    <p
                      className="text-[10px] mt-0.5 truncate"
                      style={{ color: THEME.mutedOlive }}
                    >
                      {inv.customerName}
                      {inv.companyName && ` • ${inv.companyName}`}
                    </p>
                    <p
                      className="text-[9px] mt-0.5 font-mono"
                      style={{ color: THEME.mutedOlive }}
                    >
                      {inv.transactionNo} • {formatDate(inv.date, lang)}
                    </p>
                  </div>
                  <p
                    className="text-sm font-bold whitespace-nowrap"
                    style={{ color: THEME.deepForest }}
                  >
                    {formatPrice(inv.amount, lang)}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}

// ============================================================
// NEW ENTRY MODAL
// ============================================================
function NewEntryModal({
  onClose,
  onSaved,
  existing,
  tr,
  lang,
}: {
  onClose: () => void;
  onSaved: (t: Transaction) => void;
  existing: Transaction[];
  tr: Translations;
  lang: Language;
}): React.JSX.Element {
  const [type, setType] = useState<TransactionType>('In');
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [invoiceRef, setInvoiceRef] = useState('');
  const [invoiceFile, setInvoiceFile] = useState<string>('');
  const [invoiceFileName, setInvoiceFileName] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayISO());
  const [status, setStatus] = useState<TxnStatus>('Paid');
  const [mode, setMode] = useState<PaymentMode>('Cash');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const [linkedInvoice, setLinkedInvoice] = useState<Transaction | null>(null);
  const [showInvoicePicker, setShowInvoicePicker] = useState(false);

  const invoices = useMemo(
    () =>
      existing.filter(
        (t) =>
          t.type === 'In' && t.status !== 'Returned' && t.invoiceRef !== '—'
      ),
    [existing]
  );

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      setError(tr.errFileTooLarge);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setInvoiceFile(String(reader.result));
      setInvoiceFileName(f.name);
      setError('');
    };
    reader.readAsDataURL(f);
  };

  const submit = (): void => {
    if (!customerName.trim()) return setError(tr.errCustomer);
    if (!amount || Number(amount) <= 0) return setError(tr.errAmount);
    if (!date) return setError(tr.errDate);
    if (type === 'Return' && !linkedInvoice) {
      return setError(tr.errLinkInvoice);
    }

    const newTxn: Transaction = {
      id: uid('txn'),
      transactionNo: genTxnNo(existing),
      date,
      customerName: customerName.trim(),
      companyName: companyName.trim(),
      invoiceRef:
        type === 'Return' && linkedInvoice
          ? linkedInvoice.invoiceRef
          : invoiceRef.trim() || '—',
      invoiceFile: invoiceFile || undefined,
      invoiceFileName: invoiceFileName || undefined,
      type,
      amount: Number(amount),
      status: type === 'Return' ? 'Returned' : status,
      mode,
      linkedInvoiceId:
        type === 'Return' && linkedInvoice
          ? linkedInvoice.linkedInvoiceId ||
            linkedInvoice.sourceDocumentId ||
            linkedInvoice.id
          : undefined,
      originalTransactionId:
        type === 'Return' && linkedInvoice
          ? linkedInvoice.transactionNo
          : undefined,
      sourceModule: 'manual',
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    if (type === 'Return' && linkedInvoice) {
      const all = loadTransactions();
      const updated = all.map((t) =>
        t.id === linkedInvoice.id
          ? {
              ...t,
              hasReturn: true,
              returnTransactionId: newTxn.transactionNo,
            }
          : t
      );
      saveTransactions([newTxn, ...updated]);
    }

    onSaved(newTxn);
  };

  return (
    <>
      <Modal
        title={tr.newEntryTitle}
        subtitle={tr.newEntrySubtitle}
        onClose={onClose}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-3">
          <div>
            <label className={labelCls} style={{ color: THEME.charcoal }}>
              {tr.typeLabel} <span style={{ color: THEME.warmBrass }}>*</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['In', 'Out', 'Return'] as TransactionType[]).map((tp) => {
                const tone = getTypeTone(tp);
                const active = type === tp;
                return (
                  <button
                    key={tp}
                    type="button"
                    onClick={() => setType(tp)}
                    className="h-9 rounded-full flex items-center justify-center gap-1.5 text-[13px] font-bold cursor-pointer transition border-2"
                    style={{
                      backgroundColor: active ? tone.bg : 'rgba(247,243,234,0.6)',
                      color: active ? tone.text : THEME.mutedOlive,
                      borderColor: active
                        ? tone.border
                        : 'rgba(102,116,90,0.2)',
                    }}
                  >
                    {tp === 'In'
                      ? Icons.arrowDown
                      : tp === 'Out'
                        ? Icons.arrowUp
                        : Icons.return}
                    <span>{typeLabel(tp, tr)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {type === 'Return' && (
            <div>
              <label className={labelCls} style={{ color: THEME.charcoal }}>
                {tr.linkOriginalInvoice}{' '}
                <span style={{ color: THEME.warmBrass }}>*</span>
              </label>
              {linkedInvoice ? (
                <div
                  className="p-2.5 rounded-xl flex items-center justify-between gap-3 border-2"
                  style={{
                    backgroundColor: 'rgba(196,154,90,0.08)',
                    borderColor: 'rgba(196,154,90,0.4)',
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span style={{ color: THEME.warmBrass }}>
                        {Icons.link}
                      </span>
                      <p
                        className="text-sm font-bold font-mono truncate"
                        style={{ color: THEME.charcoal }}
                      >
                        {linkedInvoice.invoiceRef}
                      </p>
                    </div>
                    <p
                      className="text-[10px] mt-0.5 truncate"
                      style={{ color: THEME.mutedOlive }}
                    >
                      {linkedInvoice.customerName}
                      {linkedInvoice.companyName &&
                        ` • ${linkedInvoice.companyName}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLinkedInvoice(null)}
                    className="text-[10px] font-bold hover:underline cursor-pointer flex-shrink-0"
                    style={{ color: THEME.warmBrass }}
                  >
                    {tr.change}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowInvoicePicker(true)}
                  className={`${inputCls} text-left flex items-center justify-between gap-2 cursor-pointer`}
                  style={inputStyle()}
                >
                  <span style={{ color: 'rgba(102,116,90,0.7)' }}>
                    {tr.selectInvoice}
                  </span>
                  {Icons.chevron}
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={labelCls} style={{ color: THEME.charcoal }}>
                {tr.customerName}{' '}
                <span style={{ color: THEME.warmBrass }}>*</span>
              </label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={tr.customerNamePh}
                className={inputCls}
                style={inputStyle()}
              />
            </div>
            <div>
              <label className={labelCls} style={{ color: THEME.charcoal }}>
                {tr.companyName}
              </label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={tr.companyNamePh}
                className={inputCls}
                style={inputStyle()}
              />
            </div>
          </div>

          {type !== 'Return' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={labelCls} style={{ color: THEME.charcoal }}>
                  {tr.invoiceRef}
                </label>
                <input
                  value={invoiceRef}
                  onChange={(e) => setInvoiceRef(e.target.value)}
                  placeholder={tr.invoiceRefPh}
                  className={`${inputCls} font-mono`}
                  style={inputStyle()}
                />
              </div>
              <div>
                <label className={labelCls} style={{ color: THEME.charcoal }}>
                  {tr.invoiceFile}
                </label>
                <label
                  className={`${inputCls} cursor-pointer flex items-center justify-between gap-2`}
                  style={inputStyle()}
                >
                  <span
                    className="truncate"
                    style={{ color: 'rgba(102,116,90,0.7)' }}
                  >
                    {invoiceFileName || tr.invoiceFilePh}
                  </span>
                  {Icons.upload}
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className={labelCls} style={{ color: THEME.charcoal }}>
                {tr.amountSar}{' '}
                <span style={{ color: THEME.warmBrass }}>*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={`${inputCls} font-bold`}
                style={inputStyle()}
              />
            </div>
            <div>
              <label className={labelCls} style={{ color: THEME.charcoal }}>
                {tr.date} <span style={{ color: THEME.warmBrass }}>*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputCls}
                style={inputStyle()}
              />
            </div>
            <div>
              <label className={labelCls} style={{ color: THEME.charcoal }}>
                {tr.status}
              </label>
              <select
                value={type === 'Return' ? 'Returned' : status}
                onChange={(e) => setStatus(e.target.value as TxnStatus)}
                disabled={type === 'Return'}
                className={`${inputCls} cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
                style={inputStyle()}
              >
                {type === 'Return' ? (
                  <option value="Returned">{tr.statusReturned}</option>
                ) : (
                  <>
                    <option value="Paid">{tr.statusPaid}</option>
                    <option value="Partially Paid">{tr.statusPartial}</option>
                    {/* ✅ Pending option removed */}
                  </>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls} style={{ color: THEME.charcoal }}>
              {tr.transactionModeLabel}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PAYMENT_MODES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className="px-3 py-1.5 rounded-full text-[11px] font-bold cursor-pointer transition border-2"
                  style={{
                    backgroundColor:
                      mode === m ? THEME.warmBrass : 'rgba(247,243,234,0.6)',
                    color: mode === m ? '#FFFFFF' : THEME.mutedOlive,
                    borderColor:
                      mode === m
                        ? THEME.warmBrass
                        : 'rgba(102,116,90,0.2)',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls} style={{ color: THEME.charcoal }}>
              {tr.notes}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder={type === 'Return' ? tr.notesReturnPh : tr.notesPh}
              className={textareaCls}
              style={inputStyle()}
            />
          </div>

          {error && (
            <div
              className="p-2.5 rounded-xl text-[11px] font-semibold flex items-center gap-2"
              style={{
                backgroundColor: 'rgba(196,154,90,0.1)',
                border: `1px solid rgba(196,154,90,0.4)`,
                color: THEME.charcoal,
              }}
            >
              {Icons.alert}
              <span>{error}</span>
            </div>
          )}

          <div
            className="flex gap-2.5 pt-3 border-t"
            style={{ borderColor: 'rgba(102,116,90,0.1)' }}
          >
            <button
              onClick={submit}
              className={primaryBtn}
              style={primaryBtnStyle}
            >
              {Icons.check}
              <span>{tr.saveEntry}</span>
            </button>
            <button
              onClick={onClose}
              className={ghostBtn}
              style={ghostBtnStyle}
            >
              {tr.cancel}
            </button>
          </div>
        </div>
      </Modal>

      {showInvoicePicker && (
        <InvoicePickerModal
          invoices={invoices}
          onSelect={(inv) => {
            setLinkedInvoice(inv);
            setCustomerName(inv.customerName);
            setCompanyName(inv.companyName);
            setShowInvoicePicker(false);
            setError('');
          }}
          onClose={() => setShowInvoicePicker(false)}
          tr={tr}
          lang={lang}
        />
      )}
    </>
  );
}

// ============================================================
// TRANSACTION DETAILS MODAL
// ============================================================
function TransactionDetailsModal({
  txn,
  all,
  onClose,
  onNavigateToInvoice,
  onNavigateToTxn,
  tr,
  lang,
}: {
  txn: Transaction;
  all: Transaction[];
  onClose: () => void;
  onNavigateToInvoice: (invoiceId: string) => void;
  onNavigateToTxn: (txnNo: string) => void;
  tr: Translations;
  lang: Language;
}): React.JSX.Element {
  const tone = getTypeTone(txn.type);
  const isReturn = isReturnEntry(txn);
  // ✅ Sirf asli invoice entry par HAS RETURN / linked returns dikhengi
  const isReturnOwner = getReturnOwnerIds(all).has(txn.id);

  const originalInvoiceTxn = txn.linkedInvoiceId
    ? all.find(
        (t) =>
          t.type === 'In' &&
          (t.sourceDocumentId === txn.linkedInvoiceId ||
            t.linkedInvoiceId === txn.linkedInvoiceId)
      ) || null
    : null;

  let linkedInvoice = originalInvoiceTxn;

  if (!linkedInvoice && txn.originalTransactionId) {
    linkedInvoice =
      all.find((t) => t.transactionNo === txn.originalTransactionId) || null;
  }

  if (!linkedInvoice && txn.invoiceRef && txn.invoiceRef !== '—') {
    linkedInvoice =
      all.find((t) => t.type === 'In' && t.invoiceRef === txn.invoiceRef) ||
      null;
  }

  if (!linkedInvoice && txn.linkedInvoiceId) {
    linkedInvoice = all.find((t) => t.id === txn.linkedInvoiceId) || null;
  }

  const linkedReturns = all.filter(
    (t) =>
      isReturnEntry(t) &&
      t.id !== txn.id &&
      t.invoiceRef &&
      t.invoiceRef === txn.invoiceRef
  );

  const statusTone = getStatusTone(txn.status);

  return (
    <Modal
      title={txn.transactionNo}
      subtitle={`${typeLabel(txn.type, tr)} • ${formatDate(txn.date, lang)}`}
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border"
            style={{
              backgroundColor: tone.bg,
              color: tone.text,
              borderColor: tone.border,
            }}
          >
            {txn.type === 'In'
              ? Icons.arrowDown
              : txn.type === 'Out'
                ? Icons.arrowUp
                : Icons.return}
            {typeLabel(txn.type, tr)}
          </span>
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: statusTone.bg,
              color: statusTone.text,
            }}
          >
            {statusLabel(txn.status, tr)}
          </span>
          {isReturnOwner && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: THEME.warmBrass,
                color: '#FFFFFF',
              }}
            >
              {Icons.return}
              <span>{tr.hasReturn}</span>
            </span>
          )}
        </div>

        <div
          className="rounded-xl p-3"
          style={{ backgroundColor: 'rgba(247,243,234,0.6)' }}
        >
          <p
            className="text-[9px] font-bold uppercase tracking-wider"
            style={{ color: THEME.mutedOlive }}
          >
            {tr.amountLabel}
          </p>
          <p className="text-xl font-bold mt-1" style={{ color: tone.icon }}>
            {txn.type === 'In' ? '+' : txn.type === 'Out' ? '−' : '↺'}{' '}
            {formatPrice(txn.amount, lang)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            className="rounded-xl p-3 space-y-2"
            style={{ backgroundColor: 'rgba(247,243,234,0.5)' }}
          >
            <h3
              className="text-[9px] font-bold uppercase tracking-wider"
              style={{ color: THEME.mutedOlive }}
            >
              {tr.customer}
            </h3>

            <div>
              <label className={labelCls} style={{ color: THEME.charcoal }}>
                {tr.fieldCustomerName}
              </label>
              <input
                type="text"
                value={txn.customerName || '—'}
                readOnly
                className={inputCls}
                style={readonlyInputStyle()}
              />
            </div>

            {txn.companyName && (
              <div>
                <label className={labelCls} style={{ color: THEME.charcoal }}>
                  {tr.fieldCompanyName}
                </label>
                <input
                  type="text"
                  value={txn.companyName}
                  readOnly
                  className={inputCls}
                  style={readonlyInputStyle()}
                />
              </div>
            )}
          </div>

          <div
            className="rounded-xl p-3 space-y-2"
            style={{ backgroundColor: 'rgba(247,243,234,0.5)' }}
          >
            <h3
              className="text-[9px] font-bold uppercase tracking-wider"
              style={{ color: THEME.mutedOlive }}
            >
              {tr.transaction}
            </h3>

            <div>
              <label className={labelCls} style={{ color: THEME.charcoal }}>
                {tr.fieldTxnNo}
              </label>
              <input
                type="text"
                value={txn.transactionNo}
                readOnly
                dir="ltr"
                className={`${inputCls} font-mono`}
                style={readonlyInputStyle()}
              />
            </div>

            <div>
              <label className={labelCls} style={{ color: THEME.charcoal }}>
                {tr.fieldInvoiceRef}
              </label>
              <input
                type="text"
                value={txn.invoiceRef}
                readOnly
                dir="ltr"
                className={`${inputCls} font-mono`}
                style={readonlyInputStyle()}
              />
            </div>

            <div>
              <label className={labelCls} style={{ color: THEME.charcoal }}>
                {tr.fieldMode}
              </label>
              <input
                type="text"
                value={txn.mode || '—'}
                readOnly
                className={inputCls}
                style={readonlyInputStyle()}
              />
            </div>

            <div>
              <label className={labelCls} style={{ color: THEME.charcoal }}>
                {tr.fieldDate}
              </label>
              <input
                type="text"
                value={formatDate(txn.date, lang)}
                readOnly
                className={inputCls}
                style={readonlyInputStyle()}
              />
            </div>
          </div>
        </div>

        {isReturn && linkedInvoice && (
          <div>
            <h3
              className="text-[9px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"
              style={{ color: THEME.mutedOlive }}
            >
              <span style={{ color: THEME.warmBrass }}>{Icons.link}</span>
              <span>{tr.linkedOriginalInvoice}</span>
            </h3>
            <button
              type="button"
              onClick={() =>
                onNavigateToInvoice(
                  linkedInvoice.linkedInvoiceId ||
                    linkedInvoice.sourceDocumentId ||
                    linkedInvoice.id
                )
              }
              className="w-full text-left rounded-xl p-3 cursor-pointer transition border-2"
              style={{
                backgroundColor: 'rgba(102,116,90,0.08)',
                borderColor: 'rgba(102,116,90,0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = THEME.deepForest;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(102,116,90,0.3)';
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className="text-sm font-bold font-mono"
                    style={{ color: THEME.charcoal }}
                  >
                    {linkedInvoice.invoiceRef}
                  </p>
                  <p
                    className="text-[10px] mt-0.5"
                    style={{ color: THEME.mutedOlive }}
                  >
                    {linkedInvoice.customerName}
                    {linkedInvoice.companyName &&
                      ` • ${linkedInvoice.companyName}`}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-base font-bold"
                    style={{ color: THEME.deepForest }}
                  >
                    {formatPrice(linkedInvoice.amount, lang)}
                  </p>
                  <p
                    className="text-[9px] font-bold mt-1 flex items-center justify-end gap-0.5"
                    style={{ color: THEME.deepForest }}
                  >
                    {Icons.external}
                    <span>{tr.open}</span>
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}

        {isReturnOwner && linkedReturns.length > 0 && (
          <div>
            <h3
              className="text-[9px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"
              style={{ color: THEME.mutedOlive }}
            >
              <span style={{ color: THEME.warmBrass }}>{Icons.return}</span>
              <span>{tr.linkedReturns(linkedReturns.length)}</span>
            </h3>
            <div className="space-y-1.5">
              {linkedReturns.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onNavigateToTxn(r.transactionNo)}
                  className="w-full text-left rounded-xl p-2.5 flex items-center justify-between gap-3 cursor-pointer transition border-2"
                  style={{
                    backgroundColor: 'rgba(196,154,90,0.08)',
                    borderColor: 'rgba(196,154,90,0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = THEME.warmBrass;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      'rgba(196,154,90,0.3)';
                  }}
                >
                  <div className="min-w-0">
                    <p
                      className="text-xs font-bold font-mono"
                      style={{ color: THEME.charcoal }}
                    >
                      {r.transactionNo}
                    </p>
                    <p
                      className="text-[10px] mt-0.5"
                      style={{ color: THEME.mutedOlive }}
                    >
                      {formatDate(r.date, lang)}
                      {r.notes && ` • ${r.notes}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-sm font-bold whitespace-nowrap"
                      style={{ color: THEME.warmBrass }}
                    >
                      ↺ {formatPrice(r.amount, lang)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {txn.invoiceFile && (
          <div>
            <h3
              className="text-[9px] font-bold uppercase tracking-wider mb-2"
              style={{ color: THEME.mutedOlive }}
            >
              {tr.attachedInvoice}
            </h3>
            {txn.invoiceFile.startsWith('data:image') ? (
              <img
                src={txn.invoiceFile}
                alt="Invoice"
                className="w-full max-h-64 object-contain rounded-xl border"
                style={{
                  borderColor: 'rgba(102,116,90,0.15)',
                  backgroundColor: 'rgba(247,243,234,0.5)',
                }}
              />
            ) : (
              <a
                href={txn.invoiceFile}
                download={txn.invoiceFileName || 'invoice.pdf'}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition border"
                style={{
                  backgroundColor: 'rgba(247,243,234,0.5)',
                  borderColor: 'rgba(102,116,90,0.15)',
                  color: THEME.warmBrass,
                }}
              >
                {Icons.pdf}
                <span>{txn.invoiceFileName || tr.downloadInvoice}</span>
              </a>
            )}
          </div>
        )}

        {txn.notes && (
          <div>
            <label className={labelCls} style={{ color: THEME.charcoal }}>
              {tr.fieldNotes}
            </label>
            <textarea
              value={txn.notes}
              readOnly
              rows={2}
              className={textareaCls}
              style={{ ...readonlyInputStyle(), resize: 'none' }}
            />
          </div>
        )}

        {txn.sourceModule && txn.sourceModule !== 'manual' && (
          <div
            className="text-[9px] text-center italic"
            style={{ color: THEME.mutedOlive }}
          >
            {tr.autoEntryFrom(txn.sourceModule)}
          </div>
        )}
      </div>
    </Modal>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function AccountingPage(): React.JSX.Element {
  const language = getStoredLanguage();
  const tr = t[language] as Translations;
  const rtl = isRTLLang(language);

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    autoSyncReturnsIntoInvoices();
    return loadTransactions();
  });

  const [mainTab, setMainTab] = useState<MainTab>('All');
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState<PaymentMode | 'All'>('All');
  const [datePreset, setDatePreset] = useState<DatePreset>('All');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  const [showNewEntry, setShowNewEntry] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [viewTxn, setViewTxn] = useState<Transaction | null>(null);
  const [copiedId, setCopiedId] = useState<string>('');

  const [viewRealInvoiceId, setViewRealInvoiceId] = useState<string | null>(
    null
  );

  useEffect(() => {
    try {
      const handoff = localStorage.getItem(HANDOFF_VIEW_TXN_KEY);
      if (handoff) {
        localStorage.removeItem(HANDOFF_VIEW_TXN_KEY);
        const all = loadTransactions();
        const found = all.find((t) => t.transactionNo === handoff);
        if (found) setViewTxn(found);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const reload = (): void => {
      setTransactions(loadTransactions());
    };
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

  const navigateToInvoice = (invoiceId: string): void => {
    setViewRealInvoiceId(invoiceId);
  };

  const navigateToTxn = (txnNo: string): void => {
    const all = loadTransactions();
    const found = all.find((t) => t.transactionNo === txnNo);
    if (found) setViewTxn(found);
  };

  const filtered = useMemo(() => {
    let list = [...transactions];

    if (mainTab !== 'All') {
      if (mainTab === 'Return') {
        list = list.filter(isReturnEntry);
      } else if (mainTab === 'Out') {
        list = list.filter(
          (t) => t.type === 'Out' && t.status !== 'Returned'
        );
      } else {
        list = list.filter((t) => t.type === mainTab);
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.transactionNo.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          t.companyName.toLowerCase().includes(q) ||
          t.invoiceRef.toLowerCase().includes(q)
      );
    }

    if (modeFilter !== 'All') {
      list = list.filter((t) => t.mode === modeFilter);
    }

    if (datePreset !== 'All') {
      switch (datePreset) {
        case '7d':
          list = list.filter((t) => isWithinDays(t.date, 7));
          break;
        case '30d':
          list = list.filter((t) => isWithinDays(t.date, 30));
          break;
        case '3m':
          list = list.filter((t) => isWithinMonths(t.date, 3));
          break;
        case '6m':
          list = list.filter((t) => isWithinMonths(t.date, 6));
          break;
        case '1y':
          list = list.filter((t) => isWithinMonths(t.date, 12));
          break;
      }
    }
    if (customFrom) list = list.filter((t) => t.date >= customFrom);
    if (customTo) list = list.filter((t) => t.date <= customTo);

    list.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-high':
          return b.amount - a.amount;
        case 'amount-low':
          return a.amount - b.amount;
        case 'recent':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    return list;
  }, [
    transactions,
    mainTab,
    search,
    modeFilter,
    datePreset,
    customFrom,
    customTo,
    sortBy,
  ]);

  const statsBase = useMemo(() => {
    let list = [...transactions];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.transactionNo.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          t.companyName.toLowerCase().includes(q) ||
          t.invoiceRef.toLowerCase().includes(q)
      );
    }
    if (modeFilter !== 'All')
      list = list.filter((t) => t.mode === modeFilter);
    if (datePreset !== 'All') {
      switch (datePreset) {
        case '7d':
          list = list.filter((t) => isWithinDays(t.date, 7));
          break;
        case '30d':
          list = list.filter((t) => isWithinDays(t.date, 30));
          break;
        case '3m':
          list = list.filter((t) => isWithinMonths(t.date, 3));
          break;
        case '6m':
          list = list.filter((t) => isWithinMonths(t.date, 6));
          break;
        case '1y':
          list = list.filter((t) => isWithinMonths(t.date, 12));
          break;
      }
    }
    if (customFrom) list = list.filter((t) => t.date >= customFrom);
    if (customTo) list = list.filter((t) => t.date <= customTo);
    return list;
  }, [transactions, search, modeFilter, datePreset, customFrom, customTo]);

  // ✅ Kaun si "In" entry ki return hui hai (sirf usi par HAS RETURN)
  const returnOwnerIds = useMemo(
    () => getReturnOwnerIds(transactions),
    [transactions]
  );

  const returnEntries = statsBase.filter(isReturnEntry);
  const realOutEntries = statsBase.filter(
    (t) => t.type === 'Out' && t.status !== 'Returned'
  );
  const realInEntries = statsBase.filter((t) => t.type === 'In');

  const statAll = statsBase.length;
  const statIn = realInEntries.length;
  const statOut = realOutEntries.length;
  const statReturn = returnEntries.length;

  const totalIn = realInEntries.reduce((s, t) => s + t.amount, 0);
  const totalOut = realOutEntries.reduce((s, t) => s + t.amount, 0);
  const totalReturn = returnEntries.reduce((s, t) => s + t.amount, 0);

  const handleNewEntry = (t: Transaction): void => {
    const updated = loadTransactions();
    setTransactions(updated);
    setShowNewEntry(false);
    if (!updated.some((x) => x.id === t.id)) {
      const withNew = [t, ...transactions];
      saveTransactions(withNew);
      setTransactions(withNew);
    }
  };

  const handleDelete = (id: string): void => {
    const updated = transactions.filter((t) => t.id !== id);
    saveTransactions(updated);
    setTransactions(updated);
    setDeleteTarget(null);
  };

  const clearFilters = (): void => {
    setSearch('');
    setModeFilter('All');
    setDatePreset('All');
    setCustomFrom('');
    setCustomTo('');
    setSortBy('recent');
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    modeFilter !== 'All' ||
    datePreset !== 'All' ||
    customFrom !== '' ||
    customTo !== '' ||
    sortBy !== 'recent';

  const copyInvoiceRef = (ref: string, id: string): void => {
    if (!ref || ref === '—') return;
    try {
      navigator.clipboard.writeText(ref);
      setCopiedId(id);
      setTimeout(() => setCopiedId(''), 1500);
    } catch {
      /* ignore */
    }
  };

  const handleExportPDF = (): void => {
    const rows = filtered
      .map(
        (t, i) => `<tr>
          <td>${i + 1}</td>
          <td>${formatDate(t.date, language)}</td>
          <td>${t.transactionNo}</td>
          <td>${t.customerName}${t.companyName ? `<br><span class="muted">${t.companyName}</span>` : ''}</td>
          <td>${t.invoiceRef}</td>
          <td class="r">${t.mode}</td>
          <td class="r ${t.type === 'In' ? 'in' : t.type === 'Out' ? 'out' : 'ret'}">${typeLabel(t.type, tr)}</td>
          <td class="r">${formatPrice(t.amount, language)}</td>
          <td class="r">${statusLabel(t.status, tr)}</td>
        </tr>`
      )
      .join('');

    const html = `<!doctype html><html dir="${rtl ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><title>${tr.reportGenerated}</title>
<style>
*{box-sizing:border-box}
body{font-family:Arial,Helvetica,sans-serif;color:${THEME.charcoal};margin:0;padding:32px}
.head{border-bottom:3px solid ${THEME.deepForest};padding-bottom:16px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-end}
.co{font-size:22px;font-weight:700;color:${THEME.deepForest}}
.muted{color:${THEME.mutedOlive};font-size:11px}
h1{font-size:18px;letter-spacing:2px;margin:0;color:${THEME.deepForest}}
.summary{display:flex;gap:16px;margin-bottom:16px}
.box{flex:1;border:1px solid ${THEME.mutedOlive}40;border-radius:12px;padding:12px 14px;font-size:12px}
.box h3{margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:${THEME.mutedOlive}}
.box b{font-size:14px}
table{width:100%;border-collapse:collapse;font-size:12px}
th{background:${THEME.warmIvory};text-align:left;padding:8px;border:1px solid ${THEME.mutedOlive}40;font-size:10px;text-transform:uppercase;letter-spacing:1px}
td{padding:8px;border:1px solid ${THEME.mutedOlive}40}
.r{text-align:right}
.in{color:${THEME.deepForest};font-weight:700}
.out{color:${THEME.charcoal};font-weight:700}
.ret{color:${THEME.warmBrass};font-weight:700}
.foot{margin-top:32px;font-size:10px;color:${THEME.mutedOlive};text-align:center;border-top:1px solid ${THEME.mutedOlive}40;padding-top:10px}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
<div class="head">
  <div>
    <div class="co">Zakhira Accounting</div>
    <div class="muted">${tr.reportGenerated} — ${formatDate(todayISO(), language)}</div>
  </div>
  <h1>${tr.reportTitle}</h1>
</div>
<div class="summary">
  <div class="box"><h3>${tr.statIn}</h3><b>${formatPrice(totalIn, language)}</b></div>
  <div class="box"><h3>${tr.statOut}</h3><b>${formatPrice(totalOut, language)}</b></div>
  <div class="box"><h3>${tr.statReturn}</h3><b>${formatPrice(totalReturn, language)}</b></div>
  <div class="box"><h3>${tr.entries}</h3><b>${filtered.length}</b></div>
</div>
<table>
  <thead>
    <tr>
      <th>#</th><th>${tr.colDate}</th><th>${tr.txnNo}</th><th>${tr.customer}</th>
      <th>${tr.colInvoice}</th><th class="r">${tr.colMode}</th><th class="r">${tr.colType}</th>
      <th class="r">${tr.colAmount}</th><th class="r">${tr.colStatus}</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>
<div class="foot">${tr.generatedBy}</div>
</body></html>`;

    printHtmlDocument(html);
  };

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className="min-h-screen p-4 lg:p-5"
      style={{ backgroundColor: THEME.warmIvory }}
    >
      <div className="mb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1
            className="text-xl font-bold"
            style={{ color: THEME.deepForest }}
          >
            {tr.pageTitle}
          </h1>
          <p
            className="mt-1 text-[12px]"
            style={{ color: THEME.mutedOlive }}
          >
            {tr.pageSubtitle}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleExportPDF} className={ghostBtn} style={ghostBtnStyle}>
            {Icons.pdf}
            <span>{tr.exportPdf}</span>
          </button>
          <button
            onClick={() => setShowNewEntry(true)}
            className={primaryBtn}
            style={primaryBtnStyle}
          >
            {Icons.plus}
            <span>{tr.newEntry}</span>
          </button>
        </div>
      </div>

      <div className="mb-4">
        <AccountingDashboard />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
        <StatCard
          label={tr.statAll}
          value={String(statAll)}
          sub={tr.totalSuffix(
            formatPrice(totalIn + totalOut + totalReturn, language)
          )}
          icon={Icons.wallet}
          tone="neutral"
          active={mainTab === 'All'}
          onClick={() => setMainTab('All')}
        />
        <StatCard
          label={tr.statIn}
          value={String(statIn)}
          sub={formatPrice(totalIn, language)}
          icon={Icons.arrowDown}
          tone="green"
          active={mainTab === 'In'}
          onClick={() => setMainTab('In')}
        />
        <StatCard
          label={tr.statOut}
          value={String(statOut)}
          sub={formatPrice(totalOut, language)}
          icon={Icons.arrowUp}
          tone="red"
          active={mainTab === 'Out'}
          onClick={() => setMainTab('Out')}
        />
        <StatCard
          label={tr.statReturn}
          value={String(statReturn)}
          sub={formatPrice(totalReturn, language)}
          icon={Icons.return}
          tone="amber"
          active={mainTab === 'Return'}
          onClick={() => setMainTab('Return')}
        />
      </div>

      <div
        className="rounded-2xl p-3.5 mb-4"
        style={{
          backgroundColor: '#FFFFFF',
          border: `1px solid rgba(102,116,90,0.1)`,
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span style={{ color: THEME.mutedOlive }}>{Icons.sliders}</span>
          <h3
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: THEME.deepForest }}
          >
            {tr.filters}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div className="md:col-span-2">
            <label className={labelCls} style={{ color: THEME.charcoal }}>
              {tr.search}
            </label>
            <div className="relative">
              <span
                className="absolute top-1/2 -translate-y-1/2 left-3 pointer-events-none"
                style={{ color: THEME.mutedOlive }}
              >
                {Icons.search}
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={tr.searchPh}
                className={`${inputCls} pl-9`}
                style={inputStyle()}
              />
            </div>
          </div>
          <div>
            <label className={labelCls} style={{ color: THEME.charcoal }}>
              {tr.sort}
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className={`${inputCls} cursor-pointer`}
              style={inputStyle()}
            >
              <option value="recent">{tr.sortRecent}</option>
              <option value="oldest">{tr.sortOldest}</option>
              <option value="amount-high">{tr.sortAmountHigh}</option>
              <option value="amount-low">{tr.sortAmountLow}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className={labelCls} style={{ color: THEME.charcoal }}>
              {tr.transactionMode}
            </label>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setModeFilter('All')}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition border-2"
                style={{
                  backgroundColor:
                    modeFilter === 'All'
                      ? THEME.warmBrass
                      : 'rgba(247,243,234,0.6)',
                  color:
                    modeFilter === 'All' ? '#FFFFFF' : THEME.mutedOlive,
                  borderColor:
                    modeFilter === 'All'
                      ? THEME.warmBrass
                      : 'rgba(102,116,90,0.2)',
                }}
              >
                {tr.all}
              </button>
              {PAYMENT_MODES.map((m) => (
                <button
                  key={m}
                  onClick={() => setModeFilter(m)}
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition border-2"
                  style={{
                    backgroundColor:
                      modeFilter === m
                        ? THEME.warmBrass
                        : 'rgba(247,243,234,0.6)',
                    color:
                      modeFilter === m ? '#FFFFFF' : THEME.mutedOlive,
                    borderColor:
                      modeFilter === m
                        ? THEME.warmBrass
                        : 'rgba(102,116,90,0.2)',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls} style={{ color: THEME.charcoal }}>
              {tr.dateRangePreset}
            </label>
            <div className="flex flex-wrap gap-1">
              {(
                [
                  { id: 'All', label: tr.all },
                  { id: '7d', label: tr.preset7d },
                  { id: '30d', label: tr.preset30d },
                  { id: '3m', label: tr.preset3m },
                  { id: '6m', label: tr.preset6m },
                  { id: '1y', label: tr.preset1y },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setDatePreset(p.id)}
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition border-2"
                  style={{
                    backgroundColor:
                      datePreset === p.id
                        ? THEME.warmBrass
                        : 'rgba(247,243,234,0.6)',
                    color:
                      datePreset === p.id ? '#FFFFFF' : THEME.mutedOlive,
                    borderColor:
                      datePreset === p.id
                        ? THEME.warmBrass
                        : 'rgba(102,116,90,0.2)',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className={labelCls} style={{ color: THEME.charcoal }}>
              {tr.customFrom}
            </label>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className={inputCls}
              style={inputStyle()}
            />
          </div>
          <div>
            <label className={labelCls} style={{ color: THEME.charcoal }}>
              {tr.customTo}
            </label>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className={inputCls}
              style={inputStyle()}
            />
          </div>
          <div className="flex items-end">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className={ghostBtn}
                style={ghostBtnStyle}
              >
                {Icons.close}
                <span>{tr.clearFilters}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12px]" style={{ color: THEME.mutedOlive }}>
          {tr.showing}{' '}
          <span className="font-bold" style={{ color: THEME.charcoal }}>
            {filtered.length}
          </span>{' '}
          {tr.entries}
        </p>
        {filtered.length > 0 && (
          <p className="text-[12px]" style={{ color: THEME.mutedOlive }}>
            {tr.net}:{' '}
            <span className="font-bold" style={{ color: THEME.warmBrass }}>
              {formatPrice(
                Math.abs(
                  filtered
                    .filter((t) => t.type === 'In')
                    .reduce((s, t) => s + t.amount, 0) -
                    filtered
                      .filter(isReturnEntry)
                      .reduce((s, t) => s + t.amount, 0) -
                    filtered
                      .filter(
                        (t) => t.type === 'Out' && t.status !== 'Returned'
                      )
                      .reduce((s, t) => s + t.amount, 0)
                ),
                language
              )}
            </span>
          </p>
        )}
      </div>

      {filtered.length > 0 ? (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: '#FFFFFF',
            border: `1px solid rgba(102,116,90,0.1)`,
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    backgroundColor: 'rgba(247,243,234,0.4)',
                    borderBottom: `1px solid rgba(102,116,90,0.1)`,
                  }}
                >
                  <th
                    className="text-left text-[9px] font-bold uppercase tracking-wider px-3 py-2"
                    style={{ color: THEME.mutedOlive }}
                  >
                    {tr.colDate}
                  </th>
                  <th
                    className="text-left text-[9px] font-bold uppercase tracking-wider px-3 py-2"
                    style={{ color: THEME.mutedOlive }}
                  >
                    {tr.colTxnCustomer}
                  </th>
                  <th
                    className="text-left text-[9px] font-bold uppercase tracking-wider px-3 py-2 hidden md:table-cell"
                    style={{ color: THEME.mutedOlive }}
                  >
                    {tr.colInvoice}
                  </th>
                  <th
                    className="text-center text-[9px] font-bold uppercase tracking-wider px-3 py-2 hidden lg:table-cell"
                    style={{ color: THEME.mutedOlive }}
                  >
                    {tr.colMode}
                  </th>
                  <th
                    className="text-center text-[9px] font-bold uppercase tracking-wider px-3 py-2"
                    style={{ color: THEME.mutedOlive }}
                  >
                    {tr.colType}
                  </th>
                  <th
                    className="text-right text-[9px] font-bold uppercase tracking-wider px-3 py-2"
                    style={{ color: THEME.mutedOlive }}
                  >
                    {tr.colAmount}
                  </th>
                  <th
                    className="text-center text-[9px] font-bold uppercase tracking-wider px-3 py-2 hidden md:table-cell"
                    style={{ color: THEME.mutedOlive }}
                  >
                    {tr.colStatus}
                  </th>
                  <th className="w-20"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const tone = getTypeTone(t.type);
                  const statusTone = getStatusTone(t.status);
                  const isReturn = isReturnEntry(t);
                  return (
                    <tr
                      key={t.id}
                      className="border-b transition"
                      style={{ borderColor: 'rgba(102,116,90,0.05)' }}
                    >
                      <td
                        className="px-3 py-2 text-[11px] font-mono whitespace-nowrap"
                        style={{ color: THEME.mutedOlive }}
                      >
                        {formatDate(t.date, language)}
                      </td>
                      <td className="px-3 py-2 max-w-xs">
                        <p
                          className="text-[12px] font-semibold truncate"
                          style={{ color: THEME.charcoal }}
                        >
                          {t.customerName || '—'}
                        </p>
                        <p
                          className="text-[9px] truncate mt-0.5"
                          style={{ color: THEME.mutedOlive }}
                        >
                          {t.transactionNo}
                          {t.companyName && ` • ${t.companyName}`}
                        </p>
                      </td>
                      <td className="px-3 py-2 hidden md:table-cell">
                        {t.invoiceRef && t.invoiceRef !== '—' ? (
                          <button
                            type="button"
                            onClick={() => copyInvoiceRef(t.invoiceRef, t.id)}
                            className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold cursor-pointer"
                            style={{ color: THEME.warmBrass }}
                          >
                            <span>{t.invoiceRef}</span>
                            {copiedId === t.id ? (
                              <span style={{ color: THEME.deepForest }}>
                                {Icons.check}
                              </span>
                            ) : (
                              Icons.copy
                            )}
                          </button>
                        ) : (
                          <span
                            className="text-[10px]"
                            style={{ color: THEME.mutedOlive }}
                          >
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 hidden lg:table-cell text-center">
                        <span
                          className="text-[10px]"
                          style={{ color: THEME.mutedOlive }}
                        >
                          {t.mode || '—'}
                        </span>
                      </td>
                      {/* ✅ TYPE: pill hamesha center, tag neeche */}
                      <td className="px-3 py-2 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span
                            className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border"
                            style={{
                              backgroundColor: tone.bg,
                              color: tone.text,
                              borderColor: tone.border,
                            }}
                          >
                            {t.type === 'In'
                              ? Icons.arrowDown
                              : t.type === 'Out'
                                ? Icons.arrowUp
                                : Icons.return}
                            <span>{typeLabel(t.type, tr)}</span>
                          </span>

                          {isReturn && t.linkedInvoiceId && (
                            <span
                              className="inline-flex items-center gap-0.5 text-[8px] font-bold"
                              style={{ color: THEME.warmBrass }}
                            >
                              {Icons.link}
                              <span>linked</span>
                            </span>
                          )}

                          {t.type === 'In' && returnOwnerIds.has(t.id) && (
                            <span
                              className="inline-flex items-center gap-0.5 text-[8px] font-bold"
                              style={{ color: THEME.warmBrass }}
                            >
                              {Icons.return}
                              <span>{tr.hasReturn}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td
                        className="px-3 py-2 text-right text-[12px] font-bold whitespace-nowrap"
                        style={{ color: tone.icon }}
                      >
                        {t.type === 'In' ? '+' : t.type === 'Out' ? '−' : '↺'}{' '}
                        {formatPrice(t.amount, language)}
                      </td>
                      <td className="px-3 py-2 hidden md:table-cell text-center">
                        <span
                          className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: statusTone.bg,
                            color: statusTone.text,
                          }}
                        >
                          {t.status ? statusLabel(t.status, tr) : '—'}
                        </span>
                      </td>
                      <td className="px-1 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewTxn(t)}
                            className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition border"
                            style={{
                              backgroundColor: THEME.warmIvory,
                              color: THEME.mutedOlive,
                              borderColor: 'rgba(102,116,90,0.2)',
                            }}
                          >
                            {Icons.eye}
                          </button>
                          <button
                            onClick={() => setDeleteTarget(t)}
                            className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition border"
                            style={{
                              backgroundColor: 'rgba(196,154,90,0.15)',
                              color: THEME.charcoal,
                              borderColor: 'rgba(196,154,90,0.4)',
                            }}
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
        </div>
      ) : (
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            backgroundColor: '#FFFFFF',
            border: `1px solid rgba(102,116,90,0.1)`,
          }}
        >
          <div
            className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3"
            style={{
              backgroundColor: THEME.warmIvory,
              color: THEME.warmBrass,
            }}
          >
            {Icons.wallet}
          </div>
          <h3
            className="text-sm font-bold mb-1.5"
            style={{ color: THEME.deepForest }}
          >
            {tr.noEntries}
          </h3>
          <p
            className="text-[12px] mb-4"
            style={{ color: THEME.mutedOlive }}
          >
            {hasActiveFilters ? tr.noEntriesFiltered : tr.noEntriesFirst}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className={primaryBtn}
              style={primaryBtnStyle}
            >
              {tr.clearFilters}
            </button>
          ) : (
            <button
              onClick={() => setShowNewEntry(true)}
              className={primaryBtn}
              style={primaryBtnStyle}
            >
              {Icons.plus}
              <span>{tr.createFirst}</span>
            </button>
          )}
        </div>
      )}

      {showNewEntry && (
        <NewEntryModal
          onClose={() => setShowNewEntry(false)}
          onSaved={handleNewEntry}
          existing={transactions}
          tr={tr}
          lang={language}
        />
      )}

      {viewTxn && (
        <TransactionDetailsModal
          txn={viewTxn}
          all={transactions}
          onClose={() => setViewTxn(null)}
          onNavigateToInvoice={navigateToInvoice}
          onNavigateToTxn={navigateToTxn}
          tr={tr}
          lang={language}
        />
      )}

      {viewRealInvoiceId && (
        <RealInvoiceModal
          invoiceIdOrRef={viewRealInvoiceId}
          tr={tr}
          lang={language}
          onClose={() => setViewRealInvoiceId(null)}
        />
      )}

      {deleteTarget && (
        <Modal
          title={tr.deleteTitle}
          onClose={() => setDeleteTarget(null)}
          maxWidth="max-w-sm"
        >
          <div className="text-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{
                backgroundColor: 'rgba(196,154,90,0.15)',
                color: THEME.charcoal,
              }}
            >
              {Icons.trash}
            </div>
            <p
              className="text-[13px] mb-5"
              style={{ color: THEME.mutedOlive }}
            >
              {tr.deleteConfirm(deleteTarget.transactionNo)}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className={`${ghostBtn} flex-1`}
                style={ghostBtnStyle}
              >
                {tr.cancel}
              </button>
              <button
                onClick={() => handleDelete(deleteTarget.id)}
                className="flex-1 h-9 rounded-full text-[13px] font-bold cursor-pointer transition"
                style={{
                  backgroundColor: THEME.charcoal,
                  color: '#FFFFFF',
                }}
              >
                {tr.delete}
              </button>
            </div>
          </div>
        </Modal>
      )}
      {/* ✅ 4 CHARTS — now imported, fully independent, zero props */}
      <AccountingCharts />
    </div>
  );
}