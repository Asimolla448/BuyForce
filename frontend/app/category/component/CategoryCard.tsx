"use client";

import React from "react";
import { Category } from "../types/category";
import { useCategoryContext } from "../../context/CategoryContext";

export default function CategoryCard({
  category,
  isCenter = false,
}: {
  category: Category;
  isCenter?: boolean;
}) {
  const { setSelectedCategory } = useCategoryContext(); // <-- שימוש בקונטקסט ישירות

  const scale = isCenter ? 1.05 : 1;
  const opacity = isCenter ? 1 : 0.95;

  const handleClick = () => {
    setSelectedCategory(category.name); // <-- כאן מעדכן את הקטגוריה הנבחרת בקונטקסט
  };

  return (
    <div
      onClick={handleClick}
      className={`flex flex-col items-center justify-center rounded-3xl shadow-lg hover:shadow-2xl cursor-pointer transition-transform duration-500 shrink-0 ${category.bgColor}`}
      style={{
        width: "200px",
        height: "260px",
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {/* אייקון */}
      <div
        className={`text-5xl mb-3 flex justify-center items-center ${category.iconColor}`}
      >
        {category.svg}
      </div>

      {/* שם הקטגוריה */}
      <h3 className="font-semibold text-center text-gray-900 text-lg">
        {category.name}
      </h3>

      {/* מספר המוצרים */}
      <span className="text-sm text-gray-700 mt-1">
        {category.deals} מוצרים
      </span>
    </div>
  );
}
