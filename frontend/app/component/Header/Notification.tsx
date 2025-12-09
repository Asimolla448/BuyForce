import { IoMdNotifications } from "react-icons/io";
import Button from "../Button";

export default function Notification() {
  return (
    <Button className="relative p-2 text-gray-700 hover:text-blue-600">
      <IoMdNotifications className="text-lg size-5" />
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
    </Button>
  );
}
