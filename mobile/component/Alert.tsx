import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

interface AlertProps {
  message?: string;
  style?: ViewStyle; 
  textStyle?: TextStyle;
  type?:string;
}

export default function Alert({ message, style, textStyle, type }: AlertProps) {
  return (
    <View style={[styles.container, style]} >
      <Text style={[styles.text, textStyle]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fee2e2", 
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f87171", 
  },
  text: {
    color: "#b91c1c", 
    fontWeight: "bold",
    fontSize: 14,
  },
});
