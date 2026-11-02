/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable prettier/prettier */
/* eslint-disable react-refresh/only-export-components */
import { useEffect, useMemo, useRef, useState } from 'react';

// ============================================================
// THEME COLORS
// ============================================================
const IVORY = '#F7F3EA';
const FOREST = '#123C32';
const OLIVE = '#66745A';
const CHARCOAL = '#252A28';
const BRASS = '#C49A5A';
const WHITE = '#FFFFFF';

const FALLBACK_UNIT = 'piece';

// ============================================================
// 🌍 LANGUAGE
// ============================================================
type Language = 'en' | 'ar' | 'ur' | 'hi';

const t = {
  en: {
    pageTitle: 'Inventory — Orders',
    statMonthlyPurchases: 'Monthly Purchases',
    statMonthlyPurchasesHint: 'Received this month',
    statPending: 'Pending Orders',
    statPendingHint: 'Awaiting action',
    statSupplierPayable: 'Supplier Payable',
    statSupplierPayableHint: 'Received, not fully paid',
    statTotalVendors: 'Total Vendors',
    statTotalVendorsHint: 'Active vendors',
    placeOrder: 'Place Order',
    filters: 'Filters',
    search: 'Search',
    searchPh: 'Order no, vendor, product...',
    status: 'Status',
    allStatuses: 'All Statuses',
    pending: 'Pending',
    received: 'Received',
    cancelled: 'Cancelled',
    vendor: 'Vendor',
    allVendors: 'All Vendors',
    dateRange: 'Date Range',
    startDate: 'Start date',
    endDate: 'End date',
    clearFilters: 'Clear all filters',
    orders: 'Orders',
    colOrderNo: 'Order No.',
    colDate: 'Date',
    colVendor: 'Vendor',
    colProduct: 'Product',
    colAmount: 'Amount',
    colPayment: 'Payment',
    colStatus: 'Status',
    colActions: 'Actions',
    more: 'more',
    units: 'units',
    noOrders: 'No orders found',
    placeFirst: 'Place your first order',
    placeOrderTitle: 'Place Order',
    placeOrderSubtitle: 'Create a purchase order',
    orderNoAuto: 'Order Number (auto)',
    orderDate: 'Order Date',
    selectVendor: 'Select vendor',
    searchVendorPh: 'Search by name, company or ID',
    noVendors: 'No active vendors',
    productsLabel: 'Products',
    addProduct: 'Add Product',
    product: 'Product',
    quantity: 'Quantity',
    selectProduct: 'Select product',
    searchProductPh: 'Search by name or SKU',
    noProducts: 'No products',
    lineTotal: 'Line total',
    remove: 'Remove',
    orderTotal: 'Order Total',
    cancel: 'Cancel',
    orderPlaced: 'Order Placed',
    orderPlacedSub: (no: string) => `${no} saved as Pending`,
    vendorLabel: 'Vendor',
    dateLabel: 'Date',
    itemsLabel: 'Items',
    totalLabel: 'Total',
    sendWhatsApp: 'Send on WhatsApp',
    done: 'Done',
    errSelectProduct: 'Select a product',
    errQty: 'Quantity must be a whole number greater than 0',
    errSelectVendor: 'Select a vendor',
    errDate: 'Order date is required',
    errStorage: 'Could not save — storage may be full.',
    orderLabel: 'Order',
    orderNo: 'Order No:',
    date: 'Date:',
    statusLabel: 'Status:',
    createdBy: 'Created by:',
    itemsCount: (n: number) => `Items (${n})`,
    sku: 'SKU',
    qty: 'Qty',
    unit: 'Unit',
    unitPrice: 'Unit Price',
    grandTotal: 'Grand Total',
    statusHistory: 'Status History',
    noHistory: 'No history',
    receiveTitle: 'Mark as Received',
    receiveMsg: (no: string) =>
      `Mark ${no} as received? Ordered quantities will be added to product stock.`,
    receiveConfirm: 'Mark Received',
    cancelTitle: 'Cancel Order',
    cancelMsg: (no: string) => `Cancel ${no}? Stock will not change.`,
    cancelConfirm: 'Cancel Order',
    cancelReasonLabel: 'Reason (optional)',
    toastReceived: (no: string) => `${no} marked as Received — stock updated`,
    toastCancelled: (no: string) => `${no} cancelled`,
    errOnlyPendingReceive: 'Only Pending orders can be marked as received.',
    errOnlyPendingCancel: 'Only Pending orders can be cancelled.',
    errStockUpdate: 'Could not update stock — storage may be full.',
    errOrderUpdate: 'Could not update order — storage may be full.',
    histOrderPlaced: 'Order placed',
    histGoodsReceived: 'Goods received',
    histCancelled: 'Cancelled',
    by: 'by',
    waHello: (name: string) => `Hello ${name},`,
    waPO: 'Purchase Order',
    waItems: 'Items',
    waConfirm: 'Please confirm availability and delivery time. Thank you.',
    showing: 'Showing',
    of: 'of',
    actView: 'View',
    actWhatsApp: 'Send on WhatsApp',
    // ---- NEW: payments / supplier payable ----
    paymentLabel: 'Payment',
    allPayments: 'All Payments',
    payDue: 'Has balance due',
    payUnpaid: 'Unpaid',
    payPartial: 'Partially Paid',
    payPaid: 'Paid',
    methodCash: 'Cash',
    methodBank: 'Bank Transfer',
    methodCard: 'Card',
    methodOther: 'Other',
    addPayment: 'Add Payment',
    addPaymentTitle: (no: string) => `Add Payment — ${no}`,
    amountPaid: 'Amount Paid',
    fullBtn: 'Full',
    paymentMethodLabel: 'Payment Method',
    paymentNote: 'Note (optional)',
    paymentNotePh: 'e.g. Installment 2',
    confirmPayment: 'Confirm Payment',
    paymentHistory: 'Payment History',
    noPayments: 'No payments recorded yet',
    paymentDate: 'Date',
    paymentAmount: 'Amount',
    paymentMethodCol: 'Method',
    balanceAfter: 'Balance After',
    balanceDue: 'Balance Due',
    totalPaid: 'Total Paid',
    errAmountRequired: 'Amount is required',
    errAmountTooHigh: 'Amount cannot exceed the balance due',
    errAdvanceInvalid: 'Amount must be between 0 and the order total',
    toastPaymentAdded: 'Payment added successfully',
    errPaymentSave: 'Could not save payment — storage may be full.',
    toastAccErr: 'Could not create accounting entry.',
    advanceTitle: 'Advance Payment (optional)',
    advanceHint: 'Amount paid to the vendor now. Leave empty to pay later.',
    legacyPaid: 'Marked as paid before payment tracking was added',
    receiveDueNote: (bal: string) =>
      `A balance of ${bal} will remain in Supplier Payable.`,
    errCancelHasPayments: 'This order has payments and cannot be cancelled.',
    // ---- NEW: print slip ----
    actPrint: 'Print Slip',
    slipTitle: 'PURCHASE ORDER',
    slipSignature: 'Received by',
    slipPaid: 'Paid',
    toastPrintOpened: 'Print window opened',
    toastPopupBlocked: 'Printing is blocked — allow pop-ups and try again',
    waPaid: 'Paid',
    waBalance: 'Balance',
    // ---- NEW: quick add product ----
    addNewProduct: 'Add new product',
    addProductTitle: 'Add Product',
    addProductSubtitle: (sku: string) => `SKU: ${sku} (auto-generated)`,
    productName: 'Product Name',
    productNamePh: 'e.g. Modern Sofa',
    productPrice: 'Unit Price',
    productOpeningStock: 'Opening Stock',
    productOpeningHint: 'Usually 0 — stock increases when the order is received.',
    productDescription: 'Description (optional)',
    productImages: 'Images (optional)',
    upload: 'Upload',
    processing: 'Processing...',
    saveProduct: 'Save Product',
    errProductName: 'Product name is required',
    errProductPrice: 'Price must be greater than 0',
    errProductStock: 'Stock must be a whole number (0 or more)',
    errProductDuplicate: (n: string) => `A product named "${n}" already exists`,
    errImageType: 'Only JPG, PNG, WEBP allowed',
    errImageProcess: 'Could not process image',
    toastProductAdded: (n: string) => `Product added — ${n}`,
    companyLabel: 'Company',
    contactLabel: 'Contact Person',
    vendorIdLabel: 'Vendor ID',
    phoneLabel: 'Phone',
    addressLabel: 'Address',
    orderNumberLabel: 'Order Number',
    createdByLabel: 'Created By',
    payingNow: 'Paying Now',
    remainingLabel: 'Remaining',
    payNowMsg: (paid: string, rem: string) =>
      `You are paying ${paid} now — ${rem} will remain to be paid.`,
    payFullMsg: (paid: string) => `You are paying the full amount (${paid}). Nothing remaining.`,
    vendorSection: 'Vendor Details',
    orderSection: 'Order Details',
    summarySection: 'Amounts',
  },
  ar: {
    pageTitle: 'المخزون — الطلبات',
    statMonthlyPurchases: 'المشتريات الشهرية',
    statMonthlyPurchasesHint: 'المستلم هذا الشهر',
    statPending: 'طلبات معلقة',
    statPendingHint: 'بانتظار الإجراء',
    statSupplierPayable: 'مستحقات الموردين',
    statSupplierPayableHint: 'مستلمة وغير مدفوعة بالكامل',
    statTotalVendors: 'إجمالي الموردين',
    statTotalVendorsHint: 'موردون نشطون',
    placeOrder: 'تقديم طلب',
    filters: 'الفلاتر',
    search: 'بحث',
    searchPh: 'رقم الطلب، المورد، المنتج...',
    status: 'الحالة',
    allStatuses: 'جميع الحالات',
    pending: 'معلق',
    received: 'مستلم',
    cancelled: 'ملغى',
    vendor: 'المورد',
    allVendors: 'جميع الموردين',
    dateRange: 'نطاق التاريخ',
    startDate: 'من تاريخ',
    endDate: 'إلى تاريخ',
    clearFilters: 'مسح جميع الفلاتر',
    orders: 'الطلبات',
    colOrderNo: 'رقم الطلب',
    colDate: 'التاريخ',
    colVendor: 'المورد',
    colProduct: 'المنتج',
    colAmount: 'المبلغ',
    colPayment: 'الدفع',
    colStatus: 'الحالة',
    colActions: 'الإجراءات',
    more: 'أخرى',
    units: 'وحدات',
    noOrders: 'لا توجد طلبات',
    placeFirst: 'قدّم طلبك الأول',
    placeOrderTitle: 'تقديم طلب',
    placeOrderSubtitle: 'أنشئ أمر شراء',
    orderNoAuto: 'رقم الطلب (تلقائي)',
    orderDate: 'تاريخ الطلب',
    selectVendor: 'اختر المورد',
    searchVendorPh: 'ابحث بالاسم أو الشركة أو المعرف',
    noVendors: 'لا يوجد موردون نشطون',
    productsLabel: 'المنتجات',
    addProduct: 'إضافة منتج',
    product: 'المنتج',
    quantity: 'الكمية',
    selectProduct: 'اختر المنتج',
    searchProductPh: 'ابحث بالاسم أو SKU',
    noProducts: 'لا توجد منتجات',
    lineTotal: 'إجمالي السطر',
    remove: 'إزالة',
    orderTotal: 'إجمالي الطلب',
    cancel: 'إلغاء',
    orderPlaced: 'تم تقديم الطلب',
    orderPlacedSub: (no: string) => `${no} محفوظ كمعلق`,
    vendorLabel: 'المورد',
    dateLabel: 'التاريخ',
    itemsLabel: 'العناصر',
    totalLabel: 'الإجمالي',
    sendWhatsApp: 'إرسال على واتساب',
    done: 'تم',
    errSelectProduct: 'اختر منتجاً',
    errQty: 'يجب أن تكون الكمية عدداً صحيحاً أكبر من 0',
    errSelectVendor: 'اختر مورداً',
    errDate: 'تاريخ الطلب مطلوب',
    errStorage: 'تعذر الحفظ — قد تكون مساحة التخزين ممتلئة.',
    orderLabel: 'الطلب',
    orderNo: 'رقم الطلب:',
    date: 'التاريخ:',
    statusLabel: 'الحالة:',
    createdBy: 'أنشأه:',
    itemsCount: (n: number) => `العناصر (${n})`,
    sku: 'SKU',
    qty: 'الكمية',
    unit: 'الوحدة',
    unitPrice: 'سعر الوحدة',
    grandTotal: 'الإجمالي',
    statusHistory: 'سجل الحالة',
    noHistory: 'لا يوجد سجل',
    receiveTitle: 'وضع علامة كمستلم',
    receiveMsg: (no: string) =>
      `وضع ${no} كمستلم؟ ستُضاف الكميات المطلوبة إلى مخزون المنتج.`,
    receiveConfirm: 'وضع كمستلم',
    cancelTitle: 'إلغاء الطلب',
    cancelMsg: (no: string) => `إلغاء ${no}؟ لن يتغير المخزون.`,
    cancelConfirm: 'إلغاء الطلب',
    cancelReasonLabel: 'السبب (اختياري)',
    toastReceived: (no: string) => `${no} تم وضعه كمستلم — تم تحديث المخزون`,
    toastCancelled: (no: string) => `${no} تم إلغاؤه`,
    errOnlyPendingReceive: 'يمكن وضع الطلبات المعلقة فقط كمستلمة.',
    errOnlyPendingCancel: 'يمكن إلغاء الطلبات المعلقة فقط.',
    errStockUpdate: 'تعذر تحديث المخزون — قد تكون مساحة التخزين ممتلئة.',
    errOrderUpdate: 'تعذر تحديث الطلب — قد تكون مساحة التخزين ممتلئة.',
    histOrderPlaced: 'تم تقديم الطلب',
    histGoodsReceived: 'تم استلام البضائع',
    histCancelled: 'ملغى',
    by: 'بواسطة',
    waHello: (name: string) => `مرحباً ${name}،`,
    waPO: 'أمر الشراء',
    waItems: 'العناصر',
    waConfirm: 'يرجى تأكيد التوفر ووقت التسليم. شكراً.',
    showing: 'عرض',
    of: 'من',
    actView: 'عرض',
    actWhatsApp: 'إرسال على واتساب',
    paymentLabel: 'الدفع',
    allPayments: 'جميع المدفوعات',
    payDue: 'عليها رصيد مستحق',
    payUnpaid: 'غير مدفوع',
    payPartial: 'مدفوع جزئياً',
    payPaid: 'مدفوع',
    methodCash: 'نقداً',
    methodBank: 'تحويل بنكي',
    methodCard: 'بطاقة',
    methodOther: 'أخرى',
    addPayment: 'إضافة دفعة',
    addPaymentTitle: (no: string) => `إضافة دفعة — ${no}`,
    amountPaid: 'المبلغ المدفوع',
    fullBtn: 'كامل',
    paymentMethodLabel: 'طريقة الدفع',
    paymentNote: 'ملاحظة (اختياري)',
    paymentNotePh: 'مثال: القسط الثاني',
    confirmPayment: 'تأكيد الدفع',
    paymentHistory: 'سجل المدفوعات',
    noPayments: 'لا توجد مدفوعات مسجلة بعد',
    paymentDate: 'التاريخ',
    paymentAmount: 'المبلغ',
    paymentMethodCol: 'الطريقة',
    balanceAfter: 'الرصيد بعد',
    balanceDue: 'الرصيد المستحق',
    totalPaid: 'إجمالي المدفوع',
    errAmountRequired: 'المبلغ مطلوب',
    errAmountTooHigh: 'المبلغ لا يمكن أن يتجاوز الرصيد المستحق',
    errAdvanceInvalid: 'يجب أن يكون المبلغ بين 0 وإجمالي الطلب',
    toastPaymentAdded: 'تمت إضافة الدفعة بنجاح',
    errPaymentSave: 'تعذر حفظ الدفعة — قد تكون مساحة التخزين ممتلئة.',
    toastAccErr: 'تعذر إنشاء القيد المحاسبي.',
    advanceTitle: 'دفعة مقدمة (اختياري)',
    advanceHint: 'المبلغ المدفوع للمورد الآن. اتركه فارغاً للدفع لاحقاً.',
    legacyPaid: 'تم تحديده كمدفوع قبل إضافة تتبع المدفوعات',
    receiveDueNote: (bal: string) => `سيبقى رصيد ${bal} ضمن مستحقات الموردين.`,
    errCancelHasPayments: 'هذا الطلب يحتوي على مدفوعات ولا يمكن إلغاؤه.',
    actPrint: 'طباعة الإيصال',
    slipTitle: 'أمر شراء',
    slipSignature: 'استلمه',
    slipPaid: 'المدفوع',
    toastPrintOpened: 'تم فتح نافذة الطباعة',
    toastPopupBlocked: 'الطباعة محظورة — اسمح بالنوافذ المنبثقة وحاول مجدداً',
    waPaid: 'المدفوع',
    waBalance: 'المتبقي',
    addNewProduct: 'إضافة منتج جديد',
    addProductTitle: 'إضافة منتج',
    addProductSubtitle: (sku: string) => `SKU: ${sku} (تلقائي)`,
    productName: 'اسم المنتج',
    productNamePh: 'مثال: كنبة عصرية',
    productPrice: 'سعر الوحدة',
    productOpeningStock: 'المخزون الافتتاحي',
    productOpeningHint: 'عادةً 0 — يزيد المخزون عند استلام الطلب.',
    productDescription: 'الوصف (اختياري)',
    productImages: 'الصور (اختياري)',
    upload: 'رفع',
    processing: 'جارٍ المعالجة...',
    saveProduct: 'حفظ المنتج',
    errProductName: 'اسم المنتج مطلوب',
    errProductPrice: 'يجب أن يكون السعر أكبر من 0',
    errProductStock: 'يجب أن يكون المخزون عدداً صحيحاً (0 أو أكثر)',
    errProductDuplicate: (n: string) => `يوجد منتج بالاسم "${n}" بالفعل`,
    errImageType: 'يُسمح فقط بـ JPG وPNG وWEBP',
    errImageProcess: 'تعذرت معالجة الصورة',
    toastProductAdded: (n: string) => `تمت إضافة المنتج — ${n}`,
    companyLabel: 'الشركة',
    contactLabel: 'جهة الاتصال',
    vendorIdLabel: 'معرّف المورد',
    phoneLabel: 'الهاتف',
    addressLabel: 'العنوان',
    orderNumberLabel: 'رقم الطلب',
    createdByLabel: 'أنشأه',
    payingNow: 'المدفوع الآن',
    remainingLabel: 'المتبقي',
    payNowMsg: (paid: string, rem: string) =>
      `ستدفع ${paid} الآن — سيتبقى ${rem} للدفع.`,
    payFullMsg: (paid: string) => `ستدفع المبلغ كاملاً (${paid}). لا يوجد متبقٍ.`,
    vendorSection: 'بيانات المورد',
    orderSection: 'بيانات الطلب',
    summarySection: 'المبالغ',
  },
  ur: {
    pageTitle: 'انوینٹری — آرڈرز',
    statMonthlyPurchases: 'ماہانہ خریداری',
    statMonthlyPurchasesHint: 'اس ماہ موصول',
    statPending: 'زیر التواء آرڈرز',
    statPendingHint: 'کارروائی درکار',
    statSupplierPayable: 'وینڈر واجبات',
    statSupplierPayableHint: 'موصول، مکمل ادا نہیں',
    statTotalVendors: 'کل وینڈرز',
    statTotalVendorsHint: 'فعال وینڈرز',
    placeOrder: 'آرڈر دیں',
    filters: 'فلٹرز',
    search: 'تلاش',
    searchPh: 'آرڈر نمبر، وینڈر، پروڈکٹ...',
    status: 'حالت',
    allStatuses: 'تمام حالتیں',
    pending: 'زیر التواء',
    received: 'موصول',
    cancelled: 'منسوخ',
    vendor: 'وینڈر',
    allVendors: 'تمام وینڈرز',
    dateRange: 'تاریخ کی حد',
    startDate: 'آغاز کی تاریخ',
    endDate: 'اختتام کی تاریخ',
    clearFilters: 'تمام فلٹرز صاف کریں',
    orders: 'آرڈرز',
    colOrderNo: 'آرڈر نمبر',
    colDate: 'تاریخ',
    colVendor: 'وینڈر',
    colProduct: 'پروڈکٹ',
    colAmount: 'رقم',
    colPayment: 'ادائیگی',
    colStatus: 'حالت',
    colActions: 'اقدامات',
    more: 'مزید',
    units: 'یونٹس',
    noOrders: 'کوئی آرڈر نہیں ملا',
    placeFirst: 'اپنا پہلا آرڈر دیں',
    placeOrderTitle: 'آرڈر دیں',
    placeOrderSubtitle: 'خریداری کا آرڈر بنائیں',
    orderNoAuto: 'آرڈر نمبر (خودکار)',
    orderDate: 'آرڈر کی تاریخ',
    selectVendor: 'وینڈر منتخب کریں',
    searchVendorPh: 'نام، کمپنی یا ID سے تلاش کریں',
    noVendors: 'کوئی فعال وینڈر نہیں',
    productsLabel: 'مصنوعات',
    addProduct: 'پروڈکٹ شامل کریں',
    product: 'پروڈکٹ',
    quantity: 'مقدار',
    selectProduct: 'پروڈکٹ منتخب کریں',
    searchProductPh: 'نام یا SKU سے تلاش کریں',
    noProducts: 'کوئی پروڈکٹ نہیں',
    lineTotal: 'لائن کل',
    remove: 'ہٹائیں',
    orderTotal: 'آرڈر کل',
    cancel: 'منسوخ',
    orderPlaced: 'آرڈر دے دیا گیا',
    orderPlacedSub: (no: string) => `${no} زیر التواء محفوظ ہو گیا`,
    vendorLabel: 'وینڈر',
    dateLabel: 'تاریخ',
    itemsLabel: 'اشیاء',
    totalLabel: 'کل',
    sendWhatsApp: 'واٹس ایپ پر بھیجیں',
    done: 'مکمل',
    errSelectProduct: 'پروڈکٹ منتخب کریں',
    errQty: 'مقدار 0 سے زیادہ مکمل عدد ہونی چاہیے',
    errSelectVendor: 'وینڈر منتخب کریں',
    errDate: 'آرڈر کی تاریخ لازمی ہے',
    errStorage: 'محفوظ نہیں ہو سکا — اسٹوریج بھری ہو سکتی ہے۔',
    orderLabel: 'آرڈر',
    orderNo: 'آرڈر نمبر:',
    date: 'تاریخ:',
    statusLabel: 'حالت:',
    createdBy: 'بنایا:',
    itemsCount: (n: number) => `اشیاء (${n})`,
    sku: 'SKU',
    qty: 'مقدار',
    unit: 'یونٹ',
    unitPrice: 'یونٹ قیمت',
    grandTotal: 'کل رقم',
    statusHistory: 'حالت کی تاریخ',
    noHistory: 'کوئی تاریخ نہیں',
    receiveTitle: 'موصول کے طور پر نشان زد کریں',
    receiveMsg: (no: string) =>
      `${no} کو موصول کے طور پر نشان زد کریں؟ آرڈر شدہ مقداریں پروڈکٹ اسٹاک میں شامل ہوں گی۔`,
    receiveConfirm: 'موصول نشان زد کریں',
    cancelTitle: 'آرڈر منسوخ کریں',
    cancelMsg: (no: string) => `${no} منسوخ کریں؟ اسٹاک تبدیل نہیں ہوگا۔`,
    cancelConfirm: 'آرڈر منسوخ کریں',
    cancelReasonLabel: 'وجہ (اختیاری)',
    toastReceived: (no: string) => `${no} موصول کے طور پر نشان زد — اسٹاک اپ ڈیٹ ہو گیا`,
    toastCancelled: (no: string) => `${no} منسوخ ہو گیا`,
    errOnlyPendingReceive: 'صرف زیر التواء آرڈرز کو موصول کے طور پر نشان زد کیا جا سکتا ہے۔',
    errOnlyPendingCancel: 'صرف زیر التواء آرڈرز منسوخ کیے جا سکتے ہیں۔',
    errStockUpdate: 'اسٹاک اپ ڈیٹ نہیں ہو سکا — اسٹوریج بھری ہو سکتی ہے۔',
    errOrderUpdate: 'آرڈر اپ ڈیٹ نہیں ہو سکا — اسٹوریج بھری ہو سکتی ہے۔',
    histOrderPlaced: 'آرڈر دیا گیا',
    histGoodsReceived: 'سامان موصول ہوا',
    histCancelled: 'منسوخ',
    by: 'بذریعہ',
    waHello: (name: string) => `السلام علیکم ${name}،`,
    waPO: 'خریداری آرڈر',
    waItems: 'اشیاء',
    waConfirm: 'براہ کرم دستیابی اور ڈیلیوری کے وقت کی تصدیق کریں۔ شکریہ۔',
    showing: 'دکھا رہے ہیں',
    of: 'میں سے',
    actView: 'دیکھیں',
    actWhatsApp: 'واٹس ایپ پر بھیجیں',
    paymentLabel: 'ادائیگی',
    allPayments: 'تمام ادائیگیاں',
    payDue: 'باقی رقم والے',
    payUnpaid: 'غیر ادا شدہ',
    payPartial: 'جزوی ادا شدہ',
    payPaid: 'ادا شدہ',
    methodCash: 'نقد',
    methodBank: 'بینک ٹرانسفر',
    methodCard: 'کارڈ',
    methodOther: 'دیگر',
    addPayment: 'ادائیگی شامل کریں',
    addPaymentTitle: (no: string) => `ادائیگی شامل کریں — ${no}`,
    amountPaid: 'ادا کردہ رقم',
    fullBtn: 'پورا',
    paymentMethodLabel: 'ادائیگی کا طریقہ',
    paymentNote: 'نوٹ (اختیاری)',
    paymentNotePh: 'مثلاً: دوسری قسط',
    confirmPayment: 'ادائیگی کی تصدیق کریں',
    paymentHistory: 'ادائیگی کی تاریخ',
    noPayments: 'ابھی تک کوئی ادائیگی درج نہیں',
    paymentDate: 'تاریخ',
    paymentAmount: 'رقم',
    paymentMethodCol: 'طریقہ',
    balanceAfter: 'بعد میں باقی',
    balanceDue: 'باقی رقم',
    totalPaid: 'کل ادا شدہ',
    errAmountRequired: 'رقم درکار ہے',
    errAmountTooHigh: 'رقم باقی رقم سے زیادہ نہیں ہو سکتی',
    errAdvanceInvalid: 'رقم 0 اور آرڈر کی کل رقم کے درمیان ہونی چاہیے',
    toastPaymentAdded: 'ادائیگی کامیابی سے شامل ہو گئی',
    errPaymentSave: 'ادائیگی محفوظ نہیں ہو سکی — اسٹوریج بھری ہو سکتی ہے۔',
    toastAccErr: 'اکاؤنٹنگ اندراج نہیں بن سکا۔',
    advanceTitle: 'پیشگی ادائیگی (اختیاری)',
    advanceHint: 'وینڈر کو ابھی ادا کی گئی رقم۔ بعد میں ادا کرنے کے لیے خالی چھوڑیں۔',
    legacyPaid: 'ادائیگی ٹریکنگ شامل ہونے سے پہلے ادا شدہ نشان زد',
    receiveDueNote: (bal: string) => `${bal} کی باقی رقم وینڈر واجبات میں رہے گی۔`,
    errCancelHasPayments: 'اس آرڈر پر ادائیگیاں موجود ہیں، منسوخ نہیں ہو سکتا۔',
    actPrint: 'سلپ پرنٹ کریں',
    slipTitle: 'خریداری آرڈر',
    slipSignature: 'وصول کنندہ',
    slipPaid: 'ادا شدہ',
    toastPrintOpened: 'پرنٹ ونڈو کھل گئی',
    toastPopupBlocked: 'پرنٹ بلاک ہے — پاپ اپ کی اجازت دے کر دوبارہ کوشش کریں',
    waPaid: 'ادا شدہ',
    waBalance: 'باقی',
    addNewProduct: 'نیا پروڈکٹ شامل کریں',
    addProductTitle: 'پروڈکٹ شامل کریں',
    addProductSubtitle: (sku: string) => `SKU: ${sku} (خودکار)`,
    productName: 'پروڈکٹ کا نام',
    productNamePh: 'مثلاً: ماڈرن صوفہ',
    productPrice: 'یونٹ قیمت',
    productOpeningStock: 'ابتدائی اسٹاک',
    productOpeningHint: 'عموماً 0 — آرڈر موصول ہونے پر اسٹاک بڑھتا ہے۔',
    productDescription: 'تفصیل (اختیاری)',
    productImages: 'تصاویر (اختیاری)',
    upload: 'اپ لوڈ',
    processing: 'پروسیسنگ...',
    saveProduct: 'پروڈکٹ محفوظ کریں',
    errProductName: 'پروڈکٹ کا نام درکار ہے',
    errProductPrice: 'قیمت 0 سے زیادہ ہونی چاہیے',
    errProductStock: 'اسٹاک مکمل عدد ہونا چاہیے (0 یا زیادہ)',
    errProductDuplicate: (n: string) => `"${n}" نام کا پروڈکٹ پہلے سے موجود ہے`,
    errImageType: 'صرف JPG، PNG، WEBP کی اجازت ہے',
    errImageProcess: 'تصویر پروسیس نہیں ہو سکی',
    toastProductAdded: (n: string) => `پروڈکٹ شامل ہو گیا — ${n}`,
    companyLabel: 'کمپنی',
    contactLabel: 'رابطہ شخص',
    vendorIdLabel: 'وینڈر آئی ڈی',
    phoneLabel: 'فون',
    addressLabel: 'پتہ',
    orderNumberLabel: 'آرڈر نمبر',
    createdByLabel: 'بنانے والا',
    payingNow: 'ابھی ادا',
    remainingLabel: 'باقی',
    payNowMsg: (paid: string, rem: string) =>
      `آپ ابھی ${paid} ادا کر رہے ہیں — ${rem} باقی رہیں گے۔`,
    payFullMsg: (paid: string) => `آپ پوری رقم (${paid}) ادا کر رہے ہیں۔ کچھ باقی نہیں۔`,
    vendorSection: 'وینڈر کی تفصیلات',
    orderSection: 'آرڈر کی تفصیلات',
    summarySection: 'رقوم',
  },
  hi: {
    pageTitle: 'इन्वेंट्री — ऑर्डर',
    statMonthlyPurchases: 'मासिक खरीद',
    statMonthlyPurchasesHint: 'इस माह प्राप्त',
    statPending: 'लंबित ऑर्डर',
    statPendingHint: 'कार्रवाई बाकी',
    statSupplierPayable: 'विक्रेता देय',
    statSupplierPayableHint: 'प्राप्त, पूरा भुगतान नहीं',
    statTotalVendors: 'कुल विक्रेता',
    statTotalVendorsHint: 'सक्रिय विक्रेता',
    placeOrder: 'ऑर्डर दें',
    filters: 'फ़िल्टर',
    search: 'खोजें',
    searchPh: 'ऑर्डर नंबर, विक्रेता, उत्पाद...',
    status: 'स्थिति',
    allStatuses: 'सभी स्थितियाँ',
    pending: 'लंबित',
    received: 'प्राप्त',
    cancelled: 'रद्द',
    vendor: 'विक्रेता',
    allVendors: 'सभी विक्रेता',
    dateRange: 'तारीख़ सीमा',
    startDate: 'प्रारंभ तिथि',
    endDate: 'अंतिम तिथि',
    clearFilters: 'सभी फ़िल्टर हटाएँ',
    orders: 'ऑर्डर',
    colOrderNo: 'ऑर्डर नंबर',
    colDate: 'तारीख़',
    colVendor: 'विक्रेता',
    colProduct: 'उत्पाद',
    colAmount: 'राशि',
    colPayment: 'भुगतान',
    colStatus: 'स्थिति',
    colActions: 'क्रियाएँ',
    more: 'और',
    units: 'इकाइयाँ',
    noOrders: 'कोई ऑर्डर नहीं मिला',
    placeFirst: 'अपना पहला ऑर्डर दें',
    placeOrderTitle: 'ऑर्डर दें',
    placeOrderSubtitle: 'खरीद ऑर्डर बनाएँ',
    orderNoAuto: 'ऑर्डर संख्या (स्वतः)',
    orderDate: 'ऑर्डर तारीख़',
    selectVendor: 'विक्रेता चुनें',
    searchVendorPh: 'नाम, कंपनी या ID से खोजें',
    noVendors: 'कोई सक्रिय विक्रेता नहीं',
    productsLabel: 'उत्पाद',
    addProduct: 'उत्पाद जोड़ें',
    product: 'उत्पाद',
    quantity: 'मात्रा',
    selectProduct: 'उत्पाद चुनें',
    searchProductPh: 'नाम या SKU से खोजें',
    noProducts: 'कोई उत्पाद नहीं',
    lineTotal: 'पंक्ति कुल',
    remove: 'हटाएँ',
    orderTotal: 'ऑर्डर कुल',
    cancel: 'रद्द करें',
    orderPlaced: 'ऑर्डर दे दिया गया',
    orderPlacedSub: (no: string) => `${no} लंबित के रूप में सहेजा गया`,
    vendorLabel: 'विक्रेता',
    dateLabel: 'तारीख़',
    itemsLabel: 'आइटम',
    totalLabel: 'कुल',
    sendWhatsApp: 'WhatsApp पर भेजें',
    done: 'पूर्ण',
    errSelectProduct: 'उत्पाद चुनें',
    errQty: 'मात्रा 0 से अधिक पूर्ण संख्या होनी चाहिए',
    errSelectVendor: 'विक्रेता चुनें',
    errDate: 'ऑर्डर तारीख़ आवश्यक है',
    errStorage: 'सहेजा नहीं जा सका — स्टोरेज भरा हो सकता है।',
    orderLabel: 'ऑर्डर',
    orderNo: 'ऑर्डर नंबर:',
    date: 'तारीख़:',
    statusLabel: 'स्थिति:',
    createdBy: 'बनाया:',
    itemsCount: (n: number) => `आइटम (${n})`,
    sku: 'SKU',
    qty: 'मात्रा',
    unit: 'इकाई',
    unitPrice: 'इकाई मूल्य',
    grandTotal: 'कुल राशि',
    statusHistory: 'स्थिति इतिहास',
    noHistory: 'कोई इतिहास नहीं',
    receiveTitle: 'प्राप्त के रूप में चिह्नित करें',
    receiveMsg: (no: string) =>
      `${no} को प्राप्त के रूप में चिह्नित करें? ऑर्डर की मात्राएँ उत्पाद स्टॉक में जोड़ी जाएँगी।`,
    receiveConfirm: 'प्राप्त चिह्नित करें',
    cancelTitle: 'ऑर्डर रद्द करें',
    cancelMsg: (no: string) => `${no} रद्द करें? स्टॉक नहीं बदलेगा।`,
    cancelConfirm: 'ऑर्डर रद्द करें',
    cancelReasonLabel: 'कारण (वैकल्पिक)',
    toastReceived: (no: string) => `${no} प्राप्त के रूप में चिह्नित — स्टॉक अपडेट हुआ`,
    toastCancelled: (no: string) => `${no} रद्द किया गया`,
    errOnlyPendingReceive: 'केवल लंबित ऑर्डर ही प्राप्त के रूप में चिह्नित किए जा सकते हैं।',
    errOnlyPendingCancel: 'केवल लंबित ऑर्डर ही रद्द किए जा सकते हैं।',
    errStockUpdate: 'स्टॉक अपडेट नहीं हो सका — स्टोरेज भरा हो सकता है।',
    errOrderUpdate: 'ऑर्डर अपडेट नहीं हो सका — स्टोरेज भरा हो सकता है।',
    histOrderPlaced: 'ऑर्डर दिया गया',
    histGoodsReceived: 'माल प्राप्त हुआ',
    histCancelled: 'रद्द',
    by: 'द्वारा',
    waHello: (name: string) => `नमस्ते ${name},`,
    waPO: 'खरीद ऑर्डर',
    waItems: 'आइटम',
    waConfirm: 'कृपया उपलब्धता और डिलीवरी समय की पुष्टि करें। धन्यवाद।',
    showing: 'दिखा रहे हैं',
    of: 'में से',
    actView: 'देखें',
    actWhatsApp: 'WhatsApp पर भेजें',
    paymentLabel: 'भुगतान',
    allPayments: 'सभी भुगतान',
    payDue: 'बकाया वाले',
    payUnpaid: 'अवैतनिक',
    payPartial: 'आंशिक भुगतान',
    payPaid: 'भुगतान हो गया',
    methodCash: 'नकद',
    methodBank: 'बैंक ट्रांसफ़र',
    methodCard: 'कार्ड',
    methodOther: 'अन्य',
    addPayment: 'भुगतान जोड़ें',
    addPaymentTitle: (no: string) => `भुगतान जोड़ें — ${no}`,
    amountPaid: 'चुकाई गई राशि',
    fullBtn: 'पूरा',
    paymentMethodLabel: 'भुगतान का तरीका',
    paymentNote: 'नोट (वैकल्पिक)',
    paymentNotePh: 'जैसे: दूसरी किस्त',
    confirmPayment: 'भुगतान की पुष्टि करें',
    paymentHistory: 'भुगतान इतिहास',
    noPayments: 'अभी तक कोई भुगतान दर्ज नहीं',
    paymentDate: 'तारीख़',
    paymentAmount: 'राशि',
    paymentMethodCol: 'तरीका',
    balanceAfter: 'बाद में बाकी',
    balanceDue: 'बाकी राशि',
    totalPaid: 'कुल भुगतान',
    errAmountRequired: 'राशि आवश्यक है',
    errAmountTooHigh: 'राशि बाकी राशि से अधिक नहीं हो सकती',
    errAdvanceInvalid: 'राशि 0 और ऑर्डर कुल के बीच होनी चाहिए',
    toastPaymentAdded: 'भुगतान सफलतापूर्वक जोड़ा गया',
    errPaymentSave: 'भुगतान सहेजा नहीं जा सका — स्टोरेज भरा हो सकता है।',
    toastAccErr: 'लेखांकन प्रविष्टि नहीं बन सकी।',
    advanceTitle: 'अग्रिम भुगतान (वैकल्पिक)',
    advanceHint: 'विक्रेता को अभी दी गई राशि। बाद में भुगतान के लिए खाली छोड़ें।',
    legacyPaid: 'भुगतान ट्रैकिंग जुड़ने से पहले भुगतान हुआ चिह्नित',
    receiveDueNote: (bal: string) => `${bal} की बाकी राशि विक्रेता देय में रहेगी।`,
    errCancelHasPayments: 'इस ऑर्डर पर भुगतान दर्ज हैं, रद्द नहीं हो सकता।',
    actPrint: 'स्लिप प्रिंट करें',
    slipTitle: 'खरीद ऑर्डर',
    slipSignature: 'प्राप्तकर्ता',
    slipPaid: 'भुगतान',
    toastPrintOpened: 'प्रिंट विंडो खुली',
    toastPopupBlocked: 'प्रिंट अवरुद्ध — पॉप-अप की अनुमति देकर फिर कोशिश करें',
    waPaid: 'भुगतान',
    waBalance: 'बाकी',
    addNewProduct: 'नया उत्पाद जोड़ें',
    addProductTitle: 'उत्पाद जोड़ें',
    addProductSubtitle: (sku: string) => `SKU: ${sku} (स्वतः)`,
    productName: 'उत्पाद का नाम',
    productNamePh: 'जैसे: मॉडर्न सोफ़ा',
    productPrice: 'इकाई मूल्य',
    productOpeningStock: 'प्रारंभिक स्टॉक',
    productOpeningHint: 'आमतौर पर 0 — ऑर्डर प्राप्त होने पर स्टॉक बढ़ता है।',
    productDescription: 'विवरण (वैकल्पिक)',
    productImages: 'छवियाँ (वैकल्पिक)',
    upload: 'अपलोड',
    processing: 'प्रोसेस हो रहा है...',
    saveProduct: 'उत्पाद सहेजें',
    errProductName: 'उत्पाद का नाम आवश्यक है',
    errProductPrice: 'कीमत 0 से अधिक होनी चाहिए',
    errProductStock: 'स्टॉक पूर्ण संख्या होना चाहिए (0 या अधिक)',
    errProductDuplicate: (n: string) => `"${n}" नाम का उत्पाद पहले से मौजूद है`,
    errImageType: 'केवल JPG, PNG, WEBP की अनुमति है',
    errImageProcess: 'छवि प्रोसेस नहीं हो सकी',
    toastProductAdded: (n: string) => `उत्पाद जोड़ा गया — ${n}`,
    companyLabel: 'कंपनी',
    contactLabel: 'संपर्क व्यक्ति',
    vendorIdLabel: 'विक्रेता आईडी',
    phoneLabel: 'फ़ोन',
    addressLabel: 'पता',
    orderNumberLabel: 'ऑर्डर नंबर',
    createdByLabel: 'बनाने वाला',
    payingNow: 'अभी भुगतान',
    remainingLabel: 'बाकी',
    payNowMsg: (paid: string, rem: string) =>
      `आप अभी ${paid} दे रहे हैं — ${rem} बाकी रहेंगे।`,
    payFullMsg: (paid: string) => `आप पूरी राशि (${paid}) दे रहे हैं। कुछ बाकी नहीं।`,
    vendorSection: 'विक्रेता विवरण',
    orderSection: 'ऑर्डर विवरण',
    summarySection: 'राशियाँ',
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
// ACCOUNTING (payments to vendors = 'Out' entries)
// ============================================================
type AccountingType = 'In' | 'Out' | 'Return';
type AccountingMode = 'Cash' | 'Card' | 'Bank Transfer' | 'Other';

type AccountingTransaction = {
  id: string;
  transactionNo: string;
  date: string;
  customerName: string;
  companyName: string;
  invoiceRef: string;
  invoiceFile?: string;
  invoiceFileName?: string;
  type: AccountingType;
  amount: number;
  status: 'Paid' | 'Partially Paid' | 'Pending' | 'Returned';
  mode: AccountingMode;
  linkedInvoiceId?: string;
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

const accUid = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// ============================================================
// TYPES
// ============================================================
type OrderStatus = 'Pending' | 'Received' | 'Cancelled';
type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Card' | 'Other';
type PaymentStatus = 'Unpaid' | 'Partially Paid' | 'Paid';

type Product = {
  id: string;
  sku: string;
  name: string;
  stock: number;
  lowStockLevel: number;
  active: boolean;
  price?: number;
  unit?: string;
  description?: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
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
};

type OrderItem = {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  unit: string;
};

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
  // ✅ payment tracking (same idea as sales records)
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  balanceDue: number;
  payments: PaymentRecord[];
  createdBy: string;
  createdAt: string;
};

type StatusHistory = {
  id: string;
  orderId: string;
  oldStatus: OrderStatus | null;
  newStatus: OrderStatus;
  reason: string;
  changedBy: string;
  changedAt: string;
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
    <svg {...svgBase} className="w-3.5 h-3.5">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  ),
  printer: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  ),
  coin: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ),
  truck: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  cart: (
    <svg {...svgBase} className="w-5 h-5">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
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
  history: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <path d="M3 3v5h5M3.05 13A9 9 0 1 0 6 5.3L3 8" />
      <path d="M12 7v5l4 2" />
    </svg>
  ),
  upload: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  ),
};

