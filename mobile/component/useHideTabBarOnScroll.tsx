import { useRef } from "react";
import { Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const useHideTabBarOnScroll = () => {
  const scrollY = useRef(new Animated.Value(0)).current;

  const tabBarStyle = {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [0, 50],
          outputRange: [0, 100], 
          extrapolate: "clamp",
        }),
      },
    ],
  };

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  );

  return { onScroll, tabBarStyle };
};
