import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import MainLayout from '../layouts/MainLayout';

const getStoredUser = (): { email?: string } | null => {
  try {
    const rawUser = localStorage.getItem('zakhira_user');
    if (!rawUser) return null;

    const parsedUser = JSON.parse(rawUser);
    return parsedUser && typeof parsedUser === 'object' && parsedUser.email
      ? parsedUser
      : null;
  } catch {
    return null;
  }
};

const isAuthenticated = (): boolean =>
  sessionStorage.getItem('zakhira_authenticated') === 'true' &&
  Boolean(getStoredUser());

const ProtectedRoute = ({ children }: { children: React.ReactNode }): React.JSX.Element => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }): React.JSX.Element => {
  return !isAuthenticated() ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

// Dashboard
import DashboardPage from '../pages/dashboard/DashboardPage';

// Products
import ProductsPage from '../pages/products/ProductsPage';

// Sales
import InvoicePage from '../pages/sales/InvoicePage';
import RecordBookPage from '../pages/sales/RecordBookPage';
import CustomersPage from '../pages/sales/CustomersPage';

// Inventory
import InventoryPage from '../pages/inventory/InventoryPage';
import OrdersPage from '../pages/order/OrdersPage';
import InventoryVendorsPage from '../pages/vendors/VendorsPage';

// Vendors
import VendorsPage from '../pages/vendors/VendorsPage';

// Accounting
import AccountingPage from '../pages/accounting/AccountingPage';


// ✅ NEW — Reports
import WeeklyReportsPage from '../pages/reports/WeeklyReportsPage';




// 🆕 PROFILE & SETTINGS
import ProfilePage from '@renderer/pages/settings/ProfilePage';
import SettingsPage from '../pages/settings/SettingsPage';

export default function AppRoutes(): React.JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated() ? '/dashboard' : '/login'} replace />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Sales */}
        <Route path="/sales" element={<InvoicePage />} />
        <Route path="/sales/invoice" element={<InvoicePage />} />
        <Route path="/sales/records" element={<RecordBookPage />} />
        <Route path="/sales/customers" element={<CustomersPage />} />
        <Route path="/sales/add-customer" element={<Navigate to="/sales/customers" replace />} />

        {/* Products */}
        <Route path="/products" element={<ProductsPage />} />

        {/* Inventory */}
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/inventory/orders" element={<OrdersPage />} />
        <Route path="/inventory/vendors" element={<InventoryVendorsPage />} />

        {/* Vendors */}
        <Route path="/vendors" element={<VendorsPage />} />

        {/* Accounting */}
        <Route path="/accounting" element={<AccountingPage />} />
      

        {/* ✅ NEW — Reports */}
        <Route path="/reports" element={<Navigate to="/reports/weekly" replace />} />
        <Route path="/reports/weekly" element={<WeeklyReportsPage />} />

   

        {/* 🆕 PROFILE & SETTINGS */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated() ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}