import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useAuth } from "../context/AuthProvider";
import api from "../app/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsPage() {
  const { user, refreshUser, logout } = useAuth();
  const [openProfile, setOpenProfile] = useState(true);
  const [openPassword, setOpenPassword] = useState(false);
  const [openDanger, setOpenDanger] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(user?.profileImage || null);
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
  });

  if (!user) return null;

  const handleInputChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("הרשאה נדרשת", "אנא אפשר גישה למצלמה");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri) {
      uploadProfileImage(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("הרשאה נדרשת", "אנא אפשר גישה לגלריה");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri) {
      uploadProfileImage(result.assets[0].uri);
    }
  };

  const uploadProfileImage = async (uri: string) => {
    setPreview(uri);
    const formData = new FormData();
    const filename = uri.split("/").pop()!;
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    formData.append("file", { uri, name: filename, type } as any);

    try {
      const token = await AsyncStorage.getItem("token");
      await api.patch("/auth/me/profile-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      await refreshUser();
      Alert.alert("תמונת הפרופיל עודכנה בהצלחה!");
    } catch (err) {
      Alert.alert("שגיאה בהעלאת תמונה");
      setPreview(user?.profileImage || null);
    }
  };

  const removeProfileImage = async () => {
    setPreview(null);
    try {
      const token = await AsyncStorage.getItem("token");
      await api.delete("/auth/me/profile-image", {
        headers: { Authorization: `Bearer ${token}` },
      });
      await refreshUser();
      Alert.alert("תמונת הפרופיל הוסרה");
    } catch {
      Alert.alert("שגיאה בהסרת תמונה");
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const payload: Record<string, string> = {};
      if (form.firstName !== user.firstName && form.firstName) payload.firstName = form.firstName;
      if (form.lastName !== user.lastName && form.lastName) payload.lastName = form.lastName;
      if (form.email !== user.email && form.email) payload.email = form.email;
      if (form.currentPassword) payload.currentPassword = form.currentPassword;
      if (form.newPassword) payload.newPassword = form.newPassword;

      if (Object.keys(payload).length === 0) {
        Alert.alert("לא שינית אף שדה");
        setLoading(false);
        return;
      }

      const token = await AsyncStorage.getItem("token");
      await api.patch("/auth/me", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setForm((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
      await refreshUser();
      Alert.alert("הפרטים עודכנו בהצלחה!");
    } catch {
      Alert.alert("שגיאה בעדכון פרופיל");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = () => {
    Alert.alert("מחיקת משתמש", "האם אתה בטוח שברצונך למחוק את המשתמש?", [
      { text: "ביטול", style: "cancel" },
      {
        text: "מחק",
        style: "destructive",
        onPress: async () => {
          const token = await AsyncStorage.getItem("token");
          try {
            await api.delete("/auth/me", {
              headers: { Authorization: `Bearer ${token}` },
            });
            logout();
            Alert.alert("המשתמש נמחק בהצלחה");
          } catch {
            Alert.alert("שגיאה במחיקת המשתמש");
          }
        },
      },
    ]);
  };

  const handleLogout = () => logout();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={preview ? { uri: preview } : require("../assets/images/profile-icon-png-8.jpg")}
          style={styles.avatar}
        />
        <View style={styles.changePhotoContainer}>
          <TouchableOpacity style={styles.changePhoto} onPress={pickImage}>
            <Ionicons name="image" size={18} color="blue" />
            <Text style={styles.changePhotoText}>בחר מהגלריה</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.changePhoto} onPress={takePhoto}>
            <Ionicons name="camera" size={18} color="blue" />
            <Text style={styles.changePhotoText}>צלם תמונה</Text>
          </TouchableOpacity>
        </View>
        {preview && (
          <TouchableOpacity onPress={removeProfileImage}>
            <Text style={styles.removePhoto}>הסר תמונה</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.sectionHeader} onPress={() => setOpenProfile(!openProfile)}>
          <Text style={styles.sectionTitle}>פרטי פרופיל</Text>
          <MaterialIcons
            name="keyboard-arrow-down"
            size={24}
            style={{ transform: [{ rotate: openProfile ? "180deg" : "0deg" }] }}
          />
        </TouchableOpacity>
        {openProfile && (
          <View style={styles.sectionContent}>
            <TextInput
              style={styles.input}
              placeholder="שם פרטי"
              value={form.firstName}
              onChangeText={(text) => handleInputChange("firstName", text)}
            />
            <TextInput
              style={styles.input}
              placeholder="שם משפחה"
              value={form.lastName}
              onChangeText={(text) => handleInputChange("lastName", text)}
            />
            <TextInput
              style={styles.input}
              placeholder="אימייל"
              value={form.email}
              onChangeText={(text) => handleInputChange("email", text)}
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveProfile} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>שמור שינויים</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.sectionHeader} onPress={() => setOpenPassword(!openPassword)}>
          <Text style={styles.sectionTitle}>שינוי סיסמה</Text>
          <MaterialIcons
            name="keyboard-arrow-down"
            size={24}
            style={{ transform: [{ rotate: openPassword ? "180deg" : "0deg" }] }}
          />
        </TouchableOpacity>
        {openPassword && (
          <View style={styles.sectionContent}>
            <TextInput
              style={styles.input}
              placeholder="סיסמה נוכחית"
              value={form.currentPassword}
              secureTextEntry
              onChangeText={(text) => handleInputChange("currentPassword", text)}
            />
            <TextInput
              style={styles.input}
              placeholder="סיסמה חדשה"
              value={form.newPassword}
              secureTextEntry
              onChangeText={(text) => handleInputChange("newPassword", text)}
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveProfile} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>שמור סיסמה</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.sectionHeader} onPress={() => setOpenDanger(!openDanger)}>
          <Text style={[styles.sectionTitle, { color: "red" }]}>Danger Zone</Text>
          <MaterialIcons
            name="keyboard-arrow-down"
            size={24}
            style={{ transform: [{ rotate: openDanger ? "180deg" : "0deg" }] }}
          />
        </TouchableOpacity>
        {openDanger && (
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.dangerButton} onPress={deleteUser}>
              <FontAwesome name="trash-o" size={24} color="black" />
              <Text style={styles.dangerText}>מחק משתמש</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>התנתק</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  profileContainer: { alignItems: "center", marginBottom: 24 },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 8 },
  changePhotoContainer: { flexDirection: "row", gap: 12, marginBottom: 4 },
  changePhoto: { flexDirection: "row", alignItems: "center", gap: 6 },
  changePhotoText: { color: "blue", fontSize: 14 },
  removePhoto: { color: "red", fontSize: 12, marginTop: 4 },

  section: { marginBottom: 20, borderWidth: 1, borderColor: "#ddd", borderRadius: 12 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", padding: 12, backgroundColor: "#f0f0f0", borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  sectionTitle: { fontWeight: "bold", fontSize: 16 },
  sectionContent: { padding: 12, gap: 12 },

  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 10 },

  saveButton: { backgroundColor: "#111", padding: 12, borderRadius: 10, alignItems: "center" },
  saveText: { color: "#fff", fontWeight: "bold" },

  dangerButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "red", padding: 12, borderRadius: 10, marginBottom: 8 },
  dangerText: { color: "#fff", fontWeight: "bold" },

  logoutButton: { backgroundColor: "red", padding: 12, borderRadius: 10, alignItems: "center", marginBottom: 20 },
  logoutText: { color: "#fff", fontWeight: "bold" },
});
