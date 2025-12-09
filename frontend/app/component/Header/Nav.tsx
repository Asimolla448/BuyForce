import Link from "next/link";

export default function Nav() {
  return (
    <nav className="hidden md:flex space-x-6">
      <Link href="/category" className="text-gray-700 hover:text-blue-600 font-medium">קטגוריות</Link>
      <Link href="/hotDeals" className="text-gray-700 hover:text-blue-600 font-medium">עסקאות חמות</Link>
      <Link href="/myGroup" className="text-gray-700 hover:text-blue-600 font-medium">הקבוצה שלי</Link>
      <Link href="/wishList" className="text-gray-700 hover:text-blue-600 font-medium">רשימת משאלות</Link>
    </nav>
  );
}
