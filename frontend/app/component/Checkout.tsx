'use client';

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import api from "../api";
import { useState } from "react";
import Alert from "./Alert";

interface CheckoutProps {
  productId: number;
  totalAmount: number;
  onSuccess?: () => void;
}

interface PayPalOrderResponse {
  id: string;
  status: string;
}

interface AlertMessage {
  type: "success" | "error";
  text: string;
}

export default function Checkout({ productId, totalAmount, onSuccess }: CheckoutProps) {
  const [alert, setAlert] = useState<AlertMessage | null>(null);

  const clientId =
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
    "AfH3zDgfJZPhnL-10UMBfnwRHW0xA23cydWuHPDy6-X6rHHAJW4GNjkSV0kEP778MBFlX2t19OhBf9cg";

  const showAlert = (message: AlertMessage) => {
    setAlert(message);
    setTimeout(() => setAlert(null), 4000);
  };

  const createOrderServerSide = async (): Promise<string> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found. Please log in.");

      const res = await api.post<PayPalOrderResponse>(
        `/payments/${productId}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return res.data.id;
    } catch (err: unknown) {
      let message = "שגיאה ביצירת תשלום";
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
      ) {
        message = (err as { response: { data: { message: string } } }).response.data.message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      showAlert({ type: "error", text: message });
      console.error("Cannot create order:", err);
      throw err;
    }
  };

  const handlePaymentApprove = async (data: any, actions: any) => {
    try {
      if (!actions.order) throw new Error("Actions.order undefined");
      const authorization = await actions.order.authorize();

      const orderId = data.orderID || authorization.id;

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found. Please log in.");

      await api.post(
        `/payments/approve/${orderId}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showAlert({
        type: "success",
        text: "התשלום אושר! ההתראה נשלחה למשתמש.",
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Failed to authorize payment:", err);
      showAlert({
        type: "error",
        text: "אירעה שגיאה באימות התשלום",
      });
    }
  };

  if (!clientId) {
    return (
      <div className="text-red-500 text-center mt-10">
        PayPal Client ID לא מוגדר. בדוק את הקובץ .env.local שלך.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg space-y-4 relative">
      {alert && (
        <Alert
          message={alert.text}
          className={`px-6 py-4 rounded-xl shadow-2xl font-semibold text-white text-center max-w-sm w-full animate-fadein ${
            alert.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        />
      )}

      <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>

      <section className="border-t pt-4 space-y-2">
        <h2 className="font-semibold text-gray-700">סיכום הזמנה</h2>
        <div className="flex justify-between">
          <span>סכום לתשלום:</span>
          <span className="font-bold">₪{totalAmount.toFixed(2)}</span>
        </div>
        <p className="text-sm text-gray-500">
          רק ₪1 ייגבה כעת לאימות. התשלום המלא יתבצע אם המוצר יגיע ליעד.
        </p>
      </section>

      <section className="pt-4">
        <PayPalScriptProvider
          options={{ clientId, currency: "ILS", intent: "authorize" }}
        >
          <PayPalButtons
            style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay" }}
            createOrder={async () => await createOrderServerSide()}
            onApprove={handlePaymentApprove}
            onError={(err) => {
              console.error("PayPal error:", err);
              showAlert({ type: "error", text: "אירעה שגיאה בתשלום" });
            }}
          />
        </PayPalScriptProvider>
      </section>

      <style jsx>{`
        @keyframes fadein {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadein {
          animation: fadein 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
