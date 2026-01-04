'use client';

import { useEffect, useState } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthProvider';
import {
  AiOutlineDollarCircle,
  AiOutlineUser,
  AiOutlineCheckCircle,
  AiOutlinePercentage,
} from 'react-icons/ai';

type JoinedUser = {
  id: number;
};

type Product = {
  id: number;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
  regularPrice: number;
  discountedPrice: number;
  joinedUsers: JoinedUser[];
};

type Stat = {
  label: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
};

export default function StatsSection() {
  const { user, isAuth } = useAuth();
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isAuth || user?.role !== 'ADMIN') return;

    const fetchStats = async () => {
      try {
        const products = await api.get<Product[]>('/products').then(r => r.data);

        const activeProducts = products.filter(
          (p) => p.status === 'ACTIVE'
        );

        const totalSavings = activeProducts.reduce(
          (sum, p) => sum + (p.regularPrice - p.discountedPrice),
          0
        );

        const activeParticipants = activeProducts.reduce(
          (sum, p) => sum + p.joinedUsers.length,
          0
        );

        const completedDeals = products.filter(
          (p) => p.status === 'COMPLETED'
        ).length;

        const averageDiscount =
          activeProducts.length > 0
            ? Math.round(
                activeProducts.reduce((sum, p) => {
                  if (p.regularPrice <= 0) return sum;
                  const discount =
                    ((p.regularPrice - p.discountedPrice) / p.regularPrice) * 100;
                  return sum + Math.min(100, Math.max(0, discount));
                }, 0) / activeProducts.length
              )
            : 0;

        setStats([
          {
            label: 'חסכון כולל',
            value: `₪${totalSavings.toLocaleString()}`,
            icon: <AiOutlineDollarCircle size={28} />,
            gradient: 'from-green-400 to-green-600',
          },
          {
            label: 'משתתפים פעילים',
            value: activeParticipants.toLocaleString(),
            icon: <AiOutlineUser size={28} />,
            gradient: 'from-blue-400 to-blue-600',
          },
          {
            label: 'עסקאות הושלמו',
            value: `${completedDeals}`,
            icon: <AiOutlineCheckCircle size={28} />,
            gradient: 'from-purple-400 to-purple-600',
          },
          {
            label: 'הנחה ממוצעת',
            value: `${averageDiscount}%`,
            icon: <AiOutlinePercentage size={28} />,
            gradient: 'from-pink-400 to-pink-600',
          },
        ]);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAuth, user]);

  if (!isAuth || user?.role !== 'ADMIN') return null;
  if (loading) {
    return (
      <p className="text-center py-8 text-gray-400">
        טוען סטטיסטיקות...
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`relative p-4 sm:p-6 rounded-2xl text-white shadow-lg flex flex-col items-start sm:items-center justify-center min-w-0 bg-linear-to-r ${stat.gradient}`}
        >
          <div className="text-2xl sm:text-3xl mb-2">{stat.icon}</div>
          <div className="text-xl sm:text-2xl font-extrabold truncate w-full">{stat.value}</div>
          <div className="text-xs sm:text-sm opacity-90 truncate w-full text-right sm:text-center">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
