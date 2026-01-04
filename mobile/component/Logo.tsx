import React from "react";
import { View, Text, StyleSheet } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";

interface LogoProps {
  iconSize?: number; 
  textSize?: number; 
  padding?: number; 
}

export default function Logo({ iconSize = 80, textSize = 50, padding = 20 }: LogoProps) {
  return (
    <View style={[styles.container, { padding }]}>
      <View style={{ flexDirection: "row", marginLeft: 10 }}>
        <FontAwesome5 name="shopping-cart" size={iconSize} color="black" />
        <Text style={[styles.title, { fontSize: textSize }]}>Buy</Text>
        <MaskedView maskElement={<Text style={[styles.title, { fontSize: textSize }]}>Force</Text>}>
          <LinearGradient
            colors={["#FF6B6B", "#FFD93D"]} 
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.title, { fontSize: textSize, opacity: 0 }]}>Force</Text>
          </LinearGradient>
        </MaskedView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontWeight: "800",
    color: "dodgerblue",
  },
});