// ============================================================
// CONSTANTS
// ============================================================
const PRODUCTS_KEY = 'zakhira_inventory_products';
const VENDORS_KEY = 'zakhira_inventory_vendors';
const ORDERS_KEY = 'zakhira_inventory_orders';
const HISTORY_KEY = 'zakhira_inventory_status_history';
const ORDERS_FILTER_HANDOFF = 'zakhira_inventory_orders_filter';

const PAGE_SIZE = 10;
const MAX_IMAGES = 5;
const DEFAULT_LOW_STOCK = 5;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Bank Transfer', 'Card', 'Other'];

// ============================================================
// HELPERS
// ============================================================
const uid = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const todayISO = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const roundMoney = (n: number): number =>
  Math.round((n + Number.EPSILON) * 100) / 100;

// ✅ No "SAR" prefix
const formatMoney = (n: number): string => {
  const abs = Math.abs(n);
  return `${n < 0 ? '-' : ''}${abs.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
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

const phoneDigits = (raw: string): string => raw.replace(/\D/g, '');

const isWholeNumber = (s: string): boolean => /^\d+$/.test(s.trim());

const generateOrderNo = (existing: Order[]): string => {
  const numbers = existing
    .map((o) => {
      const m = o.orderNumber.match(/ORD-(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter((n) => n > 0);
  const max = numbers.length ? Math.max(...numbers) : 0;
  return `ORD-${String(max + 1).padStart(4, '0')}`;
};

const generateSKU = (existing: Product[]): string => {
  const numbers = existing
    .map((p) => {
      const m = (p.sku || '').match(/SKU-(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter((n) => n > 0);
  const max = numbers.length ? Math.max(...numbers) : 0;
  return `SKU-${String(max + 1).padStart(4, '0')}`;
};

const unitShort = (unitName?: string): string => {
  return (unitName || FALLBACK_UNIT).trim();
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

const getCompanyInfo = () => {
  try {
    const u = JSON.parse(localStorage.getItem('zakhira_user') || '{}');
    return {
      name: u.companyName || u.company || u.businessName || 'Zakhira',
      address: u.companyAddress || u.address || '',
      phone: u.companyPhone || u.phone || '',
    };
  } catch {
    return { name: 'Zakhira', address: '', phone: '' };
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

const orderStatusLabel = (tr: Translations, s: OrderStatus): string =>
  s === 'Received' ? tr.received : s === 'Cancelled' ? tr.cancelled : tr.pending;

const payLabel = (tr: Translations, s: PaymentStatus): string =>
  s === 'Paid' ? tr.payPaid : s === 'Partially Paid' ? tr.payPartial : tr.payUnpaid;

const methodLabel = (tr: Translations, m: PaymentMethod): string =>
  m === 'Cash'
    ? tr.methodCash
    : m === 'Bank Transfer'
      ? tr.methodBank
      : m === 'Card'
        ? tr.methodCard
        : tr.methodOther;

const payBadgeStyle = (s: PaymentStatus): React.CSSProperties =>
  s === 'Paid'
    ? { background: '#dcfce7', color: '#15803d' }
    : s === 'Partially Paid'
      ? { background: '#fef3c7', color: '#b45309' }
      : { background: '#fee2e2', color: '#b91c1c' };

/** Payments are allowed on Pending (advance) and Received orders while a balance remains. */
const canPay = (o: Order): boolean => o.status !== 'Cancelled' && o.balanceDue > 0;

/** Old orders (saved before payment tracking) get safe defaults. */
const normalizeOrder = (o: Partial<Order>): Order => {
  const total = Number(o.totalAmount) || 0;
  const payments = Array.isArray(o.payments) ? o.payments : [];
  let paymentAmount: number;
  let balanceDue: number;
  let paymentStatus: PaymentStatus;

  if (o.paymentStatus !== undefined) {
    paymentAmount = Number(o.paymentAmount) || 0;
    balanceDue =
      typeof o.balanceDue === 'number'
        ? o.balanceDue
        : roundMoney(Math.max(0, total - paymentAmount));
    paymentStatus = o.paymentStatus;
  } else if (o.status === 'Received') {
    // Legacy: receiving used to book the full amount as paid
    paymentAmount = total;
    balanceDue = 0;
    paymentStatus = 'Paid';
  } else {
    paymentAmount = 0;
    balanceDue = total;
    paymentStatus = 'Unpaid';
  }

  return {
    ...(o as Order),
    items: Array.isArray(o.items)
      ? o.items.map((it: Partial<OrderItem>) => ({
          ...(it as OrderItem),
          unit: (it.unit as string) || FALLBACK_UNIT,
        }))
      : [],
    totalAmount: total,
    paymentStatus,
    paymentAmount,
    balanceDue,
    payments,
  };
};

// ============================================================
// STORAGE
// ============================================================
const loadOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((o: Partial<Order>) => normalizeOrder(o));
  } catch {
    return [];
  }
};

const saveOrders = (list: Order[]): boolean => {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
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

/** Every vendor payment creates one 'Out' accounting entry linked to the order. */
const createOrderPaymentEntry = (
  order: Order,
  payment: PaymentRecord
): AccountingTransaction | null => {
  const existing = loadAccountingList();
  const txn: AccountingTransaction = {
    id: accUid('txn'),
    transactionNo: genAccountingTxnNo(existing),
    date: payment.date,
    customerName: order.vendor.name,
    companyName: order.vendor.companyName,
    invoiceRef: order.orderNumber,
    type: 'Out',
    amount: payment.amount,
    status: payment.balanceAfter > 0 ? 'Partially Paid' : 'Paid',
    mode: payment.method,
    sourceDocumentId: `${order.id}-pay-${payment.id}`,
    sourceModule: 'inventory',
    linkedInvoiceId: order.id,
    notes: `Payment made for Purchase Order ${order.orderNumber} (Balance after: ${payment.balanceAfter})${
      payment.note ? ` — ${payment.note}` : ''
    }`,
    createdAt: new Date().toISOString(),
  };
  if (!saveAccountingList([txn, ...existing])) return null;
  return txn;
};

// Resize + compress image so localStorage doesn't fill up
const processImageFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('image'));
      img.onload = () => {
        const scale = Math.min(1, 800 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('canvas'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.82));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });

// ============================================================
// 💬 WHATSAPP + 🖨️ PRINT SLIP (shared by table, details & "order placed")
// ============================================================
const openOrderWhatsApp = (o: Order, tr: Translations): void => {
  const linesText = o.items.map(
    (it, i) =>
      `${i + 1}. ${it.productName} (${it.sku}) — ${tr.qty}: ${it.quantity} ${it.unit || ''}`
  );
  const msg = [
    tr.waHello(o.vendor.name),
    '',
    `${tr.waPO}: ${o.orderNumber}`,
    `${tr.dateLabel}: ${formatDate(o.orderDate)}`,
    '',
    `${tr.waItems}:`,
    ...linesText,
    '',
    `${tr.totalLabel}: ${formatMoney(o.totalAmount)}`,
    o.paymentAmount > 0 ? `${tr.waPaid}: ${formatMoney(o.paymentAmount)}` : '',
    o.paymentAmount > 0 ? `${tr.waBalance}: ${formatMoney(o.balanceDue)}` : '',
    '',
    tr.waConfirm,
  ]
    .filter((x, i, arr) => x !== '' || arr[i - 1] !== '')
    .join('\n');
  window.open(
    `https://wa.me/${phoneDigits(o.vendor.phone)}?text=${encodeURIComponent(msg)}`,
    '_blank'
  );
};

