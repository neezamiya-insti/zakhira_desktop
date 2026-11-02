/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import { useEffect, useMemo, useRef, useState } from 'react';
// ✅ Import the independent sibling — NO PROPS PASSED
import RecordsSection from './RecordsSection';

// ============================================================
// THEME (self-contained)
// ============================================================
const THEME = {
  warmIvory: '#F7F3EA',
  deepForest: '#123C32',
  mutedOlive: '#66745A',
  charcoal: '#252A28',
  warmBrass: '#C49A5A',
};

type Language = 'en' | 'ar' | 'ur' | 'hi';

// ============================================================
// 🌍 TRANSLATIONS (form only — en, ar, ur, hi)
// ============================================================
const t = {
  en: {
    pageTitle: 'Sales - Invoice / Quotation',
    pageSubtitle: 'Create a quotation or invoice, send via WhatsApp',
    customerInfo: 'Customer Information',
    customerInfoHint: 'Details fill in automatically - you can still edit them',
    selectCustomer: '- Select Customer -',
    customerName: 'Customer Name',
    company: 'Company',
    phone: 'Phone',
    email: 'Email',
    city: 'City',
    address: 'Address',
    enterCustomerName: 'Enter Customer Name',
    enterCompany: 'Enter Company',
    enterPhone: 'Enter Phone Number',
    enterEmail: 'Enter Email Address',
    enterCity: 'Enter City',
    enterAddress: 'Enter Address',
    orderDetails: 'Order Details',
    vatNumber: 'VAT Number (Customer)',
    vatRate: 'VAT Rate (%)',
    vat: 'VAT',
    invoiceDate: 'Invoice Date',
    enterVat: 'Enter VAT Number',
    products: 'Products (From Inventory)',
    noProducts: 'No products in inventory.',
    item: 'Item',
    product: 'Product',
    quantity: 'Quantity',
    unitPrice: 'Unit Price',
    discount: 'Discount (%)',
    lineTotal: 'Line Total',
    enterQuantity: 'Enter Quantity',
    enterDiscount: 'Enter Discount',
    selectProduct: 'Select Product',
    searchProduct: 'Search by name or SKU',
    noProductsInv: 'No products in inventory',
    noMatching: 'No matching products',
    out: 'Out',
    stock: 'Stock',
    addProduct: 'Add Product',
    removeItem: 'Remove',
    paymentDetails: 'Payment Details',
    paymentStatus: 'Payment Status',
    paid: 'Paid',
    unpaid: 'Unpaid',
    partiallyPaid: 'Partially Paid',
    amountReceived: 'Amount Received',
    balanceDue: 'Balance Due',
    paymentMethod: 'Payment Method',
    howPaid: 'How did the customer pay?',
    howPaidPlaceholder: 'e.g. Cheque, STC Pay, Tabby',
    cash: 'Cash',
    bankTransfer: 'Bank Transfer',
    card: 'Card',
    other: 'Other',
    actions: 'Actions',
    sendWhatsApp: 'Send via WhatsApp',
    createInvoice: 'Create Invoice',
    draftNotSaved: 'Draft (not saved)',
    noCustomer: 'No Customer Selected',
    subtotal: 'Subtotal',
    grandTotal: 'Grand Total',
    notes: 'Notes',
    notesPlaceholder: 'Delivery, Payment Terms or Other Notes..',
    errName: 'Enter customer name',
    errPhone: 'Enter customer phone',
    errDate: 'Invoice date is required',
    errLines: 'Add at least one product with a quantity',
    errOtherPay: 'Enter how the customer paid',
    errStorage: 'Could not save — storage may be full.',
    errAmountTooHigh: 'Amount received cannot be greater than the Grand Total.',
    toastInvoice: (n: string) => `Invoice created — ${n}`,
    toastQuotation: (n: string) => `Saved as Quotation — ${n}`,
    waHello: (n: string) => `Hello ${n},`,
    waQuotation: 'Quotation',
    waDate: 'Date',
    waItems: 'Items',
    waReview: 'Please review and confirm.',
    addCustomer: 'Add Customer',
    noCustomersYet: 'No customers yet',
    clearCustomer: 'Change customer',
    addCustomerTitle: 'Add Customer',
    addCustomerSubtitle: 'Create a new customer record',
    saveCustomer: 'Save Customer',
    cancel: 'Cancel',
    phoneHint: 'Include country code for WhatsApp.',
    emailHint: 'Optional — for invoices & reminders.',
    errPhoneInvalid: 'Enter phone with country code, e.g. +966 50 123 4567',
    errEmailInvalid: 'Enter a valid email address',
    toastCustomerAdded: (n: string) => `Customer added — ${n}`,
    // ✅ Two phone inputs (same logic as Customers page)
    phoneIntlLabel: 'Phone (with country code)',
    phoneLocalLabel: 'Phone (without country code)',
    phoneEitherHint: 'Fill at least one phone number. Each number must be unique.',
    errPhoneEither: 'Enter at least one phone number',
    errDuplicatePhone: (n: string) =>
      `This phone number already belongs to ${n}. Each phone number must be unique.`,
    productImage: 'Product Image',
    totalAmount: 'Total Amount',
    discountedPrice: 'Discounted Price',
    discountShort: 'Discount',
    full: 'Full',
    fullHint: 'Fill the full amount',
    billTo: 'Bill To',
    docInvoice: 'Invoice',
    thankYou: 'Thank you for your business',
    errPdf: 'Could not create the PDF.',
    pdfDownloadedHint: 'PDF downloaded — attach it in the WhatsApp chat (📎)',
    sendingPdf: 'Preparing PDF...',
    pdfReadyTitle: 'PDF is ready',
    pdfReadyHint:
      'WhatsApp does not let a browser attach files automatically. Tap "Share PDF" (if available), or download the PDF and attach it in the chat with 📎 → Document.',
    sharePdf: 'Share PDF',
    downloadAndOpen: 'Download PDF & open WhatsApp',
    close: 'Close',
    waPdfNote: 'Please find the PDF attached.',
    statusAutoApproved: 'Auto-approved (payment received)',
    maxProductsReached: 'All inventory products are already added',
    saveDraft: 'Save Draft',
    restoreDraft: 'Restore',
    resetForm: 'Reset',
    saveHint: 'Save your current progress temporarily',
    restoreHint: 'Restore the last saved draft',
    resetHint: 'Clear all fields',
    draftSaved: 'Draft saved — you can restore it later',
    draftRestored: 'Draft restored',
    noDraft: 'No saved draft found',
    draftEmpty: 'Nothing to save yet — fill in some details first',
    confirmReset: 'Clear all fields? Your saved draft will not be deleted.',
    resetDone: 'Form reset',
    typeOrSelectCustomer: 'Type or select customer…',
    useAsCustomerName: (n: string) => `Use "${n}" as customer name`,
    noMatchingCustomers: 'No matching customers',
    // ✅ NEW (auto-filled, no visible UI)
    salesChannel: 'Sales Channel',
    channelOnline: 'Online',
    channelOffline: 'Offline',
    dueDate: 'Due Date',
    // ✅ Preview / print layout
    preview: 'Preview',
    previewTitle: 'Document Preview',
    previewHint: 'This is how it will look when printed',
    previewInvoice: 'Invoice',
    previewQuotation: 'Quotation',
    print: 'Print',
    downloadPdf: 'Download PDF',
    customerDetails: 'Customer Details',
    refNo: 'Reference',
    issueDateLabel: 'Issue Date',
    totalBeforeVat: 'Total Before VAT',
    vatPctShort: '% VAT',
    vatAmountShort: 'VAT',
    amountCol: 'Amount',
    totalVatLabel: 'Total VAT',
  },
  ar: {
    pageTitle: 'المبيعات - فاتورة / عرض سعر',
    pageSubtitle: 'أنشئ عرض سعر أو فاتورة وأرسلها عبر واتساب',
    customerInfo: 'معلومات العميل',
    customerInfoHint: 'تُملأ التفاصيل تلقائياً - يمكنك تعديلها',
    selectCustomer: '- اختر عميلاً -',
    customerName: 'اسم العميل',
    company: 'الشركة',
    phone: 'الهاتف',
    email: 'البريد الإلكتروني',
    city: 'المدينة',
    address: 'العنوان',
    enterCustomerName: 'أدخل اسم العميل',
    enterCompany: 'أدخل الشركة',
    enterPhone: 'أدخل رقم الهاتف',
    enterEmail: 'أدخل البريد الإلكتروني',
    enterCity: 'أدخل المدينة',
    enterAddress: 'أدخل العنوان',
    orderDetails: 'تفاصيل الطلب',
    vatNumber: 'الرقم الضريبي (العميل)',
    vatRate: 'نسبة الضريبة (%)',
    vat: 'ضريبة القيمة المضافة',
    invoiceDate: 'تاريخ الفاتورة',
    enterVat: 'أدخل الرقم الضريبي',
    products: 'المنتجات (من المخزون)',
    noProducts: 'لا توجد منتجات في المخزون.',
    item: 'عنصر',
    product: 'المنتج',
    quantity: 'الكمية',
    unitPrice: 'سعر الوحدة',
    discount: 'الخصم (%)',
    lineTotal: 'إجمالي السطر',
    enterQuantity: 'أدخل الكمية',
    enterDiscount: 'أدخل الخصم',
    selectProduct: 'اختر المنتج',
    searchProduct: 'ابحث بالاسم أو SKU',
    noProductsInv: 'لا توجد منتجات في المخزون',
    noMatching: 'لا منتجات مطابقة',
    out: 'نفد',
    stock: 'المخزون',
    addProduct: 'إضافة منتج',
    removeItem: 'إزالة',
    paymentDetails: 'تفاصيل الدفع',
    paymentStatus: 'حالة الدفع',
    paid: 'مدفوع',
    unpaid: 'غير مدفوع',
    partiallyPaid: 'مدفوع جزئياً',
    amountReceived: 'المبلغ المستلم',
    balanceDue: 'الرصيد المستحق',
    paymentMethod: 'طريقة الدفع',
    howPaid: 'كيف دفع العميل؟',
    howPaidPlaceholder: 'مثال: شيك، STC Pay، تابي',
    cash: 'نقداً',
    bankTransfer: 'تحويل بنكي',
    card: 'بطاقة',
    other: 'أخرى',
    actions: 'الإجراءات',
    sendWhatsApp: 'إرسال عبر واتساب',
    createInvoice: 'إنشاء فاتورة',
    draftNotSaved: 'مسودة (غير محفوظة)',
    noCustomer: 'لم يتم اختيار عميل',
    subtotal: 'المجموع الفرعي',
    grandTotal: 'الإجمالي',
    notes: 'ملاحظات',
    notesPlaceholder: 'التسليم أو شروط الدفع أو ملاحظات أخرى..',
    errName: 'أدخل اسم العميل',
    errPhone: 'أدخل هاتف العميل',
    errDate: 'تاريخ الفاتورة مطلوب',
    errLines: 'أضف منتجاً واحداً على الأقل مع الكمية',
    errOtherPay: 'أدخل كيف دفع العميل',
    errStorage: 'تعذر الحفظ — قد تكون مساحة التخزين ممتلئة.',
    errAmountTooHigh: 'المبلغ المستلم لا يمكن أن يكون أكبر من الإجمالي.',
    toastInvoice: (n: string) => `تم إنشاء الفاتورة — ${n}`,
    toastQuotation: (n: string) => `تم الحفظ كعرض سعر — ${n}`,
    waHello: (n: string) => `مرحباً ${n}،`,
    waQuotation: 'عرض سعر',
    waDate: 'التاريخ',
    waItems: 'العناصر',
    waReview: 'يرجى المراجعة والتأكيد.',
    addCustomer: 'إضافة عميل',
    noCustomersYet: 'لا يوجد عملاء بعد',
    clearCustomer: 'تغيير العميل',
    addCustomerTitle: 'إضافة عميل',
    addCustomerSubtitle: 'أنشئ سجل عميل جديد',
    saveCustomer: 'حفظ العميل',
    cancel: 'إلغاء',
    phoneHint: 'أدخل رمز الدولة لواتساب.',
    emailHint: 'اختياري — للفواتير والتذكيرات.',
    errPhoneInvalid: 'أدخل الهاتف مع رمز الدولة، مثل +966 50 123 4567',
    errEmailInvalid: 'أدخل بريداً إلكترونياً صالحاً',
    toastCustomerAdded: (n: string) => `تمت إضافة العميل — ${n}`,
    phoneIntlLabel: 'الهاتف (مع رمز الدولة)',
    phoneLocalLabel: 'الهاتف (بدون رمز الدولة)',
    phoneEitherHint: 'املأ رقم هاتف واحداً على الأقل. يجب أن يكون كل رقم فريداً.',
    errPhoneEither: 'أدخل رقم هاتف واحداً على الأقل',
    errDuplicatePhone: (n: string) =>
      `رقم الهاتف هذا مسجّل بالفعل للعميل ${n}. يجب أن يكون كل رقم فريداً.`,
    productImage: 'صورة المنتج',
    totalAmount: 'المبلغ الإجمالي',
    discountedPrice: 'السعر بعد الخصم',
    discountShort: 'الخصم',
    full: 'كامل',
    fullHint: 'تعبئة المبلغ كاملاً',
    billTo: 'فاتورة إلى',
    docInvoice: 'فاتورة',
    thankYou: 'شكراً لتعاملكم معنا',
    errPdf: 'تعذر إنشاء ملف PDF.',
    pdfDownloadedHint: 'تم تنزيل PDF — أرفقه في محادثة واتساب (📎)',
    sendingPdf: 'جارٍ تجهيز PDF...',
    pdfReadyTitle: 'ملف PDF جاهز',
    pdfReadyHint:
      'لا يسمح واتساب للمتصفح بإرفاق الملفات تلقائياً. اضغط "مشاركة PDF" (إن وُجد) أو نزّل الملف وأرفقه في المحادثة عبر 📎 ← مستند.',
    sharePdf: 'مشاركة PDF',
    downloadAndOpen: 'تنزيل PDF وفتح واتساب',
    close: 'إغلاق',
    waPdfNote: 'مرفق ملف PDF.',
    statusAutoApproved: 'اعتماد تلقائي (تم استلام دفعة)',
    maxProductsReached: 'تمت إضافة جميع منتجات المخزون',
    saveDraft: 'حفظ المسودة',
    restoreDraft: 'استعادة',
    resetForm: 'إعادة تعيين',
    saveHint: 'حفظ التقدم الحالي مؤقتاً',
    restoreHint: 'استعادة آخر مسودة محفوظة',
    resetHint: 'مسح جميع الحقول',
    draftSaved: 'تم حفظ المسودة — يمكنك استعادتها لاحقاً',
    draftRestored: 'تمت استعادة المسودة',
    noDraft: 'لا توجد مسودة محفوظة',
    draftEmpty: 'لا يوجد شيء للحفظ بعد — أدخل بعض التفاصيل أولاً',
    confirmReset: 'هل تريد مسح جميع الحقول؟ لن تُحذف المسودة المحفوظة.',
    resetDone: 'تمت إعادة تعيين النموذج',
    typeOrSelectCustomer: 'اكتب أو اختر عميلاً…',
    useAsCustomerName: (n: string) => `استخدم «${n}» كاسم للعميل`,
    noMatchingCustomers: 'لا يوجد عملاء مطابقون',
    salesChannel: 'قناة البيع',
    channelOnline: 'أونلاين',
    channelOffline: 'أوفلاين',
    dueDate: 'تاريخ الاستحقاق',
    preview: 'معاينة',
    previewTitle: 'معاينة المستند',
    previewHint: 'هكذا سيظهر المستند عند الطباعة',
    previewInvoice: 'فاتورة',
    previewQuotation: 'عرض سعر',
    print: 'طباعة',
    downloadPdf: 'تنزيل PDF',
    customerDetails: 'تفاصيل بيانات العميل',
    refNo: 'المرجع',
    issueDateLabel: 'تاريخ الإصدار',
    totalBeforeVat: 'الإجمالي قبل الضريبة',
    vatPctShort: '% الضريبة',
    vatAmountShort: 'الضريبة',
    amountCol: 'الإجمالي',
    totalVatLabel: 'إجمالي الضريبة',
  },
  ur: {
    pageTitle: 'فروخت - انوائس / کوٹیشن',
    pageSubtitle: 'کوٹیشن یا انوائس بنائیں اور واٹس ایپ پر بھیجیں',
    customerInfo: 'کسٹمر کی معلومات',
    customerInfoHint: 'تفصیلات خود بخود بھر جاتی ہیں - آپ ترمیم بھی کر سکتے ہیں',
    selectCustomer: '- کسٹمر منتخب کریں -',
    customerName: 'کسٹمر کا نام',
    company: 'کمپنی',
    phone: 'فون',
    email: 'ای میل',
    city: 'شہر',
    address: 'پتہ',
    enterCustomerName: 'کسٹمر کا نام درج کریں',
    enterCompany: 'کمپنی درج کریں',
    enterPhone: 'فون نمبر درج کریں',
    enterEmail: 'ای میل درج کریں',
    enterCity: 'شہر درج کریں',
    enterAddress: 'پتہ درج کریں',
    orderDetails: 'آرڈر کی تفصیلات',
    vatNumber: 'ویٹ نمبر (کسٹمر)',
    vatRate: 'ویٹ ریٹ (%)',
    vat: 'ویٹ',
    invoiceDate: 'انوائس کی تاریخ',
    enterVat: 'ویٹ نمبر درج کریں',
    products: 'مصنوعات (انوینٹری سے)',
    noProducts: 'انوینٹری میں کوئی مصنوعات نہیں۔',
    item: 'آئٹم',
    product: 'پروڈکٹ',
    quantity: 'مقدار',
    unitPrice: 'یونٹ قیمت',
    discount: 'ڈسکاؤنٹ (%)',
    lineTotal: 'لائن کل',
    enterQuantity: 'مقدار درج کریں',
    enterDiscount: 'ڈسکاؤنٹ درج کریں',
    selectProduct: 'پروڈکٹ منتخب کریں',
    searchProduct: 'نام یا SKU سے تلاش کریں',
    noProductsInv: 'انوینٹری میں کوئی مصنوعات نہیں',
    noMatching: 'کوئی مماثل مصنوعات نہیں',
    out: 'ختم',
    stock: 'اسٹاک',
    addProduct: 'پروڈکٹ شامل کریں',
    removeItem: 'ہٹائیں',
    paymentDetails: 'ادائیگی کی تفصیلات',
    paymentStatus: 'ادائیگی کی حالت',
    paid: 'ادا شدہ',
    unpaid: 'غیر ادا شدہ',
    partiallyPaid: 'جزوی ادا شدہ',
    amountReceived: 'موصول شدہ رقم',
    balanceDue: 'باقی رقم',
    paymentMethod: 'ادائیگی کا طریقہ',
    howPaid: 'کسٹمر نے کیسے ادا کیا؟',
    howPaidPlaceholder: 'مثلاً چیک، STC پے، ٹیبی',
    cash: 'نقد',
    bankTransfer: 'بینک ٹرانسفر',
    card: 'کارڈ',
    other: 'دیگر',
    actions: 'اقدامات',
    sendWhatsApp: 'واٹس ایپ پر بھیجیں',
    createInvoice: 'انوائس بنائیں',
    draftNotSaved: 'ڈرافٹ (محفوظ نہیں)',
    noCustomer: 'کوئی کسٹمر منتخب نہیں',
    subtotal: 'ذیلی کل',
    grandTotal: 'کل رقم',
    notes: 'نوٹس',
    notesPlaceholder: 'ڈیلیوری، ادائیگی کی شرائط یا دیگر نوٹس..',
    errName: 'کسٹمر کا نام درج کریں',
    errPhone: 'کسٹمر کا فون درج کریں',
    errDate: 'انوائس کی تاریخ لازمی ہے',
    errLines: 'کم از کم ایک پروڈکٹ مقدار کے ساتھ شامل کریں',
    errOtherPay: 'درج کریں کسٹمر نے کیسے ادا کیا',
    errStorage: 'محفوظ نہیں ہو سکا — اسٹوریج بھری ہو سکتی ہے۔',
    errAmountTooHigh: 'موصول شدہ رقم کل رقم سے زیادہ نہیں ہو سکتی۔',
    toastInvoice: (n: string) => `انوائس بن گئی — ${n}`,
    toastQuotation: (n: string) => `کوٹیشن کے طور پر محفوظ — ${n}`,
    waHello: (n: string) => `السلام علیکم ${n}،`,
    waQuotation: 'کوٹیشن',
    waDate: 'تاریخ',
    waItems: 'اشیاء',
    waReview: 'براہ کرم جائزہ لیں اور تصدیق کریں۔',
    addCustomer: 'کسٹمر شامل کریں',
    noCustomersYet: 'ابھی کوئی کسٹمر نہیں',
    clearCustomer: 'کسٹمر تبدیل کریں',
    addCustomerTitle: 'کسٹمر شامل کریں',
    addCustomerSubtitle: 'نیا کسٹمر ریکارڈ بنائیں',
    saveCustomer: 'کسٹمر محفوظ کریں',
    cancel: 'منسوخ',
    phoneHint: 'واٹس ایپ کے لیے کنٹری کوڈ شامل کریں۔',
    emailHint: 'اختیاری — انوائسز اور یاد دہانیوں کے لیے۔',
    errPhoneInvalid: 'کنٹری کوڈ کے ساتھ فون درج کریں، مثلاً +966 50 123 4567',
    errEmailInvalid: 'درست ای میل درج کریں',
    toastCustomerAdded: (n: string) => `کسٹمر شامل ہو گیا — ${n}`,
    phoneIntlLabel: 'فون (کنٹری کوڈ کے ساتھ)',
    phoneLocalLabel: 'فون (کنٹری کوڈ کے بغیر)',
    phoneEitherHint: 'کم از کم ایک فون نمبر درج کریں۔ ہر نمبر منفرد ہونا چاہیے۔',
    errPhoneEither: 'کم از کم ایک فون نمبر درج کریں',
    errDuplicatePhone: (n: string) =>
      `یہ فون نمبر پہلے ہی ${n} کے پاس ہے۔ ہر فون نمبر منفرد ہونا چاہیے۔`,
    productImage: 'پروڈکٹ کی تصویر',
    totalAmount: 'مجموعی رقم',
    discountedPrice: 'رعایتی قیمت',
    discountShort: 'ڈسکاؤنٹ',
    full: 'مکمل',
    fullHint: 'پوری رقم بھریں',
    billTo: 'بل بنام',
    docInvoice: 'انوائس',
    thankYou: 'آپ کے کاروبار کا شکریہ',
    errPdf: 'PDF نہیں بن سکی۔',
    pdfDownloadedHint: 'PDF ڈاؤن لوڈ ہو گئی — واٹس ایپ چیٹ میں منسلک کریں (📎)',
    sendingPdf: 'PDF تیار ہو رہی ہے...',
    pdfReadyTitle: 'PDF تیار ہے',
    pdfReadyHint:
      'واٹس ایپ براؤزر کو خود بخود فائل منسلک کرنے نہیں دیتا۔ "PDF شیئر کریں" دبائیں (اگر موجود ہو)، یا PDF ڈاؤن لوڈ کر کے چیٹ میں 📎 ← Document سے منسلک کریں۔',
    sharePdf: 'PDF شیئر کریں',
    downloadAndOpen: 'PDF ڈاؤن لوڈ کریں اور واٹس ایپ کھولیں',
    close: 'بند کریں',
    waPdfNote: 'PDF منسلک ہے۔',
    statusAutoApproved: 'خودکار منظوری (ادائیگی موصول)',
    maxProductsReached: 'انوینٹری کی تمام مصنوعات شامل ہو چکی ہیں',
    saveDraft: 'ڈرافٹ محفوظ کریں',
    restoreDraft: 'بحال کریں',
    resetForm: 'ری سیٹ',
    saveHint: 'موجودہ پیش رفت عارضی طور پر محفوظ کریں',
    restoreHint: 'آخری محفوظ شدہ ڈرافٹ بحال کریں',
    resetHint: 'تمام فیلڈز صاف کریں',
    draftSaved: 'ڈرافٹ محفوظ ہو گیا — آپ بعد میں بحال کر سکتے ہیں',
    draftRestored: 'ڈرافٹ بحال ہو گیا',
    noDraft: 'کوئی محفوظ ڈرافٹ نہیں ملا',
    draftEmpty: 'ابھی محفوظ کرنے کے لیے کچھ نہیں — پہلے کچھ تفصیلات بھریں',
    confirmReset: 'تمام فیلڈز صاف کریں؟ محفوظ شدہ ڈرافٹ ڈیلیٹ نہیں ہوگا۔',
    resetDone: 'فارم ری سیٹ ہو گیا',
    typeOrSelectCustomer: 'ٹائپ کریں یا کسٹمر منتخب کریں…',
    useAsCustomerName: (n: string) => `"${n}" کو کسٹمر کا نام بنائیں`,
    noMatchingCustomers: 'کوئی مماثل کسٹمر نہیں',
    salesChannel: 'سیلز چینل',
    channelOnline: 'آن لائن',
    channelOffline: 'آف لائن',
    dueDate: 'واجب الادا تاریخ',
    preview: 'پیش منظر',
    previewTitle: 'دستاویز کا پیش منظر',
    previewHint: 'پرنٹ میں ایسا نظر آئے گا',
    previewInvoice: 'انوائس',
    previewQuotation: 'کوٹیشن',
    print: 'پرنٹ',
    downloadPdf: 'PDF ڈاؤن لوڈ',
    customerDetails: 'کسٹمر کی تفصیلات',
    refNo: 'حوالہ',
    issueDateLabel: 'تاریخ اجرا',
    totalBeforeVat: 'ویٹ سے پہلے کل',
    vatPctShort: '% ویٹ',
    vatAmountShort: 'ویٹ',
    amountCol: 'رقم',
    totalVatLabel: 'کل ویٹ',
  },
  hi: {
    pageTitle: 'बिक्री - इनवॉइस / कोटेशन',
    pageSubtitle: 'कोटेशन या इनवॉइस बनाएँ और व्हाट्सएप से भेजें',
    customerInfo: 'ग्राहक की जानकारी',
    customerInfoHint: 'विवरण अपने-आप भर जाते हैं - आप बदल भी सकते हैं',
    selectCustomer: '- ग्राहक चुनें -',
    customerName: 'ग्राहक का नाम',
    company: 'कंपनी',
    phone: 'फ़ोन',
    email: 'ईमेल',
    city: 'शहर',
    address: 'पता',
    enterCustomerName: 'ग्राहक का नाम दर्ज करें',
    enterCompany: 'कंपनी दर्ज करें',
    enterPhone: 'फ़ोन नंबर दर्ज करें',
    enterEmail: 'ईमेल दर्ज करें',
    enterCity: 'शहर दर्ज करें',
    enterAddress: 'पता दर्ज करें',
    orderDetails: 'ऑर्डर विवरण',
    vatNumber: 'वैट नंबर (ग्राहक)',
    vatRate: 'वैट दर (%)',
    vat: 'वैट',
    invoiceDate: 'इनवॉइस की तारीख',
    enterVat: 'वैट नंबर दर्ज करें',
    products: 'उत्पाद (इन्वेंटरी से)',
    noProducts: 'इन्वेंटरी में कोई उत्पाद नहीं।',
    item: 'आइटम',
    product: 'उत्पाद',
    quantity: 'मात्रा',
    unitPrice: 'इकाई मूल्य',
    discount: 'छूट (%)',
    lineTotal: 'लाइन कुल',
    enterQuantity: 'मात्रा दर्ज करें',
    enterDiscount: 'छूट दर्ज करें',
    selectProduct: 'उत्पाद चुनें',
    searchProduct: 'नाम या SKU से खोजें',
    noProductsInv: 'इन्वेंटरी में कोई उत्पाद नहीं',
    noMatching: 'कोई मेल खाता उत्पाद नहीं',
    out: 'खत्म',
    stock: 'स्टॉक',
    addProduct: 'उत्पाद जोड़ें',
    removeItem: 'हटाएँ',
    paymentDetails: 'भुगतान विवरण',
    paymentStatus: 'भुगतान स्थिति',
    paid: 'भुगतान हो गया',
    unpaid: 'अवैतनिक',
    partiallyPaid: 'आंशिक भुगतान',
    amountReceived: 'प्राप्त राशि',
    balanceDue: 'बाकी राशि',
    paymentMethod: 'भुगतान का तरीका',
    howPaid: 'ग्राहक ने कैसे भुगतान किया?',
    howPaidPlaceholder: 'जैसे: चेक, STC Pay, Tabby',
    cash: 'नकद',
    bankTransfer: 'बैंक ट्रांसफ़र',
    card: 'कार्ड',
    other: 'अन्य',
    actions: 'क्रियाएँ',
    sendWhatsApp: 'व्हाट्सएप से भेजें',
    createInvoice: 'इनवॉइस बनाएँ',
    draftNotSaved: 'ड्राफ़्ट (सहेजा नहीं)',
    noCustomer: 'कोई ग्राहक चयनित नहीं',
    subtotal: 'उप-योग',
    grandTotal: 'कुल योग',
    notes: 'नोट्स',
    notesPlaceholder: 'डिलीवरी, भुगतान शर्तें या अन्य नोट्स..',
    errName: 'ग्राहक का नाम दर्ज करें',
    errPhone: 'ग्राहक का फ़ोन दर्ज करें',
    errDate: 'इनवॉइस की तारीख आवश्यक है',
    errLines: 'मात्रा के साथ कम से कम एक उत्पाद जोड़ें',
    errOtherPay: 'दर्ज करें कि ग्राहक ने कैसे भुगतान किया',
    errStorage: 'सहेजा नहीं जा सका — स्टोरेज भरा हो सकता है।',
    errAmountTooHigh: 'प्राप्त राशि कुल योग से अधिक नहीं हो सकती।',
    toastInvoice: (n: string) => `इनवॉइस बन गई — ${n}`,
    toastQuotation: (n: string) => `कोटेशन के रूप में सहेजा गया — ${n}`,
    waHello: (n: string) => `नमस्ते ${n},`,
    waQuotation: 'कोटेशन',
    waDate: 'तारीख',
    waItems: 'आइटम',
    waReview: 'कृपया समीक्षा करें और पुष्टि करें।',
    addCustomer: 'ग्राहक जोड़ें',
    noCustomersYet: 'अभी कोई ग्राहक नहीं',
    clearCustomer: 'ग्राहक बदलें',
    addCustomerTitle: 'ग्राहक जोड़ें',
    addCustomerSubtitle: 'नया ग्राहक रिकॉर्ड बनाएँ',
    saveCustomer: 'ग्राहक सहेजें',
    cancel: 'रद्द करें',
    phoneHint: 'व्हाट्सएप के लिए देश कोड शामिल करें।',
    emailHint: 'वैकल्पिक — इनवॉइस और रिमाइंडर के लिए।',
    errPhoneInvalid: 'देश कोड के साथ फ़ोन दर्ज करें, जैसे +966 50 123 4567',
    errEmailInvalid: 'मान्य ईमेल दर्ज करें',
    toastCustomerAdded: (n: string) => `ग्राहक जोड़ा गया — ${n}`,
    phoneIntlLabel: 'फ़ोन (देश कोड के साथ)',
    phoneLocalLabel: 'फ़ोन (बिना देश कोड)',
    phoneEitherHint: 'कम से कम एक फ़ोन नंबर भरें। हर नंबर अनोखा होना चाहिए।',
    errPhoneEither: 'कम से कम एक फ़ोन नंबर दर्ज करें',
    errDuplicatePhone: (n: string) =>
      `यह फ़ोन नंबर पहले से ${n} के पास है। हर फ़ोन नंबर अनोखा होना चाहिए।`,
    productImage: 'उत्पाद की छवि',
    totalAmount: 'कुल राशि',
    discountedPrice: 'छूट के बाद मूल्य',
    discountShort: 'छूट',
    full: 'पूरा',
    fullHint: 'पूरी राशि भरें',
    billTo: 'बिल टू',
    docInvoice: 'इनवॉइस',
    thankYou: 'आपके व्यवसाय के लिए धन्यवाद',
    errPdf: 'PDF नहीं बन सकी।',
    pdfDownloadedHint: 'PDF डाउनलोड हो गई — व्हाट्सएप चैट में अटैच करें (📎)',
    sendingPdf: 'PDF तैयार हो रही है...',
    pdfReadyTitle: 'PDF तैयार है',
    pdfReadyHint:
      'व्हाट्सएप ब्राउज़र को अपने-आप फ़ाइल अटैच करने नहीं देता। "PDF शेयर करें" दबाएँ (अगर उपलब्ध हो), या PDF डाउनलोड करके चैट में 📎 → Document से अटैच करें।',
    sharePdf: 'PDF शेयर करें',
    downloadAndOpen: 'PDF डाउनलोड करें और व्हाट्सएप खोलें',
    close: 'बंद करें',
    waPdfNote: 'PDF संलग्न है।',
    statusAutoApproved: 'स्वतः स्वीकृत (भुगतान प्राप्त)',
    maxProductsReached: 'इन्वेंटरी के सभी उत्पाद जोड़े जा चुके हैं',
    saveDraft: 'ड्राफ़्ट सहेजें',
    restoreDraft: 'पुनर्स्थापित करें',
    resetForm: 'रीसेट',
    saveHint: 'वर्तमान प्रगति अस्थायी रूप से सहेजें',
    restoreHint: 'आखिरी सहेजा ड्राफ़्ट पुनर्स्थापित करें',
    resetHint: 'सभी फ़ील्ड साफ़ करें',
    draftSaved: 'ड्राफ़्ट सहेजा गया — आप बाद में पुनर्स्थापित कर सकते हैं',
    draftRestored: 'ड्राफ़्ट पुनर्स्थापित हुआ',
    noDraft: 'कोई सहेजा हुआ ड्राफ़्ट नहीं मिला',
    draftEmpty: 'अभी सहेजने के लिए कुछ नहीं — पहले कुछ विवरण भरें',
    confirmReset: 'सभी फ़ील्ड साफ़ करें? सहेजा हुआ ड्राफ़्ट नहीं हटेगा।',
    resetDone: 'फ़ॉर्म रीसेट हुआ',
    typeOrSelectCustomer: 'लिखें या ग्राहक चुनें…',
    useAsCustomerName: (n: string) => `"${n}" को ग्राहक का नाम बनाएँ`,
    noMatchingCustomers: 'कोई मेल खाता ग्राहक नहीं',
    salesChannel: 'बिक्री चैनल',
    channelOnline: 'ऑनलाइन',
    channelOffline: 'ऑफ़लाइन',
    dueDate: 'देय तिथि',
    preview: 'पूर्वावलोकन',
    previewTitle: 'दस्तावेज़ पूर्वावलोकन',
    previewHint: 'प्रिंट में ऐसा दिखेगा',
    previewInvoice: 'इनवॉइस',
    previewQuotation: 'कोटेशन',
    print: 'प्रिंट',
    downloadPdf: 'PDF डाउनलोड',
    customerDetails: 'ग्राहक विवरण',
    refNo: 'संदर्भ',
    issueDateLabel: 'जारी तिथि',
    totalBeforeVat: 'वैट से पहले कुल',
    vatPctShort: '% वैट',
    vatAmountShort: 'वैट',
    amountCol: 'राशि',
    totalVatLabel: 'कुल वैट',
  },
} as const;

