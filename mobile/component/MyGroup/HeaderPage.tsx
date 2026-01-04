import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useAuth } from "../../context/AuthProvider";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export type TabType = "פעילות" | "סגירה בקרוב" | "מחויב" | "מוחזר" | "נכשל";

interface HeaderPageProps {
  selectedTab: TabType;
  setSelectedTab: (tab: TabType) => void;
}

export default function HeaderPage({ selectedTab, setSelectedTab }: HeaderPageProps) {
  const { joinedProducts } = useAuth();

  const activeCount = joinedProducts.filter((p) => p.status === "ACTIVE").length;
  const completedCount = joinedProducts.filter((p) => p.status === "COMPLETED").length;

  const tabs: TabType[] = ["פעילות", "סגירה בקרוב", "מחויב", "מוחזר", "נכשל"];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>הקבוצות שלי</Text>

        <View style={styles.statsContainer}>
          <Stat
            icon={<FontAwesome5 name="users" size={18} color="#4f46e5" />}
            text={`פעילות: ${activeCount}`}
          />
          <Stat
            icon={<MaterialCommunityIcons name="check-circle" size={18} color="#16a34a" />}
            text={`הושלם: ${completedCount}`}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {tabs.map((t) => {
          const isActive = t === selectedTab;
          return (
            <TouchableOpacity
              key={t}
              onPress={() => setSelectedTab(t)}
              style={[styles.tabButton, isActive && styles.activeTabButton]}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>{t}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View style={styles.stat}>
      <View style={styles.statContent}>
        {icon}
        <Text style={styles.statText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 5,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
    marginBottom: -15,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stat: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginRight: 8,
  },
  statContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
    marginLeft: 6,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: "#f3f4f6",
  },
  activeTabButton: {
    backgroundColor: "#4f46e5",
  },
  tabText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff",
  },
});