const escHtml = (s: string | number | undefined | null): string =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Prints an 80mm thermal-style slip through a hidden iframe. Returns false if it could not start. */
const printOrderSlip = (o: Order, tr: Translations, language: Language): boolean => {
  const isRTL = language === 'ar' || language === 'ur';
  const ls = isRTL || language === 'hi' ? '0' : '1px';
  const company = getCompanyInfo();

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
    iframe.remove();
    return false;
  }

  const items = o.items
    .map(
      (it, i) => `<div class="it">
        <div class="nm">${i + 1}. ${escHtml(it.productName)}</div>
        <div class="ln"><span dir="ltr">${it.quantity} ${escHtml(unitShort(it.unit))} × ${formatMoney(it.unitPrice)}</span><span>${formatMoney(it.lineTotal)}</span></div>
      </div>`
    )
    .join('');

  const paidRows =
    o.paymentAmount > 0
      ? `<div class="row"><span>${escHtml(tr.slipPaid)}</span><span>${formatMoney(o.paymentAmount)}</span></div>
         <div class="row b"><span>${escHtml(tr.balanceDue)}</span><span>${formatMoney(o.balanceDue)}</span></div>`
      : '';

  w.document.open();
  w.document.write(`<!doctype html><html lang="${language}" dir="${isRTL ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><title>${escHtml(o.orderNumber)}</title>
<style>
@page{size:80mm auto;margin:0}
*{box-sizing:border-box}
body{font-family:'Noto Sans Devanagari','Noto Naskh Arabic','Noto Nastaliq Urdu',Arial,sans-serif;color:${CHARCOAL};background:#fff;margin:0;padding:4mm;width:80mm;font-size:11px;line-height:1.5}
.c{text-align:center}
.co{font-size:15px;font-weight:700;color:${FOREST}}
.muted{color:${OLIVE};font-size:10px}
.ttl{font-size:13px;font-weight:700;letter-spacing:${ls};margin-top:4px}
.sep{border-top:1px dashed ${CHARCOAL};margin:6px 0}
.row{display:flex;justify-content:space-between;gap:6px}
.b{font-weight:700}
.it{margin-bottom:4px}
.nm{font-weight:600}
.ln{display:flex;justify-content:space-between;gap:6px;color:#444}
.grand{font-size:13px;font-weight:700;color:${FOREST}}
.sig{margin-top:26px;border-top:1px solid ${CHARCOAL};padding-top:3px;text-align:center;font-size:10px;color:${OLIVE}}
</style></head><body>
  <div class="c">
    <div class="co">${escHtml(company.name)}</div>
    ${company.address ? `<div class="muted">${escHtml(company.address)}</div>` : ''}
    ${company.phone ? `<div class="muted" dir="ltr">${escHtml(company.phone)}</div>` : ''}
    <div class="ttl">${escHtml(tr.slipTitle)}</div>
  </div>
  <div class="sep"></div>
  <div class="row"><span>${escHtml(tr.orderNo)}</span><b dir="ltr">${escHtml(o.orderNumber)}</b></div>
  <div class="row"><span>${escHtml(tr.date)}</span><span>${formatDate(o.orderDate)}</span></div>
  <div class="row"><span>${escHtml(tr.statusLabel)}</span><span>${escHtml(orderStatusLabel(tr, o.status))}</span></div>
  <div class="sep"></div>
  <div class="b">${escHtml(o.vendor.companyName)}</div>
  <div>${escHtml(o.vendor.name)}</div>
  <div dir="ltr" class="muted">${escHtml(o.vendor.phone)}</div>
  <div class="sep"></div>
  ${items}
  <div class="sep"></div>
  <div class="row grand"><span>${escHtml(tr.grandTotal)}</span><span>${formatMoney(o.totalAmount)}</span></div>
  ${paidRows}
  <div class="row muted"><span>${escHtml(tr.paymentLabel)}</span><span>${escHtml(payLabel(tr, o.paymentStatus))}</span></div>
  <div class="sig">${escHtml(tr.slipSignature)}</div>
</body></html>`);
  w.document.close();

  setTimeout(() => {
    try {
      w.focus();
      w.print();
    } catch {
      /* ignore */
    }
    setTimeout(() => iframe.remove(), 2000);
  }, 400);
  return true;
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
const thCls =
  'text-[9px] font-bold uppercase tracking-wider px-3 py-2';
