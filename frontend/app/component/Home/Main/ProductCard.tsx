"use client";
import Image from "next/image";

export type Product = {
  id: number;
  title: string;
  price: string;
  oldPrice: string;
  discount: string;
  participants: string;
  progress: number;
  img: string;
  alt: string;
};

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const {
    title,
    price,
    oldPrice,
    discount,
    participants,
    progress,
    img,
    alt,
  } = product;

  return (
    <div className="border rounded-xl p-4 shadow-sm hover:shadow-md transition">
      <Image
        src={img}
        alt={alt}
        width={300}
        height={200}
        className="rounded-lg object-cover"
      />

      <h3 className="mt-3 font-semibold text-lg">{title}</h3>

      <div className="flex items-center gap-2 mt-1">
        <span className="text-xl font-bold text-green-600">{price}</span>
        <span className="line-through text-gray-400 text-sm">{oldPrice}</span>
        <span className="text-red-500 text-sm font-semibold">{discount}</span>
      </div>

      <p className="text-sm text-gray-500 mt-1">
        משתתפים: {participants}
      </p>

      <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
        <div
          className="bg-blue-600 h-full rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
