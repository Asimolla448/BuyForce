'use client';

import { ReactNode, useState } from 'react';
import DashboardSidebar from './component/DashboardSidebar';
import AdminHeader from './component/AdminHeader';
import { FaBars } from 'react-icons/fa';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AdminHeader>
        <button
          className="p-2 focus:outline-none"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <FaBars size={20} />
        </button>
      </AdminHeader>

      <div className="flex flex-1 relative">
        <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-64 shrink-0`}>
          <DashboardSidebar />
        </div>

        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div
              className="fixed inset-0 bg-black opacity-50"
              onClick={() => setSidebarOpen(false)}
            ></div>
            <div className="relative w-64 bg-white shadow-lg">
              <DashboardSidebar />
            </div>
          </div>
        )}

        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
