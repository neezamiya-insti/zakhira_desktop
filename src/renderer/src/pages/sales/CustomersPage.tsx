/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable prettier/prettier */
/* eslint-disable react-refresh/only-export-components */
import { useEffect, useMemo, useRef, useState } from 'react';

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
// 🌍 LANGUAGE
// ============================================================
type Language = 'en' | 'ar' | 'ur' | 'hi';

const t = {
  en: {
    pageTitle: 'Sales — Customers',
    pageSubtitle: 'Maintain the customer directory',
    totalCustomers: 'Total Customers',
    customerRevenue: 'Customer Revenue',
    selectCustomerPrompt: 'Select a customer to view revenue',
    customerRevenueHint: 'VAT-exclusive · net of returns',
    addCustomer: 'Add Customer',
    filters: 'Filters',
    search: 'Search',
    searchPh: 'Name, company, phone, email...',
    city: 'City',
    allCities: 'All Cities',
    sortBy: 'Sort By',
    sortDateNewest: 'Date Added (newest)',
    sortOldest: 'Date Added (oldest)',
    sortNameAZ: 'Name (A–Z)',
    sortNameZA: 'Name (Z–A)',
    clearFilters: 'Clear all filters',
    colName: 'Name',
    colCompany: 'Company',
    colPhone: 'Phone',
    colEmail: 'Email',
    colCity: 'City',
    colCreated: 'Created',
    colActions: 'Actions',
    customers: 'Customers',
    noCustomers: 'No customers found',
    addFirstCustomer: 'Add your first customer',
    actView: 'View',
    actEdit: 'Edit',
    actDelete: 'Delete',
    editCustomer: 'Edit Customer',
    addCustomerTitle: 'Add Customer',
    updatingCustomer: (name: string) => `Updating ${name}`,
    createNewCustomer: 'Create a new customer record',
    customerName: 'Customer Name',
    company: 'Company',
    phoneNumber: 'Phone Number',
    email: 'Email',
    address: 'Address',
    customerNamePh: 'Ahmed Al-Farsi',
    companyPh: 'Al-Farsi Trading Co.',
    phonePh: '+966 50 123 4567',
    phonePhLocal: '0501234567',
    phoneIntlLabel: 'With country code',
    phoneLocalLabel: 'Without country code (no validation)',
    phoneEitherHint: 'Fill at least one of the two.',
    errPhoneEither: 'Enter at least one phone number',
    emailPh: 'ahmed@example.com',
    cityPh: 'Riyadh',
    addressPh: 'Street, Building, Area',
    required: 'required',
    emailHint: 'Optional — for invoices & reminders.',
    saveCustomer: 'Save Customer',
    updateCustomer: 'Update Customer',
    cancel: 'Cancel',
    errNameRequired: 'Customer name is required',
    errPhoneRequired: 'Phone number is required',
    errPhoneInvalid: 'Enter phone with country code, e.g. +966 50 123 4567',
    errEmailInvalid: 'Enter a valid email address',
    errDuplicatePhone: (name: string) =>
      `This phone number already belongs to ${name}. Each phone number must be unique.`,
    errStorageFull: 'Could not save — storage may be full.',
    customerLabel: 'Customer',
    created: 'Created',
    updated: 'Updated',
    documentsCount: (n: number) => `${n} document${n === 1 ? '' : 's'}`,
    deleteTitle: 'Delete Customer',
    deleteMsg: (name: string) => `Delete ${name}? This cannot be undone.`,
    deleteConfirm: 'Delete',
    toastCreated: (name: string) => `Customer added — ${name}`,
    toastUpdated: (name: string) => `Customer updated — ${name}`,
    toastDeleted: (name: string) => `Deleted — ${name}`,
    errHasDocuments: (name: string, n: number) =>
      `${name} has ${n} document${n === 1 ? '' : 's'} and cannot be deleted.`,
    errDeleteStorage: 'Could not delete — storage may be full.',
    showing: 'Showing',
    of: 'of',
    // Revenue card labels
    revenue: 'Revenue',
    noRevenue: 'No approved invoices yet',
  },
  ar: {
    pageTitle: 'المبيعات — العملاء',
    pageSubtitle: 'حافظ على دليل العملاء',
    totalCustomers: 'إجمالي العملاء',
    customerRevenue: 'إيرادات العميل',
    selectCustomerPrompt: 'اختر عميلاً لعرض الإيرادات',
    customerRevenueHint: 'بدون ضريبة · بعد المرتجعات',
    addCustomer: 'إضافة عميل',
    filters: 'الفلاتر',
    search: 'بحث',
    searchPh: 'الاسم، الشركة، الهاتف، البريد...',
    city: 'المدينة',
    allCities: 'جميع المدن',
    sortBy: 'ترتيب حسب',
    sortDateNewest: 'تاريخ الإضافة (الأحدث)',
    sortOldest: 'تاريخ الإضافة (الأقدم)',
    sortNameAZ: 'الاسم (أ–ي)',
    sortNameZA: 'الاسم (ي–أ)',
    clearFilters: 'مسح جميع الفلاتر',
    colName: 'الاسم',
    colCompany: 'الشركة',
    colPhone: 'الهاتف',
    colEmail: 'البريد الإلكتروني',
    colCity: 'المدينة',
    colCreated: 'أُنشئ',
    colActions: 'الإجراءات',
    customers: 'العملاء',
    noCustomers: 'لا يوجد عملاء',
    addFirstCustomer: 'أضف أول عميل لك',
    actView: 'عرض',
    actEdit: 'تعديل',
    actDelete: 'حذف',
    editCustomer: 'تعديل العميل',
    addCustomerTitle: 'إضافة عميل',
    updatingCustomer: (name: string) => `تحديث ${name}`,
    createNewCustomer: 'أنشئ سجل عميل جديد',
    customerName: 'اسم العميل',
    company: 'الشركة',
    phoneNumber: 'رقم الهاتف',
    email: 'البريد الإلكتروني',
    address: 'العنوان',
    customerNamePh: 'أحمد الفارسي',
    companyPh: 'شركة الفارسي للتجارة',
    phonePh: '+966 50 123 4567',
    phonePhLocal: '0501234567',
    phoneIntlLabel: 'مع رمز الدولة',
    phoneLocalLabel: 'بدون رمز الدولة (بدون تحقق)',
    phoneEitherHint: 'املأ حقلاً واحداً على الأقل. يجب أن يكون كل رقم فريداً.',
    errPhoneEither: 'أدخل رقم هاتف واحداً على الأقل',
    emailPh: 'ahmed@example.com',
    cityPh: 'الرياض',
    addressPh: 'الشارع، المبنى، المنطقة',
    required: 'مطلوب',
    emailHint: 'اختياري — للفواتير والتذكيرات.',
    saveCustomer: 'حفظ العميل',
    updateCustomer: 'تحديث العميل',
    cancel: 'إلغاء',
    errNameRequired: 'اسم العميل مطلوب',
    errPhoneRequired: 'رقم الهاتف مطلوب',
    errPhoneInvalid: 'أدخل الهاتف مع رمز الدولة، مثل +966 50 123 4567',
    errEmailInvalid: 'أدخل بريداً إلكترونياً صالحاً',
    errDuplicatePhone: (name: string) =>
      `رقم الهاتف هذا مسجّل بالفعل للعميل ${name}. يجب أن يكون كل رقم فريداً.`,
    errStorageFull: 'تعذر الحفظ — قد تكون مساحة التخزين ممتلئة.',
    customerLabel: 'عميل',
    created: 'أُنشئ',
    updated: 'حُدّث',
    documentsCount: (n: number) => `${n} مستند`,
    deleteTitle: 'حذف العميل',
    deleteMsg: (name: string) => `حذف ${name}؟ لا يمكن التراجع.`,
    deleteConfirm: 'حذف',
    toastCreated: (name: string) => `تمت إضافة العميل — ${name}`,
    toastUpdated: (name: string) => `تم تحديث العميل — ${name}`,
    toastDeleted: (name: string) => `تم الحذف — ${name}`,
    errHasDocuments: (name: string, n: number) =>
      `${name} لديه ${n} مستند ولا يمكن حذفه.`,
    errDeleteStorage: 'تعذر الحذف — قد تكون مساحة التخزين ممتلئة.',
    showing: 'عرض',
    of: 'من',
    revenue: 'الإيراد',
    noRevenue: 'لا توجد فواتير معتمدة بعد',
  },
  ur: {
    pageTitle: 'فروخت — کسٹمرز',
    pageSubtitle: 'کسٹمر ڈائریکٹری برقرار رکھیں',
    totalCustomers: 'کل کسٹمرز',
    customerRevenue: 'کسٹمر آمدنی',
    selectCustomerPrompt: 'آمدنی دیکھنے کے لیے کسٹمر منتخب کریں',
    customerRevenueHint: 'ویٹ کے بغیر · ریٹرنز کے بعد',
    addCustomer: 'کسٹمر شامل کریں',
    filters: 'فلٹرز',
    search: 'تلاش',
    searchPh: 'نام، کمپنی، فون، ای میل...',
    city: 'شہر',
    allCities: 'تمام شہر',
    sortBy: 'ترتیب دیں',
    sortDateNewest: 'تاریخ شامل (نئے)',
    sortOldest: 'تاریخ شامل (پرانے)',
    sortNameAZ: 'نام (ا–ی)',
    sortNameZA: 'نام (ی–ا)',
    clearFilters: 'تمام فلٹرز صاف کریں',
    colName: 'نام',
    colCompany: 'کمپنی',
    colPhone: 'فون',
    colEmail: 'ای میل',
    colCity: 'شہر',
    colCreated: 'بنایا گیا',
    colActions: 'اقدامات',
    customers: 'کسٹمرز',
    noCustomers: 'کوئی کسٹمر نہیں ملا',
    addFirstCustomer: 'اپنا پہلا کسٹمر شامل کریں',
    actView: 'دیکھیں',
    actEdit: 'ترمیم',
    actDelete: 'حذف',
    editCustomer: 'کسٹمر میں ترمیم',
    addCustomerTitle: 'کسٹمر شامل کریں',
    updatingCustomer: (name: string) => `${name} کی اپ ڈیٹ`,
    createNewCustomer: 'نیا کسٹمر ریکارڈ بنائیں',
    customerName: 'کسٹمر کا نام',
    company: 'کمپنی',
    phoneNumber: 'فون نمبر',
    email: 'ای میل',
    address: 'پتہ',
    customerNamePh: 'احمد الفارسی',
    companyPh: 'الفارسی ٹریڈنگ کمپنی',
    phonePh: '+966 50 123 4567',
    phonePhLocal: '0501234567',
    phoneIntlLabel: 'کنٹری کوڈ کے ساتھ',
    phoneLocalLabel: 'کنٹری کوڈ کے بغیر (بغیر ویلیڈیشن)',
    phoneEitherHint: 'کم از کم ایک خانہ بھرنا لازمی ہے۔ ہر نمبر منفرد ہونا چاہیے۔',
    errPhoneEither: 'کم از کم ایک فون نمبر درج کریں',
    emailPh: 'ahmed@example.com',
    cityPh: 'ریاض',
    addressPh: 'گلی، عمارت، علاقہ',
    required: 'لازمی',
    emailHint: 'اختیاری — انوائسز اور یاد دہانیوں کے لیے۔',
    saveCustomer: 'کسٹمر محفوظ کریں',
    updateCustomer: 'کسٹمر اپ ڈیٹ کریں',
    cancel: 'منسوخ',
    errNameRequired: 'کسٹمر کا نام لازمی ہے',
    errPhoneRequired: 'فون نمبر لازمی ہے',
    errPhoneInvalid: 'کنٹری کوڈ کے ساتھ فون درج کریں، مثلاً +966 50 123 4567',
    errEmailInvalid: 'درست ای میل درج کریں',
    errDuplicatePhone: (name: string) =>
      `یہ فون نمبر پہلے ہی ${name} کے پاس ہے۔ ہر فون نمبر منفرد ہونا چاہیے۔`,
    errStorageFull: 'محفوظ نہیں ہو سکا — اسٹوریج بھری ہو سکتی ہے۔',
    customerLabel: 'کسٹمر',
    created: 'بنایا گیا',
    updated: 'اپ ڈیٹ ہوا',
    documentsCount: (n: number) => `${n} دستاویز`,
    deleteTitle: 'کسٹمر حذف کریں',
    deleteMsg: (name: string) => `${name} حذف کریں؟ یہ واپس نہیں ہو سکتا۔`,
    deleteConfirm: 'حذف',
    toastCreated: (name: string) => `کسٹمر شامل ہو گیا — ${name}`,
    toastUpdated: (name: string) => `کسٹمر اپ ڈیٹ ہو گیا — ${name}`,
    toastDeleted: (name: string) => `حذف ہو گیا — ${name}`,
    errHasDocuments: (name: string, n: number) =>
      `${name} کے پاس ${n} دستاویز ہیں اور اسے حذف نہیں کیا جا سکتا۔`,
    errDeleteStorage: 'حذف نہیں ہو سکا — اسٹوریج بھری ہو سکتی ہے۔',
    showing: 'دکھا رہے ہیں',
    of: 'میں سے',
    revenue: 'آمدنی',
    noRevenue: 'ابھی کوئی منظور شدہ انوائس نہیں',
  },
  hi: {
    pageTitle: 'बिक्री — ग्राहक',
    pageSubtitle: 'ग्राहक निर्देशिका बनाए रखें',
    totalCustomers: 'कुल ग्राहक',
    customerRevenue: 'ग्राहक राजस्व',
    selectCustomerPrompt: 'राजस्व देखने के लिए ग्राहक चुनें',
    customerRevenueHint: 'वैट-रहित · रिटर्न के बाद',
    addCustomer: 'ग्राहक जोड़ें',
    filters: 'फ़िल्टर',
    search: 'खोजें',
    searchPh: 'नाम, कंपनी, फ़ोन, ईमेल...',
    city: 'शहर',
    allCities: 'सभी शहर',
    sortBy: 'क्रमबद्ध करें',
    sortDateNewest: 'जोड़ने की तारीख (नवीनतम)',
    sortOldest: 'जोड़ने की तारीख (पुरानी)',
    sortNameAZ: 'नाम (अ–ज्ञ)',
    sortNameZA: 'नाम (ज्ञ–अ)',
    clearFilters: 'सभी फ़िल्टर हटाएँ',
    colName: 'नाम',
    colCompany: 'कंपनी',
    colPhone: 'फ़ोन',
    colEmail: 'ईमेल',
    colCity: 'शहर',
    colCreated: 'बनाया गया',
    colActions: 'क्रियाएँ',
    customers: 'ग्राहक',
    noCustomers: 'कोई ग्राहक नहीं मिला',
    addFirstCustomer: 'अपना पहला ग्राहक जोड़ें',
    actView: 'देखें',
    actEdit: 'संपादित करें',
    actDelete: 'हटाएँ',
    editCustomer: 'ग्राहक संपादित करें',
    addCustomerTitle: 'ग्राहक जोड़ें',
    updatingCustomer: (name: string) => `${name} अपडेट हो रहा है`,
    createNewCustomer: 'नया ग्राहक रिकॉर्ड बनाएँ',
    customerName: 'ग्राहक का नाम',
    company: 'कंपनी',
    phoneNumber: 'फ़ोन नंबर',
    email: 'ईमेल',
    address: 'पता',
    customerNamePh: 'अहमद अल-फ़ारसी',
    companyPh: 'अल-फ़ारसी ट्रेडिंग कंपनी',
    phonePh: '+966 50 123 4567',
    phonePhLocal: '0501234567',
    phoneIntlLabel: 'देश कोड के साथ',
    phoneLocalLabel: 'बिना देश कोड (बिना वैलिडेशन)',
    phoneEitherHint: 'कम से कम एक भरना आवश्यक है। हर नंबर अनोखा होना चाहिए।',
    errPhoneEither: 'कम से कम एक फ़ोन नंबर दर्ज करें',
    emailPh: 'ahmed@example.com',
    cityPh: 'रियाद',
    addressPh: 'सड़क, भवन, क्षेत्र',
    required: 'आवश्यक',
    emailHint: 'वैकल्पिक — इनवॉइस और रिमाइंडर के लिए।',
    saveCustomer: 'ग्राहक सहेजें',
    updateCustomer: 'ग्राहक अपडेट करें',
    cancel: 'रद्द करें',
    errNameRequired: 'ग्राहक का नाम आवश्यक है',
    errPhoneRequired: 'फ़ोन नंबर आवश्यक है',
    errPhoneInvalid: 'देश कोड के साथ फ़ोन दर्ज करें, जैसे +966 50 123 4567',
    errEmailInvalid: 'मान्य ईमेल दर्ज करें',
    errDuplicatePhone: (name: string) =>
      `यह फ़ोन नंबर पहले से ${name} के पास है। हर फ़ोन नंबर अनोखा होना चाहिए।`,
    errStorageFull: 'सहेजा नहीं जा सका — स्टोरेज भरा हो सकता है।',
    customerLabel: 'ग्राहक',
    created: 'बनाया गया',
    updated: 'अपडेट हुआ',
    documentsCount: (n: number) => `${n} दस्तावेज़`,
    deleteTitle: 'ग्राहक हटाएँ',
    deleteMsg: (name: string) => `${name} हटाएँ? यह पूर्ववत नहीं हो सकता।`,
    deleteConfirm: 'हटाएँ',
    toastCreated: (name: string) => `ग्राहक जोड़ा गया — ${name}`,
    toastUpdated: (name: string) => `ग्राहक अपडेट हुआ — ${name}`,
    toastDeleted: (name: string) => `हटाया गया — ${name}`,
    errHasDocuments: (name: string, n: number) =>
      `${name} के पास ${n} दस्तावेज़ हैं और इसे हटाया नहीं जा सकता।`,
    errDeleteStorage: 'हटाया नहीं जा सका — स्टोरेज भरा हो सकता है।',
    showing: 'दिखा रहे हैं',
    of: 'में से',
    revenue: 'राजस्व',
    noRevenue: 'अभी कोई स्वीकृत इनवॉइस नहीं',
  },
} as const;

