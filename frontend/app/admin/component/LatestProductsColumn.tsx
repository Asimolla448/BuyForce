'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import api from '../../api';

type Product = {
  id: number;
  name: string;
  category: string;
  mainImage: string;
};

export default function LatestProductsColumn() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get<Product[]>('/products?sort=createdAt&order=desc&limit=5');
        setProducts(res.data.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch products', error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="space-y-3 overflow-x-auto">
      {products.length === 0 && (
        <p className="text-sm text-gray-400 text-center">
          אין מוצרים להצגה
        </p>
      )}

      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition min-w-0"
        >
          <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={product.mainImage}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 56px"
              unoptimized
            />
          </div>

          <div className="flex flex-col text-right min-w-0">
            <span className="text-sm sm:text-base font-semibold text-gray-900 truncate line-clamp-1">
              {product.name}
            </span>
            <span className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">
              {product.category}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
