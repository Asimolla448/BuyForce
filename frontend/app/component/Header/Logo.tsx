"use client"
import { FaShoppingCart } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Logo() {
   const router = useRouter();


  return (
    <>
      <div className="flex  p-5 ">
        <FaShoppingCart onClick={() => router.push("/")} className="size-10 flex cursor-pointer" />
        <h1 onClick={() => router.push("/")} className="text-blue-500 items-center text-2xl font-extrabold cursor-pointer">
         Buy<span className="bg-linear-to-r from-pink-500 to-orange-500 text-transparent bg-clip-text text-2xl font-extrabold">Force</span>
        </h1>
      </div>
    </>
  );
}
