'use client';

import { X } from 'lucide-react';
import NavVertical from '../component/NavVertical';
import MobileUserSection from './MobileUserSection';

type Props = {
  onClose: () => void;
};

export default function MobileMenu({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <aside className="absolute right-0 top-0 h-full w-72 bg-white border-l shadow-xl flex flex-col">
        <div className="h-16 px-4 flex items-center justify-between border-b font-semibold text-lg">
          <span>תפריט</span>
          <button onClick={onClose} aria-label="Close menu">
            <X size={22} />
          </button>
        </div>

        <div className="px-4 py-4 border-b">
          <MobileUserSection />
        </div>

        <nav className="flex-1 px-4 py-5 space-y-2 overflow-y-auto">
          <NavVertical />
        </nav>

      </aside>
    </div>
  );
}
