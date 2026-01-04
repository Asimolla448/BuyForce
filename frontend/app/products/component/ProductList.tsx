"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard, { Product } from "./ProductCard";
import api from "../../api";
import { useRouter } from "next/navigation";

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await api.get("/products");
        setProducts(response.data);
      } catch (error) {
        console.error("שגיאה בטעינת מוצרים", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  function handleDelete(productId: number) {
    setProducts((previousProducts) => {
      return previousProducts.filter((product) => {
        return product.id !== productId;
      });
    });
  }

  function handleEdit(updatedProduct: Product) {
    setProducts((previousProducts) => {
      const updatedList: Product[] = [];

      for (let i = 0; i < previousProducts.length; i++) {
        const currentProduct = previousProducts[i];

        if (currentProduct.id === updatedProduct.id) {
          updatedList.push(updatedProduct);
        } else {
          updatedList.push(currentProduct);
        }
      }

      return updatedList;
    });
  }

  const featuredProducts = useMemo(() => {
    if (products.length === 0) {
      return [];
    }

    const activeProducts = products.filter((p) => p.status === "ACTIVE");

    const sorted = [...activeProducts];

    sorted.sort((a, b) => {
      let countA = 0;
      let countB = 0;

      if (a.joinedUsers) {
        countA = a.joinedUsers.length;
      }

      if (b.joinedUsers) {
        countB = b.joinedUsers.length;
      }

      return countB - countA;
    });

    return sorted.slice(0, 4);
  }, [products]);

  if (loading) {
    return <p className="text-center mt-10">טוען מוצרים...</p>;
  }

  return (
    <section className="max-w-7xl mx-auto px-6 mt-16 mb-16 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">🔥 מוצרים חמים</h2>

        <button
          onClick={() => router.push("/products")}
          className="px-4 py-1 rounded-lg text-sm font-semibold text-white
                       bg-linear-to-r from-blue-500 to-indigo-600
                       hover:from-indigo-600 hover:to-blue-500 transition"
        >
          הצג הכל
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))}
      </div>
    </section>
  );
}
