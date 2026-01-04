"use client";

import { useRouter } from "next/navigation";

type Props = {
  hidden?: boolean;
  isAuth: boolean;
};

export default function FooterCTA({ hidden, isAuth }: Props) {
  const router = useRouter();
  return (
    <>
      {!hidden && !isAuth && (
        <div className="bg-purple-700 bg-linear-to-r from-purple-600 to-indigo-600 text-white py-16 text-center rounded-b-xl">
          <h2 className="text-4xl font-bold mb-4">?מוכן להתחיל לחסוך</h2>
          <p className="text-xl opacity-90 mb-8">
            הצטרף לאלפי ישראלים שכבר חוסכים עשרות אחוזים על מוצרים איכותיים
          </p>
          <button
            onClick={() => router.push("/register")}
            className="bg-white text-purple-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition"
          >
            הרשם בחינם עכשיו
          </button>
        </div>
      )}
    </>
  );
}
