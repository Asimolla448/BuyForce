import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthProvider"; 
import { CategoryProvider } from "@/context/CategoryContext";
import { SearchProvider } from "@/context/SearchContext";



export default function RootLayout() {
  return (
    <AuthProvider>
      <CategoryProvider>
        <SearchProvider>
      <Stack screenOptions={{headerShown: false}}/>
      </SearchProvider>
      </CategoryProvider>
    </AuthProvider>
  );
}


