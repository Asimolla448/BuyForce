"use client";

import { useEffect, useState } from "react";
import { useCategoryContext } from "../context/CategoryContext";
import ProductCard, { Product } from "../products/component/ProductCard";
import CategoryCarousel from "./component/CategoryCarousel";
import api from "../api";

const ITEMS_PER_PAGE = 8;

export default function Page() {
  const { selectedCategory } = useCategoryContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginatedProducts = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setFade(true);

        let res;
        if (selectedCategory) {
          res = await api.get<Product[]>(
            `/products/category/${encodeURIComponent(selectedCategory)}`
          );
        } else {
          res = await api.get<Product[]>("/products");
        }

        setTimeout(() => {
          const activeProducts = res.data.filter(p => p.status === "ACTIVE");
          setProducts(activeProducts);
          setFade(false);
          setLoading(false);
          setCurrentPage(1);
        }, 150);
      } catch (err) {
        console.error(err);
        setProducts([]);
        setFade(false);
        setLoading(false);
      }
    }

    fetchProducts();
  }, [selectedCategory]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleDelete = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
      <CategoryCarousel />

      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 sm:gap-0">
          <h2 className="text-xl sm:text-2xl font-bold">
            {selectedCategory ? `מוצרים בקטגוריה: ${selectedCategory}` : "כל המוצרים"}
          </h2>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">טוען...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500">אין מוצרים להצגה</p>
        ) : (
          <>
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 transition-all duration-300 ease-in-out transform ${
                fade ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
              }`}
            >
              {paginatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            <div className="flex flex-wrap justify-center items-center gap-2 mt-6">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 text-sm"
              >
                קודם
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1 rounded text-sm ${
                    page === currentPage ? "bg-indigo-600 text-white" : "bg-gray-200"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 text-sm"
              >
                הבא
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
