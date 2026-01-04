'use client';

import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../Button';
import { useAuth } from '../../context/AuthProvider';

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  className?: string;
};

export default function UserDropdown({ open, setOpen, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setOpen]);

  const handleLogout = () => {
    logout();
    setOpen(false);
    router.push('/');
  };

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={`absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 ${className}`}
    >
      <Button
        onClick={() => {
          router.push('/settings');
          setOpen(false);
        }}
        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
      >
        הגדרות
      </Button>
      <Button
        onClick={handleLogout}
        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
      >
        התנתקות
      </Button>
    </div>
  );
}
