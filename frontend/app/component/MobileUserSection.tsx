'use client';

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import { useEffect, useState } from "react";

import api from "../api";
import defaultAvatar from "../../public/profile-icon-png-8.jpg";
import { useAuth } from "../context/AuthProvider";
import { useSearch } from "../context/SearchContext";
import { useCategoryContext } from "../context/CategoryContext";
import NotificationBellMobile from "./NotificationBellMobile"; 

export default function MobileUserSection() {
  const { user, logout } = useAuth();
  const { searchTerm, setSearchTerm, searchResults } = useSearch();
  const { setSelectedCategory } = useCategoryContext();
  const router = useRouter();

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const isAuth = !!user;

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setProfileImage(res.data.profileImage || null);
      } catch {
        setProfileImage(null);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSelect = (item: typeof searchResults[0]) => {
    setSearchTerm("");

    if (item.type === "category") {
      setSelectedCategory(item.name);
      router.push("/category");
    } else if (item.type === "product" && item.id) {
      router.push(`/products/${item.id}`);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {isAuth ? (
        <>
          <div className="w-full flex justify-end mb-2">
            <NotificationBellMobile />
          </div>

          <Image
            src={profileImage || defaultAvatar}
            width={72}
            height={72}
            alt="Profile"
            className="rounded-full border shadow-sm"
          />

          <div className="flex gap-3 w-full">
            <button
              onClick={() => router.push("/settings")}
              className="flex-1 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              הגדרות
            </button>

            <button
              onClick={handleLogout}
              className="flex-1 py-2 rounded-lg border text-sm font-medium text-red-600 hover:bg-red-50 transition"
            >
              התנתקות
            </button>
          </div>
        </>
      ) : (
        <div className="flex gap-4 text-sm font-medium">
          <Link href="/login" className="text-blue-600 hover:underline">
            התחברות
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/register" className="text-blue-600 hover:underline">
            הרשמה
          </Link>
        </div>
      )}

      <div className="w-full relative">
        <input
          type="text"
          placeholder="חפש מוצרים..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pr-4 pl-10 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <FaSearch className="absolute left-3 top-2.5 text-gray-400" />

        {searchTerm && (
          <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg max-h-56 overflow-y-auto z-50">
            {searchResults.length > 0 ? (
              searchResults.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelect(item)}
                  className="px-4 py-2 cursor-pointer hover:bg-purple-100 text-sm"
                >
                  <span className="font-medium">{item.name}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    {item.type === "category" ? "(קטגוריה)" : "(מוצר)"}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">
                לא נמצאו תוצאות
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
