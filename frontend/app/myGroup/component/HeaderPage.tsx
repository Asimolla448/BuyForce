'use client';

import { HiUserGroup, HiCheckCircle } from "react-icons/hi";
import { useAuth } from "../../context/AuthProvider";

type TabType = "פעילות" | "סגירה בקרוב" | "מחויב" | "מוחזר" | "נכשל";

interface HeaderPageProps {
  selectedTab: TabType;
  setSelectedTab: (tab: TabType) => void;
}

export default function HeaderPage({
  selectedTab,
  setSelectedTab,
}: HeaderPageProps) {
  const { joinedProducts } = useAuth();

  const activeCount = joinedProducts.filter(p => p.status === "ACTIVE").length;
  const completedCount = joinedProducts.filter(p => p.status === "COMPLETED").length;

  const tabs: TabType[] = ["פעילות", "סגירה בקרוב", "מחויב", "מוחזר", "נכשל"];

  return (
    <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">הקבוצות שלי</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            עקוב אחרי ההתקדמות בקבוצות הרכישה שלך והיסטוריית הרכישות
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Stat icon={<HiUserGroup className="w-5 h-5 text-primary" />} text={`פעילות: ${activeCount}`} />
          <Stat icon={<HiCheckCircle className="w-5 h-5 text-success" />} text={`הושלם: ${completedCount}`} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex flex-wrap gap-2 sm:gap-3 bg-gray-50 rounded-xl p-1 border">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTab(t)}
              className={`px-4 py-2 text-sm sm:text-base font-medium rounded-lg whitespace-nowrap ${
                t === selectedTab
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="bg-white rounded-lg p-2 sm:p-3 border flex items-center gap-2">
      {icon}
      <span className="text-sm sm:text-base font-medium text-gray-700">{text}</span>
    </div>
  );
}
