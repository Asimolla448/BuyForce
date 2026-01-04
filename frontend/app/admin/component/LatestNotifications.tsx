'use client';

import { useEffect, useState } from 'react';
import { useAuth, NotificationItem } from '../../context/AuthProvider';

export default function LatestNotifications() {
  const { notifications: authNotifications, fetchNotifications } = useAuth();
  const [latestNotifications, setLatestNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        await fetchNotifications();

        const sorted = [...authNotifications].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setLatestNotifications(sorted.slice(0, 5));
      } catch (error) {
        console.error('Failed to load notifications from AuthProvider', error);
      }
    };

    loadNotifications();
  }, [authNotifications, fetchNotifications]);

  return (
    <ul className="space-y-4">
      {latestNotifications.length === 0 && (
        <li className="text-sm text-gray-400 text-center">
          אין התראות להצגה
        </li>
      )}

      {latestNotifications.map((notification) => (
        <li key={notification.id} className="flex flex-wrap gap-3">
          <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full mt-2 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm sm:text-base truncate">{notification.title}</p>
            <p className="text-xs sm:text-sm text-gray-400">
              {new Date(notification.createdAt).toLocaleDateString('he-IL')}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
