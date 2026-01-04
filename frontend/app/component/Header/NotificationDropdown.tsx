'use client';

import { useEffect, useRef, useState } from "react";
import { IoNotifications } from "react-icons/io5";
import { useAuth, NotificationItem } from "../../context/AuthProvider";
import NotificationModal from "../NotificationModal";

export default function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markNotificationAsRead
  } = useAuth();

  const [open, setOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState<NotificationItem | null>(null);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openNotification = async (notification: NotificationItem) => {
    setActiveNotification(notification);

    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 text-gray-700 hover:text-indigo-600 transition"
      >
        <IoNotifications className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-h-96 bg-white rounded-xl shadow-2xl z-40 overflow-hidden">
          <div className="px-4 py-2 font-bold text-gray-800 border-b">
            התראות
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="p-4 text-sm text-gray-500 text-center">
                אין התראות
              </p>
            )}

            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => openNotification(n)}
                className={`w-full text-right px-4 py-3 text-sm border-b last:border-b-0 transition
                  ${n.isRead ? "bg-white hover:bg-gray-50" : "bg-indigo-50 hover:bg-indigo-100"}`}
              >
                <div className="font-semibold text-gray-900">{n.title}</div>
                <div className="text-gray-600 line-clamp-2">{n.message}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeNotification && (
        <NotificationModal
          title={activeNotification.title}
          message={activeNotification.message}
          onClose={() => setActiveNotification(null)}
        />
      )}
    </div>
  );
}
