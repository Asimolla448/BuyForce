'use client';

import { useEffect, useState } from 'react';
import api from '../../api';

type Payment = {
  id: number;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'FAILED';
  createdAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  product: {
    id: number;
    name: string;
    supplier: string;
  };
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get('/payments');
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
        setPayments(data);
      } catch (err) {
        console.error('Failed to fetch payments', err);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      p.user.lastName.toLowerCase().includes(search.toLowerCase()) ||
      p.product.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? p.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) {
    return <div className="p-6 text-center text-gray-500">טוען תשלומים...</div>;
  }

  return (
    <div className="p-4 sm:p-6" dir="rtl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">כל התשלומים שבוצעו</h1>

      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4">
        <input
          type="text"
          placeholder="חיפוש לפי משתמש או מוצר..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded-md w-full sm:w-64 text-right text-sm sm:text-base"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm sm:text-base"
        >
          <option value="">כל הסטטוסים</option>
          <option value="PENDING">ממתין</option>
          <option value="APPROVED">מאושר</option>
          <option value="PAID">שולם</option>
          <option value="FAILED">נכשל</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[700px] divide-y divide-gray-200 border rounded-md shadow-sm text-right w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold text-gray-700">שם משתמש</th>
              <th className="px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold text-gray-700">אימייל</th>
              <th className="px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold text-gray-700">מוצר</th>
              <th className="px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold text-gray-700">ספק</th>
              <th className="px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold text-gray-700">סכום</th>
              <th className="px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold text-gray-700">סטטוס</th>
              <th className="px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold text-gray-700">תאריך</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredPayments.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 sm:px-4 py-4 text-center text-gray-500 text-sm">
                  לא נמצאו תשלומים
                </td>
              </tr>
            )}
            {filteredPayments.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-3 sm:px-4 py-2 truncate max-w-[120px]">{p.user.firstName} {p.user.lastName}</td>
                <td className="px-3 sm:px-4 py-2 truncate max-w-[150px]">{p.user.email}</td>
                <td className="px-3 sm:px-4 py-2 truncate max-w-[150px]">{p.product.name}</td>
                <td className="px-3 sm:px-4 py-2 truncate max-w-[120px]">{p.product.supplier}</td>
                <td className="px-3 sm:px-4 py-2 whitespace-nowrap">{p.amount} ₪</td>
                <td className="px-3 sm:px-4 py-2 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-white text-xs sm:text-sm font-semibold ${
                      p.status === 'PAID'
                        ? 'bg-green-500'
                        : p.status === 'FAILED'
                        ? 'bg-red-500'
                        : p.status === 'PENDING'
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-2 whitespace-nowrap">{formatDate(p.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