const errCls = 'text-[10px] font-semibold mt-1 px-2';
const primaryBtn =
  'h-9 px-4 rounded-full text-[13px] font-bold cursor-pointer transition-all duration-300 hover:brightness-95 hover:shadow-md flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed';
const ghostBtn =
  'h-9 px-4 rounded-full text-[13px] font-bold cursor-pointer border-2 transition-all flex items-center justify-center gap-1.5';
const actionBtnCls =
  'w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition hover:brightness-95 hover:shadow-md flex-shrink-0';

const fieldStyle: React.CSSProperties = {
  background: IVORY,
  borderColor: `${OLIVE}33`,
  color: CHARCOAL,
};
const ghostStyle: React.CSSProperties = {
  background: IVORY,
  color: OLIVE,
  borderColor: `${OLIVE}33`,
};
const warnBox: React.CSSProperties = {
  backgroundColor: 'rgba(196,154,90,0.1)',
  border: '1px solid rgba(196,154,90,0.4)',
  color: CHARCOAL,
};

// ============================================================
// STAT CARD
// ============================================================
function StatCard({
  label,
  value,
  icon,
  color,
  hint,
  onClick,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  hint?: string;
  onClick?: () => void;
}): React.JSX.Element {
  const inner = (
    <>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
        style={{
          backgroundColor: color,
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 10px rgba(0,0,0,0.1)',
        }}
      >
        {icon}
      </div>
      <div className="min-w-0 text-start">
        <p className="text-[14px] font-bold truncate" style={{ color: CHARCOAL }}>
          {value}
        </p>
        <p
          className="text-[9px] uppercase tracking-wider font-bold truncate"
          style={{ color: OLIVE }}
        >
          {label}
        </p>
        {hint && (
          <p className="text-[9px] font-bold mt-0.5 truncate" style={{ color: BRASS }}>
            {hint}
          </p>
        )}
      </div>
    </>
  );
  const cls = 'rounded-2xl p-3 flex items-center gap-2.5 bg-white';
  const style = { border: `1px solid ${OLIVE}1a` };
  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className={`${cls} w-full cursor-pointer transition hover:shadow-md`}
      style={style}
    >
      {inner}
    </button>
  ) : (
    <div className={cls} style={style}>
      {inner}
    </div>
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
      className={`fixed inset-0 ${z} flex items-center justify-center p-4`}
      style={{ backgroundColor: 'rgba(37,42,40,0.4)' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full ${maxWidth} max-h-[92vh] flex flex-col shadow-xl`}
        style={{
          backgroundColor: WHITE,
          borderRadius: 20,
          border: `1px solid ${OLIVE}1a`,
        }}
      >
        <div
          className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b"
          style={{ borderColor: `${OLIVE}1a` }}
        >
          <div className="min-w-0">
            <h2 className="text-sm font-bold" style={{ color: FOREST }}>
              {title}
            </h2>
            {subtitle && (
              <p className="text-[11px] mt-0.5" style={{ color: OLIVE }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center cursor-pointer transition"
            style={{ background: IVORY, color: OLIVE }}
          >
            {Icons.x}
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
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
      <p className="text-[13px] mb-3" style={{ color: OLIVE }}>
        {message}
      </p>
      {reasonLabel && (
        <div className="mb-3">
          <label className={labelCls} style={{ color: CHARCOAL }}>
            {reasonLabel}
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className={textareaCls}
            style={fieldStyle}
          />
        </div>
      )}
      <div className="flex gap-2">
        <button onClick={onCancel} className={`${ghostBtn} flex-1`} style={ghostStyle}>
          {cancelLabel}
        </button>
        <button
          onClick={() => onConfirm(reason)}
          className="flex-1 h-9 rounded-full text-[13px] font-bold cursor-pointer transition"
          style={{ backgroundColor: danger ? CHARCOAL : BRASS, color: WHITE }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

// ============================================================
// SEARCH SELECT (now with optional "+ Add new" button)
// ============================================================
type SelectOption = { value: string; label: string; hint?: string };

function SearchSelect({
  value,
  options,
  onChange,
  placeholder,
  searchPlaceholder = 'Search...',
  emptyText = 'No results',
  invalid = false,
  addLabel,
  onAddNew,
}: {
  value: string;
  options: SelectOption[];
  onChange: (v: string) => void;
  placeholder: string;
  searchPlaceholder?: string;
  emptyText?: string;
  invalid?: boolean;
  addLabel?: string;
  onAddNew?: () => void;
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const selected = options.find((o) => o.value === value);
  const needle = q.trim().toLowerCase();
  const filtered = options.filter((o) =>
    `${o.label} ${o.hint ?? ''}`.toLowerCase().includes(needle)
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${inputCls} text-start flex items-center justify-between gap-2 cursor-pointer`}
        style={{ ...fieldStyle, borderColor: invalid ? BRASS : `${OLIVE}33` }}
      >
        <span className="truncate" style={{ color: selected ? CHARCOAL : `${OLIVE}80` }}>
          {selected ? selected.label : placeholder}
        </span>
        {Icons.chevron}
      </button>
      {open && (
        <div
          className="mt-1.5 rounded-xl border-2 bg-white p-2"
          style={{ borderColor: `${OLIVE}26` }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-8 px-3 rounded-full border text-[12px] focus:outline-none"
            style={fieldStyle}
          />
          <div className="max-h-44 overflow-y-auto mt-2 space-y-0.5">
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-[11px]" style={{ color: OLIVE }}>
                {emptyText}
              </p>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                    setQ('');
                  }}
                  className="w-full text-start px-3 py-1.5 rounded-full text-[12px] cursor-pointer transition"
                  style={{
                    background: o.value === value ? IVORY : 'transparent',
                    color: CHARCOAL,
                    fontWeight: o.value === value ? 700 : 400,
                  }}
                >
                  <span>{o.label}</span>
                  {o.hint && (
                    <span className="text-[10px] ms-2" style={{ color: OLIVE }}>
                      {o.hint}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
          {onAddNew && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setQ('');
                onAddNew();
              }}
              className="mt-2 flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full text-[12px] font-semibold transition-colors hover:bg-[#C49A5A]/10"
              style={{ border: `1.5px dashed ${BRASS}`, color: FOREST }}
            >
              {Icons.plus}
              <span>{addLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// PAYMENT METHOD RADIOS (shared)
// ============================================================
function PaymentMethodRadios({
  name,
  value,
  onChange,
  tr,
}: {
  name: string;
  value: PaymentMethod;
  onChange: (m: PaymentMethod) => void;
  tr: Translations;
}): React.JSX.Element {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1">
      {PAYMENT_METHODS.map((m) => {
        const active = value === m;
        return (
          <label
            key={m}
            className="flex cursor-pointer items-center gap-1.5 text-[11px]"
            style={{ color: CHARCOAL }}
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
              style={{ borderColor: active ? FOREST : `${OLIVE}60` }}
            >
              {active && (
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: FOREST }} />
              )}
            </span>
            {methodLabel(tr, m)}
          </label>
        );
      })}
    </div>
  );
}

// ============================================================
// ADD PAYMENT MODAL (same flow as Sales Records)
// ============================================================
function PaySummary({
  total,
  alreadyPaid = 0,
  paying,
  tr,
}: {
  total: number;
  alreadyPaid?: number;
  paying: number;
  tr: Translations;
}): React.JSX.Element {
  const remaining = roundMoney(Math.max(0, total - alreadyPaid - paying));
  const cells: { label: string; value: number; color: string }[] = [
    { label: tr.orderTotal, value: total, color: CHARCOAL },
    ...(alreadyPaid > 0
      ? [{ label: tr.totalPaid, value: alreadyPaid, color: FOREST }]
      : []),
    { label: tr.payingNow, value: paying, color: FOREST },
    { label: tr.remainingLabel, value: remaining, color: remaining > 0 ? '#dc2626' : '#15803d' },
  ];
  return (
    <div
      className="rounded-xl p-2.5 mt-3"
      style={{ background: IVORY, border: `1px solid ${OLIVE}26` }}
    >
      <div
        className="grid gap-2 text-center"
        style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}
      >
        {cells.map((c) => (
          <div key={c.label} className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-wider truncate" style={{ color: OLIVE }}>
              {c.label}
            </p>
            <p className="text-[13px] font-bold" style={{ color: c.color }}>
              {formatMoney(c.value)}
            </p>
          </div>
        ))}
      </div>
      {paying > 0 && (
        <p
          className="text-[11px] font-semibold mt-2 text-center"
          style={{ color: remaining > 0 ? '#b45309' : '#15803d' }}
        >
          {remaining > 0
            ? tr.payNowMsg(formatMoney(paying), formatMoney(remaining))
            : tr.payFullMsg(formatMoney(paying))}
        </p>
      )}
    </div>
  );
}

function AddPaymentModal({
  order,
  tr,
  onClose,
  onSave,
}: {
  order: Order;
  tr: Translations;
  onClose: () => void;
  onSave: (data: { amount: number; method: PaymentMethod; note?: string }) => void;
}): React.JSX.Element {
  const [amount, setAmount] = useState<number | ''>(order.balanceDue);
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');

  const submit = (): void => {
    const amt = amount === '' ? 0 : Number(amount);
    if (Number.isNaN(amt) || amt <= 0) {
      setErr(tr.errAmountRequired);
      return;
    }
    if (amt > order.balanceDue + 0.001) {
      setErr(tr.errAmountTooHigh);
      return;
    }
    onSave({ amount: roundMoney(amt), method, note: note.trim() || undefined });
  };

  const payingNow = Math.min(order.balanceDue, amount === '' ? 0 : Number(amount) || 0);

  return (
    <Modal
      title={tr.addPaymentTitle(order.orderNumber)}
      subtitle={`${tr.balanceDue}: ${formatMoney(order.balanceDue)}`}
      onClose={onClose}
      maxWidth="max-w-md"
      z="z-[60]"
    >
      <div className="space-y-3">
        <div>
          <label className={labelCls} style={{ color: FOREST }}>
            {tr.amountPaid} <span style={{ color: BRASS }}>*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max={order.balanceDue}
              step="0.01"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value === '' ? '' : Number(e.target.value));
                setErr('');
              }}
              className={`${inputCls} font-bold`}
              style={{ ...fieldStyle, paddingInlineEnd: 64 }}
            />
            <button
              type="button"
              onClick={() => {
                setAmount(order.balanceDue);
                setErr('');
              }}
              className="absolute top-1/2 -translate-y-1/2 end-1.5 h-6 px-3 rounded-full text-[10px] font-bold cursor-pointer transition hover:brightness-95"
              style={{ background: BRASS, color: WHITE }}
            >
              {tr.fullBtn}
            </button>
          </div>
        </div>

        <PaySummary
          total={order.totalAmount}
          alreadyPaid={order.paymentAmount}
          paying={payingNow}
          tr={tr}
        />

        <div>
          <label className={labelCls} style={{ color: FOREST }}>
            {tr.paymentMethodLabel}
          </label>
          <PaymentMethodRadios name="orderPayMethod" value={method} onChange={setMethod} tr={tr} />
        </div>

        <div>
          <label className={labelCls} style={{ color: FOREST }}>
            {tr.paymentNote}
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={tr.paymentNotePh}
            className={inputCls}
            style={fieldStyle}
          />
        </div>

        {err && (
          <div
            className="p-2.5 rounded-xl text-[11px] font-bold flex items-center gap-2"
            style={{ background: '#fee2e2', border: '2px solid #fca5a5', color: '#b91c1c' }}
          >
            {Icons.alert}
            <span>{err}</span>
          </div>
        )}

        <div className="flex gap-2 pt-3 border-t" style={{ borderColor: `${OLIVE}1a` }}>
          <button onClick={onClose} className={`${ghostBtn} flex-1`} style={ghostStyle}>
            {tr.cancel}
          </button>
          <button
            onClick={submit}
            className={`${primaryBtn} flex-1`}
            style={{ backgroundColor: BRASS, color: WHITE }}
          >
            {Icons.coin}
            <span>{tr.confirmPayment}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================
