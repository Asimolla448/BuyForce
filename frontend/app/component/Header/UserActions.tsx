import Link from 'next/link';
import { useState } from 'react';
import Avater from './Avater';
import UserDropdown from './UserDropdown';
import NotificationDropdown from './NotificationDropdown';
import { useAuth } from '../../context/AuthProvider';

type Props = { hidden?: boolean };

export default function UserActions({ hidden }: Props) {
  const [open, setOpen] = useState(false);
  const { isAuth, user } = useAuth();

  return (
    <div className="hidden md:flex gap-5 items-center relative">
      {!hidden && (
        isAuth ? (
          <div className="flex items-center gap-4 relative">
            <NotificationDropdown />

            <div className="flex flex-col items-center relative">
              <button
                onClick={() => setOpen(!open)}
                className="focus:outline-none"
              >
                <div className="transform translate-y-2">
                  <Avater />
                </div>
              </button>

              {user?.firstName && (
                <span className="text-sm mt-1 font-medium">
                  {user.firstName}
                </span>
              )}

              <UserDropdown
                open={open}
                setOpen={setOpen}
                className="absolute top-full mt-1 w-48 bg-white shadow-lg rounded-md z-50"
              />
            </div>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link href="/login" className="text-sm font-medium hover:underline">
              התחברות
            </Link>
            <Link href="/register" className="text-sm font-medium hover:underline">
              הרשמה
            </Link>
          </div>
        )
      )}
    </div>
  );
}
