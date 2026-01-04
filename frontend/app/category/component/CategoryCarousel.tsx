"use client";

import { useEffect, useState } from "react";
import { useCategoryContext, Category, Product } from "../../context/CategoryContext";
import CategoryCard from "./CategoryCard";
import CategoryGrid from "./CategoryGrid";
import api from "../../api";

const VISIBLE_COUNT = 6;

export default function CategoryCrosul() {
  const { categories, updateDeals, setSelectedCategory } = useCategoryContext();
  const [startIndex, setStartIndex] = useState(0);

  const [categoriesWithDeals, setCategoriesWithDeals] = useState<Category[]>(categories);

  useEffect(() => {
    async function fetchProducts() {
      try {
        // השתמשנו בטיפוס Product במקום any
        const { data } = await api.get<Product[]>("/products");

        const dealsCount: Record<string, number> = {};
        data.forEach((p) => {
          if (p.status === "ACTIVE") dealsCount[p.category] = (dealsCount[p.category] || 0) + 1;
        });

        updateDeals(dealsCount);

        const filtered = categories
          .map(cat => ({ ...cat, deals: dealsCount[cat.name] ?? 0 }))
          .filter(cat => cat.deals > 0);

        setCategoriesWithDeals(filtered);
      } catch (err) {
        console.error(err);
      }
    }

    fetchProducts();
  }, [categories, updateDeals]);

  const isCarousel = categoriesWithDeals.length > VISIBLE_COUNT;

  const handleScroll = (direction: "left" | "right") => {
    if (!isCarousel) return;
    if (direction === "right") setStartIndex((prev) => (prev + VISIBLE_COUNT) % categoriesWithDeals.length);
    else setStartIndex((prev) => (prev - VISIBLE_COUNT + categoriesWithDeals.length) % categoriesWithDeals.length);
  };

  const visibleCategories = Array.from(
    { length: Math.min(VISIBLE_COUNT, categoriesWithDeals.length) },
    (_, i) => categoriesWithDeals[(startIndex + i) % categoriesWithDeals.length]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">קטגוריות</h1>

      {isCarousel ? (
        <div className="relative flex items-center">
          <button onClick={() => handleScroll("left")} className="absolute -left-10 top-1/2 -translate-y-1/2 bg-white shadow-md p-3 rounded-full z-20 hover:bg-gray-100 transition-colors duration-300">
            &#10094;
          </button>

          <div className="flex gap-6 overflow-hidden relative px-8 py-4">
            {visibleCategories.map((cat, idx) => {
              const centerIndex = Math.floor(visibleCategories.length / 2);
              const isCenter = idx === centerIndex;

              return (
                <CategoryCard
                  key={cat.id + "-" + startIndex}
                  category={cat}
                  isCenter={isCenter}
                />
              );
            })}
          </div>

          <button onClick={() => handleScroll("right")} className="absolute -right-10 top-1/2 -translate-y-1/2 bg-white shadow-md p-3 rounded-full z-20 hover:bg-gray-100 transition-colors duration-300">
            &#10095;
          </button>
        </div>
      ) : (
        <CategoryGrid
          categories={categoriesWithDeals.map(cat => ({
            ...cat,
            onClick: () => setSelectedCategory(cat.name)
          }))}
        />
      )}
    </div>
  );
}
