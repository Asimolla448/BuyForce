import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import HeaderPage, { TabType } from "../../component/MyGroup/HeaderPage";
import MainPage from "../../component/MyGroup/MainPage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthProvider";
import AppHeaderWrapper from "@/component/AppHeaderWrapper";

export default function MyGroupsPage() {
  const { isAuth } = useAuth();
  const [selectedTab, setSelectedTab] = useState<TabType>("פעילות");

  if (!isAuth) {
    return (
      <AppHeaderWrapper>
        <SafeAreaView style={styles.center}>
          <Text>עליך להתחבר כדי לראות את הקבוצות שלך</Text>
        </SafeAreaView>
      </AppHeaderWrapper>
    );
  }

  return (
    <AppHeaderWrapper>
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={styles.headerSection}>
          <HeaderPage selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
        </View>

        <View style={styles.mainContent}>
          <MainPage selectedTab={selectedTab} />
        </View>
      </SafeAreaView>
    </AppHeaderWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  mainContent: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
