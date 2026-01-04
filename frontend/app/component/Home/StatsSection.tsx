'use client';

import { useEffect, useState } from 'react';
import api from '../../api';

type Product = {
  id: number;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
  regularPrice: number;
  discountedPrice: number;
  joinedUsers: { id: number }[];
};

type Stat = {
  value: string;
  label: string;
};

export default function StatsSection() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const products: Product[] = await api.get('/products').then(res => res.data);

      const activeProducts = products.filter(p => p.status === 'ACTIVE');

      let totalSavings = activeProducts.reduce(
        (sum, p) => sum + (p.regularPrice - p.discountedPrice),
        0
      );
      if (totalSavings < 0) totalSavings = 0;

      const activeParticipants = activeProducts.reduce(
        (sum, p) => sum + p.joinedUsers.length,
        0
      );

      const completedDeals = products.filter(p => p.status === 'COMPLETED').length;

      const averageDiscount =
        activeProducts.length > 0
          ? Math.round(
              activeProducts.reduce((sum, p) => {
                if (p.regularPrice <= 0) return sum;
                let discountPercent = ((p.regularPrice - p.discountedPrice) / p.regularPrice) * 100;
                if (discountPercent < 0) discountPercent = 0; 
                if (discountPercent > 100) discountPercent = 100; 
                return sum + discountPercent;
              }, 0) / activeProducts.length
            )
          : 0;

      setStats([
        { value: `₪${totalSavings.toLocaleString()}`, label: 'חסכון כולל' },
        { value: `${activeParticipants.toLocaleString()}`, label: 'משתתפים פעילים' },
        { value: `${completedDeals}`, label: 'עסקאות הושלמו' },
        { value: `${averageDiscount}%`, label: 'הנחה ממוצעת' },
      ]);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="text-center py-10">טוען סטטיסטיקות...</p>;

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((stat, i) => (
          <div key={i}>
            <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
            <div className="text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
