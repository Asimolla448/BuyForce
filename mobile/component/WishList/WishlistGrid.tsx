import React from "react";
import { FlatList, View, StyleSheet } from "react-native";
import ProductCard, { Product } from "../Products";

interface WishlistGridProps {
  products: Product[];
  onRemove: (id: number) => void;
}

export default function WishlistGrid({ products, onRemove }: WishlistGridProps) {
  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.itemWrapper}>
      <ProductCard
        product={item}
        isInWishlistPage={true}
        onDelete={onRemove}
      />
    </View>
  );

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 16 }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  itemWrapper: {
    width: "48%", 
  },
});
