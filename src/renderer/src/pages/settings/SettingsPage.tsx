/* eslint-disable prettier/prettier */
/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useMemo } from 'react';
import {
  DEFAULT_SALES_FORM_FIELDS,
  loadSalesFormFields,
  saveSalesFormFields,
  SalesFormField,
  SalesFormFieldId,
} from '../sales/salesFormFields';

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
export type Lang = 'en' | 'ar' | 'ur' | 'hi';

// ============================================================
// 🌍 TRANSLATIONS (EN, AR, UR, HI)
// ============================================================
const t = {
  en: {
    settingsTitle: 'Settings',
    settingsSubtitle: 'Language, Units, Sales Form, Print and help preferences',
    saved: 'Saved',
    tabLanguage: 'Language',
    tabUnits: 'Units',
    tabSalesForm: 'Sales Form',
    tabPrint: 'Print',
    tabHelp: 'Help',
    // Language tab
    chooseLanguage: 'Choose Your Language',
    chooseLanguageHint: 'Entire interface will change',
    selected: 'Selected',
    // Units tab
    measuringUnits: 'Measuring Units',
    measuringUnitsHint: 'Default unit and units list',
    reset: 'Reset',
    defaultUnit: 'Default Unit',
    defaultUnitHint: (label: string) => `New products will open with "${label}" pre-selected`,
    addNewUnit: 'Add New Unit',
    editUnit: 'Edit Unit',
    nameInternal: 'Name (internal)',
    labelDisplay: 'Label (display)',
    save: 'Save',
    cancel: 'Cancel',
    unitsList: 'Units List',
    addUnit: 'Add Unit',
    defaultBadge: 'DEFAULT',
    errUnitRequired: 'Unit name is required',
    errUnitDuplicate: 'A unit with this name already exists',
    errUnitMin: 'At least one unit is required',
    edit: 'Edit',
    delete: 'Delete',
    // Sales Form tab
    salesFormFields: 'Sales Form Fields',
    salesFormHint: 'Changes save automatically.',
    addField: 'Add Field',
    englishLabel: 'English',
    urduLabel: 'Urdu',
    remove: 'Remove',
    noSalesFields: 'All Sales fields have been removed.',
    noSalesFieldsHint: 'Add a new field or restore the defaults.',
    newFieldLabel: 'New Field',
    newFieldLabelUr: 'نیا فیلڈ',
    // Print tab
    printSettings: 'Print Settings',
    printSettingsHint: 'Default print format for invoices',
    defaultFormat: 'Default Format',
    defaultFormatHint: 'New print jobs will open with this format',
    availableFormats: 'Available Formats',
    printInfo: 'The last-used format is remembered automatically. This default is only used when no previous format has been saved.',
    // Help tab
    needHelp: 'Need help?',
    needHelpHint: "Our team is here to help. Reach us on WhatsApp or Email — we'll respond as soon as possible.",
    contactWhatsApp: 'Contact on WhatsApp',
    contactWhatsAppHint: 'Send a message for instant response',
    sendEmail: 'Send an Email',
    sendEmailHint: 'Describe your issue in detail',
    companyInfo: 'Company Information',
    companyInfoHint: 'Reach out to us',
    company: 'Company',
    availability: 'Availability',
    availabilityValue: 'Mon – Sat · 9am – 6pm',
    forFasterHelp: 'For Faster Help',
    helpTip1: '• Describe your issue clearly',
    helpTip2: '• Include a screenshot or error message',
    helpTip3: '• Mention your company name and phone',
  },
  ar: {
    settingsTitle: 'ترتیبات',
    settingsSubtitle: 'زبان، یونٹس، سیلز فارم، پرنٹ اور مدد کی ترجیحات',
    saved: 'محفوظ',
    tabLanguage: 'زبان',
    tabUnits: 'یونٹس',
    tabSalesForm: 'سیلز فارم',
    tabPrint: 'پرنٹ',
    tabHelp: 'مدد',
    chooseLanguage: 'اپنی زبان منتخب کریں',
    chooseLanguageHint: 'پورا انٹرفیس تبدیل ہو جائے گا',
    selected: 'منتخب',
    measuringUnits: 'پیمائش کے یونٹس',
    measuringUnitsHint: 'ڈیفالٹ یونٹ اور یونٹس کی فہرست',
    reset: 'ڈیفالٹ',
    defaultUnit: 'ڈیفالٹ یونٹ',
    defaultUnitHint: (label: string) => `نئی پروڈکٹ میں "${label}" پہلے سے منتخب ہوگا`,
    addNewUnit: 'نیا یونٹ',
    editUnit: 'یونٹ میں ترمیم',
    nameInternal: 'نام (اندرونی)',
    labelDisplay: 'لیبل (دکھانے کے لیے)',
    save: 'محفوظ کریں',
    cancel: 'منسوخ',
    unitsList: 'یونٹس کی فہرست',
    addUnit: 'نیا یونٹ',
    defaultBadge: 'ڈیفالٹ',
    errUnitRequired: 'یونٹ کا نام درکار ہے',
    errUnitDuplicate: 'اس نام کا یونٹ پہلے سے موجود ہے',
    errUnitMin: 'کم از کم ایک یونٹ درکار ہے',
    edit: 'ترمیم',
    delete: 'حذف',
    salesFormFields: 'سیلز فارم کے فیلڈز',
    salesFormHint: 'تبدیلیاں خودکار محفوظ ہوتی ہیں۔',
    addField: 'نیا فیلڈ',
    englishLabel: 'انگریزی',
    urduLabel: 'اردو',
    remove: 'حذف',
    noSalesFields: 'تمام فیلڈز ہٹا دیے گئے ہیں',
    noSalesFieldsHint: 'نیا فیلڈ شامل کریں یا ڈیفالٹ بحال کریں۔',
    newFieldLabel: 'New Field',
    newFieldLabelUr: 'نیا فیلڈ',
    printSettings: 'پرنٹ کی ترتیبات',
    printSettingsHint: 'انوائسز کے لیے ڈیفالٹ پرنٹ فارمیٹ',
    defaultFormat: 'ڈیفالٹ فارمیٹ',
    defaultFormatHint: 'نئے پرنٹ جاب اس فارمیٹ کے ساتھ کھلیں گے',
    availableFormats: 'دستیاب فارمیٹس',
    printInfo: 'آخری استعمال شدہ فارمیٹ خود بخود یاد رکھا جاتا ہے۔ یہ ڈیفالٹ صرف اس وقت استعمال ہوگا جب کوئی پچھلا فارمیٹ محفوظ نہ ہو۔',
    needHelp: 'مدد چاہیے؟',
    needHelpHint: 'ہماری ٹیم آپ کی مدد کے لیے تیار ہے۔ WhatsApp یا Email سے رابطہ کریں۔',
    contactWhatsApp: 'WhatsApp پر رابطہ',
    contactWhatsAppHint: 'فوری جواب کے لیے پیغام بھیجیں',
    sendEmail: 'Email بھیجیں',
    sendEmailHint: 'تفصیلی مسئلہ ای میل کریں',
    companyInfo: 'کمپنی کی معلومات',
    companyInfoHint: 'ہم سے رابطہ',
    company: 'کمپنی',
    availability: 'دستیابی',
    availabilityValue: 'پیر – ہفتہ · 9–6',
    forFasterHelp: 'تیز مدد کے لیے',
    helpTip1: '• مسئلہ صاف الفاظ میں بتائیں',
    helpTip2: '• سکرین شاٹ یا error بھیجیں',
    helpTip3: '• کمپنی نام اور موبائل نمبر بتائیں',
  },
  ur: {
    settingsTitle: 'ترتیبات',
    settingsSubtitle: 'زبان، یونٹس، سیلز فارم، پرنٹ اور مدد کی ترجیحات',
    saved: 'محفوظ',
    tabLanguage: 'زبان',
    tabUnits: 'یونٹس',
    tabSalesForm: 'سیلز فارم',
    tabPrint: 'پرنٹ',
    tabHelp: 'مدد',
    chooseLanguage: 'اپنی زبان منتخب کریں',
    chooseLanguageHint: 'پورا انٹرفیس تبدیل ہو جائے گا',
    selected: 'منتخب',
    measuringUnits: 'پیمائش کے یونٹس',
    measuringUnitsHint: 'ڈیفالٹ یونٹ اور یونٹس کی فہرست',
    reset: 'ڈیفالٹ',
    defaultUnit: 'ڈیفالٹ یونٹ',
    defaultUnitHint: (label: string) => `نئی پروڈکٹ میں "${label}" پہلے سے منتخب ہوگا`,
    addNewUnit: 'نیا یونٹ',
    editUnit: 'یونٹ میں ترمیم',
    nameInternal: 'نام (اندرونی)',
    labelDisplay: 'لیبل (دکھانے کے لیے)',
    save: 'محفوظ کریں',
    cancel: 'منسوخ',
    unitsList: 'یونٹس کی فہرست',
    addUnit: 'نیا یونٹ',
    defaultBadge: 'ڈیفالٹ',
    errUnitRequired: 'یونٹ کا نام درکار ہے',
    errUnitDuplicate: 'اس نام کا یونٹ پہلے سے موجود ہے',
    errUnitMin: 'کم از کم ایک یونٹ درکار ہے',
    edit: 'ترمیم',
    delete: 'حذف',
    salesFormFields: 'سیلز فارم کے فیلڈز',
    salesFormHint: 'تبدیلیاں خودکار محفوظ ہوتی ہیں۔',
    addField: 'نیا فیلڈ',
    englishLabel: 'انگریزی',
    urduLabel: 'اردو',
    remove: 'حذف',
    noSalesFields: 'تمام فیلڈز ہٹا دیے گئے ہیں',
    noSalesFieldsHint: 'نیا فیلڈ شامل کریں یا ڈیفالٹ بحال کریں۔',
    newFieldLabel: 'New Field',
    newFieldLabelUr: 'نیا فیلڈ',
    printSettings: 'پرنٹ کی ترتیبات',
    printSettingsHint: 'انوائسز کے لیے ڈیفالٹ پرنٹ فارمیٹ',
    defaultFormat: 'ڈیفالٹ فارمیٹ',
    defaultFormatHint: 'نئے پرنٹ جاب اس فارمیٹ کے ساتھ کھلیں گے',
    availableFormats: 'دستیاب فارمیٹس',
    printInfo: 'آخری استعمال شدہ فارمیٹ خود بخود یاد رکھا جاتا ہے۔ یہ ڈیفالٹ صرف اس وقت استعمال ہوگا جب کوئی پچھلا فارمیٹ محفوظ نہ ہو۔',
    needHelp: 'مدد چاہیے؟',
    needHelpHint: 'ہماری ٹیم آپ کی مدد کے لیے تیار ہے۔ WhatsApp یا Email سے رابطہ کریں۔',
    contactWhatsApp: 'WhatsApp پر رابطہ',
    contactWhatsAppHint: 'فوری جواب کے لیے پیغام بھیجیں',
    sendEmail: 'Email بھیجیں',
    sendEmailHint: 'تفصیلی مسئلہ ای میل کریں',
    companyInfo: 'کمپنی کی معلومات',
    companyInfoHint: 'ہم سے رابطہ',
    company: 'کمپنی',
    availability: 'دستیابی',
    availabilityValue: 'پیر – ہفتہ · 9–6',
    forFasterHelp: 'تیز مدد کے لیے',
    helpTip1: '• مسئلہ صاف الفاظ میں بتائیں',
    helpTip2: '• سکرین شاٹ یا error بھیجیں',
    helpTip3: '• کمپنی نام اور موبائل نمبر بتائیں',
  },
  hi: {
    settingsTitle: 'सेटिंग्स',
    settingsSubtitle: 'भाषा, इकाइयाँ, बिक्री फ़ॉर्म, प्रिंट और सहायता प्राथमिकताएँ',
    saved: 'सहेजा गया',
    tabLanguage: 'भाषा',
    tabUnits: 'इकाइयाँ',
    tabSalesForm: 'बिक्री फ़ॉर्म',
    tabPrint: 'प्रिंट',
    tabHelp: 'सहायता',
    chooseLanguage: 'अपनी भाषा चुनें',
    chooseLanguageHint: 'पूरा इंटरफ़ेस बदल जाएगा',
    selected: 'चयनित',
    measuringUnits: 'मापने की इकाइयाँ',
    measuringUnitsHint: 'डिफ़ॉल्ट इकाई और इकाइयों की सूची',
    reset: 'रीसेट',
    defaultUnit: 'डिफ़ॉल्ट इकाई',
    defaultUnitHint: (label: string) => `नए उत्पाद "${label}" के साथ पहले से चयनित खुलेंगे`,
    addNewUnit: 'नई इकाई जोड़ें',
    editUnit: 'इकाई संपादित करें',
    nameInternal: 'नाम (आंतरिक)',
    labelDisplay: 'लेबल (प्रदर्शन)',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    unitsList: 'इकाइयों की सूची',
    addUnit: 'इकाई जोड़ें',
    defaultBadge: 'डिफ़ॉल्ट',
    errUnitRequired: 'इकाई का नाम आवश्यक है',
    errUnitDuplicate: 'इस नाम की इकाई पहले से मौजूद है',
    errUnitMin: 'कम से कम एक इकाई आवश्यक है',
    edit: 'संपादित करें',
    delete: 'हटाएँ',
    salesFormFields: 'बिक्री फ़ॉर्म फ़ील्ड',
    salesFormHint: 'परिवर्तन स्वचालित रूप से सहेजे जाते हैं।',
    addField: 'फ़ील्ड जोड़ें',
    englishLabel: 'अंग्रेज़ी',
    urduLabel: 'उर्दू',
    remove: 'हटाएँ',
    noSalesFields: 'सभी बिक्री फ़ील्ड हटा दिए गए हैं।',
    noSalesFieldsHint: 'नया फ़ील्ड जोड़ें या डिफ़ॉल्ट पुनर्स्थापित करें।',
    newFieldLabel: 'नया फ़ील्ड',
    newFieldLabelUr: 'نیا فیلڈ',
    printSettings: 'प्रिंट सेटिंग्स',
    printSettingsHint: 'इनवॉइस के लिए डिफ़ॉल्ट प्रिंट फ़ॉर्मेट',
    defaultFormat: 'डिफ़ॉल्ट फ़ॉर्मेट',
    defaultFormatHint: 'नए प्रिंट जॉब इस फ़ॉर्मेट के साथ खुलेंगे',
    availableFormats: 'उपलब्ध फ़ॉर्मेट',
    printInfo: 'अंतिम बार उपयोग किया गया फ़ॉर्मेट स्वचालित रूप से याद रखा जाता है। यह डिफ़ॉल्ट केवल तब उपयोग होगा जब कोई पिछला फ़ॉर्मेट सहेजा न गया हो।',
    needHelp: 'सहायता चाहिए?',
    needHelpHint: 'हमारी टीम आपकी सहायता के लिए तैयार है। WhatsApp या Email से संपर्क करें।',
    contactWhatsApp: 'WhatsApp पर संपर्क करें',
    contactWhatsAppHint: 'तत्काल प्रतिक्रिया के लिए संदेश भेजें',
    sendEmail: 'ईमेल भेजें',
    sendEmailHint: 'अपनी समस्या विस्तार से बताएँ',
    companyInfo: 'कंपनी की जानकारी',
    companyInfoHint: 'हमसे संपर्क करें',
    company: 'कंपनी',
    availability: 'उपलब्धता',
    availabilityValue: 'सोम – शनि · 9 – 6',
    forFasterHelp: 'तेज़ सहायता के लिए',
    helpTip1: '• अपनी समस्या स्पष्ट रूप से बताएँ',
    helpTip2: '• स्क्रीनशॉट या त्रुटि संदेश शामिल करें',
    helpTip3: '• अपनी कंपनी का नाम और फ़ोन बताएँ',
  },
} as const;

