'use client';

import { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import { useSearch } from "../../context/SearchContext";
import { useCategoryContext } from "../../context/CategoryContext";
import { useRouter } from "next/navigation";

export default function SearchField() {
  const { searchTerm, setSearchTerm, searchResults } = useSearch();
  const { setSelectedCategory } = useCategoryContext();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  
  const handleSelect = (item: typeof searchResults[0]) => {
    setSearchTerm(""); 
    setShowDropdown(false);

    if (item.type === "category") {
      setSelectedCategory(item.name); 
      router.push("/category");       
    } else if (item.type === "product" && item.id) {
      router.push(`/products/${item.id}`); 
    }
  };

  return (
    <div className="relative hidden md:block" ref={dropdownRef}>
      <input
        type="text"
        placeholder="חפש מוצרים..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowDropdown(e.target.value.trim().length > 0);
        }}
        className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      />
      <FaSearch className="absolute left-3 top-2.5 text-gray-400" />

      {showDropdown && searchResults.length > 0 && (
        <div className="absolute left-0 top-full mt-2 w-full bg-white shadow-lg rounded-lg max-h-64 overflow-y-auto z-50">
          {searchResults.map((item, idx) => (
            <div
              key={idx}
              className="px-4 py-2 cursor-pointer hover:bg-purple-100 transition-colors"
              onClick={() => handleSelect(item)}
            >
              <span className="font-medium">{item.name}</span>
              <span className="ml-2 text-sm text-gray-500">
                {item.type === "category" ? "(קטגוריה)" : "(מוצר)"}
              </span>
            </div>
          ))}
        </div>
      )}

      {showDropdown && searchResults.length === 0 && (
        <div className="absolute left-0 top-full mt-2 w-full bg-white shadow-lg rounded-lg px-4 py-2 text-gray-500">
          לא נמצאו תוצאות
        </div>
      )}
    </div>
  );
}
