import React from "react";
import { FontAwesome5, MaterialCommunityIcons, Entypo, Ionicons } from "@expo/vector-icons";
import { Category } from "./category";

export const initialCategories: Category[] = [
  { id: 1, name: "סמארטפונים", deals: 0, bgColor: "#DBEAFE", iconColor: "#1D4ED8", svg: <FontAwesome5 name="mobile-alt" size={24} color="#1D4ED8" /> },
  { id: 2, name: "ריהוט", deals: 0, bgColor: "#DCFCE7", iconColor: "#047857", svg: <MaterialCommunityIcons name="sofa" size={24} color="#047857" /> },
  { id: 3, name: "נסיעות", deals: 0, bgColor: "#E9D5FF", iconColor: "#7C3AED", svg: <FontAwesome5 name="plane" size={24} color="#7C3AED" /> },
  { id: 4, name: "בית וגן", deals: 0, bgColor: "#FFEDD5", iconColor: "#EA580C", svg: <Entypo name="home" size={24} color="#EA580C" /> },
  { id: 5, name: "אופנה", deals: 0, bgColor: "#FBCFE8", iconColor: "#BE185D", svg: <FontAwesome5 name="tshirt" size={24} color="#BE185D" /> },
  { id: 6, name: "ספורט וכושר", deals: 0, bgColor: "#E0FCF9", iconColor: "#0891B2", svg: <MaterialCommunityIcons name="dumbbell" size={24} color="#0891B2" /> },
  { id: 7, name: "מחשבים", deals: 0, bgColor: "#F3F4F6", iconColor: "#4B5563", svg: <FontAwesome5 name="laptop" size={24} color="#4B5563" /> },
  { id: 8, name: "צילום", deals: 0, bgColor: "#FEF9C3", iconColor: "#CA8A04", svg: <FontAwesome5 name="camera" size={24} color="#CA8A04" /> },
  { id: 9, name: "ספרים", deals: 0, bgColor: "#E0E7FF", iconColor: "#4338CA", svg: <FontAwesome5 name="book" size={24} color="#4338CA" /> },
  { id: 10, name: "רכבים", deals: 0, bgColor: "#FECACA", iconColor: "#B91C1C", svg: <FontAwesome5 name="car" size={24} color="#B91C1C" /> },
  { id: 11, name: "אופניים", deals: 0, bgColor: "#CCFBF1", iconColor: "#0D9488", svg: <FontAwesome5 name="bicycle" size={24} color="#0D9488" /> },
  { id: 12, name: "מטבח", deals: 0, bgColor: "#ECFCCB", iconColor: "#65A30D", svg: <MaterialCommunityIcons name="silverware-fork-knife" size={24} color="#65A30D" /> },
  { id: 13, name: "כדורגל", deals: 0, bgColor: "#E9D5FF", iconColor: "#7C3AED", svg: <FontAwesome5 name="futbol" size={24} color="#7C3AED" /> },
  { id: 14, name: "אמנות", deals: 0, bgColor: "#FBCFE8", iconColor: "#BE185D", svg: <FontAwesome5 name="paint-brush" size={24} color="#BE185D" /> },
  { id: 15, name: "קניות", deals: 0, bgColor: "#DBEAFE", iconColor: "#1D4ED8", svg: <FontAwesome5 name="shopping-bag" size={24} color="#1D4ED8" /> },
  { id: 16, name: "מוזיקה", deals: 0, bgColor: "#E9D5FF", iconColor: "#7C3AED", svg: <FontAwesome5 name="music" size={24} color="#7C3AED" /> },
  { id: 17, name: "גיימינג", deals: 0, bgColor: "#FFEDD5", iconColor: "#EA580C", svg: <FontAwesome5 name="gamepad" size={24} color="#EA580C" /> },
  { id: 18, name: "חיות מחמד", deals: 0, bgColor: "#CCFBF1", iconColor: "#0D9488", svg: <FontAwesome5 name="dog" size={24} color="#0D9488" /> },
  { id: 19, name: "גינון", deals: 0, bgColor: "#DCFCE7", iconColor: "#047857", svg: <FontAwesome5 name="leaf" size={24} color="#047857" /> },
  { id: 20, name: "טלוויזיות", deals: 0, bgColor: "#FEF9C3", iconColor: "#CA8A04", svg: <FontAwesome5 name="tv" size={24} color="#CA8A04" /> },
];