type Translations = {
  [K in keyof typeof t['en']]: typeof t['en'][K] extends (
    ...args: never[]
  ) => infer R
    ? (...args: Parameters<typeof t['en'][K]>) => R
    : typeof t['en'][K] extends string
    ? string
    : typeof t['en'][K];
};

// ============================================================
// TYPES
// ============================================================
type Customer = {
  /** PRIMARY KEY — equals the normalized phone (with country code) or, if empty, the normalized phoneAlt */
  id: string;
  name: string;
  company: string;
  email: string;
  /** Phone WITH country code (validated). May be empty if phoneAlt is filled. */
  phone: string;
  /** Phone WITHOUT country code (no validation). May be empty if phone is filled. */
  phoneAlt?: string;
  address: string;
  city: string;
  createdAt: string;
  updatedAt: string;
};

type CustomerInput = {
  name: string;
  company: string;
  email: string;
  phone: string;
  phoneAlt: string;
  address: string;
  city: string;
};

type SalesDocument = {
  id: string;
  documentType: 'quotation' | 'invoice';
  status: 'Pending' | 'Approved' | 'Rejected';
  paymentStatus: 'Unpaid' | 'Partially Paid' | 'Paid';
  grandTotal: number;
  subtotal?: number;
  taxTotal?: number;
  customerId?: string;
  customerSnapshot?: { name?: string; company?: string };
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
  search: (
    <svg {...svgBase} className="w-3.5 h-3.5">
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
    <svg {...svgBase} className="w-3.5 h-3.5">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  edit: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
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
  money: (
    <svg {...svgBase} className="w-4 h-4">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ),
  phone: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  mail: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 7l-10 6L2 7" />
    </svg>
  ),
  location: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  building: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
    </svg>
  ),
  sliders: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
    </svg>
  ),
  alert: (
    <svg {...svgBase} className="w-3.5 h-3.5">
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
  clock: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
};