// QUICK ADD PRODUCT MODAL (like "Add Customer" on the Sales page)
// ============================================================
function QuickProductModal({
  tr,
  onClose,
  onSaved,
}: {
  tr: Translations;
  onClose: () => void;
  onSaved: (p: Product) => void;
}): React.JSX.Element {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState(FALLBACK_UNIT);
  const [stock, setStock] = useState('0');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [nextSKU] = useState(() => generateSKU(loadProducts()));

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = e.target.files;
    if (!files) return;
    const toAdd = Array.from(files).slice(0, MAX_IMAGES - images.length);
    setUploading(true);
    setError('');
    try {
      const processed: string[] = [];
      for (const f of toAdd) {
        if (!ALLOWED_IMAGE_TYPES.includes(f.type)) {
          setError(tr.errImageType);
          continue;
        }
        processed.push(await processImageFile(f));
      }
      setImages((prev) => [...prev, ...processed]);
    } catch {
      setError(tr.errImageProcess);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const submit = (): void => {
    const cleanName = name.trim();
    if (!cleanName) return setError(tr.errProductName);
    if (!price || Number(price) <= 0) return setError(tr.errProductPrice);
    if (stock === '' || !isWholeNumber(stock)) return setError(tr.errProductStock);

    const list = loadProducts();
    if (list.some((p) => p.name.trim().toLowerCase() === cleanName.toLowerCase())) {
      return setError(tr.errProductDuplicate(cleanName));
    }

    const now = new Date().toISOString();
    const created: Product = {
      id: uid('prd'),
      sku: generateSKU(list),
      name: cleanName,
      description: description.trim(),
      price: roundMoney(Number(price)),
      stock: Number(stock),
      lowStockLevel: DEFAULT_LOW_STOCK,
      images,
      active: true,
      createdAt: now,
      updatedAt: now,
      unit: unit.trim() || FALLBACK_UNIT,
    };
    if (!saveProducts([created, ...list])) return setError(tr.errStorage);
    onSaved(created);
  };

  return (
    <Modal
      title={tr.addProductTitle}
      subtitle={tr.addProductSubtitle(nextSKU)}
      onClose={onClose}
      maxWidth="max-w-lg"
      z="z-[60]"
    >
      <div className="space-y-3">
        <div>
          <label className={labelCls} style={{ color: CHARCOAL }}>
            {tr.productName} <span style={{ color: BRASS }}>*</span>
          </label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder={tr.productNamePh}
            className={inputCls}
            style={fieldStyle}
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelCls} style={{ color: CHARCOAL }}>
              {tr.productPrice} <span style={{ color: BRASS }}>*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                setError('');
              }}
              className={inputCls}
              style={fieldStyle}
            />
          </div>
          <div>
            <label className={labelCls} style={{ color: CHARCOAL }}>
              {tr.unit}
            </label>
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className={inputCls}
              style={fieldStyle}
            />
          </div>
          <div>
            <label className={labelCls} style={{ color: CHARCOAL }}>
              {tr.productOpeningStock}
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={stock}
              onChange={(e) => {
                setStock(e.target.value);
                setError('');
              }}
              className={inputCls}
              style={fieldStyle}
            />
          </div>
        </div>
        <p className="text-[10px] px-2 -mt-1" style={{ color: OLIVE }}>
          {tr.productOpeningHint}
        </p>

        <div>
          <label className={labelCls} style={{ color: CHARCOAL }}>
            {tr.productDescription}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={textareaCls}
            style={fieldStyle}
          />
        </div>

        <div>
          <label className={labelCls} style={{ color: CHARCOAL }}>
            {tr.productImages} ({images.length}/{MAX_IMAGES})
          </label>
          <div className="grid grid-cols-5 gap-2">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-xl overflow-hidden border"
                style={{ borderColor: `${OLIVE}33` }}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                  className="absolute top-0.5 end-0.5 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer"
                  style={{ background: CHARCOAL, color: WHITE }}
                >
                  {Icons.x}
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <label
                className="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition hover:bg-[#F7F3EA]"
                style={{ borderColor: `${OLIVE}4d`, color: OLIVE }}
              >
                {Icons.upload}
                <span className="text-[9px] mt-1 font-bold">
                  {uploading ? tr.processing : tr.upload}
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
        </div>

        {error && (
          <div
            className="p-2 rounded-full text-[11px] font-semibold flex items-center gap-2"
            style={warnBox}
          >
            {Icons.alert}
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-2.5 pt-3 border-t" style={{ borderColor: `${OLIVE}1a` }}>
          <button
            onClick={submit}
            disabled={uploading}
            className={primaryBtn}
            style={{ backgroundColor: BRASS, color: WHITE }}
          >
            {Icons.check}
            <span>{tr.saveProduct}</span>
          </button>
          <button onClick={onClose} className={ghostBtn} style={ghostStyle}>
            {tr.cancel}
          </button>
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
  tr: Translations;
  pageSize?: number;
}): React.JSX.Element | null {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div
      className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-2 border-t"
      style={{ borderColor: `${OLIVE}1a` }}
    >
      <p className="text-[11px]" style={{ color: OLIVE }}>
        {tr.showing}{' '}
        <b style={{ color: CHARCOAL }}>
          {from}–{to}
        </b>{' '}
        {tr.of} <b style={{ color: CHARCOAL }}>{total}</b>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="w-7 h-7 rounded-full border hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition"
          style={{ background: IVORY, color: OLIVE, borderColor: `${OLIVE}33` }}
        >
          <span className="inline-flex rtl:rotate-180">{Icons.chevronLeft}</span>
        </button>
        {Array.from({ length: pageCount }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1)
          .map((p, idx, arr) => (
            <span key={p} className="flex items-center gap-1">
              {idx > 0 && p - arr[idx - 1] > 1 && (
                <span className="text-[11px]" style={{ color: OLIVE }}>
                  …
                </span>
              )}
              <button
                onClick={() => onPage(p)}
                className="min-w-7 h-7 px-2 rounded-full text-[11px] font-bold cursor-pointer transition"
                style={
                  p === page
                    ? { backgroundColor: BRASS, color: WHITE }
                    : { background: IVORY, color: OLIVE }
                }
              >
                {p}
              </button>
            </span>
          ))}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= pageCount}
          className="w-7 h-7 rounded-full border hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition"
          style={{ background: IVORY, color: OLIVE, borderColor: `${OLIVE}33` }}
        >
          <span className="inline-flex rtl:rotate-180">{Icons.chevronRight}</span>
        </button>
      </div>
    </div>
  );
}

// ============================================================
// STATUS BADGE
// ============================================================
function OrderStatusBadge({
  status,
  tr,
}: {
  status: OrderStatus;
  tr: Translations;
}): React.JSX.Element {
  const style: React.CSSProperties =
    status === 'Received'
      ? { backgroundColor: 'rgba(102,116,90,0.15)', color: FOREST }
      : status === 'Cancelled'
        ? { backgroundColor: CHARCOAL, color: IVORY }
        : { backgroundColor: 'rgba(196,154,90,0.25)', color: CHARCOAL };

  return (
    <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full" style={style}>
      {orderStatusLabel(tr, status)}
    </span>
  );
}

function PaymentBadge({
  order,
  tr,
}: {
  order: Order;
  tr: Translations;
}): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
        style={payBadgeStyle(order.paymentStatus)}
      >
        {payLabel(tr, order.paymentStatus)}
      </span>
      {order.paymentStatus === 'Partially Paid' && order.balanceDue > 0 && (
        <span className="text-[8px] font-semibold whitespace-nowrap" style={{ color: OLIVE }}>
          {formatMoney(order.balanceDue)}
        </span>
      )}
    </div>
  );
}

// ============================================================
// PLACE ORDER MODAL
// ✅ + Add new product inline  ✅ + optional advance payment
// ✅ + Print slip / WhatsApp after saving
// ============================================================
type OrderLine = { key: string; productId: string; quantity: string };

