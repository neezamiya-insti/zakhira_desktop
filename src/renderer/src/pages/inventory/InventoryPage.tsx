/* eslint-disable prettier/prettier */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useRef, useState } from 'react';
import { THEME } from '@renderer/theme/theme';
import { loadUnits, getDefaultUnit } from '../settings/SettingsPage';
import {
  productService,
  PRODUCTS_SYNCED_EVENT,
  PRODUCTS_SYNC_ERROR_EVENT,
  type Product as DbProduct,
  type ProductInput,
  type Category,
} from '@renderer/services/productService';
import InventoryStats from './InventoryStats';
import InventoryCharts from './InventoryCharts';

// ============================================================
// 🌍 LANGUAGE
// ============================================================
type Language = 'en' | 'ar' | 'ur' | 'hi';

const t = {
  en: {
    pageTitle: 'Inventory — Products',
    pageSubtitle: 'Manage products and watch stock levels',
    outOfStockTitle: (n: number) => `Out of Stock Alerts (${n})`,
    addProduct: 'Add Product',
    editProduct: 'Edit Product',
    editProductSubtitle: (sku: string) => `Updating ${sku}`,
    filters: 'Filters',
    search: 'Search',
    searchPh: 'Product name, SKU, description...',
    stockStatus: 'Stock Status',
    all: 'All',
    allCategories: 'All Categories',
    inStock: 'In Stock',
    lowStock: 'Low Stock',
    outOfStock: 'Out of Stock',
    priceRange: 'Price Range',
    min: 'Min',
    max: 'Max',
    sortBy: 'Sort By',
    sortDate: 'Date Added (newest)',
    sortName: 'Name (A–Z)',
    sortPrice: 'Price (low → high)',
    sortStock: 'Stock (low → high)',
    sortCategory: 'Category (A–Z)',
    clearFilters: 'Clear all filters',
    products: 'Products',
    colImage: 'Image',
    colSku: 'SKU',
    colName: 'Name',
    colStock: 'Stock',
    colPrice: 'Price',
    colActions: 'Actions',
    low: 'low',
    noProducts: 'No products found',
    addFirst: 'Add your first product',
    actPreview: 'Preview',
    actEdit: 'Edit',
    actDelete: 'Delete',
    addProductTitle: 'Add Product',
    addProductSubtitle: (sku: string) => `SKU: ${sku} (auto-generated)`,
    productName: 'Product Name',
    priceSar: 'Price',
    stock: 'Stock',
    lowStockAlert: 'Low Stock Alert At',
    measuringUnit: 'Measuring Unit',
    category: 'Category',
    selectCategory: 'Select category',
    addCategory: 'Add',
    noCategories: 'No categories yet — click Add to create one',
    newCategoryTitle: 'New Category',
    newCategorySubtitle: 'Create a category for your products',
    categoryName: 'Category Name',
    categoryNamePh: 'e.g. Electronics',
    errCategoryName: 'Category name is required',
    errCategoryRequired: 'Please select or add a category',
    errCategoryExists: 'This category already exists',
    saveCategory: 'Save Category',
    description: 'Description',
    descriptionPh: 'Optional description...',
    images: 'Images',
    upload: 'Upload',
    processing: 'Processing...',
    thumbnail: 'Thumbnail',
    imagesHint: (max: number) =>
      `JPG, PNG, WEBP • Max ${max} images • First image = thumbnail`,
    saveProduct: 'Save Product',
    updateProduct: 'Update Product',
    cancel: 'Cancel',
    errProductName: 'Product name is required',
    errPrice: 'Price must be greater than 0',
    errCostPrice: 'Cost price cannot be negative',
    errStock: 'Stock must be a whole number (0 or more)',
    errImages: 'At least 1 image is required',
    errUnit: 'Select a measuring unit',
    errStorage: 'Could not save — storage may be full.',
    errImageType: 'Only JPG, PNG, WEBP allowed',
    errImageProcess: 'Could not process image',
    previewTitle: 'Product Preview',
    skuLabel: 'SKU',
    nameLabel: 'Name',
    descriptionLabel: 'Description',
    priceLabel: 'Price',
    costPrice: 'Cost Price',
    costPriceHint: 'Purchase cost — used for profit calculation',
    profitLabel: 'Profit',
    profitHint: 'per unit',
    stockLabel: 'Stock',
    unitLabel: 'Unit',
    categoryLabel: 'Category',
    statusLabel: 'Status',
    createdLabel: 'Created',
    updatedLabel: 'Updated',
    deleteTitle: 'Delete Product',
    deleteMsg: (name: string, sku: string) =>
      `Delete ${name} (${sku})? This cannot be undone.`,
    deleteConfirm: 'Delete',
    toastCreated: (sku: string) => `Product created — ${sku}`,
    toastUpdated: (sku: string) => `Product updated — ${sku}`,
    toastDeleted: (sku: string) => `Deleted — ${sku}`,
    toastHasHistory: (name: string) =>
      `${name} has order history and cannot be deleted.`,
    errDeleteStorage: 'Could not delete — storage may be full.',
    syncFailed: 'Sync failed',
    showing: 'Showing',
    of: 'of',
    statusInStock: 'In Stock',
    statusLowStock: 'Low Stock',
    statusOutOfStock: 'Out of Stock',
  },
  ar: {
    pageTitle: 'المخزون — المنتجات',
    pageSubtitle: 'أدر المنتجات وراقب مستويات المخزون',
    outOfStockTitle: (n: number) => `تنبيهات نفاد المخزون (${n})`,
    addProduct: 'إضافة منتج',
    editProduct: 'تعديل المنتج',
    editProductSubtitle: (sku: string) => `تحديث ${sku}`,
    filters: 'الفلاتر',
    search: 'بحث',
    searchPh: 'اسم المنتج، SKU، الوصف...',
    stockStatus: 'حالة المخزون',
    all: 'الكل',
    allCategories: 'جميع الفئات',
    inStock: 'متوفر',
    lowStock: 'مخزون منخفض',
    outOfStock: 'نفد المخزون',
    priceRange: 'نطاق السعر',
    min: 'الأدنى',
    max: 'الأعلى',
    sortBy: 'ترتيب حسب',
    sortDate: 'تاريخ الإضافة (الأحدث)',
    sortName: 'الاسم (أ–ي)',
    sortPrice: 'السعر (من الأقل)',
    sortStock: 'المخزون (من الأقل)',
    sortCategory: 'الفئة (أ–ي)',
    clearFilters: 'مسح جميع الفلاتر',
    products: 'المنتجات',
    colImage: 'صورة',
    colSku: 'SKU',
    colName: 'الاسم',
    colStock: 'المخزون',
    colPrice: 'السعر',
    colActions: 'الإجراءات',
    low: 'منخفض',
    noProducts: 'لا توجد منتجات',
    addFirst: 'أضف منتجك الأول',
    actPreview: 'معاينة',
    actEdit: 'تعديل',
    actDelete: 'حذف',
    addProductTitle: 'إضافة منتج',
    addProductSubtitle: (sku: string) => `SKU: ${sku} (تم إنشاؤه تلقائياً)`,
    productName: 'اسم المنتج',
    priceSar: 'السعر',
    stock: 'المخزون',
    lowStockAlert: 'تنبيه المخزون المنخفض عند',
    measuringUnit: 'وحدة القياس',
    category: 'الفئة',
    selectCategory: 'اختر الفئة',
    addCategory: 'إضافة',
    noCategories: 'لا توجد فئات بعد — اضغط إضافة لإنشاء واحدة',
    newCategoryTitle: 'فئة جديدة',
    newCategorySubtitle: 'أنشئ فئة لمنتجاتك',
    categoryName: 'اسم الفئة',
    categoryNamePh: 'مثال: إلكترونيات',
    errCategoryName: 'اسم الفئة مطلوب',
    errCategoryRequired: 'يرجى اختيار أو إضافة فئة',
    errCategoryExists: 'هذه الفئة موجودة بالفعل',
    saveCategory: 'حفظ الفئة',
    description: 'الوصف',
    descriptionPh: 'وصف اختياري...',
    images: 'الصور',
    upload: 'رفع',
    processing: 'جارٍ المعالجة...',
    thumbnail: 'مصغرة',
    imagesHint: (max: number) =>
      `JPG، PNG، WEBP • الحد الأقصى ${max} صور • الصورة الأولى = مصغرة`,
    saveProduct: 'حفظ المنتج',
    updateProduct: 'تحديث المنتج',
    cancel: 'إلغاء',
    errProductName: 'اسم المنتج مطلوب',
    errPrice: 'يجب أن يكون السعر أكبر من 0',
    errCostPrice: 'لا يمكن أن يكون سعر التكلفة سالباً',
    errStock: 'يجب أن يكون المخزون عدداً صحيحاً (0 أو أكثر)',
    errImages: 'مطلوب صورة واحدة على الأقل',
    errUnit: 'اختر وحدة قياس',
    errStorage: 'تعذر الحفظ — قد تكون مساحة التخزين ممتلئة.',
    errImageType: 'يُسمح فقط بـ JPG، PNG، WEBP',
    errImageProcess: 'تعذر معالجة الصورة',
    previewTitle: 'معاينة المنتج',
    skuLabel: 'SKU',
    nameLabel: 'الاسم',
    descriptionLabel: 'الوصف',
    priceLabel: 'السعر',
    costPrice: 'سعر التكلفة',
    costPriceHint: 'تكلفة الشراء — تُستخدم لحساب الربح',
    profitLabel: 'الربح',
    profitHint: 'لكل وحدة',
    stockLabel: 'المخزون',
    unitLabel: 'الوحدة',
    categoryLabel: 'الفئة',
    statusLabel: 'الحالة',
    createdLabel: 'أُنشئ',
    updatedLabel: 'حُدّث',
    deleteTitle: 'حذف المنتج',
    deleteMsg: (name: string, sku: string) =>
      `حذف ${name} (${sku})؟ لا يمكن التراجع.`,
    deleteConfirm: 'حذف',
    toastCreated: (sku: string) => `تم إنشاء المنتج — ${sku}`,
    toastUpdated: (sku: string) => `تم تحديث المنتج — ${sku}`,
    toastDeleted: (sku: string) => `تم الحذف — ${sku}`,
    toastHasHistory: (name: string) =>
      `${name} لديه سجل طلبات ولا يمكن حذفه.`,
    errDeleteStorage: 'تعذر الحذف — قد تكون مساحة التخزين ممتلئة.',
    syncFailed: 'فشلت المزامنة',
    showing: 'عرض',
    of: 'من',
    statusInStock: 'متوفر',
    statusLowStock: 'مخزون منخفض',
    statusOutOfStock: 'نفد المخزون',
  },
  ur: {
    pageTitle: 'انوینٹری — مصنوعات',
    pageSubtitle: 'مصنوعات کا انتظام کریں اور اسٹاک لیول دیکھیں',
    outOfStockTitle: (n: number) => `اسٹاک ختم کی اطلاع (${n})`,
    addProduct: 'مصنوعات شامل کریں',
    editProduct: 'مصنوعات میں ترمیم',
    editProductSubtitle: (sku: string) => `${sku} کی اپ ڈیٹ`,
    filters: 'فلٹرز',
    search: 'تلاش',
    searchPh: 'پروڈکٹ کا نام، SKU، تفصیل...',
    stockStatus: 'اسٹاک کی حالت',
    all: 'تمام',
    allCategories: 'تمام زمرے',
    inStock: 'دستیاب',
    lowStock: 'کم اسٹاک',
    outOfStock: 'اسٹاک ختم',
    priceRange: 'قیمت کی حد',
    min: 'کم از کم',
    max: 'زیادہ سے زیادہ',
    sortBy: 'ترتیب',
    sortDate: 'تاریخ شامل (نئے)',
    sortName: 'نام (ا–ی)',
    sortPrice: 'قیمت (کم سے زیادہ)',
    sortStock: 'اسٹاک (کم سے زیادہ)',
    sortCategory: 'زمرہ (ا–ی)',
    clearFilters: 'تمام فلٹرز صاف کریں',
    products: 'مصنوعات',
    colImage: 'تصویر',
    colSku: 'SKU',
    colName: 'نام',
    colStock: 'اسٹاک',
    colPrice: 'قیمت',
    colActions: 'اقدامات',
    low: 'کم',
    noProducts: 'کوئی مصنوعات نہیں ملیں',
    addFirst: 'اپنی پہلی مصنوعات شامل کریں',
    actPreview: 'جھلک',
    actEdit: 'ترمیم',
    actDelete: 'حذف',
    addProductTitle: 'مصنوعات شامل کریں',
    addProductSubtitle: (sku: string) => `SKU: ${sku} (خودکار بنایا گیا)`,
    productName: 'پروڈکٹ کا نام',
    priceSar: 'قیمت',
    stock: 'اسٹاک',
    lowStockAlert: 'کم اسٹاک الرٹ پر',
    measuringUnit: 'پیمائش کا یونٹ',
    category: 'زمرہ',
    selectCategory: 'زمرہ منتخب کریں',
    addCategory: 'شامل کریں',
    noCategories: 'ابھی کوئی زمرہ نہیں — بنانے کے لیے شامل کریں دبائیں',
    newCategoryTitle: 'نیا زمرہ',
    newCategorySubtitle: 'اپنی مصنوعات کے لیے زمرہ بنائیں',
    categoryName: 'زمرے کا نام',
    categoryNamePh: 'مثلاً: الیکٹرانکس',
    errCategoryName: 'زمرے کا نام لازمی ہے',
    errCategoryRequired: 'براہ کرم زمرہ منتخب کریں یا شامل کریں',
    errCategoryExists: 'یہ زمرہ پہلے سے موجود ہے',
    saveCategory: 'زمرہ محفوظ کریں',
    description: 'تفصیل',
    descriptionPh: 'اختیاری تفصیل...',
    images: 'تصاویر',
    upload: 'اپ لوڈ',
    processing: 'پروسیس ہو رہا ہے...',
    thumbnail: 'تھمب نیل',
    imagesHint: (max: number) =>
      `JPG، PNG، WEBP • زیادہ سے زیادہ ${max} تصاویر • پہلی تصویر = تھمب نیل`,
    saveProduct: 'مصنوعات محفوظ کریں',
    updateProduct: 'مصنوعات اپ ڈیٹ کریں',
    cancel: 'منسوخ',
    errProductName: 'پروڈکٹ کا نام لازمی ہے',
    errPrice: 'قیمت 0 سے زیادہ ہونی چاہیے',
    errCostPrice: 'لاگت قیمت منفی نہیں ہو سکتی',
    errStock: 'اسٹاک مکمل عدد ہونا چاہیے (0 یا زیادہ)',
    errImages: 'کم از کم 1 تصویر لازمی ہے',
    errUnit: 'پیمائش کا یونٹ منتخب کریں',
    errStorage: 'محفوظ نہیں ہو سکا — اسٹوریج بھری ہو سکتی ہے۔',
    errImageType: 'صرف JPG، PNG، WEBP کی اجازت ہے',
    errImageProcess: 'تصویر پروسیس نہیں ہو سکی',
    previewTitle: 'پروڈکٹ کی جھلک',
    skuLabel: 'SKU',
    nameLabel: 'نام',
    descriptionLabel: 'تفصیل',
    priceLabel: 'قیمت',
    costPrice: 'لاگت قیمت',
    costPriceHint: 'خریداری کی لاگت — منافع کے حساب کے لیے',
    profitLabel: 'منافع',
    profitHint: 'فی یونٹ',
    stockLabel: 'اسٹاک',
    unitLabel: 'یونٹ',
    categoryLabel: 'زمرہ',
    statusLabel: 'حالت',
    createdLabel: 'بنایا گیا',
    updatedLabel: 'اپ ڈیٹ ہوا',
    deleteTitle: 'مصنوعات حذف کریں',
    deleteMsg: (name: string, sku: string) =>
      `${name} (${sku}) حذف کریں؟ یہ واپس نہیں ہو سکتا۔`,
    deleteConfirm: 'حذف',
    toastCreated: (sku: string) => `مصنوعات بن گئی — ${sku}`,
    toastUpdated: (sku: string) => `مصنوعات اپ ڈیٹ ہو گئی — ${sku}`,
    toastDeleted: (sku: string) => `حذف ہو گئی — ${sku}`,
    toastHasHistory: (name: string) =>
      `${name} کا آرڈر ہسٹری ہے اور اسے حذف نہیں کیا جا سکتا۔`,
    errDeleteStorage: 'حذف نہیں ہو سکا — اسٹوریج بھری ہو سکتی ہے۔',
    syncFailed: 'سنک ناکام ہو گیا',
    showing: 'دکھا رہے ہیں',
    of: 'میں سے',
    statusInStock: 'دستیاب',
    statusLowStock: 'کم اسٹاک',
    statusOutOfStock: 'اسٹاک ختم',
  },
  hi: {
    pageTitle: 'इन्वेंट्री — उत्पाद',
    pageSubtitle: 'उत्पादों को प्रबंधित करें और स्टॉक स्तर देखें',
    outOfStockTitle: (n: number) => `स्टॉक ख़त्म अलर्ट (${n})`,
    addProduct: 'उत्पाद जोड़ें',
    editProduct: 'उत्पाद संपादित करें',
    editProductSubtitle: (sku: string) => `${sku} अपडेट हो रहा है`,
    filters: 'फ़िल्टर',
    search: 'खोजें',
    searchPh: 'उत्पाद नाम, SKU, विवरण...',
    stockStatus: 'स्टॉक स्थिति',
    all: 'सभी',
    allCategories: 'सभी श्रेणियाँ',
    inStock: 'स्टॉक में',
    lowStock: 'कम स्टॉक',
    outOfStock: 'स्टॉक ख़त्म',
    priceRange: 'मूल्य सीमा',
    min: 'न्यूनतम',
    max: 'अधिकतम',
    sortBy: 'क्रमबद्ध करें',
    sortDate: 'तारीख़ जोड़ी (नवीनतम)',
    sortName: 'नाम (अ–ज्ञ)',
    sortPrice: 'मूल्य (कम → अधिक)',
    sortStock: 'स्टॉक (कम → अधिक)',
    sortCategory: 'श्रेणी (अ–ज्ञ)',
    clearFilters: 'सभी फ़िल्टर हटाएँ',
    products: 'उत्पाद',
    colImage: 'चित्र',
    colSku: 'SKU',
    colName: 'नाम',
    colStock: 'स्टॉक',
    colPrice: 'मूल्य',
    colActions: 'क्रियाएँ',
    low: 'कम',
    noProducts: 'कोई उत्पाद नहीं मिला',
    addFirst: 'अपना पहला उत्पाद जोड़ें',
    actPreview: 'पूर्वावलोकन',
    actEdit: 'संपादित करें',
    actDelete: 'हटाएँ',
    addProductTitle: 'उत्पाद जोड़ें',
    addProductSubtitle: (sku: string) => `SKU: ${sku} (स्वतः बनाया गया)`,
    productName: 'उत्पाद का नाम',
    priceSar: 'मूल्य',
    stock: 'स्टॉक',
    lowStockAlert: 'कम स्टॉक अलर्ट पर',
    measuringUnit: 'मापन इकाई',
    category: 'श्रेणी',
    selectCategory: 'श्रेणी चुनें',
    addCategory: 'जोड़ें',
    noCategories: 'अभी कोई श्रेणी नहीं — बनाने के लिए जोड़ें दबाएँ',
    newCategoryTitle: 'नई श्रेणी',
    newCategorySubtitle: 'अपने उत्पादों के लिए श्रेणी बनाएँ',
    categoryName: 'श्रेणी का नाम',
    categoryNamePh: 'जैसे: इलेक्ट्रॉनिक्स',
    errCategoryName: 'श्रेणी का नाम आवश्यक है',
    errCategoryRequired: 'कृपया श्रेणी चुनें या जोड़ें',
    errCategoryExists: 'यह श्रेणी पहले से मौजूद है',
    saveCategory: 'श्रेणी सहेजें',
    description: 'विवरण',
    descriptionPh: 'वैकल्पिक विवरण...',
    images: 'चित्र',
    upload: 'अपलोड',
    processing: 'प्रोसेस हो रहा है...',
    thumbnail: 'थंबनेल',
    imagesHint: (max: number) =>
      `JPG, PNG, WEBP • अधिकतम ${max} चित्र • पहला चित्र = थंबनेल`,
    saveProduct: 'उत्पाद सहेजें',
    updateProduct: 'उत्पाद अपडेट करें',
    cancel: 'रद्द करें',
    errProductName: 'उत्पाद का नाम आवश्यक है',
    errPrice: 'मूल्य 0 से अधिक होना चाहिए',
    errCostPrice: 'लागत मूल्य ऋणात्मक नहीं हो सकता',
    errStock: 'स्टॉक पूर्ण संख्या होनी चाहिए (0 या अधिक)',
    errImages: 'कम से कम 1 चित्र आवश्यक है',
    errUnit: 'मापन इकाई चुनें',
    errStorage: 'सहेजा नहीं जा सका — स्टोरेज भरा हो सकता है।',
    errImageType: 'केवल JPG, PNG, WEBP की अनुमति है',
    errImageProcess: 'चित्र प्रोसेस नहीं हो सका',
    previewTitle: 'उत्पाद पूर्वावलोकन',
    skuLabel: 'SKU',
    nameLabel: 'नाम',
    descriptionLabel: 'विवरण',
    priceLabel: 'मूल्य',
    costPrice: 'लागत मूल्य',
    costPriceHint: 'खरीद लागत — लाभ गणना के लिए',
    profitLabel: 'लाभ',
    profitHint: 'प्रति इकाई',
    stockLabel: 'स्टॉक',
    unitLabel: 'इकाई',
    categoryLabel: 'श्रेणी',
    statusLabel: 'स्थिति',
    createdLabel: 'बनाया गया',
    updatedLabel: 'अपडेट हुआ',
    deleteTitle: 'उत्पाद हटाएँ',
    deleteMsg: (name: string, sku: string) =>
      `${name} (${sku}) हटाएँ? यह पूर्ववत नहीं हो सकता।`,
    deleteConfirm: 'हटाएँ',
    toastCreated: (sku: string) => `उत्पाद बनाया गया — ${sku}`,
    toastUpdated: (sku: string) => `उत्पाद अपडेट हुआ — ${sku}`,
    toastDeleted: (sku: string) => `हटाया गया — ${sku}`,
    toastHasHistory: (name: string) =>
      `${name} का ऑर्डर इतिहास है और इसे हटाया नहीं जा सकता।`,
    errDeleteStorage: 'हटाया नहीं जा सका — स्टोरेज भरा हो सकता है।',
    syncFailed: 'सिंक विफल रहा',
    showing: 'दिखा रहे हैं',
    of: 'में से',
    statusInStock: 'स्टॉक में',
    statusLowStock: 'कम स्टॉक',
    statusOutOfStock: 'स्टॉक ख़त्म',
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
type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';
type SortKey = 'name' | 'price' | 'stock' | 'date' | 'category';
type Unit = ReturnType<typeof loadUnits>[number];

type Product = {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  costPrice?: number; // purchase cost (optional)
  stock: number;
  lowStockLevel: number;
  /** List rows carry only the thumbnail; edit/preview load ALL images from SQLite first */
  images: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
  unit: string; // unit_id
  category: string; // category name (display / filter)
  categoryId: string | null;
};

// ============================================================
// THEME (THEME itself is imported from '@renderer/theme/theme')
// ============================================================
const SOFT_BG = 'rgba(18, 60, 50, 0.06)';
const ROW_BG = 'rgba(18, 60, 50, 0.10)';
const ROW_BG_HOVER = 'rgba(18, 60, 50, 0.18)';
const ROW_BORDER = 'rgba(18, 60, 50, 0.18)';
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

const ACTION = {
  default: {
    background: THEME.warmIvory,
    color: THEME.deepForest,
    border: `1px solid ${THEME.mutedOlive}60`,
  },
  warn: {
    background: THEME.warmIvory,
    color: THEME.warmBrass,
    border: `1px solid ${THEME.warmBrass}`,
  },
  danger: {
    background: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fca5a5',
  },
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
  box: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.3 7 12 12l8.7-5M12 22V12" />
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
  upload: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  ),
  image: (
    <svg {...svgBase} className="w-4 h-4">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  ),
  clock: (
    <svg {...svgBase} className="w-4 h-4">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  tag: (
    <svg {...svgBase} className="w-4 h-4">
      <path d="M20.59 13.41 12 22l-9-9V4a1 1 0 0 1 1-1h9l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
  ),
};

// ============================================================
// CONSTANTS + HELPERS
// ============================================================
/**
 * LEGACY ONLY: older versions kept images in localStorage under this key.
 * Images now live in SQLite (product_images) and sync to Supabase.
 * The old data is migrated once (see migrateLegacyImages) and then removed.
 */
const LEGACY_IMAGES_KEY = 'zakhira_product_images';

const PAGE_SIZE = 10;
const MAX_IMAGES = 5;
const DEFAULT_LOW_STOCK = 5;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const FALLBACK_UNIT = 'piece';
const FALLBACK_CATEGORY = 'Uncategorized';
const ALL_CATEGORIES = '__all__';

const roundMoney = (n: number): number =>
  Math.round((n + Number.EPSILON) * 100) / 100;

const formatMoney = (n: number): string => {
  const abs = Math.abs(n);
  return `${n < 0 ? '-' : ''}${abs.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (iso: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

const isWholeNumber = (s: string): boolean => /^\d+$/.test(s.trim());

// unit is stored as unit_id; label is resolved from the units list
const unitLabel = (unitId: string): string => {
  try {
    const found = loadUnits().find((u) => u.id === unitId);
    return found ? found.label : FALLBACK_UNIT;
  } catch {
    return FALLBACK_UNIT;
  }
};

const getStockStatus = (
  p: Pick<Product, 'stock' | 'lowStockLevel'>
): StockStatus =>
  p.stock === 0
    ? 'Out of Stock'
    : p.stock <= p.lowStockLevel
      ? 'Low Stock'
      : 'In Stock';

const stockStatusLabel = (status: StockStatus, tr: Translations): string =>
  status === 'In Stock'
    ? tr.statusInStock
    : status === 'Low Stock'
      ? tr.statusLowStock
      : tr.statusOutOfStock;

const generateSKU = (existing: Product[]): string => {
  const numbers = existing
    .map((p) => {
      const m = p.sku.match(/SKU-(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter((n) => n > 0);
  const max = numbers.length ? Math.max(...numbers) : 0;
  return `SKU-${String(max + 1).padStart(4, '0')}`;
};

const processImageFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Not a valid image'));
      img.onload = () => {
        const scale = Math.min(1, 800 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not process image'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.82));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });

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

// ============================================================
// LEGACY IMAGE MIGRATION + DB → UI MAPPING
// ============================================================
const readLegacyImageMap = (): Record<string, string[]> => {
  try {
    const parsed = JSON.parse(localStorage.getItem(LEGACY_IMAGES_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

/** Removes migrated ids from the legacy map (deletes the key when empty). */
const dropLegacyImages = (doneIds: string[]): void => {
  try {
    const map = readLegacyImageMap();
    doneIds.forEach((id) => delete map[id]);
    if (Object.keys(map).length === 0) {
      localStorage.removeItem(LEGACY_IMAGES_KEY);
    } else {
      localStorage.setItem(LEGACY_IMAGES_KEY, JSON.stringify(map));
    }
  } catch {
    /* ignore */
  }
};

const toUiProduct = (
  p: DbProduct,
  cats: Category[],
  thumbs: Record<string, string>
): Product => ({
  id: p.id,
  sku: p.sku,
  name: p.name,
  description: p.description || '',
  price: Number(p.price),
  costPrice: Number(p.cost_price) || undefined,
  stock: Number(p.stock),
  lowStockLevel: Number(p.low_stock_level),
  images: thumbs[p.id] ? [thumbs[p.id]] : [],
  active: p.active,
  createdAt: p.created_at,
  updatedAt: p.updated_at,
  unit: p.unit_id,
  category: cats.find((c) => c.id === p.category_id)?.name || FALLBACK_CATEGORY,
  categoryId: p.category_id,
});

// ============================================================
// STYLES
// ============================================================
const labelCls = 'block text-[9px] font-bold mb-1 uppercase tracking-wider';
const inputCls =
  'w-full h-9 px-3 rounded-full border-2 text-[13px] placeholder:text-[#66745A]/60 focus:outline-none transition-all';
const textareaCls =
  'w-full px-3 py-2 rounded-xl border-2 text-[13px] placeholder:text-[#66745A]/60 focus:outline-none transition-all resize-none';

const primaryBtn: React.CSSProperties = {
  height: 36,
  padding: '0 16px',
  borderRadius: 9999,
  background: THEME.deepForest,
  color: THEME.warmIvory,
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  border: 'none',
};

const brassBtn: React.CSSProperties = {
  ...primaryBtn,
  background: THEME.warmBrass,
  boxShadow: '0 4px 12px rgba(196,154,90,0.35)',
};

const ghostBtn: React.CSSProperties = {
  ...primaryBtn,
  background: 'transparent',
  border: `2px solid ${THEME.mutedOlive}40`,
  color: THEME.mutedOlive,
};

const ALIGN = {
  start: 'text-start',
  end: 'text-end',
  center: 'text-center',
} as const;

function Th({
  label,
  align = 'start',
  w = '',
}: {
  label: string;
  align?: keyof typeof ALIGN;
  w?: string;
}): React.JSX.Element {
  return (
    <th
      className={`${ALIGN[align]} text-[9px] font-bold uppercase tracking-wider px-3 py-2 ${w}`}
      style={{ color: THEME.mutedOlive }}
    >
      {label}
    </th>
  );
}

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <h3
      className="text-[9px] font-bold uppercase tracking-wider mb-1.5"
      style={{ color: THEME.mutedOlive }}
    >
      {children}
    </h3>
  );
}

function PreviewField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div>
      <SectionTitle>{label}</SectionTitle>
      {children}
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
        style={{ background: '#FFFFFF' }}
      >
        <div
          className="flex items-start justify-between gap-3 px-5 pt-5 pb-3"
          style={{ borderBottom: `1px solid ${THEME.mutedOlive}30` }}
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
            aria-label={t[lang].cancel}
            className="w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center cursor-pointer transition"
            style={{
              background: `${THEME.mutedOlive}20`,
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
        <button onClick={onCancel} style={{ ...ghostBtn, flex: 1 }}>
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          style={{
            ...primaryBtn,
            flex: 1,
            background: danger ? '#dc2626' : THEME.warmBrass,
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
  const navBtn: React.CSSProperties = {
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
          style={navBtn}
        >
          <span className="inline-flex rtl:rotate-180">{Icons.chevronLeft}</span>
        </button>
        {Array.from({ length: pageCount }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1)
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
                    : { ...navBtn, border: `1px solid ${THEME.mutedOlive}30` }
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
          style={navBtn}
        >
          <span className="inline-flex rtl:rotate-180">
            {Icons.chevronRight}
          </span>
        </button>
      </div>
    </div>
  );
}

// ============================================================
// STOCK BADGE
// ============================================================
function StockBadge({
  status,
  tr,
}: {
  status: StockStatus;
  tr: Translations;
}): React.JSX.Element {
  const style: React.CSSProperties =
    status === 'In Stock'
      ? { background: '#dcfce7', color: '#15803d' }
      : status === 'Low Stock'
        ? {
            background: `${THEME.warmBrass}30`,
            color: THEME.charcoal,
            border: `1px solid ${THEME.warmBrass}`,
          }
        : { background: THEME.charcoal, color: THEME.warmIvory };

  return (
    <span
      className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={style}
    >
      {stockStatusLabel(status, tr)}
    </span>
  );
}

// ============================================================
// NEW CATEGORY MODAL
// ============================================================
function NewCategoryModal({
  onClose,
  onSaved,
  tr,
  existingNames,
}: {
  onClose: () => void;
  onSaved: (c: Category) => void;
  tr: Translations;
  existingNames: string[];
}): React.JSX.Element {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (): Promise<void> => {
    const clean = name.trim();
    if (!clean) return setError(tr.errCategoryName);
    const exists = existingNames.some(
      (n) => n.toLowerCase() === clean.toLowerCase()
    );
    if (exists) return setError(tr.errCategoryExists);

    setSaving(true);
    try {
      // saved to SQLite instantly (works offline) and queued for Supabase
      const newCat = await productService.createCategory(clean);
      onSaved(newCat as Category);
    } catch {
      setError(tr.errStorage);
      setSaving(false);
    }
  };

  const req = <span style={{ color: THEME.warmBrass }}>*</span>;
  const lbl = { color: THEME.deepForest };

  return (
    <Modal
      title={tr.newCategoryTitle}
      subtitle={tr.newCategorySubtitle}
      onClose={onClose}
      maxWidth="max-w-sm"
      z="z-[60]"
    >
      <div className="space-y-3">
        <div>
          <label className={labelCls} style={lbl}>
            {tr.categoryName} {req}
          </label>
          <input
            autoFocus
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder={tr.categoryNamePh}
            className={inputCls}
            style={{
              ...INPUT_STYLE,
              borderColor: error ? THEME.warmBrass : `${THEME.mutedOlive}40`,
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void submit();
            }}
          />
        </div>

        {error && (
          <div
            className="p-2.5 rounded-xl text-[11px] font-bold flex items-center gap-2"
            style={{
              background: `${THEME.charcoal}10`,
              border: `2px solid ${THEME.charcoal}40`,
              color: THEME.charcoal,
            }}
          >
            {Icons.alert}
            <span>{error}</span>
          </div>
        )}

        <div
          className="flex gap-2.5 pt-3"
          style={{ borderTop: `1px solid ${THEME.mutedOlive}30` }}
        >
          <button
            onClick={() => void submit()}
            disabled={saving}
            style={{
              ...brassBtn,
              opacity: saving ? 0.4 : 1,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {Icons.check}
            <span>{tr.saveCategory}</span>
          </button>
          <button onClick={onClose} style={ghostBtn}>
            {tr.cancel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================
// PRODUCT FORM MODAL (Add + Edit combined) — with costPrice
// ============================================================
function ProductFormModal({
  product,
  products,
  categories,
  onCategoryCreated,
  onClose,
  onSaved,
  tr,
}: {
  product?: Product | null;
  products: Product[];
  categories: Category[];
  onCategoryCreated: (c: Category) => void;
  onClose: () => void;
  onSaved: (sku: string, isEdit: boolean) => void;
  tr: Translations;
}): React.JSX.Element {
  const isEdit = !!product;

  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product ? String(product.price) : '');
  const [costPrice, setCostPrice] = useState(
    product?.costPrice ? String(product.costPrice) : ''
  );
  const [stock, setStock] = useState(product ? String(product.stock) : '');
  const [lowStockLevel, setLowStockLevel] = useState(
    product ? String(product.lowStockLevel) : String(DEFAULT_LOW_STOCK)
  );
  // `product.images` already holds ALL images (loaded from SQLite before opening)
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [units] = useState<Unit[]>(() => loadUnits());
  const [unit, setUnit] = useState<string>(
    () => product?.unit || getDefaultUnit()?.id || loadUnits()[0]?.id || ''
  );

  const [nextSKU] = useState(() =>
    isEdit ? product!.sku : generateSKU(products)
  );

  const [categoryId, setCategoryId] = useState<string>(
    () => product?.categoryId || categories[0]?.id || ''
  );
  const [showNewCategory, setShowNewCategory] = useState(false);

  const handleFiles = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
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
      setImages((prev) => [...prev, ...processed].slice(0, MAX_IMAGES));
    } catch {
      setError(tr.errImageProcess);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const submit = async (): Promise<void> => {
    if (!name.trim()) return setError(tr.errProductName);
    if (!price || Number(price) <= 0) return setError(tr.errPrice);
    if (costPrice !== '' && Number(costPrice) < 0) {
      return setError(tr.errCostPrice);
    }
    if (stock === '' || !isWholeNumber(stock)) return setError(tr.errStock);
    if (!unit) return setError(tr.errUnit);
    if (images.length === 0) return setError(tr.errImages);
    if (!categoryId) {
      return setError(
        categories.length === 0 ? tr.noCategories : tr.errCategoryRequired
      );
    }

    const input: ProductInput = {
      sku: nextSKU,
      name: name.trim(),
      description: description.trim(),
      price: roundMoney(Number(price)),
      cost_price: costPrice !== '' ? roundMoney(Number(costPrice)) : 0,
      stock: Number(stock),
      low_stock_level: Number(lowStockLevel) || DEFAULT_LOW_STOCK,
      unit_id: unit,
      category_id: categoryId,
      // images are saved in SQLite + queued for Supabase together with the product.
      // (the service only re-queues them when they actually changed)
      images,
    };

    setSaving(true);
    setError('');
    try {
      if (isEdit && product) {
        await productService.updateProduct(product.id, input);
      } else {
        await productService.createProduct(input);
      }
      onSaved(input.sku, isEdit);
    } catch {
      setError(tr.errStorage);
      setSaving(false);
    }
  };

  const req = <span style={{ color: THEME.warmBrass }}>*</span>;
  const lbl = { color: THEME.deepForest };

  const profit =
    costPrice !== '' && Number(costPrice) >= 0 && Number(price) > 0
      ? roundMoney(Number(price) - Number(costPrice))
      : null;
  const profitPct =
    profit !== null && Number(price) > 0
      ? roundMoney((profit / Number(price)) * 100)
      : null;

  return (
    <>
      <Modal
        title={isEdit ? tr.editProduct : tr.addProductTitle}
        subtitle={
          isEdit
            ? tr.editProductSubtitle(product!.sku)
            : tr.addProductSubtitle(nextSKU)
        }
        onClose={onClose}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls} style={lbl}>
                {tr.productName} {req}
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
                style={INPUT_STYLE}
              />
            </div>
            <div>
              <label className={labelCls} style={lbl}>
                {tr.priceSar} {req}
              </label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1250"
                className={inputCls}
                style={INPUT_STYLE}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls} style={lbl}>
                {tr.costPrice}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="0.00"
                className={inputCls}
                style={INPUT_STYLE}
              />
              <p
                className="text-[9px] mt-1 px-1"
                style={{ color: THEME.mutedOlive }}
              >
                {tr.costPriceHint}
              </p>
            </div>
            <div>
              <label className={labelCls} style={lbl}>
                {tr.profitLabel}
              </label>
              <div
                className={`${inputCls} flex items-center font-bold`}
                style={{
                  background: SOFT_BG,
                  borderColor: `${THEME.mutedOlive}40`,
                  color:
                    profit === null
                      ? THEME.mutedOlive
                      : profit >= 0
                        ? '#15803d'
                        : '#b91c1c',
                  cursor: 'default',
                }}
              >
                {profit === null ? (
                  '—'
                ) : (
                  <>
                    {formatMoney(profit)}
                    {profitPct !== null && (
                      <span className="text-[10px] ms-1 opacity-70">
                        ({profitPct}%)
                      </span>
                    )}
                  </>
                )}
              </div>
              <p
                className="text-[9px] mt-1 px-1"
                style={{ color: THEME.mutedOlive }}
              >
                {tr.profitHint}
              </p>
            </div>
          </div>

          <div>
            <label className={labelCls} style={lbl}>
              {tr.category} {req}
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={`${inputCls} cursor-pointer`}
                  style={INPUT_STYLE}
                >
                  {categories.length === 0 ? (
                    <option value="">{FALLBACK_CATEGORY}</option>
                  ) : (
                    categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setShowNewCategory(true)}
                className="h-9 px-3 rounded-full text-[11px] font-bold cursor-pointer flex items-center gap-1 flex-shrink-0"
                style={{
                  background: THEME.warmBrass,
                  color: THEME.warmIvory,
                  boxShadow: '0 4px 12px rgba(196,154,90,0.35)',
                  border: 'none',
                }}
              >
                {Icons.plus}
                <span>{tr.addCategory}</span>
              </button>
            </div>
            {categories.length === 0 && (
              <p
                className="text-[10px] mt-1 px-1"
                style={{ color: THEME.mutedOlive }}
              >
                {tr.noCategories}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls} style={lbl}>
                {tr.stock} {req}
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="10"
                className={inputCls}
                style={INPUT_STYLE}
              />
            </div>
            <div>
              <label className={labelCls} style={lbl}>
                {tr.lowStockAlert}
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={lowStockLevel}
                onChange={(e) => setLowStockLevel(e.target.value)}
                className={inputCls}
                style={INPUT_STYLE}
              />
            </div>
            <div>
              <label className={labelCls} style={lbl}>
                {tr.measuringUnit} {req}
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className={`${inputCls} cursor-pointer`}
                style={INPUT_STYLE}
              >
                {units.length === 0 ? (
                  <option value="">Piece</option>
                ) : (
                  units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.label}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls} style={lbl}>
              {tr.description}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder={tr.descriptionPh}
              className={textareaCls}
              style={INPUT_STYLE}
            />
          </div>

          <div>
            <label className={labelCls} style={lbl}>
              {tr.images} ({images.length}/{MAX_IMAGES}) {req}
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square overflow-hidden rounded-xl"
                  style={{ border: CARD_BORDER }}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() =>
                      setImages((p) => p.filter((_, i) => i !== idx))
                    }
                    className="absolute top-1 end-1 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer"
                    style={{
                      background: THEME.charcoal,
                      color: THEME.warmIvory,
                    }}
                  >
                    {Icons.x}
                  </button>
                  {idx === 0 && (
                    <span
                      className="absolute bottom-1 start-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: THEME.deepForest,
                        color: THEME.warmIvory,
                      }}
                    >
                      {tr.thumbnail}
                    </span>
                  )}
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <label
                  className="aspect-square flex flex-col items-center justify-center cursor-pointer rounded-xl"
                  style={{ border: `2px dashed ${THEME.mutedOlive}50` }}
                >
                  <span style={{ color: THEME.mutedOlive }}>
                    {uploading ? Icons.clock : Icons.upload}
                  </span>
                  <span
                    className="text-[8px] mt-0.5 font-bold"
                    style={{ color: THEME.mutedOlive }}
                  >
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
            <p
              className="text-[10px] mt-1 px-1"
              style={{ color: THEME.mutedOlive }}
            >
              {tr.imagesHint(MAX_IMAGES)}
            </p>
          </div>

          {error && (
            <div
              className="p-2.5 rounded-xl text-[11px] font-bold flex items-center gap-2"
              style={{
                background: `${THEME.charcoal}10`,
                border: `2px solid ${THEME.charcoal}40`,
                color: THEME.charcoal,
              }}
            >
              {Icons.alert}
              <span>{error}</span>
            </div>
          )}

          <div
            className="flex gap-2.5 pt-3"
            style={{ borderTop: `1px solid ${THEME.mutedOlive}30` }}
          >
            <button
              onClick={() => void submit()}
              disabled={uploading || saving}
              style={{
                ...brassBtn,
                opacity: uploading || saving ? 0.4 : 1,
                cursor: uploading || saving ? 'not-allowed' : 'pointer',
              }}
            >
              {Icons.check}
              <span>{isEdit ? tr.updateProduct : tr.saveProduct}</span>
            </button>
            <button onClick={onClose} style={ghostBtn}>
              {tr.cancel}
            </button>
          </div>
        </div>
      </Modal>

      {showNewCategory && (
        <NewCategoryModal
          tr={tr}
          existingNames={categories.map((c) => c.name)}
          onClose={() => setShowNewCategory(false)}
          onSaved={(newCat) => {
            onCategoryCreated(newCat);
            setCategoryId(newCat.id);
            setShowNewCategory(false);
          }}
        />
      )}
    </>
  );
}

// ============================================================
// PRODUCT PREVIEW MODAL
// ============================================================
function ProductPreviewModal({
  product,
  onClose,
  tr,
}: {
  product: Product;
  onClose: () => void;
  tr: Translations;
}): React.JSX.Element {
  const [activeImg, setActiveImg] = useState(0);
  const status = getStockStatus(product);
  const stockColor =
    product.stock !== 0 && product.stock <= product.lowStockLevel
      ? THEME.warmBrass
      : THEME.charcoal;

  const profit =
    typeof product.costPrice === 'number' && product.costPrice >= 0
      ? roundMoney(product.price - product.costPrice)
      : null;
  const profitPct =
    profit !== null && product.price > 0
      ? roundMoney((profit / product.price) * 100)
      : null;

  return (
    <Modal
      title={tr.previewTitle}
      subtitle={product.sku}
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
        <div>
          <div
            className="aspect-square overflow-hidden flex items-center justify-center rounded-xl"
            style={CARD_STYLE}
          >
            {product.images[activeImg] ? (
              <img
                src={product.images[activeImg]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span style={{ color: `${THEME.mutedOlive}66` }}>
                {Icons.image}
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-1.5 mt-2 overflow-x-auto">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImg(idx)}
                  className="w-10 h-10 overflow-hidden flex-shrink-0 cursor-pointer rounded-lg"
                  style={{
                    border: `2px solid ${
                      activeImg === idx
                        ? THEME.deepForest
                        : `${THEME.mutedOlive}40`
                    }`,
                  }}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2.5">
          <div>
            <p
              className="text-[11px] font-mono font-bold"
              dir="ltr"
              style={{ color: THEME.mutedOlive, textAlign: 'start' }}
            >
              {product.sku}
            </p>
            <p
              className="text-base font-bold"
              style={{ color: THEME.charcoal }}
            >
              {product.name}
            </p>
          </div>
          {product.description && (
            <PreviewField label={tr.descriptionLabel}>
              <p className="text-[12px]" style={{ color: THEME.charcoal }}>
                {product.description}
              </p>
            </PreviewField>
          )}
          <div
            className="grid grid-cols-3 gap-3 rounded-xl p-2.5"
            style={{ background: SOFT_BG }}
          >
            <PreviewField label={tr.priceLabel}>
              <p
                className="text-[13px] font-bold"
                style={{ color: THEME.warmBrass }}
              >
                {formatMoney(product.price)}
              </p>
            </PreviewField>
            <PreviewField label={tr.stockLabel}>
              <p
                className="text-[13px] font-bold"
                style={{ color: stockColor }}
              >
                {product.stock} {unitLabel(product.unit)}
              </p>
            </PreviewField>
            <PreviewField label={tr.unitLabel}>
              <p
                className="text-[13px] font-bold"
                style={{ color: THEME.charcoal }}
              >
                {unitLabel(product.unit)}
              </p>
            </PreviewField>
          </div>

          {typeof product.costPrice === 'number' && product.costPrice > 0 && (
            <div
              className="grid grid-cols-3 gap-3 rounded-xl p-2.5"
              style={{ background: SOFT_BG }}
            >
              <PreviewField label={tr.costPrice}>
                <p
                  className="text-[13px] font-bold"
                  style={{ color: THEME.charcoal }}
                >
                  {formatMoney(product.costPrice)}
                </p>
              </PreviewField>
              <PreviewField label={tr.profitLabel}>
                <p
                  className="text-[13px] font-bold"
                  style={{
                    color:
                      profit !== null && profit >= 0 ? '#15803d' : '#b91c1c',
                  }}
                >
                  {profit !== null ? formatMoney(profit) : '—'}
                </p>
              </PreviewField>
              <PreviewField label="%">
                <p
                  className="text-[13px] font-bold"
                  style={{
                    color:
                      profit !== null && profit >= 0 ? '#15803d' : '#b91c1c',
                  }}
                >
                  {profitPct !== null ? `${profitPct}%` : '—'}
                </p>
              </PreviewField>
            </div>
          )}

          <PreviewField label={tr.categoryLabel}>
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full"
              style={{ background: SOFT_BG, color: THEME.deepForest }}
            >
              {Icons.tag}
              <span>{product.category || FALLBACK_CATEGORY}</span>
            </span>
          </PreviewField>
          <PreviewField label={tr.statusLabel}>
            <StockBadge status={status} tr={tr} />
          </PreviewField>
          <div
            className="grid grid-cols-2 gap-3 pt-2"
            style={{ borderTop: `1px solid ${THEME.mutedOlive}30` }}
          >
            <PreviewField label={tr.createdLabel}>
              <p className="text-[11px]" style={{ color: THEME.charcoal }}>
                {formatDate(product.createdAt)}
              </p>
            </PreviewField>
            <PreviewField label={tr.updatedLabel}>
              <p className="text-[11px]" style={{ color: THEME.charcoal }}>
                {formatDate(product.updatedAt)}
              </p>
            </PreviewField>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function ProductsPage(): React.JSX.Element {
  const [language, setLanguage] = useState<Language>(() => getStoredLanguage());
  useEffect(() => {
    const sync = (): void => setLanguage(getStoredLanguage());
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.getAttribute('lang');
    root.setAttribute('lang', language);
    return () => {
      if (prev) root.setAttribute('lang', prev);
    };
  }, [language]);

  const tr = t[language] as Translations;
  const isRTL = isRTLLang(language);

  // event listeners (registered once) must always see the CURRENT language
  const trRef = useRef(tr);
  useEffect(() => {
    trRef.current = tr;
  });

  // First paint: use the in-memory snapshot (instant on re-mount), else empty
  const [products, setProducts] = useState<Product[]>(() => {
    const snap = productService.getCachedSnapshot();
    return snap
      ? snap.products.map((p) =>
          toUiProduct(p, snap.categories, snap.thumbnails)
        )
      : [];
  });
  const [categories, setCategories] = useState<Category[]>(
    () => productService.getCachedSnapshot()?.categories ?? []
  );

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | StockStatus>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL_CATEGORIES);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('date');
  const [page, setPage] = useState(1);

  const showSuccess = (msg: string): void => {
    setSuccessMsg(msg);
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const showError = (msg: string, ms = 3500): void => {
    setErrorMsg(msg);
    setSuccessMsg('');
    setTimeout(() => setErrorMsg(''), ms);
  };

  /** Re-reads everything from local SQLite (instant, works offline). */
  const refresh = async (): Promise<void> => {
    try {
      const [dbProducts, cats, thumbs] = await Promise.all([
        productService.getProducts(),
        productService.getCategories(),
        productService.getThumbnails(),
      ]);
      setCategories(cats);
      setProducts(dbProducts.map((p) => toUiProduct(p, cats, thumbs)));
      window.dispatchEvent(new Event('zakhira:inventory-updated'));
    } catch (e) {
      showError(e instanceof Error ? e.message : trRef.current.errStorage);
    }
  };

  /**
   * One-time move of images from the old localStorage store into SQLite
   * (they then sync to Supabase automatically). Products that are not in
   * SQLite yet are skipped and retried on the next sync event / page visit.
   */
  const migratingRef = useRef(false);
  const migrateLegacyImages = async (): Promise<void> => {
    if (migratingRef.current) return;
    const map = readLegacyImageMap();
    if (Object.keys(map).length === 0) return;
    migratingRef.current = true;
    try {
      const done = await productService.importLegacyImages(map);
      if (done.length > 0) {
        dropLegacyImages(done);
        await refresh();
      }
    } catch {
      /* retried next time */
    } finally {
      migratingRef.current = false;
    }
  };

  useEffect(() => {
    void refresh().then(() => migrateLegacyImages());
    productService.startSyncWorker();

    // Background sync changed local data → re-read SQLite
    const onSynced = (): void => {
      void refresh().then(() => migrateLegacyImages());
    };

    // Real (non-offline) sync problem
    const onSyncError = (e: Event): void => {
      const d = (e as CustomEvent).detail as
        | {
            message?: string;
            details?: string;
            code?: string;
            name?: string;
            sku?: string;
          }
        | undefined;
      const cur = trRef.current;
      // 23503 + product info = a DELETE blocked because of order history
      if (d?.code === '23503' && (d.name || d.sku)) {
        showError(cur.toastHasHistory(d.name || d.sku || ''), 5000);
        return;
      }
      showError(`${cur.syncFailed}: ${d?.message ?? ''}`, 6000);
    };

    window.addEventListener(PRODUCTS_SYNCED_EVENT, onSynced);
    window.addEventListener(PRODUCTS_SYNC_ERROR_EVENT, onSyncError);
    return () => {
      window.removeEventListener(PRODUCTS_SYNCED_EVENT, onSynced);
      window.removeEventListener(PRODUCTS_SYNC_ERROR_EVENT, onSyncError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const outOfStockProducts = products.filter((p) => p.stock === 0);

  // All category names available for the filter dropdown:
  // saved categories + any category already used by a product.
  const categoryOptions = useMemo(() => {
    const names = new Set<string>();
    categories.forEach((c) => {
      if (c.name) names.add(c.name);
    });
    products.forEach((p) => names.add(p.category || FALLBACK_CATEGORY));
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [categories, products]);

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      const c = p.category || FALLBACK_CATEGORY;
      map[c] = (map[c] || 0) + 1;
    });
    return map;
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') {
      list = list.filter((p) => getStockStatus(p) === statusFilter);
    }
    if (categoryFilter !== ALL_CATEGORIES) {
      list = list.filter(
        (p) => (p.category || FALLBACK_CATEGORY) === categoryFilter
      );
    }
    const min = priceMin === '' ? -Infinity : Number(priceMin);
    const max = priceMax === '' ? Infinity : Number(priceMax);
    list = list.filter((p) => p.price >= min && p.price <= max);
    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'stock') return a.stock - b.stock;
      if (sortBy === 'category') {
        const byCat = (a.category || FALLBACK_CATEGORY).localeCompare(
          b.category || FALLBACK_CATEGORY
        );
        return byCat !== 0 ? byCat : a.name.localeCompare(b.name);
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
    return list;
  }, [
    products,
    search,
    statusFilter,
    categoryFilter,
    priceMin,
    priceMax,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const clearFilters = (): void => {
    setSearch('');
    setStatusFilter('All');
    setCategoryFilter(ALL_CATEGORIES);
    setPriceMin('');
    setPriceMax('');
    setSortBy('date');
    setPage(1);
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    statusFilter !== 'All' ||
    categoryFilter !== ALL_CATEGORIES ||
    priceMin !== '' ||
    priceMax !== '' ||
    sortBy !== 'date';

  const handleSaved = async (sku: string, isEdit: boolean): Promise<void> => {
    await refresh();
    setShowAddProduct(false);
    setEditingProduct(null);
    showSuccess(isEdit ? tr.toastUpdated(sku) : tr.toastCreated(sku));
  };

  /** The list only holds thumbnails → load ALL images from SQLite first. */
  const withAllImages = async (p: Product): Promise<Product> => {
    try {
      const imgs = await productService.getProductImages(p.id);
      return { ...p, images: imgs.length > 0 ? imgs : p.images };
    } catch {
      return p;
    }
  };

  const handleEdit = async (p: Product): Promise<void> => {
    setEditingProduct(await withAllImages(p));
    setShowAddProduct(true);
  };

  const handlePreview = async (p: Product): Promise<void> => {
    setPreviewProduct(await withAllImages(p));
  };

  const handleDelete = async (p: Product): Promise<void> => {
    try {
      // removed from SQLite instantly; the DELETE is queued for Supabase.
      // If Supabase refuses (order history) the sync error event tells the user
      // and the product is restored by the next pull.
      await productService.deleteProduct(p.id);
      await refresh();
      showSuccess(tr.toastDeleted(p.sku));
    } catch {
      showError(tr.errDeleteStorage);
    } finally {
      setDeleteTarget(null);
    }
  };

  const lbl = { color: THEME.deepForest };

  return (
    <div
      className="min-h-screen p-4 lg:p-5"
      style={{ background: THEME.warmIvory }}
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={language}
    >
      <div className="mb-4">
        <h1 className="text-xl font-bold" style={{ color: THEME.deepForest }}>
          {tr.pageTitle}
        </h1>
        <p className="mt-1 text-[12px]" style={{ color: THEME.mutedOlive }}>
          {tr.pageSubtitle}
        </p>
      </div>

      {successMsg && (
        <div
          className="mb-3 px-3 py-2 rounded-full text-[11px] font-bold flex items-center gap-2"
          style={{
            background: `${THEME.deepForest}14`,
            border: `2px solid ${THEME.deepForest}50`,
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
            background: `${THEME.charcoal}10`,
            border: `2px solid ${THEME.charcoal}50`,
            color: THEME.charcoal,
          }}
        >
          {Icons.alert}
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="mb-4">
        <InventoryStats />
      </div>

      {outOfStockProducts.length > 0 && (
        <div
          className="rounded-2xl p-3 mb-4"
          style={{
            background: `${THEME.warmBrass}1A`,
            border: `2px solid ${THEME.warmBrass}60`,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: THEME.warmBrass }}>{Icons.alert}</span>
            <h2
              className="text-[13px] font-bold"
              style={{ color: THEME.charcoal }}
            >
              {tr.outOfStockTitle(outOfStockProducts.length)}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {outOfStockProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl"
                style={CARD_STYLE}
              >
                <div className="min-w-0 flex-1">
                  <p
                    className="text-[12px] font-semibold truncate"
                    style={{ color: THEME.charcoal }}
                  >
                    {p.name}
                  </p>
                  <p
                    className="text-[9px] font-mono"
                    dir="ltr"
                    style={{
                      color: THEME.mutedOlive,
                      textAlign: 'start',
                    }}
                  >
                    {p.sku} · {unitLabel(p.unit)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowAddProduct(true);
          }}
          style={primaryBtn}
        >
          {Icons.plus}
          <span>{tr.addProduct}</span>
        </button>
      </div>

      <div className="rounded-2xl p-3.5 mb-4" style={CARD_STYLE}>
        <div className="flex items-center gap-2 mb-3">
          <span style={{ color: THEME.mutedOlive }}>{Icons.sliders}</span>
          <h3
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: THEME.deepForest }}
          >
            {tr.filters}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-2">
            <label className={labelCls} style={lbl}>
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
                style={{ ...INPUT_STYLE, paddingInlineStart: 36 }}
              />
            </div>
          </div>

          <div>
            <label className={labelCls} style={lbl}>
              {tr.category}
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className={`${inputCls} cursor-pointer`}
              style={INPUT_STYLE}
            >
              <option value={ALL_CATEGORIES}>{tr.allCategories}</option>
              {categoryOptions.map((name) => (
                <option key={name} value={name}>
                  {name} ({categoryCounts[name] || 0})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls} style={lbl}>
              {tr.stockStatus}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as typeof statusFilter);
                setPage(1);
              }}
              className={`${inputCls} cursor-pointer`}
              style={INPUT_STYLE}
            >
              <option value="All">{tr.all}</option>
              <option value="In Stock">{tr.inStock}</option>
              <option value="Low Stock">{tr.lowStock}</option>
              <option value="Out of Stock">{tr.outOfStock}</option>
            </select>
          </div>

          <div>
            <label className={labelCls} style={lbl}>
              {tr.priceRange}
            </label>
            <div className="flex gap-1.5">
              <input
                type="number"
                value={priceMin}
                onChange={(e) => {
                  setPriceMin(e.target.value);
                  setPage(1);
                }}
                placeholder={tr.min}
                className={inputCls}
                style={INPUT_STYLE}
              />
              <input
                type="number"
                value={priceMax}
                onChange={(e) => {
                  setPriceMax(e.target.value);
                  setPage(1);
                }}
                placeholder={tr.max}
                className={inputCls}
                style={INPUT_STYLE}
              />
            </div>
          </div>

          <div>
            <label className={labelCls} style={lbl}>
              {tr.sortBy}
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as SortKey);
                setPage(1);
              }}
              className={`${inputCls} cursor-pointer`}
              style={INPUT_STYLE}
            >
              <option value="date">{tr.sortDate}</option>
              <option value="name">{tr.sortName}</option>
              <option value="category">{tr.sortCategory}</option>
              <option value="price">{tr.sortPrice}</option>
              <option value="stock">{tr.sortStock}</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div
            className="flex justify-end mt-3 pt-3"
            style={{ borderTop: `1px solid ${THEME.mutedOlive}30` }}
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

      <div className="rounded-2xl overflow-hidden" style={CARD_STYLE}>
        <div
          className="px-4 py-2.5"
          style={{
            background: SOFT_BG,
            borderBottom: `1px solid ${THEME.mutedOlive}30`,
          }}
        >
          <h2
            className="text-[13px] font-bold"
            style={{ color: THEME.deepForest }}
          >
            {tr.products}{' '}
            <span className="text-[11px] font-normal">({filtered.length})</span>
          </h2>
        </div>

        {paginated.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr
                    style={{
                      background: SOFT_BG,
                      borderBottom: `1px solid ${THEME.mutedOlive}30`,
                    }}
                  >
                    <Th label={tr.colImage} w="w-14" />
                    <Th label={tr.colSku} w="w-24" />
                    <Th label={tr.colName} />
                    <Th label={tr.colStock} align="center" w="w-24" />
                    <Th label={tr.colPrice} align="end" w="w-24" />
                    <Th label={tr.colActions} align="center" w="w-28" />
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((p) => {
                    const status = getStockStatus(p);
                    const isLowOrOut = status !== 'In Stock';
                    return (
                      <tr
                        key={p.id}
                        className="transition-colors"
                        style={{
                          background: ROW_BG,
                          borderBottom: `1px solid ${ROW_BORDER}`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = ROW_BG_HOVER;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = ROW_BG;
                        }}
                      >
                        <td className="px-3 py-2">
                          <div
                            className="w-9 h-9 flex items-center justify-center overflow-hidden rounded-lg"
                            style={CARD_STYLE}
                          >
                            {p.images[0] ? (
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span style={{ color: `${THEME.mutedOlive}66` }}>
                                {Icons.image}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-3 py-2">
                          <p
                            className="text-[11px] font-mono font-bold"
                            dir="ltr"
                            style={{
                              color: THEME.charcoal,
                              textAlign: isRTL ? 'right' : 'left',
                            }}
                          >
                            {p.sku}
                          </p>
                        </td>

                        <td className="px-3 py-2">
                          <p
                            className="text-[12px] font-semibold truncate max-w-[200px]"
                            style={{ color: THEME.charcoal }}
                          >
                            {p.name}
                          </p>
                          {p.category && (
                            <span
                              className="inline-flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full mt-0.5"
                              style={{
                                background: SOFT_BG,
                                color: THEME.deepForest,
                              }}
                            >
                              {Icons.tag}
                              <span>{p.category}</span>
                            </span>
                          )}
                          {p.description && (
                            <p
                              className="text-[9px] truncate max-w-[200px] mt-0.5"
                              style={{ color: THEME.mutedOlive }}
                            >
                              {p.description}
                            </p>
                          )}
                          {isLowOrOut && (
                            <div className="mt-0.5">
                              <StockBadge status={status} tr={tr} />
                            </div>
                          )}
                        </td>

                        <td className="px-3 py-2 text-center">
                          <span
                            className="text-[12px] font-bold"
                            style={{
                              color:
                                p.stock !== 0 && p.stock <= p.lowStockLevel
                                  ? THEME.warmBrass
                                  : THEME.charcoal,
                            }}
                          >
                            {p.stock} {unitLabel(p.unit)}
                          </span>
                          <p
                            className="text-[9px] mt-0.5"
                            style={{ color: THEME.mutedOlive }}
                          >
                            {tr.low}: {p.lowStockLevel}
                          </p>
                        </td>

                        <td
                          className="px-3 py-2 text-end text-[12px] font-bold whitespace-nowrap"
                          style={{ color: THEME.charcoal }}
                        >
                          {formatMoney(p.price)}
                        </td>

                        <td className="px-3 py-2">
                          <div className="flex flex-nowrap items-center justify-center gap-1">
                            {[
                              {
                                label: tr.actPreview,
                                icon: Icons.eye,
                                tone: ACTION.default,
                                run: () => void handlePreview(p),
                              },
                              {
                                label: tr.actEdit,
                                icon: Icons.edit,
                                tone: ACTION.warn,
                                run: () => void handleEdit(p),
                              },
                              {
                                label: tr.actDelete,
                                icon: Icons.trash,
                                tone: ACTION.danger,
                                run: () => setDeleteTarget(p),
                              },
                            ].map((a) => (
                              <button
                                key={a.label}
                                type="button"
                                title={a.label}
                                aria-label={`${a.label} ${p.sku}`}
                                onClick={a.run}
                                className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition hover:brightness-95 hover:shadow-sm"
                                style={a.tone}
                              >
                                {a.icon}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
              {tr.noProducts}
            </p>
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowAddProduct(true);
              }}
              className="mt-2 text-[11px] font-bold cursor-pointer hover:underline"
              style={{ color: THEME.warmBrass }}
            >
              {tr.addFirst}
            </button>
          </div>
        )}
      </div>

      {showAddProduct && (
        <ProductFormModal
          product={editingProduct}
          products={products}
          categories={categories}
          onCategoryCreated={(c) =>
            setCategories((prev) =>
              [...prev.filter((x) => x.id !== c.id), c].sort((a, b) =>
                a.name.localeCompare(b.name)
              )
            )
          }
          onClose={() => {
            setShowAddProduct(false);
            setEditingProduct(null);
          }}
          onSaved={(sku, isEdit) => void handleSaved(sku, isEdit)}
          tr={tr}
        />
      )}

      {previewProduct && (
        <ProductPreviewModal
          product={previewProduct}
          onClose={() => setPreviewProduct(null)}
          tr={tr}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title={tr.deleteTitle}
          message={tr.deleteMsg(deleteTarget.name, deleteTarget.sku)}
          confirmLabel={tr.deleteConfirm}
          cancelLabel={tr.cancel}
          danger
          onConfirm={() => void handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* 4 CHARTS — independent, zero props */}
      <InventoryCharts />
    </div>
  );
}