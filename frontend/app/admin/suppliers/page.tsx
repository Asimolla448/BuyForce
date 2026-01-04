'use client';

import { useEffect, useState } from 'react';
import api from '../../api';
import { Product } from '../../context/AuthProvider';

interface SupplierData {
  supplier: string;
  totalProducts: number;
  completed: number;
  failed: number;
  rating: number;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get<Product[]>('/products').then(res => {
      const map: Record<string, SupplierData> = {};

      res.data.forEach(p => {
        if (!map[p.supplier]) {
          map[p.supplier] = { supplier: p.supplier, totalProducts: 0, completed: 0, failed: 0, rating: 1 };
        }
        map[p.supplier].totalProducts += 1;
        if (p.status === 'COMPLETED') map[p.supplier].completed += 1;
        if (p.status === 'FAILED') map[p.supplier].failed += 1;
      });

      const suppliersArray = Object.values(map).map(s => ({
        ...s,
        rating: Math.min(5, Math.max(1, Math.round((s.completed / (s.completed + s.failed || 1)) * 5))),
      }));

      setSuppliers(suppliersArray);
    });
  }, []);

  const filteredSuppliers = suppliers.filter(s =>
    s.supplier.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6" dir="rtl">
      <h1 className="text-2xl font-semibold mb-4">ספקים</h1>

      <input
        type="text"
        placeholder="חפש ספק..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4 p-2 border rounded w-full sm:w-80 text-right"
      />

      <div className="overflow-x-auto border rounded-md shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-right">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-sm font-semibold text-gray-700">ספק</th>
              <th className="px-4 py-2 text-sm font-semibold text-gray-700">סה&quot;כ מוצרים</th>
              <th className="px-4 py-2 text-sm font-semibold text-gray-700">קבוצות הושלמו</th>
              <th className="px-4 py-2 text-sm font-semibold text-gray-700">קבוצות נכשלו</th>
              <th className="px-4 py-2 text-sm font-semibold text-gray-700">דירוג</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSuppliers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-3 text-center text-gray-500 text-sm">
                  לא נמצאו ספקים
                </td>
              </tr>
            )}
            {filteredSuppliers.map(s => (
              <tr key={s.supplier} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{s.supplier}</td>
                <td className="px-4 py-2">{s.totalProducts}</td>
                <td className="px-4 py-2">{s.completed}</td>
                <td className="px-4 py-2">{s.failed}</td>
                <td className="px-4 py-2">
                  {'★'.repeat(s.rating) + '☆'.repeat(5 - s.rating)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
