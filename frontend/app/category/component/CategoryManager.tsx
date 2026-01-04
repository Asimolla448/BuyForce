'use client';

import { useEffect } from "react";
import { useCategoryContext } from "../../context/CategoryContext";
import CategoryGrid from "./CategoryGrid";
import axios from "axios";

export default function CategoriesManager() {
  const { categories, updateDeals } = useCategoryContext();

  // משיכת מספר מוצרים לפי קטגוריה מהשרת
  useEffect(() => {
    async function fetchDeals() {
      try {
        const res = await axios.get("/api/products/category-count"); // מחזיר { "Electronics": 5, "Fashion": 2, ... }
        updateDeals(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchDeals();
  }, [updateDeals]);

  return (
    <div className="space-y-6">

      <CategoryGrid categories={categories} />
    </div>
  );
}
