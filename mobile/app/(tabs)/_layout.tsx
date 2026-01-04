import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";
import { useAuth } from "../../context/AuthProvider";
import Avatar from "../../component/Avatar";
import React from "react";

export default function Layout() {
  const { isAuth } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "royalblue",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
          backgroundColor: "#fff",
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <Ionicons name="home" size={30} color={color} />
            ) : (
              <Ionicons name="home-outline" size={26} color={color} />
            ),
        }}
      />

      <Tabs.Screen
        name="Categories"
        options={{
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <Ionicons name="grid" size={30} color={color} />
            ) : (
              <Ionicons name="grid-outline" size={26} color={color} />
            ),
        }}
      />

      <Tabs.Screen
        name="Wishlist"
        options={{
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <Ionicons name="list" size={30} color={color} />
            ) : (
              <Ionicons name="list-outline" size={26} color={color} />
            ),
        }}
      />

      <Tabs.Screen
        name="MyGroup"
        options={{
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <Ionicons name="people" size={30} color={color} />
            ) : (
              <Ionicons name="people-outline" size={26} color={color} />
            ),
        }}
      />

      <Tabs.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ color, focused }) =>
            isAuth ? (
              <View
                style={{
                  borderWidth: focused ? 2 : 0,
                  borderColor: "royalblue",
                  borderRadius: 20,
                  padding: 2,
                }}
              >
                <Avatar />
              </View>
            ) : focused ? (
              <Ionicons name="person" size={30} color={color} />
            ) : (
              <Ionicons name="person-outline" size={26} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}
