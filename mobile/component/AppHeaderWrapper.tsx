import React, { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import MobileHeader from "./MobileHeader";

interface Props {
  children: ReactNode;
}

export default function AppHeaderWrapper({ children }: Props) {
  return (
    <View style={styles.container}>
      <MobileHeader />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  content: {
    flex: 1,
  },
});
