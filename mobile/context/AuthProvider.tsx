import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../app/api";

type Role = "USER" | "ADMIN";

export interface User {
  id: number;
  email: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

export type Product = {
  id: number;
  name: string;
  regularPrice: number;
  discountedPrice: number;
  targetUsersCount: number;
  joinedUsers?: { id: number }[];
  supplier: string;
  targetDate: string;
  mainImage: string;
  category: string;
  status: "ACTIVE" | "COMPLETED" | "FAILED";
};

export type NotificationItem = {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

interface AuthContextType {
  user: User | null;
  isAuth: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  wishlistIds: number[];
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  toggleWishlist: (productId: number) => Promise<void>;
  joinedProducts: Product[];
  refreshJoinedProducts: () => Promise<void>;
  joinProduct: (productId: number) => Promise<void>;
  notifications: NotificationItem[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuth: false,
  login: async () => {},
  logout: () => {},
  refreshUser: async () => {},
  wishlistIds: [],
  addToWishlist: async () => {},
  removeFromWishlist: async () => {},
  toggleWishlist: async () => {},
  joinedProducts: [],
  refreshJoinedProducts: async () => {},
  joinProduct: async () => {},
  notifications: [],
  unreadCount: 0,
  fetchNotifications: async () => {},
  markNotificationAsRead: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [joinedProducts, setJoinedProducts] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const refreshJoinedProducts = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;

    try {
      const res = await api.get<{ joinedSales: Product[] }>("/auth/me/join-group", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.joinedSales) setJoinedProducts(res.data.joinedSales);
    } catch (error) {
      console.error("Failed to fetch joined products", error);
      setJoinedProducts([]);
    }
  };

  const refreshWishlist = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;

    try {
      const res = await api.get<{ wishlist: Product[] }>("/auth/me/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.wishlist) {
        const ids = res.data.wishlist.map((p) => p.id);
        setWishlistIds(ids);
        await AsyncStorage.setItem("wishlist", JSON.stringify(ids));
      }
    } catch {
      setWishlistIds([]);
      await AsyncStorage.removeItem("wishlist");
    }
  };

  const joinProduct = async (productId: number) => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("עליך להתחבר כדי להצטרף");
      return;
    }

    try {
      await api.post(`/products/${productId}/join`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await refreshJoinedProducts();
      Alert.alert("הצטרפת בהצלחה למוצר!");
    } catch (error: any) {
      let message = "אירעה שגיאה בהצטרפות למוצר";
      if (error.response?.data?.message) message = error.response.data.message;
      console.error("Failed to join product:", message);
      Alert.alert("שגיאה", message);
    }
  };

  const fetchNotifications = useCallback(async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;
    try {
      const res = await api.get<{ notifications: NotificationItem[] }>("/auth/me/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.notifications) setNotifications(res.data.notifications);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
      setNotifications([]);
    }
  }, []);

  const markNotificationAsRead = async (notificationId: number) => {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;

    try {
      await api.patch(`/auth/me/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const initialize = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      try {
        const res = await api.get<User>("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        await refreshJoinedProducts();
        await refreshWishlist();
        await fetchNotifications();
      } catch {
        await AsyncStorage.removeItem("token");
        setUser(null);
        setJoinedProducts([]);
        setWishlistIds([]);
        setNotifications([]);
      }
    };
    initialize();
  }, [fetchNotifications]);

  const login = async (token: string) => {
    await AsyncStorage.setItem("token", token);
    try {
      const res = await api.get<User>("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      await refreshJoinedProducts();
      await refreshWishlist();
      await fetchNotifications();
    } catch {
      setUser(null);
      await AsyncStorage.removeItem("token");
      setJoinedProducts([]);
      setWishlistIds([]);
      setNotifications([]);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setUser(null);
    setJoinedProducts([]);
    setWishlistIds([]);
    setNotifications([]);
  };

  const refreshUser = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;
    try {
      const res = await api.get<User>("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      await refreshJoinedProducts();
      await refreshWishlist();
      await fetchNotifications();
    } catch {
      await AsyncStorage.removeItem("token");
      setUser(null);
      setJoinedProducts([]);
      setWishlistIds([]);
      setNotifications([]);
    }
  };

  const addToWishlist = async (productId: number) => {
    if (!user) return;
    const token = await AsyncStorage.getItem("token");
    try {
      await api.post(`/products/${productId}/wishlist`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newList = [...wishlistIds, productId];
      setWishlistIds(newList);
      await AsyncStorage.setItem("wishlist", JSON.stringify(newList));
    } catch (err) {
      console.error("Failed to add to wishlist", err);
    }
  };

  const removeFromWishlist = async (productId: number) => {
    if (!user) return;
    const token = await AsyncStorage.getItem("token");
    try {
      await api.delete(`/products/${productId}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newList = wishlistIds.filter((id) => id !== productId);
      setWishlistIds(newList);
      await AsyncStorage.setItem("wishlist", JSON.stringify(newList));
    } catch (err) {
      console.error("Failed to remove from wishlist", err);
    }
  };

  const toggleWishlist = async (productId: number) => {
    if (wishlistIds.includes(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuth: !!user,
        login,
        logout,
        refreshUser,
        wishlistIds,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        joinedProducts,
        refreshJoinedProducts,
        joinProduct,
        notifications,
        unreadCount,
        fetchNotifications,
        markNotificationAsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
