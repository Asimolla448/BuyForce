'use client';

import { useEffect, useState } from 'react';
import api from '../../api';

type SupplierProduct = {
  supplier: string;
  createdAt: string;
};

export default function LatestSuppliers() {
  const [suppliers, setSuppliers] = useState<SupplierProduct[]>([]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await api.get<SupplierProduct[]>('/products');

        const sorted = [...res.data].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const uniqueSuppliers = Array.from(
          new Map(
            sorted.map((item) => [item.supplier, item])
          ).values()
        ).slice(0, 5);

        setSuppliers(uniqueSuppliers);
      } catch (error) {
        console.error('Failed to fetch suppliers', error);
      }
    };

    fetchSuppliers();
  }, []);

  return (
    <div className="overflow-x-auto">
      <ul className="divide-y divide-gray-100 min-w-[250px]">
        {suppliers.map((supplier) => (
          <li
            key={supplier.supplier}
            className="py-3 flex justify-between flex-wrap"
          >
            <span className="font-medium truncate max-w-[70%] sm:max-w-[80%]">
              {supplier.supplier}
            </span>
            <span className="text-xs text-gray-400 mt-1 sm:mt-0">
              {new Date(supplier.createdAt).toLocaleDateString('he-IL')}
            </span>
          </li>
        ))}

        {suppliers.length === 0 && (
          <li className="py-3 text-center text-gray-400 text-sm">
            אין ספקים להצגה
          </li>
        )}
      </ul>
    </div>
  );
}
