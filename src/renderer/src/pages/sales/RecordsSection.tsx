/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable prettier/prettier */
/* eslint-disable react-refresh/only-export-components */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { THEME } from '@renderer/theme/theme';
import { recordsService, type RecordsDocument } from '@renderer/services/recordsService';
import {
  PrintFormat,
  PRINT_FORMATS,
  PRINT_FORMAT_LIST,
  resolveInitialPrintFormat,
  saveLastPrintFormat,
  loadDefaultPrintFormat,
} from '../settings/SettingsPage';

type Language = 'en' | 'ar' | 'ur' | 'hi';

// ============================================================
// 🌍 TRANSLATIONS — Record Book only (en, ar, ur, hi)
// ============================================================
const rbT = {
  en: {
    filters: 'Filters',
    search: 'Search',
    searchPh: 'Order no, customer, phone...',
    dateFrom: 'Date From',
    dateTo: 'Date To',
    clearFilters: 'Clear all filters',
    sortBy: 'Sort By',
    sortNewest: 'Newest first',
    sortOldest: 'Oldest first',
    sortNameAsc: 'Customer A → Z',
    sortNameDesc: 'Customer Z → A',
    sortAmountDesc: 'Amount: High → Low',
    sortAmountAsc: 'Amount: Low → High',
    tabQuotations: 'Quotations',
    tabInvoices: 'Invoices',
    tabApproved: 'Approved',
    tabRejected: 'Rejected',
    colOrderNo: 'Order No.',
    colCustomer: 'Customer',
    colDate: 'Date',
    colAmount: 'Amount',
    colPayment: 'Payment',
    colStatus: 'Status',
    colActions: 'Actions',
    noRecords: 'No records found',
    loading: 'Loading...',
    actPreview: 'Preview',
    actWhatsApp: 'WhatsApp',
    actApprove: 'Approve',
    actReject: 'Reject',
    actPrint: 'Print',
    actReturn: 'Return',
    actPending: 'Pending',
    returnedBadge: 'RETURNED',
    statusPending: 'Pending',
    statusApproved: 'Approved',
    statusRejected: 'Rejected',
    docQuotation: 'Quotation',
    docInvoice: 'Invoice',
    cancel: 'Cancel',
    close: 'Close',
    approveTitle: 'Approve Record',
    approveMsg: (num: string) => `Approve ${num}? Status will change to Approved.`,
    approveLabel: 'Approve',
    approvePaymentTitle: (num: string) => `Approve ${num} — Payment`,
    approvePaymentSubtitle: 'Enter the amount received. Balance will auto-calculate.',
    approveGrandTotal: 'Grand Total',
    approveAndSave: 'Approve & Save',
    errAmountInvalid: 'Amount must be between 0 and the remaining balance',
    errMinPayment: 'Payment required: enter at least 1 to approve',
    fullBtn: 'Full',
    rejectTitle: 'Reject Record',
    rejectMsg: (num: string) => `Reject ${num}? Status will change to Rejected.`,
    rejectLabel: 'Reject',
    rejectReasonLabel: 'Reason (optional)',
    pendingTitle: 'Move to Pending',
    pendingMsg: (num: string, docLabel: string) =>
      `Move ${num} back to Pending? It will return to the ${docLabel} list.`,
    pendingLabel: 'Move to Pending',
    returnTitle: 'Return Invoice',
    returnSubtitle: (num: string) => `${num} — select items to return`,
    previewBtn: 'Preview',
    productsFromInvoice: 'Products from Original Invoice',
    colProduct: 'Product',
    colPrice: 'Price',
    colOrigQty: 'Orig Qty',
    colReturned: 'Returned',
    colAvailable: 'Available',
    colReturnQty: 'Return Qty',
    colSubtotal: 'Subtotal',
    totalReturnAmount: 'Total Return Amount',
    returnReason: 'Return Reason',
    returnReasonPh: 'e.g. Customer returned 3 bags — damaged',
    returnDate: 'Return Date',
    returnNotes: 'Notes (optional)',
    returnNotesPh: 'Additional details...',
    confirmReturn: 'Confirm Return',
    errReasonRequired: 'Return reason is required',
    errNoItems: 'At least one item must have a return quantity greater than 0',
    errQtyTooHigh: 'Return quantity cannot exceed the available quantity',
    originalInvoice: 'Original Invoice',
    issuedOn: 'Issued',
    billTo: 'Bill To',
    products: 'Products',
    colQty: 'Qty',
    colTotal: 'Total',
    colUnit: 'Unit',
    colDiscount: 'Discount',
    subtotal: 'Subtotal',
    discount: 'Discount',
    vat: 'VAT',
    grandTotal: 'Grand Total',
    notes: 'Notes',
    returnDetailsTitle: (num: string) => `Return — ${num}`,
    returnFor: 'For',
    returned: 'Returned',
    itemsCount: (n: number) => `${n} item${n === 1 ? '' : 's'}`,
    reason: 'Reason',
    returnedItems: 'Returned Items',
    totalReturn: 'Total Return',
    linkedTransaction: 'Linked Transaction:',
    createdBy: 'Created by',
    document: 'Document',
    type: 'Type',
    issue: 'Issue',
    createdByLabel: 'Created by:',
    items: 'Items',
    material: 'Material',
    payment: 'Payment',
    balanceDue: 'Balance Due',
    returnsSection: 'Returns',
    statusHistory: 'Status History',
    noStatusChanges: 'No status changes yet',
    toastApproved: (num: string) => `${num} → Approved`,
    toastRejected: (num: string) => `${num} → Rejected`,
    toastPending: (num: string) => `${num} → Pending`,
    toastReturnCreated: (num: string) => `Return created — ${num}`,
    toastWhatsApp: 'WhatsApp message prepared',
    toastPrintOpened: 'Print window opened',
    toastStorageErr: 'Could not update — please try again.',
    toastSaveErr: 'Could not save — please try again.',
    toastAccErr: 'Could not create accounting entry.',
    toastStockErr: 'Could not update stock.',
    toastLoadErr: 'Could not load records.',
    toastPopupBlocked: 'Pop-up blocked — allow pop-ups to print',
    histApproved: 'Approved',
    histRejected: 'Rejected',
    histPending: 'Moved back to Pending',
    histReturn: (n: number, num: string) => `Returned ${n} item(s) — ${num}`,
    waHello: (name: string) => `Hello ${name},`,
    waItems: 'Items:',
    waReview: 'Please review and confirm.',
    waQty: 'Qty',
    printThankYou: 'Thank you for your business',
    printCustomerVat: 'Customer VAT:',
    printNotes: 'Notes:',
    printPayment: 'Payment:',
    showing: 'Showing',
    of: 'of',
    payUnpaid: 'Unpaid',
    payPartial: 'Partially Paid',
    payPaid: 'Paid',
    methodCash: 'Cash',
    methodBank: 'Bank Transfer',
    methodCard: 'Card',
    methodOther: 'Other',
    by: 'by',
    printNo: 'No:',
    printVat: 'VAT:',
    printFormatTitle: 'Choose Print Format',
    printFormatSubtitle: (num: string) => `Print ${num} — select paper size`,
    printFormatPrint: 'Print',
    printFormatCancel: 'Cancel',
    printFormatDefaultTag: 'DEFAULT',
    printFormatLastTag: 'LAST USED',
    addPayment: 'Add Payment',
    addPaymentTitle: (num: string) => `Add Payment — ${num}`,
    amountReceived: 'Amount Received',
    paymentMethodLabel: 'Payment Method',
    paymentNote: 'Note (optional)',
    paymentNotePh: 'e.g. Installment 2',
    confirmPayment: 'Confirm Payment',
    paymentHistory: 'Payment History',
    noPayments: 'No payments recorded yet',
    paymentDate: 'Date',
    paymentAmount: 'Amount',
    paymentMethodCol: 'Method',
    paymentNoteCol: 'Note',
    balanceAfter: 'Balance After',
    errAmountRequired: 'Amount is required',
    errAmountTooHigh: 'Amount cannot exceed the balance due',
    toastPaymentAdded: 'Payment added successfully',
    totalPaid: 'Total Paid',
    companyLabel: 'Company',
    phoneLabel: 'Phone',
    addressLabel: 'Address',
    vatNumberLabel: 'VAT Number',
    paymentReferenceLabel: 'Payment Reference',
    salesChannel: 'Sales Channel',
    channelOnline: 'Online',
    channelOffline: 'Offline',
    dueDate: 'Due Date',
    lastUpdated: 'Last Updated',
    tenantId: 'Tenant ID',
    categoryLabel: 'Category',
    costPrice: 'Cost Price',
    description: 'Description',
    stockMovement: 'Stock Movement',
    stockIn: 'Stock In',
    stockOut: 'Stock Out',
    stockBalance: 'Stock Balance',
  },
  ar: {
    filters: 'الفلاتر',
    search: 'بحث',
    searchPh: 'رقم الطلب، العميل، الهاتف...',
    dateFrom: 'من تاريخ',
    dateTo: 'إلى تاريخ',
    clearFilters: 'مسح جميع الفلاتر',
    sortBy: 'ترتيب حسب',
    sortNewest: 'الأحدث أولاً',
    sortOldest: 'الأقدم أولاً',
    sortNameAsc: 'العميل أ ← ي',
    sortNameDesc: 'العميل ي ← أ',
    sortAmountDesc: 'المبلغ: من الأعلى للأقل',
    sortAmountAsc: 'المبلغ: من الأقل للأعلى',
    tabQuotations: 'عروض الأسعار',
    tabInvoices: 'الفواتير',
    tabApproved: 'معتمدة',
    tabRejected: 'مرفوضة',
    colOrderNo: 'رقم الطلب',
    colCustomer: 'العميل',
    colDate: 'التاريخ',
    colAmount: 'المبلغ',
    colPayment: 'الدفع',
    colStatus: 'الحالة',
    colActions: 'الإجراءات',
    noRecords: 'لا توجد سجلات',
    loading: 'جارٍ التحميل...',
    actPreview: 'معاينة',
    actWhatsApp: 'واتساب',
    actApprove: 'اعتماد',
    actReject: 'رفض',
    actPrint: 'طباعة',
    actReturn: 'إرجاع',
    actPending: 'معلق',
    returnedBadge: 'مُرجَع',
    statusPending: 'معلق',
    statusApproved: 'معتمد',
    statusRejected: 'مرفوض',
    docQuotation: 'عرض سعر',
    docInvoice: 'فاتورة',
    cancel: 'إلغاء',
    close: 'إغلاق',
    approveTitle: 'اعتماد السجل',
    approveMsg: (num: string) => `اعتماد ${num}؟ ستتغير الحالة إلى معتمد.`,
    approveLabel: 'اعتماد',
    approvePaymentTitle: (num: string) => `اعتماد ${num} — الدفع`,
    approvePaymentSubtitle: 'أدخل المبلغ المستلم. سيتم حساب الرصيد تلقائياً.',
    approveGrandTotal: 'الإجمالي',
    approveAndSave: 'اعتماد وحفظ',
    errAmountInvalid: 'يجب أن يكون المبلغ بين 0 والرصيد المتبقي',
    errMinPayment: 'الدفع مطلوب: أدخل مبلغاً لا يقل عن 1 للاعتماد',
    fullBtn: 'كامل',
    rejectTitle: 'رفض السجل',
    rejectMsg: (num: string) => `رفض ${num}؟ ستتغير الحالة إلى مرفوض.`,
    rejectLabel: 'رفض',
    rejectReasonLabel: 'السبب (اختياري)',
    pendingTitle: 'نقل إلى معلق',
    pendingMsg: (num: string, docLabel: string) =>
      `نقل ${num} إلى معلق؟ سيعود إلى قائمة ${docLabel}.`,
    pendingLabel: 'نقل إلى معلق',
    returnTitle: 'إرجاع الفاتورة',
    returnSubtitle: (num: string) => `${num} — اختر العناصر للإرجاع`,
    previewBtn: 'معاينة',
    productsFromInvoice: 'المنتجات من الفاتورة الأصلية',
    colProduct: 'المنتج',
    colPrice: 'السعر',
    colOrigQty: 'الكمية الأصلية',
    colReturned: 'المُرجَع',
    colAvailable: 'المتاح',
    colReturnQty: 'كمية الإرجاع',
    colSubtotal: 'المجموع',
    totalReturnAmount: 'إجمالي مبلغ الإرجاع',
    returnReason: 'سبب الإرجاع',
    returnReasonPh: 'مثال: أعاد العميل 3 حقائب — تالفة',
    returnDate: 'تاريخ الإرجاع',
    returnNotes: 'ملاحظات (اختياري)',
    returnNotesPh: 'تفاصيل إضافية...',
    confirmReturn: 'تأكيد الإرجاع',
    errReasonRequired: 'سبب الإرجاع مطلوب',
    errNoItems: 'يجب أن يكون لعنصر واحد على الأقل كمية إرجاع أكبر من 0',
    errQtyTooHigh: 'لا يمكن أن تتجاوز كمية الإرجاع الكمية المتاحة',
    originalInvoice: 'الفاتورة الأصلية',
    issuedOn: 'صدرت في',
    billTo: 'فاتورة إلى',
    products: 'المنتجات',
    colQty: 'الكمية',
    colTotal: 'المجموع',
    colUnit: 'الوحدة',
    colDiscount: 'الخصم',
    subtotal: 'المجموع الفرعي',
    discount: 'الخصم',
    vat: 'ضريبة القيمة المضافة',
    grandTotal: 'الإجمالي',
    notes: 'ملاحظات',
    returnDetailsTitle: (num: string) => `إرجاع — ${num}`,
    returnFor: 'لـ',
    returned: 'مُرجَع',
    itemsCount: (n: number) => `${n} عنصر`,
    reason: 'السبب',
    returnedItems: 'العناصر المُرجَعة',
    totalReturn: 'إجمالي الإرجاع',
    linkedTransaction: 'المعاملة المرتبطة:',
    createdBy: 'أنشأها',
    document: 'المستند',
    type: 'النوع',
    issue: 'الإصدار',
    createdByLabel: 'أنشأها:',
    items: 'العناصر',
    material: 'المادة',
    payment: 'الدفع',
    balanceDue: 'الرصيد المستحق',
    returnsSection: 'الإرجاعات',
    statusHistory: 'سجل الحالة',
    noStatusChanges: 'لا تغييرات في الحالة بعد',
    toastApproved: (num: string) => `${num} → معتمد`,
    toastRejected: (num: string) => `${num} → مرفوض`,
    toastPending: (num: string) => `${num} → معلق`,
    toastReturnCreated: (num: string) => `تم إنشاء الإرجاع — ${num}`,
    toastWhatsApp: 'تم تجهيز رسالة واتساب',
    toastPrintOpened: 'تم فتح نافذة الطباعة',
    toastStorageErr: 'تعذر التحديث — حاول مرة أخرى.',
    toastSaveErr: 'تعذر الحفظ — حاول مرة أخرى.',
    toastAccErr: 'تعذر إنشاء القيد المحاسبي.',
    toastStockErr: 'تعذر تحديث المخزون.',
    toastLoadErr: 'تعذر تحميل السجلات.',
    toastPopupBlocked: 'النوافذ المنبثقة محظورة — اسمح بها للطباعة',
    histApproved: 'اعتُمد',
    histRejected: 'رُفض',
    histPending: 'أُعيد إلى معلق',
    histReturn: (n: number, num: string) => `تم إرجاع ${n} عنصر — ${num}`,
    waHello: (name: string) => `مرحباً ${name}،`,
    waItems: 'العناصر:',
    waReview: 'يرجى المراجعة والتأكيد.',
    waQty: 'الكمية',
    printThankYou: 'شكراً لتعاملكم معنا',
    printCustomerVat: 'الرقم الضريبي للعميل:',
    printNotes: 'ملاحظات:',
    printPayment: 'الدفع:',
    showing: 'عرض',
    of: 'من',
    payUnpaid: 'غير مدفوع',
    payPartial: 'مدفوع جزئياً',
    payPaid: 'مدفوع',
    methodCash: 'نقداً',
    methodBank: 'تحويل بنكي',
    methodCard: 'بطاقة',
    methodOther: 'أخرى',
    by: 'بواسطة',
    printNo: 'رقم:',
    printVat: 'الرقم الضريبي:',
    printFormatTitle: 'اختر تنسيق الطباعة',
    printFormatSubtitle: (num: string) => `طباعة ${num} — اختر حجم الورق`,
    printFormatPrint: 'طباعة',
    printFormatCancel: 'إلغاء',
    printFormatDefaultTag: 'افتراضي',
    printFormatLastTag: 'آخر استخدام',
    addPayment: 'إضافة دفعة',
    addPaymentTitle: (num: string) => `إضافة دفعة — ${num}`,
    amountReceived: 'المبلغ المستلم',
    paymentMethodLabel: 'طريقة الدفع',
    paymentNote: 'ملاحظة (اختياري)',
    paymentNotePh: 'مثال: القسط الثاني',
    confirmPayment: 'تأكيد الدفع',
    paymentHistory: 'سجل المدفوعات',
    noPayments: 'لا توجد مدفوعات مسجلة بعد',
    paymentDate: 'التاريخ',
    paymentAmount: 'المبلغ',
    paymentMethodCol: 'الطريقة',
    paymentNoteCol: 'ملاحظة',
    balanceAfter: 'الرصيد بعد',
    errAmountRequired: 'المبلغ مطلوب',
    errAmountTooHigh: 'المبلغ لا يمكن أن يتجاوز الرصيد المستحق',
    toastPaymentAdded: 'تمت إضافة الدفعة بنجاح',
    totalPaid: 'إجمالي المدفوع',
    companyLabel: 'الشركة',
    phoneLabel: 'الهاتف',
    addressLabel: 'العنوان',
    vatNumberLabel: 'الرقم الضريبي',
    paymentReferenceLabel: 'مرجع الدفع',
    salesChannel: 'قناة البيع',
    channelOnline: 'أونلاين',
    channelOffline: 'أوفلاين',
    dueDate: 'تاريخ الاستحقاق',
    lastUpdated: 'آخر تحديث',
    tenantId: 'معرف المستأجر',
    categoryLabel: 'الفئة',
    costPrice: 'سعر التكلفة',
    description: 'الوصف',
    stockMovement: 'حركة المخزون',
    stockIn: 'دخول مخزون',
    stockOut: 'خروج مخزون',
    stockBalance: 'رصيد المخزون',
  },
  ur: {
    filters: 'فلٹرز',
    search: 'تلاش',
    searchPh: 'آرڈر نمبر، کسٹمر، فون...',
    dateFrom: 'تاریخ سے',
    dateTo: 'تاریخ تک',
    clearFilters: 'تمام فلٹرز صاف کریں',
    sortBy: 'ترتیب بلحاظ',
    sortNewest: 'نیا پہلے',
    sortOldest: 'پرانا پہلے',
    sortNameAsc: 'کسٹمر الف ← ے',
    sortNameDesc: 'کسٹمر ے ← الف',
    sortAmountDesc: 'رقم: زیادہ سے کم',
    sortAmountAsc: 'رقم: کم سے زیادہ',
    tabQuotations: 'کوٹیشنز',
    tabInvoices: 'انوائسز',
    tabApproved: 'منظور شدہ',
    tabRejected: 'مسترد شدہ',
    colOrderNo: 'آرڈر نمبر',
    colCustomer: 'کسٹمر',
    colDate: 'تاریخ',
    colAmount: 'رقم',
    colPayment: 'ادائیگی',
    colStatus: 'حالت',
    colActions: 'اقدامات',
    noRecords: 'کوئی ریکارڈ نہیں ملا',
    loading: 'لوڈ ہو رہا ہے...',
    actPreview: 'جھلک',
    actWhatsApp: 'واٹس ایپ',
    actApprove: 'منظور کریں',
    actReject: 'مسترد کریں',
    actPrint: 'پرنٹ',
    actReturn: 'واپسی',
    actPending: 'زیر التواء',
    returnedBadge: 'واپس شدہ',
    statusPending: 'زیر التواء',
    statusApproved: 'منظور شدہ',
    statusRejected: 'مسترد شدہ',
    docQuotation: 'کوٹیشن',
    docInvoice: 'انوائس',
    cancel: 'منسوخ',
    close: 'بند کریں',
    approveTitle: 'ریکارڈ منظور کریں',
    approveMsg: (num: string) => `${num} منظور کریں؟ حالت منظور شدہ ہو جائے گی۔`,
    approveLabel: 'منظور کریں',
    approvePaymentTitle: (num: string) => `${num} منظور کریں — ادائیگی`,
    approvePaymentSubtitle: 'موصول شدہ رقم درج کریں۔ باقی خود بخود حساب ہو جائے گی۔',
    approveGrandTotal: 'کل رقم',
    approveAndSave: 'منظور کریں اور محفوظ کریں',
    errAmountInvalid: 'رقم 0 اور باقی رقم کے درمیان ہونی چاہیے',
    errMinPayment: 'ادائیگی ضروری ہے: منظوری کے لیے کم از کم 1 روپیہ درج کریں',
    fullBtn: 'پورا',
    rejectTitle: 'ریکارڈ مسترد کریں',
    rejectMsg: (num: string) => `${num} مسترد کریں؟ حالت مسترد شدہ ہو جائے گی۔`,
    rejectLabel: 'مسترد کریں',
    rejectReasonLabel: 'وجہ (اختیاری)',
    pendingTitle: 'زیر التواء میں منتقل کریں',
    pendingMsg: (num: string, docLabel: string) =>
      `${num} کو زیر التواء میں منتقل کریں؟ یہ ${docLabel} فہرست میں واپس جائے گا۔`,
    pendingLabel: 'زیر التواء میں منتقل کریں',
    returnTitle: 'انوائس واپس کریں',
    returnSubtitle: (num: string) => `${num} — واپسی کے لیے اشیاء منتخب کریں`,
    previewBtn: 'جھلک',
    productsFromInvoice: 'اصل انوائس سے مصنوعات',
    colProduct: 'پروڈکٹ',
    colPrice: 'قیمت',
    colOrigQty: 'اصل مقدار',
    colReturned: 'واپس شدہ',
    colAvailable: 'دستیاب',
    colReturnQty: 'واپسی مقدار',
    colSubtotal: 'ذیلی مجموعہ',
    totalReturnAmount: 'کل واپسی رقم',
    returnReason: 'واپسی کی وجہ',
    returnReasonPh: 'مثلاً: کسٹمر نے 3 بیگ واپس کیے — خراب',
    returnDate: 'واپسی کی تاریخ',
    returnNotes: 'نوٹس (اختیاری)',
    returnNotesPh: 'اضافی تفصیلات...',
    confirmReturn: 'واپسی کی تصدیق کریں',
    errReasonRequired: 'واپسی کی وجہ درکار ہے',
    errNoItems: 'کم از کم ایک شے کی واپسی مقدار 0 سے زیادہ ہونی چاہیے',
    errQtyTooHigh: 'واپسی مقدار دستیاب مقدار سے زیادہ نہیں ہو سکتی',
    originalInvoice: 'اصل انوائس',
    issuedOn: 'جاری کردہ',
    billTo: 'بل بنام',
    products: 'مصنوعات',
    colQty: 'مقدار',
    colTotal: 'کل',
    colUnit: 'یونٹ',
    colDiscount: 'رعایت',
    subtotal: 'ذیلی مجموعہ',
    discount: 'رعایت',
    vat: 'ویٹ',
    grandTotal: 'کل رقم',
    notes: 'نوٹس',
    returnDetailsTitle: (num: string) => `واپسی — ${num}`,
    returnFor: 'برائے',
    returned: 'واپس شدہ',
    itemsCount: (n: number) => `${n} اشیاء`,
    reason: 'وجہ',
    returnedItems: 'واپس شدہ اشیاء',
    totalReturn: 'کل واپسی',
    linkedTransaction: 'منسلک ٹرانزیکشن:',
    createdBy: 'بنایا',
    document: 'دستاویز',
    type: 'قسم',
    issue: 'اجرا',
    createdByLabel: 'بنایا:',
    items: 'اشیاء',
    material: 'مواد',
    payment: 'ادائیگی',
    balanceDue: 'باقی رقم',
    returnsSection: 'واپسیاں',
    statusHistory: 'حالت کی تاریخ',
    noStatusChanges: 'ابھی کوئی حالت تبدیل نہیں ہوئی',
    toastApproved: (num: string) => `${num} → منظور شدہ`,
    toastRejected: (num: string) => `${num} → مسترد شدہ`,
    toastPending: (num: string) => `${num} → زیر التواء`,
    toastReturnCreated: (num: string) => `واپسی بن گئی — ${num}`,
    toastWhatsApp: 'واٹس ایپ پیغام تیار ہے',
    toastPrintOpened: 'پرنٹ ونڈو کھل گئی',
    toastStorageErr: 'اپ ڈیٹ نہیں ہو سکا — دوبارہ کوشش کریں۔',
    toastSaveErr: 'محفوظ نہیں ہو سکا — دوبارہ کوشش کریں۔',
    toastAccErr: 'اکاؤنٹنگ اندراج نہیں بن سکا۔',
    toastStockErr: 'اسٹاک اپ ڈیٹ نہیں ہو سکا۔',
    toastLoadErr: 'ریکارڈ لوڈ نہیں ہو سکے۔',
    toastPopupBlocked: 'پاپ اپ بلاک ہے — پرنٹ کے لیے اجازت دیں',
    histApproved: 'منظور شدہ',
    histRejected: 'مسترد شدہ',
    histPending: 'زیر التواء میں واپس',
    histReturn: (n: number, num: string) => `${n} اشیاء واپس — ${num}`,
    waHello: (name: string) => `سلام ${name}،`,
    waItems: 'اشیاء:',
    waReview: 'براہ کرم جائزہ لیں اور تصدیق کریں۔',
    waQty: 'مقدار',
    printThankYou: 'آپ کے کاروبار کا شکریہ',
    printCustomerVat: 'کسٹمر ویٹ:',
    printNotes: 'نوٹس:',
    printPayment: 'ادائیگی:',
    showing: 'دکھا رہے ہیں',
    of: 'میں سے',
    payUnpaid: 'غیر ادا شدہ',
    payPartial: 'جزوی ادا شدہ',
    payPaid: 'ادا شدہ',
    methodCash: 'نقد',
    methodBank: 'بینک ٹرانسفر',
    methodCard: 'کارڈ',
    methodOther: 'دیگر',
    by: 'از',
    printNo: 'نمبر:',
    printVat: 'ویٹ نمبر:',
    printFormatTitle: 'پرنٹ فارمیٹ منتخب کریں',
    printFormatSubtitle: (num: string) => `${num} پرنٹ کریں — کاغذ کا سائز منتخب کریں`,
    printFormatPrint: 'پرنٹ',
    printFormatCancel: 'منسوخ',
    printFormatDefaultTag: 'ڈیفالٹ',
    printFormatLastTag: 'آخری استعمال',
    addPayment: 'ادائیگی شامل کریں',
    addPaymentTitle: (num: string) => `ادائیگی شامل کریں — ${num}`,
    amountReceived: 'موصول شدہ رقم',
    paymentMethodLabel: 'ادائیگی کا طریقہ',
    paymentNote: 'نوٹ (اختیاری)',
    paymentNotePh: 'مثلاً: دوسری قسط',
    confirmPayment: 'ادائیگی کی تصدیق کریں',
    paymentHistory: 'ادائیگی کی تاریخ',
    noPayments: 'ابھی تک کوئی ادائیگی درج نہیں',
    paymentDate: 'تاریخ',
    paymentAmount: 'رقم',
    paymentMethodCol: 'طریقہ',
    paymentNoteCol: 'نوٹ',
    balanceAfter: 'بعد میں باقی',
    errAmountRequired: 'رقم درکار ہے',
    errAmountTooHigh: 'رقم باقی رقم سے زیادہ نہیں ہو سکتی',
    toastPaymentAdded: 'ادائیگی کامیابی سے شامل ہو گئی',
    totalPaid: 'کل ادا شدہ',
    companyLabel: 'کمپنی',
    phoneLabel: 'فون',
    addressLabel: 'پتہ',
    vatNumberLabel: 'ویٹ نمبر',
    paymentReferenceLabel: 'ادائیگی کا حوالہ',
    salesChannel: 'سیلز چینل',
    channelOnline: 'آن لائن',
    channelOffline: 'آف لائن',
    dueDate: 'واجب الادا تاریخ',
    lastUpdated: 'آخری اپ ڈیٹ',
    tenantId: 'ٹیننٹ آئی ڈی',
    categoryLabel: 'کیٹیگری',
    costPrice: 'لاگت قیمت',
    description: 'تفصیل',
    stockMovement: 'اسٹاک حرکت',
    stockIn: 'اسٹاک اندر',
    stockOut: 'اسٹاک باہر',
    stockBalance: 'اسٹاک بیلنس',
  },
  hi: {
    filters: 'फ़िल्टर',
    search: 'खोजें',
    searchPh: 'ऑर्डर नं., ग्राहक, फ़ोन...',
    dateFrom: 'तारीख से',
    dateTo: 'तारीख तक',
    clearFilters: 'सभी फ़िल्टर हटाएँ',
    sortBy: 'क्रमबद्ध करें',
    sortNewest: 'नया पहले',
    sortOldest: 'पुराना पहले',
    sortNameAsc: 'ग्राहक अ → ज्ञ',
    sortNameDesc: 'ग्राहक ज्ञ → अ',
    sortAmountDesc: 'राशि: अधिक से कम',
    sortAmountAsc: 'राशि: कम से अधिक',
    tabQuotations: 'कोटेशन',
    tabInvoices: 'इनवॉइस',
    tabApproved: 'स्वीकृत',
    tabRejected: 'अस्वीकृत',
    colOrderNo: 'ऑर्डर नं.',
    colCustomer: 'ग्राहक',
    colDate: 'तारीख',
    colAmount: 'राशि',
    colPayment: 'भुगतान',
    colStatus: 'स्थिति',
    colActions: 'क्रियाएँ',
    noRecords: 'कोई रिकॉर्ड नहीं मिला',
    loading: 'लोड हो रहा है...',
    actPreview: 'पूर्वावलोकन',
    actWhatsApp: 'व्हाट्सएप',
    actApprove: 'स्वीकृत करें',
    actReject: 'अस्वीकृत करें',
    actPrint: 'प्रिंट',
    actReturn: 'वापसी',
    actPending: 'लंबित',
    returnedBadge: 'वापस किया',
    statusPending: 'लंबित',
    statusApproved: 'स्वीकृत',
    statusRejected: 'अस्वीकृत',
    docQuotation: 'कोटेशन',
    docInvoice: 'इनवॉइस',
    cancel: 'रद्द करें',
    close: 'बंद करें',
    approveTitle: 'रिकॉर्ड स्वीकृत करें',
    approveMsg: (num: string) => `${num} स्वीकृत करें? स्थिति स्वीकृत हो जाएगी।`,
    approveLabel: 'स्वीकृत करें',
    approvePaymentTitle: (num: string) => `${num} स्वीकृत करें — भुगतान`,
    approvePaymentSubtitle: 'प्राप्त राशि दर्ज करें। बाकी स्वतः गणना होगी।',
    approveGrandTotal: 'कुल योग',
    approveAndSave: 'स्वीकृत करें और सहेजें',
    errAmountInvalid: 'राशि 0 और बाकी राशि के बीच होनी चाहिए',
    errMinPayment: 'भुगतान आवश्यक: स्वीकृत करने के लिए कम से कम 1 दर्ज करें',
    fullBtn: 'पूरा',
    rejectTitle: 'रिकॉर्ड अस्वीकृत करें',
    rejectMsg: (num: string) => `${num} अस्वीकृत करें? स्थिति अस्वीकृत हो जाएगी।`,
    rejectLabel: 'अस्वीकृत करें',
    rejectReasonLabel: 'कारण (वैकल्पिक)',
    pendingTitle: 'लंबित में ले जाएँ',
    pendingMsg: (num: string, docLabel: string) =>
      `${num} को लंबित में ले जाएँ? यह ${docLabel} सूची में वापस जाएगा।`,
    pendingLabel: 'लंबित में ले जाएँ',
    returnTitle: 'इनवॉइस वापसी',
    returnSubtitle: (num: string) => `${num} — वापसी के लिए आइटम चुनें`,
    previewBtn: 'पूर्वावलोकन',
    productsFromInvoice: 'मूल इनवॉइस के उत्पाद',
    colProduct: 'उत्पाद',
    colPrice: 'कीमत',
    colOrigQty: 'मूल मात्रा',
    colReturned: 'वापस किया',
    colAvailable: 'उपलब्ध',
    colReturnQty: 'वापसी मात्रा',
    colSubtotal: 'उप-योग',
    totalReturnAmount: 'कुल वापसी राशि',
    returnReason: 'वापसी का कारण',
    returnReasonPh: 'जैसे: ग्राहक ने 3 बैग वापस किए — क्षतिग्रस्त',
    returnDate: 'वापसी तिथि',
    returnNotes: 'नोट्स (वैकल्पिक)',
    returnNotesPh: 'अतिरिक्त विवरण...',
    confirmReturn: 'वापसी की पुष्टि करें',
    errReasonRequired: 'वापसी का कारण आवश्यक है',
    errNoItems: 'कम से कम एक आइटम की वापसी मात्रा 0 से अधिक होनी चाहिए',
    errQtyTooHigh: 'वापसी मात्रा उपलब्ध मात्रा से अधिक नहीं हो सकती',
    originalInvoice: 'मूल इनवॉइस',
    issuedOn: 'जारी',
    billTo: 'बिल टू',
    products: 'उत्पाद',
    colQty: 'मात्रा',
    colTotal: 'कुल',
    colUnit: 'इकाई',
    colDiscount: 'छूट',
    subtotal: 'उप-योग',
    discount: 'छूट',
    vat: 'वैट',
    grandTotal: 'कुल योग',
    notes: 'नोट्स',
    returnDetailsTitle: (num: string) => `वापसी — ${num}`,
    returnFor: 'के लिए',
    returned: 'वापस किया',
    itemsCount: (n: number) => `${n} आइटम`,
    reason: 'कारण',
    returnedItems: 'वापस किए गए आइटम',
    totalReturn: 'कुल वापसी',
    linkedTransaction: 'लिंक्ड लेनदेन:',
    createdBy: 'बनाया',
    document: 'दस्तावेज़',
    type: 'प्रकार',
    issue: 'जारी',
    createdByLabel: 'बनाया:',
    items: 'आइटम',
    material: 'सामग्री',
    payment: 'भुगतान',
    balanceDue: 'बाकी राशि',
    returnsSection: 'वापसियाँ',
    statusHistory: 'स्थिति इतिहास',
    noStatusChanges: 'अभी कोई स्थिति परिवर्तन नहीं',
    toastApproved: (num: string) => `${num} → स्वीकृत`,
    toastRejected: (num: string) => `${num} → अस्वीकृत`,
    toastPending: (num: string) => `${num} → लंबित`,
    toastReturnCreated: (num: string) => `वापसी बनाई गई — ${num}`,
    toastWhatsApp: 'व्हाट्सएप संदेश तैयार',
    toastPrintOpened: 'प्रिंट विंडो खुली',
    toastStorageErr: 'अपडेट नहीं हो सका — फिर कोशिश करें।',
    toastSaveErr: 'सहेजा नहीं जा सका — फिर कोशिश करें।',
    toastAccErr: 'लेखांकन प्रविष्टि नहीं बन सकी।',
    toastStockErr: 'स्टॉक अपडेट नहीं हो सका।',
    toastLoadErr: 'रिकॉर्ड लोड नहीं हो सके।',
    toastPopupBlocked: 'पॉप-अप अवरुद्ध — प्रिंट के लिए अनुमति दें',
    histApproved: 'स्वीकृत',
    histRejected: 'अस्वीकृत',
    histPending: 'लंबित में वापस',
    histReturn: (n: number, num: string) => `${n} आइटम वापस — ${num}`,
    waHello: (name: string) => `नमस्ते ${name},`,
    waItems: 'आइटम:',
    waReview: 'कृपया समीक्षा करें और पुष्टि करें।',
    waQty: 'मात्रा',
    printThankYou: 'आपके व्यवसाय के लिए धन्यवाद',
    printCustomerVat: 'ग्राहक वैट:',
    printNotes: 'नोट्स:',
    printPayment: 'भुगतान:',
    showing: 'दिखा रहे हैं',
    of: 'में से',
    payUnpaid: 'अवैतनिक',
    payPartial: 'आंशिक भुगतान',
    payPaid: 'भुगतान हो गया',
    methodCash: 'नकद',
    methodBank: 'बैंक ट्रांसफ़र',
    methodCard: 'कार्ड',
    methodOther: 'अन्य',
    by: 'द्वारा',
    printNo: 'नं.:',
    printVat: 'वैट:',
    printFormatTitle: 'प्रिंट फ़ॉर्मेट चुनें',
    printFormatSubtitle: (num: string) => `${num} प्रिंट करें — कागज़ का आकार चुनें`,
    printFormatPrint: 'प्रिंट',
    printFormatCancel: 'रद्द करें',
    printFormatDefaultTag: 'डिफ़ॉल्ट',
    printFormatLastTag: 'पिछला उपयोग',
    addPayment: 'भुगतान जोड़ें',
    addPaymentTitle: (num: string) => `भुगतान जोड़ें — ${num}`,
    amountReceived: 'प्राप्त राशि',
    paymentMethodLabel: 'भुगतान का तरीका',
    paymentNote: 'नोट (वैकल्पिक)',
    paymentNotePh: 'जैसे: दूसरी किस्त',
    confirmPayment: 'भुगतान की पुष्टि करें',
    paymentHistory: 'भुगतान इतिहास',
    noPayments: 'अभी तक कोई भुगतान दर्ज नहीं',
    paymentDate: 'तारीख',
    paymentAmount: 'राशि',
    paymentMethodCol: 'तरीका',
    paymentNoteCol: 'नोट',
    balanceAfter: 'बाद में बाकी',
    errAmountRequired: 'राशि आवश्यक है',
    errAmountTooHigh: 'राशि बाकी राशि से अधिक नहीं हो सकती',
    toastPaymentAdded: 'भुगतान सफलतापूर्वक जोड़ा गया',
    totalPaid: 'कुल भुगतान',
    companyLabel: 'कंपनी',
    phoneLabel: 'फ़ोन',
    addressLabel: 'पता',
    vatNumberLabel: 'वैट नंबर',
    paymentReferenceLabel: 'भुगतान संदर्भ',
    salesChannel: 'बिक्री चैनल',
    channelOnline: 'ऑनलाइन',
    channelOffline: 'ऑफ़लाइन',
    dueDate: 'देय तिथि',
    lastUpdated: 'अंतिम अपडेट',
    tenantId: 'टेनेंट आईडी',
    categoryLabel: 'श्रेणी',
    costPrice: 'लागत मूल्य',
    description: 'विवरण',
    stockMovement: 'स्टॉक गतिविधि',
    stockIn: 'स्टॉक इन',
    stockOut: 'स्टॉक आउट',
    stockBalance: 'स्टॉक बैलेंस',
  },
} as const;

