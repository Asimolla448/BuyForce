'use client';

import { useState } from 'react';
import HeaderPage from './component/HeaderPage';
import MainPage from './component/MainPage';
import QuickActionsGrid from './component/QuickActionsGrid';

export type TabType = 'פעילות' | 'סגירה בקרוב' | 'מחויב' | 'מוחזר' | 'נכשל';

export default function MyGroupsPage() {
  const [selectedTab, setSelectedTab] = useState<TabType>('פעילות');

  return (
    <div className="bg-gray-50 min-h-screen px-4 sm:px-6 lg:px-12 xl:px-20 py-6 space-y-8">
      <HeaderPage selectedTab={selectedTab} setSelectedTab={setSelectedTab} />

      <MainPage selectedTab={selectedTab} />

      <QuickActionsGrid setSelectedTab={setSelectedTab} />
    </div>
  );
}
