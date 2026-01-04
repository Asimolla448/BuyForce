'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '../../api';
import Image from 'next/image';
import Checkout from '../../component/Checkout';
import { useAuth } from '../../context/AuthProvider';
import { RiArrowGoBackFill } from "react-icons/ri";


export type Product = {
  id: number;
  name: string;
  regularPrice: number;
  discountedPrice: number;
  targetUsersCount: number;
  joinedUsers: { id: number }[];
  wishlistUsers?: { id: number }[];
  targetDate: string;
  supplier: string;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
  category: string;
  mainImage: string;
  images?: string[];
  videos?: string[];
  content?: string;
};

export default function ProductPage() {
  const params = useParams();
  const { joinedProducts, isAuth, joinProduct } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainMedia, setMainMedia] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [authPopup, setAuthPopup] = useState(false);

  useEffect(() => {
    if (!params.id) return;

    const productIdNum = Number(params.id);
    if (isNaN(productIdNum)) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const data: Product = await api
          .get(`/products/${productIdNum}`)
          .then(res => res.data);
        setProduct({ ...data, id: Number(data.id) });
        setMainMedia(data.mainImage);
        setIsVideo(false);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  if (loading) return <p className="text-center mt-10 text-gray-500 text-lg">טוען מוצר...</p>;
  if (!product) return <p className="text-center mt-10 text-gray-500 text-lg">מוצר לא נמצא</p>;

  const userJoined = joinedProducts.some(p => Number(p.id) === Number(product.id));

  const handleJoinClick = () => {
    if (!isAuth) {
      setAuthPopup(true);
    } else if (!userJoined) {
      setCheckoutOpen(true);
    }
  };

  const handlePaymentSuccess = async () => {
    if (!product) return;
    try {
      await joinProduct(product.id);
      setCheckoutOpen(false);
      alert('הצטרפת בהצלחה למוצר!');
    } catch (err) {
      console.error('Failed to join product after payment', err);
      alert('שגיאה בהצטרפות למוצר לאחר התשלום');
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('he-IL');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">

      <div className="flex items-center justify-between">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">{product.name}</h1>
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-2xl transition shadow-md hover:shadow-lg"
        >
           חזרה <RiArrowGoBackFill />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        <div className="lg:w-1/2 flex flex-col gap-3">
          <div className="relative w-full h-72 sm:h-96 bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
            {mainMedia && (
              isVideo ? (
                <video src={mainMedia} controls className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <Image src={mainMedia} alt={product.name} fill className="object-cover rounded-2xl" unoptimized/>
              )
            )}
          </div>

          <div className="flex gap-3 overflow-x-auto py-2">
            {[product.mainImage, ...(product.images || []), ...(product.videos || [])].map(
              (media, idx) => {
                const isVid = (product.videos || []).includes(media);
                return (
                  <div
                    key={idx}
                    className="w-24 sm:w-28 h-24 sm:h-28 shrink-0 relative rounded-xl border hover:border-indigo-500 cursor-pointer overflow-hidden shadow-md transition-all duration-300"
                    onClick={() => {
                      setMainMedia(media);
                      setIsVideo(isVid);
                    }}
                  >
                    {isVid ? (
                      <video src={media} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <Image src={media} alt={`Media ${idx}`} fill className="object-cover rounded-xl" unoptimized/>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>

        <div className="lg:w-1/2 flex flex-col gap-4">
          <p className="text-2xl sm:text-3xl font-bold text-green-600">
            ₪{formatNumber(product.discountedPrice)}
            {product.discountedPrice < product.regularPrice && (
              <span className="line-through text-gray-400 text-base sm:text-lg ml-2">
                ₪{formatNumber(product.regularPrice)}
              </span>
            )}
          </p>

          <div className="space-y-2 text-gray-700 text-sm sm:text-base">
            <p><span className="font-semibold">משתתפים:</span> {formatNumber(product.joinedUsers.length)} מתוך {formatNumber(product.targetUsersCount)}</p>
            <p><span className="font-semibold">קטגוריה:</span> {product.category}</p>
            <p><span className="font-semibold">ספק:</span> {product.supplier}</p>
          </div>

          <div className="text-gray-800 mt-4 p-4 sm:p-6 rounded-2xl bg-gray-50 shadow-inner border border-gray-100 leading-relaxed text-sm sm:text-base">
            <h3 className="font-semibold mb-2 sm:mb-3 text-base sm:text-lg">תיאור המוצר:</h3>
            <p>{product.content || 'למוצר זה אין תיאור נוסף.'}</p>
          </div>

          {product.status === 'ACTIVE' && !userJoined && (
            <button
              className="mt-4 sm:mt-6 bg-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-lg hover:bg-indigo-700 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 sm:gap-3"
              onClick={handleJoinClick}
            >
              הצטרף עכשיו - ₪1
            </button>
          )}

          {userJoined && (
            <p className="mt-4 font-semibold text-green-600">כבר הצטרפת למוצר ✅</p>
          )}
        </div>
      </div>

      {/* Checkout only if user not joined */}
      {checkoutOpen && product && !userJoined && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-3xl w-full relative overflow-y-auto max-h-[90vh] shadow-2xl">
            <button
              className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-500 hover:text-gray-800 font-bold text-lg sm:text-xl"
              onClick={() => setCheckoutOpen(false)}
            >
              ✕
            </button>
            <Checkout
              productId={Number(product.id)}
              totalAmount={product.discountedPrice}
              onSuccess={handlePaymentSuccess}
            />
          </div>
        </div>
      )}

      {authPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full relative shadow-2xl text-center">
            <button
              className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-500 hover:text-gray-800 font-bold text-lg sm:text-xl"
              onClick={() => setAuthPopup(false)}
            >
              ✕
            </button>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-gray-900">עליך להיות מחובר</h2>
            <p className="text-gray-700 text-sm sm:text-base">
              כדי להצטרף למוצר, עליך להיכנס לחשבון או להירשם.
            </p>
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center gap-3">
              <a
                href="/login"
                className="bg-green-600 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:bg-green-700 transition shadow-md font-semibold"
                onClick={() => setAuthPopup(false)}
              >
                התחבר
              </a>
              <a
                href="/register"
                className="bg-blue-600 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:bg-blue-700 transition shadow-md font-semibold"
                onClick={() => setAuthPopup(false)}
              >
                הרשמה
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
