import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Category } from "./category";
import { useCategoryContext } from "../../context/CategoryContext";

interface CategoryCardProps {
  category: Category;
  isCenter?: boolean;
}

export default function CategoryCard({ category, isCenter = false }: CategoryCardProps) {
  const { setSelectedCategory } = useCategoryContext();

  const scale = new Animated.Value(isCenter ? 1.05 : 1);
  const opacity = new Animated.Value(isCenter ? 1 : 0.95);

  const handlePress = () => {
    setSelectedCategory(category.name);
  };

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: category.bgColor, transform: [{ scale }], opacity },
        ]}
      >
        <View style={styles.iconContainer}>
          {category.svg}
        </View>

        <Text style={styles.name}>{category.name}</Text>

        <Text style={styles.deals}>{category.deals} מוצרים</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 120, 
    height: 120, 
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4, 
  },
  iconContainer: {
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
  deals: {
    fontSize: 14,
    color: "#374151",
    marginTop: 4,
  },
});
