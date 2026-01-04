"use client";

import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();

  const handleScroll = () => {
    const section = document.getElementById("info");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      suppressHydrationWarning
      className="bg-linear-to-br from-blue-500 to-purple-700 h-[400px] flex items-center text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl font-bold mb-4">קנייה קבוצתית חכמה</h1>
        <p className="text-xl mb-8 opacity-90">
          התחברו לקבוצות רכישה וקבלו מחירים סיטונאיים על מוצרים איכותיים
        </p>

        <div className="flex justify-center gap-4">
          <button
            suppressHydrationWarning
            className="
              bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold
              hover:bg-gray-100
              active:bg-gray-200 active:scale-95
              focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50
              transition-all duration-150
            "
            onClick={() => router.push('/products')}
          >
            התחל עכשיו
          </button>

          <button
            suppressHydrationWarning
            onClick={handleScroll}
            className="
              border-2 border-white text-white px-8 py-3 rounded-lg font-semibold
              hover:bg-white hover:text-blue-600
              active:bg-blue-100 active:text-blue-700 active:scale-95
              focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50
              transition-all duration-150
            "
          >
            איך זה עובד?
          </button>
        </div>
      </div>
    </section>
  );
}
