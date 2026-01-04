'use client';

import { useAuth, Product } from '../../context/AuthProvider';
import ProductCard from '../../products/component/ProductCard';
import { useEffect, useState, useMemo } from 'react';
import api from '../../api';

interface MainPageProps {
  selectedTab: string;
}

const ITEMS_PER_PAGE = 4;

export default function MainPage({ selectedTab }: MainPageProps) {
  const { joinedProducts: joinedPartialProducts } = useAuth();
  const [joinedFullProducts, setJoinedFullProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFullProducts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;

        const fullProducts: Product[] = [];
        for (const p of joinedPartialProducts) {
          const res = await api.get<Product>(`/products/${p.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          fullProducts.push(res.data);
        }

        setJoinedFullProducts(fullProducts);
        setCurrentPage(1);
      } catch (err) {
        console.error('Failed to fetch full joined products', err);
        setJoinedFullProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (joinedPartialProducts.length > 0) {
      fetchFullProducts();
    }
  }, [joinedPartialProducts]);

  const filteredProducts = useMemo(() => {
    const now = new Date();
    return joinedFullProducts.filter((product: Product) => {
      const target = new Date(product.targetDate);
      switch (selectedTab) {
        case 'פעילות':
          return product.status === 'ACTIVE';
        case 'סגירה בקרוב':
          const diffInMs = target.getTime() - now.getTime();
          const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
          return product.status === 'ACTIVE' && diffInDays > 0 && diffInDays <= 3;
        case 'מחויב':
          return product.status === 'COMPLETED';
        case 'נכשל':
          return product.status === 'FAILED';
        case 'מוחזר':
          return false;
        default:
          return true;
      }
    });
  }, [joinedFullProducts, selectedTab]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8 space-y-8">
      {loading ? (
        <p className="text-center text-gray-500">טוען...</p>
      ) : paginatedProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
              >
                קודם
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded ${
                    page === currentPage ? 'bg-indigo-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
              >
                הבא
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-500 text-center mt-10 text-sm sm:text-base">
          אין קבוצות בקטגוריה זו
        </p>
      )}
    </section>
  );
}
