import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  Dimensions,
} from "react-native";

import { useCategoryContext } from "../../context/CategoryContext";
import ProductCard, { Product } from "../../component/Products";
import CategoryCarousel from "../../component/Category/CategoryCarousel";
import api from "../api";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeaderWrapper from "@/component/AppHeaderWrapper";

export default function Page() {
  const { selectedCategory } = useCategoryContext();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const screenWidth = Dimensions.get("window").width;
  const numColumns = 2;
  const cardMargin = 8;
  const cardWidth = (screenWidth - cardMargin * (numColumns + 1)) / numColumns;

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);

        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start();

        const res = selectedCategory
          ? await api.get<Product[]>(
              `/products/category/${encodeURIComponent(selectedCategory)}`
            )
          : await api.get<Product[]>("/products");

        const activeProducts = res.data.filter((p) => p.status === "ACTIVE");

        setTimeout(() => {
          setProducts(activeProducts);

          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();

          setLoading(false);
        }, 150);
      } catch (err) {
        console.error(err);
        setProducts([]);
        setLoading(false);
      }
    }

    fetchProducts();
  }, [selectedCategory]);

  const handleDelete = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <AppHeaderWrapper>
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <CategoryCarousel />

      {selectedCategory && (
        <Text style={styles.categoryLabel}>
          מוצרים בקטגוריה: {selectedCategory}
        </Text>
      )}

      {loading ? (
        <Text style={styles.centerText}>טוען...</Text>
      ) : products.length === 0 ? (
        <Text style={styles.centerText}>אין מוצרים להצגה</Text>
      ) : (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <FlatList
            data={products}
            keyExtractor={(item) => item.id.toString()}
            numColumns={numColumns}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={{
              justifyContent: "space-between",
              marginBottom: cardMargin,
            }}
            contentContainerStyle={{
              paddingHorizontal: cardMargin,
              paddingBottom: 32,
              paddingTop: 16,
            }}
            renderItem={({ item }) => (
              <View style={{ width: cardWidth, marginBottom: cardMargin }}>
                <ProductCard
                  product={item}
                  onDelete={handleDelete}
                  cardWidth={cardWidth}
                />
              </View>
            )}
          />
        </Animated.View>
      )}
    </SafeAreaView>
    </AppHeaderWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginHorizontal: 16,
    marginTop: 12,
    color: "#374151",
  },
  centerText: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 16,
  },
});
