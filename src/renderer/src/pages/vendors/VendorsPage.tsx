/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable prettier/prettier */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { THEME } from '@renderer/theme/theme';
import {
  vendorsService,
  VendorHasOrdersError,
  type Vendor,
  type VendorInput,
} from '@renderer/services/vendorsservice';

// ============================================================
// 🌍 LANGUAGE
// ============================================================
type Language = 'en' | 'ar' | 'ur' | 'hi';

const t = {
  en: {
    pageTitle: 'Inventory — Vendors',
    pageSubtitle: 'Maintain the vendor directory',
    statTotalVendors: 'Total Vendors',
    addVendor: 'Add Vendor',
    filters: 'Filters',
    search: 'Search',
    searchPh: 'Name, company, phone...',
    city: 'City',
    allCities: 'All Cities',
    status: 'Status',
    statusActive: 'Active',
    statusInactive: 'Deactivated',
    statusAll: 'All',
    clearFilters: 'Clear all filters',
    vendors: 'Vendors',
    colId: 'ID',
    colName: 'Name',
    colCompany: 'Company',
    colPhone: 'Phone',
    colCity: 'City',
    colStatus: 'Status',
    colActions: 'Actions',
    noVendors: 'No vendors found',
    addFirst: 'Add your first vendor',
    addVendorTitle: 'Add Vendor',
    editVendorTitle: 'Edit Vendor',
    newVendorId: (id: string) => `New vendor ID: ${id}`,
    editingVendor: (id: string) => `Editing ${id}`,
    uniqueIdAuto: 'Unique ID (auto)',
    nameLabel: 'Name (contact person)',
    namePh: 'Faisal Al-Harbi',
    companyLabel: 'Company name',
    companyPh: 'Al Harbi Building Materials',
    phoneLabel: 'Phone number',
    phonePh: '+966 50 123 4567',
    phoneHint: 'Include the country code so WhatsApp works.',
    cityLabel: 'City',
    cityPh: 'Riyadh',
    addressLabel: 'Address',
    addressPh: 'Street, Building, Area',
    saveVendor: 'Save Vendor',
    updateVendor: 'Update Vendor',
    saving: 'Saving...',
    cancel: 'Cancel',
    required: 'Required',
    errName: 'Name is required',
    errCompany: 'Company name is required',
    errPhoneRequired: 'Phone number is required',
    errPhoneFormat: 'Enter phone with country code, e.g. +966 50 123 4567',
    errAddress: 'Address is required',
    errCity: 'City is required',
    errStorage: 'Could not save the vendor. Please try again.',
    contactPerson: 'Contact Person',
    company: 'Company',
    phone: 'Phone',
    address: 'Address',
    created: 'Created',
    updated: 'Updated',
    order: 'order',
    orders: 'orders',
    activeStatus: 'Active',
    deactivatedStatus: 'Deactivated',
    deactivateVendor: 'Deactivate Vendor',
    activateVendor: 'Activate Vendor',
    deactivateMsg: (name: string) =>
      `${name} will be deactivated. Historical orders remain unaffected, but the vendor will not appear in the Place Order dropdown.`,
    activateMsg: (name: string) =>
      `${name} will be re-activated and available for new orders.`,
    deactivate: 'Deactivate',
    activate: 'Activate',
    deleteVendor: 'Delete Vendor',
    deleteMsg: (name: string, id: string) =>
      `Delete ${name} (${id})? This cannot be undone.`,
    delete: 'Delete',
    toastAdded: (id: string) => `Vendor added — ${id}`,
    toastUpdated: (id: string) => `Vendor updated — ${id}`,
    toastDeleted: (id: string) => `Deleted — ${id}`,
    toastActivated: (id: string) => `Activated — ${id}`,
    toastDeactivated: (id: string) => `Deactivated — ${id}`,
    errHasOrders: (name: string, count: number) =>
      `${name} has ${count} order${count === 1 ? '' : 's'} and cannot be deleted. Deactivate it instead.`,
    errDeleteStorage: 'Could not delete the vendor. Please try again.',
    errUpdateStorage: 'Could not update the vendor. Please try again.',
    loading: 'Loading vendors...',
    loadError: 'Could not load vendors. Check your connection and try again.',
    retry: 'Retry',
    showing: 'Showing',
    of: 'of',
    actView: 'View',
    actEdit: 'Edit',
    actDeactivate: 'Deactivate',
    actActivate: 'Activate',
    actDelete: 'Delete',
  },
  ar: {
    pageTitle: 'المخزون — الموردون',
    pageSubtitle: 'إدارة دليل الموردين',
    statTotalVendors: 'إجمالي الموردين',
    addVendor: 'إضافة مورد',
    filters: 'الفلاتر',
    search: 'بحث',
    searchPh: 'الاسم، الشركة، الهاتف...',
    city: 'المدينة',
    allCities: 'جميع المدن',
    status: 'الحالة',
    statusActive: 'نشط',
    statusInactive: 'معطل',
    statusAll: 'الكل',
    clearFilters: 'مسح جميع الفلاتر',
    vendors: 'الموردون',
    colId: 'المعرف',
    colName: 'الاسم',
    colCompany: 'الشركة',
    colPhone: 'الهاتف',
    colCity: 'المدينة',
    colStatus: 'الحالة',
    colActions: 'الإجراءات',
    noVendors: 'لا يوجد موردون',
    addFirst: 'أضف أول مورد',
    addVendorTitle: 'إضافة مورد',
    editVendorTitle: 'تعديل المورد',
    newVendorId: (id: string) => `معرف المورد الجديد: ${id}`,
    editingVendor: (id: string) => `تعديل ${id}`,
    uniqueIdAuto: 'المعرف الفريد (تلقائي)',
    nameLabel: 'الاسم (جهة الاتصال)',
    namePh: 'فيصل الحربي',
    companyLabel: 'اسم الشركة',
    companyPh: 'شركة الحربي لمواد البناء',
    phoneLabel: 'رقم الهاتف',
    phonePh: '+966 50 123 4567',
    phoneHint: 'أدخل رمز الدولة حتى يعمل واتساب.',
    cityLabel: 'المدينة',
    cityPh: 'الرياض',
    addressLabel: 'العنوان',
    addressPh: 'الشارع، المبنى، المنطقة',
    saveVendor: 'حفظ المورد',
    updateVendor: 'تحديث المورد',
    saving: 'جارٍ الحفظ...',
    cancel: 'إلغاء',
    required: 'مطلوب',
    errName: 'الاسم مطلوب',
    errCompany: 'اسم الشركة مطلوب',
    errPhoneRequired: 'رقم الهاتف مطلوب',
    errPhoneFormat: 'أدخل الهاتف مع رمز الدولة، مثال: +966 50 123 4567',
    errAddress: 'العنوان مطلوب',
    errCity: 'المدينة مطلوبة',
    errStorage: 'تعذر حفظ المورد. حاول مرة أخرى.',
    contactPerson: 'جهة الاتصال',
    company: 'الشركة',
    phone: 'الهاتف',
    address: 'العنوان',
    created: 'تاريخ الإنشاء',
    updated: 'آخر تحديث',
    order: 'طلب',
    orders: 'طلبات',
    activeStatus: 'نشط',
    deactivatedStatus: 'معطل',
    deactivateVendor: 'تعطيل المورد',
    activateVendor: 'تفعيل المورد',
    deactivateMsg: (name: string) =>
      `سيتم تعطيل ${name}. لن تتأثر الطلبات السابقة، لكن المورد لن يظهر في قائمة تقديم الطلبات.`,
    activateMsg: (name: string) =>
      `سيتم إعادة تفعيل ${name} وسيكون متاحاً للطلبات الجديدة.`,
    deactivate: 'تعطيل',
    activate: 'تفعيل',
    deleteVendor: 'حذف المورد',
    deleteMsg: (name: string, id: string) =>
      `حذف ${name} (${id})؟ لا يمكن التراجع.`,
    delete: 'حذف',
    toastAdded: (id: string) => `تمت إضافة المورد — ${id}`,
    toastUpdated: (id: string) => `تم تحديث المورد — ${id}`,
    toastDeleted: (id: string) => `تم الحذف — ${id}`,
    toastActivated: (id: string) => `تم التفعيل — ${id}`,
    toastDeactivated: (id: string) => `تم التعطيل — ${id}`,
    errHasOrders: (name: string, count: number) =>
      `${name} لديه ${count} ${count === 1 ? 'طلب' : 'طلبات'} ولا يمكن حذفه. عطّله بدلاً من ذلك.`,
    errDeleteStorage: 'تعذر حذف المورد. حاول مرة أخرى.',
    errUpdateStorage: 'تعذر تحديث المورد. حاول مرة أخرى.',
    loading: 'جارٍ تحميل الموردين...',
    loadError: 'تعذر تحميل الموردين. تحقق من الاتصال وحاول مرة أخرى.',
    retry: 'إعادة المحاولة',
    showing: 'عرض',
    of: 'من',
    actView: 'عرض',
    actEdit: 'تعديل',
    actDeactivate: 'تعطيل',
    actActivate: 'تفعيل',
    actDelete: 'حذف',
  },
  ur: {
    pageTitle: 'انوینٹری — وینڈرز',
    pageSubtitle: 'وینڈر ڈائریکٹری برقرار رکھیں',
    statTotalVendors: 'کل وینڈرز',
    addVendor: 'وینڈر شامل کریں',
    filters: 'فلٹرز',
    search: 'تلاش',
    searchPh: 'نام، کمپنی، فون...',
    city: 'شہر',
    allCities: 'تمام شہر',
    status: 'حالت',
    statusActive: 'فعال',
    statusInactive: 'غیر فعال',
    statusAll: 'سب',
    clearFilters: 'تمام فلٹرز صاف کریں',
    vendors: 'وینڈرز',
    colId: 'ID',
    colName: 'نام',
    colCompany: 'کمپنی',
    colPhone: 'فون',
    colCity: 'شہر',
    colStatus: 'حالت',
    colActions: 'اقدامات',
    noVendors: 'کوئی وینڈر نہیں ملا',
    addFirst: 'اپنا پہلا وینڈر شامل کریں',
    addVendorTitle: 'وینڈر شامل کریں',
    editVendorTitle: 'وینڈر میں ترمیم کریں',
    newVendorId: (id: string) => `نیا وینڈر ID: ${id}`,
    editingVendor: (id: string) => `${id} میں ترمیم`,
    uniqueIdAuto: 'منفرد ID (خودکار)',
    nameLabel: 'نام (رابطہ شخص)',
    namePh: 'فیصل الحربی',
    companyLabel: 'کمپنی کا نام',
    companyPh: 'الحربی بلڈنگ میٹیریلز',
    phoneLabel: 'فون نمبر',
    phonePh: '+966 50 123 4567',
    phoneHint: 'ملکی کوڈ شامل کریں تاکہ واٹس ایپ کام کرے۔',
    cityLabel: 'شہر',
    cityPh: 'ریاض',
    addressLabel: 'پتہ',
    addressPh: 'گلی، عمارت، علاقہ',
    saveVendor: 'وینڈر محفوظ کریں',
    updateVendor: 'وینڈر اپ ڈیٹ کریں',
    saving: 'محفوظ ہو رہا ہے...',
    cancel: 'منسوخ',
    required: 'لازمی',
    errName: 'نام لازمی ہے',
    errCompany: 'کمپنی کا نام لازمی ہے',
    errPhoneRequired: 'فون نمبر لازمی ہے',
    errPhoneFormat: 'ملکی کوڈ کے ساتھ فون درج کریں، مثلاً: +966 50 123 4567',
    errAddress: 'پتہ لازمی ہے',
    errCity: 'شہر لازمی ہے',
    errStorage: 'وینڈر محفوظ نہیں ہو سکا۔ دوبارہ کوشش کریں۔',
    contactPerson: 'رابطہ شخص',
    company: 'کمپنی',
    phone: 'فون',
    address: 'پتہ',
    created: 'بنایا گیا',
    updated: 'اپ ڈیٹ ہوا',
    order: 'آرڈر',
    orders: 'آرڈرز',
    activeStatus: 'فعال',
    deactivatedStatus: 'غیر فعال',
    deactivateVendor: 'وینڈر غیر فعال کریں',
    activateVendor: 'وینڈر فعال کریں',
    deactivateMsg: (name: string) =>
      `${name} غیر فعال ہو جائے گا۔ پرانے آرڈرز متاثر نہیں ہوں گے، لیکن وینڈر آرڈر ڈراپ ڈاؤن میں نظر نہیں آئے گا۔`,
    activateMsg: (name: string) =>
      `${name} دوبارہ فعال ہو جائے گا اور نئے آرڈرز کے لیے دستیاب ہوگا۔`,
    deactivate: 'غیر فعال کریں',
    activate: 'فعال کریں',
    deleteVendor: 'وینڈر حذف کریں',
    deleteMsg: (name: string, id: string) =>
      `${name} (${id}) حذف کریں؟ اسے واپس نہیں کیا جا سکتا۔`,
    delete: 'حذف کریں',
    toastAdded: (id: string) => `وینڈر شامل ہو گیا — ${id}`,
    toastUpdated: (id: string) => `وینڈر اپ ڈیٹ ہو گیا — ${id}`,
    toastDeleted: (id: string) => `حذف ہو گیا — ${id}`,
    toastActivated: (id: string) => `فعال ہو گیا — ${id}`,
    toastDeactivated: (id: string) => `غیر فعال ہو گیا — ${id}`,
    errHasOrders: (name: string, count: number) =>
      `${name} کے پاس ${count} ${count === 1 ? 'آرڈر' : 'آرڈرز'} ہیں اور اسے حذف نہیں کیا جا سکتا۔ اسے غیر فعال کریں۔`,
    errDeleteStorage: 'وینڈر حذف نہیں ہو سکا۔ دوبارہ کوشش کریں۔',
    errUpdateStorage: 'وینڈر اپ ڈیٹ نہیں ہو سکا۔ دوبارہ کوشش کریں۔',
    loading: 'وینڈرز لوڈ ہو رہے ہیں...',
    loadError: 'وینڈرز لوڈ نہیں ہو سکے۔ کنکشن چیک کریں اور دوبارہ کوشش کریں۔',
    retry: 'دوبارہ کوشش کریں',
    showing: 'دکھا رہے ہیں',
    of: 'میں سے',
    actView: 'دیکھیں',
    actEdit: 'ترمیم',
    actDeactivate: 'غیر فعال کریں',
    actActivate: 'فعال کریں',
    actDelete: 'حذف کریں',
  },
  hi: {
    pageTitle: 'इन्वेंट्री — विक्रेता',
    pageSubtitle: 'विक्रेता निर्देशिका बनाए रखें',
    statTotalVendors: 'कुल विक्रेता',
    addVendor: 'विक्रेता जोड़ें',
    filters: 'फ़िल्टर',
    search: 'खोजें',
    searchPh: 'नाम, कंपनी, फ़ोन...',
    city: 'शहर',
    allCities: 'सभी शहर',
    status: 'स्थिति',
    statusActive: 'सक्रिय',
    statusInactive: 'निष्क्रिय',
    statusAll: 'सभी',
    clearFilters: 'सभी फ़िल्टर हटाएँ',
    vendors: 'विक्रेता',
    colId: 'ID',
    colName: 'नाम',
    colCompany: 'कंपनी',
    colPhone: 'फ़ोन',
    colCity: 'शहर',
    colStatus: 'स्थिति',
    colActions: 'क्रियाएँ',
    noVendors: 'कोई विक्रेता नहीं मिला',
    addFirst: 'अपना पहला विक्रेता जोड़ें',
    addVendorTitle: 'विक्रेता जोड़ें',
    editVendorTitle: 'विक्रेता संपादित करें',
    newVendorId: (id: string) => `नया विक्रेता ID: ${id}`,
    editingVendor: (id: string) => `${id} संपादित हो रहा है`,
    uniqueIdAuto: 'अद्वितीय ID (स्वतः)',
    nameLabel: 'नाम (संपर्क व्यक्ति)',
    namePh: 'फैसल अल-हर्बी',
    companyLabel: 'कंपनी का नाम',
    companyPh: 'अल हर्बी बिल्डिंग मटेरियल',
    phoneLabel: 'फ़ोन नंबर',
    phonePh: '+966 50 123 4567',
    phoneHint: 'देश कोड शामिल करें ताकि WhatsApp काम करे।',
    cityLabel: 'शहर',
    cityPh: 'रियाद',
    addressLabel: 'पता',
    addressPh: 'गली, भवन, क्षेत्र',
    saveVendor: 'विक्रेता सहेजें',
    updateVendor: 'विक्रेता अपडेट करें',
    saving: 'सहेजा जा रहा है...',
    cancel: 'रद्द करें',
    required: 'आवश्यक',
    errName: 'नाम आवश्यक है',
    errCompany: 'कंपनी का नाम आवश्यक है',
    errPhoneRequired: 'फ़ोन नंबर आवश्यक है',
    errPhoneFormat: 'देश कोड के साथ फ़ोन दर्ज करें, जैसे: +966 50 123 4567',
    errAddress: 'पता आवश्यक है',
    errCity: 'शहर आवश्यक है',
    errStorage: 'विक्रेता सहेजा नहीं जा सका। फिर कोशिश करें।',
    contactPerson: 'संपर्क व्यक्ति',
    company: 'कंपनी',
    phone: 'फ़ोन',
    address: 'पता',
    created: 'बनाया गया',
    updated: 'अपडेट हुआ',
    order: 'ऑर्डर',
    orders: 'ऑर्डर',
    activeStatus: 'सक्रिय',
    deactivatedStatus: 'निष्क्रिय',
    deactivateVendor: 'विक्रेता निष्क्रिय करें',
    activateVendor: 'विक्रेता सक्रिय करें',
    deactivateMsg: (name: string) =>
      `${name} निष्क्रिय हो जाएगा। पुराने ऑर्डर प्रभावित नहीं होंगे, लेकिन विक्रेता ऑर्डर ड्रॉपडाउन में नहीं दिखेगा।`,
    activateMsg: (name: string) =>
      `${name} फिर से सक्रिय हो जाएगा और नए ऑर्डर के लिए उपलब्ध होगा।`,
    deactivate: 'निष्क्रिय करें',
    activate: 'सक्रिय करें',
    deleteVendor: 'विक्रेता हटाएँ',
    deleteMsg: (name: string, id: string) =>
      `${name} (${id}) हटाएँ? यह पूर्ववत नहीं हो सकता।`,
    delete: 'हटाएँ',
    toastAdded: (id: string) => `विक्रेता जोड़ा गया — ${id}`,
    toastUpdated: (id: string) => `विक्रेता अपडेट हुआ — ${id}`,
    toastDeleted: (id: string) => `हटाया गया — ${id}`,
    toastActivated: (id: string) => `सक्रिय किया गया — ${id}`,
    toastDeactivated: (id: string) => `निष्क्रिय किया गया — ${id}`,
    errHasOrders: (name: string, count: number) =>
      `${name} के पास ${count} ऑर्डर हैं और इसे हटाया नहीं जा सकता। इसके बजाय निष्क्रिय करें।`,
    errDeleteStorage: 'विक्रेता हटाया नहीं जा सका। फिर कोशिश करें।',
    errUpdateStorage: 'विक्रेता अपडेट नहीं हो सका। फिर कोशिश करें।',
    loading: 'विक्रेता लोड हो रहे हैं...',
    loadError: 'विक्रेता लोड नहीं हो सके। कनेक्शन जाँचें और फिर कोशिश करें।',
    retry: 'पुनः प्रयास',
    showing: 'दिखा रहे हैं',
    of: 'में से',
    actView: 'देखें',
    actEdit: 'संपादित करें',
    actDeactivate: 'निष्क्रिय करें',
    actActivate: 'सक्रिय करें',
    actDelete: 'हटाएँ',
  },
} as const;