type Translations = {
  [K in keyof typeof t['en']]: (typeof t['en'])[K] extends (
    ...args: infer A
  ) => infer R
    ? (...args: A) => R
    : string;
};

// ============================================================
// TYPES
// ============================================================
type Customer = {
  /** PRIMARY KEY — equals normalized phone (with code) or, if empty, phoneAlt */
  id: string;
  name: string;
  company: string;
  /** Phone WITH country code (validated). May be empty if phoneAlt is filled. */
  phone: string;
  /** Phone WITHOUT country code (no validation). */
  phoneAlt?: string;
  email?: string;
  address: string;
  city: string;
  createdAt: string;
  updatedAt: string;
};

type CustomerSnapshot = {
  name: string;
  company: string;
  phone: string;
  phoneAlt?: string;
  email?: string;
  address: string;
  city: string;
};

type DocumentType = 'quotation' | 'invoice';
type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Card' | 'Other';
type PaymentStatus = 'Unpaid' | 'Partially Paid' | 'Paid';
type WorkflowStatus = 'Pending' | 'Approved' | 'Rejected';

type PaymentRecord = {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  note?: string;
  balanceAfter: number;
  recordedBy: string;
  createdAt: string;
};

// ✅ NEW: optional fields for RecordsSection compatibility
type DocumentLine = {
  id: string;
  productId: string;
  productImage?: string;
  material: string;
  sku: string;
  category?: string; // ✅ Section 9
  costPrice?: number; // ✅ Section 9
  description?: string; // ✅ Section 9
  quantity: number;
  unitPrice: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  lineTotal: number;
};