// ============================================================
// CONSTANTS
// ============================================================
const CUSTOMERS_KEY = 'zakhira_sales_customers';
const DOCUMENTS_KEY = 'zakhira_sales_documents';
const PAGE_SIZE = 10;
const INTL_PHONE_REGEX = /^\+[1-9]\d{7,14}$/;

// ============================================================
// HELPERS
// ============================================================

/**
 * Normalizes a phone number. The result is used as the customer's
 * PRIMARY KEY (customer.id), so two customers can never share it.
 */
const normalizePhone = (raw: string): string => {
  let s = raw.trim().replace(/[\s\-().]/g, '');
  if (s.startsWith('00')) s = `+${s.slice(2)}`;
  return s;
};

/** Validates the "with country code" field. Empty is allowed here. */
const validateIntlPhone = (raw: string, tr: Translations): string | null => {
  const normalized = normalizePhone(raw);
  if (!normalized) return null;
  if (!INTL_PHONE_REGEX.test(normalized)) return tr.errPhoneInvalid;
  return null;
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
  [normalizePhone(c.phone || ''), normalizePhone(c.phoneAlt || '')].filter(
    Boolean
  );

const validateEmail = (raw: string, tr: Translations): string | null => {
  if (!raw.trim()) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim())) {
    return tr.errEmailInvalid;
  }
  return null;
};

