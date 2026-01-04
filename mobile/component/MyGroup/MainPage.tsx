import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth, Product } from "../../context/AuthProvider";
import ProductCard from "../Products"; 
import api from "../../app/api";
import { SafeAreaView } from "react-native-safe-area-context";

interface MainPageProps {
  selectedTab: string;
}

export default function MainPage({ selectedTab }: MainPageProps) {
  const { joinedProducts: joinedPartialProducts } = useAuth();
  const [joinedFullProducts, setJoinedFullProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const numColumns = 2;      
  const spacing = 8;         
  const screenWidth = Dimensions.get("window").width;
  const cardWidth = (screenWidth - spacing * (numColumns + 1)) / numColumns;

  useEffect(() => {
    const fetchFullProducts = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        const fullProducts: Product[] = [];
        for (const p of joinedPartialProducts) {
          const res = await api.get<Product>(`/products/${p.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          fullProducts.push(res.data);
        }
        setJoinedFullProducts(fullProducts);
      } catch (err) {
        console.error("Failed to fetch full joined products", err);
        setJoinedFullProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (joinedPartialProducts.length > 0) {
      fetchFullProducts();
    } else {
      setJoinedFullProducts([]);
    }
  }, [joinedPartialProducts]);

  const filteredProducts = joinedFullProducts.filter((product) => {
    const now = new Date();
    const target = new Date(product.targetDate);

    switch (selectedTab) {
      case "פעילות":
        return product.status === "ACTIVE";
      case "סגירה בקרוב":
        const diffInMs = target.getTime() - now.getTime();
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
        return product.status === "ACTIVE" && diffInDays > 0 && diffInDays <= 3;
      case "מחויב":
        return product.status === "COMPLETED";
      case "נכשל":
        return product.status === "FAILED";
      case "מוחזר":
        return false;
      default:
        return true;
    }
  });

  const renderItem = ({ item }: { item: Product }) => (
    <View style={{ width: cardWidth, margin: spacing / 2 }}>
      <ProductCard product={item} cardWidth={cardWidth} />
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>טוען...</Text>
      </View>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyText}>אין קבוצות בקטגוריה זו</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={numColumns}
        columnWrapperStyle={{ justifyContent: "space-between", marginBottom: spacing }}
        contentContainerStyle={{ paddingHorizontal: spacing, paddingBottom: spacing * 2, paddingTop: spacing }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#4f46e5",
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
  },
});