// ✅ Flexible type (accepts any language strings)
type Translations = {
  [K in keyof typeof t['en']]: typeof t['en'][K] extends (arg: infer A) => string
    ? (arg: A) => string
    : string;
};

// ============================================================
// 📏 MEASURING UNITS — DATA MODEL + STORAGE
// ============================================================
export type MeasuringUnit = {
  id: string;
  name: string;
  label: string;
};

export const UNIT_STORAGE_KEY = 'zakhira_measuring_units';
export const DEFAULT_UNIT_KEY = 'zakhira_default_unit';

export const SEED_UNITS: MeasuringUnit[] = [
  { id: 'u-piece', name: 'piece', label: 'Piece' },
  { id: 'u-kg',    name: 'kg',    label: 'Kilogram (kg)' },
  { id: 'u-gram',  name: 'gram',  label: 'Gram (g)' },
  { id: 'u-litre', name: 'litre', label: 'Litre (L)' },
  { id: 'u-metre', name: 'metre', label: 'Metre (m)' },
  { id: 'u-box',   name: 'box',   label: 'Box' },
  { id: 'u-dozen', name: 'dozen', label: 'Dozen' },
];

export function loadUnits(): MeasuringUnit[] {
  try {
    const raw = localStorage.getItem(UNIT_STORAGE_KEY);
    if (!raw) return SEED_UNITS.map((u) => ({ ...u }));
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : SEED_UNITS.map((u) => ({ ...u }));
  } catch {
    return SEED_UNITS.map((u) => ({ ...u }));
  }
}

