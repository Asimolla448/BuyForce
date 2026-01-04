import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import {
  useCategoryContext,
  Category,
  Product,
} from "../../context/CategoryContext";
import CategoryCard from "./CategoryCard";
import CategoryGrid from "./CategoryGrid";
import api from "../../app/api";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const VISIBLE_COUNT = 6;

export default function CategoryCarousel() {
  const { categories, updateDeals, setSelectedCategory } =
    useCategoryContext();

  const [startIndex, setStartIndex] = useState(0);
  const [categoriesWithDeals, setCategoriesWithDeals] =
    useState<Category[]>([]);

  const hintAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(hintAnim, {
          toValue: 6,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(hintAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await api.get<Product[]>("/products");
        const products = res.data;

        if (!Array.isArray(products)) {
          setCategoriesWithDeals([]);
          return;
        }

        const dealsCount: Record<string, number> = {};

        products.forEach((p) => {
          if (p?.status === "ACTIVE" && p?.category) {
            dealsCount[p.category] =
              (dealsCount[p.category] || 0) + 1;
          }
        });

        updateDeals(dealsCount);

        const filtered = categories
          .map((cat) => ({
            ...cat,
            deals: dealsCount[cat.name] ?? 0,
          }))
          .filter((cat) => cat.deals > 0);

        setCategoriesWithDeals(filtered);
      } catch {
        setCategoriesWithDeals([]);
      }
    }

    fetchProducts();
  }, [categories, updateDeals]);

  const isCarousel = categoriesWithDeals.length > VISIBLE_COUNT;

  const visibleCategories = Array.from(
    { length: Math.min(VISIBLE_COUNT, categoriesWithDeals.length) },
    (_, i) =>
      categoriesWithDeals[
        (startIndex + i) % categoriesWithDeals.length
      ]
  );

  return (
    <SafeAreaView style={styles.container} >
      <Text style={styles.title}>קטגוריות</Text>

      {isCarousel ? (
        <View style={styles.carouselWrapper}>
          <View style={styles.carouselFrame}>
            <FlatList
              data={visibleCategories}
              keyExtractor={(item) =>
                `${item.id}-${startIndex}`
              }
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.flatListContent}
              renderItem={({ item, index }) => {
                const centerIndex = Math.floor(
                  visibleCategories.length / 2
                );
                const isCenter = index === centerIndex;

                return (
                  <CategoryCard
                    category={item}
                    isCenter={isCenter}
                  />
                );
              }}
            />
          </View>

          <Animated.View
            style={[
              styles.swipeHint,
              { transform: [{ translateX: hintAnim }] },
            ]}
          >
            <Text style={styles.swipeHintText}>
              החלק כדי לראות עוד קטגוריות 
            </Text>
          </Animated.View>
        </View>
      ) : (
        <CategoryGrid
          categories={categoriesWithDeals.map((cat) => ({
            ...cat,
            onClick: () => setSelectedCategory(cat.name),
          }))}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },

  carouselWrapper: {
    marginTop: 8,
  },
  carouselFrame: {
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    paddingVertical: 16,
    overflow: "hidden",
  },
  flatListContent: {
    paddingHorizontal: 40,
    gap: 14,
    alignItems: "center",
  },
  swipeHint: {
    alignItems: "center",
  },

  swipeHintText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6366f1",
    opacity: 0.9,
  },
});
