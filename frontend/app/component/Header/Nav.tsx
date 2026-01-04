'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthProvider";

export default function Nav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAuth = !!user;

  const linkClass = (href: string) => {
    const isActive =
      pathname === href || pathname.startsWith(href + "/");

    return `font-medium transition
      ${
        isActive
          ? "text-blue-600"
          : "text-gray-700 hover:text-blue-600"
      }`;
  };

  return (
    <nav className="hidden md:flex space-x-6">
      <Link href="/category" className={linkClass("/category")}>
        קטגוריות
      </Link>

      <Link href="/products" className={linkClass("/products")}>
        עסקאות חמות
      </Link>

      {isAuth && (
        <>
          <Link href="/myGroup" className={linkClass("/myGroup")}>
            הקבוצה שלי
          </Link>

          <Link href="/wishList" className={linkClass("/wishList")}>
            רשימת משאלות
          </Link>
        </>
      )}

      {user?.role === 'ADMIN' && (
        <Link href="/admin" className={linkClass("/admin")}>
          ניהול
        </Link>
      )}
    </nav>
  );
}
