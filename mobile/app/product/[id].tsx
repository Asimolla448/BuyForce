'use client';

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import api from "../api";
import Checkout from "../../component/Checkout";
import { useAuth } from "../../context/AuthProvider";
import { SafeAreaView } from "react-native-safe-area-context";

export type Product = {
  id: number;
  name: string;
  regularPrice: number;
  discountedPrice: number;
  targetUsersCount: number;
  joinedUsers: { id: number }[];
  wishlistUsers?: { id: number }[];
  targetDate: string;
  supplier: string;
  status: "ACTIVE" | "COMPLETED" | "FAILED";
  category: string;
  mainImage: string;
  images?: string[];
  videos?: string[];
  content?: string;
};

export default function ProductPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { joinedProducts, isAuth, joinProduct } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainMedia, setMainMedia] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [authPopup, setAuthPopup] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const res = await api.get<Product>(`/products/${id}`);
        setProduct(res.data);
        setMainMedia(res.data.mainImage);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color="#5b21b6" />
        <Text>טוען מוצר...</Text>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.loader}>
        <Text>מוצר לא נמצא</Text>
      </SafeAreaView>
    );
  }

  const userJoined = joinedProducts.some(p => p.id === product.id);

  const handleJoin = () => {
    if (!isAuth) setAuthPopup(true);
    else setCheckoutOpen(true);
  };

  const handlePaymentSuccess = async () => {
    await joinProduct(product.id);
    setCheckoutOpen(false);
    alert("הצטרפת בהצלחה 🎉");
  };

  const formatNumber = (num: number) => num.toLocaleString("he-IL");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← חזרה</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{product.name}</Text>

      <Image
        source={{ uri: mainMedia! }}
        style={styles.mainImage}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[product.mainImage, ...(product.images || [])].map((img, i) => (
          <TouchableOpacity key={i} onPress={() => setMainMedia(img)}>
            <Image source={{ uri: img }} style={styles.thumb} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.price}>
        ₪{formatNumber(product.discountedPrice)}
        {product.discountedPrice < product.regularPrice && (
          <Text style={styles.regularPrice}>
            {" "}₪{formatNumber(product.regularPrice)}
          </Text>
        )}
      </Text>

      <View style={styles.infoBox}>
        <Text>משתתפים: {product.joinedUsers.length} / {product.targetUsersCount}</Text>
        <Text>קטגוריה: {product.category}</Text>
        <Text>ספק: {product.supplier}</Text>
      </View>

      <View style={styles.descBox}>
        <Text style={styles.descTitle}>תיאור מוצר</Text>
        <Text>{product.content || "אין תיאור"}</Text>
      </View>

      {product.status === "ACTIVE" && !userJoined && (
        <TouchableOpacity style={styles.joinBtn} onPress={handleJoin}>
          <Text style={styles.joinText}>הצטרף עכשיו</Text>
        </TouchableOpacity>
      )}

      <Modal visible={checkoutOpen} transparent animationType="fade">
        <View style={styles.modal}>
          <Checkout
            productId={product.id}
            totalAmount={product.discountedPrice}
            onSuccess={handlePaymentSuccess}
          />
        </View>
      </Modal>

      <Modal visible={authPopup} transparent animationType="fade">
        <View style={styles.modal}>
          <View style={styles.authBox}>
            <Text style={styles.authTitle}>יש להתחבר</Text>
            <Text>כדי להצטרף למוצר</Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  backBtn: {
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    color: "#5b21b6",
    fontWeight: "bold",
  },

  title: { fontSize: 26, fontWeight: "bold", marginBottom: 12 },

  mainImage: { width: "100%", height: 300, borderRadius: 16 },
  thumb: { width: 80, height: 80, marginRight: 8, borderRadius: 12 },

  price: { fontSize: 24, fontWeight: "bold", marginVertical: 12 },
  regularPrice: { textDecorationLine: "line-through", color: "gray" },

  infoBox: { marginBottom: 12 },
  descBox: { backgroundColor: "#f3f4f6", padding: 12, borderRadius: 16 },
  descTitle: { fontWeight: "bold", marginBottom: 6 },

  joinBtn: {
    backgroundColor: "#5b21b6",
    padding: 14,
    borderRadius: 16,
    marginTop: 16,
    alignItems: "center",
  },
  joinText: { color: "white", fontWeight: "bold" },

  modal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  authBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
  },
  authTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 6 },
});
