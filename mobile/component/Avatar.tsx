import React, { useEffect, useState } from "react";
import { Image, StyleSheet } from "react-native";
import api from "../app/api";
import { useAuth } from "../context/AuthProvider";

export default function Avatar() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        setProfileImage(res.data.profileImage || null);
      } catch (err) {
        setProfileImage(null);
      }
    };

    fetchProfile();
  }, [user]);

  return (
    <Image
      source={
        profileImage
          ? { uri: profileImage }
          : require("../assets/images/profile-icon-png-8.jpg")
      }
      style={styles.avatar}
    />
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});
