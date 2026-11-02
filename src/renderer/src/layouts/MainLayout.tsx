/* eslint-disable prettier/prettier */
/* eslint-disable react-refresh/only-export-components */

import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';

const readStoredUser = (): { language?: string } => {
  try {
    const value: unknown = JSON.parse(localStorage.getItem('zakhira_user') || '{}');
    return value && typeof value === 'object'
      ? (value as { language?: string })
      : {};
  } catch {
    return {};
  }
};

export default function MainLayout(): React.JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(
    () => localStorage.getItem('zakhira_sidebar_collapsed') === 'true'
  );

  const user = readStoredUser();
  const isRTL = user.language === 'ar' || user.language === 'ur';
  const language: 'en' | 'ar' | 'ur' | 'hi' =
    user.language === 'ar' || user.language === 'ur' || user.language === 'hi'
      ? user.language
      : 'en';

  useEffect(() => {
    localStorage.setItem(
      'zakhira_sidebar_collapsed',
      String(sidebarCollapsed)
    );
  }, [sidebarCollapsed]);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-primary">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((collapsed) => !collapsed)}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div
        className={`w-full min-w-0 min-h-screen transition-all duration-300 ${
          sidebarCollapsed
            ? 'lg:ltr:pl-20 lg:rtl:pr-20'
            : 'lg:ltr:pl-64 lg:rtl:pr-64'
        }`}
      >
        <Header
          isRTL={isRTL}
          language={language}
          onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
          isCollapsed={sidebarCollapsed}
        />


        {/* Page Content */}
        <main className="min-h-screen min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}