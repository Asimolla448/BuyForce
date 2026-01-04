import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import {
  AntDesign,
  Feather,
  MaterialIcons,
  FontAwesome,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthProvider";
import api from "../app/api";

export type Product = {
  category: string;
  id: number;
  name: string;
  regularPrice: number;
  discountedPrice: number;
  targetUsersCount: number;
  joinedUsers?: { id: number }[];
  targetDate: string;
  mainImage: string;
  status: "ACTIVE" | "COMPLETED" | "FAILED";
  createdAt?: string;
};

type ProductCardProps = {
  product: Product;
  onDelete?: (id: number) => void;
  isInWishlistPage?: boolean;
  cardWidth?: number;
  imageHeight?: number;
};

export default function ProductCard({
  product,
  onDelete,
  isInWishlistPage,
  cardWidth,
  imageHeight,
}: ProductCardProps) {
  const {
    user,
    isAuth,
    wishlistIds,
    toggleWishlist: toggleWishlistContext,
    joinedProducts,
  } = useAuth();
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [, forceTick] = useState(0);
  const router = useRouter();

  const updatedProduct = useMemo(() => {
    const jp = joinedProducts.find((p) => p.id === product.id);
    const participants =
      jp?.joinedUsers?.length ?? product.joinedUsers?.length ?? 0;
    const now = new Date();
    const end = new Date(product.targetDate);
    let newStatus = product.status;

    if (participants >= product.targetUsersCount && product.status !== "COMPLETED")
      newStatus = "COMPLETED";
    if (now > end && product.status === "ACTIVE") newStatus = "FAILED";

    return {
      ...product,
      status: newStatus,
      joinedUsers: jp?.joinedUsers ?? product.joinedUsers,
    };
  }, [product, joinedProducts]);

  useEffect(() => {
    if (updatedProduct.status !== product.status) {
      const token = localStorage.getItem("token");
      if (!token) return;
      api
        .patch(
          `/products/${product.id}/status`,
          { status: updatedProduct.status },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .catch((err) => console.error("Failed to update product status:", err));
    }
  }, [updatedProduct.status, product.id, product.status]);

  const {
    id,
    name,
    regularPrice,
    discountedPrice,
    targetUsersCount,
    joinedUsers,
    targetDate,
    mainImage,
    status,
    createdAt,
  } = updatedProduct;

  const participants = joinedUsers?.length ?? 0;
  const progress =
    targetUsersCount > 0
      ? Math.min(Math.round((participants / targetUsersCount) * 100), 100)
      : 0;
  const isInWishlist = isInWishlistPage || wishlistIds.includes(id);

  useEffect(() => {
    const i = setInterval(() => forceTick((v) => v + 1), 60_000);
    return () => clearInterval(i);
  }, []);

  const timeLeft = useMemo(() => {
    const now = new Date();
    const end = new Date(targetDate);
    let diff = end.getTime() - now.getTime();
    if (diff <= 0) return "נסגר";

    const minute = 1000 * 60;
    const hour = minute * 60;
    const day = hour * 24;
    const days = Math.floor(diff / day);
    if (days >= 1) return ` ${days} ימים `;
    const hours = Math.floor(diff / hour);
    diff %= hour;
    const minutes = Math.floor(diff / minute);
    return `${minutes}ש${hours}ד`;
  }, [targetDate]);

  const toggleWishlist = async () => {
    if (!isAuth || !user) return;
    setWishlistLoading(true);
    try {
      const wasInWishlist = wishlistIds.includes(id);
      await toggleWishlistContext(id);
      if (isInWishlistPage && wasInWishlist) onDelete?.(id);
    } finally {
      setWishlistLoading(false);
    }
  };

  const campaignBadge = useMemo(() => {
    if (status === "COMPLETED")
      return {
        text: "הושלם",
        color: "green",
        icon: <MaterialIcons name="check-circle" size={16} color="white" />,
      };
    if (status === "FAILED")
      return {
        text: "נכשל",
        color: "red",
        icon: <MaterialIcons name="cancel" size={16} color="white" />,
      };
    if (progress >= 80 && progress < 100)
      return {
        text: "קרוב ליעד",
        color: "orange",
        icon: <MaterialIcons name="whatshot" size={16} color="white" />,
      };
    if (createdAt && new Date(createdAt).toDateString() === new Date().toDateString())
      return {
        text: "חדש",
        color: "indigo",
        icon: <FontAwesome name="star" size={16} color="white" />,
      };
    return null;
  }, [status, progress, createdAt]);

  const formatNumber = (num: number) => num.toLocaleString("he-IL");
  const progressColor =
    status === "FAILED" ? "red" : status === "COMPLETED" ? "green" : "indigo";

  const finalCardWidth = cardWidth ?? Dimensions.get("window").width * 0.48;
  const finalImageHeight = imageHeight ?? finalCardWidth;

  return (
    <View style={[styles.card, { width: finalCardWidth }]}>
      <View style={[styles.imageContainer, { height: finalImageHeight }]}>
        <Image source={{ uri: mainImage }} style={styles.image} />
        <View style={styles.timeBadge}>
          <Feather name="clock" size={14} color="white" />
          <Text style={styles.timeText}>{timeLeft}</Text>
        </View>

        {isAuth && (
          <TouchableOpacity style={styles.wishlistButton} onPress={toggleWishlist}>
            {isInWishlist ? (
              <AntDesign name="heart" size={24} color="red" />
            ) : (
              <FontAwesome name="heart-o" size={24} color="black" />
            )}
          </TouchableOpacity>
        )}

        {campaignBadge && (
          <View style={[styles.badge, { backgroundColor: campaignBadge.color }]}>
            {campaignBadge.icon}
            <Text style={styles.badgeText}>{campaignBadge.text}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.discountedPrice}>₪{formatNumber(discountedPrice)}</Text>
          {regularPrice > discountedPrice && (
            <Text style={styles.regularPrice}>₪{formatNumber(regularPrice)}</Text>
          )}
        </View>
        <Text style={styles.participants}>
          משתתפים: {formatNumber(participants)} / {formatNumber(targetUsersCount)} ({progress}%)
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[styles.progress, { width: `${progress}%`, backgroundColor: progressColor }]}
          />
          <Text style={styles.progressText}>{progress}%</Text>
        </View>

        <TouchableOpacity
          style={styles.viewButton}
          onPress={() =>
            router.push({ pathname: "/product/[id]", params: { id: Number(id) } })
          }
        >
          <Feather name="eye" size={18} color="white" />
          <Text style={styles.viewButtonText}>צפייה במוצר</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    elevation: 3,
  },
  imageContainer: { position: "relative" },
  image: { width: "100%", height: "100%" },
  timeBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5b21b6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 16,
  },
  timeText: { color: "white", marginLeft: 4, fontSize: 10 },
  wishlistButton: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 16,
  },
  badgeText: { color: "white", marginLeft: 4, fontSize: 10 },
  content: { padding: 8, alignItems: "flex-end" },
  title: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 2,
    textAlign: "right",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
    justifyContent: "flex-end",
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "green",
    marginLeft: 4,
  },
  regularPrice: {
    textDecorationLine: "line-through",
    color: "gray",
    fontSize: 12,
  },
  participants: { fontSize: 10, color: "gray", marginBottom: 4 },
  progressBar: {
    width: "100%",
    height: 14,
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    marginBottom: 4,
    position: "relative",
    justifyContent: "center",
  },
  progress: { height: "100%", borderRadius: 8 },
  progressText: {
    position: "absolute",
    alignSelf: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 10,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
    marginTop: 4,
  },
  viewButtonText: { color: "white", fontWeight: "bold", fontSize: 12 },
});
