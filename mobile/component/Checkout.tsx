'use client';

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Animated,
} from "react-native";
import { useAuth } from "../context/AuthProvider";
import Alert from "./Alert";

interface CheckoutProps {
  productId: number;
  totalAmount: number;
  onSuccess?: () => void;
}

interface AlertMessage {
  type: "success" | "error";
  text: string;
}

export default function Checkout({ productId, totalAmount, onSuccess }: CheckoutProps) {
  const { joinProduct, refreshJoinedProducts } = useAuth();
  const [alert, setAlert] = useState<AlertMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const showAlert = (message: AlertMessage) => {
    setAlert(message);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setAlert(null));
    }, 4000);
  };

  const handlePaymentSuccess = async () => {
    setLoading(true);
    try {
      await joinProduct(productId);
      await refreshJoinedProducts();
      showAlert({ type: "success", text: "הצטרפת בהצלחה למוצר!" });
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Failed to join product after payment:", err);
      showAlert({ type: "error", text: "שגיאה בהצטרפות למוצר לאחר התשלום" });
    } finally {
      setLoading(false);
    }
  };

  const handlePayPress = () => {
    setLoading(true);
    setTimeout(() => {
      handlePaymentSuccess();
    }, 2000);
  };

  return (
    <View style={styles.container}>
      {alert && (
        <Animated.View style={[styles.alert, { opacity: fadeAnim }]}>
          <Text style={[styles.alertText, alert.type === "success" ? styles.success : styles.error]}>
            {alert.text}
          </Text>
        </Animated.View>
      )}

      <Text style={styles.title}>Checkout</Text>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>סיכום הזמנה</Text>
        <View style={styles.amountRow}>
          <Text>סכום לתשלום:</Text>
          <Text style={styles.amount}>₪{totalAmount.toFixed(2)}</Text>
        </View>
        <Text style={styles.note}>
          רק ₪1 ייגבה כעת לאימות. התשלום המלא יתבצע אם המוצר יגיע ליעד.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.payButton}
        onPress={handlePayPress}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.payButtonText}>Pay with PayPal</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
    margin: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  summary: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  amount: {
    fontWeight: "bold",
  },
  note: {
    fontSize: 12,
    color: "gray",
  },
  payButton: {
    backgroundColor: "#003087",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  payButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  alert: {
    position: "absolute",
    top: -70,
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 12,
    zIndex: 999,
    alignItems: "center",
  },
  alertText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  success: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  error: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
});
