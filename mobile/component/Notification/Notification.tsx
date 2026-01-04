import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, NotificationItem } from "../../context/AuthProvider";
import NotificationModal from "./NotificationModal";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationDropdown() {
  const { notifications, unreadCount, fetchNotifications, markNotificationAsRead } = useAuth();

  const [open, setOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState<NotificationItem | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const openNotification = async (notification: NotificationItem) => {
    setActiveNotification(notification);

    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Pressable onPress={() => setOpen(v => !v)} style={styles.bellButton}>
        <Ionicons name="notifications-outline" size={28} color="gray" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </Pressable>

      {open && (
        <View style={styles.dropdown}>
          <Text style={styles.dropdownTitle}>התראות</Text>

          <ScrollView style={styles.notificationsList}>
            {notifications.length === 0 && (
              <Text style={styles.noNotifications}>אין התראות</Text>
            )}

            {notifications.map((n) => (
              <Pressable
                key={n.id}
                onPress={() => openNotification(n)}
                style={[styles.notificationItem, n.isRead ? styles.read : styles.unread]}
              >
                <Text style={styles.notificationTitle}>{n.title}</Text>
                <Text style={styles.notificationMessage} numberOfLines={2}>
                  {n.message}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {activeNotification && (
        <NotificationModal
          title={activeNotification.title}
          message={activeNotification.message}
          onClose={() => setActiveNotification(null)}
        />
      )}
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 1000,
  },
  bellButton: {
    padding: 8,
    position: "relative",
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
  dropdown: {
    position: "absolute",
    top: 40,
    right: 0,
    width: width * 0.85,
    maxHeight: 400,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 1000,
    paddingVertical: 4,
  },
  dropdownTitle: {
    fontWeight: "bold",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    fontSize: 16,
  },
  notificationsList: {
    maxHeight: 320,
  },
  noNotifications: {
    padding: 12,
    textAlign: "center",
    color: "#666",
  },
  notificationItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  read: {
    backgroundColor: "white",
  },
  unread: {
    backgroundColor: "#e0e7ff",
  },
  notificationTitle: {
    fontWeight: "600",
    color: "#111",
  },
  notificationMessage: {
    color: "#555",
    marginTop: 2,
  },
});
