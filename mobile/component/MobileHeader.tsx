import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  TextInput,
  Dimensions,
  Text,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Logo from "./Logo";
import { useAuth, NotificationItem } from "../context/AuthProvider";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function MobileHeaderAnimated() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [activeNotification, setActiveNotification] =
    useState<NotificationItem | null>(null);

  const {
    notifications,
    unreadCount,
    markNotificationAsRead,
    isAuth, 
  } = useAuth();

  const animation = useRef(new Animated.Value(0)).current;

  const toggleSearch = () => {
    const toValue = searchOpen ? 0 : 1;
    setSearchOpen(!searchOpen);
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const toggleNotif = () => {
    setNotifOpen(!notifOpen);
  };

  const searchWidth = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [60, width * 0.9],
  });

  const logoScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.6],
  });

  const logoOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const openNotification = async (n: NotificationItem) => {
    if (!n.isRead) await markNotificationAsRead(n.id);
    setActiveNotification(n);
    setNotifOpen(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Animated.View style={[styles.searchContainer, { width: searchWidth }]}>
        <Pressable onPress={toggleSearch} style={styles.searchIconWrapper}>
          <Ionicons name="search" size={28} color="gray" />
        </Pressable>
        {searchOpen && (
          <TextInput  placeholder="חפש..." autoFocus />
        )}
      </Animated.View>

      <Animated.View
        style={[
          styles.logoContainer,
          { transform: [{ scale: logoScale }], opacity: logoOpacity },
        ]}
      >
        <Logo iconSize={25} textSize={20} />
      </Animated.View>

      {isAuth ? (
        <Pressable onPress={toggleNotif} style={styles.bellButton}>
          <Ionicons
            name="notifications-outline"
            size={28}
            color="gray"
          />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </Pressable>
      ) : (
        <View style={styles.bellPlaceholder} />
      )}

      {isAuth && (
        <Modal visible={notifOpen} transparent animationType="fade">
          <Pressable
            style={styles.modalContainer}
            onPress={toggleNotif}
          >
            <View style={styles.modalContentWrapper}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>התראות</Text>
                <ScrollView style={styles.modalList}>
                  {notifications.length === 0 ? (
                    <Text style={styles.noNotifications}>
                      אין התראות
                    </Text>
                  ) : (
                    notifications.map((n) => (
                      <Pressable
                        key={n.id}
                        style={[
                          styles.notificationItem,
                          n.isRead
                            ? styles.read
                            : styles.unread,
                        ]}
                        onPress={() => openNotification(n)}
                      >
                        <Text style={styles.notificationTitle}>
                          {n.title}
                        </Text>
                        <Text
                          style={styles.notificationMessage}
                          numberOfLines={2}
                        >
                          {n.message}
                        </Text>
                      </Pressable>
                    ))
                  )}
                </ScrollView>
                <Pressable
                  onPress={toggleNotif}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeText}>סגור</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Modal>
      )}

      {activeNotification && (
        <Modal transparent animationType="fade">
          <Pressable
            style={styles.modalContainer}
            onPress={() => setActiveNotification(null)}
          >
            <View style={styles.modalContentWrapper}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {activeNotification.title}
                </Text>
                <Text style={styles.notificationMessage}>
                  {activeNotification.message}
                </Text>
                <Pressable
                  onPress={() => setActiveNotification(null)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeText}>סגור</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 16,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 20,
    overflow: "hidden",
    height: 40,
    paddingHorizontal: 10,
  },
  searchIconWrapper: { padding: 5 },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#111",
  },

  bellButton: {
    padding: 5,
    position: "relative",
  },

  bellPlaceholder: {
    width: 38,
    height: 38,
  },

  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContentWrapper: {
    width: width * 0.8,
    maxHeight: height * 0.7,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 8,
  },
  modalList: { maxHeight: 300 },
  noNotifications: {
    textAlign: "center",
    padding: 12,
    color: "#666",
  },
  notificationItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  read: { backgroundColor: "white" },
  unread: { backgroundColor: "#e0e7ff" },
  notificationTitle: {
    fontWeight: "600",
    color: "#111",
  },
  notificationMessage: {
    color: "#555",
    marginTop: 2,
  },
  closeButton: {
    marginTop: 10,
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#007bff",
    borderRadius: 8,
  },
  closeText: {
    color: "white",
    fontWeight: "bold",
  },
});
