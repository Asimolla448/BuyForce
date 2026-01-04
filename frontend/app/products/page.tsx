'use client';

import { useEffect, useMemo, useState } from 'react';
import ProductCard, { Product } from './component/ProductCard';
import api from '../api';
import { useAuth } from '../context/AuthProvider';

const ITEMS_PER_PAGE = 8;

export default function Products() {
  const { joinedProducts } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('hot');
  const [filterOption, setFilterOption] = useState('all');

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      setLoading(true);
      try {
        const response = await api.get('/products');
        if (isMounted) setProducts(response.data);
      } catch (error) {
        console.error('שגיאה בטעינת מוצרים', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleDelete(productId: number) {
    setProducts(prev => prev.filter(p => p.id !== productId));
  }

  function handleEdit(updatedProduct: Product) {
    setProducts(prev => prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p)));
  }

  const sortedProducts = useMemo(() => {
    const productsCopy = [...products];

    if (sortOption === 'newest') {
      productsCopy.sort((a, b) => new Date(b.targetDate).getTime() - new Date(a.targetDate).getTime());
    } else if (sortOption === 'oldest') {
      productsCopy.sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());
    } else if (sortOption === 'progress') {
      productsCopy.sort((a, b) => {
        const progressA = a.joinedUsers?.length && a.targetUsersCount ? a.joinedUsers.length / a.targetUsersCount : 0;
        const progressB = b.joinedUsers?.length && b.targetUsersCount ? b.joinedUsers.length / b.targetUsersCount : 0;
        return progressB - progressA;
      });
    } else if (sortOption === 'price-desc') {
      productsCopy.sort((a, b) => b.discountedPrice - a.discountedPrice);
    } else if (sortOption === 'price-asc') {
      productsCopy.sort((a, b) => a.discountedPrice - b.discountedPrice);
    } else if (sortOption === 'hot') {
      productsCopy.sort((a, b) => (b.joinedUsers?.length || 0) - (a.joinedUsers?.length || 0));
    }

    return productsCopy;
  }, [products, sortOption]);

  const filteredProducts = useMemo(() => {
    if (filterOption === 'not-joined') {
      return sortedProducts.filter(p => !joinedProducts.some(jp => jp.id === p.id));
    }
    return sortedProducts;
  }, [sortedProducts, filterOption, joinedProducts]);

  const activeProducts = useMemo(() => filteredProducts.filter(p => p.status === 'ACTIVE'), [filteredProducts]);

  const totalPages = Math.ceil(activeProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return activeProducts.slice(startIndex, endIndex);
  }, [activeProducts, currentPage]);

  function handlePageChange(page: number) {
    setPageLoading(true);
    setCurrentPage(page);
    setTimeout(() => setPageLoading(false), 150);
  }

  if (loading) return <p className="text-center mt-20 text-gray-500">טוען מוצרים...</p>;

  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-20 mt-24 mb-24 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white rounded-xl p-4 sm:p-6 shadow-sm border gap-4 sm:gap-0">
        <h2 className="text-2xl font-bold">מוצרים</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <select
            value={sortOption}
            onChange={e => setSortOption(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="hot">הכי חמים</option>
            <option value="newest">מהישן לחדש</option>
            <option value="oldest">מהחדש לישן</option>
            <option value="progress">קרובים למטרה</option>
            <option value="price-desc">מהיקר לזול</option>
            <option value="price-asc">מהזול ליקר</option>
          </select>
          <select
            value={filterOption}
            onChange={e => setFilterOption(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">כל המוצרים</option>
            <option value="not-joined">טרם הצטרפתי</option>
          </select>
        </div>
      </div>

      {pageLoading ? (
        <p className="text-center text-gray-500">טוען עמוד...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginatedProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2 mt-8">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`px-4 py-2 border rounded ${
              currentPage === i + 1 ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
            }`}
            onClick={() => handlePageChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
