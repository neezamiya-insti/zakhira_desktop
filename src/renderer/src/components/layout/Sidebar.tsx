/* eslint-disable react-refresh/only-export-components */
/* eslint-disable prettier/prettier */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import bgImage from './bg.png';

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
// 🌿 BACKGROUND IMAGE
// ============================================================
const LEAVES_BG_URL: string | null = bgImage || null;

// ============================================================
// SVG ICONS (Balanced sizes)
// ============================================================
const Icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  sales: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  inventory: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.3 7 12 12l8.7-5M12 22V12" />
    </svg>
  ),
  accounting: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8M8 10h8M8 14h4M8 18h8" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  // ✅ Profile icon (person)
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  record: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  ),
  addCustomer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6M22 11h-6" />
    </svg>
  ),
  vendor: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" />
      <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01M16 13v.01M16 16v.01M16 19v.01" />
    </svg>
  ),
  image: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  ),
  report: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M9 13h6M9 17h6M9 9h2" />
    </svg>
  ),
};

// ============================================================
// TYPES
// ============================================================
type SubMenuItem = {
  id: string;
  label: string;
  labelUr: string;
  labelAr: string;
  labelHi: string;
  path: string;
  icon: React.ReactNode;
};

type MenuItem = {
  id: string;
  label: string;
  labelUr: string;
  labelAr: string;
  labelHi: string;
  icon: React.ReactNode;
  path: string;
  children?: SubMenuItem[];
};