export function saveUnits(units: MeasuringUnit[]): boolean {
  try {
    localStorage.setItem(UNIT_STORAGE_KEY, JSON.stringify(units));
    return true;
  } catch {
    return false;
  }
}

export function getDefaultUnit(): MeasuringUnit {
  try {
    const id = localStorage.getItem(DEFAULT_UNIT_KEY);
    const units = loadUnits();
    if (id) {
      const found = units.find((u) => u.id === id);
      if (found) return found;
    }
    return units[0] || SEED_UNITS[0];
  } catch {
    return SEED_UNITS[0];
  }
}

export function setDefaultUnit(id: string): void {
  try {
    localStorage.setItem(DEFAULT_UNIT_KEY, id);
  } catch {
    /* ignore */
  }
}

// ============================================================
// 🖨️ PRINT FORMAT — DATA MODEL + STORAGE
// ============================================================
export type PrintFormat = 'A4' | 'A5' | 'thermal80' | 'thermal58';

export const PRINT_FORMAT_STORAGE_KEY = 'zakhira_default_print_format';
export const LAST_PRINT_FORMAT_KEY = 'zakhira_last_print_format';

export type PrintFormatConfig = {
  id: PrintFormat;
  label: string;
  shortLabel: string;
  description: string;
  pageSize: string;
  fontSize: number;
  headingSize: number;
  companySize: number;
  cellPadding: string;
  bodyPadding: string;
  maxWidth: string;
  fullColumns: boolean;
  compact: boolean;
};

