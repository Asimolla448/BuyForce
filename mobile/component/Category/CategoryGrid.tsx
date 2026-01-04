import React from "react";
import { View, StyleSheet } from "react-native";
import { Category } from "./category";
import CategoryCard from "./CategoryCard";

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <View style={styles.grid}>
      {categories.map((cat) => (
        <View key={cat.id} style={styles.cardWrapper}>
          <CategoryCard category={cat} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16, 
  },
  cardWrapper: {
    margin: 8, 
  },
});
