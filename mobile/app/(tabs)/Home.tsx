import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  Pressable,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProductCard, { Product } from "../../component/Products";
import api from "../api";
import AppHeaderWrapper from "@/component/AppHeaderWrapper";
import { Feather, AntDesign } from "@expo/vector-icons";

type FilterOption =
  | "NEW_TO_OLD"
  | "OLD_TO_NEW"
  | "PRICE_HIGH_TO_LOW"
  | "PRICE_LOW_TO_HIGH"
  | "HOT";

const filterOptions: { label: string; value: FilterOption }[] = [
  { label: "חדש→ ישן", value: "NEW_TO_OLD" },
  { label: "ישן → חדש", value: "OLD_TO_NEW" },
  { label: "יקר → זול", value: "PRICE_HIGH_TO_LOW" },
  { label: "זול → יקר", value: "PRICE_LOW_TO_HIGH" },
  { label: "חמים", value: "HOT" },
];

const screenWidth = Dimensions.get("window").width;
const numColumns = 2;
const cardMargin = 8;
const cardWidth = (screenWidth - cardMargin * (numColumns + 1)) / numColumns;

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterOption>("NEW_TO_OLD");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await api.get<Product[]>("/products");
        setProducts(res.data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => p.status === "ACTIVE")
      .sort((a, b) => {
        switch (filter) {
          case "NEW_TO_OLD":
            return new Date(b.targetDate).getTime() - new Date(a.targetDate).getTime();
          case "OLD_TO_NEW":
            return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
          case "PRICE_HIGH_TO_LOW":
            return b.discountedPrice - a.discountedPrice;
          case "PRICE_LOW_TO_HIGH":
            return a.discountedPrice - b.discountedPrice;
          case "HOT":
            const now = new Date();
            const aHotScore =
              (a.joinedUsers?.length ?? 0) / a.targetUsersCount +
              (new Date(a.targetDate).getTime() - now.getTime() < 24 * 60 * 60 * 1000 ? 1 : 0);
            const bHotScore =
              (b.joinedUsers?.length ?? 0) / b.targetUsersCount +
              (new Date(b.targetDate).getTime() - now.getTime() < 24 * 60 * 60 * 1000 ? 1 : 0);
            return bHotScore - aHotScore;
          default:
            return 0;
        }
      });
  }, [products, filter]);

  return (
    <AppHeaderWrapper>
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <Pressable
          style={[styles.dropdownButton, dropdownOpen && styles.dropdownButtonActive]}
          onPress={() => setDropdownOpen(true)}
        >
          <Text style={styles.dropdownButtonText}>
            {filterOptions.find((f) => f.value === filter)?.label || "פילטר"}
          </Text>
          <AntDesign name={dropdownOpen ? "down" : "up"} size={18} color="#2563eb" />
        </Pressable>

        <Modal transparent visible={dropdownOpen} animationType="fade">
          <Pressable style={styles.modalOverlay} onPress={() => setDropdownOpen(false)}>
            <View style={styles.dropdown}>
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.option}
                  onPress={() => {
                    setFilter(option.value);
                    setDropdownOpen(false);
                  }}
                >
                  <Feather
                    name={filter === option.value ? "check" : "circle"}
                    size={18}
                    color={filter === option.value ? "#2563eb" : "#9ca3af"}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.optionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>

        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
          columnWrapperStyle={{ justifyContent: "space-between", marginBottom: cardMargin }}
          contentContainerStyle={{ paddingHorizontal: cardMargin, paddingBottom: 32, paddingTop: 8 }}
          renderItem={({ item }) => (
            <View style={{ width: cardWidth, marginBottom: cardMargin }}>
              <ProductCard product={item} cardWidth={cardWidth} />
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text>לא נמצאו מוצרים</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </AppHeaderWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { flex: 1 },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  dropdownButtonActive: { backgroundColor: "grey" },
  dropdownButtonText: { fontSize: 16, fontWeight: "600", color: "orange" },
  modalOverlay: { flex: 1, justifyContent: "center", paddingHorizontal: 32 },
  dropdown: {
    backgroundColor: "grey",
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  option: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 16 },
  optionText: { fontSize: 16, color: "orange" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
});
