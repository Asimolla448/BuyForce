'use client';

import { useEffect, useState } from 'react';
import api from '../../api';
import { Product } from '../../context/AuthProvider';

type CategoryData = {
  category: string;
  count: number;
};

export default function TopCategories() {
  const [categories, setCategories] = useState<CategoryData[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get<Product[]>('/products');

        const map: Record<string, number> = {};
        res.data.forEach((product) => {
          map[product.category] =
            (map[product.category] || 0) + 1;
        });

        const sorted: CategoryData[] = Object.entries(map)
          .map(([category, count]) => ({
            category,
            count,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setCategories(sorted);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="overflow-x-auto">
      <ul className="divide-y divide-gray-100 min-w-[250px]">
        {categories.map((c) => (
          <li
            key={c.category}
            className="flex justify-between items-center py-3 flex-wrap"
          >
            <span className="font-medium text-gray-800 truncate max-w-[70%] sm:max-w-[80%]">
              {c.category}
            </span>
            <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-semibold mt-1 sm:mt-0">
              {c.count}
            </span>
          </li>
        ))}

        {categories.length === 0 && (
          <li className="py-6 text-center text-gray-400 text-sm">
            אין קטגוריות להצגה
          </li>
        )}
      </ul>
    </div>
  );
}
