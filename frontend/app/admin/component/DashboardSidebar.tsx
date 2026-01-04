'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaChartLine,
  FaUsers,
  FaTruck,
  FaMoneyBillWave,
  FaUserFriends,
  FaEnvelope,
  FaCog,
  FaSignOutAlt,
  FaBoxes,
} from "react-icons/fa";
import Avater from "@/app/component/Header/Avater";
import { useAuth } from "@/app/context/AuthProvider";

const navItems = [
  { label: "דשבורד", href: "/admin/", icon: FaChartLine },
  { label: "קבוצות", href: "/admin/groups", icon: FaUsers },
  { label: "ספקים", href: "/admin/suppliers", icon: FaTruck },
  { label: "מוצרים", href: "/admin/products", icon: FaBoxes },
  { label: "תשלומים", href: "/admin/payments", icon: FaMoneyBillWave },
  { label: "משתמשים", href: "/admin/users", icon: FaUserFriends },
  { label: "הודעות", href: "/admin/messages", icon: FaEnvelope },
  { label: "הגדרות", href: "/settings", icon: FaCog },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, unreadCount } = useAuth();

  const displayName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "אדמין";
  const role = user?.role;


  const handleLogout = () => {
    logout();
    router.push("/"); 
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r shadow-md flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-gray-200 font-semibold text-lg">
        Admin Panel
      </div>

      <nav className="flex-1 px-4 py-5 space-y-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm font-medium transition
                ${
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={18}
                  className={`${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600"}`}
                />
                <span className={`${isActive ? "text-blue-600" : ""}`}>{item.label}</span>
              </div>

              {item.label === "הודעות" && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4 space-y-2">
        <div className="flex items-center justify-end gap-3">
          <div className="flex flex-col text-right leading-tight">
            <span className="text-sm font-semibold text-gray-800">{displayName}</span>
            <span className="text-xs text-gray-500">{role}</span>
          </div>

          <Avater/>
        </div>

        <button
          onClick={handleLogout}
          className="mt-2 flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 w-full px-3 py-2 rounded-md transition"
        >
          <FaSignOutAlt size={16} />
          התנתקות
        </button>
      </div>
    </aside>
  );
}
