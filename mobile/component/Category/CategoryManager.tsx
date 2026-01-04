import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useCategoryContext } from "../../context/CategoryContext";
import CategoryGrid from "./CategoryGrid";
import api from "../../app/api"; 

export default function CategoriesManager() {
  const { categories, updateDeals } = useCategoryContext();

  useEffect(() => {
    async function fetchDeals() {
      try {
        const { data } = await api.get<Record<string, number>>(
          "/products/category-count"
        );

        updateDeals(data);
      } catch (err) {
        console.error("Failed to fetch category deals:", err);
      }
    }

    fetchDeals();
  }, [updateDeals]);

  return (
    <View style={styles.container}>
      <CategoryGrid categories={categories} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
});
