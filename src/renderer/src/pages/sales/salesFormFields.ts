export type SalesFormFieldId =
  | 'customerId'
  | 'customerName'
  | 'phone'
  | 'email'
  | 'city'
  | 'address'
  | 'referenceNo'
  | 'invoiceDate'
  | 'dueDate'
  | 'paymentTerms'
  | 'material'
  | 'quantity'
  | 'price'
  | 'discount'
  | 'notes';

export type SalesFormField = {
  id: SalesFormFieldId;
  label: string;
  labelUr: string;
  required: boolean;
};

export const SALES_FORM_FIELDS_STORAGE_KEY = 'zakhira_sales_form_fields';

export const DEFAULT_SALES_FORM_FIELDS: SalesFormField[] = [
  { id: 'customerId', label: 'Customer ID', labelUr: 'کسٹمر آئی ڈی', required: true },
  { id: 'customerName', label: 'Customer Name', labelUr: 'کسٹمر کا نام', required: true },
  { id: 'phone', label: 'Phone', labelUr: 'فون', required: true },
  { id: 'email', label: 'Email', labelUr: 'ای میل', required: false },
  { id: 'city', label: 'City', labelUr: 'شہر', required: false },
  { id: 'address', label: 'Address', labelUr: 'پتہ', required: false },
  { id: 'referenceNo', label: 'Reference / PO No.', labelUr: 'ریفرنس / PO نمبر', required: false },
  { id: 'invoiceDate', label: 'Invoice Date', labelUr: 'انوائس کی تاریخ', required: true },
  { id: 'dueDate', label: 'Due Date', labelUr: 'واجب الادا تاریخ', required: true },
  { id: 'paymentTerms', label: 'Payment Terms', labelUr: 'ادائیگی کی شرائط', required: false },
  { id: 'material', label: 'Material', labelUr: 'میٹیریل', required: true },
  { id: 'quantity', label: 'Qty', labelUr: 'مقدار', required: true },
  { id: 'price', label: 'Price', labelUr: 'قیمت', required: true },
  { id: 'discount', label: 'Discount %', labelUr: 'ڈسکاؤنٹ %', required: false },
  { id: 'notes', label: 'Notes', labelUr: 'نوٹس', required: false },
];

const fieldIds = new Set<string>(
  DEFAULT_SALES_FORM_FIELDS.map((field) => field.id)
);

export const loadSalesFormFields = (): SalesFormField[] => {
  try {
    const raw = localStorage.getItem(SALES_FORM_FIELDS_STORAGE_KEY);
    if (!raw) return DEFAULT_SALES_FORM_FIELDS.map((field) => ({ ...field }));

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return DEFAULT_SALES_FORM_FIELDS.map((field) => ({ ...field }));
    }

    return parsed.filter(
      (field): field is SalesFormField =>
        typeof field === 'object' &&
        field !== null &&
        'id' in field &&
        typeof field.id === 'string' &&
        fieldIds.has(field.id) &&
        'label' in field &&
        typeof field.label === 'string' &&
        'labelUr' in field &&
        typeof field.labelUr === 'string' &&
        'required' in field &&
        typeof field.required === 'boolean'
    );
  } catch {
    return DEFAULT_SALES_FORM_FIELDS.map((field) => ({ ...field }));
  }
};

export const saveSalesFormFields = (fields: SalesFormField[]): void => {
  localStorage.setItem(SALES_FORM_FIELDS_STORAGE_KEY, JSON.stringify(fields));
};
