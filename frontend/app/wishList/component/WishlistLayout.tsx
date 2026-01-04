"use client";

import { ReactNode } from "react";

type Filter = "all" | "almost" | "new" | "ending";

interface WishlistLayoutProps {
  children: ReactNode;
  totalItems: number;
  activeFilter: Filter;
  onFilterChange: (f: Filter) => void;
}

const FILTERS: { label: string; key: Filter }[] = [
  { label: "כל הפריטים", key: "all" },
  { label: "קרובים למטרה", key: "almost" },
  { label: "חדשים", key: "new" },
  { label: "מסתיימים בקרוב", key: "ending" },
];

export default function WishlistLayout({ children, totalItems, activeFilter, onFilterChange }: WishlistLayoutProps) {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">רשימת המשאלות שלי</h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1 sm:mt-2">שמור את המוצרים האהובים עליך והצטרף כאשר תהיה מוכן</p>
        </div>
        <span className="text-gray-500 text-sm sm:text-base">{totalItems} פריטים</span>
      </section>

      <section className="mb-6 overflow-x-auto">
        <div className="flex gap-4 min-w-max border-b border-gray-200">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`pb-2 border-b-2 transition-all duration-200 whitespace-nowrap ${
                activeFilter === f.key
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => onFilterChange(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6">{children}</section>
    </main>
  );
}
