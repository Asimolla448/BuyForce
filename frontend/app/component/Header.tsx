'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

import Logo from './Header/Logo';
import Nav from './Header/Nav';
import SearchField from './Header/SearchField';
import UserActions from './Header/UserActions';
import MobileMenu from './MobileMenu';
import { useAuth } from '../context/AuthProvider'; 

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { unreadCount } = useAuth(); 

  if (
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/admin')
  )
    return null;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 relative">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-5">
            <Logo />
            <Nav />
          </div>

          <div className="flex items-center space-x-4">
            <SearchField />
            <UserActions />

           
            <div className="relative md:hidden">
              <button
                onClick={() => setOpen(true)}
                className="focus:outline-none relative"
                aria-label="Open menu"
              >
                <Menu size={26} />
              </button>

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {open && <MobileMenu onClose={() => setOpen(false)} />}
    </header>
  );
}
