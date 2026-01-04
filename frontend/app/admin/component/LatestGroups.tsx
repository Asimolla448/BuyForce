'use client';

import { useEffect, useState } from 'react';
import api from '../../api';

type JoinedUser = {
  id: number;
};

type GroupProduct = {
  id: number;
  name: string;
  supplier: string;
  targetDate: string;
  joinedUsers: JoinedUser[];
};

export default function LatestGroups() {
  const [groups, setGroups] = useState<GroupProduct[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get<GroupProduct[]>('/products/active');

        const filtered = res.data
          .filter((p) => p.joinedUsers.length > 1)
          .sort(
            (a, b) =>
              new Date(b.targetDate).getTime() -
              new Date(a.targetDate).getTime()
          )
          .slice(0, 5);

        setGroups(filtered);
      } catch (error) {
        console.error('Failed to fetch groups', error);
      }
    };

    fetchGroups();
  }, []);

  return (
    <ul className="divide-y divide-gray-100 overflow-x-auto">
      {groups.map((group) => (
        <li key={group.id} className="py-3 min-w-[250px]">
          <p className="font-semibold text-sm sm:text-base truncate">{group.name}</p>
          <div className="flex flex-wrap justify-between text-xs sm:text-sm text-gray-500 mt-1">
            <span className="truncate">{group.supplier}</span>
            <span className="ml-2">
              {new Date(group.targetDate).toLocaleDateString('he-IL')}
            </span>
          </div>
        </li>
      ))}

      {groups.length === 0 && (
        <li className="py-6 text-center text-gray-400 text-sm">
          אין קבוצות פעילות להצגה
        </li>
      )}
    </ul>
  );
}