type Translations = {
  [K in keyof typeof t['en']]: (typeof t['en'])[K] extends (
    ...args: infer A
  ) => infer R
    ? (...args: A) => R
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

const isRTLLang = (lang: Language): boolean =>
  lang === 'ar' || lang === 'ur';

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
    <svg {...svgBase} className="w-3 h-3">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
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
  truck: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  phone: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
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
  clock: (
    <svg {...svgBase} className="w-3.5 h-3.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
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
  archive: (
    <svg {...svgBase} className="w-3 h-3">
      <rect x="2" y="3" width="20" height="5" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M10 12h4" />
    </svg>
  ),
  restore: (
    <svg {...svgBase} className="w-3 h-3">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  ),
};

// ============================================================
// CONSTANTS & HELPERS
// ============================================================
const PAGE_SIZE = 10;

const normalizePhone = (raw: string): string => {
  let s = raw.trim().replace(/[\s\-().]/g, '');
  if (s.startsWith('00')) s = `+${s.slice(2)}`;
  return s;
};

const validatePhone = (raw: string, tr: Translations): string | null => {
  if (!raw.trim()) return tr.errPhoneRequired;
  if (!/^\+[1-9]\d{7,14}$/.test(normalizePhone(raw))) return tr.errPhoneFormat;
  return null;
};

const formatDate = (iso: string, lang: Language = 'en'): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
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

// ============================================================
// STYLES — theme only (inline) [COMPACT]
// ============================================================
const labelCls =
  'block text-[9px] font-bold mb-1 uppercase tracking-wider';
const inputCls =
  'w-full h-9 px-3 rounded-full border-2 text-[13px] focus:outline-none transition-all';
const thCls =
  'text-[9px] font-bold uppercase tracking-wider px-3 py-2';
const errCls = 'text-[10px] font-semibold mt-1 px-2';
const primaryBtn =
  'h-9 px-4 rounded-full text-[13px] font-bold cursor-pointer transition-all duration-300 hover:brightness-95 hover:shadow-md flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed';
const ghostBtn =
  'h-9 px-4 rounded-full text-[13px] font-bold cursor-pointer border-2 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed';

const actionBtnBase =
  'inline-flex h-7 w-7 items-center justify-center rounded-full border cursor-pointer transition';

const inputStyle = (): React.CSSProperties => ({
  borderColor: 'rgba(102,116,90,0.2)',
  backgroundColor: 'rgba(247,243,234,0.6)',
  color: THEME.charcoal,
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
// MODAL [COMPACT]
// ============================================================
let modalSeq = 0;
const modalStack: number[] = [];

function Modal({
  title,
  subtitle,
  onClose,
  children,
  maxWidth = 'max-w-lg',
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(37,42,40,0.4)' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full ${maxWidth} max-h-[92vh] flex flex-col shadow-xl`}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
        }}
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
            {Icons.x}
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ============================================================
// VENDOR FORM MODAL  (ab vendorsService se save hota hai)
// ============================================================
function VendorFormModal({
  vendor,
  onClose,
  onSaved,
  tr,
}: {
  vendor?: Vendor | null;
  onClose: () => void;
  onSaved: (v: Vendor, wasEdit: boolean) => void;
  tr: Translations;
}): React.JSX.Element {
  const [form, setForm] = useState<VendorInput>({
    name: vendor?.name ?? '',
    companyName: vendor?.companyName ?? '',
    phone: vendor?.phone ?? '',
    address: vendor?.address ?? '',
    city: vendor?.city ?? '',
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof VendorInput, string>>
  >({});
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  // naye vendor ki ID server se aati hai (sirf dikhane ke liye; save par dobara banti hai)
  const [uniqueId, setUniqueId] = useState(vendor?.uniqueId ?? '');
  useEffect(() => {
    if (vendor) return;
    let cancelled = false;
    vendorsService
      .getNextUniqueId()
      .then((id) => {
        if (!cancelled) setUniqueId(id);
      })
      .catch((e) => console.error('getNextUniqueId failed', e));
    return () => {
      cancelled = true;
    };
  }, [vendor]);

  const set = (k: keyof VendorInput, v: string): void =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (): Promise<void> => {
    if (saving) return;
    const e: Partial<Record<keyof VendorInput, string>> = {};
    if (!form.name.trim()) e.name = tr.errName;
    if (!form.companyName.trim()) e.companyName = tr.errCompany;
    const phoneErr = validatePhone(form.phone, tr);
    if (phoneErr) e.phone = phoneErr;
    if (!form.address.trim()) e.address = tr.errAddress;
    if (!form.city.trim()) e.city = tr.errCity;
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const input: VendorInput = {
      name: form.name.trim(),
      companyName: form.companyName.trim(),
      phone: normalizePhone(form.phone),
      address: form.address.trim(),
      city: form.city.trim(),
    };

    setSaving(true);
    setSaveError('');
    try {
      const saved = vendor
        ? await vendorsService.updateVendor(vendor.id, input)
        : await vendorsService.createVendor(input);
      onSaved(saved, !!vendor);
    } catch (err) {
      console.error('save vendor failed', err);
      setSaveError(tr.errStorage);
      setSaving(false);
    }
  };

  const requiredStar = (
    <span style={{ color: THEME.warmBrass }}>*</span>
  );

  return (
    <Modal
      title={vendor ? tr.editVendorTitle : tr.addVendorTitle}
      subtitle={
        vendor
          ? tr.editingVendor(vendor.uniqueId)
          : tr.newVendorId(uniqueId || '…')
      }
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelCls} style={{ color: THEME.charcoal }}>
            {tr.uniqueIdAuto}
          </label>
          <input
            value={uniqueId || '…'}
            readOnly
            className={`${inputCls} font-mono cursor-not-allowed`}
            style={{
              borderColor: 'rgba(102,116,90,0.2)',
              backgroundColor: 'rgba(247,243,234,0.8)',
              color: THEME.mutedOlive,
            }}
          />
        </div>
        <div>
          <label className={labelCls} style={{ color: THEME.charcoal }}>
            {tr.nameLabel} {requiredStar}
          </label>
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder={tr.namePh}
            maxLength={120}
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
          <label className={labelCls} style={{ color: THEME.charcoal }}>
            {tr.companyLabel} {requiredStar}
          </label>
          <input
            value={form.companyName}
            onChange={(e) => set('companyName', e.target.value)}
            placeholder={tr.companyPh}
            maxLength={150}
            className={inputCls}
            style={inputStyle()}
          />
          {errors.companyName && (
            <p className={errCls} style={{ color: THEME.warmBrass }}>
              {errors.companyName}
            </p>
          )}
        </div>
        <div>
          <label className={labelCls} style={{ color: THEME.charcoal }}>
            {tr.phoneLabel} {requiredStar}
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder={tr.phonePh}
            maxLength={25}
            className={`${inputCls} font-mono`}
            style={inputStyle()}
          />
          {errors.phone ? (
            <p className={errCls} style={{ color: THEME.warmBrass }}>
              {errors.phone}
            </p>
          ) : (
            <p
              className="text-[9px] mt-1 px-2"
              style={{ color: THEME.mutedOlive }}
            >
              {tr.phoneHint}
            </p>
          )}
        </div>
        <div>
          <label className={labelCls} style={{ color: THEME.charcoal }}>
            {tr.cityLabel} {requiredStar}
          </label>
          <input
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
            placeholder={tr.cityPh}
            maxLength={80}
            className={inputCls}
            style={inputStyle()}
          />
          {errors.city && (
            <p className={errCls} style={{ color: THEME.warmBrass }}>
              {errors.city}
            </p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls} style={{ color: THEME.charcoal }}>
            {tr.addressLabel} {requiredStar}
          </label>
          <input
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            placeholder={tr.addressPh}
            maxLength={255}
            className={inputCls}
            style={inputStyle()}
          />
          {errors.address && (
            <p className={errCls} style={{ color: THEME.warmBrass }}>
              {errors.address}
            </p>
          )}
        </div>
      </div>

      {saveError && (
        <div
          className="mt-3 px-3 py-2 rounded-full text-[11px] font-bold flex items-center gap-2"
          style={{
            backgroundColor: 'rgba(196,154,90,0.1)',
            border: `2px solid rgba(196,154,90,0.4)`,
            color: THEME.charcoal,
          }}
        >
          {Icons.alert}
          <span>{saveError}</span>
        </div>
      )}

      <div
        className="flex gap-2.5 pt-4 mt-4 border-t"
        style={{ borderColor: 'rgba(102,116,90,0.1)' }}
      >
        <button
          onClick={() => void submit()}
          disabled={saving}
          className={primaryBtn}
          style={primaryBtnStyle}
        >
          {vendor ? Icons.check : Icons.plus}
          <span>
            {saving ? tr.saving : vendor ? tr.updateVendor : tr.saveVendor}
          </span>
        </button>
        <button
          onClick={onClose}
          disabled={saving}
          className={ghostBtn}
          style={ghostBtnStyle}
        >
          {tr.cancel}
        </button>
      </div>
    </Modal>
  );
}

// ============================================================
// VENDOR DETAILS MODAL [COMPACT]
// ============================================================
function VendorDetailsModal({
  vendor,
  orderCount,
  onClose,
  tr,
  lang,
}: {
  vendor: Vendor;
  orderCount: number;
  onClose: () => void;
  tr: Translations;
  lang: Language;
}): React.JSX.Element {
  return (
    <Modal
      title={vendor.companyName}
      subtitle={`${vendor.uniqueId} • ${orderCount} ${
        orderCount === 1 ? tr.order : tr.orders
      }`}
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <div className="space-y-3">
        <div
          className="flex items-center gap-2.5 p-2.5 rounded-xl"
          style={{ backgroundColor: 'rgba(247,243,234,0.6)' }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: THEME.warmBrass,
              color: '#FFFFFF',
            }}
          >
            {Icons.truck}
          </div>
          <div className="min-w-0">
            <p
              className="text-[13px] font-bold"
              style={{ color: THEME.charcoal }}
            >
              {vendor.name}
            </p>
            <p
              className="text-[9px] uppercase tracking-wider"
              style={{ color: THEME.mutedOlive }}
            >
              {tr.contactPerson}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 text-[11px]">
          <DetailRow
            icon={Icons.building}
            label={tr.company}
            value={vendor.companyName}
          />
          <DetailRow
            icon={Icons.phone}
            label={tr.phone}
            value={vendor.phone}
            mono
          />
          <DetailRow
            icon={Icons.location}
            label={tr.address}
            value={`${vendor.address}, ${vendor.city}`}
          />
          <DetailRow
            icon={Icons.clock}
            label={tr.created}
            value={formatDate(vendor.createdAt, lang)}
          />
          <DetailRow
            icon={Icons.edit}
            label={tr.updated}
            value={formatDate(vendor.updatedAt, lang)}
          />
        </div>

        <div
          className="flex items-center justify-between p-2.5 rounded-xl"
          style={{ backgroundColor: 'rgba(247,243,234,0.6)' }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: THEME.mutedOlive }}
          >
            {tr.status}
          </span>
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: vendor.active
                ? 'rgba(102,116,90,0.15)'
                : THEME.charcoal,
              color: vendor.active ? THEME.deepForest : THEME.warmIvory,
            }}
          >
            {vendor.active ? tr.activeStatus : tr.deactivatedStatus}
          </span>
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
      style={{ backgroundColor: 'rgba(247,243,234,0.5)' }}
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
        className={`text-right font-semibold ${mono ? 'font-mono' : ''}`}
        style={{ color: THEME.charcoal }}
      >
        {value}
      </span>
    </div>
  );
}

// ============================================================
// CONFIRM MODAL [COMPACT]
// ============================================================
function ConfirmModal({
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}): React.JSX.Element {
  return (
    <Modal title={title} onClose={onCancel} maxWidth="max-w-sm">
      <p className="text-[13px] mb-3" style={{ color: THEME.mutedOlive }}>
        {message}
      </p>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          disabled={busy}
          className={`${ghostBtn} flex-1`}
          style={ghostBtnStyle}
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={busy}
          className="flex-1 h-9 rounded-full text-[13px] font-bold cursor-pointer transition hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: danger ? THEME.charcoal : THEME.warmBrass,
            color: '#FFFFFF',
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

// ============================================================
// PAGINATION [COMPACT]
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
      style={{ borderColor: 'rgba(102,116,90,0.1)' }}
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
          className="w-7 h-7 rounded-full border hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition"
          style={{
            backgroundColor: THEME.warmIvory,
            color: THEME.mutedOlive,
            borderColor: 'rgba(102,116,90,0.2)',
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
                <span className="text-[11px]" style={{ color: THEME.mutedOlive }}>
                  …
                </span>
              )}
              <button
                onClick={() => onPage(p)}
                className="min-w-7 h-7 px-2 rounded-full text-[11px] font-bold cursor-pointer transition"
                style={
                  p === page
                    ? {
                        backgroundColor: THEME.warmBrass,
                        color: '#FFFFFF',
                      }
                    : {
                        backgroundColor: THEME.warmIvory,
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
          className="w-7 h-7 rounded-full border hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition"
          style={{
            backgroundColor: THEME.warmIvory,
            color: THEME.mutedOlive,
            borderColor: 'rgba(102,116,90,0.2)',
          }}
        >
          {Icons.chevronRight}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function VendorsPage(): React.JSX.Element {
  const [language, setLanguage] = useState<Language>(() => getStoredLanguage());
  useEffect(() => {
    const sync = () => setLanguage(getStoredLanguage());
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const tr = t[language] as Translations;
  const rtl = isRTLLang(language);

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [orderCounts, setOrderCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [viewVendor, setViewVendor] = useState<Vendor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Vendor | null>(null);

  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<
    'All' | 'Active' | 'Inactive'
  >('Active');
  const [page, setPage] = useState(1);

  // ----------------------------------------------------------
  // DATA LOADING (Supabase via vendorsService)
  // ----------------------------------------------------------
  // sirf sabse naya request apna result set kare (race condition se bachao)
  const requestId = useRef(0);

  const load = useCallback(async (silent = false): Promise<void> => {
    const myId = ++requestId.current;
    if (!silent) setLoading(true);
    try {
      const [v, c] = await Promise.all([
        vendorsService.getVendors(),
        vendorsService.getOrderCounts(),
      ]);
      if (myId !== requestId.current) return;
      setVendors(v);
      setOrderCounts(c);
      setLoadError(false);
    } catch (e) {
      console.error('load vendors failed', e);
      if (myId !== requestId.current) return;
      setLoadError(true);
    } finally {
      if (myId === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const onFocus = (): void => {
      void load(true);
    };
    window.addEventListener('focus', onFocus);
    return () => {
      requestId.current++; // unmount ke baad koi setState na ho
      window.removeEventListener('focus', onFocus);
    };
  }, [load]);

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

  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    vendors.forEach((v) => {
      if (v.city.trim()) set.add(v.city.trim());
    });
    return Array.from(set).sort();
  }, [vendors]);

  const filtered = useMemo(() => {
    let list = [...vendors];

    if (statusFilter === 'Active') list = list.filter((v) => v.active);
    else if (statusFilter === 'Inactive') list = list.filter((v) => !v.active);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.companyName.toLowerCase().includes(q) ||
          v.phone.toLowerCase().includes(q) ||
          v.uniqueId.toLowerCase().includes(q)
      );
    }

    if (cityFilter !== 'All') {
      list = list.filter((v) => v.city === cityFilter);
    }

    list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return list;
  }, [vendors, search, cityFilter, statusFilter]);

  // delete / filter ke baad page bahar na reh jaye
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const totalVendors = vendors.filter((v) => v.active).length;

  const clearFilters = (): void => {
    setSearch('');
    setCityFilter('All');
    setStatusFilter('Active');
    setPage(1);
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    cityFilter !== 'All' ||
    statusFilter !== 'Active';

  const handleSaved = (v: Vendor, wasEdit: boolean): void => {
    setShowForm(false);
    setEditingVendor(null);
    showSuccess(
      wasEdit ? tr.toastUpdated(v.uniqueId) : tr.toastAdded(v.uniqueId)
    );
    void load(true);
  };

  const handleEdit = (v: Vendor): void => {
    setEditingVendor(v);
    setShowForm(true);
  };

  const handleDelete = async (v: Vendor): Promise<void> => {
    if (busy) return;
    setBusy(true);
    try {
      await vendorsService.deleteVendor(v.id);
      showSuccess(tr.toastDeleted(v.uniqueId));
      await load(true);
    } catch (e) {
      if (e instanceof VendorHasOrdersError) {
        showError(tr.errHasOrders(v.companyName, e.count));
      } else {
        console.error('delete vendor failed', e);
        showError(tr.errDeleteStorage);
      }
    } finally {
      setDeleteTarget(null);
      setBusy(false);
    }
  };

  const handleToggleActive = async (v: Vendor): Promise<void> => {
    if (busy) return;
    setBusy(true);
    try {
      await vendorsService.setVendorActive(v.id, !v.active);
      showSuccess(
        v.active
          ? tr.toastDeactivated(v.uniqueId)
          : tr.toastActivated(v.uniqueId)
      );
      await load(true);
    } catch (e) {
      console.error('toggle vendor failed', e);
      showError(tr.errUpdateStorage);
    } finally {
      setToggleTarget(null);
      setBusy(false);
    }
  };

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className="min-h-screen p-4 lg:p-5"
      style={{ backgroundColor: THEME.warmIvory }}
    >
      {/* HEADER */}
      <div className="mb-4">
        <h1
          className="text-xl font-bold"
          style={{ color: THEME.deepForest }}
        >
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
            backgroundColor: 'rgba(102,116,90,0.15)',
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
            backgroundColor: 'rgba(196,154,90,0.15)',
            border: `2px solid rgba(196,154,90,0.4)`,
            color: THEME.charcoal,
          }}
        >
          {Icons.alert}
          <span>{errorMsg}</span>
        </div>
      )}
      {loadError && (
        <div
          className="mb-3 px-3 py-2 rounded-full text-[11px] font-bold flex items-center justify-between gap-2"
          style={{
            backgroundColor: 'rgba(196,154,90,0.15)',
            border: `2px solid rgba(196,154,90,0.4)`,
            color: THEME.charcoal,
          }}
        >
          <span className="flex items-center gap-2">
            {Icons.alert}
            <span>{tr.loadError}</span>
          </span>
          <button
            type="button"
            onClick={() => void load()}
            className="font-bold hover:underline cursor-pointer flex-shrink-0"
            style={{ color: THEME.warmBrass }}
          >
            {tr.retry}
          </button>
        </div>
      )}

      {/* SUMMARY CARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div
          className="rounded-2xl p-3 flex items-center gap-2.5"
          style={{
            backgroundColor: '#FFFFFF',
            border: `1px solid rgba(102,116,90,0.1)`,
          }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: THEME.warmBrass,
              color: '#FFFFFF',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 10px rgba(196,154,90,0.25)',
            }}
          >
            {Icons.truck}
          </div>
          <div className="min-w-0">
            <p
              className="text-[14px] font-bold"
              style={{ color: THEME.charcoal }}
            >
              {loading && vendors.length === 0 ? '—' : totalVendors}
            </p>
            <p
              className="text-[9px] uppercase tracking-wider font-bold"
              style={{ color: THEME.mutedOlive }}
            >
              {tr.statTotalVendors}
            </p>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => {
            setEditingVendor(null);
            setShowForm(true);
          }}
          className={primaryBtn}
          style={primaryBtnStyle}
        >
          {Icons.plus}
          <span>{tr.addVendor}</span>
        </button>
      </div>

      {/* FILTERS */}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className={labelCls} style={{ color: THEME.charcoal }}>
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
                className={`${inputCls} ps-8`}
                style={inputStyle()}
              />
            </div>
          </div>

          <div>
            <label className={labelCls} style={{ color: THEME.charcoal }}>
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

          <div>
            <label className={labelCls} style={{ color: THEME.charcoal }}>
              {tr.status}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as typeof statusFilter);
                setPage(1);
              }}
              className={`${inputCls} cursor-pointer`}
              style={inputStyle()}
            >
              <option value="Active">{tr.statusActive}</option>
              <option value="Inactive">{tr.statusInactive}</option>
              <option value="All">{tr.statusAll}</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div
            className="flex justify-end mt-3 pt-3 border-t"
            style={{ borderColor: 'rgba(102,116,90,0.1)' }}
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

      {/* VENDOR LIST */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: '#FFFFFF',
          border: `1px solid rgba(102,116,90,0.1)`,
        }}
      >
        <div
          className="px-4 py-2.5 border-b"
          style={{
            borderColor: 'rgba(102,116,90,0.1)',
            backgroundColor: 'rgba(247,243,234,0.4)',
          }}
        >
          <h2
            className="text-[13px] font-bold"
            style={{ color: THEME.deepForest }}
          >
            {tr.vendors}{' '}
            <span className="text-[11px] font-normal">({filtered.length})</span>
          </h2>
        </div>

        {loading && vendors.length === 0 ? (
          <div
            className="py-12 text-center text-[13px]"
            style={{ color: THEME.mutedOlive }}
          >
            {tr.loading}
          </div>
        ) : paginated.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px]">
                <thead>
                  <tr
                    className="border-b"
                    style={{
                      borderColor: 'rgba(102,116,90,0.1)',
                      backgroundColor: 'rgba(247,243,234,0.4)',
                    }}
                  >
                    <th className={`text-left ${thCls}`} style={{ color: THEME.mutedOlive }}>
                      {tr.colId}
                    </th>
                    <th className={`text-left ${thCls}`} style={{ color: THEME.mutedOlive }}>
                      {tr.colName}
                    </th>
                    <th
                      className={`text-left ${thCls} hidden md:table-cell`}
                      style={{ color: THEME.mutedOlive }}
                    >
                      {tr.colCompany}
                    </th>
                    <th
                      className={`text-left ${thCls} hidden lg:table-cell`}
                      style={{ color: THEME.mutedOlive }}
                    >
                      {tr.colPhone}
                    </th>
                    <th
                      className={`text-left ${thCls} hidden lg:table-cell`}
                      style={{ color: THEME.mutedOlive }}
                    >
                      {tr.colCity}
                    </th>
                    <th
                      className={`text-center ${thCls}`}
                      style={{ color: THEME.mutedOlive }}
                    >
                      {tr.colStatus}
                    </th>
                    <th
                      className={`text-center ${thCls} w-36`}
                      style={{ color: THEME.mutedOlive }}
                    >
                      {tr.colActions}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((v) => (
                    <tr
                      key={v.id}
                      className="border-b transition"
                      style={{
                        borderColor: 'rgba(102,116,90,0.05)',
                      }}
                    >
                      <td
                        className="px-3 py-2 text-[11px] font-mono font-bold"
                        style={{ color: THEME.charcoal }}
                      >
                        {v.uniqueId}
                      </td>
                      <td className="px-3 py-2">
                        <p
                          className="text-[12px] font-semibold truncate max-w-[180px]"
                          style={{ color: THEME.charcoal }}
                        >
                          {v.name}
                        </p>
                      </td>
                      <td className="px-3 py-2 hidden md:table-cell">
                        <p
                          className="text-[12px] truncate max-w-[200px]"
                          style={{ color: THEME.mutedOlive }}
                        >
                          {v.companyName}
                        </p>
                      </td>
                      <td className="px-3 py-2 hidden lg:table-cell">
                        <p
                          className="text-[11px] font-mono"
                          style={{ color: THEME.mutedOlive }}
                        >
                          {v.phone}
                        </p>
                      </td>
                      <td className="px-3 py-2 hidden lg:table-cell">
                        <p className="text-[11px]" style={{ color: THEME.mutedOlive }}>
                          {v.city}
                        </p>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: v.active
                              ? 'rgba(102,116,90,0.15)'
                              : THEME.charcoal,
                            color: v.active
                              ? THEME.deepForest
                              : THEME.warmIvory,
                          }}
                        >
                          {v.active ? tr.activeStatus : tr.deactivatedStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setViewVendor(v)}
                            aria-label={`${tr.actView} ${v.uniqueId}`}
                            className={actionBtnBase}
                            style={{
                              backgroundColor: '#FFFFFF',
                              color: THEME.mutedOlive,
                              borderColor: 'rgba(102,116,90,0.2)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = THEME.warmBrass;
                              e.currentTarget.style.borderColor =
                                'rgba(196,154,90,0.5)';
                              e.currentTarget.style.backgroundColor =
                                'rgba(247,243,234,1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = THEME.mutedOlive;
                              e.currentTarget.style.borderColor =
                                'rgba(102,116,90,0.2)';
                              e.currentTarget.style.backgroundColor =
                                '#FFFFFF';
                            }}
                          >
                            {Icons.eye}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(v)}
                            aria-label={`${tr.actEdit} ${v.uniqueId}`}
                            className={actionBtnBase}
                            style={{
                              backgroundColor: '#FFFFFF',
                              color: THEME.mutedOlive,
                              borderColor: 'rgba(102,116,90,0.2)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = THEME.warmBrass;
                              e.currentTarget.style.borderColor =
                                'rgba(196,154,90,0.5)';
                              e.currentTarget.style.backgroundColor =
                                'rgba(247,243,234,1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = THEME.mutedOlive;
                              e.currentTarget.style.borderColor =
                                'rgba(102,116,90,0.2)';
                              e.currentTarget.style.backgroundColor =
                                '#FFFFFF';
                            }}
                          >
                            {Icons.edit}
                          </button>
                          <button
                            type="button"
                            onClick={() => setToggleTarget(v)}
                            aria-label={`${v.active ? tr.actDeactivate : tr.actActivate} ${v.uniqueId}`}
                            className={actionBtnBase}
                            style={{
                              backgroundColor: v.active
                                ? 'rgba(196,154,90,0.15)'
                                : 'rgba(102,116,90,0.15)',
                              color: v.active
                                ? THEME.warmBrass
                                : THEME.deepForest,
                              borderColor: v.active
                                ? 'rgba(196,154,90,0.4)'
                                : 'rgba(102,116,90,0.3)',
                            }}
                          >
                            {v.active ? Icons.archive : Icons.restore}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(v)}
                            aria-label={`${tr.actDelete} ${v.uniqueId}`}
                            className={actionBtnBase}
                            style={{
                              backgroundColor: 'rgba(37,42,40,0.08)',
                              color: THEME.charcoal,
                              borderColor: 'rgba(37,42,40,0.2)',
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
              page={safePage}
              total={filtered.length}
              onPage={setPage}
              tr={tr}
            />
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="text-[13px]" style={{ color: THEME.mutedOlive }}>
              {tr.noVendors}
            </p>
            <button
              onClick={() => {
                setEditingVendor(null);
                setShowForm(true);
              }}
              className="mt-2 text-[11px] font-bold hover:underline cursor-pointer"
              style={{ color: THEME.warmBrass }}
            >
              {tr.addFirst}
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <VendorFormModal
          vendor={editingVendor}
          onClose={() => {
            setShowForm(false);
            setEditingVendor(null);
          }}
          onSaved={handleSaved}
          tr={tr}
        />
      )}

      {viewVendor && (
        <VendorDetailsModal
          vendor={viewVendor}
          orderCount={orderCounts[viewVendor.id] ?? 0}
          onClose={() => setViewVendor(null)}
          tr={tr}
          lang={language}
        />
      )}

      {toggleTarget && (
        <ConfirmModal
          title={
            toggleTarget.active ? tr.deactivateVendor : tr.activateVendor
          }
          message={
            toggleTarget.active
              ? tr.deactivateMsg(toggleTarget.companyName)
              : tr.activateMsg(toggleTarget.companyName)
          }
          confirmLabel={toggleTarget.active ? tr.deactivate : tr.activate}
          cancelLabel={tr.cancel}
          busy={busy}
          onConfirm={() => void handleToggleActive(toggleTarget)}
          onCancel={() => setToggleTarget(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title={tr.deleteVendor}
          message={tr.deleteMsg(
            deleteTarget.companyName,
            deleteTarget.uniqueId
          )}
          confirmLabel={tr.delete}
          cancelLabel={tr.cancel}
          danger
          busy={busy}
          onConfirm={() => void handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}