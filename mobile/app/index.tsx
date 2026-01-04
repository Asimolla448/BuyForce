import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, StatusBar } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Logo from "../component/Logo";
import { LinearGradient } from "expo-linear-gradient"; 

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      setTimeout(() => {
        router.replace("/(tabs)/Home");
      }, 1500);
    };
    checkAuth();
  }, []);

  return (
    <LinearGradient
      colors={["dodgerblue", "darkviolet"]} 
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle={"light-content"} backgroundColor={"transparent"} translucent />
      <Animated.View
        entering={FadeInDown.duration(700).springify()}
        style={styles.logoContainer}
      >
        <Logo />
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});
