/* eslint-disable prettier/prettier */
/* eslint-disable react/no-unescaped-entities */
import { useState } from 'react';

// ============================================================
// SVG ICONS
// ============================================================
const Icons = {
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  edit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  ),
};

// ============================================================
// TYPES
// ============================================================
type CustomerStatus = 'Pending' | 'Approved' | 'Rejected';

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  company: string;
  vatNumber: string;
  notes: string;
  status: CustomerStatus;
  createdAt: string;
};

// ============================================================
// STORAGE HELPERS (Sales page isi key se customers uthata hai)
// ============================================================
const STORAGE_KEY = 'zakhira_customers';

// Demo customers — Sales / Sales Record pages ke demo records inhi IDs se jude hain.
// Pehli baar (storage mein kuch nahi) => ye 3 customers dikhte hain.
const getDefaultCustomers = (): Customer[] => {
  const now = new Date().toISOString();
  return [
    {
      id: 'C-1001',
      name: 'Al Noor Trading Co.',
      phone: '+966501234567',
      email: 'alnoor@example.com',
      city: 'Riyadh',
      address: 'King Fahd Rd',
      company: 'Al Noor Trading Co.',
      vatNumber: '300000000000003',
      notes: '—',
      status: 'Approved',
      createdAt: now,
    },
    {
      id: 'C-1002',
      name: 'Gulf Builders LLC',
      phone: '+966502345678',
      email: 'gulf@example.com',
      city: 'Jeddah',
      address: 'Tahlia St',
      company: 'Gulf Builders LLC',
      vatNumber: '300000000000011',
      notes: '—',
      status: 'Approved',
      createdAt: now,
    },
    {
      id: 'C-1003',
      name: 'Desert Rose Interiors',
      phone: '+966503456789',
      email: 'desert@example.com',
      city: 'Dammam',
      address: 'Corniche Rd',
      company: 'Desert Rose Interiors',
      vatNumber: '—',
      notes: '—',
      status: 'Pending',
      createdAt: now,
    },
  ];
};

const loadCustomers = (): Customer[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return getDefaultCustomers();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return getDefaultCustomers();
  }
};

