"use client";

import TopCategories from "./component/TopCategories";
import StatsSection from "./component/StatsSection";
import LatestSuppliers from "./component/LatestSuppliers";
import LatestProductsColumn from "./component/LatestProductsColumn";
import LatestNotifications from "./component/LatestNotifications";
import LatestGroups from "./component/LatestGroups";
import Link from "next/link";

export default function AdminDashboardPage() {
  const middleSections = [
    {
      title: "מוצרים אחרונים",
      component: <LatestProductsColumn />,
      link: "/admin/products",
    },
    {
      title: "התראות אחרונות",
      component: <LatestNotifications />,
      link: "/admin/messages",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full max-w-7xl space-y-8">
        <div className="text-center lg:text-right">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            דשבורד ניהול
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            סקירה כללית של פעילות המערכת
          </p>
        </div>

        <StatsSection />

        <DashboardCard title="קטגוריות מובילות">
          <TopCategories />
        </DashboardCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {middleSections.map((section) => (
            <DashboardCard
              key={section.title}
              title={section.title}
              link={section.link}
              className="w-full h-full"
            >
              {section.component}
            </DashboardCard>
          ))}
        </div>

        <DashboardCard title="קבוצות אחרונות" link="/admin/groups">
          <LatestGroups />
        </DashboardCard>

        <DashboardCard title="ספקים אחרונים" link="/admin/suppliers">
          <LatestSuppliers />
        </DashboardCard>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  link,
  children,
  className,
}: {
  title: string;
  link?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 ${className || ""}`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4">
        <h2 className="text-md sm:text-lg font-bold text-gray-900 mb-2 sm:mb-0">{title}</h2>
        {link && (
          <Link
            href={link}
            className="px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold text-white
                       bg-linear-to-r from-blue-500 to-indigo-600
                       hover:from-indigo-600 hover:to-blue-500 transition"
          >
            הצג הכל
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}
