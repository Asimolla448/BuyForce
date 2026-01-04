import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";
import ProductCard, { Product as BaseProduct } from "../../component/Products";
import { useAuth } from "../../context/AuthProvider";
import api from "../api";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeaderWrapper from "@/component/AppHeaderWrapper";

export type Product = BaseProduct & {
  joinedUsers?: { id: number }[];
  mainImage: string;
};

type Filter = "all" | "almost" | "new" | "ending";
const FILTERS: { label: string; key: Filter }[] = [
  { label: "כל הפריטים", key: "all" },
  { label: "קרובים למטרה", key: "almost" },
  { label: "חדשים", key: "new" },
  { label: "מסתיימים בקרוב", key: "ending" },
];

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
        const updatedProducts = res.data.map((p: any) => ({
          ...p,
          mainImage: p.mainImage.startsWith("http")
            ? p.mainImage
            : `https://your-server.com${p.mainImage}`,
        }));
        setProducts(updatedProducts);
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

      if (filter === "almost") return progress >= 0.65 && progress < 1;
      if (filter === "new") {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return targetDate > oneWeekAgo;
      }
      if (filter === "ending") {
        const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        return targetDate <= threeDaysLater;
      }
      return true;
    });
  }, [products, filter, wishlistIds]);

  if (!isAuth) {
    return (
      <AppHeaderWrapper>
        <SafeAreaView style={styles.center}>
          <Text>עליך להתחבר כדי לראות את רשימת המשאלות שלך</Text>
        </SafeAreaView>
      </AppHeaderWrapper>
    );
  }

  return (
    <AppHeaderWrapper>
      <SafeAreaView style={styles.container}>
        <WishlistLayout
          totalItems={filteredProducts.length}
          activeFilter={filter}
          onFilterChange={setFilter}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 40 }} />
        ) : filteredProducts.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>אין פריטים להצגה</Text>
          </View>
        ) : (
          <WishlistGrid
            products={filteredProducts}
            onRemove={(id) => toggleWishlist(id)}
          />
        )}
      </SafeAreaView>
    </AppHeaderWrapper>
  );
}

function WishlistLayout({
  totalItems,
  activeFilter,
  onFilterChange,
}: {
  totalItems: number;
  activeFilter: Filter;
  onFilterChange: (filter: Filter) => void;
}) {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>רשימת המשאלות</Text>
      <Text style={styles.subtitle}>{totalItems} פריטים שמורים</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
      >
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => onFilterChange(f.key)}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const screenWidth = Dimensions.get("window").width;
const numColumns = 2;
const cardMargin = 8;
const cardWidth = (screenWidth - cardMargin * (numColumns + 1)) / numColumns;

function WishlistGrid({
  products,
  onRemove,
}: {
  products: Product[];
  onRemove: (id: number) => void;
}) {
  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id.toString()}
      numColumns={numColumns}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: cardMargin,
        paddingTop: 16,
        paddingBottom: 32,
      }}
      columnWrapperStyle={{ justifyContent: "space-between", marginBottom: cardMargin }}
      renderItem={({ item }) => (
        <View style={{ width: cardWidth, marginBottom: cardMargin }}>
          <ProductCard
            product={item}
            isInWishlistPage
            onDelete={onRemove}
            cardWidth={cardWidth}
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 16,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  filtersRow: {
    paddingTop: 12,
    gap: 10,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  filterChipActive: {
    backgroundColor: "#4f46e5",
  },
  filterChipText: {
    fontSize: 14,
    color: "#374151",
  },
  filterChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
});