export const PRINT_FORMATS: Record<PrintFormat, PrintFormatConfig> = {
  A4: {
    id: 'A4',
    label: 'A4 — Full Page',
    shortLabel: 'A4',
    description: '210 × 297 mm (standard office paper)',
    pageSize: 'A4',
    fontSize: 13,
    headingSize: 22,
    companySize: 22,
    cellPadding: '9px',
    bodyPadding: '32px',
    maxWidth: '100%',
    fullColumns: true,
    compact: false,
  },
  A5: {
    id: 'A5',
    label: 'A5 — Half Page',
    shortLabel: 'A5',
    description: '148 × 210 mm (half of A4)',
    pageSize: 'A5',
    fontSize: 11,
    headingSize: 18,
    companySize: 18,
    cellPadding: '7px',
    bodyPadding: '20px',
    maxWidth: '100%',
    fullColumns: true,
    compact: false,
  },
  thermal80: {
    id: 'thermal80',
    label: 'Thermal Receipt 80mm',
    shortLabel: '80mm',
    description: '80 mm thermal printer (most common)',
    pageSize: '80mm auto',
    fontSize: 10,
    headingSize: 13,
    companySize: 13,
    cellPadding: '4px',
    bodyPadding: '6mm',
    maxWidth: '80mm',
    fullColumns: false,
    compact: true,
  },
  thermal58: {
    id: 'thermal58',
    label: 'Thermal Receipt 58mm',
    shortLabel: '58mm',
    description: '58 mm thermal printer (small)',
    pageSize: '58mm auto',
    fontSize: 9,
    headingSize: 12,
    companySize: 12,
    cellPadding: '3px',
    bodyPadding: '4mm',
    maxWidth: '58mm',
    fullColumns: false,
    compact: true,
  },
};

export const PRINT_FORMAT_LIST: PrintFormatConfig[] = [
  PRINT_FORMATS.A4,
  PRINT_FORMATS.A5,
  PRINT_FORMATS.thermal80,
  PRINT_FORMATS.thermal58,
];

export const DEFAULT_PRINT_FORMAT: PrintFormat = 'A4';

const isValidPrintFormat = (v: unknown): v is PrintFormat =>
  v === 'A4' || v === 'A5' || v === 'thermal80' || v === 'thermal58';

export function loadDefaultPrintFormat(): PrintFormat {
  try {
    const raw = localStorage.getItem(PRINT_FORMAT_STORAGE_KEY);
    if (isValidPrintFormat(raw)) return raw;
  } catch {
    /* ignore */
  }
  return DEFAULT_PRINT_FORMAT;
}

export function saveDefaultPrintFormat(format: PrintFormat): boolean {
  try {
    localStorage.setItem(PRINT_FORMAT_STORAGE_KEY, format);
    return true;
  } catch {
    return false;
  }
}

export function loadLastPrintFormat(): PrintFormat | null {
  try {
    const raw = localStorage.getItem(LAST_PRINT_FORMAT_KEY);
    if (isValidPrintFormat(raw)) return raw;
  } catch {
    /* ignore */
  }
  return null;
}

export function saveLastPrintFormat(format: PrintFormat): void {
  try {
    localStorage.setItem(LAST_PRINT_FORMAT_KEY, format);
  } catch {
    /* ignore */
  }
}

export function resolveInitialPrintFormat(): PrintFormat {
  return loadLastPrintFormat() ?? loadDefaultPrintFormat();
}

// ============================================================
// COMPANY INFO
// ============================================================
const COMPANY_WHATSAPP = '923193236529';
const COMPANY_EMAIL = 'nesticktech@gmail.com';
const COMPANY_NAME = 'Nestick Tech';

// ============================================================
// ICONS
// ============================================================
const ICON_PATHS = {
  globe: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0zM2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z',
  receipt: 'M4 2v20l3-2 3 2 3-2 3 2 3-2 1 1V2l-1 1-3-1-3 2-3-2-3 2zM8 8h8M8 12h8M8 16h5',
  check: 'M20 6 9 17l-5-5',
  save: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8',
  info: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0zM12 16v-4M12 8h.01',
  help: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0zM9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01',
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 7l-10 6L2 7',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 0-8 0 4 4 0 0 0 8 0z',
  trash: 'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
  refresh: 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
  plus: 'M12 5v14M5 12h14',
  edit: 'M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z',
  ruler: 'M21.3 8.7 8.7 21.3c-.4.4-1 .4-1.4 0L2.7 16.7c-.4-.4-.4-1 0-1.4L15.3 2.7c.4-.4 1-.4 1.4 0l4.6 4.6c.4.4.4 1 0 1.4zM7.5 10.5l2-2M10.5 13.5l2-2M13.5 16.5l2-2',
  printer: 'M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z',
  whatsapp: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z',
} as const;

type IconName = keyof typeof ICON_PATHS;

const Icon = ({
  name,
  className = 'w-3.5 h-3.5',
  strokeWidth = 2,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}): React.JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    fill={name === 'whatsapp' ? 'currentColor' : 'none'}
    stroke={name === 'whatsapp' ? 'none' : 'currentColor'}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d={ICON_PATHS[name]} />
  </svg>
);

