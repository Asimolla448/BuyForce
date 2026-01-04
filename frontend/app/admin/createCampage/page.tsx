'use client';

import { useEffect, useState, ChangeEvent } from "react";
import Image from "next/image";
import api from "../../api";
import { useCategoryContext } from "../../context/CategoryContext";

type ProductForm = {
  name: string;
  content: string;
  regularPrice: number;
  discountPrice: number;
  requiredUsers: number;
  targetDate: string;
  supplier: string;
  category: string;
  mainImage: File | null;
  images: File[];
  videos: File[];
};

type Product = {
  id: number;
  category: string;
  status: "ACTIVE" | "COMPLETED" | "FAILED";
};

export default function Page() {
  const { categories } = useCategoryContext();

  const [form, setForm] = useState<ProductForm>({
    name: "",
    content: "",
    regularPrice: 0,
    discountPrice: 0,
    requiredUsers: 1,
    targetDate: "",
    supplier: "",
    category: "",
    mainImage: null,
    images: [],
    videos: [],
  });

  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertTextColor, setAlertTextColor] = useState<string>("text-black");
  const [activeDealsCount, setActiveDealsCount] = useState<Record<string, number>>({});
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data } = await api.get<Product[]>("/products");
        const count: Record<string, number> = {};
        data.forEach(p => {
          if (p.status === "ACTIVE") count[p.category] = (count[p.category] || 0) + 1;
        });
        setActiveDealsCount(count);
      } catch (err) {
        console.error(err);
      }
    }
    fetchProducts();
  }, [refreshFlag]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === "category") setShowDropdown(true);
  };

  const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm(prev => ({ ...prev, mainImage: file }));
    setMainImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleFilesChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: "images" | "videos"
  ) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setForm(prev => ({ ...prev, [type]: [...prev[type], ...files] }));

    if (type === "images") {
      setImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    } else {
      setVideoPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    }
  };

  const handleRemoveFile = (index: number, type: "images" | "videos") => {
    setForm(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
    if (type === "images") {
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      setVideoPreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.name || !form.content || !form.regularPrice || !form.discountPrice ||
      !form.requiredUsers || !form.targetDate || !form.supplier || !form.category || !form.mainImage
    ) {
      setAlertMessage("אנא מלאו את כל השדות הנדרשים");
      setAlertTextColor("text-yellow-600");
      return;
    }

    if (!categories.some(cat => cat.name === form.category)) {
      setAlertMessage("הקטגוריה שבחרת אינה קיימת ברשימה");
      setAlertTextColor("text-red-600");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("mainImage", form.mainImage);
      form.images.forEach(file => formData.append("images", file));
      form.videos.forEach(file => formData.append("videos", file));
      formData.append("name", form.name);
      formData.append("content", form.content);
      formData.append("regularPrice", String(form.regularPrice));
      formData.append("discountPrice", String(form.discountPrice));
      formData.append("requiredUsers", String(form.requiredUsers));
      formData.append("targetDate", form.targetDate);
      formData.append("supplier", form.supplier);
      formData.append("category", form.category);
      formData.append("status", "ACTIVE");

      setIsUploading(true);
      setUploadProgress(0);

      await api.post("/products/upload", formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });

      setAlertMessage("המוצר נוצר בהצלחה!");
      setAlertTextColor("text-green-600");

      setForm({
        name: "",
        content: "",
        regularPrice: 0,
        discountPrice: 0,
        requiredUsers: 1,
        targetDate: "",
        supplier: "",
        category: "",
        mainImage: null,
        images: [],
        videos: [],
      });

      setMainImagePreview(null);
      setImagePreviews([]);
      setVideoPreviews([]);
      setRefreshFlag(prev => prev + 1);
      setIsUploading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (error) {
      console.error(error);
      setAlertMessage("אירעה שגיאה בעת יצירת המוצר");
      setAlertTextColor("text-red-600");
      setIsUploading(false);
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(form.category.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">צור מוצר חדש</h1>

      {alertMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50" onClick={() => setAlertMessage(null)}>
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <p className={`text-center font-semibold ${alertTextColor}`}>{alertMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <div>
          <label className="block font-medium mb-1">שם מוצר</label>
          <input type="text" name="name" placeholder="הכנס שם מוצר" value={form.name} onChange={handleChange} className="border p-2 rounded-lg w-full" />
        </div>

        <div>
          <label className="block font-medium mb-1">תיאור מוצר</label>
          <textarea name="content" placeholder="תיאור מוצר" value={form.content} onChange={handleChange} className="border p-2 rounded-lg w-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">מחיר רגיל</label>
            <input type="number" name="regularPrice" placeholder="מחיר רגיל" value={form.regularPrice} onChange={handleChange} className="border p-2 rounded-lg w-full" />
          </div>
          <div>
            <label className="block font-medium mb-1">מחיר מוזל</label>
            <input type="number" name="discountPrice" placeholder="מחיר מוזל" value={form.discountPrice} onChange={handleChange} className="border p-2 rounded-lg w-full" />
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">כמות משתמשים נדרשת</label>
          <input type="number" name="requiredUsers" placeholder="כמות משתמשים נדרשת" value={form.requiredUsers} onChange={handleChange} className="border p-2 rounded-lg w-full" />
        </div>

        <div>
          <label className="block font-medium mb-1">תאריך יעד</label>
          <input type="datetime-local" name="targetDate" value={form.targetDate} onChange={handleChange} className="border p-2 rounded-lg w-full" min={new Date().toISOString().slice(0,16)} />
        </div>

        <div>
          <label className="block font-medium mb-1">ספק</label>
          <input type="text" name="supplier" placeholder="ספק" value={form.supplier} onChange={handleChange} className="border p-2 rounded-lg w-full" />
        </div>

        <div className="relative">
          <label className="block font-medium mb-1">קטגוריה</label>
          <input type="text" name="category" placeholder="בחר קטגוריה" value={form.category} onChange={handleChange} onFocus={() => setShowDropdown(true)} className="border p-2 w-full rounded-lg" />
          {showDropdown && (
            <div className="absolute z-10 bg-white border w-full max-h-48 overflow-y-auto mt-1 rounded shadow">
              {filteredCategories.map(cat => (
                <div
                  key={cat.id}
                  onClick={() => {
                    setForm(prev => ({ ...prev, category: cat.name }));
                    setShowDropdown(false);
                  }}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {cat.name} ({activeDealsCount[cat.name] ?? 0})
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block font-medium mb-1">תמונה ראשית</label>
          <label className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition">
            בחר קובץ
            <input type="file" accept="image/*" onChange={handleMainImageChange} className="hidden" />
          </label>
          {mainImagePreview && (
            <div className="mt-2 relative w-full h-60 border rounded-lg overflow-hidden bg-gray-100">
              <Image src={mainImagePreview} alt="Preview" fill className="object-cover" />
            </div>
          )}
        </div>

        <div>
          <label className="block font-medium mb-1">תמונות נוספות</label>
          <label className="bg-green-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-green-600 transition">
            בחר קבצים
            <input type="file" accept="image/*" multiple onChange={(e) => handleFilesChange(e, "images")} className="hidden" />
          </label>
          {imagePreviews.length > 0 && (
            <div className="flex gap-2 mt-2 overflow-x-auto py-2">
              {imagePreviews.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border">
                  <Image src={img} alt={`Image ${idx}`} fill className="object-cover" />
                  <button type="button" onClick={() => handleRemoveFile(idx, "images")} className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block font-medium mb-1">סרטונים</label>
          <label className="bg-purple-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-600 transition">
            בחר קבצים
            <input type="file" accept="video/*" multiple onChange={(e) => handleFilesChange(e, "videos")} className="hidden" />
          </label>
          {videoPreviews.length > 0 && (
            <div className="flex gap-2 mt-2 overflow-x-auto py-2">
              {videoPreviews.map((vid, idx) => (
                <div key={idx} className="relative w-40 h-28 rounded-lg overflow-hidden border">
                  <video src={vid} className="w-full h-full object-cover" controls />
                  <button type="button" onClick={() => handleRemoveFile(idx, "videos")} className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className={`relative flex items-center justify-center bg-blue-500 text-white p-3 mt-2 rounded-lg font-semibold disabled:opacity-50 hover:bg-blue-600 transition`}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              מעלה... {uploadProgress}%
            </>
          ) : (
            "צור מוצר"
          )}
        </button>

      </form>
    </div>
  );
}