// ============================================================
// MENU ITEMS  (Profile removed — only bottom user card redirects)
// ============================================================
const MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    labelUr: 'ڈیش بورڈ',
    labelAr: 'لوحة التحكم',
    labelHi: 'डैशबोर्ड',
    icon: Icons.dashboard,
    path: '/dashboard',
  },
  {
    id: 'sales',
    label: 'Sales',
    labelUr: 'فروخت',
    labelAr: 'المبيعات',
    labelHi: 'बिक्री',
    icon: Icons.sales,
    path: '/sales',
    children: [
      {
        id: 'sales-record-book',
        label: 'Record Book',
        labelUr: 'ریکارڈ بک',
        labelAr: 'سجل المعاملات',
        labelHi: 'रिकॉर्ड बुक',
        path: '/sales/records',
        icon: Icons.record,
      },
      {
        id: 'sales-customers',
        label: 'Customers',
        labelUr: 'کسٹمرز',
        labelAr: 'العملاء',
        labelHi: 'ग्राहक',
        path: '/sales/customers',
        icon: Icons.addCustomer,
      },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    labelUr: 'انوینٹری',
    labelAr: 'المخزون',
    labelHi: 'इन्वेंटरी',
    icon: Icons.inventory,
    path: '/inventory',
    children: [
      {
        id: 'inventory-orders',
        label: 'Orders',
        labelUr: 'آرڈرز',
        labelAr: 'الطلبات',
        labelHi: 'ऑर्डर',
        path: '/inventory/orders',
        icon: Icons.record,
      },
      {
        id: 'inventory-vendors',
        label: 'Vendors',
        labelUr: 'وینڈرز',
        labelAr: 'الموردون',
        labelHi: 'विक्रेता',
        path: '/inventory/vendors',
        icon: Icons.vendor,
      },
    ],
  },
  {
    id: 'accounting',
    label: 'Accounting',
    labelUr: 'حسابداری',
    labelAr: 'المحاسبة',
    labelHi: 'लेखांकन',
    icon: Icons.accounting,
    path: '/accounting',
    children: [
      {
        id: 'accounting-reports',
        label: 'Reports',
        labelUr: 'رپورٹس',
        labelAr: 'التقارير',
        labelHi: 'रिपोर्ट',
        path: '/reports/weekly',
        icon: Icons.report,
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    labelUr: 'ترتیبات',
    labelAr: 'الإعدادات',
    labelHi: 'सेटिंग्स',
    icon: Icons.settings,
    path: '/settings',
  },
];

// ============================================================
// PROPS
// ============================================================
type SidebarProps = {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function Sidebar({
  isOpen,
  isCollapsed,
  onClose,
}: SidebarProps): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem('zakhira_user') || '{}');
  const language: 'en' | 'ar' | 'ur' | 'hi' = user.language || 'en';
  const isRTL: boolean = language === 'ar' || language === 'ur';

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // 🌿 Background image missing popup
  const [showBgWarning, setShowBgWarning] = useState<boolean>(
    () => !LEAVES_BG_URL
  );

  // Auto-hide warning after 10 seconds
  useEffect(() => {
    if (!showBgWarning) return;
    const t = setTimeout(() => setShowBgWarning(false), 10000);
    return () => clearTimeout(t);
  }, [showBgWarning]);

  const getLabel = (item: MenuItem | SubMenuItem): string => {
    if (language === 'ur') return item.labelUr;
    if (language === 'ar') return item.labelAr;
    if (language === 'hi') return item.labelHi;
    return item.label;
  };

  const handleNavigate = (path: string): void => {
    navigate(path);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleLogout = (): void => {
    sessionStorage.removeItem('zakhira_authenticated');
    localStorage.removeItem('zakhira_user');
    navigate('/login', { replace: true });
    onClose();
  };

  const isActive = (path: string): boolean => {
    if (path === '/sales') {
      return location.pathname === '/sales' || location.pathname === '/sales/';
    }
    return (
      location.pathname === path || location.pathname.startsWith(path + '/')
    );
  };

  const isParentActive = (item: MenuItem): boolean => {
    if (!item.children) return isActive(item.path);
    return isActive(item.path) || item.children.some((child) => isActive(child.path));
  };

  const toggleDropdown = (itemId: string): void => {
    setOpenDropdown((prev) => (prev === itemId ? null : itemId));
  };

  // Auto-expand the dropdown whose child is active
  useEffect(() => {
    const activeParent = MENU_ITEMS.find(
      (item) =>
        item.children &&
        item.children.some((child) =>
          location.pathname === child.path ||
          location.pathname.startsWith(child.path + '/')
        )
    );
    if (activeParent && openDropdown !== activeParent.id) {
      setOpenDropdown(activeParent.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // ✅ profile page active state
  const profileActive = isActive('/profile');

  return (
    <>
      {/* 🌿 BACKGROUND IMAGE MISSING — POPUP */}
      {showBgWarning && (
        <div
          dir={isRTL ? 'rtl' : 'ltr'}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(18, 60, 50, 0.5)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowBgWarning(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="bg-warning-title"
            className="w-full max-w-md rounded-2xl p-5 shadow-2xl relative"
            style={{
              background: THEME.warmIvory,
              border: `2px solid ${THEME.warmBrass}40`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{
                background: 'rgba(196,154,90,0.15)',
                color: THEME.warmBrass,
              }}
            >
              {Icons.image}
            </div>

            <h3
              id="bg-warning-title"
              className="text-sm font-bold text-center mb-1.5"
              style={{ color: THEME.deepForest }}
            >
              Background Image Missing
            </h3>

            <p
              className="text-[13px] text-center leading-relaxed mb-3"
              style={{ color: THEME.mutedOlive }}
            >
              Sidebar ki background image nahi mil rahi. Please yeh file
              add karo:
            </p>

            <div
              className="rounded-xl p-2.5 mb-3 font-mono text-[11px] break-all"
              style={{
                background: 'rgba(18,60,50,0.06)',
                border: `1px dashed ${THEME.mutedOlive}40`,
                color: THEME.charcoal,
              }}
            >
              render/src/components/layout/<b>bg.png</b>
            </div>

            <div
              className="text-[10px] leading-relaxed mb-4 p-2.5 rounded-xl"
              style={{
                background: 'rgba(196,154,90,0.08)',
                color: THEME.mutedOlive,
              }}
            >
              <p className="font-bold mb-1" style={{ color: THEME.deepForest }}>
                📌 Kaise fix karein:
              </p>
              <ol className="list-decimal ms-3.5 space-y-0.5">
                <li>Koi bhi high-quality leaves/tree image download karo</li>
                <li>
                  Rename karke <b>bg.png</b> karo
                </li>
                <li>Upar wale exact path me rakh do</li>
                <li>App restart karo (ya reload)</li>
              </ol>
            </div>

            <button
              type="button"
              onClick={() => setShowBgWarning(false)}
              className="w-full h-9 rounded-full font-bold text-[13px] cursor-pointer transition"
              style={{
                background: THEME.warmBrass,
                color: THEME.warmIvory,
                boxShadow: '0 4px 12px rgba(196,154,90,0.35)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(0.95)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'brightness(1)';
              }}
            >
              Samajh gaya, band karo
            </button>
          </div>
        </div>
      )}

      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 lg:hidden cursor-pointer"
          style={{ background: `${THEME.charcoal}80`, backdropFilter: 'blur(4px)' }}
        />
      )}

      {/* SIDEBAR */}
      <aside
        dir={isRTL ? 'rtl' : 'ltr'}
        className={`fixed top-0 ${
          isRTL ? 'right-0' : 'left-0'
        } h-full ${
          isCollapsed ? 'w-64 lg:w-20' : 'w-64'
        } z-50 flex flex-col transition-all duration-300 ease-out overflow-hidden ${
          isOpen
            ? 'translate-x-0'
            : isRTL
              ? 'translate-x-full lg:translate-x-0'
              : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          background: THEME.deepForest,
          boxShadow: '4px 0 24px -4px rgba(18, 60, 50, 0.35)',
        }}
      >
        {/* 🌿 BACKGROUND IMAGE LAYER — FULL CLEAR */}
        {LEAVES_BG_URL && (
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(${LEAVES_BG_URL})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        )}

        {/* 🌿 DARK OVERLAY — halka (text readability ke liye) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(18,60,50,0.5) 0%, rgba(18,60,50,0.3) 50%, rgba(18,60,50,0.6) 100%)',
          }}
        />

        {/* ====== CONTENT ====== */}
        <div className="relative z-10 flex flex-col h-full">
          {/* LOGO / BRANDING */}
          <div
            className={`px-5 py-5 flex items-center ${
              isCollapsed ? 'lg:justify-center' : 'justify-between'
            } flex-shrink-0`}
            style={{ borderBottom: `1px solid ${THEME.warmIvory}15` }}
          >
            <button
              onClick={() => handleNavigate('/dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
              title={isCollapsed ? 'Dashboard' : undefined}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                style={{
                  background: THEME.warmBrass,
                  color: THEME.deepForest,
                  boxShadow:
                    'inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.2), 0 4px 12px rgba(196,154,90,0.35)',
                }}
              >
                Z
              </div>
              <div className={isCollapsed ? 'lg:hidden text-start' : 'text-start'}>
                <h1
                  className="text-base font-black leading-none"
                  style={{ letterSpacing: '0.12em', color: THEME.warmIvory }}
                >
                  ZAKHIRA
                </h1>
                <p
                  className="text-[9px] tracking-[0.18em] uppercase mt-1"
                  style={{ color: `${THEME.warmIvory}80` }}
                >
                  Business System
                </p>
              </div>
            </button>

            <button
              onClick={onClose}
              className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition"
              style={{ background: `${THEME.warmIvory}15`, color: THEME.warmIvory }}
              aria-label="Close sidebar"
            >
              {Icons.close}
            </button>
          </div>

          {/* NAVIGATION */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 sidebar-scroll">
            <p
              className={`px-3 mb-3 text-[10px] font-bold uppercase tracking-[0.15em] ${
                isCollapsed ? 'lg:hidden' : ''
              }`}
              style={{ color: `${THEME.warmIvory}50` }}
            >
              {language === 'ur'
                ? 'مینو'
                : language === 'ar'
                  ? 'القائمة'
                  : language === 'hi'
                    ? 'मेनू'
                    : 'Menu'}
            </p>

            <div className="space-y-1.5">
              {MENU_ITEMS.map((item: MenuItem) => {
                const hasChildren = !!item.children && item.children.length > 0;
                const parentActive = isParentActive(item);
                const isExpanded = openDropdown === item.id;

                return (
                  <div key={item.id} className="relative">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleNavigate(item.path)}
                        title={isCollapsed ? getLabel(item) : undefined}
                        className={`group relative flex-1 flex items-center gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-200`}
                        style={
                          parentActive
                            ? {
                                background: THEME.warmBrass,
                                color: THEME.warmIvory,
                                boxShadow:
                                  'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 12px rgba(196,154,90,0.3)',
                              }
                            : {
                                color: `${THEME.warmIvory}90`,
                              }
                        }
                        onMouseEnter={(e) => {
                          if (!parentActive) {
                            e.currentTarget.style.background = `${THEME.warmIvory}12`;
                            e.currentTarget.style.color = THEME.warmIvory;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!parentActive) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = `${THEME.warmIvory}90`;
                          }
                        }}
                      >
                        <span
                          className="flex items-center justify-center flex-shrink-0 transition-all duration-200"
                          style={{
                            color: parentActive
                              ? THEME.warmIvory
                              : `${THEME.warmIvory}70`,
                          }}
                        >
                          {item.icon}
                        </span>

                        <span
                          className={`flex-1 text-start text-sm ${
                            parentActive ? 'font-bold' : 'font-medium'
                          } ${isCollapsed ? 'lg:hidden' : ''}`}
                        >
                          {getLabel(item)}
                        </span>

                        {parentActive && !hasChildren && (
                          <span
                            className={`absolute top-1/2 -translate-y-1/2 w-1 h-6 rounded-full ${
                              isRTL ? 'right-0' : 'left-0'
                            }`}
                            style={{ background: THEME.warmIvory }}
                          />
                        )}
                      </button>

                      {hasChildren && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(item.id);
                          }}
                          aria-label={`${
                            isExpanded ? 'Collapse' : 'Expand'
                          } ${getLabel(item)}`}
                          aria-expanded={isExpanded}
                          title={`${
                            isExpanded ? 'Collapse' : 'Expand'
                          } ${getLabel(item)}`}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all focus:outline-none cursor-pointer ${
                            isCollapsed ? 'lg:hidden' : ''
                          }`}
                          style={
                            parentActive
                              ? { color: THEME.warmIvory }
                              : { color: `${THEME.warmIvory}60` }
                          }
                        >
                          <span
                            className={`transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          >
                            {Icons.chevron}
                          </span>
                        </button>
                      )}
                    </div>

                    {hasChildren && isExpanded && (
                      <div className="mt-1.5 space-y-1 ps-4">
                        {item.children!.map((child) => {
                          const childActive = isActive(child.path);
                          return (
                            <button
                              key={child.id}
                              onClick={() => handleNavigate(child.path)}
                              className="group relative w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg cursor-pointer transition-all duration-200"
                              style={
                                childActive
                                  ? {
                                      background: `${THEME.warmIvory}20`,
                                      color: THEME.warmIvory,
                                      fontWeight: 700,
                                    }
                                  : {
                                      color: `${THEME.warmIvory}70`,
                                    }
                              }
                              onMouseEnter={(e) => {
                                if (!childActive) {
                                  e.currentTarget.style.background = `${THEME.warmIvory}10`;
                                  e.currentTarget.style.color = THEME.warmIvory;
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!childActive) {
                                  e.currentTarget.style.background = 'transparent';
                                  e.currentTarget.style.color = `${THEME.warmIvory}70`;
                                }
                              }}
                            >
                              <span
                                className="flex items-center justify-center flex-shrink-0"
                                style={{
                                  color: childActive
                                    ? THEME.warmBrass
                                    : `${THEME.warmIvory}60`,
                                }}
                              >
                                {child.icon}
                              </span>

                              <span
                                className={`flex-1 text-start text-xs ${
                                  isCollapsed ? 'lg:hidden' : ''
                                }`}
                              >
                                {getLabel(child)}
                              </span>

                              {childActive && (
                                <span
                                  className={`absolute top-1/2 -translate-y-1/2 w-1 h-5 rounded-full ${
                                    isRTL ? 'right-0' : 'left-0'
                                  }`}
                                  style={{ background: THEME.warmBrass }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>

          {/* USER PROFILE — redirects to /profile, uses profile icon */}
          <div
            className={`px-3 py-3.5 flex-shrink-0 ${isCollapsed ? 'lg:px-2' : ''}`}
            style={{ borderTop: `1px solid ${THEME.warmIvory}15` }}
          >
            <button
              onClick={() => handleNavigate('/profile')}
              title={isCollapsed ? 'Profile' : undefined}
              aria-label="Open profile"
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${
                isCollapsed ? 'lg:justify-center' : ''
              }`}
              style={{
                background: profileActive
                  ? `${THEME.warmBrass}30`
                  : `${THEME.warmIvory}08`,
                border: profileActive
                  ? `1px solid ${THEME.warmBrass}60`
                  : '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!profileActive) {
                  e.currentTarget.style.background = `${THEME.warmIvory}15`;
                }
              }}
              onMouseLeave={(e) => {
                if (!profileActive) {
                  e.currentTarget.style.background = `${THEME.warmIvory}08`;
                }
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                style={{
                  background: THEME.warmBrass,
                  color: THEME.deepForest,
                  boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.3), 0 3px 8px rgba(196,154,90,0.3)',
                }}
              >
                {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>

              <div
                className={`flex-1 min-w-0 text-start ${
                  isCollapsed ? 'lg:hidden' : ''
                }`}
              >
                <p
                  className="text-xs font-semibold truncate"
                  style={{ color: THEME.warmIvory }}
                >
                  {user.email ? user.email.split('@')[0] : 'User'}
                </p>
                <p
                  className="text-[9px] uppercase tracking-wider truncate mt-0.5"
                  style={{
                    color: profileActive
                      ? THEME.warmBrass
                      : `${THEME.warmIvory}60`,
                  }}
                >
                  {user.role || 'owner'}
                </p>
              </div>

              {/* ✅ Profile icon (person) instead of settings gear */}
              <span
                className="transition flex items-center flex-shrink-0"
                style={{
                  color: profileActive
                    ? THEME.warmBrass
                    : `${THEME.warmIvory}50`,
                }}
              >
                {Icons.profile}
              </span>
            </button>
          </div>

          {/* FOOTER */}
          <div
            className="space-y-2.5 px-3 py-3 flex-shrink-0"
            style={{ borderTop: `1px solid ${THEME.warmIvory}15` }}
          >
            <button
              onClick={handleLogout}
              title={isCollapsed ? 'Logout' : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2 transition-colors ${
                isCollapsed ? 'lg:justify-center' : ''
              }`}
              style={{ color: `${THEME.warmIvory}80` }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(196, 154, 90, 0.15)';
                e.currentTarget.style.color = THEME.warmBrass;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = `${THEME.warmIvory}80`;
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 flex-shrink-0"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5M21 12H9" />
              </svg>
              <span
                className={`text-sm font-medium ${
                  isCollapsed ? 'lg:hidden' : ''
                }`}
              >
                {language === 'ur'
                  ? 'لاگ آؤٹ'
                  : language === 'ar'
                    ? 'تسجيل الخروج'
                    : language === 'hi'
                      ? 'लॉग आउट'
                      : 'Logout'}
              </span>
            </button>
            <div
              className={`flex items-center justify-between text-[9px] ${
                isCollapsed ? 'lg:hidden' : ''
              }`}
              style={{ color: `${THEME.warmIvory}50` }}
            >
              <span className="font-medium">v1.0.0</span>
              <span className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: THEME.warmBrass }}
                />
                <span className="font-medium">Online</span>
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}