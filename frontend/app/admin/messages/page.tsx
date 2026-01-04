'use client';

import { useEffect, useState } from 'react';
import { useAuth, NotificationItem } from '../../context/AuthProvider';

export default function NotificationsPage() {
  const {
    notifications,
    fetchNotifications,
    markNotificationAsRead,
    unreadCount,
    user,
  } = useAuth();

  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = notifications
    .filter((n) => {
      const term = search.toLowerCase();
      return (
        n.title.toLowerCase().includes(term) ||
        n.message.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return (
      <div className="p-6 text-center text-gray-500">
        נא להתחבר כדי לראות התראות
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6" dir="rtl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">
        כל ההתראות {unreadCount > 0 && `(${unreadCount} חדשות)`} 
      </h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="חיפוש לפי כותרת או תוכן..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded-md w-full sm:w-96 text-right text-sm sm:text-base"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[600px] divide-y divide-gray-200 border rounded-md shadow-sm text-right w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold text-gray-700">
                כותרת
              </th>
              <th className="px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold text-gray-700">
                תוכן
              </th>
              <th className="px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold text-gray-700">
                סטטוס קריאה
              </th>
              <th className="px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold text-gray-700">
                תאריך
              </th>
              <th className="px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold text-gray-700">
                פעולות
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredNotifications.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 sm:px-4 py-4 text-center text-gray-500 text-sm">
                  לא נמצאו התראות
                </td>
              </tr>
            )}
            {filteredNotifications.map((n: NotificationItem) => (
              <tr key={n.id} className="hover:bg-gray-50">
                <td className="px-3 sm:px-4 py-2 truncate max-w-[150px]">{n.title}</td>
                <td className="px-3 sm:px-4 py-2 truncate max-w-[250px]">{n.message}</td>
                <td className="px-3 sm:px-4 py-2 whitespace-nowrap">{n.isRead ? 'נקראה' : 'חדשה'}</td>
                <td className="px-3 sm:px-4 py-2 whitespace-nowrap">{formatDate(n.createdAt)}</td>
                <td className="px-3 sm:px-4 py-2 whitespace-nowrap">
                  {!n.isRead && n.id && (
                    <button
                      onClick={() => markNotificationAsRead(n.id)}
                      className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs sm:text-sm"
                    >
                      סמן כנקראה
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
