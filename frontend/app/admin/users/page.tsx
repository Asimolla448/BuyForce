'use client';

import { useEffect, useState } from 'react';
import api from '../../api';

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  birthDate?: string | null;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/auth/users');
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
        setUsers(data);
      } catch (err) {
        console.error('Failed to fetch users', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(term) ||
      u.lastName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  });

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">טוען משתמשים...</div>;
  }

  return (
    <div className="p-4 sm:p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-4">כל המשתמשים</h1>

      <input
        type="text"
        placeholder="חיפוש לפי שם פרטי, שם משפחה או אימייל..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 p-2 border rounded w-full sm:w-96 text-right"
      />

      <div className="overflow-x-auto border rounded-md shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-right">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-sm font-semibold text-gray-700">שם פרטי</th>
              <th className="px-4 py-2 text-sm font-semibold text-gray-700">שם משפחה</th>
              <th className="px-4 py-2 text-sm font-semibold text-gray-700">תאריך לידה</th>
              <th className="px-4 py-2 text-sm font-semibold text-gray-700">אימייל</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-3 text-center text-gray-500 text-sm">
                  לא נמצאו משתמשים
                </td>
              </tr>
            )}
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{user.firstName}</td>
                <td className="px-4 py-2">{user.lastName}</td>
                <td className="px-4 py-2">{formatDate(user.birthDate)}</td>
                <td className="px-4 py-2">{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
