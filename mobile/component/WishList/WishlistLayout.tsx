import React, { ReactNode } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";

type Filter = "all" | "almost" | "new" | "ending";

interface WishlistLayoutProps {
  children: ReactNode;
  totalItems: number;
  activeFilter: Filter;
  onFilterChange: (f: Filter) => void;
}

const FILTERS: { label: string; key: Filter }[] = [
  { label: "כל הפריטים", key: "all" },
  { label: "קרובים למטרה", key: "almost" },
  { label: "חדשים", key: "new" },
  { label: "מסתיימים בקרוב", key: "ending" },
];

export default function WishlistLayout({
  children,
  totalItems,
  activeFilter,
  onFilterChange,
}: WishlistLayoutProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>רשימת המשאלות שלי</Text>
          <Text style={styles.subtitle}>
            שמור את המוצרים האהובים עליך והצטרף כאשר תהיה מוכן
          </Text>
        </View>
        <View style={styles.statsCard}>
          <Text style={styles.statsText}>{totalItems} פריטים</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        contentContainerStyle={{ paddingHorizontal: 8 }}
      >
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterButton, isActive && styles.activeFilterButton]}
              onPress={() => onFilterChange(f.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, isActive && styles.activeFilterText]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  statsCard: {
    backgroundColor: "#f3f4f6",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  statsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4f46e5",
  },
  filters: {
    flexDirection: "row",
    marginBottom: 16,
    paddingVertical: 4,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: "transparent",
  },
  activeFilterButton: {
    backgroundColor: "#4f46e5",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  activeFilterText: {
    color: "#fff",
  },
});
