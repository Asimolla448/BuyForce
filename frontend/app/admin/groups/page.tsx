'use client';

import { useEffect, useState } from 'react';
import api from '../../api';
import { Product } from '../../context/AuthProvider';

export default function ActiveGroupsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get<Product[]>('/products/active').then(res => {
      const activeGroups = res.data.filter(p => (p.joinedUsers?.length || 0) > 1);
      setProducts(activeGroups);
    });
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.supplier?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6" dir="rtl">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-4">קבוצות פעילות</h1>

      <input
        type="text"
        placeholder="חפש לפי שם מוצר או ספק..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4 p-2 border rounded w-full text-right text-sm sm:text-base"
      />

      <div className="overflow-x-auto">
        <table className="min-w-[600px] border border-gray-200 rounded text-right w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 sm:px-4 py-2 text-sm sm:text-base">שם מוצר</th>
              <th className="px-3 sm:px-4 py-2 text-sm sm:text-base">ספק</th>
              <th className="px-3 sm:px-4 py-2 text-sm sm:text-base">יעד משתתפים</th>
              <th className="px-3 sm:px-4 py-2 text-sm sm:text-base">תאריך סופי</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p.id} className="border-t">
                <td className="px-3 sm:px-4 py-2 font-medium truncate max-w-[150px]">{p.name}</td>
                <td className="px-3 sm:px-4 py-2 truncate max-w-[120px]">{p.supplier}</td>
                <td className="px-3 sm:px-4 py-2">{p.targetUsersCount}</td>
                <td className="px-3 sm:px-4 py-2 whitespace-nowrap">
                  {new Date(p.targetDate).toLocaleString('he-IL', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-400 text-sm">
                  אין קבוצות פעילות להצגה
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