const formatDate = (iso: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

// ⚠️ NO "SAR" prefix
const formatMoney = (n: number): string => {
  const abs = Math.abs(n);
  return `${n < 0 ? '-' : ''}${abs.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
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
      email: c.email || '',
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

const loadDocuments = (): SalesDocument[] => {
  try {
    const raw = localStorage.getItem(DOCUMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveDocuments = (list: SalesDocument[]): boolean => {
  try {
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
};

/**
 * ONE-TIME MIGRATION (safe to run on every load — it does nothing
 * once all customers are already in the 2-phone-field format).
 *
 * - Old customers had random ids like "cus-xxxx" and/or a single phone
 *   with a mode flag. Now: phone (with code) + phoneAlt (without code),
 *   and id = primary phone key.
 * - Documents linked to the old id are re-linked to the new id.
 * - If old data already contains duplicate keys, the oldest customer is
 *   kept and the duplicates' documents are re-linked to it.
 */
const migrateToPhoneKeys = (): void => {
  try {
    const list = loadCustomers();
    if (list.length === 0) return;

    const prepared = list.map((c) => {
      const legacy = c as Customer & { phoneMode?: 'intl' | 'local' };
      let phone = normalizePhone(c.phone || '');
      let phoneAlt = normalizePhone(c.phoneAlt || '');
      // Old single-phone records that were saved without validation
      if (
        phone &&
        !phoneAlt &&
        (legacy.phoneMode === 'local' ||
          (legacy.phoneMode === undefined && !INTL_PHONE_REGEX.test(phone)))
      ) {
        phoneAlt = phone;
        phone = '';
      }
      const key = phone || phoneAlt || c.id;
      const changed =
        c.id !== key ||
        (c.phone || '') !== phone ||
        (c.phoneAlt || '') !== phoneAlt ||
        'phoneMode' in c;
      return { c, phone, phoneAlt, key, changed };
    });

    if (!prepared.some((p) => p.changed)) return;

    const idMap = new Map<string, string>(); // oldId -> newId
    const kept = new Map<string, Customer>(); // newId -> customer

    const oldestFirst = [...prepared].sort((a, b) =>
      (a.c.createdAt || '').localeCompare(b.c.createdAt || '')
    );

    for (const p of oldestFirst) {
      idMap.set(p.c.id, p.key);
      if (!kept.has(p.key)) {
        const clean: Customer & { phoneMode?: unknown } = {
          ...p.c,
          id: p.key,
          phone: p.phone,
          phoneAlt: p.phoneAlt,
        };
        delete clean.phoneMode;
        kept.set(p.key, clean);
      }
    }

    const newList = Array.from(kept.values()).sort((a, b) =>
      (b.createdAt || '').localeCompare(a.createdAt || '')
    );

    const docs = loadDocuments();
    const newDocs = docs.map((d) =>
      d.customerId && idMap.has(d.customerId)
        ? { ...d, customerId: idMap.get(d.customerId) }
        : d
    );

    // Save documents first, then customers (roll back docs if customers fail)
    if (!saveDocuments(newDocs)) return;
    if (!saveCustomers(newList)) {
      saveDocuments(docs);
    }
  } catch {
    // ignore — migration will retry on next load
  }
};

// ============================================================
// STYLES
// ============================================================
const labelCls = 'block text-[9px] font-bold mb-1 uppercase tracking-wider';
const inputCls =
  'w-full h-9 px-3 rounded-full border-2 text-[13px] placeholder:text-opacity-40 focus:outline-none transition-all';

const inputStyle = (): React.CSSProperties => ({
  background: THEME.warmIvory,
  borderColor: `${THEME.mutedOlive}30`,
  color: THEME.charcoal,
});

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
      style={{ background: `${THEME.charcoal}80`, backdropFilter: 'blur(4px)' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`rounded-2xl w-full ${maxWidth} max-h-[92vh] flex flex-col shadow-xl`}
        style={{ background: THEME.warmIvory }}
      >
        <div
          className="flex items-start justify-between gap-3 px-5 pt-5 pb-3"
          style={{ borderBottom: `1px solid ${THEME.mutedOlive}20` }}
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
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center cursor-pointer transition"
            style={{
              background: `${THEME.mutedOlive}15`,
              color: THEME.mutedOlive,
            }}
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
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}): React.JSX.Element {
  return (
    <Modal title={title} onClose={onCancel} maxWidth="max-w-sm" z="z-[60]">
      <p className="text-[13px] mb-3" style={{ color: THEME.mutedOlive }}>
        {message}
      </p>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 h-9 rounded-full text-[13px] font-bold cursor-pointer transition-all"
          style={{
            background: 'transparent',
            border: `2px solid ${THEME.mutedOlive}30`,
            color: THEME.mutedOlive,
          }}
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
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
      className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-2"
      style={{ borderTop: `1px solid ${THEME.mutedOlive}20` }}
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
          style={{
            background: THEME.warmIvory,
            border: `1px solid ${THEME.mutedOlive}25`,
            color: THEME.mutedOlive,
          }}
        >
          {Icons.chevronLeft}
        </button>
        {Array.from({ length: pageCount }, (_, i) => i + 1)
          .filter(
            (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1
          )
          .map((p, idx, arr) => (
            <span key={p} className="flex items-center gap-1">
              {idx > 0 && p - arr[idx - 1] > 1 && (
                <span
                  className="text-[11px]"
                  style={{ color: THEME.mutedOlive }}
                >
                  …
                </span>
              )}
              <button
                onClick={() => onPage(p)}
                className="min-w-7 h-7 px-2 rounded-full text-[11px] font-bold cursor-pointer transition"
                style={
                  p === page
                    ? {
                        background: THEME.deepForest,
                        color: THEME.warmIvory,
                      }
                    : {
                        background: THEME.warmIvory,
                        color: THEME.mutedOlive,
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
          style={{
            background: THEME.warmIvory,
            border: `1px solid ${THEME.mutedOlive}25`,
            color: THEME.mutedOlive,
          }}
        >
          {Icons.chevronRight}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// CUSTOMER FORM MODAL
// ============================================================
function CustomerFormModal({
  customer,
  onClose,
  onSaved,
  tr,
}: {
  customer?: Customer | null;
  onClose: () => void;
  onSaved: (c: Customer) => void;
  tr: Translations;
}): React.JSX.Element {
  const [form, setForm] = useState<CustomerInput>({
    name: customer?.name ?? '',
    company: customer?.company ?? '',
    email: customer?.email ?? '',
    phone: customer?.phone ?? '',
    phoneAlt: customer?.phoneAlt ?? '',
    address: customer?.address ?? '',
    city: customer?.city ?? '',
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof CustomerInput | 'phoneGroup', string>>
  >({});
  const [saveError, setSaveError] = useState('');

  const set = (k: keyof CustomerInput, v: string): void =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = (): void => {
    const e: Partial<Record<keyof CustomerInput | 'phoneGroup', string>> = {};
    if (!form.name.trim()) e.name = tr.errNameRequired;

    const intl = normalizePhone(form.phone);
    const alt = normalizePhone(form.phoneAlt);

    // At least ONE of the two phone fields is required
    if (!intl && !alt) {
      e.phoneGroup = tr.errPhoneEither;
    } else {
      // Country-code field is validated; the other one is not
      const intlErr = validateIntlPhone(form.phone, tr);
      if (intlErr) e.phone = intlErr;
    }

    const emailErr = validateEmail(form.email, tr);
    if (emailErr) e.email = emailErr;

    // Always check against the freshest data in storage
    const list = loadCustomers();
    const others = list.filter((c) => c.id !== customer?.id);

    // 🔒 UNIQUE PHONE — any number used by another customer is blocked
    if (intl && !e.phone) {
      const dup = others.find((c) =>
        phoneKeysOf(c).some((k) => samePhone(k, intl))
      );
      if (dup) e.phone = tr.errDuplicatePhone(dup.name);
    }
    if (alt) {
      const dup = others.find((c) =>
        phoneKeysOf(c).some((k) => samePhone(k, alt))
      );
      if (dup) e.phoneAlt = tr.errDuplicatePhone(dup.name);
    }

    setErrors(e);
    setSaveError('');
    if (Object.keys(e).length > 0) return;

    const now = new Date().toISOString();
    const key = intl || alt; // 🔑 primary key

    if (customer) {
      // Primary key can change if phones changed → id changes too
      const updated: Customer = {
        ...customer,
        id: key,
        name: form.name.trim(),
        company: form.company.trim(),
        email: form.email.trim(),
        phone: intl,
        phoneAlt: alt,
        address: form.address.trim(),
        city: form.city.trim(),
        updatedAt: now,
      };

      const idChanged = updated.id !== customer.id;
      let oldDocs: SalesDocument[] | null = null;

      // Re-link this customer's documents to the new key
      if (idChanged) {
        oldDocs = loadDocuments();
        const relinked = oldDocs.map((d) =>
          d.customerId === customer.id ? { ...d, customerId: updated.id } : d
        );
        if (!saveDocuments(relinked)) {
          setSaveError(tr.errStorageFull);
          return;
        }
      }

      const ok = saveCustomers(
        list.map((c) => (c.id === customer.id ? updated : c))
      );
      if (!ok) {
        if (oldDocs) saveDocuments(oldDocs); // roll back
        setSaveError(tr.errStorageFull);
        return;
      }
      onSaved(updated);
    } else {
      const newCustomer: Customer = {
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
      const ok = saveCustomers([newCustomer, ...list]);
      if (!ok) {
        setSaveError(tr.errStorageFull);
        return;
      }
      onSaved(newCustomer);
    }
  };

  const errCls = 'text-[10px] font-semibold mt-1 px-2';

  return (
    <Modal
      title={customer ? tr.editCustomer : tr.addCustomerTitle}
      subtitle={
        customer ? tr.updatingCustomer(customer.name) : tr.createNewCustomer
      }
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelCls} style={{ color: THEME.deepForest }}>
            {tr.customerName} <span style={{ color: THEME.warmBrass }}>*</span>
          </label>
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder={tr.customerNamePh}
            className={inputCls}
            style={inputStyle()}
          />
          {errors.name && (
            <p className={errCls} style={{ color: THEME.warmBrass }}>
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label className={labelCls} style={{ color: THEME.deepForest }}>
            {tr.company}
          </label>
          <input
            value={form.company}
            onChange={(e) => set('company', e.target.value)}
            placeholder={tr.companyPh}
            className={inputCls}
            style={inputStyle()}
          />
        </div>

        {/* PHONE — two inputs, at least one is required */}
        <div className="sm:col-span-2">
          <label className={labelCls} style={{ color: THEME.deepForest }}>
            {tr.phoneNumber} <span style={{ color: THEME.warmBrass }}>*</span>
          </label>
          <p
            className="text-[9px] mb-2 px-2"
            style={{ color: THEME.mutedOlive }}
          >
            {tr.phoneEitherHint}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                className={labelCls}
                style={{ color: THEME.mutedOlive }}
              >
                {tr.phoneIntlLabel}
              </label>
              <input
                type="tel"
                dir="ltr"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder={tr.phonePh}
                className={`${inputCls} font-mono`}
                style={inputStyle()}
              />
              {errors.phone && (
                <p className={errCls} style={{ color: THEME.warmBrass }}>
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label
                className={labelCls}
                style={{ color: THEME.mutedOlive }}
              >
                {tr.phoneLocalLabel}
              </label>
              <input
                type="tel"
                dir="ltr"
                value={form.phoneAlt}
                onChange={(e) => set('phoneAlt', e.target.value)}
                placeholder={tr.phonePhLocal}
                className={`${inputCls} font-mono`}
                style={inputStyle()}
              />
              {errors.phoneAlt && (
                <p className={errCls} style={{ color: THEME.warmBrass }}>
                  {errors.phoneAlt}
                </p>
              )}
            </div>
          </div>

          {errors.phoneGroup && (
            <p className={errCls} style={{ color: THEME.warmBrass }}>
              {errors.phoneGroup}
            </p>
          )}
        </div>

        <div>
          <label className={labelCls} style={{ color: THEME.deepForest }}>
            {tr.email}
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder={tr.emailPh}
            className={`${inputCls} font-mono`}
            style={inputStyle()}
          />
          {errors.email ? (
            <p className={errCls} style={{ color: THEME.warmBrass }}>
              {errors.email}
            </p>
          ) : (
            <p
              className="text-[9px] mt-1 px-2"
              style={{ color: THEME.mutedOlive }}
            >
              {tr.emailHint}
            </p>
          )}
        </div>

        <div>
          <label className={labelCls} style={{ color: THEME.deepForest }}>
            {tr.city}
          </label>
          <input
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
            placeholder={tr.cityPh}
            className={inputCls}
            style={inputStyle()}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls} style={{ color: THEME.deepForest }}>
            {tr.address}
          </label>
          <input
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            placeholder={tr.addressPh}
            className={inputCls}
            style={inputStyle()}
          />
        </div>
      </div>

      {saveError && (
        <div
          className="mt-3 px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-2"
          style={{
            background: 'rgba(196,154,90,0.1)',
            border: `2px solid rgba(196,154,90,0.4)`,
            color: THEME.charcoal,
          }}
        >
          {Icons.alert}
          <span>{saveError}</span>
        </div>
      )}

      <div
        className="flex gap-2.5 pt-3 mt-3"
        style={{ borderTop: `1px solid ${THEME.mutedOlive}20` }}
      >
        <button
          onClick={submit}
          className="h-9 px-4 rounded-full text-[13px] font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
          style={{
            background: THEME.warmBrass,
            color: THEME.warmIvory,
            boxShadow: '0 4px 12px rgba(196,154,90,0.35)',
          }}
        >
          {customer ? Icons.check : Icons.plus}
          <span>{customer ? tr.updateCustomer : tr.saveCustomer}</span>
        </button>
        <button
          onClick={onClose}
          className="h-9 px-4 rounded-full text-[13px] font-bold cursor-pointer transition-all"
          style={{
            background: 'transparent',
            border: `2px solid ${THEME.mutedOlive}30`,
            color: THEME.mutedOlive,
          }}
        >
          {tr.cancel}
        </button>
      </div>
    </Modal>
  );
}

// ============================================================
// CUSTOMER DETAILS MODAL
// ============================================================
function CustomerDetailsModal({
  customer,
  documentCount,
  revenue,
  tr,
  onClose,
}: {
  customer: Customer;
  documentCount: number;
  revenue: number;
  tr: Translations;
  onClose: () => void;
}): React.JSX.Element {
  return (
    <Modal
      title={customer.name}
      subtitle={tr.documentsCount(documentCount)}
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <div className="space-y-3">
        <div
          className="flex items-center gap-2.5 p-2.5 rounded-xl"
          style={{ background: THEME.warmIvory }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: THEME.warmBrass,
              color: THEME.warmIvory,
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.3), 0 3px 8px rgba(196,154,90,0.3)',
            }}
          >
            {Icons.user}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="text-[13px] font-bold"
              style={{ color: THEME.charcoal }}
            >
              {customer.name}
            </p>
            <p
              className="text-[9px] uppercase tracking-wider mt-0.5"
              style={{ color: THEME.mutedOlive }}
            >
              {tr.customerLabel}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p
              className="text-[8px] font-bold uppercase tracking-wider"
              style={{ color: THEME.mutedOlive }}
            >
              {tr.revenue}
            </p>
            <p
              className="text-[14px] font-bold"
              style={{ color: THEME.deepForest }}
            >
              {formatMoney(revenue)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 text-[11px]">
          <DetailRow
            icon={Icons.building}
            label={tr.company}
            value={customer.company || '—'}
          />
          <DetailRow
            icon={Icons.phone}
            label={tr.phoneIntlLabel}
            value={customer.phone || '—'}
            mono
          />
          <DetailRow
            icon={Icons.phone}
            label={tr.phoneLocalLabel}
            value={customer.phoneAlt || '—'}
            mono
          />
          <DetailRow
            icon={Icons.mail}
            label={tr.colEmail}
            value={customer.email || '—'}
            mono
          />
          <DetailRow
            icon={Icons.location}
            label={tr.address}
            value={customer.address || '—'}
          />
          <DetailRow
            icon={Icons.location}
            label={tr.city}
            value={customer.city || '—'}
          />
          <DetailRow
            icon={Icons.clock}
            label={tr.created}
            value={formatDate(customer.createdAt)}
          />
          <DetailRow
            icon={Icons.edit}
            label={tr.updated}
            value={formatDate(customer.updatedAt)}
          />
        </div>
      </div>
    </Modal>
  );
}

function DetailRow({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}): React.JSX.Element {
  return (
    <div
      className="flex items-start justify-between gap-3 px-2.5 py-1.5 rounded-xl"
      style={{ background: THEME.warmIvory }}
    >
      <div
        className="flex items-center gap-1.5"
        style={{ color: THEME.mutedOlive }}
      >
        <span className="flex-shrink-0">{icon}</span>
        <span className="text-[9px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <span
        className={`text-right font-semibold break-all ${mono ? 'font-mono' : ''}`}
        style={{ color: THEME.charcoal }}
      >
        {value}
      </span>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function CustomersPage(): React.JSX.Element {
  // Migration runs first so customers/documents are consistent
  // (id = phone number) before they are read into state.
  const [customers, setCustomers] = useState<Customer[]>(() => {
    migrateToPhoneKeys();
    return loadCustomers();
  });
  const [documents, setDocuments] = useState<SalesDocument[]>(() =>
    loadDocuments()
  );

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  // Revenue card state
  const [revenueCustomerId, setRevenueCustomerId] = useState<string>('');

  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [sortBy, setSortBy] = useState<
    'date-desc' | 'date-asc' | 'name-asc' | 'name-desc'
  >('date-desc');
  const [page, setPage] = useState(1);

  const language = getStoredLanguage();
  const tr = t[language] as Translations;
  const rtl = isRTLLang(language);

  // Reload on focus / sales update
  useEffect(() => {
    const refresh = () => {
      setCustomers(loadCustomers());
      setDocuments(loadDocuments());
    };
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('zakhira:sales-updated', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('zakhira:sales-updated', refresh);
    };
  }, []);

  const refresh = (): void => {
    setCustomers(loadCustomers());
    setDocuments(loadDocuments());
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

  const documentCountByCustomer = useMemo(() => {
    const map = new Map<string, number>();
    documents.forEach((d) => {
      if (d.customerId) {
        map.set(d.customerId, (map.get(d.customerId) ?? 0) + 1);
      }
    });
    return map;
  }, [documents]);

  // ==========================================================
  // REVENUE PER CUSTOMER (Section 4)
  // ==========================================================
  const revenueByCustomer = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of documents) {
      // Only approved invoices
      if (d.documentType !== 'invoice' || d.status !== 'Approved') continue;
      if (!d.customerId) continue;
      // VAT-exclusive = subtotal
      const net = d.subtotal ?? d.grandTotal;
      map.set(d.customerId, (map.get(d.customerId) ?? 0) + net);
    }
    return map;
  }, [documents]);

  // Revenue for the selected customer (or 0 if none selected)
  const selectedRevenue = revenueCustomerId
    ? revenueByCustomer.get(revenueCustomerId) ?? 0
    : 0;

  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => {
      if (c.city.trim()) set.add(c.city.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [customers]);

  const filtered = useMemo(() => {
    let list = [...customers];

    if (search.trim()) {
      const q = search.toLowerCase();
      const qPhone = normalizePhone(search);
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          (c.phoneAlt || '').toLowerCase().includes(q) ||
          (qPhone !== '' &&
            phoneKeysOf(c).some((k) => k.includes(qPhone))) ||
          (c.email || '').toLowerCase().includes(q)
      );
    }

    // 🏙️ City filter
    if (cityFilter !== 'All') {
      list = list.filter((c) => c.city.trim() === cityFilter);
    }

    // 📅 Sorting — by date (newest/oldest) or name
    list.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'date-asc':
          return a.createdAt.localeCompare(b.createdAt);
        case 'date-desc':
        default:
          return b.createdAt.localeCompare(a.createdAt);
      }
    });

    return list;
  }, [customers, search, cityFilter, sortBy]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearFilters = (): void => {
    setSearch('');
    setCityFilter('All');
    setSortBy('date-desc');
    setPage(1);
  };

  const hasActiveFilters =
    search.trim() !== '' || cityFilter !== 'All' || sortBy !== 'date-desc';

  const handleSaved = (c: Customer): void => {
    refresh();
    setShowForm(false);
    const wasEdit = editingCustomer !== null;

    // Keep revenue selector pointing at the same customer if the key changed
    if (wasEdit && editingCustomer && revenueCustomerId === editingCustomer.id) {
      setRevenueCustomerId(c.id);
    }

    setEditingCustomer(null);
    showSuccess(wasEdit ? tr.toastUpdated(c.name) : tr.toastCreated(c.name));
  };

  const handleEdit = (c: Customer): void => {
    setEditingCustomer(c);
    setShowForm(true);
  };

  const handleDelete = (c: Customer): void => {
    const count = documentCountByCustomer.get(c.id) ?? 0;
    if (count > 0) {
      showError(tr.errHasDocuments(c.name, count));
      setDeleteTarget(null);
      return;
    }
    const list = loadCustomers().filter((x) => x.id !== c.id);
    const ok = saveCustomers(list);
    if (!ok) {
      showError(tr.errDeleteStorage);
      setDeleteTarget(null);
      return;
    }
    if (revenueCustomerId === c.id) setRevenueCustomerId('');
    refresh();
    setDeleteTarget(null);
    showSuccess(tr.toastDeleted(c.name));
  };

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className="min-h-screen p-4 lg:p-5"
      style={{ background: THEME.warmIvory }}
    >
      {/* HEADER */}
      <div className="mb-4">
        <h1 className="text-xl font-bold" style={{ color: THEME.deepForest }}>
          {tr.pageTitle}
        </h1>
        <p className="mt-1 text-[12px]" style={{ color: THEME.mutedOlive }}>
          {tr.pageSubtitle}
        </p>
      </div>

      {/* BANNERS */}
      {successMsg && (
        <div
          className="mb-3 px-3 py-2 rounded-full text-[11px] font-bold flex items-center gap-2"
          style={{
            background: 'rgba(102,116,90,0.15)',
            border: `2px solid rgba(102,116,90,0.3)`,
            color: THEME.deepForest,
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
            background: 'rgba(196,154,90,0.15)',
            border: `2px solid rgba(196,154,90,0.4)`,
            color: THEME.charcoal,
          }}
        >
          {Icons.alert}
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2 CARDS — Requirements Section 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Card 1: Total Customers */}
        <div
          className="rounded-2xl p-3 flex items-center gap-2.5"
          style={{
            background: '#FFFFFF',
            border: `1px solid ${THEME.mutedOlive}20`,
          }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: THEME.warmBrass,
              color: THEME.warmIvory,
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 10px rgba(196,154,90,0.3)',
            }}
          >
            {Icons.user}
          </div>
          <div className="min-w-0">
            <p
              className="text-base font-bold"
              style={{ color: THEME.charcoal }}
            >
              {customers.length}
            </p>
            <p
              className="text-[9px] uppercase tracking-wider font-bold"
              style={{ color: THEME.mutedOlive }}
            >
              {tr.totalCustomers}
            </p>
          </div>
        </div>

        {/* Card 2: Customer Revenue */}
        <div
          className="rounded-2xl p-3 min-w-0"
          style={{
            background: '#FFFFFF',
            border: `1px solid ${THEME.mutedOlive}20`,
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: THEME.deepForest,
                color: THEME.warmIvory,
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 10px rgba(18,60,50,0.25)',
              }}
            >
              {Icons.money}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-[9px] uppercase tracking-wider font-bold"
                style={{ color: THEME.mutedOlive }}
              >
                {tr.customerRevenue}
              </p>
              <p
                className="text-[8px] font-bold"
                style={{ color: THEME.warmBrass }}
              >
                {tr.customerRevenueHint}
              </p>
            </div>
          </div>

          {/* Customer selector */}
          <select
            value={revenueCustomerId}
            onChange={(e) => setRevenueCustomerId(e.target.value)}
            className="w-full h-8 px-2 rounded-full border-2 text-[11px] cursor-pointer focus:outline-none transition-all mb-1.5"
            style={{
              background: THEME.warmIvory,
              borderColor: `${THEME.mutedOlive}30`,
              color: THEME.charcoal,
            }}
          >
            <option value="">{tr.selectCustomerPrompt}</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.company ? ` — ${c.company}` : ''}
              </option>
            ))}
          </select>

          {/* Revenue value */}
          <p
            className="text-[16px] font-bold leading-tight break-words"
            style={{
              color:
                revenueCustomerId && selectedRevenue > 0
                  ? THEME.deepForest
                  : THEME.mutedOlive,
            }}
          >
            {revenueCustomerId ? formatMoney(selectedRevenue) : '—'}
          </p>
        </div>
      </div>

      {/* ADD BUTTON */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => {
            setEditingCustomer(null);
            setShowForm(true);
          }}
          className="h-9 px-4 rounded-full text-[13px] font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
          style={{
            background: THEME.warmBrass,
            color: THEME.warmIvory,
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.25), 0 6px 16px -6px rgba(196,154,90,0.5)',
          }}
        >
          {Icons.plus}
          <span>{tr.addCustomer}</span>
        </button>
      </div>

      {/* FILTERS */}
      <div
        className="rounded-2xl p-3.5 mb-4"
        style={{
          background: '#FFFFFF',
          border: `1px solid ${THEME.mutedOlive}20`,
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className={labelCls} style={{ color: THEME.deepForest }}>
              {tr.search}
            </label>
            <div className="relative">
              <span
                className="absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none"
                style={{ color: THEME.mutedOlive }}
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
                className={inputCls}
                style={{
                  ...inputStyle(),
                  paddingInlineStart: 36,
                }}
              />
            </div>
          </div>

          {/* 🏙️ City filter */}
          <div>
            <label className={labelCls} style={{ color: THEME.deepForest }}>
              {tr.city}
            </label>
            <select
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setPage(1);
              }}
              className={`${inputCls} cursor-pointer`}
              style={inputStyle()}
            >
              <option value="All">{tr.allCities}</option>
              {uniqueCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* 📅 Sort by date / name */}
          <div>
            <label className={labelCls} style={{ color: THEME.deepForest }}>
              {tr.sortBy}
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(
                  e.target.value as
                    | 'date-desc'
                    | 'date-asc'
                    | 'name-asc'
                    | 'name-desc'
                );
                setPage(1);
              }}
              className={`${inputCls} cursor-pointer`}
              style={inputStyle()}
            >
              <option value="date-desc">{tr.sortDateNewest}</option>
              <option value="date-asc">{tr.sortOldest}</option>
              <option value="name-asc">{tr.sortNameAZ}</option>
              <option value="name-desc">{tr.sortNameZA}</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div
            className="flex justify-end mt-3 pt-3"
            style={{ borderTop: `1px solid ${THEME.mutedOlive}20` }}
          >
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

      {/* CUSTOMER LIST */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: '#FFFFFF',
          border: `1px solid ${THEME.mutedOlive}20`,
        }}
      >
        <div
          className="px-4 py-2.5"
          style={{
            background: THEME.warmIvory,
            borderBottom: `1px solid ${THEME.mutedOlive}20`,
          }}
        >
          <h2
            className="text-[13px] font-bold"
            style={{ color: THEME.deepForest }}
          >
            {tr.customers}{' '}
            <span className="text-[11px] font-normal">({filtered.length})</span>
          </h2>
        </div>

        {paginated.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    style={{
                      background: THEME.warmIvory,
                      borderBottom: `1px solid ${THEME.mutedOlive}20`,
                    }}
                  >
                    <th
                      className="text-left text-[9px] font-bold uppercase tracking-wider px-3 py-2"
                      style={{ color: THEME.mutedOlive }}
                    >
                      {tr.colName}
                    </th>
                    <th
                      className="text-left text-[9px] font-bold uppercase tracking-wider px-3 py-2 hidden md:table-cell"
                      style={{ color: THEME.mutedOlive }}
                    >
                      {tr.colCompany}
                    </th>
                    <th
                      className="text-left text-[9px] font-bold uppercase tracking-wider px-3 py-2"
                      style={{ color: THEME.mutedOlive }}
                    >
                      {tr.colPhone}
                    </th>
                    <th
                      className="text-left text-[9px] font-bold uppercase tracking-wider px-3 py-2 hidden lg:table-cell"
                      style={{ color: THEME.mutedOlive }}
                    >
                      {tr.colEmail}
                    </th>
                    <th
                      className="text-left text-[9px] font-bold uppercase tracking-wider px-3 py-2 hidden xl:table-cell"
                      style={{ color: THEME.mutedOlive }}
                    >
                      {tr.colCity}
                    </th>
                    <th
                      className="text-left text-[9px] font-bold uppercase tracking-wider px-3 py-2 hidden xl:table-cell"
                      style={{ color: THEME.mutedOlive }}
                    >
                      {tr.colCreated}
                    </th>
                    <th
                      className="text-right text-[9px] font-bold uppercase tracking-wider px-3 py-2"
                      style={{ color: THEME.mutedOlive }}
                    >
                      {tr.colActions}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((c) => (
                    <tr
                      key={c.id}
                      className="transition"
                      style={{
                        borderBottom: `1px solid ${THEME.mutedOlive}10`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${THEME.warmIvory}80`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td className="px-3 py-2">
                        <p
                          className="text-[12px] font-semibold truncate max-w-[180px]"
                          style={{ color: THEME.charcoal }}
                        >
                          {c.name}
                        </p>
                      </td>
                      <td className="px-3 py-2 hidden md:table-cell">
                        <p
                          className="text-[12px] truncate max-w-[200px]"
                          style={{ color: THEME.mutedOlive }}
                        >
                          {c.company || '—'}
                        </p>
                      </td>
                      <td className="px-3 py-2">
                        <p
                          className="text-[11px] font-mono"
                          style={{ color: THEME.mutedOlive }}
                          dir="ltr"
                        >
                          {c.phone || c.phoneAlt}
                        </p>
                        {c.phone && c.phoneAlt && (
                          <p
                            className="text-[11px] font-mono"
                            style={{ color: THEME.mutedOlive }}
                            dir="ltr"
                          >
                            {c.phoneAlt}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-2 hidden lg:table-cell">
                        <p
                          className="text-[11px] font-mono truncate max-w-[220px]"
                          style={{ color: THEME.mutedOlive }}
                        >
                          {c.email || '—'}
                        </p>
                      </td>
                      <td className="px-3 py-2 hidden xl:table-cell">
                        <p
                          className="text-[11px]"
                          style={{ color: THEME.mutedOlive }}
                        >
                          {c.city || '—'}
                        </p>
                      </td>
                      <td className="px-3 py-2 hidden xl:table-cell">
                        <p
                          className="text-[11px]"
                          style={{ color: THEME.mutedOlive }}
                        >
                          {formatDate(c.createdAt)}
                        </p>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewCustomer(c)}
                            title={tr.actView}
                            className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition"
                            style={{
                              background: THEME.warmIvory,
                              color: THEME.mutedOlive,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                THEME.deepForest;
                              e.currentTarget.style.color = THEME.warmIvory;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background =
                                THEME.warmIvory;
                              e.currentTarget.style.color = THEME.mutedOlive;
                            }}
                          >
                            {Icons.eye}
                          </button>
                          <button
                            onClick={() => handleEdit(c)}
                            title={tr.actEdit}
                            className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition"
                            style={{
                              background: THEME.warmBrass,
                              color: THEME.warmIvory,
                              boxShadow: '0 3px 8px rgba(196,154,90,0.3)',
                            }}
                          >
                            {Icons.edit}
                          </button>
                          <button
                            onClick={() => setDeleteTarget(c)}
                            title={tr.actDelete}
                            className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition"
                            style={{
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: '1px solid #fecaca',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#dc2626';
                              e.currentTarget.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#fee2e2';
                              e.currentTarget.style.color = '#dc2626';
                            }}
                          >
                            {Icons.trash}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              total={filtered.length}
              onPage={setPage}
              tr={tr}
            />
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="text-[13px]" style={{ color: THEME.mutedOlive }}>
              {tr.noCustomers}
            </p>
            <button
              onClick={() => {
                setEditingCustomer(null);
                setShowForm(true);
              }}
              className="mt-2 text-[11px] font-bold hover:underline cursor-pointer"
              style={{ color: THEME.warmBrass }}
            >
              {tr.addFirstCustomer}
            </button>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showForm && (
        <CustomerFormModal
          customer={editingCustomer}
          tr={tr}
          onClose={() => {
            setShowForm(false);
            setEditingCustomer(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {viewCustomer && (
        <CustomerDetailsModal
          customer={viewCustomer}
          documentCount={documentCountByCustomer.get(viewCustomer.id) ?? 0}
          revenue={revenueByCustomer.get(viewCustomer.id) ?? 0}
          tr={tr}
          onClose={() => setViewCustomer(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title={tr.deleteTitle}
          message={tr.deleteMsg(deleteTarget.name)}
          confirmLabel={tr.deleteConfirm}
          cancelLabel={tr.cancel}
          danger
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}