type RbTranslations = {
  [K in keyof typeof rbT['en']]: (typeof rbT['en'])[K] extends (
    ...args: infer A
  ) => infer R
    ? (...args: A) => R
    : string;
};

// ============================================================
// TYPES
// ============================================================
type CustomerSnapshot = {
  name: string;
  company: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
};
type DocumentType = 'quotation' | 'invoice';
type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Card' | 'Other';
type PaymentStatus = 'Unpaid' | 'Partially Paid' | 'Paid';

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

type DocumentLine = {
  id: string;
  productId: string;
  productImage?: string;
  material: string;
  sku: string;
  category?: string;
  costPrice?: number;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  lineTotal: number;
};

type ReturnItem = {
  lineId: string;
  productName: string;
  price: number;
  originalQty: number;
  returnQty: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
};

type ReturnRecord = {
  returnId: string;
  returnNumber: string;
  date: string;
  reason: string;
  notes?: string;
  items: ReturnItem[];
  subtotal: number;
  taxTotal: number;
  totalReturnAmount: number;
  linkedTransactionId: string;
  createdBy: string;
  createdAt: string;
};

type DocumentRecord = {
  id: string;
  documentType: DocumentType;
  orderNumber: string;
  customerId: string;
  customerSnapshot: CustomerSnapshot;
  issueDate: string;
  dueDate?: string;
  salesChannel?: 'Online' | 'Offline';
  tenantId?: string;
  updatedAt?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
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
  returnRecords?: ReturnRecord[];
  payments?: PaymentRecord[];
};

