import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import api from "./api";
import { AxiosError } from "axios";
import { useAuth } from "../context/AuthProvider";
import Logo from "../component/Logo";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function Register() {
  const router = useRouter();
  const { login } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      setError("סיסמאות לא תואמות");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post<{ accessToken: string }>("/auth/register", {
        firstName,
        lastName,
        email,
        birthDate,
        password,
      });

      if (res.data.accessToken) {
        await login(res.data.accessToken);
        router.replace("/");
      } else {
        router.push("/Login");
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || "שגיאה בהרשמה");
      } else {
        setError("שגיאה בהרשמה");
      }
    } finally {
      setLoading(false);
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setBirthDate(formattedDate);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Logo />

      <View style={styles.card}>
        <Text style={styles.title}>הרשמה</Text>
        <Text style={styles.subtitle}>צרו חשבון חדש והצטרפו אלינו</Text>

        <View style={styles.row}>
          <TextInput
            placeholder="שם פרטי"
            value={firstName}
            onChangeText={setFirstName}
            style={styles.input}
            textAlign="right"
          />
          <TextInput
            placeholder="שם משפחה"
            value={lastName}
            onChangeText={setLastName}
            style={styles.input}
            textAlign="right"
          />
        </View>

        <TextInput
          placeholder="example@email.com"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          textAlign="right"
        />

        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={[styles.input, { justifyContent: "center" }]}
        >
          <Text
            style={{
              color: birthDate ? "#111" : "#9ca3af",
              textAlign: "right",
            }}
          >
            {birthDate ? birthDate : "תאריך לידה (YYYY-MM-DD)"}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={birthDate ? new Date(birthDate) : new Date()}
            mode="date"
            display="default"
            onChange={onChangeDate}
            maximumDate={new Date()}
          />
        )}

        <TextInput
          placeholder="סיסמה"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
          textAlign="right"
        />

        <TextInput
          placeholder="אימות סיסמה"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          secureTextEntry
          textAlign="right"
        />

        {error !== "" && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>הרשם</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/Login")}>
          <Text style={styles.loginText}>
            <Text style={styles.loginLink}>התחבר כאן</Text> ? יש לך כבר חשבון
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
  row: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    flex: 1,
  },
  button: {
    backgroundColor: "#6366f1",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
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
