'use client';

import { HiOutlineClock, HiPlus, HiHeart, HiCog } from "react-icons/hi";
import Link from "next/link";
import { useAuth } from "../../context/AuthProvider";

type TabType = "פעילות" | "סגירה בקרוב" | "מחויב" | "מוחזר" | "נכשל";

interface QuickActionsGridProps {
  setSelectedTab?: (tab: TabType) => void;
}

export default function QuickActionsGrid({ setSelectedTab }: QuickActionsGridProps) {
  const { joinedProducts, wishlistIds } = useAuth();

  const closingSoonCount = joinedProducts.filter(p => p.status === "ACTIVE").length;
  const wishlistCount = wishlistIds.length;

  return (
    <div className="bg-white rounded-xl border p-4 sm:p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">פעולות מהירות</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        <Link
          href="/products"
          className="flex items-center space-x-3 sm:space-x-4 p-4 border rounded-lg hover:bg-gray-50"
        >
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <HiPlus className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-900">להצטרפות למוצרים</div>
            <div className="text-sm text-gray-600">מצא קבוצות חדשות</div>
          </div>
        </Link>

        <button
          className="flex items-center space-x-3 sm:space-x-4 p-4 border rounded-lg hover:bg-gray-50"
          onClick={() => setSelectedTab && setSelectedTab("סגירה בקרוב")}
        >
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <HiOutlineClock className="w-5 h-5 text-warning" />
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-900">סגירה בקרוב</div>
            <div className="text-sm text-gray-600">{closingSoonCount} קבוצות מסתיימות</div>
          </div>
        </button>

        <Link
          href="/wishList"
          className="flex items-center space-x-3 sm:space-x-4 p-4 border rounded-lg hover:bg-gray-50"
        >
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <HiHeart className="w-5 h-5 text-success" />
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-900">רשימת משאלות</div>
            <div className="text-sm text-gray-600">{wishlistCount} פריטים שמורים</div>
          </div>
        </Link>

        <Link
          href="/settings"
          className="flex items-center space-x-3 sm:space-x-4 p-4 border rounded-lg hover:bg-gray-50"
        >
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <HiCog className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-900">הגדרות</div>
            <div className="text-sm text-gray-600">הגדרות משתמש</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
