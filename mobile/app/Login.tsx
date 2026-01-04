import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import api from "./api";
import { AxiosError } from "axios";
import { useAuth } from "../context/AuthProvider";
import Logo from "../component/Logo";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.post<{ accessToken: string }>("/auth/login", {
        email,
        password,
      });

      await login(res.data.accessToken);

      router.replace("/");
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || "שגיאה בהתחברות");
      } else {
        setError("שגיאה בהתחברות");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Logo />

      <View style={styles.card}>
        <Text style={styles.title}>התחברות</Text>
        <Text style={styles.subtitle}>
          הכניסו את הפרטים שלכם כדי להתחבר
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>כתובת אימייל</Text>
          <TextInput
            placeholder="example@email.com"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            textAlign="right"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>סיסמה</Text>
          <TextInput
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
            textAlign="right"
          />
        </View>

        {error !== "" && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>התחבר</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/Register")}>
          <Text style={styles.loginText}>
            <Text style={styles.loginLink}>הרשם כאן</Text>? אין לך חשבון
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    elevation: 4,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 12,
  },
  label: {
    textAlign: "right",
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: "#6366f1",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  error: {
    color: "red",
    fontSize: 12,
    textAlign: "right",
    marginBottom: 8,
  },
  loginText: {
    marginTop: 16,
    textAlign: "center",
    color: "gray",
  },
  loginLink: {
    color: "#6366f1",
    fontWeight: "bold",
  },
});