type WorkflowStatus = 'Pending' | 'Approved' | 'Rejected';
type StatusHistory = {
  id: string;
  documentId: string;
  oldStatus: WorkflowStatus | null;
  newStatus: WorkflowStatus;
  reason: string;
  changedBy: string;
  changedAt: string;
};
type Category = 'Quotation' | 'Invoice' | 'Approved' | 'Rejected';
type TabId = Category;

type SortKey =
  | 'newest'
  | 'oldest'
  | 'nameAsc'
  | 'nameDesc'
  | 'amountDesc'
  | 'amountAsc';

type CompanyInfo = { name: string; address: string; phone: string; vat: string };

// ============================================================
// HELPERS
// ============================================================
const roundMoney = (n: number): number =>
  Math.round((n + Number.EPSILON) * 100) / 100;

// plain number only (no currency prefix)
const formatMoney = (n: number): string => {
  const abs = Math.abs(n);
  return `${n < 0 ? '-' : ''}${abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (iso: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

const formatDateTime = (iso: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return `${formatDate(iso)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const todayISO = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const phoneDigits = (raw: string): string => raw.replace(/\D/g, '');

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

const DEFAULT_COMPANY: CompanyInfo = { name: 'Zakhira', address: '', phone: '', vat: '' };

const PAGE_SIZE = 10;
const HANDOFF_VIEW_TXN_KEY = 'zakhira_accounting_view_txn';
const HANDOFF_VIEW_INVOICE_KEY = 'zakhira_sales_view_invoice';

// ============================================================
// DB (snake_case) -> UI (camelCase) MAPPERS
// ============================================================
const mapDoc = (d: RecordsDocument): DocumentRecord => {
  const payments: PaymentRecord[] = (d.payments || []).map((p: any) => ({
    id: p.id,
    date: p.payment_date,
    amount: Number(p.amount),
    method: (p.method || 'Cash') as PaymentMethod,
    note: p.note || undefined,
    balanceAfter: Number(p.balance_after),
    recordedBy: p.recorded_by_name || '',
    createdAt: p.created_at,
  }));

  const returnRecords: ReturnRecord[] = (d.returns || []).map((r: any) => ({
    returnId: r.id,
    returnNumber: r.return_number,
    date: r.return_date,
    reason: r.reason,
    notes: r.notes || undefined,
    items: (r.items || []).map((it: any) => ({
      lineId: it.line_id,
      productName: it.product_name,
      price: Number(it.price),
      originalQty: Number(it.original_qty),
      returnQty: Number(it.return_qty),
      subtotal: Number(it.subtotal),
      taxAmount: Number(it.tax_amount),
      totalAmount: Number(it.total_amount),
    })),
    subtotal: Number(r.subtotal),
    taxTotal: Number(r.tax_total),
    totalReturnAmount: Number(r.total_return_amount),
    linkedTransactionId: r.linked_transaction_no || '',
    createdBy: r.created_by_name || '',
    createdAt: r.created_at,
  }));

  return {
    id: d.id,
    documentType: d.document_type,
    orderNumber: d.order_number,
    customerId: d.customer_id || '',
    customerSnapshot: {
      name: d.customer_name,
      company: d.customer_company || '',
      phone: d.customer_phone || d.customer_phone_alt || '',
      email: d.customer_email || undefined,
      address: d.customer_address || '',
      city: d.customer_city || '',
    },
    issueDate: d.issue_date,
    dueDate: d.due_date || undefined,
    salesChannel: d.sales_channel,
    updatedAt: d.updated_at,
    status: d.status,
    currency: d.currency,
    notes: d.notes || '',
    vatNumber: d.vat_number || '',
    vatRate: Number(d.vat_rate) || 0,
    lines: (d.lines || []).map((l: any) => ({
      id: l.id,
      productId: l.product_id || '',
      material: l.material,
      sku: l.sku || '',
      category: l.category || undefined,
      costPrice: l.cost_price != null ? Number(l.cost_price) : undefined,
      description: l.description || undefined,
      quantity: Number(l.quantity),
      unitPrice: Number(l.unit_price),
      discountType: (l.discount_type || 'percentage') as 'percentage' | 'fixed',
      discountValue: Number(l.discount_value) || 0,
      lineTotal: Number(l.line_total),
    })),
    subtotal: Number(d.subtotal),
    discountTotal: Number(d.discount_total) || 0,
    taxTotal: Number(d.tax_total) || 0,
    grandTotal: Number(d.grand_total),
    paymentStatus: d.payment_status,
    paymentMethod: (d.payment_method || '') as PaymentMethod | '',
    paymentAmount: Number(d.payment_amount) || 0,
    paymentDate: d.payment_date || (payments.length ? payments[payments.length - 1].date : ''),
    paymentReference: d.payment_reference || '',
    balanceDue: Number(d.balance_due) || 0,
    createdBy: d.created_by_name || '',
    createdAt: d.created_at,
    returnRecords,
    payments,
  };
};

const mapHistory = (docs: RecordsDocument[]): StatusHistory[] =>
  docs.flatMap((d) =>
    (d.history || []).map((h: any) => ({
      id: h.id,
      documentId: h.document_id,
      oldStatus: (h.old_status || null) as WorkflowStatus | null,
      newStatus: h.new_status as WorkflowStatus,
      reason: h.reason || '',
      changedBy: h.changed_by_name || '',
      changedAt: h.changed_at,
    }))
  );

const getCategory = (d: DocumentRecord): Category => {
  if (d.status === 'Approved') return 'Approved';
  if (d.status === 'Rejected') return 'Rejected';
  return d.documentType === 'quotation' ? 'Quotation' : 'Invoice';
};

const statusLabel = (tr: RbTranslations, s: WorkflowStatus): string => {
  if (s === 'Approved') return tr.statusApproved;
  if (s === 'Rejected') return tr.statusRejected;
  return tr.statusPending;
};

const catLabel = (tr: RbTranslations, c: Category): string => {
  if (c === 'Quotation') return tr.docQuotation;
  if (c === 'Invoice') return tr.docInvoice;
  if (c === 'Approved') return tr.statusApproved;
  return tr.statusRejected;
};

const payLabel = (tr: RbTranslations, s: PaymentStatus): string => {
  if (s === 'Paid') return tr.payPaid;
  if (s === 'Partially Paid') return tr.payPartial;
  return tr.payUnpaid;
};

const methodLabel = (tr: RbTranslations, m: PaymentMethod | ''): string => {
  if (m === 'Cash') return tr.methodCash;
  if (m === 'Bank Transfer') return tr.methodBank;
  if (m === 'Card') return tr.methodCard;
  if (m === 'Other') return tr.methodOther;
  return '';
};

const supportsPayment = (record: DocumentRecord): boolean => {
  if (record.documentType === 'invoice') return true;
  return record.documentType === 'quotation' && record.status === 'Approved';
};

const sumPayments = (record: DocumentRecord): number =>
  roundMoney((record.payments || []).reduce((s, p) => s + p.amount, 0));

/**
 * Minimum payment required to approve a record.
 *  - nothing paid yet  -> at least 1 (or the whole remaining if smaller)
 *  - already paid some -> no extra minimum
 */
const MIN_APPROVE_PAYMENT = 1;
const getMinApprovePayment = (paidBefore: number, remaining: number): number => {
  if (paidBefore > 0) return 0;
  return roundMoney(Math.min(MIN_APPROVE_PAYMENT, remaining));
};

const getReturnedQty = (record: DocumentRecord, lineId: string): number =>
  (record.returnRecords || []).reduce((sum, r) => {
    const found = r.items.find((it) => it.lineId === lineId);
    return sum + (found ? found.returnQty : 0);
  }, 0);

/**
 * Per-line discount (amount + percentage).
 *  - line discountValue > 0 wins
 *  - otherwise fall back to record.discountTotal split by line share
 */
const getLineDiscount = (
  record: DocumentRecord,
  line: DocumentLine
): { amount: number; pct: number; label: string } => {
  if (line.discountValue && line.discountValue > 0) {
    const gross = roundMoney(line.unitPrice * line.quantity);
    let amount = 0;
    let pct = 0;
    if (line.discountType === 'percentage') {
      pct = line.discountValue;
      amount = roundMoney((gross * pct) / 100);
    } else {
      amount = roundMoney(line.discountValue);
      pct = gross > 0 ? roundMoney((amount / gross) * 100) : 0;
    }
    return {
      amount,
      pct,
      label: pct > 0 ? `${roundMoney(pct)}% (-${formatMoney(amount)})` : `-${formatMoney(amount)}`,
    };
  }

  if (record.discountTotal && record.discountTotal > 0 && record.subtotal > 0) {
    const share = line.lineTotal / record.subtotal;
    const amount = roundMoney(record.discountTotal * share);
    const gross = roundMoney(line.unitPrice * line.quantity);
    const pct = gross > 0 ? roundMoney((amount / gross) * 100) : 0;
    return {
      amount,
      pct,
      label: pct > 0 ? `${roundMoney(pct)}% (-${formatMoney(amount)})` : `-${formatMoney(amount)}`,
    };
  }

  return { amount: 0, pct: 0, label: '—' };
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

const RbIcons = {
  search: (
    <svg {...svgBase} className="w-4 h-4">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
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
  eye: (
    <svg {...svgBase} className="w-3 h-3">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  ),
  print: (
    <svg {...svgBase} className="w-3 h-3">
      <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  ),
  quotation: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8M9 22v-4M15 22v-4" />
    </svg>
  ),
  invoice: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  ),
  checkCircle: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="M22 4 12 14.01l-3-3" />
    </svg>
  ),
  reject: (
    <svg {...svgBase} className="w-4 h-4">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6M9 9l6 6" />
    </svg>
  ),
  clock: (
    <svg {...svgBase} className="w-4 h-4">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
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
  chevronLeft: (
    <svg {...svgBase} strokeWidth={2.5} className="w-3 h-3">
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),
  chevronRight: (
    <svg {...svgBase} strokeWidth={2.5} className="w-3 h-3">
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  history: (
    <svg {...svgBase} className="w-3 h-3">
      <path d="M3 3v5h5M3.05 13A9 9 0 1 0 6 5.3L3 8" />
      <path d="M12 7v5l4 2" />
    </svg>
  ),
  return: (
    <svg {...svgBase} className="w-3 h-3">
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
    </svg>
  ),
  external: (
    <svg {...svgBase} className="w-3 h-3">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6M10 14 21 3" />
    </svg>
  ),
  printer: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  ),
  money: (
    <svg {...svgBase} className="w-3 h-3">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ),
  plus: (
    <svg {...svgBase} strokeWidth={2.5} className="w-3 h-3">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
};

// ============================================================
// STYLES
// ============================================================
const STATUS = {
  quotation: {
    badgeBg: '#0284c7',
    badgeText: '#FFFFFF',
    headerBg: 'rgba(2, 132, 199, 0.08)',
    headerText: '#075985',
    dot: '#0284c7',
  },
  invoice: {
    badgeBg: THEME.mutedOlive,
    badgeText: THEME.warmIvory,
    headerBg: `${THEME.mutedOlive}1F`,
    headerText: THEME.charcoal,
    dot: THEME.mutedOlive,
  },
  approved: {
    badgeBg: '#16a34a',
    badgeText: '#FFFFFF',
    headerBg: 'rgba(22, 163, 74, 0.08)',
    headerText: '#15803d',
    dot: '#16a34a',
  },
  rejected: {
    badgeBg: '#dc2626',
    badgeText: '#FFFFFF',
    headerBg: 'rgba(220, 38, 38, 0.08)',
    headerText: '#b91c1c',
    dot: '#dc2626',
  },
};

const ACTION = {
  default: {
    background: THEME.warmIvory,
    color: THEME.deepForest,
    border: `1px solid ${THEME.mutedOlive}60`,
  },
  success: {
    background: '#dcfce7',
    color: '#15803d',
    border: '1px solid #86efac',
  },
  danger: {
    background: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fca5a5',
  },
  warn: {
    background: THEME.warmIvory,
    color: THEME.warmBrass,
    border: `1px solid ${THEME.warmBrass}`,
  },
};

const ROW_BG = 'rgba(18, 60, 50, 0.10)';
const ROW_BG_HOVER = 'rgba(18, 60, 50, 0.18)';
const ROW_BORDER = 'rgba(18, 60, 50, 0.18)';
const SOFT_BG = 'rgba(18, 60, 50, 0.06)';
const CARD_BORDER = `1px solid ${THEME.mutedOlive}30`;
const CARD_STYLE: React.CSSProperties = {
  background: '#FFFFFF',
  border: CARD_BORDER,
};
const INPUT_STYLE: React.CSSProperties = {
  background: THEME.warmIvory,
  borderColor: `${THEME.mutedOlive}40`,
  color: THEME.charcoal,
};
const SHADOW = '0 4px 12px rgba(37,42,40,0.15)';

const rbLabelCls = 'block text-[9px] font-bold mb-1 uppercase tracking-wider';
const rbInputCls =
  'w-full h-9 px-3 rounded-full border-2 text-[13px] placeholder:text-[#66745A]/60 focus:outline-none transition-all';
const rbTextareaCls =
  'w-full px-3 py-2 rounded-xl border-2 text-[13px] placeholder:text-[#66745A]/60 focus:outline-none transition-all resize-none';

const ALIGN = {
  start: 'text-start',
  end: 'text-end',
  center: 'text-center',
} as const;

function Th({
  label,
  align = 'start',
  w = '',
  px = 'px-3',
  extra = '',
}: {
  label: string;
  align?: keyof typeof ALIGN;
  w?: string;
  px?: string;
  extra?: string;
}): React.JSX.Element {
  return (
    <th
      className={`${ALIGN[align]} text-[9px] font-bold uppercase tracking-wider ${px} py-2 ${w} ${extra}`}
      style={{ color: THEME.mutedOlive }}
    >
      {label}
    </th>
  );
}

function SectionTitle({
  children,
  color = THEME.mutedOlive,
}: {
  children: React.ReactNode;
  color?: string;
}): React.JSX.Element {
  return (
    <h3
      className="text-[9px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
      style={{ color }}
    >
      {children}
    </h3>
  );
}

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
  headerRight,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  z?: 'z-50' | 'z-[60]' | 'z-[70]';
  headerRight?: React.ReactNode;
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
  const lang = getStoredLanguage();
  return (
    <div
      className={`fixed inset-0 ${z} flex items-center justify-center p-4`}
      style={{ background: `${THEME.charcoal}80`, backdropFilter: 'blur(4px)' }}
      dir={isRTLLang(lang) ? 'rtl' : 'ltr'}
      lang={lang}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`rounded-2xl w-full ${maxWidth} max-h-[92vh] flex flex-col shadow-xl`}
        style={{ background: THEME.warmIvory }}
      >
        <div
          className="flex items-start justify-between gap-3 px-5 pt-5 pb-3"
          style={{ borderBottom: `1px solid ${THEME.mutedOlive}30` }}
        >
          <div className="min-w-0">
            <h2 className="text-sm font-bold" style={{ color: THEME.deepForest }}>
              {title}
            </h2>
            {subtitle && (
              <p className="text-[11px] mt-0.5" style={{ color: THEME.mutedOlive }}>
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {headerRight}
            <button
              onClick={onClose}
              aria-label={rbT[lang].close}
              className="w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center cursor-pointer transition"
              style={{
                background: `${THEME.mutedOlive}20`,
                color: THEME.mutedOlive,
              }}
            >
              {RbIcons.x}
            </button>
          </div>
        </div>
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ============================================================
// PRINT FORMAT PICKER MODAL
// ============================================================
function PrintFormatPickerModal({
  record,
  tr,
  isRTL,
  onConfirm,
  onCancel,
}: {
  record: DocumentRecord;
  tr: RbTranslations;
  isRTL: boolean;
  onConfirm: (format: PrintFormat) => void;
  onCancel: () => void;
}): React.JSX.Element {
  const [selected, setSelected] = useState<PrintFormat>(() =>
    resolveInitialPrintFormat()
  );
  const lastUsed = useMemo(() => {
    try {
      const raw = localStorage.getItem('zakhira_last_print_format');
      if (
        raw === 'A4' ||
        raw === 'A5' ||
        raw === 'thermal80' ||
        raw === 'thermal58'
      ) {
        return raw as PrintFormat;
      }
    } catch {
      /* ignore */
    }
    return null;
  }, []);
  const defaultFormat = useMemo(() => loadDefaultPrintFormat(), []);

  return (
    <Modal
      title={tr.printFormatTitle}
      subtitle={tr.printFormatSubtitle(record.orderNumber)}
      onClose={onCancel}
      maxWidth="max-w-md"
      z="z-[70]"
    >
      <div className="space-y-3">
        <div className="space-y-1.5">
          {PRINT_FORMAT_LIST.map((f) => {
            const active = selected === f.id;
            const isDefault = defaultFormat === f.id;
            const isLast = lastUsed === f.id && !isDefault;
            return (
              <label
                key={f.id}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all"
                style={{
                  backgroundColor: active
                    ? 'rgba(196,154,90,0.12)'
                    : 'rgba(247,243,234,0.6)',
                  borderColor: active ? THEME.warmBrass : `${THEME.mutedOlive}25`,
                }}
              >
                <input
                  type="radio"
                  name="printFormatSelect"
                  checked={active}
                  onChange={() => setSelected(f.id)}
                  className="w-4 h-4 cursor-pointer"
                  style={{ accentColor: THEME.warmBrass }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p
                      className="text-[12px] font-bold"
                      style={{ color: THEME.charcoal }}
                    >
                      {f.label}
                    </p>
                    {isDefault && (
                      <span
                        className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: THEME.warmBrass,
                          color: THEME.warmIvory,
                        }}
                      >
                        {tr.printFormatDefaultTag}
                      </span>
                    )}
                    {isLast && (
                      <span
                        className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${THEME.deepForest}20`,
                          color: THEME.deepForest,
                        }}
                      >
                        {tr.printFormatLastTag}
                      </span>
                    )}
                  </div>
                  <p
                    className="text-[10px] mt-0.5"
                    style={{ color: THEME.mutedOlive }}
                  >
                    {f.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>

        <div
          className="flex gap-2 pt-3"
          style={{ borderTop: `1px solid ${THEME.mutedOlive}30` }}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <button
            onClick={onCancel}
            className="flex-1 h-9 rounded-full text-[13px] font-bold cursor-pointer transition-all"
            style={{
              background: 'transparent',
              border: `2px solid ${THEME.mutedOlive}40`,
              color: THEME.mutedOlive,
            }}
          >
            {tr.printFormatCancel}
          </button>
          <button
            onClick={() => onConfirm(selected)}
            className="flex-1 h-9 rounded-full text-[13px] font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
            style={{
              background: THEME.warmBrass,
              color: THEME.warmIvory,
              boxShadow: '0 4px 12px rgba(196,154,90,0.35)',
            }}
          >
            {RbIcons.printer}
            <span>{tr.printFormatPrint}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================
// PAYMENT METHOD RADIO GROUP (shared by approve + add payment)
// ============================================================
function PaymentMethodPicker({
  name,
  value,
  onChange,
  tr,
}: {
  name: string;
  value: PaymentMethod;
  onChange: (m: PaymentMethod) => void;
  tr: RbTranslations;
}): React.JSX.Element {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1">
      {(['Cash', 'Bank Transfer', 'Card', 'Other'] as PaymentMethod[]).map((m) => {
        const active = value === m;
        const label =
          m === 'Cash'
            ? tr.methodCash
            : m === 'Bank Transfer'
              ? tr.methodBank
              : m === 'Card'
                ? tr.methodCard
                : tr.methodOther;
        return (
          <label
            key={m}
            className="flex cursor-pointer items-center gap-1.5 text-[11px]"
            style={{ color: THEME.charcoal }}
          >
            <input
              type="radio"
              name={name}
              checked={active}
              onChange={() => onChange(m)}
              className="sr-only"
            />
            <span
              className="flex h-3.5 w-3.5 items-center justify-center rounded-full border"
              style={{
                borderColor: active ? THEME.deepForest : `${THEME.mutedOlive}60`,
              }}
            >
              {active && (
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: THEME.deepForest }}
                />
              )}
            </span>
            {label}
          </label>
        );
      })}
    </div>
  );
}

// ============================================================
// APPROVE WITH PAYMENT MODAL
// ============================================================
function ApprovePaymentModal({
  record,
  tr,
  busy,
  onClose,
  onConfirm,
}: {
  record: DocumentRecord;
  tr: RbTranslations;
  busy: boolean;
  onClose: () => void;
  onConfirm: (data: {
    amount: number;
    method: PaymentMethod;
    note?: string;
  }) => void;
}): React.JSX.Element {
  const paidBefore = sumPayments(record);
  const remaining = roundMoney(Math.max(0, record.grandTotal - paidBefore));
  const minRequired = getMinApprovePayment(paidBefore, remaining);

  const [amount, setAmount] = useState<number | ''>(0);
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');

  const amt = amount === '' ? 0 : Number(amount);
  const balance = roundMoney(Math.max(0, remaining - amt));
  const belowMin = minRequired > 0 && (Number.isNaN(amt) || amt < minRequired);

  const handleSubmit = () => {
    const value = amount === '' ? 0 : Number(amount);
    if (Number.isNaN(value) || value < 0 || value > remaining) {
      setErr(tr.errAmountInvalid);
      return;
    }
    if (value < minRequired) {
      setErr(tr.errMinPayment);
      return;
    }
    onConfirm({
      amount: roundMoney(value),
      method,
      note: note.trim() || undefined,
    });
  };

  return (
    <Modal
      title={tr.approvePaymentTitle(record.orderNumber)}
      subtitle={tr.approvePaymentSubtitle}
      onClose={onClose}
      maxWidth="max-w-md"
      z="z-[60]"
    >
      <div className="space-y-3">
        <div
          className="rounded-xl p-3"
          style={{
            background: `${THEME.warmBrass}1A`,
            border: `2px solid ${THEME.warmBrass}60`,
          }}
        >
          <label className={rbLabelCls} style={{ color: THEME.deepForest }}>
            {tr.approveGrandTotal}
          </label>
          <p className="text-lg font-bold" style={{ color: THEME.warmBrass }}>
            {formatMoney(record.grandTotal)}
          </p>
          {paidBefore > 0 && (
            <p className="text-[11px] mt-1 font-semibold" style={{ color: THEME.mutedOlive }}>
              {tr.totalPaid}: {formatMoney(paidBefore)} · {tr.balanceDue}: {formatMoney(remaining)}
            </p>
          )}
        </div>

        <div>
          <label className={rbLabelCls} style={{ color: THEME.deepForest }}>
            {tr.amountReceived} <span style={{ color: THEME.warmBrass }}>*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min={minRequired}
              max={remaining}
              step="0.01"
              value={amount}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : Number(e.target.value);
                setAmount(val);
                setErr('');
              }}
              className={`${rbInputCls} font-bold`}
              style={{ ...INPUT_STYLE, paddingInlineEnd: 64 }}
            />
            <button
              type="button"
              onClick={() => {
                setAmount(remaining);
                setErr('');
              }}
              className="absolute top-1/2 -translate-y-1/2 end-1.5 h-6 px-3 rounded-full text-[10px] font-bold cursor-pointer transition hover:brightness-95"
              style={{
                background: THEME.warmBrass,
                color: THEME.warmIvory,
              }}
            >
              {tr.fullBtn}
            </button>
          </div>
          {minRequired > 0 && (
            <p
              className="text-[10px] mt-1 font-semibold"
              style={{ color: belowMin ? '#b91c1c' : THEME.mutedOlive }}
            >
              {tr.errMinPayment}
            </p>
          )}
        </div>

        <div>
          <label className={rbLabelCls} style={{ color: THEME.deepForest }}>
            {tr.balanceDue}
          </label>
          <div
            className={`${rbInputCls} flex items-center font-bold`}
            style={{
              background: SOFT_BG,
              borderColor: `${THEME.mutedOlive}40`,
              color: balance > 0 ? '#dc2626' : '#15803d',
              cursor: 'default',
            }}
          >
            {formatMoney(balance)}
          </div>
        </div>

        <div>
          <label className={rbLabelCls} style={{ color: THEME.deepForest }}>
            {tr.paymentMethodLabel}
          </label>
          <PaymentMethodPicker name="approvePaymentMethod" value={method} onChange={setMethod} tr={tr} />
        </div>

        <div>
          <label className={rbLabelCls} style={{ color: THEME.deepForest }}>
            {tr.paymentNote}
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={tr.paymentNotePh}
            className={rbInputCls}
            style={INPUT_STYLE}
          />
        </div>

        {err && (
          <div
            className="p-2.5 rounded-xl text-[11px] font-bold flex items-center gap-2"
            style={{
              background: '#fee2e2',
              border: '2px solid #fca5a5',
              color: '#b91c1c',
            }}
          >
            {RbIcons.alert}
            <span>{err}</span>
          </div>
        )}

        <div
          className="flex gap-2 pt-3"
          style={{ borderTop: `1px solid ${THEME.mutedOlive}30` }}
        >
          <button
            onClick={onClose}
            disabled={busy}
            className="flex-1 h-9 rounded-full text-[13px] font-bold cursor-pointer transition-all disabled:opacity-50"
            style={{
              background: 'transparent',
              border: `2px solid ${THEME.mutedOlive}40`,
              color: THEME.mutedOlive,
            }}
          >
            {tr.cancel}
          </button>
          <button
            onClick={handleSubmit}
            disabled={belowMin || busy}
            className="flex-1 h-9 rounded-full text-[13px] font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: '#16a34a',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
            }}
          >
            {RbIcons.check}
            <span>{tr.approveAndSave}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================
// ADD PAYMENT MODAL
// ============================================================
function AddPaymentModal({
  record,
  tr,
  busy,
  onClose,
  onSave,
}: {
  record: DocumentRecord;
  tr: RbTranslations;
  busy: boolean;
  onClose: () => void;
  onSave: (data: { amount: number; method: PaymentMethod; note?: string }) => void;
}): React.JSX.Element {
  const [amount, setAmount] = useState<number | ''>(record.balanceDue);
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');

  const handleSubmit = () => {
    const amt = amount === '' ? 0 : Number(amount);
    if (amt <= 0) {
      setErr(tr.errAmountRequired);
      return;
    }
    if (amt > record.balanceDue) {
      setErr(tr.errAmountTooHigh);
      return;
    }
    onSave({ amount: roundMoney(amt), method, note: note.trim() || undefined });
  };

  return (
    <Modal
      title={tr.addPaymentTitle(record.orderNumber)}
      subtitle={`${tr.balanceDue}: ${formatMoney(record.balanceDue)}`}
      onClose={onClose}
      maxWidth="max-w-md"
      z="z-[60]"
    >
      <div className="space-y-3">
        <div>
          <label className={rbLabelCls} style={{ color: THEME.deepForest }}>
            {tr.amountReceived} <span style={{ color: THEME.warmBrass }}>*</span>
          </label>
          <input
            type="number"
            min="0"
            max={record.balanceDue}
            step="0.01"
            value={amount}
            onChange={(e) => {
              const val = e.target.value === '' ? '' : Number(e.target.value);
              setAmount(val);
              setErr('');
            }}
            className={`${rbInputCls} font-bold`}
            style={INPUT_STYLE}
          />
        </div>

        <div>
          <label className={rbLabelCls} style={{ color: THEME.deepForest }}>
            {tr.paymentMethodLabel}
          </label>
          <PaymentMethodPicker name="addPaymentMethod" value={method} onChange={setMethod} tr={tr} />
        </div>

        <div>
          <label className={rbLabelCls} style={{ color: THEME.deepForest }}>
            {tr.paymentNote}
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={tr.paymentNotePh}
            className={rbInputCls}
            style={INPUT_STYLE}
          />
        </div>

        {err && (
          <div
            className="p-2.5 rounded-xl text-[11px] font-bold flex items-center gap-2"
            style={{
              background: '#fee2e2',
              border: '2px solid #fca5a5',
              color: '#b91c1c',
            }}
          >
            {RbIcons.alert}
            <span>{err}</span>
          </div>
        )}

        <div className="flex gap-2 pt-3" style={{ borderTop: `1px solid ${THEME.mutedOlive}30` }}>
          <button
            onClick={onClose}
            disabled={busy}
            className="flex-1 h-9 rounded-full text-[13px] font-bold cursor-pointer transition-all disabled:opacity-50"
            style={{
              background: 'transparent',
              border: `2px solid ${THEME.mutedOlive}40`,
              color: THEME.mutedOlive,
            }}
          >
            {tr.cancel}
          </button>
          <button
            onClick={handleSubmit}
            disabled={busy}
            className="flex-1 h-9 rounded-full text-[13px] font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            style={{
              background: THEME.warmBrass,
              color: THEME.warmIvory,
              boxShadow: '0 4px 12px rgba(196,154,90,0.35)',
            }}
          >
            {RbIcons.money}
            <span>{tr.confirmPayment}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================
// CONFIRM MODAL
// ============================================================
function ConfirmModal({
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger = false,
  reasonLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  reasonLabel?: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}): React.JSX.Element {
  const [reason, setReason] = useState('');
  return (
    <Modal title={title} onClose={onCancel} maxWidth="max-w-sm" z="z-[60]">
      <p className="text-[13px] mb-3" style={{ color: THEME.mutedOlive }}>
        {message}
      </p>
      {reasonLabel && (
        <div className="mb-3">
          <label className={rbLabelCls} style={{ color: THEME.deepForest }}>
            {reasonLabel}
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className={rbTextareaCls}
            style={INPUT_STYLE}
          />
        </div>
      )}
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 h-9 rounded-full text-[13px] font-bold cursor-pointer transition-all"
          style={{
            background: 'transparent',
            border: `2px solid ${THEME.mutedOlive}40`,
            color: THEME.mutedOlive,
          }}
        >
          {cancelLabel}
        </button>
        <button
          onClick={() => onConfirm(reason)}
          className="flex-1 h-9 rounded-full text-[13px] font-bold cursor-pointer transition-all"
          style={{
            background: danger ? '#dc2626' : THEME.warmBrass,
            color: THEME.warmIvory,
            boxShadow: danger
              ? '0 4px 12px rgba(220,38,38,0.3)'
              : '0 4px 12px rgba(196,154,90,0.35)',
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

// ============================================================
// ORIGINAL INVOICE PREVIEW MODAL
// ============================================================
function OriginalInvoicePreviewModal({
  record,
  tr,
  onClose,
}: {
  record: DocumentRecord;
  tr: RbTranslations;
  onClose: () => void;
}): React.JSX.Element {
  return (
    <Modal
      title={`${tr.originalInvoice} — ${record.orderNumber}`}
      subtitle={`${tr.issuedOn} ${formatDate(record.issueDate)}`}
      onClose={onClose}
      maxWidth="max-w-2xl"
      z="z-[70]"
    >
      <div className="space-y-3">
        <div className="rounded-xl p-3" style={CARD_STYLE}>
          <SectionTitle>{tr.billTo}</SectionTitle>
          <p className="text-[13px] font-bold" style={{ color: THEME.charcoal }}>
            {record.customerSnapshot.name}
          </p>
          {record.customerSnapshot.company && (
            <p className="text-[10px]" style={{ color: THEME.mutedOlive }}>
              {record.customerSnapshot.company}
            </p>
          )}
          <p
            className="text-[11px] font-mono mt-1"
            dir="ltr"
            style={{ color: THEME.mutedOlive }}
          >
            {record.customerSnapshot.phone}
          </p>
        </div>

        <div>
          <SectionTitle>{tr.products}</SectionTitle>
          <div className="rounded-xl overflow-hidden" style={{ border: CARD_BORDER }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: SOFT_BG }}>
                  <Th label={tr.colProduct} />
                  <Th label={tr.colPrice} align="end" w="w-24" />
                  <Th label={tr.colQty} align="center" w="w-20" />
                  <Th label={tr.colTotal} align="end" w="w-28" />
                </tr>
              </thead>
              <tbody>
                {record.lines.map((l) => (
                  <tr key={l.id} style={{ borderTop: `1px solid ${THEME.mutedOlive}20` }}>
                    <td className="px-3 py-1.5 text-[12px] font-semibold" style={{ color: THEME.charcoal }}>
                      {l.material}
                    </td>
                    <td className="px-3 py-1.5 text-end text-[12px]" style={{ color: THEME.mutedOlive }}>
                      {formatMoney(l.unitPrice)}
                    </td>
                    <td className="px-3 py-1.5 text-center text-[12px]" style={{ color: THEME.charcoal, fontWeight: 600 }}>
                      {l.quantity}
                    </td>
                    <td className="px-3 py-1.5 text-end text-[12px] font-bold" style={{ color: THEME.charcoal }}>
                      {formatMoney(l.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl p-3 text-[11px] space-y-1" style={CARD_STYLE}>
          <div className="flex justify-between">
            <span style={{ color: THEME.mutedOlive }}>{tr.subtotal}</span>
            <span style={{ color: THEME.charcoal }}>{formatMoney(record.subtotal)}</span>
          </div>
          {record.discountTotal > 0 && (
            <div className="flex justify-between">
              <span style={{ color: THEME.mutedOlive }}>{tr.discount}</span>
              <span style={{ color: THEME.charcoal }}>-{formatMoney(record.discountTotal)}</span>
            </div>
          )}
          {record.taxTotal > 0 && (
            <div className="flex justify-between">
              <span style={{ color: THEME.mutedOlive }}>
                {tr.vat} ({record.vatRate}%)
              </span>
              <span style={{ color: THEME.charcoal }}>{formatMoney(record.taxTotal)}</span>
            </div>
          )}
          <div className="flex justify-between pt-1.5" style={{ borderTop: `1px solid ${THEME.mutedOlive}30` }}>
            <span className="font-bold text-[13px]" style={{ color: THEME.deepForest }}>
              {tr.grandTotal}
            </span>
            <span className="font-bold text-[13px]" style={{ color: THEME.warmBrass }}>
              {formatMoney(record.grandTotal)}
            </span>
          </div>
        </div>

        {record.notes && (
          <div>
            <SectionTitle>{tr.notes}</SectionTitle>
            <div className="rounded-xl p-2.5 text-[11px]" style={{ ...CARD_STYLE, color: THEME.charcoal }}>
              {record.notes}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ============================================================
// RETURN MODAL
// ============================================================
function ReturnModal({
  record,
  tr,
  busy,
  onClose,
  onSubmit,
}: {
  record: DocumentRecord;
  tr: RbTranslations;
  busy: boolean;
  onClose: () => void;
  onSubmit: (data: {
    reason: string;
    date: string;
    notes: string;
    items: ReturnItem[];
    subtotal: number;
    taxTotal: number;
    totalReturnAmount: number;
  }) => void;
}): React.JSX.Element {
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(() => todayISO());
  const [notes, setNotes] = useState('');
  const [err, setErr] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const availableQty = useMemo(() => {
    const m: Record<string, number> = {};
    record.lines.forEach((l) => {
      const already = getReturnedQty(record, l.id);
      m[l.id] = Math.max(0, l.quantity - already);
    });
    return m;
  }, [record]);

  const [returnQtys, setReturnQtys] = useState<Record<string, number>>(() => {
    const m: Record<string, number> = {};
    record.lines.forEach((l) => {
      m[l.id] = 0;
    });
    return m;
  });

  const updateQty = (lineId: string, value: number): void => {
    const max = availableQty[lineId] || 0;
    const clean = Math.max(0, Math.min(max, Math.floor(value) || 0));
    setReturnQtys((prev) => ({ ...prev, [lineId]: clean }));
    setErr('');
  };

  const returnItems: ReturnItem[] = record.lines.map((l) => {
    const returnQty = returnQtys[l.id] || 0;
    const originalQty = l.quantity || 1;

    const lineGrossPaid =
      record.subtotal > 0
        ? (l.lineTotal / record.subtotal) * record.grandTotal
        : l.lineTotal;

    const perUnitPaid = lineGrossPaid / originalQty;
    const totalAmount = roundMoney(perUnitPaid * returnQty);

    const taxRatio = record.grandTotal > 0 ? record.subtotal / record.grandTotal : 1;
    const subtotal = roundMoney(totalAmount * taxRatio);
    const taxAmount = roundMoney(totalAmount - subtotal);

    return {
      lineId: l.id,
      productName: l.material,
      price: roundMoney(perUnitPaid),
      originalQty: l.quantity,
      returnQty,
      subtotal,
      taxAmount,
      totalAmount,
    };
  });

  const subtotalTotal = roundMoney(returnItems.reduce((s, it) => s + it.subtotal, 0));
  const taxTotal = roundMoney(returnItems.reduce((s, it) => s + it.taxAmount, 0));
  const totalReturnAmount = roundMoney(subtotalTotal + taxTotal);

  const submit = (): void => {
    if (!reason.trim()) {
      setErr(tr.errReasonRequired);
      return;
    }
    const activeItems = returnItems.filter((it) => it.returnQty > 0);
    if (activeItems.length === 0) {
      setErr(tr.errNoItems);
      return;
    }
    if (totalReturnAmount <= 0) {
      setErr(tr.errNoItems);
      return;
    }
    onSubmit({
      reason: reason.trim(),
      date,
      notes: notes.trim(),
      items: activeItems,
      subtotal: subtotalTotal,
      taxTotal,
      totalReturnAmount,
    });
  };

  return (
    <>
      <Modal
        title={tr.returnTitle}
        subtitle={tr.returnSubtitle(record.orderNumber)}
        onClose={onClose}
        maxWidth="max-w-3xl"
        z="z-[60]"
        headerRight={
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            title={tr.previewBtn}
            className="h-7 px-2.5 rounded-full flex items-center gap-1 text-[10px] font-bold cursor-pointer transition"
            style={{
              background: `${THEME.warmBrass}20`,
              color: THEME.warmBrass,
              border: `1px solid ${THEME.warmBrass}60`,
            }}
          >
            {RbIcons.eye}
            <span>{tr.previewBtn}</span>
          </button>
        }
      >
        <div className="space-y-3.5">
          <div>
            <label className={rbLabelCls} style={{ color: THEME.deepForest }}>
              {tr.productsFromInvoice}
            </label>
            <div className="rounded-xl overflow-hidden" style={{ border: CARD_BORDER }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: SOFT_BG, borderBottom: `1px solid ${THEME.mutedOlive}30` }}>
                      <Th label={tr.colProduct} px="px-2.5" />
                      <Th label={tr.colPrice} align="end" w="w-24" px="px-2.5" />
                      <Th label={tr.colOrigQty} align="center" w="w-20" px="px-2.5" />
                      <Th label={tr.colReturned} align="center" w="w-20" px="px-2.5" />
                      <Th label={tr.colAvailable} align="center" w="w-20" px="px-2.5" />
                      <Th label={tr.colReturnQty} align="center" w="w-24" px="px-2.5" />
                      <Th label={tr.colSubtotal} align="end" w="w-28" px="px-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {record.lines.map((l) => {
                      const rQty = returnQtys[l.id] || 0;
                      const sub = roundMoney(l.unitPrice * rQty);
                      const already = getReturnedQty(record, l.id);
                      const avail = availableQty[l.id] || 0;
                      return (
                        <tr
                          key={l.id}
                          style={{
                            borderTop: `1px solid ${THEME.mutedOlive}20`,
                            background: rQty > 0 ? `${THEME.warmBrass}12` : 'transparent',
                          }}
                        >
                          <td className="px-2.5 py-1.5 text-[12px] font-semibold" style={{ color: THEME.charcoal }}>
                            {l.material}
                          </td>
                          <td className="px-2.5 py-1.5 text-end text-[12px]" style={{ color: THEME.mutedOlive }}>
                            {formatMoney(l.unitPrice)}
                          </td>
                          <td className="px-2.5 py-1.5 text-center text-[12px] font-semibold" style={{ color: THEME.mutedOlive }}>
                            {l.quantity}
                          </td>
                          <td className="px-2.5 py-1.5 text-center text-[12px] font-semibold" style={{ color: already > 0 ? THEME.warmBrass : THEME.mutedOlive }}>
                            {already}
                          </td>
                          <td className="px-2.5 py-1.5 text-center text-[12px] font-bold" style={{ color: avail > 0 ? THEME.deepForest : '#dc2626' }}>
                            {avail}
                          </td>
                          <td className="px-2.5 py-1.5 text-center">
                            <input
                              type="number"
                              min={0}
                              max={avail}
                              step={1}
                              value={rQty}
                              disabled={avail === 0}
                              onChange={(e) => updateQty(l.id, Number(e.target.value))}
                              className="w-16 h-8 px-2 rounded-full text-[12px] text-center font-bold focus:outline-none transition-all mx-auto disabled:opacity-40"
                              style={{
                                background: THEME.warmIvory,
                                border: `2px solid ${rQty > 0 ? THEME.warmBrass : `${THEME.mutedOlive}40`}`,
                                color: THEME.charcoal,
                              }}
                            />
                          </td>
                          <td
                            className="px-2.5 py-1.5 text-end text-[12px] font-bold"
                            style={{ color: sub > 0 ? THEME.warmBrass : THEME.mutedOlive }}
                          >
                            {formatMoney(sub)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div
            className="rounded-xl p-3 space-y-1"
            style={{ background: `${THEME.warmBrass}1F`, border: `2px solid ${THEME.warmBrass}60` }}
          >
            <div className="flex justify-between text-[11px]">
              <span style={{ color: THEME.mutedOlive }}>{tr.subtotal}</span>
              <span style={{ color: THEME.charcoal }}>{formatMoney(subtotalTotal)}</span>
            </div>
            {taxTotal > 0 && (
              <div className="flex justify-between text-[11px]">
                <span style={{ color: THEME.mutedOlive }}>
                  {tr.vat} ({record.vatRate}%)
                </span>
                <span style={{ color: THEME.charcoal }}>{formatMoney(taxTotal)}</span>
              </div>
            )}
            <div
              className="flex justify-between items-center pt-1.5"
              style={{ borderTop: `1px solid ${THEME.warmBrass}60` }}
            >
              <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: THEME.deepForest }}>
                {tr.totalReturnAmount}
              </span>
              <span className="text-lg font-bold" style={{ color: THEME.warmBrass }}>
                {formatMoney(totalReturnAmount)}
              </span>
            </div>
          </div>

          <div>
            <label className={rbLabelCls} style={{ color: THEME.deepForest }}>
              {tr.returnReason} <span style={{ color: THEME.warmBrass }}>*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setErr('');
              }}
              rows={2}
              maxLength={255}
              placeholder={tr.returnReasonPh}
              className={rbTextareaCls}
              style={INPUT_STYLE}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={rbLabelCls} style={{ color: THEME.deepForest }}>
                {tr.returnDate}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={rbInputCls}
                style={INPUT_STYLE}
              />
            </div>
            <div>
              <label className={rbLabelCls} style={{ color: THEME.deepForest }}>
                {tr.returnNotes}
              </label>
              <input
                type="text"
                value={notes}
                maxLength={255}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={tr.returnNotesPh}
                className={rbInputCls}
                style={INPUT_STYLE}
              />
            </div>
          </div>

          {err && (
            <div
              className="p-2.5 rounded-xl text-[11px] font-bold flex items-center gap-2"
              style={{
                background: `${THEME.charcoal}10`,
                border: `2px solid ${THEME.charcoal}40`,
                color: THEME.charcoal,
              }}
            >
              {RbIcons.alert}
              <span>{err}</span>
            </div>
          )}

          <div className="flex gap-2.5 pt-3" style={{ borderTop: `1px solid ${THEME.mutedOlive}30` }}>
            <button
              onClick={submit}
              disabled={busy}
              className="h-9 px-4 rounded-full text-[13px] font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              style={{
                background: THEME.warmBrass,
                color: THEME.warmIvory,
                boxShadow: '0 4px 12px rgba(196,154,90,0.35)',
              }}
            >
              {RbIcons.return}
              <span>{tr.confirmReturn}</span>
            </button>
            <button
              onClick={onClose}
              disabled={busy}
              className="h-9 px-4 rounded-full text-[13px] font-bold cursor-pointer transition-all disabled:opacity-50"
              style={{
                background: 'transparent',
                border: `2px solid ${THEME.mutedOlive}40`,
                color: THEME.mutedOlive,
              }}
            >
              {tr.cancel}
            </button>
          </div>
        </div>
      </Modal>

      {showPreview && (
        <OriginalInvoicePreviewModal
          record={record}
          tr={tr}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}

// ============================================================
// RETURN DETAILS MODAL
// ============================================================
function ReturnDetailsModal({
  record,
  returnRecord,
  tr,
  onClose,
  onNavigateToAccounting,
}: {
  record: DocumentRecord;
  returnRecord: ReturnRecord;
  tr: RbTranslations;
  onClose: () => void;
  onNavigateToAccounting: (txnId: string) => void;
}): React.JSX.Element {
  return (
    <Modal
      title={tr.returnDetailsTitle(returnRecord.returnNumber)}
      subtitle={`${tr.returnFor} ${record.orderNumber} • ${formatDate(returnRecord.date)}`}
      onClose={onClose}
      maxWidth="max-w-2xl"
      z="z-[60]"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: THEME.charcoal, color: THEME.warmIvory }}
          >
            {RbIcons.return}
            {tr.returned}
          </span>
          <span className="text-[9px] uppercase tracking-wider font-bold" style={{ color: THEME.mutedOlive }}>
            {tr.itemsCount(returnRecord.items.length)}
          </span>
        </div>

        <div className="rounded-xl p-3" style={CARD_STYLE}>
          <SectionTitle>{tr.reason}</SectionTitle>
          <p className="text-[13px]" style={{ color: THEME.charcoal }}>
            {returnRecord.reason}
          </p>
          {returnRecord.notes && (
            <p className="text-[11px] mt-1.5" style={{ color: THEME.mutedOlive }}>
              {returnRecord.notes}
            </p>
          )}
        </div>

        <div>
          <SectionTitle>{tr.returnedItems}</SectionTitle>
          <div className="rounded-xl overflow-hidden" style={{ border: CARD_BORDER }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: SOFT_BG }}>
                  <Th label={tr.colProduct} />
                  <Th label={tr.colPrice} align="end" w="w-24" />
                  <Th label={tr.colReturnQty} align="center" w="w-20" />
                  <Th label={tr.colSubtotal} align="end" w="w-28" />
                </tr>
              </thead>
              <tbody>
                {returnRecord.items.map((it, idx) => (
                  <tr key={`${it.lineId}-${idx}`} style={{ borderTop: `1px solid ${THEME.mutedOlive}20` }}>
                    <td className="px-3 py-1.5 text-[12px] font-semibold" style={{ color: THEME.charcoal }}>
                      {it.productName}
                    </td>
                    <td className="px-3 py-1.5 text-end text-[12px]" style={{ color: THEME.mutedOlive }}>
                      {formatMoney(it.price)}
                    </td>
                    <td className="px-3 py-1.5 text-center text-[12px] font-bold" style={{ color: THEME.charcoal }}>
                      {it.returnQty}
                    </td>
                    <td className="px-3 py-1.5 text-end text-[12px] font-bold" style={{ color: THEME.warmBrass }}>
                      {formatMoney(it.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl p-3 space-y-2" style={CARD_STYLE}>
          {returnRecord.subtotal > 0 && (
            <div className="flex justify-between text-[11px]">
              <span style={{ color: THEME.mutedOlive }}>{tr.subtotal}</span>
              <span style={{ color: THEME.charcoal }}>{formatMoney(returnRecord.subtotal)}</span>
            </div>
          )}
          {returnRecord.taxTotal > 0 && (
            <div className="flex justify-between text-[11px]">
              <span style={{ color: THEME.mutedOlive }}>{tr.vat}</span>
              <span style={{ color: THEME.charcoal }}>{formatMoney(returnRecord.taxTotal)}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: THEME.deepForest }}>
              {tr.totalReturn}
            </span>
            <span className="text-lg font-bold" style={{ color: THEME.warmBrass }}>
              {formatMoney(returnRecord.totalReturnAmount)}
            </span>
          </div>
          {returnRecord.linkedTransactionId && (
            <div
              className="flex justify-between items-center pt-1.5"
              style={{ borderTop: `1px solid ${THEME.mutedOlive}30` }}
            >
              <span className="text-[11px]" style={{ color: THEME.mutedOlive }}>
                {tr.linkedTransaction}
              </span>
              <button
                type="button"
                onClick={() => onNavigateToAccounting(returnRecord.linkedTransactionId)}
                className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold cursor-pointer hover:underline transition"
                style={{ color: THEME.deepForest }}
              >
                <span dir="ltr">{returnRecord.linkedTransactionId}</span>
                {RbIcons.external}
              </button>
            </div>
          )}
        </div>

        <div className="text-[9px] text-center italic" style={{ color: THEME.mutedOlive }}>
          {tr.createdBy} {returnRecord.createdBy} • {formatDateTime(returnRecord.createdAt)}
        </div>
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
  tr,
  pageSize = PAGE_SIZE,
}: {
  page: number;
  total: number;
  onPage: (p: number) => void;
  tr: RbTranslations;
  pageSize?: number;
}): React.JSX.Element | null {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  const navBtnStyle: React.CSSProperties = {
    background: THEME.warmIvory,
    border: `1px solid ${THEME.mutedOlive}40`,
    color: THEME.mutedOlive,
  };

  return (
    <div
      className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-2"
      style={{ borderTop: `1px solid ${THEME.mutedOlive}30` }}
    >
      <p className="text-[11px]" style={{ color: THEME.mutedOlive }}>
        {tr.showing}{' '}
        <b style={{ color: THEME.charcoal }}>
          {from}–{to}
        </b>{' '}
        {tr.of} <b style={{ color: THEME.charcoal }}>{total}</b>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="w-7 h-7 rounded-full flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed"
          style={navBtnStyle}
        >
          <span className="inline-flex rtl:rotate-180">{RbIcons.chevronLeft}</span>
        </button>
        {Array.from({ length: pageCount }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1)
          .map((p, idx, arr) => (
            <span key={p} className="flex items-center gap-1">
              {idx > 0 && p - arr[idx - 1] > 1 && (
                <span className="text-[11px]" style={{ color: THEME.mutedOlive }}>
                  …
                </span>
              )}
              <button
                onClick={() => onPage(p)}
                className="min-w-7 h-7 px-2 rounded-full text-[11px] font-bold cursor-pointer transition"
                style={
                  p === page
                    ? { background: THEME.deepForest, color: THEME.warmIvory }
                    : {
                        background: THEME.warmIvory,
                        color: THEME.mutedOlive,
                        border: `1px solid ${THEME.mutedOlive}30`,
                      }
                }
              >
                {p}
              </button>
            </span>
          ))}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= pageCount}
          className="w-7 h-7 rounded-full flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed"
          style={navBtnStyle}
        >
          <span className="inline-flex rtl:rotate-180">{RbIcons.chevronRight}</span>
        </button>
      </div>
    </div>
  );
}

// ============================================================
// RECORD DETAILS MODAL
// ============================================================
function ReadOnlyField({
  label,
  value,
  ltr = false,
  style,
}: {
  label: string;
  value: string;
  ltr?: boolean;
  style?: React.CSSProperties;
}): React.JSX.Element {
  return (
    <div>
      <label className={rbLabelCls} style={{ color: THEME.deepForest }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        readOnly
        dir={ltr ? 'ltr' : undefined}
        className={rbInputCls}
        style={{ ...INPUT_STYLE, cursor: 'default', ...style }}
      />
    </div>
  );
}

function RecordDetailsModal({
  record,
  history,
  tr,
  onClose,
  onOpenReturn,
  onAddPayment,
}: {
  record: DocumentRecord;
  history: StatusHistory[];
  tr: RbTranslations;
  onClose: () => void;
  onOpenReturn: (ret: ReturnRecord) => void;
  onAddPayment: (record: DocumentRecord) => void;
}): React.JSX.Element {
  const recordHistory = history
    .filter((h) => h.documentId === record.id)
    .sort((a, b) => a.changedAt.localeCompare(b.changedAt));

  const cat = getCategory(record);
  const catStyle =
    cat === 'Quotation'
      ? STATUS.quotation
      : cat === 'Invoice'
        ? STATUS.invoice
        : cat === 'Approved'
          ? STATUS.approved
          : STATUS.rejected;
  const returns = record.returnRecords || [];
  const payments = record.payments || [];

  const paymentSupported = supportsPayment(record);
  const canAddPayment =
    paymentSupported && record.paymentStatus !== 'Paid' && record.balanceDue > 0;

  const discountPct =
    record.subtotal > 0 && record.discountTotal > 0
      ? roundMoney((record.discountTotal / record.subtotal) * 100)
      : 0;
  const hasDiscount = !!record.discountTotal && record.discountTotal > 0;

  return (
    <Modal
      title={record.orderNumber}
      subtitle={`${catLabel(tr, cat)} • ${formatDate(record.issueDate)}`}
      onClose={onClose}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: catStyle.badgeBg, color: catStyle.badgeText }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: THEME.warmIvory }} />
            {catLabel(tr, cat)}
          </span>
          <span className="text-[9px] uppercase tracking-wider font-bold" style={{ color: THEME.mutedOlive }}>
            {statusLabel(tr, record.status)}
          </span>
          {paymentSupported && (
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{
                background:
                  record.paymentStatus === 'Paid' ? '#dcfce7'
                  : record.paymentStatus === 'Partially Paid' ? '#fef3c7'
                  : '#fee2e2',
                color:
                  record.paymentStatus === 'Paid' ? '#15803d'
                  : record.paymentStatus === 'Partially Paid' ? '#b45309'
                  : '#b91c1c',
              }}
            >
              {payLabel(tr, record.paymentStatus)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl p-3 space-y-2" style={{ background: SOFT_BG }}>
            <SectionTitle>{tr.billTo}</SectionTitle>
            <ReadOnlyField label={tr.colCustomer} value={record.customerSnapshot.name} />
            {record.customerSnapshot.company && (
              <ReadOnlyField label={tr.companyLabel} value={record.customerSnapshot.company} />
            )}
            <ReadOnlyField label={tr.phoneLabel} value={record.customerSnapshot.phone} ltr />
            <ReadOnlyField
              label={tr.addressLabel}
              value={`${record.customerSnapshot.address}${
                record.customerSnapshot.address && record.customerSnapshot.city ? ', ' : ''
              }${record.customerSnapshot.city}`}
            />
          </div>

          <div className="rounded-xl p-3 space-y-2" style={{ background: SOFT_BG }}>
            <SectionTitle>{tr.document}</SectionTitle>
            <ReadOnlyField
              label={tr.type}
              value={record.documentType === 'quotation' ? tr.docQuotation : tr.docInvoice}
            />
            <ReadOnlyField label={tr.colStatus} value={statusLabel(tr, record.status)} />
            <ReadOnlyField label={tr.issue} value={formatDate(record.issueDate)} />
            {record.salesChannel && (
              <ReadOnlyField
                label={tr.salesChannel}
                value={record.salesChannel === 'Online' ? tr.channelOnline : tr.channelOffline}
              />
            )}
            {record.dueDate && (
              <ReadOnlyField label={tr.dueDate} value={formatDate(record.dueDate)} />
            )}
            <ReadOnlyField label={tr.createdByLabel} value={record.createdBy} />
            {record.updatedAt && (
              <ReadOnlyField label={tr.lastUpdated} value={formatDateTime(record.updatedAt)} />
            )}
            {record.vatNumber && (
              <ReadOnlyField label={tr.vatNumberLabel} value={record.vatNumber} ltr />
            )}
            {record.paymentReference && (
              <ReadOnlyField label={tr.paymentReferenceLabel} value={record.paymentReference} />
            )}
          </div>
        </div>

        <div>
          <SectionTitle>{tr.items}</SectionTitle>
          <div className="rounded-xl overflow-hidden" style={{ border: CARD_BORDER }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: SOFT_BG }}>
                    <Th label={tr.material} />
                    <Th label={tr.categoryLabel} align="start" w="w-24" />
                    <Th label={tr.colQty} align="center" w="w-16" />
                    <Th label={tr.colUnit} align="end" w="w-24" />
                    <Th label={tr.costPrice} align="end" w="w-24" />
                    <Th label={tr.colDiscount} align="center" w="w-28" />
                    <Th label={tr.colTotal} align="end" w="w-28" />
                  </tr>
                </thead>
                <tbody>
                  {record.lines.map((l) => {
                    const d = getLineDiscount(record, l);
                    return (
                      <tr key={l.id} style={{ borderTop: `1px solid ${THEME.mutedOlive}20` }}>
                        <td className="px-3 py-1.5 text-[12px] font-semibold" style={{ color: THEME.charcoal }}>
                          {l.material}
                        </td>
                        <td className="px-3 py-1.5 text-[11px]" style={{ color: THEME.mutedOlive }}>
                          {l.category || '—'}
                        </td>
                        <td className="px-3 py-1.5 text-center text-[12px]" style={{ color: THEME.mutedOlive }}>
                          {l.quantity}
                        </td>
                        <td className="px-3 py-1.5 text-end text-[12px]" style={{ color: THEME.mutedOlive }}>
                          {formatMoney(l.unitPrice)}
                        </td>
                        <td className="px-3 py-1.5 text-end text-[11px]" style={{ color: THEME.mutedOlive }}>
                          {l.costPrice ? formatMoney(l.costPrice) : '—'}
                        </td>
                        <td
                          className="px-3 py-1.5 text-center text-[11px] font-bold"
                          style={{ color: d.amount > 0 ? '#dc2626' : THEME.mutedOlive }}
                        >
                          {d.label}
                        </td>
                        <td className="px-3 py-1.5 text-end text-[12px] font-bold" style={{ color: THEME.charcoal }}>
                          {formatMoney(l.lineTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-3 space-y-2" style={{ background: SOFT_BG }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <ReadOnlyField label={tr.subtotal} value={formatMoney(record.subtotal)} />
            <ReadOnlyField
              label={`${tr.discount}${discountPct > 0 ? ` (${discountPct}%)` : ''}`}
              value={hasDiscount ? `-${formatMoney(record.discountTotal)}` : formatMoney(0)}
              style={{
                color: hasDiscount ? '#dc2626' : THEME.mutedOlive,
                fontWeight: hasDiscount ? 700 : 400,
              }}
            />
            <ReadOnlyField
              label={`${tr.vat} (${record.vatRate || 0}%)`}
              value={formatMoney(record.taxTotal || 0)}
            />
            <ReadOnlyField
              label={tr.grandTotal}
              value={formatMoney(record.grandTotal)}
              style={{
                fontWeight: 700,
                color: THEME.warmBrass,
                borderColor: `${THEME.warmBrass}80`,
              }}
            />
            {paymentSupported && (
              <>
                <ReadOnlyField
                  label={tr.payment}
                  value={`${payLabel(tr, record.paymentStatus)}${
                    record.paymentMethod ? ` · ${methodLabel(tr, record.paymentMethod)}` : ''
                  }`}
                />
                {(record.paymentAmount > 0 || record.balanceDue > 0) && (
                  <ReadOnlyField
                    label={tr.balanceDue}
                    value={formatMoney(record.balanceDue)}
                    style={{ fontWeight: 700 }}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {paymentSupported && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <SectionTitle color={THEME.charcoal}>
                <span>{RbIcons.money}</span>
                <span>{tr.paymentHistory}</span>
              </SectionTitle>
              {canAddPayment && (
                <button
                  type="button"
                  onClick={() => onAddPayment(record)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition"
                  style={{
                    backgroundColor: THEME.warmBrass,
                    color: THEME.warmIvory,
                  }}
                >
                  {RbIcons.plus}
                  <span>{tr.addPayment}</span>
                </button>
              )}
            </div>
            {payments.length === 0 ? (
              <p className="text-[11px] px-2 italic" style={{ color: THEME.mutedOlive }}>
                {tr.noPayments}
              </p>
            ) : (
              <div className="rounded-xl overflow-hidden" style={{ border: CARD_BORDER }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: SOFT_BG }}>
                      <Th label={tr.paymentDate} />
                      <Th label={tr.paymentAmount} align="end" w="w-24" />
                      <Th label={tr.paymentMethodCol} align="center" w="w-24" />
                      <Th label={tr.balanceAfter} align="end" w="w-28" />
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} style={{ borderTop: `1px solid ${THEME.mutedOlive}20` }}>
                        <td className="px-3 py-1.5 text-[11px]" style={{ color: THEME.charcoal }}>
                          {formatDate(p.date)}
                        </td>
                        <td className="px-3 py-1.5 text-end text-[11px] font-bold" style={{ color: THEME.deepForest }}>
                          {formatMoney(p.amount)}
                        </td>
                        <td className="px-3 py-1.5 text-center text-[11px]" style={{ color: THEME.mutedOlive }}>
                          {methodLabel(tr, p.method)}
                        </td>
                        <td className="px-3 py-1.5 text-end text-[11px] font-bold" style={{ color: p.balanceAfter > 0 ? '#dc2626' : '#15803d' }}>
                          {formatMoney(p.balanceAfter)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {returns.length > 0 && (
          <div>
            <SectionTitle color={THEME.charcoal}>
              <span>{RbIcons.return}</span>
              <span>
                {tr.returnsSection} ({returns.length})
              </span>
            </SectionTitle>
            <div className="space-y-1.5">
              {returns.map((r) => (
                <button
                  key={r.returnId}
                  type="button"
                  onClick={() => onOpenReturn(r)}
                  className="w-full text-start rounded-xl p-2.5 transition cursor-pointer"
                  style={{
                    background: `${THEME.charcoal}0D`,
                    border: `1px solid ${THEME.charcoal}25`,
                  }}
                >
                  <div className="flex justify-between items-center gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold font-mono" dir="ltr" style={{ color: THEME.charcoal }}>
                        {r.returnNumber}
                      </p>
                      <p className="text-[9px] mt-0.5 truncate" style={{ color: THEME.mutedOlive }}>
                        {formatDate(r.date)} • {r.reason}
                      </p>
                    </div>
                    <p className="text-[12px] font-bold whitespace-nowrap" style={{ color: THEME.warmBrass }}>
                      {formatMoney(r.totalReturnAmount)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {record.notes && (
          <div>
            <SectionTitle>{tr.notes}</SectionTitle>
            <textarea
              value={record.notes}
              readOnly
              rows={2}
              className={rbTextareaCls}
              style={{ ...INPUT_STYLE, cursor: 'default', resize: 'none' }}
            />
          </div>
        )}

        <div>
          <SectionTitle>
            <span>{RbIcons.history}</span>
            <span>{tr.statusHistory}</span>
          </SectionTitle>
          <div className="space-y-1.5">
            {recordHistory.length === 0 ? (
              <p className="text-[11px] px-2" style={{ color: THEME.mutedOlive }}>
                {tr.noStatusChanges}
              </p>
            ) : (
              recordHistory.map((h) => (
                <div
                  key={h.id}
                  className="flex items-start gap-2.5 px-2.5 py-1.5 rounded-xl"
                  style={{ background: SOFT_BG }}
                >
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: THEME.warmBrass }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold" style={{ color: THEME.charcoal }}>
                      {h.oldStatus ? `${statusLabel(tr, h.oldStatus)} → ` : ''}
                      {statusLabel(tr, h.newStatus)}
                    </p>
                    <p className="text-[9px] mt-0.5" style={{ color: THEME.mutedOlive }}>
                      {h.reason} • {tr.by} {h.changedBy} • {formatDateTime(h.changedAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================
// EXPORT: RecordsSection — NO PROPS
// ============================================================
export default function RecordsSection(): React.JSX.Element {
  const navigate = useNavigate();

  const [language, setLanguage] = useState<Language>(() => getStoredLanguage());
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [company, setCompany] = useState<CompanyInfo>(DEFAULT_COMPANY);

  const [activeTab, setActiveTab] = useState<TabId>('Quotation');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [viewRecord, setViewRecord] = useState<DocumentRecord | null>(null);
  const [approveTarget, setApproveTarget] = useState<DocumentRecord | null>(null);
  const [rejectTarget, setRejectTarget] = useState<DocumentRecord | null>(null);
  const [returnTarget, setReturnTarget] = useState<DocumentRecord | null>(null);
  const [pendingTarget, setPendingTarget] = useState<DocumentRecord | null>(null);
  const [printTarget, setPrintTarget] = useState<DocumentRecord | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<DocumentRecord | null>(null);

  const [viewReturn, setViewReturn] = useState<{
    record: DocumentRecord;
    returnRecord: ReturnRecord;
  } | null>(null);

  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('newest');
  const [page, setPage] = useState(1);

  const tr: RbTranslations = rbT[language];
  const isRTL = isRTLLang(language);

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

  // ------------------------------------------------------------
  // DATA LOADING (Supabase via recordsService)
  // ------------------------------------------------------------
  const refresh = useCallback(async (): Promise<DocumentRecord[]> => {
    try {
      const rows = await recordsService.getDocuments();
      const mapped = rows.map(mapDoc);
      setDocuments(mapped);
      setHistory(mapHistory(rows));
      return mapped;
    } catch (e) {
      console.error('Records load error:', e);
      const msg = rbT[getStoredLanguage()].toastLoadErr;
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 3500);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // first load + handoff from accounting ("view invoice")
  useEffect(() => {
    void (async () => {
      const docs = await refresh();
      try {
        const handoff = localStorage.getItem(HANDOFF_VIEW_INVOICE_KEY);
        if (handoff) {
          localStorage.removeItem(HANDOFF_VIEW_INVOICE_KEY);
          const found = docs.find((d) => d.id === handoff);
          if (found) {
            setViewRecord(found);
            setActiveTab(getCategory(found));
          }
        }
      } catch {
        /* ignore */
      }
    })();
  }, [refresh]);

  // company info for printing (businesses table)
  useEffect(() => {
    void (async () => {
      try {
        setCompany(await recordsService.getCompanyInfo());
      } catch {
        /* keep default */
      }
    })();
  }, []);

  // refresh when the user returns to the tab / other modules change sales data
  useEffect(() => {
    const onFocus = (): void => {
      void refresh();
    };
    const onVisible = (): void => {
      if (document.visibilityState === 'visible') void refresh();
    };
    const onCustom = (): void => {
      void refresh();
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('zakhira:sales-updated', onCustom);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('zakhira:sales-updated', onCustom);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  // language sync
  useEffect(() => {
    const sync = (): void => setLanguage(getStoredLanguage());
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
    };
  }, []);

  // keep the details modal in sync with fresh data
  const liveViewRecord = viewRecord
    ? documents.find((d) => d.id === viewRecord.id) || viewRecord
    : null;

  // ------------------------------------------------------------
  // FILTER / SORT / PAGINATE
  // ------------------------------------------------------------
  const baseFiltered = useMemo(() => {
    let list = [...documents];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.orderNumber.toLowerCase().includes(q) ||
          d.customerSnapshot.name.toLowerCase().includes(q) ||
          d.customerSnapshot.company.toLowerCase().includes(q) ||
          d.customerSnapshot.phone.toLowerCase().includes(q)
      );
    }
    if (dateFrom) list = list.filter((d) => d.issueDate >= dateFrom);
    if (dateTo) list = list.filter((d) => d.issueDate <= dateTo);

    const byName = (a: DocumentRecord, b: DocumentRecord): number =>
      a.customerSnapshot.name.localeCompare(b.customerSnapshot.name, language, {
        sensitivity: 'base',
      });
    switch (sortBy) {
      case 'oldest':
        list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        break;
      case 'nameAsc':
        list.sort((a, b) => byName(a, b) || b.createdAt.localeCompare(a.createdAt));
        break;
      case 'nameDesc':
        list.sort((a, b) => byName(b, a) || b.createdAt.localeCompare(a.createdAt));
        break;
      case 'amountDesc':
        list.sort((a, b) => b.grandTotal - a.grandTotal);
        break;
      case 'amountAsc':
        list.sort((a, b) => a.grandTotal - b.grandTotal);
        break;
      case 'newest':
      default:
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
    }
    return list;
  }, [documents, search, dateFrom, dateTo, sortBy, language]);

  const getStatusLabel = (s: WorkflowStatus): string => statusLabel(tr, s);
  const getDocLabel = (d: DocumentType): string =>
    d === 'quotation' ? tr.docQuotation : tr.docInvoice;

  const tabsConfig = [
    {
      id: 'Quotation' as TabId,
      label: tr.tabQuotations,
      icon: RbIcons.quotation,
      count: baseFiltered.filter((d) => getCategory(d) === 'Quotation').length,
      category: 'Quotation' as Category,
    },
    {
      id: 'Invoice' as TabId,
      label: tr.tabInvoices,
      icon: RbIcons.invoice,
      count: baseFiltered.filter((d) => getCategory(d) === 'Invoice').length,
      category: 'Invoice' as Category,
    },
    {
      id: 'Approved' as TabId,
      label: tr.tabApproved,
      icon: RbIcons.checkCircle,
      count: baseFiltered.filter((d) => getCategory(d) === 'Approved').length,
      category: 'Approved' as Category,
    },
    {
      id: 'Rejected' as TabId,
      label: tr.tabRejected,
      icon: RbIcons.reject,
      count: baseFiltered.filter((d) => getCategory(d) === 'Rejected').length,
      category: 'Rejected' as Category,
    },
  ];

  const currentList = useMemo(
    () => baseFiltered.filter((d) => getCategory(d) === activeTab),
    [baseFiltered, activeTab]
  );

  const totalPages = Math.max(1, Math.ceil(currentList.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = currentList.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleTabChange = (tab: TabId): void => {
    setActiveTab(tab);
    setPage(1);
  };
  const handleSearchChange = (v: string): void => {
    setSearch(v);
    setPage(1);
  };
  const handleDateFromChange = (v: string): void => {
    setDateFrom(v);
    setPage(1);
  };
  const handleDateToChange = (v: string): void => {
    setDateTo(v);
    setPage(1);
  };
  const handleSortChange = (v: SortKey): void => {
    setSortBy(v);
    setPage(1);
  };
  const clearFilters = (): void => {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const hasActiveFilters = search.trim() !== '' || dateFrom !== '' || dateTo !== '';

  // ------------------------------------------------------------
  // ACTIONS (all go through recordsService)
  // ------------------------------------------------------------
  const afterWrite = async (): Promise<DocumentRecord[]> => {
    const docs = await refresh();
    window.dispatchEvent(new Event('zakhira:sales-updated'));
    return docs;
  };

  const changeStatus = async (
    record: DocumentRecord,
    newStatus: WorkflowStatus,
    reason: string
  ): Promise<void> => {
    if (busy) return;
    setBusy(true);
    try {
      await recordsService.updateStatus(
        record.id,
        record.status,
        newStatus,
        reason.trim() || getStatusLabel(newStatus)
      );
      await afterWrite();
      if (newStatus === 'Approved') showSuccess(tr.toastApproved(record.orderNumber));
      else if (newStatus === 'Rejected') showSuccess(tr.toastRejected(record.orderNumber));
      else showSuccess(tr.toastPending(record.orderNumber));
    } catch (e) {
      console.error(e);
      showError(tr.toastStorageErr);
    } finally {
      setBusy(false);
    }
  };

  const handleApproveWithPayment = async (
    record: DocumentRecord,
    data: { amount: number; method: PaymentMethod; note?: string }
  ): Promise<void> => {
    if (busy) return;

    const paidBefore = sumPayments(record);
    const remaining = roundMoney(Math.max(0, record.grandTotal - paidBefore));
    const minRequired = getMinApprovePayment(paidBefore, remaining);

    if (!Number.isFinite(data.amount) || data.amount < minRequired) {
      showError(tr.errMinPayment);
      return;
    }
    const amt = roundMoney(Math.max(0, Math.min(remaining, data.amount)));

    setBusy(true);
    try {
      await recordsService.approveDocument(
        record.id,
        record.status,
        amt > 0 ? { amount: amt, method: data.method, note: data.note } : undefined
      );
      setApproveTarget(null);
      await afterWrite();
      showSuccess(tr.toastApproved(record.orderNumber));
    } catch (e) {
      console.error(e);
      showError(tr.toastSaveErr);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleReject = (record: DocumentRecord, reason: string): void => {
    setRejectTarget(null);
    void changeStatus(record, 'Rejected', reason || tr.histRejected);
  };

  const handlePending = (record: DocumentRecord): void => {
    setPendingTarget(null);
    void changeStatus(record, 'Pending', tr.histPending);
  };

  const handleReturn = async (
    record: DocumentRecord,
    data: {
      reason: string;
      date: string;
      notes: string;
      items: ReturnItem[];
      subtotal: number;
      taxTotal: number;
      totalReturnAmount: number;
    }
  ): Promise<void> => {
    if (busy) return;
    setBusy(true);
    try {
      const ret = await recordsService.addReturn({
        documentId: record.id,
        documentRef: record.orderNumber,
        documentStatus: record.status,
        customerName: record.customerSnapshot.name,
        customerCompany: record.customerSnapshot.company,
        date: data.date,
        reason: data.reason,
        notes: data.notes || undefined,
        items: data.items.map((it) => ({
          ...it,
          productId: record.lines.find((l) => l.id === it.lineId)?.productId || '',
        })),
        subtotal: data.subtotal,
        taxTotal: data.taxTotal,
        totalReturnAmount: data.totalReturnAmount,
      });
      setReturnTarget(null);
      await afterWrite();
      showSuccess(tr.toastReturnCreated(ret.return_number));
    } catch (e) {
      console.error(e);
      showError(tr.toastSaveErr);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleAddPayment = async (
    record: DocumentRecord,
    data: { amount: number; method: PaymentMethod; note?: string }
  ): Promise<void> => {
    if (busy) return;
    setBusy(true);
    try {
      await recordsService.addPayment(record.id, data);
      setPaymentTarget(null);
      const docs = await afterWrite();
      setViewRecord(docs.find((d) => d.id === record.id) || null);
      showSuccess(tr.toastPaymentAdded);
    } catch (e) {
      console.error(e);
      showError(tr.toastSaveErr);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const navigateToAccountingWithTxn = (txnId: string): void => {
    try {
      localStorage.setItem(HANDOFF_VIEW_TXN_KEY, txnId);
    } catch {
      /* ignore */
    }
    setViewReturn(null);
    setViewRecord(null);
    navigate('/accounting');
  };

  const sendWhatsApp = (record: DocumentRecord): void => {
    const linesText = record.lines.map(
      (l, i) =>
        `${i + 1}. ${l.material} — ${tr.waQty}: ${l.quantity} × ${formatMoney(l.unitPrice)} = ${formatMoney(l.lineTotal)}`
    );
    const label = getDocLabel(record.documentType);
    const msg = [
      tr.waHello(record.customerSnapshot.name),
      '',
      `${label}: ${record.orderNumber}`,
      `${tr.colDate}: ${formatDate(record.issueDate)}`,
      '',
      tr.waItems,
      ...linesText,
      '',
      `${tr.subtotal}: ${formatMoney(record.subtotal)}`,
      record.discountTotal > 0 ? `${tr.discount}: -${formatMoney(record.discountTotal)}` : '',
      record.taxTotal > 0 ? `${tr.vat} (${record.vatRate}%): ${formatMoney(record.taxTotal)}` : '',
      `${tr.grandTotal}: ${formatMoney(record.grandTotal)}`,
      '',
      tr.waReview,
    ]
      .filter(Boolean)
      .join('\n');

    window.open(
      `https://wa.me/${phoneDigits(record.customerSnapshot.phone)}?text=${encodeURIComponent(msg)}`,
      '_blank'
    );
    showSuccess(tr.toastWhatsApp);
  };

  const handlePrint = (record: DocumentRecord, format: PrintFormat): void => {
    const docLabel = record.documentType === 'quotation' ? tr.docQuotation : tr.docInvoice;
    const dir = isRTL ? 'rtl' : 'ltr';
    const fmt = PRINT_FORMATS[format];
    const esc = (s: string | number | undefined | null): string =>
      String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const w = iframe.contentWindow;
    if (!w) {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      showError(tr.toastPopupBlocked);
      return;
    }

    const rows = record.lines
      .map(
        (l, i) =>
          `<tr>
            <td>${i + 1}</td>
            <td>${esc(l.material)}</td>
            <td class="r">${l.quantity}</td>
            <td class="r">${formatMoney(l.unitPrice)}</td>
            ${fmt.fullColumns ? `<td class="r">${getLineDiscount(record, l).label}</td>` : ''}
            <td class="r">${formatMoney(l.lineTotal)}</td>
          </tr>`
      )
      .join('');

    const payText = `${payLabel(tr, record.paymentStatus)}${
      record.paymentMethod ? ` (${methodLabel(tr, record.paymentMethod)})` : ''
    }`;

    const compactCSS = fmt.compact
      ? `
        .head{flex-direction:column;gap:6px;padding-bottom:8px;margin-bottom:10px;border-bottom-width:2px}
        h1{font-size:${fmt.headingSize}px;text-align:start !important}
        .co{font-size:${fmt.companySize}px}
        .muted{font-size:${fmt.fontSize - 1}px;line-height:1.4}
        .meta{flex-direction:column;gap:6px;margin-bottom:10px}
        .box{padding:6px 8px;font-size:${fmt.fontSize}px;border-radius:6px}
        .box h3{font-size:${fmt.fontSize - 2}px;margin-bottom:2px}
        th,td{padding:${fmt.cellPadding};font-size:${fmt.fontSize}px}
        th{font-size:${fmt.fontSize - 2}px}
        .totals{width:100%;margin-inline-start:0;font-size:${fmt.fontSize}px;margin-top:8px}
        .totals .grand{font-size:${fmt.fontSize + 2}px;padding-top:4px}
        .pay{font-size:${fmt.fontSize - 1}px;margin-top:8px}
        .foot{margin-top:16px;padding-top:6px;font-size:${fmt.fontSize - 2}px}
        .hide-compact{display:none}
      `
      : '';

    w.document.open();
    w.document.write(`<!doctype html><html lang="${language}" dir="${dir}"><head><meta charset="utf-8"><title>${esc(record.orderNumber)}</title>
<style>
@page { size: ${fmt.pageSize}; margin: 0; }
*{box-sizing:border-box}
body{font-family:'Noto Sans Devanagari','Noto Naskh Arabic','Noto Nastaliq Urdu',Arial,sans-serif;color:${THEME.charcoal};background:#F7F3EA;margin:0;padding:${fmt.bodyPadding};font-size:${fmt.fontSize}px;max-width:${fmt.maxWidth}}
.head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid ${THEME.deepForest};padding-bottom:${fmt.compact ? '8px' : '16px'};margin-bottom:${fmt.compact ? '10px' : '24px'}}
.co{font-size:${fmt.companySize}px;font-weight:700;color:${THEME.deepForest}}
.muted{color:${THEME.mutedOlive};font-size:${fmt.fontSize - 1}px;line-height:1.6}
h1{font-size:${fmt.headingSize}px;letter-spacing:${isRTL || language === 'hi' ? '0' : '3px'};margin:0;text-align:end;color:${THEME.deepForest}}
h1.q{color:#0284c7}
.meta{display:flex;gap:${fmt.compact ? '6px' : '24px'};margin-bottom:${fmt.compact ? '10px' : '24px'}}
.box{flex:1;border:1px solid rgba(102,116,90,.35);border-radius:${fmt.compact ? '6px' : '12px'};padding:${fmt.compact ? '6px 8px' : '14px 16px'};font-size:${fmt.fontSize}px;line-height:1.6}
.box h3{margin:0 0 ${fmt.compact ? '2px' : '6px'};font-size:${fmt.fontSize - 2}px;text-transform:uppercase;letter-spacing:${isRTL || language === 'hi' ? '0' : '1px'};color:${THEME.mutedOlive}}
table{width:100%;border-collapse:collapse;font-size:${fmt.fontSize}px}
th{background:rgba(18,60,50,.08);text-align:start;padding:${fmt.cellPadding};border:1px solid rgba(102,116,90,.35);font-size:${fmt.fontSize - 2}px;text-transform:uppercase;letter-spacing:${isRTL || language === 'hi' ? '0' : '1px'}}
td{padding:${fmt.cellPadding};border:1px solid rgba(102,116,90,.35)}
.r{text-align:end}
.totals{margin-top:${fmt.compact ? '8px' : '16px'};width:${fmt.compact ? '100%' : '320px'};margin-inline-start:auto;font-size:${fmt.fontSize}px}
.totals .row{display:flex;justify-content:space-between;padding:${fmt.compact ? '2px 0' : '5px 0'}}
.totals .grand{border-top:2px solid ${THEME.deepForest};margin-top:${fmt.compact ? '3px' : '6px'};padding-top:${fmt.compact ? '4px' : '8px'};font-size:${fmt.fontSize + (fmt.compact ? 2 : 3)}px;font-weight:700;color:${THEME.deepForest}}
.pay{margin-top:${fmt.compact ? '8px' : '16px'};font-size:${fmt.fontSize - 1}px;color:${THEME.mutedOlive}}
.pay b{color:${THEME.charcoal}}
.foot{margin-top:${fmt.compact ? '16px' : '48px'};font-size:${fmt.fontSize - 2}px;color:${THEME.mutedOlive};text-align:center;border-top:1px solid rgba(102,116,90,.35);padding-top:${fmt.compact ? '6px' : '12px'}}
${compactCSS}
</style></head><body>
  <div class="head">
    <div>
      <div class="co">${esc(company.name)}</div>
      <div class="muted">
        ${esc(company.address)}${company.address && company.phone ? '<br>' : ''}
        ${esc(company.phone)}
        ${company.vat ? `<br>${tr.printVat} ${esc(company.vat)}` : ''}
      </div>
    </div>
    <div>
      <h1 class="${record.documentType === 'quotation' ? 'q' : ''}">${esc(docLabel)}</h1>
      <div class="muted" style="text-align:end;margin-top:6px">
        ${tr.printNo} <b>${esc(record.orderNumber)}</b><br>
        ${tr.colDate}: ${formatDate(record.issueDate)}
      </div>
    </div>
  </div>
  <div class="meta">
    <div class="box">
      <h3>${tr.billTo}</h3>
      <b>${esc(record.customerSnapshot.name)}</b><br>
      ${esc(record.customerSnapshot.company)}
      ${record.customerSnapshot.company ? '<br>' : ''}
      <span dir="ltr">${esc(record.customerSnapshot.phone)}</span><br>
      ${esc(record.customerSnapshot.address)}
      ${record.customerSnapshot.address ? ', ' : ''}${esc(record.customerSnapshot.city)}
    </div>
    <div class="box">
      <h3>${tr.document}</h3>
      ${tr.type}: <b>${esc(docLabel)}</b><br>
      ${tr.colStatus}: ${getStatusLabel(record.status)}<br>
      ${tr.payment}: ${payText}
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>#</th><th>${tr.material}</th>
        <th class="r">${tr.colQty}</th><th class="r">${tr.colUnit}</th>
        ${fmt.fullColumns ? `<th class="r">${tr.colDiscount}</th>` : ''}
        <th class="r">${tr.colTotal}</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totals">
    <div class="row"><span>${tr.subtotal}</span><span>${formatMoney(record.subtotal)}</span></div>
    ${record.discountTotal > 0 ? `<div class="row"><span>${tr.discount}</span><span>-${formatMoney(record.discountTotal)}</span></div>` : ''}
    ${record.taxTotal > 0 ? `<div class="row"><span>${tr.vat} (${record.vatRate}%)</span><span>${formatMoney(record.taxTotal)}</span></div>` : ''}
    <div class="row grand"><span>${tr.grandTotal}</span><span>${formatMoney(record.grandTotal)}</span></div>
  </div>
  ${record.vatNumber ? `<div class="pay">${tr.printCustomerVat} <b>${esc(record.vatNumber)}</b></div>` : ''}
  ${record.notes ? `<div class="pay">${tr.printNotes} ${esc(record.notes)}</div>` : ''}
  <div class="foot">${tr.printThankYou}</div>
</body></html>`);
    w.document.close();

    setTimeout(() => {
      try {
        w.focus();
        w.print();
      } catch {
        showError(tr.toastPopupBlocked);
      }
      setTimeout(() => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 2000);
    }, 400);

    showSuccess(tr.toastPrintOpened);
  };

  const handlePrintWithFormat = (format: PrintFormat): void => {
    if (!printTarget) return;
    saveLastPrintFormat(format);
    const target = printTarget;
    setPrintTarget(null);
    handlePrint(target, format);
  };

  const activeConfig = tabsConfig.find((x) => x.id === activeTab)!;
  const activeStyle =
    activeConfig.category === 'Quotation'
      ? STATUS.quotation
      : activeConfig.category === 'Invoice'
        ? STATUS.invoice
        : activeConfig.category === 'Approved'
          ? STATUS.approved
          : STATUS.rejected;

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} lang={language}>
      {successMsg && (
        <div
          className="mb-3 px-3 py-2 rounded-full text-[11px] font-bold flex items-center gap-2"
          style={{
            background: `${THEME.deepForest}14`,
            border: `2px solid ${THEME.deepForest}50`,
            color: THEME.deepForest,
          }}
        >
          {RbIcons.check}
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div
          className="mb-3 px-3 py-2 rounded-full text-[11px] font-bold flex items-center gap-2"
          style={{
            background: `${THEME.charcoal}10`,
            border: `2px solid ${THEME.charcoal}50`,
            color: THEME.charcoal,
          }}
        >
          {RbIcons.alert}
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="rounded-2xl p-3.5 mb-4" style={CARD_STYLE}>
        <div className="flex items-center gap-2 mb-3">
          <span style={{ color: THEME.mutedOlive }}>{RbIcons.sliders}</span>
          <h3 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: THEME.deepForest }}>
            {tr.filters}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className={rbLabelCls} style={{ color: THEME.deepForest }}>
              {tr.search}
            </label>
            <div className="relative">
              <span
                className="absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none"
                style={{ color: THEME.mutedOlive }}
              >
                {RbIcons.search}
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={tr.searchPh}
                className={rbInputCls}
                style={{ ...INPUT_STYLE, paddingInlineStart: 36 }}
              />
            </div>
          </div>
          <div>
            <label className={rbLabelCls} style={{ color: THEME.deepForest }}>
              {tr.dateFrom}
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => handleDateFromChange(e.target.value)}
              className={rbInputCls}
              style={INPUT_STYLE}
            />
          </div>
          <div>
            <label className={rbLabelCls} style={{ color: THEME.deepForest }}>
              {tr.dateTo}
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => handleDateToChange(e.target.value)}
              className={rbInputCls}
              style={INPUT_STYLE}
            />
          </div>
          <div>
            <label className={rbLabelCls} style={{ color: THEME.deepForest }}>
              {tr.sortBy}
            </label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortKey)}
              className={`${rbInputCls} cursor-pointer`}
              style={INPUT_STYLE}
            >
              <option value="newest">{tr.sortNewest}</option>
              <option value="oldest">{tr.sortOldest}</option>
              <option value="nameAsc">{tr.sortNameAsc}</option>
              <option value="nameDesc">{tr.sortNameDesc}</option>
              <option value="amountDesc">{tr.sortAmountDesc}</option>
              <option value="amountAsc">{tr.sortAmountAsc}</option>
            </select>
          </div>
        </div>
        {hasActiveFilters && (
          <div className="flex justify-end mt-3 pt-3" style={{ borderTop: `1px solid ${THEME.mutedOlive}30` }}>
            <button
              onClick={clearFilters}
              className="text-[10px] font-bold hover:underline cursor-pointer"
              style={{ color: THEME.warmBrass }}
            >
              {tr.clearFilters}
            </button>
          </div>
        )}
      </div>

      <div className="rounded-2xl p-1.5 mb-4 grid grid-cols-2 lg:grid-cols-4 gap-1.5" style={CARD_STYLE}>
        {tabsConfig.map((tab) => {
          const style =
            tab.category === 'Quotation'
              ? STATUS.quotation
              : tab.category === 'Invoice'
                ? STATUS.invoice
                : tab.category === 'Approved'
                  ? STATUS.approved
                  : STATUS.rejected;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className="py-2 rounded-xl text-[13px] font-bold cursor-pointer transition-all duration-200 flex items-center justify-center gap-1.5"
              style={
                active
                  ? { background: style.badgeBg, color: style.badgeText, boxShadow: SHADOW }
                  : { color: THEME.mutedOlive }
              }
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  background: active ? 'rgba(247,243,234,0.25)' : `${THEME.mutedOlive}20`,
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl overflow-hidden" style={CARD_STYLE}>
        <div
          className="px-4 py-2.5"
          style={{
            background: activeStyle.headerBg,
            borderBottom: `1px solid ${THEME.mutedOlive}30`,
          }}
        >
          <h2 className="text-[13px] font-bold flex items-center gap-2" style={{ color: activeStyle.headerText }}>
            <span className="w-2 h-2 rounded-full" style={{ background: activeStyle.dot }} />
            {activeConfig.label}{' '}
            <span className="text-[11px] font-normal">({currentList.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <p className="text-[13px]" style={{ color: THEME.mutedOlive }}>
              {tr.loading}
            </p>
          </div>
        ) : paginated.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr style={{ background: SOFT_BG, borderBottom: `1px solid ${THEME.mutedOlive}30` }}>
                    <Th label={tr.colOrderNo} />
                    <Th label={tr.colCustomer} />
                    <Th label={tr.colDate} extra="hidden md:table-cell" />
                    <Th label={tr.colAmount} align="end" />
                    <Th label={tr.colPayment} align="center" />
                    <Th label={tr.colStatus} align="center" />
                    <Th label={tr.colActions} align="center" extra="whitespace-nowrap" />
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((d) => {
                    const cat = getCategory(d);
                    const style =
                      cat === 'Quotation'
                        ? STATUS.quotation
                        : cat === 'Invoice'
                          ? STATUS.invoice
                          : cat === 'Approved'
                            ? STATUS.approved
                            : STATUS.rejected;
                    const returns = d.returnRecords || [];
                    const hasReturn = returns.length > 0;
                    const showPayment = supportsPayment(d);

                    const actions: {
                      label: string;
                      icon: React.ReactNode;
                      tone: keyof typeof ACTION;
                      onSelect: () => void;
                    }[] = [
                      { label: tr.actPreview, icon: RbIcons.eye, tone: 'default', onSelect: () => setViewRecord(d) },
                    ];

                    if (cat === 'Quotation') {
                      actions.push(
                        { label: tr.actWhatsApp, icon: RbIcons.whatsapp, tone: 'default', onSelect: () => sendWhatsApp(d) },
                        { label: tr.actApprove, icon: RbIcons.check, tone: 'success', onSelect: () => setApproveTarget(d) },
                        { label: tr.actReject, icon: RbIcons.x, tone: 'danger', onSelect: () => setRejectTarget(d) }
                      );
                    } else if (cat === 'Invoice') {
                      actions.push(
                        { label: tr.actPrint, icon: RbIcons.print, tone: 'default', onSelect: () => setPrintTarget(d) },
                        { label: tr.actWhatsApp, icon: RbIcons.whatsapp, tone: 'default', onSelect: () => sendWhatsApp(d) },
                        { label: tr.actApprove, icon: RbIcons.check, tone: 'success', onSelect: () => setApproveTarget(d) },
                        { label: tr.actReject, icon: RbIcons.x, tone: 'danger', onSelect: () => setRejectTarget(d) }
                      );
                    } else if (cat === 'Approved') {
                      actions.push(
                        { label: tr.actReturn, icon: RbIcons.return, tone: 'warn', onSelect: () => setReturnTarget(d) },
                        { label: tr.actPending, icon: RbIcons.clock, tone: 'default', onSelect: () => setPendingTarget(d) },
                        { label: tr.actReject, icon: RbIcons.x, tone: 'danger', onSelect: () => setRejectTarget(d) }
                      );
                    } else if (cat === 'Rejected') {
                      actions.push(
                        { label: tr.actPending, icon: RbIcons.clock, tone: 'default', onSelect: () => setPendingTarget(d) },
                        { label: tr.actApprove, icon: RbIcons.check, tone: 'success', onSelect: () => setApproveTarget(d) }
                      );
                    }

                    return (
                      <tr
                        key={d.id}
                        className="transition-colors"
                        style={{ background: ROW_BG, borderBottom: `1px solid ${ROW_BORDER}` }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = ROW_BG_HOVER)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = ROW_BG)}
                      >
                        <td className="px-3 py-2">
                          <p className="text-[12px] font-bold font-mono" dir="ltr" style={{ color: THEME.charcoal, textAlign: isRTL ? 'right' : 'left' }}>
                            {d.orderNumber}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                            <span className="inline-block text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: style.badgeBg, color: style.badgeText }}>
                              {catLabel(tr, cat)}
                            </span>
                            {hasReturn && (
                              <button
                                type="button"
                                onClick={() =>
                                  setViewReturn({
                                    record: d,
                                    returnRecord: returns[returns.length - 1],
                                  })
                                }
                                title={`${tr.actReturn}${returns.length > 1 ? ` (${returns.length})` : ''}`}
                                aria-label={`${tr.actReturn} ${d.orderNumber}`}
                                className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition hover:brightness-110 hover:shadow-sm"
                                style={{
                                  background: THEME.charcoal,
                                  color: THEME.warmIvory,
                                }}
                              >
                                {RbIcons.return}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <p className="text-[12px] font-semibold truncate max-w-[200px]" style={{ color: THEME.charcoal }}>
                            {d.customerSnapshot.name}
                          </p>
                          {d.customerSnapshot.company && (
                            <p className="text-[9px] truncate max-w-[200px] mt-0.5" style={{ color: THEME.mutedOlive }}>
                              {d.customerSnapshot.company}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-2 text-[11px] font-semibold whitespace-nowrap hidden md:table-cell" style={{ color: THEME.charcoal }}>
                          {formatDate(d.issueDate)}
                        </td>
                        <td className="px-3 py-2 text-end text-[12px] font-bold whitespace-nowrap" style={{ color: THEME.charcoal }}>
                          {formatMoney(d.grandTotal)}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {showPayment ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span
                                className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                                style={{
                                  background:
                                    d.paymentStatus === 'Paid'
                                      ? '#dcfce7'
                                      : d.paymentStatus === 'Partially Paid'
                                        ? '#fef3c7'
                                        : '#fee2e2',
                                  color:
                                    d.paymentStatus === 'Paid'
                                      ? '#15803d'
                                      : d.paymentStatus === 'Partially Paid'
                                        ? '#b45309'
                                        : '#b91c1c',
                                }}
                              >
                                {payLabel(tr, d.paymentStatus)}
                              </span>
                              {d.paymentStatus === 'Partially Paid' && d.balanceDue > 0 && (
                                <span className="text-[8px] font-semibold whitespace-nowrap" style={{ color: THEME.mutedOlive }}>
                                  {formatMoney(d.balanceDue)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px]" style={{ color: THEME.mutedOlive }}>
                              —
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span
                            className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full"
                            style={
                              d.status === 'Approved'
                                ? { background: '#dcfce7', color: '#15803d' }
                                : d.status === 'Rejected'
                                  ? { background: '#fee2e2', color: '#b91c1c' }
                                  : { background: `${THEME.warmBrass}30`, color: THEME.charcoal, border: `1px solid ${THEME.warmBrass}` }
                            }
                          >
                            {getStatusLabel(d.status)}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-nowrap items-center justify-center gap-1">
                            {actions.map((action) => {
                              const tone = ACTION[action.tone];
                              return (
                                <button
                                  key={action.label}
                                  type="button"
                                  title={action.label}
                                  aria-label={`${action.label} ${d.orderNumber}`}
                                  onClick={action.onSelect}
                                  className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition hover:brightness-95 hover:shadow-sm"
                                  style={{ background: tone.background, color: tone.color, border: tone.border }}
                                >
                                  {action.icon}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={safePage} total={currentList.length} onPage={setPage} tr={tr} />
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="text-[13px]" style={{ color: THEME.mutedOlive }}>
              {tr.noRecords}
            </p>
          </div>
        )}
      </div>

      {liveViewRecord && (
        <RecordDetailsModal
          record={liveViewRecord}
          history={history}
          tr={tr}
          onClose={() => setViewRecord(null)}
          onOpenReturn={(ret) => setViewReturn({ record: liveViewRecord, returnRecord: ret })}
          onAddPayment={(rec) => setPaymentTarget(rec)}
        />
      )}
      {viewReturn && (
        <ReturnDetailsModal
          record={viewReturn.record}
          returnRecord={viewReturn.returnRecord}
          tr={tr}
          onClose={() => setViewReturn(null)}
          onNavigateToAccounting={navigateToAccountingWithTxn}
        />
      )}
      {approveTarget && (
        <ApprovePaymentModal
          record={approveTarget}
          tr={tr}
          busy={busy}
          onClose={() => setApproveTarget(null)}
          onConfirm={(data) => void handleApproveWithPayment(approveTarget, data)}
        />
      )}
      {rejectTarget && (
        <ConfirmModal
          title={tr.rejectTitle}
          message={tr.rejectMsg(rejectTarget.orderNumber)}
          confirmLabel={tr.rejectLabel}
          cancelLabel={tr.cancel}
          danger
          reasonLabel={tr.rejectReasonLabel}
          onConfirm={(reason) => handleReject(rejectTarget, reason)}
          onCancel={() => setRejectTarget(null)}
        />
      )}
      {pendingTarget && (
        <ConfirmModal
          title={tr.pendingTitle}
          message={tr.pendingMsg(pendingTarget.orderNumber, getDocLabel(pendingTarget.documentType))}
          confirmLabel={tr.pendingLabel}
          cancelLabel={tr.cancel}
          onConfirm={() => handlePending(pendingTarget)}
          onCancel={() => setPendingTarget(null)}
        />
      )}
      {returnTarget && (
        <ReturnModal
          record={returnTarget}
          tr={tr}
          busy={busy}
          onClose={() => setReturnTarget(null)}
          onSubmit={(data) => void handleReturn(returnTarget, data)}
        />
      )}
      {paymentTarget && (
        <AddPaymentModal
          record={paymentTarget}
          tr={tr}
          busy={busy}
          onClose={() => setPaymentTarget(null)}
          onSave={(data) => void handleAddPayment(paymentTarget, data)}
        />
      )}
      {printTarget && (
        <PrintFormatPickerModal
          record={printTarget}
          tr={tr}
          isRTL={isRTL}
          onConfirm={handlePrintWithFormat}
          onCancel={() => setPrintTarget(null)}
        />
      )}
    </div>
  );
}