// ============================================================
// MAIN
// ============================================================
export default function SettingsPage(): React.JSX.Element {
  const user = JSON.parse(localStorage.getItem('zakhira_user') || '{}');
  const language: Lang = user.language || 'en';
  const isRTL = language === 'ar' || language === 'ur';

  const tr: Translations = t[language];

  const [activeTab, setActiveTab] = useState<
    'language' | 'units' | 'salesForm' | 'print' | 'help'
  >('language');

  const [salesFormFields, setSalesFormFields] = useState<SalesFormField[]>(
    loadSalesFormFields
  );

  // 📏 Units state
  const [units, setUnits] = useState<MeasuringUnit[]>(() => loadUnits());
  const [defaultUnitId, setDefaultUnitId] = useState<string>(
    () => getDefaultUnit().id
  );
  const [editingUnit, setEditingUnit] = useState<MeasuringUnit | null>(null);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitLabel, setNewUnitLabel] = useState('');
  const [addingUnit, setAddingUnit] = useState(false);
  const [unitError, setUnitError] = useState('');

  // 🖨️ Print settings state
  const [defaultPrintFormat, setDefaultPrintFormatState] = useState<PrintFormat>(
    () => loadDefaultPrintFormat()
  );

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    saveSalesFormFields(salesFormFields);
  }, [salesFormFields]);

  useEffect(() => {
    saveUnits(units);
  }, [units]);

  useEffect(() => {
    setDefaultUnit(defaultUnitId);
  }, [defaultUnitId]);

  const showSaved = (): void => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const changeLanguage = (code: Lang): void => {
    const newUser = { ...user, language: code };
    try {
      localStorage.setItem('zakhira_user', JSON.stringify(newUser));
    } catch {
      /* ignore */
    }
    showSaved();
    setTimeout(() => window.location.reload(), 800);
  };

  const openCompanyWhatsApp = (): void => {
    const msg = encodeURIComponent(
      `Hello ${COMPANY_NAME} Support,\n\nI need help with Zakhira BMS.\n\nPlease assist.`
    );
    window.open(`https://wa.me/${COMPANY_WHATSAPP}?text=${msg}`, '_blank');
  };

  const openCompanyEmail = (): void => {
    const subject = encodeURIComponent('Zakhira BMS — Support Request');
    const body = encodeURIComponent(
      `Hello ${COMPANY_NAME} Support,\n\nI need help with Zakhira BMS.\n\n[Describe your issue here]`
    );
    window.open(`mailto:${COMPANY_EMAIL}?subject=${subject}&body=${body}`, '_blank');
  };

  // Sales Form handlers
  const updateSalesField = (
    id: SalesFormFieldId,
    key: 'label' | 'labelUr',
    value: string
  ): void => {
    setSalesFormFields((current) =>
      current.map((field) =>
        field.id === id ? { ...field, [key]: value } : field
      )
    );
    showSaved();
  };

  const removeSalesField = (id: SalesFormFieldId): void => {
    setSalesFormFields((current) => current.filter((field) => field.id !== id));
    showSaved();
  };

  const addSalesField = (): void => {
    const newId = `custom-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 6)}` as SalesFormFieldId;
    const newField: SalesFormField = {
      id: newId,
      label: tr.newFieldLabel,
      labelUr: tr.newFieldLabelUr,
      required: false,
    };
    setSalesFormFields((current) => [...current, newField]);
    showSaved();
  };

  const resetSalesFormFields = (): void => {
    setSalesFormFields(DEFAULT_SALES_FORM_FIELDS.map((f) => ({ ...f })));
    showSaved();
  };

  // ============================================================
  // 📏 UNITS HANDLERS
  // ============================================================
  const startAddUnit = (): void => {
    setAddingUnit(true);
    setEditingUnit(null);
    setNewUnitName('');
    setNewUnitLabel('');
    setUnitError('');
  };

  const startEditUnit = (unit: MeasuringUnit): void => {
    setEditingUnit(unit);
    setAddingUnit(false);
    setNewUnitName(unit.name);
    setNewUnitLabel(unit.label);
    setUnitError('');
  };

  const cancelUnitForm = (): void => {
    setAddingUnit(false);
    setEditingUnit(null);
    setNewUnitName('');
    setNewUnitLabel('');
    setUnitError('');
  };

  const commitUnit = (): void => {
    const name = newUnitName.trim().toLowerCase();
    const label = newUnitLabel.trim() || newUnitName.trim();

    if (!name) {
      setUnitError(tr.errUnitRequired);
      return;
    }

    const duplicate = units.some(
      (u) =>
        u.name.toLowerCase() === name &&
        (!editingUnit || u.id !== editingUnit.id)
    );
    if (duplicate) {
      setUnitError(tr.errUnitDuplicate);
      return;
    }

    if (addingUnit) {
      const newUnit: MeasuringUnit = {
        id: `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        name,
        label,
      };
      setUnits((prev) => [...prev, newUnit]);
      showSaved();
    } else if (editingUnit) {
      setUnits((prev) =>
        prev.map((u) =>
          u.id === editingUnit.id ? { ...u, name, label } : u
        )
      );
      showSaved();
    }

    cancelUnitForm();
  };

  const deleteUnit = (unit: MeasuringUnit): void => {
    if (units.length <= 1) {
      setUnitError(tr.errUnitMin);
      return;
    }
    if (defaultUnitId === unit.id) {
      const next = units.find((u) => u.id !== unit.id);
      if (next) setDefaultUnitId(next.id);
    }
    setUnits((prev) => prev.filter((u) => u.id !== unit.id));
    showSaved();
  };

  const resetUnits = (): void => {
    const fresh = SEED_UNITS.map((u) => ({ ...u }));
    setUnits(fresh);
    setDefaultUnitId(fresh[0].id);
    showSaved();
  };

  // ============================================================
  // 🖨️ PRINT HANDLERS
  // ============================================================
  const changePrintFormat = (format: PrintFormat): void => {
    setDefaultPrintFormatState(format);
    saveDefaultPrintFormat(format);
    showSaved();
  };

  // ============================================================
  // TABS
  // ============================================================
  const langOptions: { code: Lang; native: string; short: string; dir: string }[] = [
    { code: 'en', native: 'English', short: 'EN', dir: 'LTR' },
    { code: 'ar', native: 'العربية', short: 'AR', dir: 'RTL' },
    { code: 'ur', native: 'اردو', short: 'UR', dir: 'RTL' },
    { code: 'hi', native: 'हिन्दी', short: 'HI', dir: 'LTR' },
  ];

  const tabs: { id: typeof activeTab; label: string; icon: IconName }[] = [
    { id: 'language', label: tr.tabLanguage, icon: 'globe' },
    { id: 'units', label: tr.tabUnits, icon: 'ruler' },
    { id: 'salesForm', label: tr.tabSalesForm, icon: 'receipt' },
    { id: 'print', label: tr.tabPrint, icon: 'printer' },
    { id: 'help', label: tr.tabHelp, icon: 'help' },
  ];

  const defaultUnit = useMemo(
    () => units.find((u) => u.id === defaultUnitId) || units[0],
    [units, defaultUnitId]
  );

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={language}
      className="min-h-screen p-4 lg:p-6"
      style={{ backgroundColor: THEME.warmIvory }}
    >
      {/* HEADER */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold" style={{ color: THEME.deepForest }}>
            {tr.settingsTitle}
          </h1>
          <p className="mt-0.5 text-[11px]" style={{ color: THEME.mutedOlive }}>
            {tr.settingsSubtitle}
          </p>
        </div>

        {saved && (
          <div
            className="px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"
            style={{
              backgroundColor: 'rgba(102,116,90,0.15)',
              border: `2px solid ${THEME.mutedOlive}40`,
              color: THEME.deepForest,
            }}
          >
            <Icon name="check" className="w-3 h-3" strokeWidth={3} />
            <span>{tr.saved}</span>
          </div>
        )}
      </div>

      {/* TABS */}
      <div
        className="rounded-2xl p-1.5 mb-4 grid grid-cols-2 sm:grid-cols-5 gap-1.5"
        style={{
          backgroundColor: '#FFFFFF',
          border: `1px solid ${THEME.mutedOlive}20`,
        }}
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="py-2 rounded-xl text-[12px] font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
              style={{
                backgroundColor: active ? THEME.warmBrass : 'transparent',
                color: active ? THEME.warmIvory : THEME.mutedOlive,
                boxShadow: active
                  ? 'inset 0 1px 0 rgba(247,243,234,0.25), 0 2px 6px rgba(196,154,90,0.25)'
                  : 'none',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = THEME.warmIvory;
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Icon name={tab.icon} className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================
          TAB: LANGUAGE
      ============================================ */}
      {activeTab === 'language' && (
        <div
          className="rounded-2xl p-4 max-w-xl"
          style={{
            backgroundColor: '#FFFFFF',
            border: `1px solid ${THEME.mutedOlive}20`,
          }}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ backgroundColor: THEME.warmBrass, color: THEME.warmIvory }}
            >
              <Icon name="globe" className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-[12px] font-bold" style={{ color: THEME.deepForest }}>
                {tr.chooseLanguage}
              </h2>
              <p className="text-[10px]" style={{ color: THEME.mutedOlive }}>
                {tr.chooseLanguageHint}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            {langOptions.map((lang) => {
              const active = language === lang.code;
              return (
                <label
                  key={lang.code}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all"
                  style={{
                    backgroundColor: active
                      ? 'rgba(196,154,90,0.10)'
                      : 'rgba(247,243,234,0.5)',
                    borderColor: active
                      ? THEME.warmBrass
                      : `${THEME.mutedOlive}25`,
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.borderColor = `${THEME.warmBrass}66`;
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.borderColor = `${THEME.mutedOlive}25`;
                      e.currentTarget.style.backgroundColor = 'rgba(247,243,234,0.5)';
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => changeLanguage(lang.code)}
                    className="w-4 h-4 rounded cursor-pointer"
                    style={{ accentColor: THEME.warmBrass }}
                  />
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold truncate" style={{ color: THEME.charcoal }}>
                        {lang.native}
                      </p>
                      <p className="text-[9px] font-mono mt-0.5" style={{ color: THEME.mutedOlive }}>
                        {lang.short} · {lang.dir}
                      </p>
                    </div>
                    {active && (
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider flex-shrink-0"
                        style={{ color: THEME.warmBrass }}
                      >
                        {tr.selected}
                      </span>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================
          TAB: MEASURING UNITS
      ============================================ */}
      {activeTab === 'units' && (
        <section className="max-w-2xl">
          <div
            className="rounded-2xl p-4"
            style={{
              backgroundColor: '#FFFFFF',
              border: `1px solid ${THEME.mutedOlive}20`,
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: THEME.warmBrass, color: THEME.warmIvory }}
                >
                  <Icon name="ruler" className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h2 className="text-[12px] font-bold" style={{ color: THEME.deepForest }}>
                    {tr.measuringUnits}
                  </h2>
                  <p className="text-[10px]" style={{ color: THEME.mutedOlive }}>
                    {tr.measuringUnitsHint}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetUnits}
                className="flex items-center gap-1 h-8 rounded-full px-3 text-[11px] font-bold transition"
                style={{
                  border: `2px solid ${THEME.mutedOlive}30`,
                  color: THEME.warmBrass,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = THEME.warmIvory;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Icon name="refresh" className="w-3 h-3" />
                {tr.reset}
              </button>
            </div>

            <div className="mb-4">
              <label
                className="block text-[9px] font-bold uppercase tracking-wider mb-1"
                style={{ color: THEME.mutedOlive }}
              >
                {tr.defaultUnit}
              </label>
              <select
                value={defaultUnitId}
                onChange={(e) => {
                  setDefaultUnitId(e.target.value);
                  showSaved();
                }}
                className="w-full h-10 px-4 rounded-full border-2 text-[12px] cursor-pointer focus:outline-none"
                style={{
                  borderColor: `${THEME.mutedOlive}30`,
                  backgroundColor: THEME.warmIvory,
                  color: THEME.charcoal,
                }}
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[10px]" style={{ color: THEME.mutedOlive }}>
                {tr.defaultUnitHint(defaultUnit?.label || '')}
              </p>
            </div>

            {(addingUnit || editingUnit) && (
              <div
                className="rounded-xl p-3 mb-3 space-y-2"
                style={{
                  backgroundColor: 'rgba(196,154,90,0.08)',
                  border: `1px solid ${THEME.warmBrass}40`,
                }}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: THEME.deepForest }}>
                  {addingUnit ? tr.addNewUnit : tr.editUnit}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="block">
                    <span className="block text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: THEME.mutedOlive }}>
                      {tr.nameInternal}
                    </span>
                    <input
                      type="text"
                      value={newUnitName}
                      onChange={(e) => setNewUnitName(e.target.value)}
                      placeholder="kg, piece, box..."
                      className="w-full h-8 px-3 rounded-full border-2 text-[11px] focus:outline-none"
                      style={{
                        borderColor: `${THEME.mutedOlive}30`,
                        backgroundColor: '#FFFFFF',
                        color: THEME.charcoal,
                      }}
                    />
                  </label>
                  <label className="block">
                    <span className="block text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: THEME.mutedOlive }}>
                      {tr.labelDisplay}
                    </span>
                    <input
                      type="text"
                      value={newUnitLabel}
                      onChange={(e) => setNewUnitLabel(e.target.value)}
                      placeholder="Kilogram (kg)"
                      className="w-full h-8 px-3 rounded-full border-2 text-[11px] focus:outline-none"
                      style={{
                        borderColor: `${THEME.mutedOlive}30`,
                        backgroundColor: '#FFFFFF',
                        color: THEME.charcoal,
                      }}
                    />
                  </label>
                </div>
                {unitError && (
                  <p className="text-[10px] font-semibold" style={{ color: THEME.warmBrass }}>
                    {unitError}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={commitUnit}
                    className="h-8 rounded-full px-4 text-[11px] font-bold"
                    style={{ backgroundColor: THEME.deepForest, color: THEME.warmIvory }}
                  >
                    {tr.save}
                  </button>
                  <button
                    type="button"
                    onClick={cancelUnitForm}
                    className="h-8 rounded-full px-4 text-[11px] font-bold"
                    style={{
                      border: `2px solid ${THEME.mutedOlive}30`,
                      color: THEME.mutedOlive,
                      backgroundColor: 'transparent',
                    }}
                  >
                    {tr.cancel}
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: THEME.mutedOlive }}>
                {tr.unitsList} ({units.length})
              </h3>
              {!addingUnit && !editingUnit && (
                <button
                  type="button"
                  onClick={startAddUnit}
                  className="flex items-center gap-1 h-8 rounded-full px-3 text-[11px] font-bold"
                  style={{ backgroundColor: THEME.warmBrass, color: THEME.warmIvory }}
                >
                  <Icon name="plus" className="w-3 h-3" strokeWidth={2.5} />
                  {tr.addUnit}
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {units.map((u) => {
                const isDefault = u.id === defaultUnitId;
                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl"
                    style={{
                      backgroundColor: 'rgba(247,243,234,0.6)',
                      border: `1px solid ${THEME.mutedOlive}20`,
                    }}
                  >
                    <div className="min-w-0 flex-1 flex items-center gap-2">
                      <span className="text-[12px] font-semibold" style={{ color: THEME.charcoal }}>
                        {u.label}
                      </span>
                      <span className="text-[9px] font-mono" style={{ color: THEME.mutedOlive }}>
                        ({u.name})
                      </span>
                      {isDefault && (
                        <span
                          className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: THEME.warmBrass,
                            color: THEME.warmIvory,
                          }}
                        >
                          {tr.defaultBadge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => startEditUnit(u)}
                        title={tr.edit}
                        className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition"
                        style={{
                          backgroundColor: 'rgba(196,154,90,0.15)',
                          color: THEME.warmBrass,
                        }}
                      >
                        <Icon name="edit" className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteUnit(u)}
                        disabled={units.length <= 1}
                        title={tr.delete}
                        className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: 'rgba(37,42,40,0.10)',
                          color: THEME.charcoal,
                        }}
                      >
                        <Icon name="trash" className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          TAB: SALES FORM FIELDS
      ============================================ */}
      {activeTab === 'salesForm' && (
        <section>
          <div
            className="rounded-2xl p-4"
            style={{
              backgroundColor: '#FFFFFF',
              border: `1px solid ${THEME.mutedOlive}20`,
            }}
          >
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-[12px] font-bold" style={{ color: THEME.deepForest }}>
                  {tr.salesFormFields}
                </h2>
                <p className="mt-0.5 text-[10px]" style={{ color: THEME.mutedOlive }}>
                  {tr.salesFormHint}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={addSalesField}
                  className="flex items-center gap-1 h-8 rounded-full px-3 text-[11px] font-bold transition"
                  style={{ backgroundColor: THEME.warmBrass, color: THEME.warmIvory }}
                >
                  <Icon name="plus" className="w-3 h-3" strokeWidth={2.5} />
                  {tr.addField}
                </button>
                <button
                  type="button"
                  onClick={resetSalesFormFields}
                  className="flex items-center gap-1 h-8 rounded-full px-3 text-[11px] font-bold transition"
                  style={{
                    border: `2px solid ${THEME.mutedOlive}30`,
                    color: THEME.warmBrass,
                  }}
                >
                  <Icon name="refresh" className="w-3 h-3" />
                  {tr.reset}
                </button>
              </div>
            </div>

            {salesFormFields.length > 0 ? (
              <div className="space-y-1.5">
                {salesFormFields.map((field) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-1 items-end gap-2 rounded-xl p-2.5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
                    style={{
                      backgroundColor: 'rgba(247,243,234,0.5)',
                      border: `1px solid ${THEME.mutedOlive}20`,
                    }}
                  >
                    <label className="block min-w-0">
                      <span
                        className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider"
                        style={{ color: THEME.mutedOlive }}
                      >
                        {tr.englishLabel}
                      </span>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) =>
                          updateSalesField(field.id, 'label', e.target.value)
                        }
                        className="w-full h-8 px-3 rounded-full border-2 text-[11px] focus:outline-none"
                        style={{
                          borderColor: `${THEME.mutedOlive}30`,
                          backgroundColor: '#FFFFFF',
                          color: THEME.charcoal,
                        }}
                      />
                    </label>
                    <label className="block min-w-0">
                      <span
                        className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider"
                        style={{ color: THEME.mutedOlive }}
                      >
                        {tr.urduLabel}
                      </span>
                      <input
                        type="text"
                        dir="rtl"
                        value={field.labelUr}
                        onChange={(e) =>
                          updateSalesField(field.id, 'labelUr', e.target.value)
                        }
                        className="w-full h-8 px-3 rounded-full border-2 text-[11px] focus:outline-none"
                        style={{
                          borderColor: `${THEME.mutedOlive}30`,
                          backgroundColor: '#FFFFFF',
                          color: THEME.charcoal,
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeSalesField(field.id)}
                      className="flex h-8 items-center gap-1 rounded-full px-3 text-[10px] font-bold transition"
                      style={{
                        backgroundColor: 'rgba(196,154,90,0.15)',
                        color: THEME.charcoal,
                      }}
                    >
                      <Icon name="trash" className="w-3 h-3" />
                      {tr.remove}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="rounded-xl px-4 py-6 text-center"
                style={{ border: `1px dashed ${THEME.mutedOlive}30` }}
              >
                <p className="text-[11px] font-semibold" style={{ color: THEME.charcoal }}>
                  {tr.noSalesFields}
                </p>
                <p className="mt-1 text-[10px]" style={{ color: THEME.mutedOlive }}>
                  {tr.noSalesFieldsHint}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ============================================
          TAB: PRINT SETTINGS
      ============================================ */}
      {activeTab === 'print' && (
        <section className="max-w-2xl">
          <div
            className="rounded-2xl p-4"
            style={{
              backgroundColor: '#FFFFFF',
              border: `1px solid ${THEME.mutedOlive}20`,
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: THEME.warmBrass, color: THEME.warmIvory }}
                >
                  <Icon name="printer" className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h2 className="text-[12px] font-bold" style={{ color: THEME.deepForest }}>
                    {tr.printSettings}
                  </h2>
                  <p className="text-[10px]" style={{ color: THEME.mutedOlive }}>
                    {tr.printSettingsHint}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => changePrintFormat(DEFAULT_PRINT_FORMAT)}
                className="flex items-center gap-1 h-8 rounded-full px-3 text-[11px] font-bold transition"
                style={{
                  border: `2px solid ${THEME.mutedOlive}30`,
                  color: THEME.warmBrass,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = THEME.warmIvory;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Icon name="refresh" className="w-3 h-3" />
                {tr.reset}
              </button>
            </div>

            <div className="mb-4">
              <label
                className="block text-[9px] font-bold uppercase tracking-wider mb-1"
                style={{ color: THEME.mutedOlive }}
              >
                {tr.defaultFormat}
              </label>
              <select
                value={defaultPrintFormat}
                onChange={(e) => changePrintFormat(e.target.value as PrintFormat)}
                className="w-full h-10 px-4 rounded-full border-2 text-[12px] cursor-pointer focus:outline-none"
                style={{
                  borderColor: `${THEME.mutedOlive}30`,
                  backgroundColor: THEME.warmIvory,
                  color: THEME.charcoal,
                }}
              >
                {PRINT_FORMAT_LIST.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[10px]" style={{ color: THEME.mutedOlive }}>
                {tr.defaultFormatHint}
              </p>
            </div>

            <div className="mb-3">
              <h3
                className="text-[10px] font-bold uppercase tracking-wider mb-2"
                style={{ color: THEME.mutedOlive }}
              >
                {tr.availableFormats}
              </h3>
              <div className="space-y-1.5">
                {PRINT_FORMAT_LIST.map((f) => {
                  const active = defaultPrintFormat === f.id;
                  return (
                    <label
                      key={f.id}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all"
                      style={{
                        backgroundColor: active
                          ? 'rgba(196,154,90,0.10)'
                          : 'rgba(247,243,234,0.5)',
                        borderColor: active
                          ? THEME.warmBrass
                          : `${THEME.mutedOlive}25`,
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.borderColor = `${THEME.warmBrass}66`;
                          e.currentTarget.style.backgroundColor = '#FFFFFF';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.borderColor = `${THEME.mutedOlive}25`;
                          e.currentTarget.style.backgroundColor = 'rgba(247,243,234,0.5)';
                        }
                      }}
                    >
                      <input
                        type="radio"
                        name="defaultPrintFormat"
                        checked={active}
                        onChange={() => changePrintFormat(f.id)}
                        className="w-4 h-4 cursor-pointer"
                        style={{ accentColor: THEME.warmBrass }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold" style={{ color: THEME.charcoal }}>
                          {f.label}
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ color: THEME.mutedOlive }}>
                          {f.description}
                        </p>
                      </div>
                      {active && (
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider flex-shrink-0"
                          style={{ color: THEME.warmBrass }}
                        >
                          {tr.defaultBadge}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            <div
              className="p-3 rounded-xl flex items-start gap-2"
              style={{
                backgroundColor: 'rgba(196,154,90,0.10)',
                border: `1px solid ${THEME.warmBrass}40`,
              }}
            >
              <span className="flex-shrink-0 mt-0.5" style={{ color: THEME.warmBrass }}>
                <Icon name="info" className="w-3.5 h-3.5" />
              </span>
              <p className="text-[10px] leading-relaxed" style={{ color: THEME.mutedOlive }}>
                {tr.printInfo}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          TAB: HELP & SUPPORT
      ============================================ */}
      {activeTab === 'help' && (
        <div className="max-w-2xl space-y-4">
          <div
            className="rounded-2xl p-4 text-center"
            style={{
              backgroundColor: '#FFFFFF',
              border: `1px solid ${THEME.mutedOlive}20`,
            }}
          >
            <div
              className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-2.5"
              style={{ backgroundColor: THEME.warmBrass, color: THEME.warmIvory }}
            >
              <Icon name="help" className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <h2 className="text-[14px] font-bold mb-1" style={{ color: THEME.deepForest }}>
              {tr.needHelp}
            </h2>
            <p className="text-[11px] max-w-md mx-auto leading-relaxed" style={{ color: THEME.mutedOlive }}>
              {tr.needHelpHint}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={openCompanyWhatsApp}
              className="rounded-2xl p-3.5 text-start cursor-pointer transition-all group"
              style={{
                backgroundColor: '#FFFFFF',
                border: `2px solid ${THEME.mutedOlive}20`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = THEME.mutedOlive;
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102,116,90,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${THEME.mutedOlive}20`;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: THEME.deepForest, color: THEME.warmIvory }}
                >
                  <Icon name="whatsapp" className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[12px] font-bold mb-0.5" style={{ color: THEME.deepForest }}>
                    {tr.contactWhatsApp}
                  </h3>
                  <p className="text-[10px] leading-relaxed" style={{ color: THEME.mutedOlive }}>
                    {tr.contactWhatsAppHint}
                  </p>
                  <p className="text-[9px] font-mono font-bold mt-1" style={{ color: THEME.deepForest }}>
                    +92 319 3236529
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={openCompanyEmail}
              className="rounded-2xl p-3.5 text-start cursor-pointer transition-all group"
              style={{
                backgroundColor: '#FFFFFF',
                border: `2px solid ${THEME.mutedOlive}20`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = THEME.warmBrass;
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(196,154,90,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${THEME.mutedOlive}20`;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: THEME.deepForest, color: THEME.warmIvory }}
                >
                  <Icon name="mail" className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[12px] font-bold mb-0.5" style={{ color: THEME.deepForest }}>
                    {tr.sendEmail}
                  </h3>
                  <p className="text-[10px] leading-relaxed" style={{ color: THEME.mutedOlive }}>
                    {tr.sendEmailHint}
                  </p>
                  <p className="text-[9px] font-mono font-bold mt-1 truncate" style={{ color: THEME.warmBrass }}>
                    {COMPANY_EMAIL}
                  </p>
                </div>
              </div>
            </button>
          </div>

          <div
            className="rounded-2xl p-3.5"
            style={{
              backgroundColor: '#FFFFFF',
              border: `1px solid ${THEME.mutedOlive}20`,
            }}
          >
            <div className="flex items-center gap-2.5 mb-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ backgroundColor: THEME.warmBrass, color: THEME.warmIvory }}
              >
                <Icon name="user" className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-[12px] font-bold" style={{ color: THEME.deepForest }}>
                  {tr.companyInfo}
                </h2>
                <p className="text-[9px]" style={{ color: THEME.mutedOlive }}>
                  {tr.companyInfoHint}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              {[
                { label: tr.company, value: COMPANY_NAME },
                { label: 'WhatsApp', value: '+92 319 3236529' },
                { label: 'Email', value: COMPANY_EMAIL },
                {
                  label: tr.availability,
                  value: tr.availabilityValue,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between p-2.5 rounded-xl"
                  style={{ backgroundColor: 'rgba(247,243,234,0.5)' }}
                >
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider"
                    style={{ color: THEME.mutedOlive }}
                  >
                    {row.label}
                  </span>
                  <span className="text-[11px] font-bold" style={{ color: THEME.charcoal }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-2xl p-3.5"
            style={{
              backgroundColor: 'rgba(196,154,90,0.10)',
              border: `2px solid ${THEME.warmBrass}40`,
            }}
          >
            <div className="flex items-start gap-2.5">
              <span className="flex-shrink-0 mt-0.5" style={{ color: THEME.warmBrass }}>
                <Icon name="info" className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-[12px] font-bold mb-1.5" style={{ color: THEME.deepForest }}>
                  {tr.forFasterHelp}
                </h3>
                <ul className="space-y-1 text-[10px] leading-relaxed" style={{ color: THEME.mutedOlive }}>
                  <li>{tr.helpTip1}</li>
                  <li>{tr.helpTip2}</li>
                  <li>{tr.helpTip3}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}