function PlaceOrderModal({
  onClose,
  onSaved,
  tr,
  language,
}: {
  onClose: () => void;
  onSaved: (accountingOk: boolean) => void;
  tr: Translations;
  language: Language;
}): React.JSX.Element {
  const [products, setProducts] = useState<Product[]>(() =>
    loadProducts().filter((p) => p.active)
  );
  const [vendors] = useState(() => loadVendors().filter((v) => v.active));
  const [vendorId, setVendorId] = useState('');
  const [orderDate, setOrderDate] = useState(todayISO());
  const [lines, setLines] = useState<OrderLine[]>(() => [
    { key: uid('ln'), productId: '', quantity: '1' },
  ]);
  const [orderNo] = useState(() => generateOrderNo(loadOrders()));
  const [errors, setErrors] = useState<{
    vendor?: string;
    date?: string;
    advance?: string;
    line: Record<string, string>;
  }>({ line: {} });
  const [saveError, setSaveError] = useState('');
  const [placed, setPlaced] = useState<Order | null>(null);
  const [printErr, setPrintErr] = useState('');

  const [advance, setAdvance] = useState<number | ''>('');
  const [advMethod, setAdvMethod] = useState<PaymentMethod>('Cash');
  const [quickForLine, setQuickForLine] = useState<string | null>(null);

  const productOptions = (line: OrderLine): SelectOption[] => {
    const takenElsewhere = new Set(
      lines.filter((l) => l.key !== line.key).map((l) => l.productId)
    );
    return products
      .filter((p) => !takenElsewhere.has(p.id))
      .map((p) => ({
        value: p.id,
        label: `${p.name} — ${p.sku}`,
        hint: `${p.stock} ${unitShort(p.unit)} · ${formatMoney(p.price || 0)}`,
      }));
  };

  const updateLine = (key: string, patch: Partial<OrderLine>): void =>
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  // Picking a product on the last line automatically opens the next empty line
  const selectProduct = (
    key: string,
    productId: string,
    productCount: number = products.length
  ): void =>
    setLines((ls) => {
      const next = ls.map((l) => (l.key === key ? { ...l, productId } : l));
      const isLast = ls[ls.length - 1]?.key === key;
      const hasEmpty = next.some((l) => !l.productId);
      if (isLast && !hasEmpty && next.length < productCount) {
        return [...next, { key: uid('ln'), productId: '', quantity: '1' }];
      }
      return next;
    });

  const priceOf = (productId: string): number => {
    const p = products.find((x) => x.id === productId);
    return p && typeof p.price === 'number' ? p.price : 0;
  };
  const lineTotalReal = (l: OrderLine): number => {
    if (!l.productId || !isWholeNumber(l.quantity)) return 0;
    return roundMoney(priceOf(l.productId) * Number(l.quantity));
  };
  const grandTotal = roundMoney(lines.reduce((s, l) => s + lineTotalReal(l), 0));
  const advNum = advance === '' ? 0 : Number(advance) || 0;
  const balancePreview = roundMoney(Math.max(0, grandTotal - advNum));

  const submit = (): void => {
    const e: typeof errors = { line: {} };
    // ignore the empty "next" line(s); keep a single empty line so the error shows
    const filled = lines.length > 1 ? lines.filter((l) => l.productId) : lines;
    const finalLines = filled.length > 0 ? filled : [lines[0]];
    finalLines.forEach((l) => {
      if (!l.productId) e.line[l.key] = tr.errSelectProduct;
      else if (!isWholeNumber(l.quantity) || Number(l.quantity) <= 0)
        e.line[l.key] = tr.errQty;
    });
    if (!vendorId) e.vendor = tr.errSelectVendor;
    if (!orderDate) e.date = tr.errDate;
    if (advNum < 0 || advNum > grandTotal + 0.001) e.advance = tr.errAdvanceInvalid;
    setErrors(e);
    if (e.vendor || e.date || e.advance || Object.keys(e.line).length > 0) return;

    const vendor = vendors.find((v) => v.id === vendorId);
    if (!vendor) return;

    const items: OrderItem[] = [];
    for (const line of finalLines) {
      const p = products.find((x) => x.id === line.productId);
      if (!p) continue;
      const unitPrice = typeof p.price === 'number' ? p.price : 0;
      items.push({
        id: uid('oi'),
        productId: p.id,
        sku: p.sku,
        productName: p.name,
        quantity: Number(line.quantity),
        unitPrice,
        lineTotal: roundMoney(unitPrice * Number(line.quantity)),
        unit: p.unit || FALLBACK_UNIT,
      });
    }

    const now = new Date().toISOString();
    const user = getCurrentUser();
    const total = roundMoney(items.reduce((s, i) => s + i.lineTotal, 0));
    const paid = roundMoney(Math.min(total, advNum));
    const balance = roundMoney(Math.max(0, total - paid));

    const firstPayment: PaymentRecord | null =
      paid > 0
        ? {
            id: uid('pay'),
            date: todayISO(),
            amount: paid,
            method: advMethod,
            balanceAfter: balance,
            recordedBy: user.name,
            createdAt: now,
          }
        : null;

    const newOrder: Order = {
      id: uid('ord'),
      orderNumber: orderNo,
      vendorId: vendor.id,
      vendor: {
        uniqueId: vendor.uniqueId,
        name: vendor.name,
        companyName: vendor.companyName,
        phone: vendor.phone,
        vatNumber: vendor.vatNumber,
        address: vendor.address,
        city: vendor.city,
      },
      orderDate,
      status: 'Pending',
      items,
      totalAmount: total,
      paymentStatus: balance <= 0 ? 'Paid' : paid > 0 ? 'Partially Paid' : 'Unpaid',
      paymentAmount: paid,
      balanceDue: balance,
      payments: firstPayment ? [firstPayment] : [],
      createdBy: user.name,
      createdAt: now,
    };

    if (!saveOrders([newOrder, ...loadOrders()])) {
      setSaveError(tr.errStorage);
      return;
    }

    saveHistory([
      ...loadHistory(),
      {
        id: uid('sh'),
        orderId: newOrder.id,
        oldStatus: null,
        newStatus: 'Pending',
        reason: tr.histOrderPlaced,
        changedBy: user.name,
        changedAt: now,
      },
    ]);

    const accOk = firstPayment ? createOrderPaymentEntry(newOrder, firstPayment) !== null : true;

    setPlaced(newOrder);
    onSaved(accOk);
  };

  // ---------- Step 2: order saved → Print slip / WhatsApp ----------
  if (placed) {
    return (
      <Modal
        title={tr.orderPlaced}
        subtitle={tr.orderPlacedSub(placed.orderNumber)}
        onClose={onClose}
        maxWidth="max-w-md"
      >
        <div className="rounded-xl p-3 text-[12px] space-y-1.5 mb-3" style={{ background: IVORY }}>
          <div className="flex justify-between">
            <span style={{ color: OLIVE }}>{tr.vendorLabel}</span>
            <span className="font-semibold text-end" style={{ color: CHARCOAL }}>
              {placed.vendor.companyName}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: OLIVE }}>{tr.dateLabel}</span>
            <span className="font-semibold" style={{ color: CHARCOAL }}>
              {formatDate(placed.orderDate)}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: OLIVE }}>{tr.itemsLabel}</span>
            <span className="font-semibold" style={{ color: CHARCOAL }}>
              {placed.items.length}
            </span>
          </div>
          <div
            className="flex justify-between pt-1.5 border-t"
            style={{ borderColor: `${OLIVE}1a` }}
          >
            <span className="font-bold" style={{ color: CHARCOAL }}>
              {tr.totalLabel}
            </span>
            <span className="font-bold" style={{ color: BRASS }}>
              {formatMoney(placed.totalAmount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: OLIVE }}>{tr.totalPaid}</span>
            <span className="font-semibold" style={{ color: CHARCOAL }}>
              {formatMoney(placed.paymentAmount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: OLIVE }}>{tr.balanceDue}</span>
            <span
              className="font-bold"
              style={{ color: placed.balanceDue > 0 ? '#dc2626' : '#15803d' }}
            >
              {formatMoney(placed.balanceDue)}
            </span>
          </div>
        </div>

        {printErr && (
          <div
            className="p-2 rounded-full text-[11px] font-semibold flex items-center gap-2 mb-3"
            style={warnBox}
          >
            {Icons.alert}
            <span>{printErr}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => openOrderWhatsApp(placed, tr)}
            className="h-9 rounded-full text-[13px] font-bold cursor-pointer transition flex items-center justify-center gap-1.5"
            style={{ backgroundColor: FOREST, color: WHITE }}
          >
            {Icons.whatsapp}
            <span>{tr.sendWhatsApp}</span>
          </button>
          <button
            onClick={() =>
              setPrintErr(printOrderSlip(placed, tr, language) ? '' : tr.toastPopupBlocked)
            }
            className="h-9 rounded-full text-[13px] font-bold cursor-pointer transition flex items-center justify-center gap-1.5"
            style={{ backgroundColor: BRASS, color: WHITE }}
          >
            {Icons.printer}
            <span>{tr.actPrint}</span>
          </button>
          <button onClick={onClose} className={ghostBtn} style={ghostStyle}>
            {tr.done}
          </button>
        </div>
      </Modal>
    );
  }

  // ---------- Step 1: form ----------
  return (
    <>
      <Modal
        title={tr.placeOrderTitle}
        subtitle={tr.placeOrderSubtitle}
        onClose={onClose}
        maxWidth="max-w-2xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className={labelCls} style={{ color: CHARCOAL }}>
              {tr.orderNoAuto}
            </label>
            <input
              value={orderNo}
              readOnly
              dir="ltr"
              className={`${inputCls} font-mono cursor-not-allowed`}
              style={{ ...fieldStyle, color: OLIVE }}
            />
          </div>
          <div>
            <label className={labelCls} style={{ color: CHARCOAL }}>
              {tr.orderDate} <span style={{ color: BRASS }}>*</span>
            </label>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className={inputCls}
              style={{ ...fieldStyle, borderColor: errors.date ? BRASS : `${OLIVE}33` }}
            />
            {errors.date && (
              <p className={errCls} style={{ color: BRASS }}>
                {errors.date}
              </p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls} style={{ color: CHARCOAL }}>
              {tr.vendor} <span style={{ color: BRASS }}>*</span>
            </label>
            <SearchSelect
              value={vendorId}
              onChange={setVendorId}
              placeholder={tr.selectVendor}
              searchPlaceholder={tr.searchVendorPh}
              emptyText={tr.noVendors}
              invalid={!!errors.vendor}
              options={vendors.map((v) => ({
                value: v.id,
                label: `${v.companyName} — ${v.name}`,
                hint: v.uniqueId,
              }))}
            />
            {errors.vendor && (
              <p className={errCls} style={{ color: BRASS }}>
                {errors.vendor}
              </p>
            )}
          </div>
        </div>

        <h3 className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: FOREST }}>
          {tr.productsLabel}
        </h3>

        <div className="space-y-2.5 mb-4">
          {lines.map((l, idx) => {
            const sel = products.find((p) => p.id === l.productId);
            return (
              <div
                key={l.key}
                className="rounded-xl border p-2.5"
                style={{ borderColor: `${OLIVE}26` }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_130px] gap-2.5">
                  <div>
                    <label className={labelCls} style={{ color: CHARCOAL }}>
                      {tr.product} {lines.length > 1 ? idx + 1 : ''}{' '}
                      <span style={{ color: BRASS }}>*</span>
                    </label>
                    <SearchSelect
                      value={l.productId}
                      onChange={(v) => selectProduct(l.key, v)}
                      placeholder={tr.selectProduct}
                      searchPlaceholder={tr.searchProductPh}
                      emptyText={tr.noProducts}
                      invalid={!!errors.line[l.key] && !l.productId}
                      options={productOptions(l)}
                      addLabel={tr.addNewProduct}
                      onAddNew={() => setQuickForLine(l.key)}
                    />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: CHARCOAL }}>
                      {tr.quantity} <span style={{ color: BRASS }}>*</span>
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={l.quantity}
                        onChange={(e) => updateLine(l.key, { quantity: e.target.value })}
                        className={inputCls}
                        style={{
                          ...fieldStyle,
                          borderColor: errors.line[l.key] ? BRASS : `${OLIVE}33`,
                        }}
                      />
                      {sel && (
                        <span
                          className="text-[10px] font-bold whitespace-nowrap px-1"
                          style={{ color: OLIVE }}
                        >
                          {unitShort(sel.unit)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {errors.line[l.key] && (
                  <p className={errCls} style={{ color: BRASS }}>
                    {errors.line[l.key]}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2 px-1">
                  <span className="text-[11px]" style={{ color: OLIVE }}>
                    {tr.lineTotal}: <b style={{ color: CHARCOAL }}>{formatMoney(lineTotalReal(l))}</b>
                  </span>
                  {lines.length > 1 && (
                    <button
                      onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))}
                      className="text-[11px] font-bold cursor-pointer hover:underline"
                      style={{ color: BRASS }}
                    >
                      {tr.remove}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="flex justify-between items-center rounded-xl px-3 py-2.5 mb-4"
          style={{ background: IVORY }}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: CHARCOAL }}>
            {tr.orderTotal}
          </span>
          <span className="text-[14px] font-bold" style={{ color: BRASS }}>
            {formatMoney(grandTotal)}
          </span>
        </div>

        {/* ✅ Advance payment (optional) */}
        <div className="rounded-xl border p-3 mb-4" style={{ borderColor: `${OLIVE}26` }}>
          <h3
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ color: FOREST }}
          >
            {tr.advanceTitle}
          </h3>
          <p className="text-[10px] mb-2" style={{ color: OLIVE }}>
            {tr.advanceHint}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls} style={{ color: CHARCOAL }}>
                {tr.amountPaid}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max={grandTotal}
                  step="0.01"
                  value={advance}
                  onChange={(e) =>
                    setAdvance(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="0.00"
                  className={`${inputCls} font-bold`}
                  style={{
                    ...fieldStyle,
                    paddingInlineEnd: 64,
                    borderColor: errors.advance ? BRASS : `${OLIVE}33`,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setAdvance(grandTotal)}
                  disabled={grandTotal <= 0}
                  className="absolute top-1/2 -translate-y-1/2 end-1.5 h-6 px-3 rounded-full text-[10px] font-bold cursor-pointer transition hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: BRASS, color: WHITE }}
                >
                  {tr.fullBtn}
                </button>
              </div>
              {errors.advance && (
                <p className={errCls} style={{ color: BRASS }}>
                  {errors.advance}
                </p>
              )}
            </div>
            <div>
              <label className={labelCls} style={{ color: CHARCOAL }}>
                {tr.balanceDue}
              </label>
              <div
                className={`${inputCls} flex items-center font-bold`}
                style={{
                  ...fieldStyle,
                  color: balancePreview > 0 ? '#dc2626' : '#15803d',
                  cursor: 'default',
                }}
              >
                {formatMoney(balancePreview)}
              </div>
            </div>
          </div>
          <PaySummary total={grandTotal} paying={advNum} tr={tr} />
          {advNum > 0 && (
            <div className="mt-2">
              <label className={labelCls} style={{ color: CHARCOAL }}>
                {tr.paymentMethodLabel}
              </label>
              <PaymentMethodRadios
                name="advancePayMethod"
                value={advMethod}
                onChange={setAdvMethod}
                tr={tr}
              />
            </div>
          )}
        </div>

        {saveError && (
          <div
            className="p-2 rounded-full text-[11px] font-semibold flex items-center gap-2 mb-4"
            style={warnBox}
          >
            {Icons.alert}
            <span>{saveError}</span>
          </div>
        )}

        <div className="flex gap-2.5 pt-3 border-t" style={{ borderColor: `${OLIVE}1a` }}>
          <button
            onClick={submit}
            className={primaryBtn}
            style={{ backgroundColor: BRASS, color: WHITE }}
          >
            {Icons.cart}
            <span>{tr.placeOrder}</span>
          </button>
          <button onClick={onClose} className={ghostBtn} style={ghostStyle}>
            {tr.cancel}
          </button>
        </div>
      </Modal>

      {quickForLine && (
        <QuickProductModal
          tr={tr}
          onClose={() => setQuickForLine(null)}
          onSaved={(p) => {
            setProducts((prev) => [p, ...prev]);
            selectProduct(quickForLine, p.id, products.length + 1);
            setQuickForLine(null);
          }}
        />
      )}
    </>
  );
}

// ============================================================
// ORDER DETAILS MODAL (+ payments, print, WhatsApp)
// ============================================================
function ReadField({
  label,
  value,
  mono = false,
  ltr = false,
  strong = false,
  color,
}: {
  label: string;
  value: string;
  mono?: boolean;
  ltr?: boolean;
  strong?: boolean;
  color?: string;
}): React.JSX.Element {
  return (
    <div>
      <label className={labelCls} style={{ color: FOREST }}>
        {label}
      </label>
      <input
        type="text"
        readOnly
        value={value || '—'}
        title={value}
        dir={ltr ? 'ltr' : undefined}
        className={`${inputCls} ${mono ? 'font-mono' : ''} ${strong ? 'font-bold' : ''}`}
        style={{ ...fieldStyle, cursor: 'default', color: color || CHARCOAL }}
      />
    </div>
  );
}

function OrderDetailsModal({
  order,
  history,
  tr,
  onClose,
  onAddPayment,
  onPrint,
  onWhatsApp,
}: {
  order: Order;
  history: StatusHistory[];
  tr: Translations;
  onClose: () => void;
  onAddPayment: (o: Order) => void;
  onPrint: (o: Order) => void;
  onWhatsApp: (o: Order) => void;
}): React.JSX.Element {
  const orderHistory = history
    .filter((h) => h.orderId === order.id)
    .sort((a, b) => a.changedAt.localeCompare(b.changedAt));

  return (
    <Modal
      title={order.orderNumber}
      subtitle={`${formatDate(order.orderDate)} • ${orderStatusLabel(tr, order.status)}`}
      onClose={onClose}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onPrint(order)}
            className="h-8 px-3 rounded-full text-[12px] font-bold cursor-pointer flex items-center gap-1.5 transition hover:brightness-95"
            style={{ backgroundColor: BRASS, color: WHITE }}
          >
            {Icons.printer}
            <span>{tr.actPrint}</span>
          </button>
          <button
            type="button"
            onClick={() => onWhatsApp(order)}
            className="h-8 px-3 rounded-full text-[12px] font-bold cursor-pointer flex items-center gap-1.5 transition hover:brightness-95"
            style={{ backgroundColor: FOREST, color: WHITE }}
          >
            {Icons.whatsapp}
            <span>{tr.actWhatsApp}</span>
          </button>
          {canPay(order) && (
            <button
              type="button"
              onClick={() => onAddPayment(order)}
              className="h-8 px-3 rounded-full text-[12px] font-bold cursor-pointer flex items-center gap-1.5 border transition hover:bg-white"
              style={{ background: IVORY, color: FOREST, borderColor: `${FOREST}80` }}
            >
              {Icons.coin}
              <span>{tr.addPayment}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl p-3 space-y-2" style={{ background: IVORY }}>
            <h3 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: OLIVE }}>
              {tr.vendorSection}
            </h3>
            <ReadField label={tr.companyLabel} value={order.vendor.companyName} />
            <ReadField label={tr.contactLabel} value={order.vendor.name} />
            <ReadField label={tr.vendorIdLabel} value={order.vendor.uniqueId} ltr mono />
            <ReadField label={tr.phoneLabel} value={order.vendor.phone} ltr />
            <ReadField
              label={tr.addressLabel}
              value={[order.vendor.address, order.vendor.city].filter(Boolean).join(', ')}
            />
          </div>
          <div className="rounded-xl p-3 space-y-2" style={{ background: IVORY }}>
            <h3 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: OLIVE }}>
              {tr.orderSection}
            </h3>
            <ReadField label={tr.orderNumberLabel} value={order.orderNumber} ltr mono />
            <ReadField label={tr.orderDate} value={formatDate(order.orderDate)} />
            <ReadField label={tr.status} value={orderStatusLabel(tr, order.status)} />
            <ReadField label={tr.paymentLabel} value={payLabel(tr, order.paymentStatus)} />
            <ReadField label={tr.createdByLabel} value={order.createdBy} />
          </div>
        </div>

        <div className="rounded-xl p-3" style={{ background: IVORY }}>
          <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: OLIVE }}>
            {tr.summarySection}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <ReadField label={tr.grandTotal} value={formatMoney(order.totalAmount)} strong color={BRASS} />
            <ReadField label={tr.totalPaid} value={formatMoney(order.paymentAmount)} strong color={FOREST} />
            <ReadField
              label={tr.balanceDue}
              value={formatMoney(order.balanceDue)}
              strong
              color={order.balanceDue > 0 ? '#dc2626' : '#15803d'}
            />
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: OLIVE }}>
            {tr.itemsCount(order.items.length)}
          </h3>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: `${OLIVE}26` }}>
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ background: IVORY, borderColor: `${OLIVE}1a` }}>
                  <th className={`text-start ${thCls}`} style={{ color: OLIVE }}>{tr.sku}</th>
                  <th className={`text-start ${thCls}`} style={{ color: OLIVE }}>{tr.product}</th>
                  <th className={`text-center ${thCls} w-28`} style={{ color: OLIVE }}>{tr.qty}</th>
                  <th className={`text-end ${thCls} w-28`} style={{ color: OLIVE }}>{tr.unitPrice}</th>
                  <th className={`text-end ${thCls} w-28`} style={{ color: OLIVE }}>{tr.totalLabel}</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it) => (
                  <tr key={it.id} className="border-b" style={{ borderColor: `${OLIVE}0d` }}>
                    <td className="px-3 py-1.5 text-[11px] font-mono" style={{ color: CHARCOAL }}>
                      {it.sku}
                    </td>
                    <td className="px-3 py-1.5 text-[12px] font-semibold" style={{ color: CHARCOAL }}>
                      {it.productName}
                    </td>
                    <td className="px-3 py-1.5 text-center text-[12px]" style={{ color: CHARCOAL }}>
                      {it.quantity} {unitShort(it.unit)}
                    </td>
                    <td className="px-3 py-1.5 text-end text-[12px]" style={{ color: OLIVE }}>
                      {formatMoney(it.unitPrice)}
                    </td>
                    <td className="px-3 py-1.5 text-end text-[12px] font-bold" style={{ color: CHARCOAL }}>
                      {formatMoney(it.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2" style={{ background: IVORY, borderColor: `${BRASS}4d` }}>
                  <td
                    colSpan={4}
                    className="px-3 py-2 text-end text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: CHARCOAL }}
                  >
                    {tr.grandTotal}
                  </td>
                  <td className="px-3 py-2 text-end text-[13px] font-bold" style={{ color: BRASS }}>
                    {formatMoney(order.totalAmount)}
                  </td>
                </tr>
                <tr style={{ background: IVORY }}>
                  <td colSpan={4} className="px-3 py-1 text-end text-[10px] font-bold uppercase tracking-wider" style={{ color: OLIVE }}>
                    {tr.totalPaid}
                  </td>
                  <td className="px-3 py-1 text-end text-[12px] font-bold" style={{ color: CHARCOAL }}>
                    {formatMoney(order.paymentAmount)}
                  </td>
                </tr>
                <tr style={{ background: IVORY }}>
                  <td colSpan={4} className="px-3 py-1 text-end text-[10px] font-bold uppercase tracking-wider" style={{ color: OLIVE }}>
                    {tr.balanceDue}
                  </td>
                  <td
                    className="px-3 py-1 text-end text-[12px] font-bold"
                    style={{ color: order.balanceDue > 0 ? '#dc2626' : '#15803d' }}
                  >
                    {formatMoney(order.balanceDue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ✅ Payment history */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1" style={{ color: OLIVE }}>
              <span>{Icons.coin}</span>
              <span>{tr.paymentHistory}</span>
            </h3>
            {canPay(order) && (
              <button
                type="button"
                onClick={() => onAddPayment(order)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition"
                style={{ backgroundColor: BRASS, color: WHITE }}
              >
                {Icons.plus}
                <span>{tr.addPayment}</span>
              </button>
            )}
          </div>
          {order.payments.length === 0 ? (
            <p className="text-[11px] px-2 italic" style={{ color: OLIVE }}>
              {order.paymentStatus === 'Paid' && order.paymentAmount > 0
                ? tr.legacyPaid
                : tr.noPayments}
            </p>
          ) : (
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: `${OLIVE}26` }}>
              <table className="w-full">
                <thead>
                  <tr style={{ background: IVORY }}>
                    <th className={`text-start ${thCls}`} style={{ color: OLIVE }}>{tr.paymentDate}</th>
                    <th className={`text-end ${thCls} w-24`} style={{ color: OLIVE }}>{tr.paymentAmount}</th>
                    <th className={`text-center ${thCls} w-28`} style={{ color: OLIVE }}>{tr.paymentMethodCol}</th>
                    <th className={`text-end ${thCls} w-28`} style={{ color: OLIVE }}>{tr.balanceAfter}</th>
                  </tr>
                </thead>
                <tbody>
                  {order.payments.map((p) => (
                    <tr key={p.id} className="border-t" style={{ borderColor: `${OLIVE}1a` }}>
                      <td className="px-3 py-1.5 text-[11px]" style={{ color: CHARCOAL }}>
                        {formatDate(p.date)}
                        {p.note && (
                          <span className="block text-[9px]" style={{ color: OLIVE }}>
                            {p.note}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-1.5 text-end text-[11px] font-bold" style={{ color: FOREST }}>
                        {formatMoney(p.amount)}
                      </td>
                      <td className="px-3 py-1.5 text-center text-[11px]" style={{ color: OLIVE }}>
                        {methodLabel(tr, p.method)}
                      </td>
                      <td
                        className="px-3 py-1.5 text-end text-[11px] font-bold"
                        style={{ color: p.balanceAfter > 0 ? '#dc2626' : '#15803d' }}
                      >
                        {formatMoney(p.balanceAfter)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1" style={{ color: OLIVE }}>
            <span>{Icons.history}</span>
            <span>{tr.statusHistory}</span>
          </h3>
          <div className="space-y-1.5">
            {orderHistory.length === 0 ? (
              <p className="text-[11px] px-2" style={{ color: OLIVE }}>
                {tr.noHistory}
              </p>
            ) : (
              orderHistory.map((h) => (
                <div
                  key={h.id}
                  className="flex items-start gap-2.5 px-2.5 py-1.5 rounded-xl"
                  style={{ background: IVORY }}
                >
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: BRASS }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold" style={{ color: CHARCOAL }}>
                      {h.oldStatus ? `${orderStatusLabel(tr, h.oldStatus)} → ` : ''}
                      {orderStatusLabel(tr, h.newStatus)}
                    </p>
                    <p className="text-[9px] mt-0.5" style={{ color: OLIVE }}>
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
// MAIN COMPONENT
// ============================================================
type PaymentFilter = 'All' | 'Due' | PaymentStatus;

export default function OrdersPage(): React.JSX.Element {
  const [language, setLanguage] = useState<Language>(() => getStoredLanguage());
  useEffect(() => {
    const sync = () => setLanguage(getStoredLanguage());
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
    };
  }, []);

  const isRTL = language === 'ar' || language === 'ur';
  const tr: Translations = t[language];

  const [orders, setOrders] = useState<Order[]>(() => loadOrders());
  const [history, setHistory] = useState<StatusHistory[]>(() => loadHistory());
  const [vendors, setVendors] = useState<Vendor[]>(() => loadVendors());

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [showPlaceOrder, setShowPlaceOrder] = useState(false);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [receiveTarget, setReceiveTarget] = useState<Order | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<Order | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('All');
  const [vendorFilter, setVendorFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    try {
      const v = localStorage.getItem(ORDERS_FILTER_HANDOFF);
      if (v === 'Pending' || v === 'Received' || v === 'Cancelled') {
        setStatusFilter(v);
        localStorage.removeItem(ORDERS_FILTER_HANDOFF);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const refresh = (): void => {
    setOrders(loadOrders());
    setHistory(loadHistory());
    setVendors(loadVendors());
  };

  // keep the page in sync with other tabs / returning to the page
  useEffect(() => {
    const onStorage = (e: StorageEvent): void => {
      if (
        e.key === ORDERS_KEY ||
        e.key === HISTORY_KEY ||
        e.key === VENDORS_KEY ||
        e.key === PRODUCTS_KEY
      ) {
        refresh();
      }
    };
    const onFocus = (): void => refresh();
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

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

  // ==========================================================
  // 📊 STAT CARDS
  // ==========================================================
  // 1) Monthly Purchases — Received orders this month
  const monthlyPurchases = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return roundMoney(
      orders
        .filter((o) => {
          if (o.status !== 'Received') return false;
          const d = new Date(o.orderDate);
          return d.getFullYear() === year && d.getMonth() === month;
        })
        .reduce((s, o) => s + o.totalAmount, 0)
    );
  }, [orders]);

  // 2) Pending Orders
  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status === 'Pending').length,
    [orders]
  );

  // 3) ✅ Supplier Payable — what we still owe on RECEIVED orders
  //    (balance shrinks as payments are added; hits 0 when fully paid)
  const supplierPayable = useMemo(
    () =>
      roundMoney(
        orders
          .filter((o) => o.status === 'Received')
          .reduce((s, o) => s + o.balanceDue, 0)
      ),
    [orders]
  );

  // 4) Total Vendors
  const totalVendors = useMemo(
    () => vendors.filter((v) => v.active).length,
    [vendors]
  );

  const filtered = useMemo(() => {
    let list = [...orders];

    if (statusFilter !== 'All') list = list.filter((o) => o.status === statusFilter);
    if (paymentFilter === 'Due') {
      list = list.filter((o) => o.status !== 'Cancelled' && o.balanceDue > 0);
    } else if (paymentFilter !== 'All') {
      list = list.filter((o) => o.paymentStatus === paymentFilter);
    }
    if (vendorFilter !== 'All') list = list.filter((o) => o.vendorId === vendorFilter);
    if (dateFrom) list = list.filter((o) => o.orderDate >= dateFrom);
    if (dateTo) list = list.filter((o) => o.orderDate <= dateTo);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.vendor.name.toLowerCase().includes(q) ||
          o.vendor.companyName.toLowerCase().includes(q) ||
          o.items.some((it) => it.productName.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return list;
  }, [orders, statusFilter, paymentFilter, vendorFilter, dateFrom, dateTo, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const clearFilters = (): void => {
    setSearch('');
    setStatusFilter('All');
    setPaymentFilter('All');
    setVendorFilter('All');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    statusFilter !== 'All' ||
    paymentFilter !== 'All' ||
    vendorFilter !== 'All' ||
    dateFrom !== '' ||
    dateTo !== '';

  // ==========================================================
  // HANDLERS
  // ==========================================================
  const handlePrint = (o: Order): void => {
    if (printOrderSlip(o, tr, language)) showSuccess(tr.toastPrintOpened);
    else showError(tr.toastPopupBlocked);
  };

  const handleReceive = (order: Order): void => {
    const fresh = loadOrders().find((o) => o.id === order.id);
    if (!fresh || fresh.status !== 'Pending') {
      showError(tr.errOnlyPendingReceive);
      setReceiveTarget(null);
      return;
    }

    const now = new Date().toISOString();
    const user = getCurrentUser();

    const updatedProducts = loadProducts().map((p) => {
      const qty = fresh.items
        .filter((i) => i.productId === p.id)
        .reduce((s, i) => s + i.quantity, 0);
      return qty > 0 ? { ...p, stock: p.stock + qty, updatedAt: now } : p;
    });
    if (!saveProducts(updatedProducts)) {
      showError(tr.errStockUpdate);
      setReceiveTarget(null);
      return;
    }

    const updatedOrders = loadOrders().map((o) =>
      o.id === fresh.id ? { ...o, status: 'Received' as OrderStatus } : o
    );
    if (!saveOrders(updatedOrders)) {
      showError(tr.errOrderUpdate);
      setReceiveTarget(null);
      return;
    }

    // Money is NOT booked here anymore — only real payments create accounting entries.
    // Whatever is unpaid now shows up in "Supplier Payable".
    saveHistory([
      ...loadHistory(),
      {
        id: uid('sh'),
        orderId: fresh.id,
        oldStatus: 'Pending',
        newStatus: 'Received',
        reason: tr.histGoodsReceived,
        changedBy: user.name,
        changedAt: now,
      },
    ]);

    refresh();
    setReceiveTarget(null);
    showSuccess(tr.toastReceived(fresh.orderNumber));
  };

  const handleCancel = (order: Order, reason: string): void => {
    const fresh = loadOrders().find((o) => o.id === order.id);
    if (!fresh || fresh.status !== 'Pending') {
      showError(tr.errOnlyPendingCancel);
      setCancelTarget(null);
      return;
    }
    if (fresh.paymentAmount > 0) {
      showError(tr.errCancelHasPayments);
      setCancelTarget(null);
      return;
    }

    const now = new Date().toISOString();
    const user = getCurrentUser();

    const updatedOrders = loadOrders().map((o) =>
      o.id === fresh.id ? { ...o, status: 'Cancelled' as OrderStatus } : o
    );
    if (!saveOrders(updatedOrders)) {
      showError(tr.errOrderUpdate);
      setCancelTarget(null);
      return;
    }

    saveHistory([
      ...loadHistory(),
      {
        id: uid('sh'),
        orderId: fresh.id,
        oldStatus: 'Pending',
        newStatus: 'Cancelled',
        reason: reason.trim() || tr.histCancelled,
        changedBy: user.name,
        changedAt: now,
      },
    ]);

    refresh();
    setCancelTarget(null);
    showSuccess(tr.toastCancelled(fresh.orderNumber));
  };

  const handleAddPayment = (
    order: Order,
    data: { amount: number; method: PaymentMethod; note?: string }
  ): void => {
    const all = loadOrders();
    const current = all.find((o) => o.id === order.id);
    if (!current || !canPay(current)) {
      setPaymentTarget(null);
      return;
    }
    if (data.amount <= 0 || data.amount > current.balanceDue + 0.001) {
      showError(tr.errAmountTooHigh);
      return;
    }

    const user = getCurrentUser();
    const newTotalPaid = roundMoney(current.paymentAmount + data.amount);
    const newBalance = roundMoney(Math.max(0, current.totalAmount - newTotalPaid));
    const newStatus: PaymentStatus =
      newBalance <= 0 ? 'Paid' : newTotalPaid > 0 ? 'Partially Paid' : 'Unpaid';

    const newPayment: PaymentRecord = {
      id: uid('pay'),
      date: todayISO(),
      amount: roundMoney(data.amount),
      method: data.method,
      note: data.note,
      balanceAfter: newBalance,
      recordedBy: user.name,
      createdAt: new Date().toISOString(),
    };

    const updatedOrder: Order = {
      ...current,
      payments: [...current.payments, newPayment],
      paymentAmount: newTotalPaid,
      balanceDue: newBalance,
      paymentStatus: newStatus,
    };

    if (!saveOrders(all.map((o) => (o.id === current.id ? updatedOrder : o)))) {
      showError(tr.errPaymentSave);
      return;
    }

    const txn = createOrderPaymentEntry(updatedOrder, newPayment);
    if (!txn) showError(tr.toastAccErr);

    refresh();
    setPaymentTarget(null);
    setViewOrder((prev) => (prev && prev.id === updatedOrder.id ? updatedOrder : prev));
    if (txn) showSuccess(tr.toastPaymentAdded);
  };

  const totalQtyLabel = (o: Order): string => {
    if (o.items.length === 0) return '0';
    const total = o.items.reduce((s, i) => s + i.quantity, 0);
    return `${total} ${unitShort(o.items[0].unit)}`;
  };

  const receiveMessage = (o: Order): string =>
    o.balanceDue > 0
      ? `${tr.receiveMsg(o.orderNumber)} ${tr.receiveDueNote(formatMoney(o.balanceDue))}`
      : tr.receiveMsg(o.orderNumber);

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={language}
      className="min-h-screen w-full min-w-0 max-w-full p-4 lg:p-5"
      style={{ background: IVORY }}
    >
      <div className="mb-4">
        <h1 className="text-xl font-bold" style={{ color: FOREST }}>
          {tr.pageTitle}
        </h1>
      </div>

      {successMsg && (
        <div
          className="mb-3 px-3 py-2 rounded-full text-[11px] font-bold flex items-center gap-2"
          style={{
            backgroundColor: 'rgba(102,116,90,0.15)',
            border: '2px solid rgba(102,116,90,0.3)',
            color: FOREST,
          }}
        >
          {Icons.check}
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div
          className="mb-3 px-3 py-2 rounded-full text-[11px] font-bold flex items-center gap-2"
          style={{
            backgroundColor: 'rgba(196,154,90,0.15)',
            border: '2px solid rgba(196,154,90,0.4)',
            color: CHARCOAL,
          }}
        >
          {Icons.alert}
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 4 STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard
          label={tr.statMonthlyPurchases}
          value={formatMoney(monthlyPurchases)}
          icon={Icons.money}
          color={FOREST}
          hint={tr.statMonthlyPurchasesHint}
        />
        <StatCard
          label={tr.statPending}
          value={String(pendingOrders)}
          icon={Icons.clock}
          color={BRASS}
          hint={pendingOrders > 0 ? tr.statPendingHint : undefined}
          onClick={() => {
            setStatusFilter('Pending');
            setPaymentFilter('All');
            setPage(1);
          }}
        />
        <StatCard
          label={tr.statSupplierPayable}
          value={formatMoney(supplierPayable)}
          icon={Icons.cart}
          color={CHARCOAL}
          hint={tr.statSupplierPayableHint}
          onClick={() => {
            setStatusFilter('Received');
            setPaymentFilter('Due');
            setPage(1);
          }}
        />
        <StatCard
          label={tr.statTotalVendors}
          value={String(totalVendors)}
          icon={Icons.truck}
          color={FOREST}
          hint={tr.statTotalVendorsHint}
        />
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={() => setShowPlaceOrder(true)}
          className={primaryBtn}
          style={{ backgroundColor: BRASS, color: WHITE }}
        >
          {Icons.cart}
          <span>{tr.placeOrder}</span>
        </button>
      </div>

      {/* FILTERS */}
      <div
        className="rounded-2xl border p-3.5 mb-4"
        style={{ backgroundColor: WHITE, borderColor: `${OLIVE}1a` }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span style={{ color: OLIVE }}>{Icons.sliders}</span>
          <h3 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: FOREST }}>
            {tr.filters}
          </h3>
        </div>
        <div className="grid min-w-0 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="min-w-0 lg:col-span-2">
            <label className={labelCls} style={{ color: CHARCOAL }}>
              {tr.search}
            </label>
            <div className="relative">
              <span
                className="absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none"
                style={{ color: OLIVE }}
              >
                {Icons.search}
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={tr.searchPh}
                className={`${inputCls} ps-9`}
                style={fieldStyle}
              />
            </div>
          </div>

          <div className="min-w-0">
            <label className={labelCls} style={{ color: CHARCOAL }}>
              {tr.status}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as typeof statusFilter);
                setPage(1);
              }}
              className={`${inputCls} cursor-pointer`}
              style={fieldStyle}
            >
              <option value="All">{tr.allStatuses}</option>
              <option value="Pending">{tr.pending}</option>
              <option value="Received">{tr.received}</option>
              <option value="Cancelled">{tr.cancelled}</option>
            </select>
          </div>

          <div className="min-w-0">
            <label className={labelCls} style={{ color: CHARCOAL }}>
              {tr.paymentLabel}
            </label>
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value as PaymentFilter);
                setPage(1);
              }}
              className={`${inputCls} cursor-pointer`}
              style={fieldStyle}
            >
              <option value="All">{tr.allPayments}</option>
              <option value="Due">{tr.payDue}</option>
              <option value="Unpaid">{tr.payUnpaid}</option>
              <option value="Partially Paid">{tr.payPartial}</option>
              <option value="Paid">{tr.payPaid}</option>
            </select>
          </div>

          <div className="min-w-0">
            <label className={labelCls} style={{ color: CHARCOAL }}>
              {tr.vendor}
            </label>
            <select
              value={vendorFilter}
              onChange={(e) => {
                setVendorFilter(e.target.value);
                setPage(1);
              }}
              className={`${inputCls} cursor-pointer`}
              style={fieldStyle}
            >
              <option value="All">{tr.allVendors}</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.companyName}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-0 lg:col-span-2">
            <label className={labelCls} style={{ color: CHARCOAL }}>
              {tr.dateRange}
            </label>
            <div className="grid min-w-0 grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className={`${inputCls} min-w-0 px-2`}
                aria-label={tr.startDate}
                style={fieldStyle}
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                className={`${inputCls} min-w-0 px-2`}
                aria-label={tr.endDate}
                style={fieldStyle}
              />
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div
            className="flex justify-end mt-3 pt-3 border-t"
            style={{ borderColor: `${OLIVE}1a` }}
          >
            <button
              onClick={clearFilters}
              className="text-[10px] font-bold hover:underline cursor-pointer"
              style={{ color: BRASS }}
            >
              {tr.clearFilters}
            </button>
          </div>
        )}
      </div>

      {/* ORDERS TABLE */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: WHITE, borderColor: `${OLIVE}1a` }}
      >
        <div
          className="px-4 py-2.5 border-b"
          style={{ background: IVORY, borderColor: `${OLIVE}1a` }}
        >
          <h2 className="text-[13px] font-bold" style={{ color: FOREST }}>
            {tr.orders} <span className="text-[11px] font-normal">({filtered.length})</span>
          </h2>
        </div>

        {paginated.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b" style={{ background: IVORY, borderColor: `${OLIVE}1a` }}>
                    <th className={`text-start ${thCls}`} style={{ color: OLIVE }}>{tr.colOrderNo}</th>
                    <th className={`text-start ${thCls}`} style={{ color: OLIVE }}>{tr.colDate}</th>
                    <th className={`text-start ${thCls} hidden md:table-cell`} style={{ color: OLIVE }}>{tr.colVendor}</th>
                    <th className={`text-start ${thCls} hidden lg:table-cell`} style={{ color: OLIVE }}>{tr.colProduct}</th>
                    <th className={`text-end ${thCls}`} style={{ color: OLIVE }}>{tr.colAmount}</th>
                    <th className={`text-center ${thCls}`} style={{ color: OLIVE }}>{tr.colPayment}</th>
                    <th className={`text-center ${thCls}`} style={{ color: OLIVE }}>{tr.colStatus}</th>
                    <th className={`text-center ${thCls} whitespace-nowrap`} style={{ color: OLIVE }}>{tr.colActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((o) => (
                    <tr
                      key={o.id}
                      className="border-b transition"
                      style={{ borderColor: `${OLIVE}0d` }}
                    >
                      <td className="px-3 py-2">
                        <p
                          className="text-[12px] font-bold font-mono"
                          dir="ltr"
                          style={{ color: CHARCOAL, textAlign: isRTL ? 'right' : 'left' }}
                        >
                          {o.orderNumber}
                        </p>
                      </td>
                      <td
                        className="px-3 py-2 text-[11px] font-semibold whitespace-nowrap"
                        style={{ color: CHARCOAL }}
                      >
                        {formatDate(o.orderDate)}
                      </td>
                      <td className="px-3 py-2 hidden md:table-cell">
                        <p
                          className="text-[12px] font-semibold truncate max-w-[180px]"
                          style={{ color: CHARCOAL }}
                        >
                          {o.vendor.companyName}
                        </p>
                        <p className="text-[9px] font-mono mt-0.5" dir="ltr" style={{ color: OLIVE }}>
                          {o.vendor.uniqueId}
                        </p>
                      </td>
                      <td className="px-3 py-2 hidden lg:table-cell">
                        <p className="text-[11px] truncate max-w-[200px]" style={{ color: CHARCOAL }}>
                          {o.items[0]?.productName}
                          {o.items.length > 1 && (
                            <span style={{ color: OLIVE }}>
                              {' '}
                              +{o.items.length - 1} {tr.more}
                            </span>
                          )}
                        </p>
                        <p className="text-[9px] mt-0.5" style={{ color: OLIVE }}>
                          {totalQtyLabel(o)}
                        </p>
                      </td>
                      <td
                        className="px-3 py-2 text-end text-[12px] font-bold whitespace-nowrap"
                        style={{ color: CHARCOAL }}
                      >
                        {formatMoney(o.totalAmount)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {o.status === 'Cancelled' ? (
                          <span className="text-[10px]" style={{ color: OLIVE }}>—</span>
                        ) : (
                          <PaymentBadge order={o} tr={tr} />
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <OrderStatusBadge status={o.status} tr={tr} />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-nowrap items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setViewOrder(o)}
                            title={tr.actView}
                            aria-label={`${tr.actView} ${o.orderNumber}`}
                            className={`${actionBtnCls} border`}
                            style={{ backgroundColor: IVORY, color: OLIVE, borderColor: `${OLIVE}40` }}
                          >
                            {Icons.eye}
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePrint(o)}
                            title={tr.actPrint}
                            aria-label={`${tr.actPrint} ${o.orderNumber}`}
                            className={`${actionBtnCls} border`}
                            style={{ backgroundColor: IVORY, color: FOREST, borderColor: `${OLIVE}40` }}
                          >
                            {Icons.printer}
                          </button>
                          <button
                            type="button"
                            onClick={() => openOrderWhatsApp(o, tr)}
                            title={tr.actWhatsApp}
                            aria-label={`${tr.actWhatsApp} ${o.orderNumber}`}
                            className={actionBtnCls}
                            style={{ backgroundColor: FOREST, color: WHITE }}
                          >
                            {Icons.whatsapp}
                          </button>
                          {canPay(o) && (
                            <button
                              type="button"
                              onClick={() => setPaymentTarget(o)}
                              title={tr.addPayment}
                              aria-label={`${tr.addPayment} ${o.orderNumber}`}
                              className={actionBtnCls}
                              style={{ backgroundColor: BRASS, color: WHITE }}
                            >
                              {Icons.coin}
                            </button>
                          )}
                          {o.status === 'Pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => setReceiveTarget(o)}
                                title={tr.receiveTitle}
                                aria-label={`${tr.receiveTitle} ${o.orderNumber}`}
                                className={actionBtnCls}
                                style={{ backgroundColor: FOREST, color: WHITE }}
                              >
                                {Icons.check}
                              </button>
                              <button
                                type="button"
                                onClick={() => setCancelTarget(o)}
                                title={tr.cancelTitle}
                                aria-label={`${tr.cancelTitle} ${o.orderNumber}`}
                                className={`${actionBtnCls} border`}
                                style={{
                                  backgroundColor: 'rgba(196,154,90,0.15)',
                                  color: CHARCOAL,
                                  borderColor: 'rgba(196,154,90,0.4)',
                                }}
                              >
                                {Icons.x}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination page={safePage} total={filtered.length} onPage={setPage} tr={tr} />
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="text-[13px]" style={{ color: OLIVE }}>
              {tr.noOrders}
            </p>
            <button
              onClick={() => setShowPlaceOrder(true)}
              className="mt-2 text-[11px] font-bold hover:underline cursor-pointer"
              style={{ color: BRASS }}
            >
              {tr.placeFirst}
            </button>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showPlaceOrder && (
        <PlaceOrderModal
          onClose={() => setShowPlaceOrder(false)}
          onSaved={(accOk) => {
            refresh();
            if (!accOk) showError(tr.toastAccErr);
          }}
          tr={tr}
          language={language}
        />
      )}

      {viewOrder && (
        <OrderDetailsModal
          order={viewOrder}
          history={history}
          tr={tr}
          onClose={() => setViewOrder(null)}
          onAddPayment={(o) => setPaymentTarget(o)}
          onPrint={handlePrint}
          onWhatsApp={(o) => openOrderWhatsApp(o, tr)}
        />
      )}

      {paymentTarget && (
        <AddPaymentModal
          order={paymentTarget}
          tr={tr}
          onClose={() => setPaymentTarget(null)}
          onSave={(data) => handleAddPayment(paymentTarget, data)}
        />
      )}

      {receiveTarget && (
        <ConfirmModal
          title={tr.receiveTitle}
          message={receiveMessage(receiveTarget)}
          confirmLabel={tr.receiveConfirm}
          cancelLabel={tr.cancel}
          onConfirm={() => handleReceive(receiveTarget)}
          onCancel={() => setReceiveTarget(null)}
        />
      )}

      {cancelTarget && (
        <ConfirmModal
          title={tr.cancelTitle}
          message={tr.cancelMsg(cancelTarget.orderNumber)}
          confirmLabel={tr.cancelConfirm}
          cancelLabel={tr.cancel}
          danger
          reasonLabel={tr.cancelReasonLabel}
          onConfirm={(reason) => handleCancel(cancelTarget, reason)}
          onCancel={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}