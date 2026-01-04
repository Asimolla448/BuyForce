'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { initialCategories } from "../category/component/categoriesList";

export interface Category {
  id: number;
  name: string;
  deals: number;
  totalProducts: number; 
  bgColor: string;
  iconColor: string;
  svg: React.ReactNode;
}

export interface Product {
  id: number;
  category: string;
  status: "ACTIVE" | "COMPLETED" | "FAILED";
}

type CategoryContextType = {
  categories: Category[];
  selectedCategory: string | null;
  setSelectedCategory: (name: string | null) => void;
  updateDeals: (dealsCount: Record<string, number>) => void;
  updateActiveDeals: (products: Product[]) => void;
  updateTotalProducts: (products: Product[]) => void;
  fetchAndUpdateDeals: () => Promise<void>;
};

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(
    initialCategories.map(cat => ({ ...cat, deals: 0, totalProducts: 0 }))
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const updateDeals = (dealsCount: Record<string, number>) => {
    setCategories(prev =>
      prev.map(cat => ({
        ...cat,
        deals: dealsCount[cat.name] ?? cat.deals,
      }))
    );
  };

  const updateActiveDeals = (products: Product[]) => {
    const activeCounts: Record<string, number> = {};
    products.forEach(p => {
      if (p.status === "ACTIVE") {
        activeCounts[p.category] = (activeCounts[p.category] || 0) + 1;
      }
    });

    setCategories(prev =>
      prev.map(cat => ({
        ...cat,
        deals: activeCounts[cat.name] ?? 0,
      }))
    );
  };

  const updateTotalProducts = (products: Product[]) => {
    const totalCounts: Record<string, number> = {};
    products.forEach(p => {
      totalCounts[p.category] = (totalCounts[p.category] || 0) + 1;
    });

    setCategories(prev =>
      prev.map(cat => ({
        ...cat,
        totalProducts: totalCounts[cat.name] ?? 0,
      }))
    );
  };

  const fetchAndUpdateDeals = useCallback(async () => {
    try {
      const res = await fetch("/api/products"); 
      const products: Product[] = await res.json();

      updateActiveDeals(products);
      updateTotalProducts(products); 
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  }, []);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        selectedCategory,
        setSelectedCategory,
        updateDeals,
        updateActiveDeals,
        updateTotalProducts,
        fetchAndUpdateDeals
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export const useCategoryContext = () => {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error("useCategoryContext must be used within CategoryProvider");
  return ctx;
};
