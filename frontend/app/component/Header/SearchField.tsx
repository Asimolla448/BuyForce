import { FaSearch } from "react-icons/fa";
import Input from "../Input";

export default function SearchField() {
  return (
    <div className="relative hidden md:block">
      <Input 
        placeholder="חפש מוצרים..."
        className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      />
      <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
    </div>
  );
}
