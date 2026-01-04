'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";
import api from "../api";

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

const ScrollToTopOnNavigation = () => {
  const pathname = usePathname();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [joinedProducts, setJoinedProducts] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // ======================
  // רענון רשימת מוצרים שהמשתמש הצטרף אליהם
  // ======================
  const refreshJoinedProducts = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await api.get<{ joinedSales: Product[] }>(
        "/auth/me/join-group",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.joinedSales) setJoinedProducts(res.data.joinedSales);
    } catch (error) {
      console.error("Failed to fetch joined products", error);
      setJoinedProducts([]);
    }
  };

  // ======================
  // רענון רשימת Wishlist מהשרת
  // ======================
  const refreshWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await api.get<{ wishlist: Product[] }>("/auth/me/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.wishlist) {
        const ids = res.data.wishlist.map((p) => p.id);
        setWishlistIds(ids);
        localStorage.setItem("wishlist", JSON.stringify(ids));
      }
    } catch {
      setWishlistIds([]);
      localStorage.removeItem("wishlist");
    }
  };

  // ======================
  // הצטרפות למוצר (כמו Wishlist)
  // ======================
  const joinProduct = async (productId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("עליך להתחבר כדי להצטרף");
      return;
    }

    try {
      // POST לשרת
      await api.post(`/products/${productId}/join`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // עדכון רשימת joinedProducts מיד
      setJoinedProducts((prev) => {
        // אם המוצר כבר קיים, לא משנה
        const exists = prev.find(p => p.id === productId);
        if (exists) return prev;

        // מביא את המוצר מהשרת (refreshJoinedProducts) או מוסיף זמנית
        const newProduct: Product = {
          id: productId,
          name: "",
          regularPrice: 0,
          discountedPrice: 0,
          targetUsersCount: 0,
          joinedUsers: [{ id: user!.id }],
          supplier: "",
          targetDate: new Date().toISOString(),
          mainImage: "",
          category: "",
          status: "ACTIVE",
        };
        return [...prev, newProduct];
      });

      // ריענון רשימת המשתתפים מהמוצר מהשרת
      await refreshJoinedProducts();

      alert("הצטרפת בהצלחה למוצר!");
    } catch (error: unknown) {
      let message = "אירעה שגיאה בהצטרפות למוצר";
      if (typeof error === "object" && error !== null && "response" in error) {
        const errResponse = error as {
          response?: { data?: { message?: string } };
        };
        if (errResponse.response?.data?.message)
          message = errResponse.response.data.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      console.error("Failed to join product:", message);
      alert(`שגיאה: ${message}`);
    }
  };

  // ======================
  // ====================== התראות
  // ======================
  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");
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
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await api.patch(
        `/auth/me/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  useEffect(() => {
  const interval = setInterval(() => {
    fetchNotifications();
  }, 5000); // כל 5 שניות

  return () => clearInterval(interval);
}, [fetchNotifications]);

  // ======================
  // אתחול משתמש
  // ======================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initialize = async () => {
      const token = localStorage.getItem("token");
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
        localStorage.removeItem("token");
        setUser(null);
        setJoinedProducts([]);
        setWishlistIds([]);
        setNotifications([]);
      }
    };

    initialize();
  }, [fetchNotifications]);

  // ======================
  // פונקציות התחברות / התנתקות
  // ======================
  const login = async (token: string) => {
    localStorage.setItem("token", token);
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
      localStorage.removeItem("token");
      setJoinedProducts([]);
      setWishlistIds([]);
      setNotifications([]);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setJoinedProducts([]);
    setWishlistIds([]);
    setNotifications([]);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem("token");
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
      localStorage.removeItem("token");
      setUser(null);
      setJoinedProducts([]);
      setWishlistIds([]);
      setNotifications([]);
    }
  };

  // ======================
  // Wishlist
  // ======================
  const addToWishlist = async (productId: number) => {
    if (!user) return;
    const token = localStorage.getItem("token");
    try {
      await api.post(
        `/products/${productId}/wishlist`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newList = [...wishlistIds, productId];
      setWishlistIds(newList);
      localStorage.setItem("wishlist", JSON.stringify(newList));
    } catch (err) {
      console.error("Failed to add to wishlist", err);
    }
  };

  const removeFromWishlist = async (productId: number) => {
    if (!user) return;
    const token = localStorage.getItem("token");
    try {
      await api.delete(`/products/${productId}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newList = wishlistIds.filter((id) => id !== productId);
      setWishlistIds(newList);
      localStorage.setItem("wishlist", JSON.stringify(newList));
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
      <ScrollToTopOnNavigation />
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
