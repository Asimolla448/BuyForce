"use client";

import { useState } from "react";
import { FaPlus, FaEye } from "react-icons/fa";
import { MdOutlineCreate } from "react-icons/md";
import { useRouter } from "next/navigation";

export default function AdminHeader({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCreateCampaign = () => {
    router.push("/admin/createCampage");
    setMobileMenuOpen(false);
  };

  const handleViewWebsite = () => {
    window.open("/", "_blank");
    setMobileMenuOpen(false);
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-md border-b relative">
      <div className="flex items-center gap-4">
        {children}
      </div>

      <div className="hidden sm:flex items-center gap-4">
        <button
          onClick={handleCreateCampaign}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
        >
          <FaPlus />
          יצירת קמפיין
        </button>

        <button
          onClick={handleViewWebsite}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-gray-300 transition"
        >
          <FaEye />
          צפייה באתר
        </button>
      </div>

      <div className="sm:hidden relative">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`flex items-center gap-2 border border-black p-2 rounded-md transition 
                      hover:bg-gray-300 
                      ${mobileMenuOpen ? "bg-gray-300" : "bg-white"}`}
        >
          <MdOutlineCreate className="text-black" />
        </button>

        {mobileMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg border rounded-md flex flex-col gap-2 p-2 z-50">
            <button
              onClick={handleCreateCampaign}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
            >
              <FaPlus />
              יצירת קמפיין
            </button>
            <button
              onClick={handleViewWebsite}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-gray-300 transition"
            >
              <FaEye />
              צפייה באתר
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
