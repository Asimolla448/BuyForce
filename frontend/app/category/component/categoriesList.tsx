import { Category } from "../types/category";
import { 
  FaMobileAlt, FaCouch, FaPlane, FaHome, FaTshirt, FaDumbbell, FaLaptop, FaCamera,
  FaBook, FaCar, FaBicycle, FaUtensils, FaFootballBall, FaPaintBrush, FaShoppingBag,
  FaMusic, FaGamepad, FaDog, FaLeaf, FaTv 
} from "react-icons/fa";

export const initialCategories: Category[] = [
  { id: 1, name: "סמארטפונים", deals: 0, bgColor: "bg-blue-100", iconColor: "text-blue-600", svg: <FaMobileAlt /> },
  { id: 2, name: "ריהוט", deals: 0, bgColor: "bg-green-100", iconColor: "text-green-600", svg: <FaCouch /> },
  { id: 3, name: "נסיעות", deals: 0, bgColor: "bg-purple-100", iconColor: "text-purple-600", svg: <FaPlane /> },
  { id: 4, name: "בית וגן", deals: 0, bgColor: "bg-orange-100", iconColor: "text-orange-600", svg: <FaHome /> },
  { id: 5, name: "אופנה", deals: 0, bgColor: "bg-pink-100", iconColor: "text-pink-600", svg: <FaTshirt /> },
  { id: 6, name: "ספורט וכושר", deals: 0, bgColor: "bg-cyan-100", iconColor: "text-cyan-600", svg: <FaDumbbell /> },
  { id: 7, name: "מחשבים", deals: 0, bgColor: "bg-gray-100", iconColor: "text-gray-600", svg: <FaLaptop /> },
  { id: 8, name: "צילום", deals: 0, bgColor: "bg-yellow-100", iconColor: "text-yellow-600", svg: <FaCamera /> },
  { id: 9, name: "ספרים", deals: 0, bgColor: "bg-indigo-100", iconColor: "text-indigo-600", svg: <FaBook /> },
  { id: 10, name: "רכבים", deals: 0, bgColor: "bg-red-100", iconColor: "text-red-600", svg: <FaCar /> },
  { id: 11, name: "אופניים", deals: 0, bgColor: "bg-teal-100", iconColor: "text-teal-600", svg: <FaBicycle /> },
  { id: 12, name: "מטבח", deals: 0, bgColor: "bg-lime-100", iconColor: "text-lime-600", svg: <FaUtensils /> },
  { id: 13, name: "כדורגל", deals: 0, bgColor: "bg-violet-100", iconColor: "text-violet-600", svg: <FaFootballBall /> },
  { id: 14, name: "אמנות", deals: 0, bgColor: "bg-pink-200", iconColor: "text-pink-700", svg: <FaPaintBrush /> },
  { id: 15, name: "קניות", deals: 0, bgColor: "bg-blue-200", iconColor: "text-blue-700", svg: <FaShoppingBag /> },
  { id: 16, name: "מוזיקה", deals: 0, bgColor: "bg-purple-200", iconColor: "text-purple-700", svg: <FaMusic /> },
  { id: 17, name: "גיימינג", deals: 0, bgColor: "bg-orange-200", iconColor: "text-orange-700", svg: <FaGamepad /> },
  { id: 18, name: "חיות מחמד", deals: 0, bgColor: "bg-teal-200", iconColor: "text-teal-700", svg: <FaDog /> },
  { id: 19, name: "גינון", deals: 0, bgColor: "bg-green-200", iconColor: "text-green-700", svg: <FaLeaf /> },
  { id: 20, name: "טלוויזיות", deals: 0, bgColor: "bg-yellow-200", iconColor: "text-yellow-700", svg: <FaTv /> },
];
