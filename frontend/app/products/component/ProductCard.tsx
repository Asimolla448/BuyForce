"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { Pencil, Trash2, Timer, Flame, Sparkles, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import api from "../../api";
import { useAuth } from "../../context/AuthProvider";
import Alert from "../../component/Alert";

export type Product = {
  category: string;
  id: number;
  name: string;
  regularPrice: number;
  discountedPrice: number;
  targetUsersCount: number;
  joinedUsers?: { id: number }[];
  targetDate: string;
  mainImage: string;
  status: "ACTIVE" | "COMPLETED" | "FAILED";
  createdAt?: string;
};

type ProductCardProps = {
  product: Product;
  onDelete?: (id: number) => void;
  onEdit?: (updatedProduct: Product) => void;
  isInWishlistPage?: boolean;
};

export default function ProductCard({
  product,
  onDelete,
  isInWishlistPage,
}: ProductCardProps) {
  const router = useRouter();
  const {
    user,
    isAuth,
    wishlistIds,
    toggleWishlist: toggleWishlistContext,
    joinedProducts,
  } = useAuth();

  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertColor, setAlertColor] = useState("");
  const [, forceTick] = useState(0);

  const updatedProduct = useMemo(() => {
    const jp = joinedProducts.find((p) => p.id === product.id);
    const participants =
      jp?.joinedUsers?.length ?? product.joinedUsers?.length ?? 0;

    const now = new Date();
    const end = new Date(product.targetDate);

    let newStatus = product.status;

    if (participants >= product.targetUsersCount && product.status !== "COMPLETED") {
      newStatus = "COMPLETED";
    }

    if (now > end && product.status === "ACTIVE") {
      newStatus = "FAILED";
    }

    return {
      ...product,
      status: newStatus,
      joinedUsers: jp?.joinedUsers ?? product.joinedUsers,
    };
  }, [product, joinedProducts]);

  useEffect(() => {
    if (updatedProduct.status !== product.status) {
      const token = localStorage.getItem("token");
      if (!token) return;

      api
        .patch(
          `/products/${product.id}/status`,
          { status: updatedProduct.status },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .catch(() => {
          setAlertMessage("שגיאה בעדכון סטטוס המוצר");
          setAlertColor("bg-red-500");
        });
    }
  }, [updatedProduct.status, product.id, product.status]);

  const {
    id,
    name,
    regularPrice,
    discountedPrice,
    targetUsersCount,
    joinedUsers,
    targetDate,
    mainImage,
    createdAt,
    status,
  } = updatedProduct;

  const participants = joinedUsers?.length ?? 0;
  const progress =
    targetUsersCount > 0
      ? Math.min(Math.round((participants / targetUsersCount) * 100), 100)
      : 0;

  const isInWishlist = isInWishlistPage || wishlistIds.includes(id);

  useEffect(() => {
    const i = setInterval(() => forceTick((v) => v + 1), 60_000);
    return () => clearInterval(i);
  }, []);

  const timeLeft = useMemo(() => {
    const now = new Date();
    const end = new Date(targetDate);
    let diff = end.getTime() - now.getTime();

    if (diff <= 0) return "נסגר";

    const minute = 1000 * 60;
    const hour = minute * 60;
    const day = hour * 24;

    const days = Math.floor(diff / day);
    if (days >= 1) return ` ${days} ימים `;

    const hours = Math.floor(diff / hour);
    diff %= hour;
    const minutes = Math.floor(diff / minute);

    return `${minutes}ש${hours}ד`;
  }, [targetDate]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuth || !user) return;

    setWishlistLoading(true);
    try {
      const wasInWishlist = wishlistIds.includes(id);

      await toggleWishlistContext(id);

      if (isInWishlistPage && wasInWishlist) {
        onDelete?.(id);
      }
      setAlertMessage(wasInWishlist ? "הוסר מהמועדפים" : "נוסף למועדפים");
      setAlertColor(wasInWishlist ? "bg-red-500" : "bg-green-500");
    } catch {
      setAlertMessage("שגיאה בעדכון מועדפים");
      setAlertColor("bg-red-500");
    } finally {
      setWishlistLoading(false);
    }
  };

  const campaignBadge = useMemo(() => {
    if (status === "COMPLETED") {
      return { text: "הושלם", icon: CheckCircle, color: "bg-green-600" };
    }

    if (status === "FAILED") {
      return { text: "נכשל", icon: XCircle, color: "bg-red-600" };
    }

    if (progress >= 80 && progress < 100) {
      return { text: "קרוב ליעד", icon: Flame, color: "bg-orange-500" };
    }

    if (createdAt) {
      const created = new Date(createdAt);
      const today = new Date();
      if (created.toDateString() === today.toDateString()) {
        return { text: "חדש", icon: Sparkles, color: "bg-indigo-600" };
      }
    }

    return null;
  }, [status, progress, createdAt]);

  const joinedBadge = useMemo(() => {
    const userJoined = joinedProducts.some((p) => p.id === product.id);
    if (userJoined && status === "ACTIVE") {
      return { text: "הצטרפת", icon: CheckCircle, color: "bg-green-500" };
    }
    return null;
  }, [joinedProducts, product.id, status]);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onDelete?.(id);
      setShowDeletePopup(false);
      setAlertMessage("המוצר נמחק בהצלחה");
      setAlertColor("bg-green-500");
    } catch {
      setAlertMessage("שגיאה במחיקת המוצר");
      setAlertColor("bg-red-500");
    }
  };

  const progressColor = status === "FAILED" ? "bg-red-500" : status === "COMPLETED" ? "bg-green-600" : "bg-indigo-600";
  const formatNumber = (num: number) => num.toLocaleString("he-IL");

  return (
    <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition cursor-pointer rtl">
      <div className="relative h-64">
        <Image src={mainImage} alt={name} fill className="object-cover" unoptimized />

        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-3 py-1 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold shadow">
          <Timer size={14} />
          {timeLeft}
        </div>

        {joinedBadge && (
          <div className={`absolute bottom-20 left-3 z-10 ${joinedBadge.color} text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow`}>
            <joinedBadge.icon size={14} />
            {joinedBadge.text}
          </div>
        )}

        {isAuth && (
          <button
            onClick={toggleWishlist}
            disabled={wishlistLoading}
            className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-lg flex items-center justify-center hover:scale-110 transition"
          >
            {isInWishlist ? (
              <AiFillHeart className="text-red-500 w-6 h-6" />
            ) : (
              <AiOutlineHeart className="text-gray-700 w-6 h-6" />
            )}
          </button>
        )}

        {campaignBadge && (
          <div className={`absolute bottom-3 right-3 z-10 ${campaignBadge.color} text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow`}>
            <campaignBadge.icon size={14} />
            {campaignBadge.text}
          </div>
        )}

        {isAuth && user?.role === "ADMIN" && (
          <div className="absolute bottom-3 left-3 z-10 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/products/edit/${id}`);
              }}
              className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center hover:bg-yellow-500"
            >
              <Pencil size={16} className="text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeletePopup(true);
              }}
              className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600"
            >
              <Trash2 size={16} className="text-white" />
            </button>
          </div>
        )}

        <div onClick={() => router.push(`/products/${id}`)} className="absolute inset-0" />
      </div>

      <div className="p-4 text-right">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{name}</h3>

        <div className="flex items-center gap-2 mb-2 justify-end">
          <span className="text-green-600 font-bold text-xl">
            ₪{formatNumber(discountedPrice)}
          </span>
          {regularPrice > discountedPrice && (
            <span className="line-through text-gray-400 text-sm">
              ₪{formatNumber(regularPrice)}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-2">
          משתתפים: {formatNumber(participants)} / {formatNumber(targetUsersCount)} ({progress}%)
        </p>

        <div className="w-full bg-gray-200 h-4 rounded-full relative mb-3">
          <div
            className={`${progressColor} h-full rounded-full transition-all`}
            style={{ width: `${progress}%` }}
          />
          <span className="absolute left-1/2 top-0 -translate-x-1/2 text-xs font-semibold text-white">
            {progress}%
          </span>
        </div>

        <button
          onClick={() => router.push(`/products/${id}`)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:from-purple-600 hover:to-indigo-500 transition"
        >
          לצפייה במוצר <ArrowRight size={18} />
        </button>
      </div>

      {showDeletePopup && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-4 w-[90%] max-w-sm">
            <Alert message="האם אתה בטוח שברצונך למחוק את המוצר?" className="text-center text-black" />
            <div className="flex gap-2 mt-3 justify-end">
              <button
                onClick={() => setShowDeletePopup(false)}
                className="px-4 py-1 rounded bg-gray-200"
              >
                ביטול
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-1 rounded bg-red-500 text-white"
              >
                מחק
              </button>
            </div>
          </div>
        </div>
      )}

      {alertMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setAlertMessage("")}
        >
          <div
            className={`rounded-xl p-4 text-white font-semibold ${alertColor}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Alert message={alertMessage} />
          </div>
        </div>
      )}
    </div>
  );
}