// ✅ NEW: optional fields for RecordsSection compatibility
type DocumentRecord = {
  id: string;
  documentType: DocumentType;
  orderNumber: string;
  customerId: string;
  customerSnapshot: CustomerSnapshot;
  issueDate: string;
  dueDate?: string; // ✅ Section 9 (auto = issueDate)
  salesChannel?: 'Online' | 'Offline'; // ✅ Section 9 (auto = Offline)
  tenantId?: string; // ✅ Section 9 (auto from user)
  updatedAt?: string; // ✅ Section 9 (auto = createdAt)
  status: WorkflowStatus;
  currency: string;
  notes: string;
  vatNumber: string;
  vatRate: number;
  lines: DocumentLine[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | '';
  paymentAmount: number;
  paymentDate: string;
  paymentReference: string;
  balanceDue: number;
  createdBy: string;
  createdAt: string;
  payments?: PaymentRecord[];
};

type StatusHistory = {
  id: string;
  documentId: string;
  oldStatus: WorkflowStatus | null;
  newStatus: WorkflowStatus;
  reason: string;
  changedBy: string;
  changedAt: string;
};

// ✅ InventoryProduct extended (category/cost/description)
type InventoryProduct = {
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
  category?: string; // ✅ Section 9
  costPrice?: number; // ✅ Section 9 (fallback = price * 0.6)
};

// ============================================================
// ACCOUNTING
// ============================================================
type AccountingMode = 'Cash' | 'Card' | 'Bank Transfer' | 'Other';
// ✅ FIX: 'Partially Paid' added to match RecordsSection
type AccountingTransaction = {
  id: string;
  transactionNo: string;
  date: string;
  customerName: string;
  companyName: string;
  invoiceRef: string;
  type: 'In' | 'Out' | 'Return';
  amount: number;
  status: 'Paid' | 'Partially Paid' | 'Pending' | 'Returned'; // ✅
  mode: AccountingMode;
  sourceDocumentId?: string;
  sourceModule?: 'sales' | 'inventory' | 'manual';
  notes?: string;
  createdAt: string;
};

const TRANSACTIONS_KEY = 'zakhira_transactions';

const loadAccountingList = (): AccountingTransaction[] => {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveAccountingList = (list: AccountingTransaction[]): boolean => {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
};

const genAccountingTxnNo = (existing: AccountingTransaction[]): string => {
  const year = new Date().getFullYear();
  const prefix = `TXN-${year}-`;
  const numbers = existing
    .filter((x) => x.transactionNo.startsWith(prefix))
    .map((x) => Number(x.transactionNo.split('-')[2]))
    .filter((n) => !Number.isNaN(n));
  const max = numbers.length ? Math.max(...numbers) : 0;
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
};

const mapPaymentMode = (m: PaymentMethod | ''): AccountingMode => {
  if (m === 'Cash') return 'Cash';
  if (m === 'Card') return 'Card';
  if (m === 'Bank Transfer') return 'Bank Transfer';
  return 'Other';
};

const syncAccountingEntry = (data: {
  type: 'In' | 'Out' | 'Return';
  amount: number;
  date: string;
  customerName: string;
  companyName: string;
  invoiceRef: string;
  status: 'Paid' | 'Partially Paid' | 'Pending' | 'Returned';
  mode: AccountingMode;
  sourceDocumentId: string;
  sourceModule: 'sales' | 'inventory' | 'manual';
  notes?: string;
}): AccountingTransaction | null => {
  const existing = loadAccountingList();
  const idx = existing.findIndex((x) => x.sourceDocumentId === data.sourceDocumentId);
  if (idx >= 0) {
    const updated: AccountingTransaction = {
      ...existing[idx],
      amount: data.amount,
      status: data.status,
      mode: data.mode,
      date: data.date,
      notes: data.notes || existing[idx].notes,
    };
    const newList = [...existing];
    newList[idx] = updated;
    saveAccountingList(newList);
    return updated;
  }
  const txn: AccountingTransaction = {
    id: `txn-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    transactionNo: genAccountingTxnNo(existing),
    date: data.date,
    customerName: data.customerName,
    companyName: data.companyName,
    invoiceRef: data.invoiceRef,
    type: data.type,
    amount: data.amount,
    status: data.status,
    mode: data.mode,
    sourceDocumentId: data.sourceDocumentId,
    sourceModule: data.sourceModule,
    notes: data.notes,
    createdAt: new Date().toISOString(),
  };
  saveAccountingList([txn, ...existing]);
  return txn;
};

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
    <svg {...svgBase} strokeWidth={2.5} className="w-3.5 h-3.5">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  x: (
    <svg {...svgBase} strokeWidth={2.5} className="w-3 h-3">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  check: (
    <svg {...svgBase} strokeWidth={2.5} className="w-3 h-3">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  trash: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  user: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  alert: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
    </svg>
  ),
  chevron: (
    <svg {...svgBase} strokeWidth={2.5} className="w-3 h-3 flex-shrink-0">
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
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
  box: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.3 7 12 12l8.7-5M12 22V12" />
    </svg>
  ),
  money: (
    <svg {...svgBase} className="w-4 h-4">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ),
  image: (
    <svg {...svgBase} className="w-4 h-4">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  ),
  search: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  save: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8" />
    </svg>
  ),
  restore: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5" />
    </svg>
  ),
  reset: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6M9 9l6 6" />
    </svg>
  ),
  eye: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  printer: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  ),
  download: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  ),
};

// ============================================================
// CONSTANTS + HELPERS
// ============================================================
const CUSTOMERS_KEY = 'zakhira_sales_customers';
const DOCUMENTS_KEY = 'zakhira_sales_documents';
const HISTORY_KEY = 'zakhira_sales_status_history';
const INVENTORY_PRODUCTS_KEY = 'zakhira_inventory_products';
const DRAFT_KEY = 'zakhira_invoice_draft';
const DEFAULT_VAT_RATE = 15;
const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Bank Transfer', 'Card', 'Other'];
const CUSTOMER_ROW_H = 44;
const CUSTOMER_VISIBLE_ROWS = 6;
const INTL_PHONE_REGEX = /^\+[1-9]\d{7,14}$/;

const uid = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const todayISO = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const roundMoney = (n: number): number =>
  Math.round((n + Number.EPSILON) * 100) / 100;

const formatMoney = (n: number): string =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (iso: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

const phoneDigits = (raw: string): string => raw.replace(/\D/g, '');

const normalizePhone = (raw: string): string => {
  let s = (raw || '').trim().replace(/[\s\-().]/g, '');
  if (s.startsWith('00')) s = `+${s.slice(2)}`;
  return s;
};

/**
 * Smart comparison: treats "03237594869" and "+923237594869" as the SAME
 * number. Digits only, leading zeros (local trunk prefix) removed, then
 * one number may be the tail of the other (country code difference).
 */
const samePhone = (a: string, b: string): boolean => {
  const da = a.replace(/\D/g, '').replace(/^0+/, '');
  const db = b.replace(/\D/g, '').replace(/^0+/, '');
  if (!da || !db) return false;
  if (da === db) return true;
  const [short, long] = da.length <= db.length ? [da, db] : [db, da];
  return short.length >= 7 && long.endsWith(short);
};

/** Every phone key a customer owns (used for uniqueness checks). */
const phoneKeysOf = (c: { phone: string; phoneAlt?: string }): string[] =>
  [normalizePhone(c.phone || ''), normalizePhone(c.phoneAlt || '')].filter(Boolean);

const generateOrderNumber = (
  type: DocumentType,
  existing: DocumentRecord[]
): string => {
  const year = new Date().getFullYear();
  const prefix = type === 'quotation' ? `QT-${year}-` : `INV-${year}-`;
  const numbers = existing
    .filter((d) => d.orderNumber.startsWith(prefix))
    .map((d) => Number(d.orderNumber.split('-')[2]))
    .filter((n) => !Number.isNaN(n));
  const max = numbers.length ? Math.max(...numbers) : 0;
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
};

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

// ✅ NEW: tenant id auto-fetch
const getTenantId = (): string => {
  try {
    const u = JSON.parse(localStorage.getItem('zakhira_user') || '{}');
    return String(u.tenantId || u.tenant_id || u.companyId || '');
  } catch {
    return '';
  }
};

const getCompanyInfo = () => {
  try {
    const u = JSON.parse(localStorage.getItem('zakhira_user') || '{}');
    return {
      name: u.companyName || u.company || u.businessName || 'Zakhira',
      address: u.companyAddress || u.address || '',
      phone: u.companyPhone || u.phone || '',
      vat: u.vatNumber || '',
    };
  } catch {
    return { name: 'Zakhira', address: '', phone: '', vat: '' };
  }
};

const getStoredLanguage = (): Language => {
  try {
    const u = JSON.parse(localStorage.getItem('zakhira_user') || '{}');
    const code = String(u.language || 'en').trim().toLowerCase().slice(0, 2);
    return code === 'ar' || code === 'ur' || code === 'hi' ? code : 'en';
  } catch {
    return 'en';
  }
};

const newLine = (): DocumentLine => ({
  id: uid('ln'),
  productId: '',
  productImage: '',
  material: '',
  sku: '',
  quantity: 0,
  unitPrice: 0,
  discountType: 'percentage',
  discountValue: 0,
  lineTotal: 0,
});

const EMPTY_CUSTOMER = {
  name: '',
  company: '',
  phone: '',
  phoneAlt: '',
  email: '',
  city: '',
  address: '',
};

// ============================================================
// STORAGE
// ============================================================
const loadCustomers = (): Customer[] => {
  try {
    const raw = localStorage.getItem(CUSTOMERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((c: Customer) => ({
      ...c,
      phone: c.phone || '',
      phoneAlt: c.phoneAlt || '',
    }));
  } catch {
    return [];
  }
};

const saveCustomers = (list: Customer[]): boolean => {
  try {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
};

const loadDocuments = (): DocumentRecord[] => {
  try {
    const raw = localStorage.getItem(DOCUMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveDocuments = (list: DocumentRecord[]): boolean => {
  try {
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
};

const loadHistory = (): StatusHistory[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveHistory = (list: StatusHistory[]): boolean => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
};

const loadInventoryProducts = (): InventoryProduct[] => {
  try {
    const raw = localStorage.getItem(INVENTORY_PRODUCTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p: InventoryProduct) => p.active);
  } catch {
    return [];
  }
};

// ============================================================
// DRAFT
// ============================================================
type InvoiceDraft = {
  customerId: string;
  customer: typeof EMPTY_CUSTOMER;
  issueDate: string;
  lines: DocumentLine[];
  vatNumber: string;
  vatRate: number;
  notes: string;
  discMode: 'pct' | 'amount';
  discPctStr: string;
  discPriceStr: string;
  discTotalStr: string;
  discLocked: number;
  amountReceived: number | '';
  paymentMethod: PaymentMethod;
  otherPaymentNote: string;
  savedAt: string;
};

const loadDraft = (): InvoiceDraft | null => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.lines)) {
      return null;
    }
    return parsed as InvoiceDraft;
  } catch {
    return null;
  }
};

const saveDraftToStorage = (draft: InvoiceDraft): boolean => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
};

const clearDraftStorage = (): void => {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
};

// ============================================================
// PDF HELPERS
// ============================================================
const escHtml = (s: string | number | undefined | null): string =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

type Html2PdfChain = {
  set: (opts: Record<string, unknown>) => Html2PdfChain;
  from: (el: HTMLElement) => Html2PdfChain;
  outputPdf: (type: 'blob') => Promise<Blob>;
};

const htmlToPdfBlob = async (html: string, filename: string): Promise<Blob> => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const mod = await import('html2pdf.js');
  const html2pdf = ((mod as { default?: unknown }).default ?? mod) as () => Html2PdfChain;

  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const css = (parsed.querySelector('style')?.textContent ?? '')
    .replace(/@page\{[^}]*\}/, '')
    .replace(/body\{/, '.pdf-root{');

  const wrapper = document.createElement('div');
  wrapper.style.cssText =
    'position:fixed;left:-10000px;top:0;width:794px;overflow:visible;pointer-events:none;';
  const host = document.createElement('div');
  host.className = 'pdf-root';
  host.dir = parsed.documentElement.getAttribute('dir') || 'ltr';
  host.style.cssText = 'background:#ffffff;';
  host.innerHTML = `<style>${css}</style>${parsed.body.innerHTML}`;
  wrapper.appendChild(host);
  document.body.appendChild(wrapper);

  try {
    await new Promise((r) => setTimeout(r, 150));

    const pdfOptions: Record<string, unknown> = {
      margin: 8,
      filename,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] },
    };

    const blob = await html2pdf().set(pdfOptions).from(host).outputPdf('blob');
    return blob;
  } finally {
    wrapper.remove();
  }
};

const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
};

type PdfReady = {
  blob: Blob;
  filename: string;
  phone: string;
  text: string;
};

const canSharePdf = (blob: Blob, filename: string): boolean => {
  try {
    const file = new File([blob], filename, { type: 'application/pdf' });
    return typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
};

const sharePdfFile = async (
  blob: Blob,
  filename: string,
  text: string
): Promise<'shared' | 'cancelled' | 'failed'> => {
  if (!canSharePdf(blob, filename)) return 'failed';
  try {
    const file = new File([blob], filename, { type: 'application/pdf' });
    await navigator.share({ files: [file], text, title: filename });
    return 'shared';
  } catch (e) {
    return (e as DOMException).name === 'AbortError' ? 'cancelled' : 'failed';
  }
};

const openWhatsAppChat = (phone: string, text: string): void => {
  window.open(
    `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`,
    '_blank'
  );
};

// ============================================================
// 🖨️ DOCUMENT HTML (used for PDF, WhatsApp AND on-screen Preview/Print)
// Layout follows the reference invoice: customer details + reference
// block on top, 9-column table, totals at the bottom.
// ============================================================
type HeaderKey =
  | 'product'
  | 'quantity'
  | 'unitPrice'
  | 'discountShort'
  | 'vatPctShort'
  | 'totalBeforeVat'
  | 'vatAmountShort'
  | 'amountCol';

const buildQuotationHtml = (
  record: DocumentRecord,
  tr: Translations,
  company: ReturnType<typeof getCompanyInfo>,
  isRTL: boolean,
  language: Language
): string => {
  const docLabel =
    record.documentType === 'invoice' ? tr.docInvoice : tr.waQuotation;
  const noSpacing = isRTL || language === 'hi';
  const ls = noSpacing ? '0' : '2px';
  const border = `${THEME.mutedOlive}40`;
  const startSide = isRTL ? 'right' : 'left';
  const endSide = isRTL ? 'left' : 'right';
  const payText =
    record.paymentStatus === 'Paid'
      ? tr.paid
      : record.paymentStatus === 'Partially Paid'
        ? tr.partiallyPaid
        : tr.unpaid;

  // Column header: current language + small English line (like the reference)
  const hd = (k: HeaderKey): string =>
    language === 'en'
      ? escHtml(tr[k])
      : `${escHtml(tr[k])}<span class="sub">${escHtml(t.en[k])}</span>`;

  // ---- Per-line figures (global discount spread proportionally) ----
  const sub = record.subtotal;
  let discLeft = record.discountTotal;
  let vatLeft = record.taxTotal;
  const calc = record.lines.map((l, i) => {
    const isLast = i === record.lines.length - 1;
    const disc = isLast
      ? roundMoney(discLeft)
      : sub > 0
        ? roundMoney((record.discountTotal * l.lineTotal) / sub)
        : 0;
    discLeft = roundMoney(discLeft - disc);
    const before = roundMoney(l.lineTotal - disc);
    const vat = isLast
      ? roundMoney(vatLeft)
      : roundMoney((before * record.vatRate) / 100);
    vatLeft = roundMoney(vatLeft - vat);
    return { l, disc, before, vat, amount: roundMoney(before + vat) };
  });

  const rows = calc
    .map(
      (c, i) => `<tr>
        <td class="c">${i + 1}</td>
        <td><b>${escHtml(c.l.material)}</b><br><span class="muted">${escHtml(c.l.sku)}</span></td>
        <td class="c">${c.l.quantity}</td>
        <td class="n">${formatMoney(c.l.unitPrice)}</td>
        <td class="n">${formatMoney(c.disc)}</td>
        <td class="c">${record.vatRate}</td>
        <td class="n">${formatMoney(c.before)}</td>
        <td class="n">${formatMoney(c.vat)}</td>
        <td class="n"><b>${formatMoney(c.amount)}</b></td>
      </tr>`
    )
    .join('');

  const totalBeforeVat = roundMoney(record.subtotal - record.discountTotal);

  const paidRows =
    record.paymentAmount > 0
      ? `<div class="row"><span>${escHtml(tr.amountReceived)}</span><span>${formatMoney(record.paymentAmount)}</span></div>
         <div class="row"><span>${escHtml(tr.balanceDue)}</span><span><b>${formatMoney(record.balanceDue)}</b></span></div>`
      : '';

  const snap = record.customerSnapshot;
  const cityLine = [snap.address, snap.city].filter(Boolean).join(', ');

  return `<!doctype html><html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${language}"><head><meta charset="utf-8"><title>${escHtml(record.orderNumber)}</title>
<style>
@page{size:A4;margin:12mm}
*{box-sizing:border-box}
body{font-family:'Segoe UI',Tahoma,Arial,Helvetica,sans-serif;color:${THEME.charcoal};margin:0;padding:20px}
.head{border-bottom:3px solid ${THEME.deepForest};padding-bottom:14px;margin-bottom:18px;display:flex;justify-content:space-between;align-items:flex-end}
.co{font-size:22px;font-weight:700;color:${THEME.deepForest}}
.muted{color:${THEME.mutedOlive};font-size:10px;line-height:1.6}
h1{font-size:18px;letter-spacing:${ls};margin:0;color:${THEME.deepForest};text-transform:uppercase;text-align:${endSide}}
.meta{display:flex;gap:16px;margin-bottom:16px}
.cust{flex:1.5;border:1px solid ${border};border-radius:12px;padding:12px 14px;font-size:12px;line-height:1.7}
.refs{flex:1;border:1px solid ${border};border-radius:12px;padding:12px 14px;font-size:12px;line-height:1.7}
.meta h3{margin:0 0 6px;font-size:10px;text-transform:uppercase;letter-spacing:${noSpacing ? '0' : '1px'};color:${THEME.mutedOlive}}
.cname{font-size:14px;font-weight:700}
.rrow{display:flex;justify-content:space-between;gap:8px}
.rrow span:first-child{color:${THEME.mutedOlive}}
table{width:100%;border-collapse:collapse;font-size:10px;table-layout:fixed}
th:nth-child(1),td:nth-child(1){width:5%}
th:nth-child(2),td:nth-child(2){width:27%;word-wrap:break-word}
th:nth-child(3),td:nth-child(3){width:8%}
th:nth-child(4),td:nth-child(4){width:11%}
th:nth-child(5),td:nth-child(5){width:10%}
th:nth-child(6),td:nth-child(6){width:7%}
th:nth-child(7),td:nth-child(7){width:12%}
th:nth-child(8),td:nth-child(8){width:10%}
th:nth-child(9),td:nth-child(9){width:10%}
tr{page-break-inside:avoid}
th{background:${THEME.warmIvory};text-align:center;padding:6px 3px;border:1px solid ${border};font-size:9px;line-height:1.35;vertical-align:middle}
th .sub{display:block;font-size:8px;font-weight:400;color:${THEME.mutedOlive}}
td{padding:6px 4px;border:1px solid ${border};vertical-align:top;text-align:${startSide}}
td.c{text-align:center}
td.n{text-align:${endSide};white-space:nowrap}
.totals{width:300px;margin-top:16px;${startSide === 'left' ? 'margin-left:auto' : 'margin-right:auto'};font-size:12px;page-break-inside:avoid}
.row{display:flex;justify-content:space-between;padding:4px 0}
.grand{border-top:2px solid ${THEME.deepForest};margin-top:6px;padding-top:8px;font-size:15px;font-weight:700;color:${THEME.deepForest}}
.note{margin-top:14px;font-size:12px;color:${THEME.mutedOlive}}
.foot{margin-top:32px;font-size:10px;color:${THEME.mutedOlive};text-align:center;border-top:1px solid ${border};padding-top:10px}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
<div class="head">
  <div>
    <div class="co">${escHtml(company.name)}</div>
    <div class="muted">
      ${company.address ? `${escHtml(company.address)}` : ''}
      ${company.phone ? `<br><span dir="ltr">${escHtml(company.phone)}</span>` : ''}
      ${company.vat ? `<br>${escHtml(tr.vat)}: ${escHtml(company.vat)}` : ''}
    </div>
  </div>
  <div>
    <h1>${escHtml(docLabel)}</h1>
    <div class="muted" style="text-align:${endSide};margin-top:4px"><span dir="ltr"><b>${escHtml(record.orderNumber)}</b></span></div>
  </div>
</div>
<div class="meta">
  <div class="cust">
    <h3>${escHtml(tr.customerDetails)}</h3>
    <div class="cname">${escHtml(snap.name || '—')}</div>
    ${snap.company ? `<div>${escHtml(snap.company)}</div>` : ''}
    ${cityLine ? `<div>${escHtml(cityLine)}</div>` : ''}
    ${snap.phone ? `<div dir="ltr" style="text-align:${startSide}">${escHtml(snap.phone)}</div>` : ''}
    ${snap.phoneAlt ? `<div dir="ltr" style="text-align:${startSide}">${escHtml(snap.phoneAlt)}</div>` : ''}
    ${snap.email ? `<div dir="ltr" style="text-align:${startSide}">${escHtml(snap.email)}</div>` : ''}
    ${record.vatNumber ? `<div>${escHtml(tr.vatNumber)}: <b>${escHtml(record.vatNumber)}</b></div>` : ''}
  </div>
  <div class="refs">
    <h3>${escHtml(docLabel)}</h3>
    <div class="rrow"><span>${escHtml(tr.refNo)}</span><b dir="ltr">${escHtml(record.orderNumber)}</b></div>
    <div class="rrow"><span>${escHtml(tr.issueDateLabel)}</span><span>${formatDate(record.issueDate)}</span></div>
    <div class="rrow"><span>${escHtml(tr.dueDate)}</span><span>${formatDate(record.dueDate || record.issueDate)}</span></div>
    <div class="rrow"><span>${escHtml(tr.paymentStatus)}</span><b>${escHtml(payText)}</b></div>
  </div>
</div>
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>${hd('product')}</th>
      <th>${hd('quantity')}</th>
      <th>${hd('unitPrice')}</th>
      <th>${hd('discountShort')}</th>
      <th>${hd('vatPctShort')}</th>
      <th>${hd('totalBeforeVat')}</th>
      <th>${hd('vatAmountShort')}</th>
      <th>${hd('amountCol')}</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>
<div class="totals">
  <div class="row"><span>${escHtml(tr.totalBeforeVat)}</span><span>${formatMoney(totalBeforeVat)}</span></div>
  <div class="row"><span>${escHtml(tr.totalVatLabel)}${record.taxTotal > 0 ? ` (${record.vatRate}%)` : ''}</span><span>${formatMoney(record.taxTotal)}</span></div>
  <div class="row grand"><span>${escHtml(tr.grandTotal)}</span><span>${formatMoney(record.grandTotal)}</span></div>
  ${paidRows}
</div>
${record.notes ? `<div class="note">${escHtml(tr.notes)}: ${escHtml(record.notes)}</div>` : ''}
<div class="foot">${escHtml(tr.thankYou)}</div>
</body></html>`;
};

// ============================================================
// STYLES
// ============================================================
const cardCls = 'rounded-2xl bg-white border border-[#66745A]/10 p-3.5';
const labelCls = 'block text-[10px] font-semibold text-[#252A28] mb-1';
const fieldCls =
  'w-full h-9 px-3 rounded-full border border-[#66745A]/25 bg-[#F7F3EA] text-[13px] text-[#252A28] placeholder:text-[#66745A]/60 caret-[#C49A5A] focus:outline-none focus:border-[#C49A5A] focus:bg-white focus:ring-2 focus:ring-[#C49A5A]/25 transition-colors';

// ============================================================
// PRODUCT SELECT
// ============================================================
function ProductSelect({
  value,
  products,
  excludeIds,
  tr,
  onSelect,
}: {
  value: string;
  products: InventoryProduct[];
  excludeIds: string[];
  tr: Translations;
  onSelect: (product: InventoryProduct) => void;
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const selected = products.find((p) => p.id === value);
  const available = products.filter(
    (p) => p.id === value || !excludeIds.includes(p.id)
  );
  const needle = q.trim().toLowerCase();
  const filtered = available.filter(
    (p) =>
      p.name.toLowerCase().includes(needle) ||
      p.sku.toLowerCase().includes(needle)
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${fieldCls} flex items-center justify-between gap-2 text-start cursor-pointer`}
      >
        <span
          className="truncate"
          style={{ color: selected ? THEME.charcoal : `${THEME.mutedOlive}99` }}
        >
          {selected ? `${selected.name} — ${selected.sku}` : tr.selectProduct}
        </span>
        <span style={{ color: THEME.deepForest }}>{Icons.chevron}</span>
      </button>
      {open && (
        <div
          className="mt-1.5 rounded-2xl bg-white p-2 shadow-lg"
          style={{ border: `1px solid ${THEME.mutedOlive}30` }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tr.searchProduct}
            className="h-8 w-full rounded-full px-3 text-[12px] focus:outline-none"
            style={{
              background: THEME.warmIvory,
              border: `1px solid ${THEME.mutedOlive}30`,
              color: THEME.charcoal,
            }}
          />
          <div className="mt-1.5 max-h-52 space-y-0.5 overflow-y-auto">
            {products.length === 0 ? (
              <p className="px-3 py-3 text-center text-[11px]" style={{ color: THEME.mutedOlive }}>
                {tr.noProductsInv}
              </p>
            ) : filtered.length === 0 ? (
              <p className="px-3 py-2.5 text-[11px]" style={{ color: THEME.mutedOlive }}>
                {tr.noMatching}
              </p>
            ) : (
              filtered.map((p) => {
                const isSelected = p.id === value;
                const isOut = p.stock === 0;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSelect(p);
                      setOpen(false);
                      setQ('');
                    }}
                    className="w-full cursor-pointer rounded-lg px-2.5 py-1.5 text-start transition-colors hover:bg-[#F7F3EA]"
                    style={{ background: isSelected ? `${THEME.mutedOlive}15` : undefined }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-semibold" style={{ color: THEME.charcoal }}>
                          {p.name}
                        </p>
                        <p className="mt-0.5 font-mono text-[10px]" style={{ color: THEME.mutedOlive }}>
                          {p.sku} · {formatMoney(p.price)}
                        </p>
                      </div>
                      <span
                        className="whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={
                          isOut
                            ? { background: '#fee2e2', color: '#b91c1c' }
                            : p.stock <= p.lowStockLevel
                              ? { background: '#fef3c7', color: '#b45309' }
                              : { background: '#dcfce7', color: '#15803d' }
                        }
                      >
                        {isOut ? tr.out : `${tr.stock} ${p.stock}`}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// CUSTOMER PICKER
// ============================================================
function CustomerPicker({
  customers,
  selected,
  tr,
  onSelect,
  onAddNew,
  onClear,
  onTypeName,
}: {
  customers: Customer[];
  selected: Customer | undefined;
  tr: Translations;
  onSelect: (c: Customer) => void;
  onAddNew: () => void;
  onClear: () => void;
  onTypeName: (name: string) => void;
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const typed = q.trim();
  const needle = typed.toLowerCase();
  const needleDigits = needle.replace(/\D/g, '');
  const filtered = needle
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(needle) ||
          c.company.toLowerCase().includes(needle) ||
          (needleDigits !== '' &&
            phoneKeysOf(c).some((k) => k.replace(/\D/g, '').includes(needleDigits)))
      )
    : customers;
  const exactMatch = customers.some((c) => c.name.trim().toLowerCase() === needle);

  const pick = (c: Customer): void => {
    onSelect(c);
    setQ('');
    setOpen(false);
  };

  const useTyped = (): void => {
    if (!typed) return;
    onTypeName(typed);
    setQ('');
    setOpen(false);
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (filtered.length === 1 && needle) pick(filtered[0]);
    else useTyped();
  };

  return (
    <div ref={ref} className="relative w-64">
      {selected ? (
        <div className={`${fieldCls} flex items-center justify-between gap-2 !text-[12px]`}>
          <span className="truncate font-semibold">{selected.name}</span>
          <button
            type="button"
            onClick={onClear}
            title={tr.clearCustomer}
            aria-label={tr.clearCustomer}
            className="flex h-5 w-5 flex-shrink-0 cursor-pointer items-center justify-center rounded-full transition hover:bg-[#66745A]/15"
            style={{ color: THEME.mutedOlive }}
          >
            {Icons.x}
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onInputKeyDown}
            placeholder={tr.typeOrSelectCustomer}
            autoComplete="off"
            className={`${fieldCls} !text-[12px] pe-14`}
          />
          <span
            className="pointer-events-none absolute end-8 top-1/2 -translate-y-1/2"
            style={{ color: THEME.mutedOlive }}
          >
            {Icons.search}
          </span>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={tr.selectCustomer}
            className="absolute end-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full transition hover:bg-[#66745A]/15"
            style={{ color: THEME.deepForest }}
          >
            {Icons.chevron}
          </button>
        </div>
      )}

      {open && !selected && (
        <div
          className="absolute end-0 top-full z-30 mt-1.5 w-72 rounded-2xl bg-white p-2 shadow-lg"
          style={{ border: `1px solid ${THEME.mutedOlive}30` }}
        >
          <div
            className="space-y-0.5 overflow-y-auto"
            style={{
              maxHeight:
                CUSTOMER_ROW_H * CUSTOMER_VISIBLE_ROWS + (CUSTOMER_VISIBLE_ROWS - 1) * 2,
            }}
          >
            {customers.length === 0 && !typed ? (
              <p className="px-3 py-3 text-center text-[11px]" style={{ color: THEME.mutedOlive }}>
                {tr.noCustomersYet}
              </p>
            ) : filtered.length === 0 ? (
              <p className="px-3 py-2.5 text-center text-[11px]" style={{ color: THEME.mutedOlive }}>
                {tr.noMatchingCustomers}
              </p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => pick(c)}
                  className="flex w-full cursor-pointer flex-col justify-center rounded-lg px-2.5 text-start transition-colors hover:bg-[#F7F3EA]"
                  style={{ height: CUSTOMER_ROW_H }}
                >
                  <span className="truncate text-[12px] font-semibold" style={{ color: THEME.charcoal }}>
                    {c.name}
                    {c.company ? ` — ${c.company}` : ''}
                  </span>
                  <span
                    dir="ltr"
                    className="truncate text-start font-mono text-[10px]"
                    style={{ color: THEME.mutedOlive }}
                  >
                    {c.phone || c.phoneAlt}
                  </span>
                </button>
              ))
            )}
          </div>

          {typed && !exactMatch && (
            <button
              type="button"
              onClick={useTyped}
              className="mt-1.5 flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 text-[12px] font-semibold transition-colors hover:bg-[#F7F3EA]"
              style={{ border: `1.5px solid ${THEME.deepForest}`, color: THEME.deepForest }}
            >
              {Icons.user}
              <span className="truncate">{tr.useAsCustomerName(typed)}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onAddNew();
            }}
            className="mt-1.5 flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full text-[12px] font-semibold transition-colors hover:bg-[#C49A5A]/10"
            style={{ border: `1.5px dashed ${THEME.warmBrass}`, color: THEME.deepForest }}
          >
            {Icons.plus}
            <span>{tr.addCustomer}</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// QUICK ADD CUSTOMER MODAL
// Same logic as the Customers page: 2 phone inputs (with / without
// country code), at least one required, phone is unique + primary key.
// ============================================================
type QuickErrors = Partial<Record<keyof typeof EMPTY_CUSTOMER | 'phoneGroup', string>>;

function QuickCustomerModal({
  tr,
  onClose,
  onSaved,
}: {
  tr: Translations;
  onClose: () => void;
  onSaved: (c: Customer, list: Customer[]) => void;
}): React.JSX.Element {
  const [form, setForm] = useState({ ...EMPTY_CUSTOMER });
  const [errors, setErrors] = useState<QuickErrors>({});
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = (k: keyof typeof EMPTY_CUSTOMER, v: string): void =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = (): void => {
    const e: QuickErrors = {};
    if (!form.name.trim()) e.name = tr.errName;

    const intl = normalizePhone(form.phone);
    const alt = normalizePhone(form.phoneAlt);

    // At least ONE of the two phone fields is required
    if (!intl && !alt) {
      e.phoneGroup = tr.errPhoneEither;
    } else if (intl && !INTL_PHONE_REGEX.test(intl)) {
      // Only the "with country code" field is validated
      e.phone = tr.errPhoneInvalid;
    }

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = tr.errEmailInvalid;
    }

    // Always check against the freshest data in storage
    const list = loadCustomers();

    // 🔒 UNIQUE PHONE — any number used by another customer is blocked
    if (intl && !e.phone) {
      const dup = list.find((c) => phoneKeysOf(c).some((k) => samePhone(k, intl)));
      if (dup) e.phone = tr.errDuplicatePhone(dup.name);
    }
    if (alt) {
      const dup = list.find((c) => phoneKeysOf(c).some((k) => samePhone(k, alt)));
      if (dup) e.phoneAlt = tr.errDuplicatePhone(dup.name);
    }

    setErrors(e);
    setSaveError('');
    if (Object.keys(e).length > 0) return;

    const now = new Date().toISOString();
    const key = intl || alt; // 🔑 primary key
    const created: Customer = {
      id: key,
      name: form.name.trim(),
      company: form.company.trim(),
      email: form.email.trim(),
      phone: intl,
      phoneAlt: alt,
      address: form.address.trim(),
      city: form.city.trim(),
      createdAt: now,
      updatedAt: now,
    };
    const next = [created, ...list];
    if (!saveCustomers(next)) {
      setSaveError(tr.errStorage);
      return;
    }
    onSaved(created, next);
  };

  const errCls = 'mt-1 px-2 text-[10px] font-semibold';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: `${THEME.charcoal}80`, backdropFilter: 'blur(4px)' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl shadow-xl"
        style={{ background: THEME.warmIvory }}
      >
        <div
          className="flex items-start justify-between gap-3 px-5 pb-3 pt-5"
          style={{ borderBottom: `1px solid ${THEME.mutedOlive}20` }}
        >
          <div className="min-w-0">
            <h2 className="text-sm font-bold" style={{ color: THEME.deepForest }}>
              {tr.addCustomerTitle}
            </h2>
            <p className="mt-0.5 text-[11px]" style={{ color: THEME.mutedOlive }}>
              {tr.addCustomerSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={tr.cancel}
            className="flex h-7 w-7 flex-shrink-0 cursor-pointer items-center justify-center rounded-full transition"
            style={{ background: `${THEME.mutedOlive}15`, color: THEME.mutedOlive }}
          >
            {Icons.x}
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>
                {tr.customerName} <span style={{ color: THEME.warmBrass }}>*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder={tr.enterCustomerName}
                className={fieldCls}
                autoFocus
              />
              {errors.name && <p className={errCls} style={{ color: THEME.warmBrass }}>{errors.name}</p>}
            </div>
            <div>
              <label className={labelCls}>{tr.company}</label>
              <input
                value={form.company}
                onChange={(e) => set('company', e.target.value)}
                placeholder={tr.enterCompany}
                className={fieldCls}
              />
            </div>

            {/* PHONE — two inputs, at least one is required */}
            <div className="sm:col-span-2">
              <label className={labelCls}>
                {tr.phone} <span style={{ color: THEME.warmBrass }}>*</span>
              </label>
              <p className="mb-2 px-2 text-[9px]" style={{ color: THEME.mutedOlive }}>
                {tr.phoneEitherHint}
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelCls} style={{ color: THEME.mutedOlive }}>
                    {tr.phoneIntlLabel}
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    placeholder="+966 50 123 4567"
                    className={`${fieldCls} font-mono text-start`}
                  />
                  {errors.phone && (
                    <p className={errCls} style={{ color: THEME.warmBrass }}>{errors.phone}</p>
                  )}
                </div>
                <div>
                  <label className={labelCls} style={{ color: THEME.mutedOlive }}>
                    {tr.phoneLocalLabel}
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={form.phoneAlt}
                    onChange={(e) => set('phoneAlt', e.target.value)}
                    placeholder="0501234567"
                    className={`${fieldCls} font-mono text-start`}
                  />
                  {errors.phoneAlt && (
                    <p className={errCls} style={{ color: THEME.warmBrass }}>{errors.phoneAlt}</p>
                  )}
                </div>
              </div>
              {errors.phoneGroup && (
                <p className={errCls} style={{ color: THEME.warmBrass }}>{errors.phoneGroup}</p>
              )}
            </div>

            <div>
              <label className={labelCls}>{tr.email}</label>
              <input
                type="email"
                dir="ltr"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="ahmed@example.com"
                className={`${fieldCls} font-mono text-start`}
              />
              {errors.email ? (
                <p className={errCls} style={{ color: THEME.warmBrass }}>{errors.email}</p>
              ) : (
                <p className="mt-1 px-2 text-[9px]" style={{ color: THEME.mutedOlive }}>{tr.emailHint}</p>
              )}
            </div>
            <div>
              <label className={labelCls}>{tr.city}</label>
              <input
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                placeholder={tr.enterCity}
                className={fieldCls}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{tr.address}</label>
              <input
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                placeholder={tr.enterAddress}
                className={fieldCls}
              />
            </div>
          </div>

          {saveError && (
            <div
              className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-bold"
              style={{
                background: 'rgba(196,154,90,0.1)',
                border: '2px solid rgba(196,154,90,0.4)',
                color: THEME.charcoal,
              }}
            >
              {Icons.alert}
              <span>{saveError}</span>
            </div>
          )}

          <div
            className="mt-3 flex gap-2.5 pt-3"
            style={{ borderTop: `1px solid ${THEME.mutedOlive}20` }}
          >
            <button
              type="button"
              onClick={submit}
              className="flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 text-[13px] font-bold transition-all hover:brightness-95"
              style={{
                background: THEME.warmBrass,
                color: THEME.warmIvory,
                boxShadow: '0 4px 12px rgba(196,154,90,0.35)',
              }}
            >
              {Icons.plus}
              <span>{tr.saveCustomer}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-9 cursor-pointer rounded-full px-4 text-[13px] font-bold transition-all"
              style={{
                background: 'transparent',
                border: `2px solid ${THEME.mutedOlive}30`,
                color: THEME.mutedOlive,
              }}
            >
              {tr.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PREVIEW MODAL — shows the document exactly as it prints
// ============================================================
function PreviewModal({
  tr,
  html,
  docType,
  downloading,
  onTypeChange,
  onDownload,
  onClose,
}: {
  tr: Translations;
  html: string;
  docType: DocumentType;
  downloading: boolean;
  onTypeChange: (t: DocumentType) => void;
  onDownload: () => void;
  onClose: () => void;
}): React.JSX.Element {
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handlePrint = (): void => {
    const w = frameRef.current?.contentWindow;
    if (!w) return;
    w.focus();
    w.print();
  };

  const tabs: { id: DocumentType; label: string }[] = [
    { id: 'invoice', label: tr.previewInvoice },
    { id: 'quotation', label: tr.previewQuotation },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: `${THEME.charcoal}80`, backdropFilter: 'blur(4px)' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="flex h-[92vh] w-full max-w-4xl flex-col rounded-2xl shadow-xl"
        style={{ background: THEME.warmIvory }}
      >
        <div
          className="flex flex-wrap items-start justify-between gap-3 px-5 pb-3 pt-5"
          style={{ borderBottom: `1px solid ${THEME.mutedOlive}20` }}
        >
          <div className="min-w-0">
            <h2 className="text-sm font-bold" style={{ color: THEME.deepForest }}>
              {tr.previewTitle}
            </h2>
            <p className="mt-0.5 text-[11px]" style={{ color: THEME.mutedOlive }}>
              {tr.previewHint}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {tabs.map((tab) => {
              const active = docType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTypeChange(tab.id)}
                  aria-pressed={active}
                  className="h-8 cursor-pointer rounded-full px-3.5 text-[12px] font-semibold transition"
                  style={
                    active
                      ? { background: THEME.deepForest, color: THEME.warmIvory, border: `1.5px solid ${THEME.deepForest}` }
                      : { background: 'transparent', color: THEME.mutedOlive, border: `1.5px solid ${THEME.mutedOlive}40` }
                  }
                >
                  {tab.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={onClose}
              aria-label={tr.close}
              className="flex h-7 w-7 flex-shrink-0 cursor-pointer items-center justify-center rounded-full transition"
              style={{ background: `${THEME.mutedOlive}15`, color: THEME.mutedOlive }}
            >
              {Icons.x}
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden p-4" style={{ background: '#E9E5DA' }}>
          <iframe
            ref={frameRef}
            title={tr.previewTitle}
            srcDoc={html}
            className="h-full w-full rounded-lg shadow-md"
            style={{ background: '#FFFFFF', border: 'none' }}
          />
        </div>

        <div
          className="flex flex-wrap items-center justify-end gap-2.5 px-5 py-3"
          style={{ borderTop: `1px solid ${THEME.mutedOlive}20` }}
        >
          <button
            type="button"
            onClick={onClose}
            className="h-9 cursor-pointer rounded-full px-4 text-[13px] font-bold transition-all"
            style={{
              background: 'transparent',
              border: `2px solid ${THEME.mutedOlive}30`,
              color: THEME.mutedOlive,
            }}
          >
            {tr.close}
          </button>
          <button
            type="button"
            onClick={onDownload}
            disabled={downloading}
            className="flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 text-[13px] font-bold transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              border: `1.5px solid ${THEME.deepForest}`,
              background: THEME.warmIvory,
              color: THEME.deepForest,
            }}
          >
            {Icons.download}
            <span>{downloading ? tr.sendingPdf : tr.downloadPdf}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 text-[13px] font-bold text-white transition hover:brightness-95"
            style={{ background: THEME.warmBrass }}
          >
            {Icons.printer}
            <span>{tr.print}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PDF READY MODAL
// ============================================================
function PdfReadyModal({
  tr,
  data,
  onClose,
}: {
  tr: Translations;
  data: PdfReady;
  onClose: () => void;
}): React.JSX.Element {
  const shareAvailable = canSharePdf(data.blob, data.filename);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleShare = async (): Promise<void> => {
    const r = await sharePdfFile(data.blob, data.filename, data.text);
    if (r === 'shared') onClose();
  };

  const handleDownloadAndOpen = (): void => {
    downloadBlob(data.blob, data.filename);
    openWhatsAppChat(data.phone, data.text);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: `${THEME.charcoal}80`, backdropFilter: 'blur(4px)' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl p-5 shadow-xl"
        style={{ background: THEME.warmIvory }}
      >
        <h2 className="text-sm font-bold" style={{ color: THEME.deepForest }}>
          {tr.pdfReadyTitle}
        </h2>
        <p className="mt-0.5 font-mono text-[11px]" dir="ltr" style={{ color: THEME.mutedOlive }}>
          {data.filename}
        </p>
        <p className="mt-3 text-[12px] leading-relaxed" style={{ color: THEME.charcoal }}>
          {tr.pdfReadyHint}
        </p>

        <div className="mt-4 flex flex-col gap-2">
          {shareAvailable && (
            <button
              type="button"
              onClick={() => void handleShare()}
              className="flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full text-[12px] font-semibold text-white transition hover:brightness-95"
              style={{ background: THEME.deepForest }}
            >
              {Icons.whatsapp}
              <span>{tr.sharePdf}</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleDownloadAndOpen}
            className="flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full text-[12px] font-semibold text-white transition hover:brightness-95"
            style={{ background: THEME.warmBrass }}
          >
            {Icons.whatsapp}
            <span>{tr.downloadAndOpen}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-full cursor-pointer rounded-full text-[12px] font-bold transition"
            style={{
              background: 'transparent',
              border: `2px solid ${THEME.mutedOlive}30`,
              color: THEME.mutedOlive,
            }}
          >
            {tr.close}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CONFIRM RESET
// ============================================================
function ConfirmResetModal({
  tr,
  onConfirm,
  onCancel,
}: {
  tr: Translations;
  onConfirm: () => void;
  onCancel: () => void;
}): React.JSX.Element {
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: `${THEME.charcoal}80`, backdropFilter: 'blur(4px)' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl p-5 shadow-xl"
        style={{ background: THEME.warmIvory }}
      >
        <h2 className="text-sm font-bold" style={{ color: THEME.deepForest }}>
          {tr.resetForm}
        </h2>
        <p className="mt-2 text-[12px] leading-relaxed" style={{ color: THEME.charcoal }}>
          {tr.confirmReset}
        </p>
        <div className="mt-4 flex gap-2.5">
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            className="flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full text-[12px] font-semibold text-white transition hover:brightness-95"
            style={{ background: THEME.warmBrass }}
          >
            {Icons.reset}
            <span>{tr.resetForm}</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="h-9 flex-1 cursor-pointer rounded-full text-[12px] font-bold transition"
            style={{
              background: 'transparent',
              border: `2px solid ${THEME.mutedOlive}30`,
              color: THEME.mutedOlive,
            }}
          >
            {tr.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function InvoicePage(): React.JSX.Element {
  const [language, setLanguage] = useState<Language>(() => getStoredLanguage());
  useEffect(() => {
    const sync = () => setLanguage(getStoredLanguage());
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  const isRTL = language === 'ar' || language === 'ur';
  const tr: Translations = t[language];

  const [customers, setCustomers] = useState<Customer[]>(() => loadCustomers());
  const [documents, setDocuments] = useState<DocumentRecord[]>(() => loadDocuments());
  const [inventoryProducts] = useState<InventoryProduct[]>(() => loadInventoryProducts());

  const [customerId, setCustomerId] = useState('');
  const [customer, setCustomer] = useState({ ...EMPTY_CUSTOMER });
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const [issueDate, setIssueDate] = useState(todayISO());
  const [lines, setLines] = useState<DocumentLine[]>([newLine()]);
  const [vatNumber, setVatNumber] = useState('');
  const [vatRate, setVatRate] = useState(DEFAULT_VAT_RATE);
  const [notes, setNotes] = useState('');

  const [discMode, setDiscMode] = useState<'pct' | 'price' | 'total' | 'amount'>('pct');
  const [discPctStr, setDiscPctStr] = useState('');
  const [discPriceStr, setDiscPriceStr] = useState('');
  const [discTotalStr, setDiscTotalStr] = useState('');
  const [discLocked, setDiscLocked] = useState(0);

  const [amountReceived, setAmountReceived] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [otherPaymentNote, setOtherPaymentNote] = useState('');

  const [sending, setSending] = useState(false);
  const [pdfReady, setPdfReady] = useState<PdfReady | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [hasDraft, setHasDraft] = useState<boolean>(() => loadDraft() !== null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const customerNameRef = useRef<HTMLInputElement>(null);

  // ✅ Preview
  const [showPreview, setShowPreview] = useState(false);
  const [previewType, setPreviewType] = useState<DocumentType>('invoice');
  const [previewBusy, setPreviewBusy] = useState(false);

  const showSuccess = (msg: string, ms = 3000): void => {
    setSuccessMsg(msg);
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), ms);
  };

  const showError = (msg: string): void => {
    setErrorMsg(msg);
    setSuccessMsg('');
    setTimeout(() => setErrorMsg(''), 3500);
  };

  // ============================================================
  // DERIVED
  // ============================================================
  const draftNumber = useMemo(
    () =>
      `${generateOrderNumber('quotation', documents)} / ${generateOrderNumber('invoice', documents)}`,
    [documents]
  );

  const computedLines = useMemo(
    () =>
      lines.map((l) => ({
        ...l,
        discountValue: 0,
        lineTotal: roundMoney(l.quantity * l.unitPrice),
      })),
    [lines]
  );

  const subtotal = useMemo(
    () => roundMoney(computedLines.reduce((s, l) => s + l.lineTotal, 0)),
    [computedLines]
  );

  const discountAmount = useMemo(() => {
    if (subtotal <= 0) return 0;
    if (discMode === 'pct') {
      const p = Math.min(100, Math.max(0, Number(discPctStr) || 0));
      return roundMoney((subtotal * p) / 100);
    }
    if (discMode === 'amount') return Math.min(subtotal, discLocked);
    const raw = discMode === 'total' ? discTotalStr : discPriceStr;
    if (raw === '') return 0;
    const price = Math.min(subtotal, Math.max(0, Number(raw) || 0));
    return roundMoney(subtotal - price);
  }, [subtotal, discMode, discPctStr, discPriceStr, discTotalStr, discLocked]);

  const discountedPrice = roundMoney(subtotal - discountAmount);
  const discountPctValue =
    subtotal > 0 ? roundMoney((discountAmount / subtotal) * 100) : 0;

  const pctFieldValue =
    discMode === 'pct' ? discPctStr : discountAmount > 0 ? String(discountPctValue) : '';
  const priceFieldValue =
    discMode === 'price' ? discPriceStr : subtotal > 0 ? String(discountedPrice) : '';
  const totalFieldValue =
    discMode === 'total' ? discTotalStr : subtotal > 0 ? String(subtotal) : '';

  const discountTotal = discountAmount;
  const afterDiscount = discountedPrice;
  const taxTotal = roundMoney((afterDiscount * vatRate) / 100);
  const grandTotal = roundMoney(afterDiscount + taxTotal);

  const received = amountReceived === '' ? 0 : Number(amountReceived);
  const balanceDue = roundMoney(grandTotal - received);

  let paymentStatus: PaymentStatus = 'Unpaid';
  if (received >= grandTotal && grandTotal > 0) {
    paymentStatus = 'Paid';
  } else if (received > 0) {
    paymentStatus = 'Partially Paid';
  }

  const selectedCustomer = customers.find((c) => c.id === customerId);

  const maxLines = inventoryProducts.length;
  const canAddLine = lines.length < maxLines;

  // ============================================================
  // HANDLERS
  // ============================================================
  const applyCustomer = (c: Customer): void => {
    // Old single-phone records may hold a local number in `phone`
    const p = c.phone || '';
    const isIntl = INTL_PHONE_REGEX.test(normalizePhone(p));
    setCustomerId(c.id);
    setCustomer({
      name: c.name,
      company: c.company,
      phone: isIntl ? p : '',
      phoneAlt: c.phoneAlt || (isIntl ? '' : p),
      email: c.email || '',
      city: c.city,
      address: c.address,
    });
  };

  const handleClearCustomer = (): void => {
    setCustomerId('');
    setCustomer({ ...EMPTY_CUSTOMER });
  };

  const setCustomerField = (key: keyof typeof EMPTY_CUSTOMER, value: string): void =>
    setCustomer((c) => ({ ...c, [key]: value }));

  const updateLine = (id: string, patch: Partial<DocumentLine>): void => {
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  // ✅ UPDATED: also copy category, costPrice, description from product
  const handleSelectProduct = (lineId: string, product: InventoryProduct): void => {
    const derivedCost =
      typeof product.costPrice === 'number' && product.costPrice > 0
        ? product.costPrice
        : roundMoney(product.price * 0.6);

    setLines((ls) =>
      ls.map((l) =>
        l.id === lineId
          ? {
              ...l,
              productId: product.id,
              productImage: product.images[0] || '',
              material: product.name,
              sku: product.sku,
              unitPrice: product.price,
              quantity: l.quantity > 0 ? l.quantity : 1,
              category: product.category || '', // ✅
              costPrice: derivedCost, // ✅
              description: product.description || '', // ✅
            }
          : l
      )
    );
  };

  const addLine = (): void =>
    setLines((ls) => (ls.length < inventoryProducts.length ? [...ls, newLine()] : ls));

  const removeLine = (id: string): void =>
    setLines((ls) => (ls.length > 1 ? ls.filter((l) => l.id !== id) : ls));

  const handleDiscPct = (v: string): void => {
    setDiscMode('pct');
    setDiscPctStr(v);
  };
  const handleDiscPrice = (v: string): void => {
    setDiscMode('price');
    setDiscPriceStr(v);
  };
  const handleDiscTotal = (v: string): void => {
    setDiscMode('total');
    setDiscTotalStr(v);
  };
  const handleDiscBlur = (): void => {
    if (discMode !== 'price' && discMode !== 'total') return;
    setDiscLocked(discountAmount);
    setDiscMode('amount');
  };

  const validate = (): string | null => {
    if (!customer.name.trim()) return tr.errName;

    // ✅ At least one phone, "with country code" is validated
    const intl = normalizePhone(customer.phone);
    const alt = normalizePhone(customer.phoneAlt);
    if (!intl && !alt) return tr.errPhoneEither;
    if (intl && !INTL_PHONE_REGEX.test(intl)) return tr.errPhoneInvalid;

    if (!issueDate) return tr.errDate;
    const validLines = computedLines.filter(
      (l) => l.productId && l.quantity > 0 && l.unitPrice >= 0
    );
    if (validLines.length === 0) return tr.errLines;

    if (received > grandTotal) {
      return tr.errAmountTooHigh;
    }
    if (received > 0 && paymentMethod === 'Other' && !otherPaymentNote.trim()) {
      return tr.errOtherPay;
    }

    return null;
  };

  // ✅ UPDATED: also fill dueDate, salesChannel, tenantId, updatedAt, line category/costPrice/description
  const buildRecord = (
    type: DocumentType,
    docs: DocumentRecord[],
    resolvedCustomerId?: string
  ): DocumentRecord => {
    const user = getCurrentUser();
    const hasPayment = received > 0;
    const nowIso = new Date().toISOString();

    // Primary phone = with-code number, else the other one (keeps other
    // modules working: they always read snapshot.phone)
    const intl = normalizePhone(customer.phone);
    const alt = normalizePhone(customer.phoneAlt);

    const snapshot: CustomerSnapshot = {
      name: customer.name.trim(),
      company: customer.company.trim(),
      phone: intl || alt,
      phoneAlt: intl ? alt : '',
      email: customer.email.trim(),
      address: customer.address.trim(),
      city: customer.city.trim(),
    };

    const initialPayment: PaymentRecord | null = hasPayment
      ? {
          id: uid('pay'),
          date: todayISO(),
          amount: roundMoney(received),
          method: paymentMethod,
          note: paymentMethod === 'Other' ? otherPaymentNote.trim() || undefined : undefined,
          balanceAfter: balanceDue,
          recordedBy: user.name,
          createdAt: nowIso,
        }
      : null;

    return {
      id: uid('doc'),
      documentType: type,
      orderNumber: generateOrderNumber(type, docs),
      customerId: resolvedCustomerId ?? (customerId || 'manual'),
      customerSnapshot: snapshot,
      issueDate,
      // ✅ Section 9 auto-fills
      dueDate: issueDate,
      salesChannel: 'Offline',
      tenantId: getTenantId(),
      updatedAt: nowIso,
      status: hasPayment ? 'Approved' : 'Pending',
      currency: 'SAR',
      notes: notes.trim(),
      vatNumber: vatNumber.trim(),
      vatRate,
      lines: computedLines
        .filter((l) => l.productId && l.quantity > 0)
        .map((l) => ({
          id: l.id,
          productId: l.productId,
          productImage: l.productImage,
          material: l.material.trim(),
          sku: l.sku,
          // ✅ Section 9
          category: l.category || '',
          costPrice: typeof l.costPrice === 'number' ? l.costPrice : 0,
          description: l.description || '',
          quantity: l.quantity,
          unitPrice: roundMoney(l.unitPrice),
          discountType: 'percentage' as const,
          discountValue: 0,
          lineTotal: roundMoney(l.lineTotal),
        })),
      subtotal,
      discountTotal,
      taxTotal,
      grandTotal,
      paymentStatus,
      paymentMethod: hasPayment ? paymentMethod : '',
      paymentAmount: roundMoney(received),
      paymentDate: todayISO(),
      paymentReference:
        hasPayment && paymentMethod === 'Other' ? otherPaymentNote.trim() : '',
      balanceDue,
      createdBy: user.name,
      createdAt: nowIso,
      payments: initialPayment ? [initialPayment] : [],
    };
  };

  /**
   * Links the typed customer to an existing one (same phone, any format)
   * or creates a new customer whose id = phone (primary key).
   * Returns the customerId to store on the document.
   */
  const saveCustomerIfNew = (): string => {
    if (customerId) return customerId;
    if (!customer.name.trim()) return 'manual';

    const intl = normalizePhone(customer.phone);
    const alt = normalizePhone(customer.phoneAlt);
    const mine = [intl, alt].filter(Boolean);
    const key = intl || alt;
    if (!key) return 'manual';

    const list = loadCustomers();
    const existing = list.find((c) =>
      phoneKeysOf(c).some((k) => mine.some((m) => samePhone(k, m)))
    );
    if (existing) return existing.id; // 🔒 never create a duplicate phone

    const now = new Date().toISOString();
    const created: Customer = {
      id: key,
      name: customer.name.trim(),
      company: customer.company.trim(),
      phone: intl,
      phoneAlt: alt,
      email: customer.email.trim(),
      address: customer.address.trim(),
      city: customer.city.trim(),
      createdAt: now,
      updatedAt: now,
    };
    if (saveCustomers([created, ...list])) {
      setCustomers([created, ...list]);
      return key;
    }
    return 'manual';
  };

  const resetForm = (): void => {
    setCustomerId('');
    setCustomer({ ...EMPTY_CUSTOMER });
    setIssueDate(todayISO());
    setLines([newLine()]);
    setVatNumber('');
    setNotes('');
    setDiscMode('pct');
    setDiscPctStr('');
    setDiscPriceStr('');
    setDiscTotalStr('');
    setDiscLocked(0);
    setAmountReceived('');
    setPaymentMethod('Cash');
    setOtherPaymentNote('');
  };

  // ============================================================
  // DRAFT
  // ============================================================
  const formHasData =
    Object.values(customer).some((v) => v.trim() !== '') ||
    lines.some((l) => l.productId) ||
    vatNumber.trim() !== '' ||
    notes.trim() !== '' ||
    discPctStr !== '' ||
    discountAmount > 0 ||
    received > 0;

  const handleSaveDraft = (): void => {
    if (!formHasData) {
      showError(tr.draftEmpty);
      return;
    }

    const typingFinalAmount = discMode === 'price' || discMode === 'total';

    const draft: InvoiceDraft = {
      customerId,
      customer,
      issueDate,
      lines,
      vatNumber,
      vatRate,
      notes,
      discMode: typingFinalAmount ? 'amount' : discMode === 'amount' ? 'amount' : 'pct',
      discPctStr,
      discPriceStr: '',
      discTotalStr: '',
      discLocked: typingFinalAmount ? discountAmount : discLocked,
      amountReceived,
      paymentMethod,
      otherPaymentNote,
      savedAt: new Date().toISOString(),
    };

    if (!saveDraftToStorage(draft)) {
      showError(tr.errStorage);
      return;
    }
    setHasDraft(true);
    showSuccess(tr.draftSaved);
  };

  const handleRestoreDraft = (): void => {
    const d = loadDraft();
    if (!d) {
      setHasDraft(false);
      showError(tr.noDraft);
      return;
    }

    setCustomerId(d.customerId || '');
    setCustomer({ ...EMPTY_CUSTOMER, ...(d.customer || {}) });
    setIssueDate(d.issueDate || todayISO());
    setLines(d.lines.length > 0 ? d.lines : [newLine()]);
    setVatNumber(d.vatNumber || '');
    setVatRate(typeof d.vatRate === 'number' ? d.vatRate : DEFAULT_VAT_RATE);
    setNotes(d.notes || '');
    setDiscMode(d.discMode === 'amount' ? 'amount' : 'pct');
    setDiscPctStr(d.discPctStr || '');
    setDiscPriceStr('');
    setDiscTotalStr('');
    setDiscLocked(Number(d.discLocked) || 0);
    setAmountReceived(d.amountReceived === '' || d.amountReceived == null ? '' : Number(d.amountReceived));
    setPaymentMethod(d.paymentMethod || 'Cash');
    setOtherPaymentNote(d.otherPaymentNote || '');

    showSuccess(tr.draftRestored);
    setTimeout(() => customerNameRef.current?.focus(), 50);
  };

  const doReset = (): void => {
    resetForm();
    setShowResetConfirm(false);
    showSuccess(tr.resetDone);
    setTimeout(() => customerNameRef.current?.focus(), 50);
  };

  const handleResetClick = (): void => {
    if (formHasData) setShowResetConfirm(true);
    else doReset();
  };

  const discardDraft = (): void => {
    clearDraftStorage();
    setHasDraft(false);
  };

  const notifyRecordsSection = (): void => {
    window.dispatchEvent(new Event('zakhira:sales-updated'));
  };

  const finalizeRecord = (record: DocumentRecord): void => {
    if (record.paymentAmount > 0) {
      syncAccountingEntry({
        type: 'In',
        amount: record.paymentAmount,
        date: record.issueDate,
        customerName: record.customerSnapshot.name,
        companyName: record.customerSnapshot.company,
        invoiceRef: record.orderNumber,
        // ✅ FIX: pass 'Partially Paid' when only partial
        status:
          record.paymentStatus === 'Paid'
            ? 'Paid'
            : record.paymentStatus === 'Partially Paid'
              ? 'Partially Paid'
              : 'Pending',
        mode: mapPaymentMode(record.paymentMethod),
        sourceDocumentId: record.id,
        sourceModule: 'sales',
        notes: `Auto entry from Sales ${
          record.documentType === 'invoice' ? 'Invoice' : 'Quotation'
        } ${record.orderNumber} (Received: ${formatMoney(record.paymentAmount)})`,
      });

      saveHistory([
        ...loadHistory(),
        {
          id: uid('sh'),
          documentId: record.id,
          oldStatus: null,
          newStatus: 'Approved',
          reason: tr.statusAutoApproved,
          changedBy: getCurrentUser().name,
          changedAt: new Date().toISOString(),
        },
      ]);
    }
    notifyRecordsSection();
  };

  const handleCreateInvoice = (): void => {
    const err = validate();
    if (err) {
      showError(err);
      return;
    }

    const resolvedId = saveCustomerIfNew();

    const docs = loadDocuments();
    const record = buildRecord('invoice', docs, resolvedId);
    if (!saveDocuments([record, ...docs])) {
      showError(tr.errStorage);
      return;
    }
    setDocuments([record, ...docs]);

    finalizeRecord(record);
    discardDraft();

    showSuccess(tr.toastInvoice(record.orderNumber));
    setTimeout(resetForm, 1500);
  };

  const buildWhatsAppText = (record: DocumentRecord): string => {
    const linesText = record.lines.map(
      (l, i) =>
        `${i + 1}. ${l.material} (${l.sku}) — ${tr.quantity}: ${l.quantity} × ${formatMoney(l.unitPrice)} = ${formatMoney(l.lineTotal)}`
    );
    return [
      tr.waHello(record.customerSnapshot.name),
      '',
      `${tr.waQuotation}: ${record.orderNumber}`,
      `${tr.waDate}: ${formatDate(record.issueDate)}`,
      '',
      `${tr.waItems}:`,
      ...linesText,
      '',
      `${tr.subtotal}: ${formatMoney(record.subtotal)}`,
      record.discountTotal > 0 ? `${tr.discountShort}: -${formatMoney(record.discountTotal)}` : '',
      record.taxTotal > 0 ? `${tr.vat} (${record.vatRate}%): ${formatMoney(record.taxTotal)}` : '',
      `${tr.grandTotal}: ${formatMoney(record.grandTotal)}`,
      '',
      tr.waReview,
    ]
      .filter(Boolean)
      .join('\n');
  };

  const handleSendWhatsApp = async (): Promise<void> => {
    if (sending) return;
    const err = validate();
    if (err) {
      showError(err);
      return;
    }

    setSending(true);
    try {
      const resolvedId = saveCustomerIfNew();

      const docs = loadDocuments();
      const record = buildRecord('quotation', docs, resolvedId);
      if (!saveDocuments([record, ...docs])) {
        showError(tr.errStorage);
        return;
      }
      setDocuments([record, ...docs]);
      finalizeRecord(record);
      discardDraft();

      const text = [
        tr.waHello(record.customerSnapshot.name),
        `${tr.waQuotation}: ${record.orderNumber} — ${tr.grandTotal}: ${formatMoney(record.grandTotal)}`,
        tr.waPdfNote,
      ].join('\n');

      const filename = `${record.orderNumber}.pdf`;

      try {
        const blob = await htmlToPdfBlob(
          buildQuotationHtml(record, tr, getCompanyInfo(), isRTL, language),
          filename
        );
        showSuccess(tr.toastQuotation(record.orderNumber));

        const stillActive = (
          navigator as Navigator & { userActivation?: { isActive: boolean } }
        ).userActivation?.isActive;
        let delivered = false;
        if (stillActive) {
          const r = await sharePdfFile(blob, filename, text);
          delivered = r === 'shared' || r === 'cancelled';
        }
        if (!delivered) {
          setPdfReady({ blob, filename, phone: record.customerSnapshot.phone, text });
        }
      } catch {
        showError(tr.errPdf);
        window.open(
          `https://wa.me/${phoneDigits(record.customerSnapshot.phone)}?text=${encodeURIComponent(buildWhatsAppText(record))}`,
          '_blank'
        );
      }

      setTimeout(resetForm, 1500);
    } finally {
      setSending(false);
    }
  };

  const company = getCompanyInfo();
  const hasCustomer = customer.name.trim() !== '';

  // ============================================================
  // PREVIEW (nothing is saved — it only renders the current form)
  // ============================================================
  const previewHtml = showPreview
    ? buildQuotationHtml(
        buildRecord(previewType, documents),
        tr,
        company,
        isRTL,
        language
      )
    : '';

  const handleDownloadPreview = async (): Promise<void> => {
    if (previewBusy) return;
    setPreviewBusy(true);
    try {
      const filename = `${generateOrderNumber(previewType, documents)}.pdf`;
      const blob = await htmlToPdfBlob(previewHtml, filename);
      downloadBlob(blob, filename);
    } catch {
      showError(tr.errPdf);
    } finally {
      setPreviewBusy(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={language}
      className="min-h-screen"
      style={{ background: THEME.warmIvory, fontFamily: "'Poppins', system-ui, sans-serif" }}
    >
      <div className="px-4 pt-4 pb-1 lg:px-5">
        <div className="min-w-0">
          <h1 className="text-xl font-bold" style={{ color: THEME.charcoal }}>
            {tr.pageTitle}
          </h1>
          <p className="text-[12px]" style={{ color: THEME.mutedOlive }}>
            {tr.pageSubtitle}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSaveDraft}
            title={tr.saveHint}
            className="flex h-8 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[12px] font-semibold transition-colors hover:bg-white"
            style={{
              border: `1.5px solid ${THEME.deepForest}`,
              background: THEME.warmIvory,
              color: THEME.deepForest,
            }}
          >
            {Icons.save}
            <span>{tr.saveDraft}</span>
          </button>
          <button
            type="button"
            onClick={handleRestoreDraft}
            disabled={!hasDraft}
            title={tr.restoreHint}
            className="flex h-8 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[12px] font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: THEME.warmBrass }}
          >
            {Icons.restore}
            <span>{tr.restoreDraft}</span>
          </button>
          <button
            type="button"
            onClick={handleResetClick}
            title={tr.resetHint}
            className="flex h-8 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[12px] font-semibold transition-colors hover:bg-[#66745A]/10"
            style={{
              border: `1.5px solid ${THEME.mutedOlive}60`,
              background: 'transparent',
              color: THEME.mutedOlive,
            }}
          >
            {Icons.reset}
            <span>{tr.resetForm}</span>
          </button>
        </div>
      </div>

      <div className="p-4 lg:p-5">
        {successMsg && (
          <div
            className="mb-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px] font-bold"
            style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#047857' }}
          >
            {Icons.check}
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div
            className="mb-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px] font-bold"
            style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}
          >
            {Icons.alert}
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* ============ LEFT ============ */}
          <div className="space-y-4 lg:col-span-2">
            {/* CUSTOMER */}
            <div className={cardCls}>
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span style={{ color: THEME.warmBrass }}>{Icons.user}</span>
                    <h3 className="text-[13px] font-bold uppercase" style={{ color: THEME.deepForest }}>
                      {tr.customerInfo}
                    </h3>
                  </div>
                  <p className="mt-0.5 text-[10px]" style={{ color: THEME.mutedOlive }}>
                    {tr.customerInfoHint}
                  </p>
                </div>
                <CustomerPicker
                  customers={customers}
                  selected={selectedCustomer}
                  tr={tr}
                  onSelect={applyCustomer}
                  onAddNew={() => setShowCustomerModal(true)}
                  onClear={handleClearCustomer}
                  onTypeName={(name) => {
                    setCustomerId('');
                    setCustomerField('name', name);
                  }}
                />
              </div>

              <div className="grid grid-cols-1 gap-x-3 gap-y-2.5 md:grid-cols-3">
                <div>
                  <label className={labelCls}>{tr.customerName}</label>
                  <input
                    type="text"
                    ref={customerNameRef}
                    value={customer.name}
                    onChange={(e) => setCustomerField('name', e.target.value)}
                    placeholder={tr.enterCustomerName}
                    className={fieldCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>{tr.company}</label>
                  <input
                    type="text"
                    value={customer.company}
                    onChange={(e) => setCustomerField('company', e.target.value)}
                    placeholder={tr.enterCompany}
                    className={fieldCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>{tr.email}</label>
                  <input
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomerField('email', e.target.value)}
                    placeholder={tr.enterEmail}
                    className={fieldCls}
                  />
                </div>

                {/* ✅ TWO PHONE INPUTS — at least one required */}
                <div>
                  <label className={labelCls}>{tr.phoneIntlLabel}</label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={customer.phone}
                    onChange={(e) => setCustomerField('phone', e.target.value)}
                    placeholder="+966 50 123 4567"
                    className={`${fieldCls} text-start`}
                  />
                </div>
                <div>
                  <label className={labelCls}>{tr.phoneLocalLabel}</label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={customer.phoneAlt}
                    onChange={(e) => setCustomerField('phoneAlt', e.target.value)}
                    placeholder="0501234567"
                    className={`${fieldCls} text-start`}
                  />
                </div>
                <div>
                  <label className={labelCls}>{tr.city}</label>
                  <input
                    type="text"
                    value={customer.city}
                    onChange={(e) => setCustomerField('city', e.target.value)}
                    placeholder={tr.enterCity}
                    className={fieldCls}
                  />
                </div>

                <div className="md:col-span-3">
                  <label className={labelCls}>{tr.address}</label>
                  <input
                    type="text"
                    value={customer.address}
                    onChange={(e) => setCustomerField('address', e.target.value)}
                    placeholder={tr.enterAddress}
                    className={fieldCls}
                  />
                </div>
              </div>
              <p className="mt-2 px-1 text-[10px]" style={{ color: THEME.mutedOlive }}>
                {tr.phoneEitherHint}
              </p>
            </div>

            {/* ORDER DETAILS */}
            <div className={cardCls}>
              <div className="mb-3 flex items-center gap-2">
                <span style={{ color: THEME.warmBrass }}>{Icons.note}</span>
                <h3 className="text-[13px] font-bold" style={{ color: THEME.deepForest }}>
                  {tr.orderDetails}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <label className={labelCls}>{tr.vatNumber}</label>
                  <input
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                    placeholder={tr.enterVat}
                    className={fieldCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>{tr.vatRate}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={vatRate}
                    onChange={(e) => setVatRate(Math.max(0, Number(e.target.value) || 0))}
                    className={fieldCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>{tr.invoiceDate}</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className={fieldCls}
                  />
                </div>
              </div>
            </div>

            {/* PRODUCTS */}
            <div className={cardCls}>
              <div className="mb-3 flex items-center gap-2">
                <span style={{ color: THEME.warmBrass }}>{Icons.box}</span>
                <h3 className="text-[13px] font-bold" style={{ color: THEME.deepForest }}>
                  {tr.products}
                </h3>
              </div>

              {inventoryProducts.length === 0 && (
                <div
                  className="mb-2.5 flex items-center gap-2 rounded-lg px-3 py-2 text-[12px]"
                  style={{
                    background: '#F8EBD3',
                    border: `1px solid ${THEME.warmBrass}60`,
                    color: '#9A6B25',
                  }}
                >
                  {Icons.alert}
                  <span>{tr.noProducts}</span>
                </div>
              )}

              <div className="space-y-2.5">
                {computedLines.map((l, idx) => (
                  <div
                    key={l.id}
                    className="rounded-xl border p-3"
                    style={{ borderColor: `${THEME.mutedOlive}30` }}
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase" style={{ color: THEME.charcoal }}>
                        {tr.item} {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeLine(l.id)}
                        disabled={lines.length === 1}
                        title={tr.removeItem}
                        className="cursor-pointer transition disabled:cursor-not-allowed disabled:opacity-40"
                        style={{ color: '#dc2626' }}
                      >
                        {Icons.trash}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-x-3 gap-y-2.5 md:grid-cols-6">
                      <div className="md:col-span-4">
                        <label className={labelCls}>
                          {tr.product} <span style={{ color: THEME.warmBrass }}>*</span>
                        </label>
                        <ProductSelect
                          value={l.productId}
                          products={inventoryProducts}
                          excludeIds={computedLines
                            .filter((x) => x.id !== l.id && x.productId)
                            .map((x) => x.productId)}
                          tr={tr}
                          onSelect={(p) => handleSelectProduct(l.id, p)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelCls}>{tr.quantity}</label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={l.quantity || ''}
                          onChange={(e) =>
                            updateLine(l.id, { quantity: Math.max(0, Math.floor(Number(e.target.value)) || 0) })
                          }
                          placeholder={tr.enterQuantity}
                          className={fieldCls}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className={labelCls}>{tr.productImage}</label>
                        <div className="flex h-9 items-center gap-2">
                          {l.productImage ? (
                            <img
                              src={l.productImage}
                              alt={l.material}
                              className="h-9 w-9 flex-shrink-0 rounded-lg object-cover"
                              style={{ border: `1px solid ${THEME.mutedOlive}30` }}
                            />
                          ) : (
                            <div
                              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                              style={{
                                background: THEME.warmIvory,
                                border: `1px solid ${THEME.mutedOlive}30`,
                                color: THEME.mutedOlive,
                              }}
                            >
                              {Icons.image}
                            </div>
                          )}
                          {l.productId && (
                            <div className="min-w-0">
                              <p className="truncate text-[11px] font-semibold leading-tight" style={{ color: THEME.charcoal }}>
                                {l.material}
                              </p>
                              <p className="truncate font-mono text-[9px] leading-tight" style={{ color: THEME.mutedOlive }}>
                                {l.sku}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelCls}>{tr.unitPrice}</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={l.unitPrice}
                          onChange={(e) =>
                            updateLine(l.id, { unitPrice: Math.max(0, Number(e.target.value) || 0) })
                          }
                          className={fieldCls}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelCls}>{tr.lineTotal}</label>
                        <input
                          type="text"
                          readOnly
                          tabIndex={-1}
                          value={formatMoney(l.lineTotal)}
                          className={`${fieldCls} font-bold`}
                          style={{ background: '#f8f8f8', borderColor: '#e5e7eb' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addLine}
                disabled={!canAddLine}
                title={!canAddLine ? tr.maxProductsReached : undefined}
                className="mt-2.5 flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-full text-[13px] font-semibold transition-colors hover:bg-[#C49A5A]/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                style={{
                  border: `1.5px dashed ${THEME.warmBrass}`,
                  color: THEME.deepForest,
                  background: 'transparent',
                }}
              >
                {Icons.plus}
                <span>{tr.addProduct}</span>
                {maxLines > 0 && (
                  <span className="text-[11px] font-normal" style={{ color: THEME.mutedOlive }}>
                    {lines.length}/{maxLines}
                  </span>
                )}
              </button>
            </div>

            {/* GRAND TOTAL */}
            <div className={cardCls}>
              <div className="mb-2.5 flex items-center gap-2">
                <span style={{ color: THEME.warmBrass }}>{Icons.money}</span>
                <h3 className="text-[13px] font-bold" style={{ color: THEME.deepForest }}>
                  {tr.grandTotal}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <label className={labelCls}>{tr.totalAmount}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={totalFieldValue}
                    onChange={(e) => handleDiscTotal(e.target.value)}
                    onBlur={handleDiscBlur}
                    disabled={subtotal <= 0}
                    className={`${fieldCls} font-bold disabled:opacity-60`}
                  />
                </div>
                <div>
                  <label className={labelCls}>{tr.discount}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={pctFieldValue}
                    onChange={(e) => handleDiscPct(e.target.value)}
                    placeholder={tr.enterDiscount}
                    disabled={subtotal <= 0}
                    className={`${fieldCls} disabled:opacity-60`}
                  />
                </div>
                <div>
                  <label className={labelCls}>{tr.discountedPrice}</label>
                  <input
                    type="number"
                    min="0"
                    max={subtotal}
                    step="0.01"
                    value={priceFieldValue}
                    onChange={(e) => handleDiscPrice(e.target.value)}
                    onBlur={handleDiscBlur}
                    disabled={subtotal <= 0}
                    className={`${fieldCls} font-bold disabled:opacity-60`}
                  />
                </div>
              </div>
            </div>

            {/* PAYMENT DETAILS */}
            <div className={cardCls}>
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span style={{ color: THEME.warmBrass }}>{Icons.money}</span>
                  <h3 className="text-[13px] font-bold" style={{ color: THEME.deepForest }}>
                    {tr.paymentDetails}
                  </h3>
                </div>
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    background:
                      paymentStatus === 'Paid' ? '#dcfce7' :
                      paymentStatus === 'Partially Paid' ? '#fef3c7' : '#fee2e2',
                    color:
                      paymentStatus === 'Paid' ? '#15803d' :
                      paymentStatus === 'Partially Paid' ? '#b45309' : '#b91c1c',
                  }}
                >
                  {paymentStatus === 'Paid' ? tr.paid :
                   paymentStatus === 'Partially Paid' ? tr.partiallyPaid : tr.unpaid}
                </span>
              </div>

              <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className={labelCls}>{tr.amountReceived}</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max={grandTotal}
                      step="0.01"
                      value={amountReceived}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Number(e.target.value);
                        setAmountReceived(val);
                      }}
                      placeholder="0.00"
                      className={`${fieldCls} pe-16 font-bold`}
                    />
                    <button
                      type="button"
                      onClick={() => setAmountReceived(grandTotal)}
                      disabled={grandTotal <= 0}
                      title={tr.fullHint}
                      className="absolute end-1.5 top-1/2 h-6 -translate-y-1/2 cursor-pointer rounded-full px-3 text-[10px] font-bold transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
                      style={{ background: THEME.warmBrass, color: '#FFFFFF' }}
                    >
                      {tr.full}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>{tr.balanceDue}</label>
                  <div
                    className={`${fieldCls} flex items-center font-bold`}
                    style={{
                      color: balanceDue > 0 ? '#dc2626' : '#15803d',
                      background: '#f8f8f8',
                      borderColor: '#e5e7eb',
                    }}
                  >
                    {formatMoney(balanceDue)}
                  </div>
                </div>
              </div>

              {received > 0 && (
                <>
                  <p className="mb-1.5 text-[11px] font-medium" style={{ color: THEME.charcoal }}>
                    {tr.paymentMethod}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {PAYMENT_METHODS.map((m) => {
                      const active = paymentMethod === m;
                      const label =
                        m === 'Cash' ? tr.cash :
                        m === 'Bank Transfer' ? tr.bankTransfer :
                        m === 'Card' ? tr.card : tr.other;
                      return (
                        <label
                          key={m}
                          className="flex cursor-pointer items-center gap-1.5 text-[11px]"
                          style={{ color: THEME.charcoal }}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={active}
                            onChange={() => setPaymentMethod(m)}
                            className="sr-only"
                          />
                          <span
                            className="flex h-3.5 w-3.5 items-center justify-center rounded-full border"
                            style={{ borderColor: active ? THEME.deepForest : `${THEME.mutedOlive}60` }}
                          >
                            {active && (
                              <span className="h-1.5 w-1.5 rounded-full" style={{ background: THEME.deepForest }} />
                            )}
                          </span>
                          {label}
                        </label>
                      );
                    })}
                  </div>

                  {paymentMethod === 'Other' && (
                    <div className="mt-2.5">
                      <label className={labelCls}>{tr.howPaid}</label>
                      <input
                        type="text"
                        value={otherPaymentNote}
                        onChange={(e) => setOtherPaymentNote(e.target.value)}
                        placeholder={tr.howPaidPlaceholder}
                        className={fieldCls}
                        autoFocus
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ACTIONS */}
            <div className={cardCls}>
              <div className="mb-3 flex items-center gap-2">
                <span style={{ color: THEME.warmBrass }}>{Icons.invoice}</span>
                <h3 className="text-[13px] font-bold" style={{ color: THEME.deepForest }}>
                  {tr.actions}
                </h3>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => void handleSendWhatsApp()}
                  disabled={sending}
                  className="flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[12px] font-semibold transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    border: `1.5px solid ${THEME.deepForest}`,
                    background: THEME.warmIvory,
                    color: THEME.deepForest,
                  }}
                >
                  <span
                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ background: THEME.deepForest, color: '#fff' }}
                  >
                    {Icons.whatsapp}
                  </span>
                  <span>{sending ? tr.sendingPdf : tr.sendWhatsApp}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCreateInvoice}
                  disabled={sending}
                  className="flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[12px] font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ background: THEME.warmBrass }}
                >
                  {Icons.invoice}
                  <span>{tr.createInvoice}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ============ RIGHT ============ */}
          <div className="lg:col-span-1">
            <div className="space-y-4 lg:sticky lg:top-4">
              <div className={cardCls}>
                <div
                  className="flex items-start justify-between gap-2 pb-2.5"
                  style={{ borderBottom: `1px solid ${THEME.mutedOlive}60` }}
                >
                  <div className="min-w-0">
                    <p className="text-base font-bold uppercase" style={{ color: THEME.deepForest }}>
                      {company.name}
                    </p>
                    {company.address && (
                      <p className="text-[10px]" style={{ color: THEME.mutedOlive }}>
                        {company.address}
                      </p>
                    )}
                    {company.phone && (
                      <p className="font-mono text-[10px]" dir="ltr" style={{ color: THEME.mutedOlive }}>
                        {company.phone}
                      </p>
                    )}
                  </div>

                  {/* ✅ PREVIEW BUTTON */}
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    title={tr.previewHint}
                    className="flex h-8 flex-shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[12px] font-semibold transition-colors hover:bg-[#F7F3EA]"
                    style={{
                      border: `1.5px solid ${THEME.deepForest}`,
                      background: 'transparent',
                      color: THEME.deepForest,
                    }}
                  >
                    {Icons.eye}
                    <span>{tr.preview}</span>
                  </button>
                </div>

                <div className="my-2.5">
                  <p className="text-[10px] font-semibold uppercase" style={{ color: THEME.mutedOlive }}>
                    {tr.draftNotSaved}
                  </p>
                  <p className="text-[12px] font-semibold" dir="ltr" style={{ color: THEME.charcoal }}>
                    {draftNumber}
                  </p>
                  <p className="text-[11px]" style={{ color: THEME.mutedOlive }}>
                    {formatDate(issueDate)}
                  </p>
                </div>

                {hasCustomer ? (
                  <div
                    className="mb-2.5 rounded-lg border px-2.5 py-1.5"
                    style={{ borderColor: `${THEME.mutedOlive}30`, background: `${THEME.warmIvory}80` }}
                  >
                    <p className="text-[13px] font-bold" style={{ color: THEME.charcoal }}>
                      {customer.name}
                    </p>
                    {customer.company && (
                      <p className="text-[10px]" style={{ color: THEME.mutedOlive }}>
                        {customer.company}
                      </p>
                    )}
                    {customer.phone && (
                      <p className="font-mono text-[10px]" dir="ltr" style={{ color: THEME.mutedOlive }}>
                        {customer.phone}
                      </p>
                    )}
                    {customer.phoneAlt && (
                      <p className="font-mono text-[10px]" dir="ltr" style={{ color: THEME.mutedOlive }}>
                        {customer.phoneAlt}
                      </p>
                    )}
                  </div>
                ) : (
                  <div
                    className="mb-2.5 rounded-lg border px-2.5 py-2 text-center"
                    style={{ borderColor: `${THEME.mutedOlive}30`, background: `${THEME.warmIvory}80` }}
                  >
                    <p className="text-[11px]" style={{ color: THEME.mutedOlive }}>
                      {tr.noCustomer}
                    </p>
                  </div>
                )}

                {computedLines.some((l) => l.productId) && (
                  <div className="mb-2.5 space-y-1">
                    {computedLines
                      .filter((l) => l.productId)
                      .map((l) => (
                        <div
                          key={l.id}
                          className="flex justify-between py-1 text-[11px]"
                          style={{ borderBottom: `1px solid ${THEME.mutedOlive}15` }}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold" style={{ color: THEME.charcoal }}>
                              {l.material}
                            </p>
                            <p className="text-[10px]" style={{ color: THEME.mutedOlive }}>
                              {l.quantity} × {formatMoney(l.unitPrice)}
                            </p>
                          </div>
                          <p className="ms-2 font-bold" style={{ color: THEME.charcoal }}>
                            {formatMoney(l.lineTotal)}
                          </p>
                        </div>
                      ))}
                  </div>
                )}

                <div className="space-y-1 text-[12px]" style={{ borderTop: `1px solid ${THEME.mutedOlive}60` }}>
                  <div className="flex justify-between pt-2" style={{ color: THEME.mutedOlive }}>
                    <span>{tr.subtotal}</span>
                    <span className="font-semibold" style={{ color: THEME.charcoal }}>
                      {formatMoney(subtotal)}
                    </span>
                  </div>
                  {discountTotal > 0 && (
                    <div className="flex justify-between" style={{ color: THEME.mutedOlive }}>
                      <span>
                        {tr.discountShort} ({discountPctValue}%)
                      </span>
                      <span style={{ color: '#dc2626' }}>-{formatMoney(discountTotal)}</span>
                    </div>
                  )}
                  {taxTotal > 0 && (
                    <div className="flex justify-between" style={{ color: THEME.mutedOlive }}>
                      <span>{tr.vat} ({vatRate}%)</span>
                      <span style={{ color: THEME.charcoal }}>{formatMoney(taxTotal)}</span>
                    </div>
                  )}
                  <div
                    className="flex items-center justify-between pt-2"
                    style={{ borderTop: `1px solid ${THEME.mutedOlive}60` }}
                  >
                    <span className="text-[13px] font-bold" style={{ color: THEME.deepForest }}>
                      {tr.grandTotal}
                    </span>
                    <span className="text-[13px] font-bold" style={{ color: THEME.warmBrass }}>
                      {formatMoney(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              <div className={cardCls}>
                <div className="mb-2.5 flex items-center gap-2">
                  <span style={{ color: THEME.warmBrass }}>{Icons.note}</span>
                  <h3 className="text-[13px] font-bold" style={{ color: THEME.deepForest }}>
                    {tr.notes}
                  </h3>
                </div>
                <label className={labelCls}>{tr.notes}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder={tr.notesPlaceholder}
                  className={`${fieldCls} h-auto resize-none !rounded-2xl py-2`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ✅ SIBLING — NO PROPS */}
        <div className="mt-5">
          <RecordsSection />
        </div>
      </div>

      {showPreview && (
        <PreviewModal
          tr={tr}
          html={previewHtml}
          docType={previewType}
          downloading={previewBusy}
          onTypeChange={setPreviewType}
          onDownload={() => void handleDownloadPreview()}
          onClose={() => setShowPreview(false)}
        />
      )}

      {pdfReady && <PdfReadyModal tr={tr} data={pdfReady} onClose={() => setPdfReady(null)} />}

      {showResetConfirm && (
        <ConfirmResetModal
          tr={tr}
          onConfirm={doReset}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}

      {showCustomerModal && (
        <QuickCustomerModal
          tr={tr}
          onClose={() => setShowCustomerModal(false)}
          onSaved={(c, list) => {
            setCustomers(list);
            applyCustomer(c);
            setShowCustomerModal(false);
            showSuccess(tr.toastCustomerAdded(c.name));
          }}
        />
      )}
    </div>
  );
}