'use client';

import { useEffect, useMemo, useState } from "react";
import WishlistLayout from "./component/WishlistLayout";
import WishlistGrid from "./component/WishlistGrid";
import { Product } from "../products/component/ProductCard";
import api from "../api";
import { useAuth } from "../context/AuthProvider";

type Filter = "all" | "almost" | "new" | "ending";

export default function WishlistPage() {
  const { isAuth, wishlistIds, toggleWishlist } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await api.get("/products");
        setProducts(res.data);
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    if (isAuth) fetchProducts();
  }, [isAuth]);

  const filteredProducts = useMemo(() => {
    const now = new Date();

    return products.filter((product) => {
      if (!wishlistIds.includes(product.id)) return false;

      if (product.status !== "ACTIVE") return false;

      const participants = product.joinedUsers?.length ?? 0;
      const target = product.targetUsersCount;
      const progress = target > 0 ? participants / target : 0;
      const targetDate = new Date(product.targetDate);

      if (filter === "almost") {
        return progress >= 0.65 && progress < 1;
      } else if (filter === "new") {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return targetDate > oneWeekAgo;
      } else if (filter === "ending") {
        const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        return targetDate <= threeDaysLater;
      } else {
        return true;
      }
    });
  }, [products, filter, wishlistIds]);

  if (!isAuth)
    return (
      <p className="text-center mt-10">
        עליך להתחבר כדי לראות את רשימת המשאלות שלך
      </p>
    );

  return (
    <WishlistLayout
      totalItems={filteredProducts.length}
      activeFilter={filter}
      onFilterChange={setFilter}
    >
      {loading ? (
        <p className="text-center mt-10">טוען...</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500">אין פריטים להצגה</p>
      ) : (
        <WishlistGrid
          products={filteredProducts}
          onRemove={(id) => toggleWishlist(id)}
        />
      )}
    </WishlistLayout>
  );
}
