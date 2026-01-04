'use client';

import { useEffect, useMemo, useState } from 'react';
import ProductCard, { Product } from '../../products/component/ProductCard';
import api from '../../api';

const ITEMS_PER_PAGE = 8;

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('hot');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

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
    return () => { isMounted = false; };
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
    }
    if (sortOption === 'progress') {
      productsCopy.sort((a, b) => {
        const progressA = a.joinedUsers?.length && a.targetUsersCount ? a.joinedUsers.length / a.targetUsersCount : 0;
        const progressB = b.joinedUsers?.length && b.targetUsersCount ? b.joinedUsers.length / b.targetUsersCount : 0;
        return progressB - progressA;
      });
    }
    if (sortOption === 'price-desc') productsCopy.sort((a, b) => b.discountedPrice - a.discountedPrice);
    if (sortOption === 'price-asc') productsCopy.sort((a, b) => a.discountedPrice - b.discountedPrice);
    if (sortOption === 'best-discount') {
      productsCopy.sort((a, b) => {
        const discountA = a.regularPrice > 0 ? (a.regularPrice - a.discountedPrice) / a.regularPrice : 0;
        const discountB = b.regularPrice > 0 ? (b.regularPrice - b.discountedPrice) / b.regularPrice : 0;
        return discountB - discountA;
      });
    }
    if (sortOption === 'hot') productsCopy.sort((a, b) => (b.joinedUsers?.length || 0) - (a.joinedUsers?.length || 0));
    return productsCopy;
  }, [products, sortOption]);

  const filteredByStatus = useMemo(() => {
    let filtered = statusFilter === 'ALL' ? sortedProducts : sortedProducts.filter(p => p.status === statusFilter);
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().startsWith(lowerSearch));
    }
    return filtered;
  }, [sortedProducts, statusFilter, searchTerm]);

  const totalPages = Math.ceil(filteredByStatus.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredByStatus.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredByStatus, currentPage]);

  function handlePageChange(page: number) {
    setPageLoading(true);
    setCurrentPage(page);
    setTimeout(() => setPageLoading(false), 150);
  }

  if (loading) return <p className="text-center mt-10 text-gray-500">טוען מוצרים...</p>;

  return (
    <div className="px-4 sm:px-6 lg:px-20 mb-20 space-y-6">
      <div className="flex flex-wrap justify-between items-center bg-white rounded-xl p-4 sm:p-6 shadow-sm border gap-3">
        <h2 className="text-2xl font-bold">מוצרים</h2>

        <div className="flex flex-wrap gap-2 sm:gap-4 items-center w-full sm:w-auto">
          <input
            type="text"
            placeholder="חיפוש לפי שם מוצר..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-3 py-2 border rounded w-full sm:w-auto text-sm sm:text-base"
          />

          <select
            value={sortOption}
            onChange={e => setSortOption(e.target.value)}
            className="px-3 py-2 border rounded text-sm sm:text-base"
          >
            <option value="hot">הכי חמים</option>
            <option value="newest">מהחדש לישן</option>
            <option value="progress">קרובים למטרה</option>
            <option value="price-desc">מהיקר לזול</option>
            <option value="price-asc">מהזול ליקר</option>
            <option value="best-discount">הנחה הכי גבוהה</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded text-sm sm:text-base"
          >
            <option value="ALL">כל הסטטוסים</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </div>

      {pageLoading ? (
        <p className="text-center text-gray-500">טוען עמוד...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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

      <div className="flex flex-wrap justify-center gap-2 mt-6">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`px-3 py-1 border rounded text-sm sm:text-base ${
              currentPage === i + 1
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-800'
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