const saveCustomers = (customers: Customer[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
};

const generateCustomerId = (existing: Customer[]): string => {
  if (existing.length === 0) return 'C-1001';
  const numbers = existing
    .map((c) => {
      const match = c.id.match(/^C-(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0);
  const max = numbers.length > 0 ? Math.max(...numbers) : 1000;
  return `C-${max + 1}`;
};

// ============================================================
// EMPTY FORM + STYLES
// ============================================================
const EMPTY_FORM = {
  name: '',
  phone: '',
  email: '',
  city: '',
  address: '',
  company: '',
  vatNumber: '',
  notes: '',
};

const labelCls = 'block text-[10px] font-bold text-dark mb-1.5 uppercase tracking-wider';
const inputCls =
  'w-full h-10 px-4 rounded-full border-2 border-supporting/20 bg-primary/30 text-dark text-sm placeholder:text-supporting/40 focus:outline-none focus:border-secondary focus:bg-white transition-all';

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function AddCustomerPage(): React.JSX.Element {
  const [customers, setCustomers] = useState<Customer[]>(() => loadCustomers());
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const refresh = (): void => {
    setCustomers(loadCustomers());
  };

  const showSuccess = (msg: string): void => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const nextId = generateCustomerId(customers);

  // ============================================================
  // SUBMIT
  // ============================================================
  const handleSubmit = (): void => {
    if (!form.name.trim()) {
      setFormError('Customer Name required');
      return;
    }
    if (!form.phone.trim()) {
      setFormError('Phone required');
      return;
    }

    const all = loadCustomers();

    if (editingId) {
      const updated = all.map((c) =>
        c.id === editingId
          ? {
              ...c,
              name: form.name.trim(),
              phone: form.phone.trim(),
              email: form.email.trim() || '—',
              city: form.city.trim() || '—',
              address: form.address.trim() || '—',
              company: form.company.trim() || '—',
              vatNumber: form.vatNumber.trim() || '—',
              notes: form.notes.trim() || '—',
            }
          : c
      );
      saveCustomers(updated);
      showSuccess('Customer updated successfully');
      setEditingId(null);
    } else {
      const newCustomer: Customer = {
        id: generateCustomerId(all),
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || '—',
        city: form.city.trim() || '—',
        address: form.address.trim() || '—',
        company: form.company.trim() || '—',
        vatNumber: form.vatNumber.trim() || '—',
        notes: form.notes.trim() || '—',
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      saveCustomers([newCustomer, ...all]);
      showSuccess('Customer added — ab Sales page par select kar sakte hain');
    }

    setForm({ ...EMPTY_FORM });
    setFormError('');
    refresh();
  };

  const handleClear = (): void => {
    setForm({ ...EMPTY_FORM });
    setFormError('');
    setEditingId(null);
  };

  const handleEdit = (c: Customer): void => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      phone: c.phone,
      email: c.email === '—' ? '' : c.email,
      city: c.city === '—' ? '' : c.city,
      address: c.address === '—' ? '' : c.address,
      company: c.company === '—' ? '' : c.company,
      vatNumber: c.vatNumber === '—' ? '' : c.vatNumber,
      notes: c.notes === '—' ? '' : c.notes,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatus = (id: string, status: CustomerStatus): void => {
    const updated = loadCustomers().map((c) =>
      c.id === id ? { ...c, status } : c
    );
    saveCustomers(updated);
    refresh();
  };

  const handleDelete = (id: string): void => {
    const updated = loadCustomers().filter((c) => c.id !== id);
    saveCustomers(updated);
    refresh();
  };

  // ============================================================
  // FILTERED LIST
  // ============================================================
  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.id.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q)
    );
  });

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-primary p-6 lg:p-8">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">Add Customer</h1>
        <p className="text-supporting mt-1.5 text-sm">
          Add new customers — Sales page par inhein select karte hi details auto-fill ho jati hain
        </p>
      </div>

      {/* SUCCESS */}
      {successMsg && (
        <div className="mb-4 px-4 py-3 rounded-full bg-green-50 border-2 border-green-200 text-green-700 text-xs font-bold flex items-center gap-2">
          {Icons.check}
          <span>{successMsg}</span>
        </div>
      )}

      {/* FORM CARD */}
      <div className="bg-white rounded-3xl border border-supporting/10 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white flex-shrink-0"
            style={{
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 10px rgba(196,154,90,0.3)',
            }}
          >
            {Icons.user}
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-dark">
              {editingId ? 'Edit Customer' : 'New Customer'}
            </h2>
            <p className="text-xs text-supporting mt-0.5">
              {editingId
                ? `Editing: ${editingId}`
                : `New ID will be: ${nextId}`}
            </p>
          </div>
          {editingId && (
            <button
              onClick={handleClear}
              className="px-4 py-1.5 rounded-full bg-primary text-supporting text-xs font-bold cursor-pointer hover:bg-red-50 hover:text-red-600 transition flex items-center gap-1.5"
            >
              {Icons.x}
              <span>Cancel Edit</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Customer ID (read-only) */}
          <div>
            <label className={labelCls}>Customer ID (auto)</label>
            <input
              type="text"
              value={editingId || nextId}
              readOnly
              className="w-full h-10 px-4 rounded-full border-2 border-supporting/20 bg-primary/50 text-supporting text-sm font-mono cursor-not-allowed"
            />
          </div>

          {/* Name */}
          <div>
            <label className={labelCls}>
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Al-Rajhi Construction"
              className={inputCls}
            />
          </div>

          {/* Phone */}
          <div>
            <label className={labelCls}>
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+966 50 123 4567"
              className={`${inputCls} font-mono`}
            />
          </div>

          {/* Email */}
          <div>
            <label className={labelCls}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="info@customer.sa"
              className={inputCls}
            />
          </div>

          {/* City */}
          <div>
            <label className={labelCls}>City</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Riyadh"
              className={inputCls}
            />
          </div>

          {/* Address */}
          <div>
            <label className={labelCls}>Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Street, Building, Area"
              className={inputCls}
            />
          </div>

          {/* Company */}
          <div>
            <label className={labelCls}>Company / Business</label>
            <input
              type="text"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Al-Rajhi LLC"
              className={inputCls}
            />
          </div>

          {/* VAT */}
          <div>
            <label className={labelCls}>VAT / Tax Number</label>
            <input
              type="text"
              value={form.vatNumber}
              onChange={(e) => setForm({ ...form, vatNumber: e.target.value })}
              placeholder="300000000000003"
              className={`${inputCls} font-mono`}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className={labelCls}>Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            placeholder="Additional notes about this customer..."
            className="w-full px-4 py-2.5 rounded-2xl border-2 border-supporting/20 bg-primary/30 text-dark text-sm placeholder:text-supporting/40 focus:outline-none focus:border-secondary focus:bg-white transition-all resize-none"
          />
        </div>

        {formError && (
          <div className="mb-4 px-4 py-2.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {formError}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-supporting/10">
          <button
            onClick={handleSubmit}
            className="h-10 px-6 bg-secondary text-primary text-sm font-bold cursor-pointer rounded-full transition-all duration-300 hover:shadow-md flex items-center gap-2"
          >
            {editingId ? Icons.check : Icons.plus}
            <span>{editingId ? 'Update Customer' : 'Save Customer'}</span>
          </button>
          <button
            onClick={handleClear}
            className="h-10 px-5 bg-primary text-supporting text-sm font-bold cursor-pointer rounded-full border-2 border-supporting/20 hover:bg-white hover:text-dark transition-all"
          >
            Clear
          </button>
        </div>
      </div>

      {/* CUSTOMER LIST */}
      <div className="bg-white rounded-3xl border border-supporting/10 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b border-supporting/10 bg-primary/20 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-sm font-bold text-dark">
            Customer List{' '}
            <span className="text-xs font-normal">({customers.length})</span>
          </h2>
          <div className="relative md:w-72">
            <span className="absolute top-1/2 -translate-y-1/2 start-4 text-supporting pointer-events-none">
              {Icons.search}
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, name, phone..."
              className="w-full h-9 ps-10 pe-4 rounded-full border-2 border-supporting/20 bg-white text-dark text-xs placeholder:text-supporting/40 focus:outline-none focus:border-secondary transition-all"
            />
          </div>
        </div>

        {filteredCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-supporting/10 bg-primary/20">
                  <th className="text-left text-[10px] font-bold text-supporting uppercase tracking-wider px-4 py-2.5">
                    ID
                  </th>
                  <th className="text-left text-[10px] font-bold text-supporting uppercase tracking-wider px-4 py-2.5">
                    Name
                  </th>
                  <th className="text-left text-[10px] font-bold text-supporting uppercase tracking-wider px-4 py-2.5 hidden md:table-cell">
                    Phone
                  </th>
                  <th className="text-left text-[10px] font-bold text-supporting uppercase tracking-wider px-4 py-2.5 hidden lg:table-cell">
                    City
                  </th>
                  <th className="text-center text-[10px] font-bold text-supporting uppercase tracking-wider px-4 py-2.5">
                    Status
                  </th>
                  <th className="text-right text-[10px] font-bold text-supporting uppercase tracking-wider px-4 py-2.5">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-supporting/5 hover:bg-primary/30 transition"
                  >
                    <td className="px-4 py-3 text-sm font-bold text-dark font-mono">
                      {c.id}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-dark truncate max-w-[200px]">
                        {c.name}
                      </p>
                      {c.company && c.company !== '—' && (
                        <p className="text-[10px] text-supporting mt-0.5 truncate max-w-[200px]">
                          {c.company}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-supporting font-mono hidden md:table-cell">
                      {c.phone}
                    </td>
                    <td className="px-4 py-3 text-xs text-supporting hidden lg:table-cell">
                      {c.city}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          c.status === 'Approved'
                            ? 'bg-green-100 text-green-700'
                            : c.status === 'Rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {c.status !== 'Approved' && (
                          <button
                            onClick={() => handleStatus(c.id, 'Approved')}
                            title="Approve"
                            className="w-7 h-7 rounded-full bg-green-50 text-green-700 border border-green-200 flex items-center justify-center cursor-pointer hover:bg-green-500 hover:text-white transition"
                          >
                            {Icons.check}
                          </button>
                        )}
                        {c.status !== 'Rejected' && (
                          <button
                            onClick={() => handleStatus(c.id, 'Rejected')}
                            title="Reject"
                            className="w-7 h-7 rounded-full bg-red-50 text-red-700 border border-red-200 flex items-center justify-center cursor-pointer hover:bg-red-500 hover:text-white transition"
                          >
                            {Icons.x}
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(c)}
                          title="Edit"
                          className="w-7 h-7 rounded-full bg-secondary text-primary flex items-center justify-center cursor-pointer hover:shadow-md transition"
                        >
                          {Icons.edit}
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          title="Delete"
                          className="w-7 h-7 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center justify-center cursor-pointer hover:bg-red-500 hover:text-white transition"
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
        ) : (
          <div className="py-16 text-center">
            <p className="text-sm text-supporting">No customers found</p>
            <p className="text-xs text-supporting mt-2">
              Add your first customer using the form above
            </p>
          </div>
        )}
      </div>
    </div>
  );
}