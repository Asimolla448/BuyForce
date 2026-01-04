'use client';

import { useEffect, useState, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import api from "../../../api";
import { useCategoryContext } from "../../../context/CategoryContext";

type ProductForm = {
  name: string;
  content: string;
  regularPrice: number;
  discountPrice: number;
  requiredUsers: number;
  targetDate: string;
  supplier: string;
  status: "ACTIVE" | "COMPLETED" | "FAILED";
  category: string;
  mainImage: File | null;
  images: File[];
  videos: File[];
};

type ProductData = {
  id: number;
  name: string;
  content: string;
  regularPrice: number;
  discountPrice: number;
  requiredUsers: number;
  targetDate: string;
  supplier: string;
  status: "ACTIVE" | "COMPLETED" | "FAILED";
  category: string;
  mainImage: string;
  images: string[];
  videos: string[];
};

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string | undefined;
  const { categories } = useCategoryContext();

  const [form, setForm] = useState<ProductForm>({
    name: "",
    content: "",
    regularPrice: 0,
    discountPrice: 0,
    requiredUsers: 1,
    targetDate: "",
    supplier: "",
    status: "ACTIVE",
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!productId) return;
    async function fetchProduct() {
      try {
        const res = await api.get<ProductData>(`/products/${productId}`);
        const data = res.data;
        setForm({
          name: data.name || "",
          content: data.content || "",
          regularPrice: data.regularPrice || 0,
          discountPrice: data.discountPrice || 0,
          requiredUsers: data.requiredUsers || 1,
          targetDate: data.targetDate ? data.targetDate.slice(0, 16) : "",
          supplier: data.supplier || "",
          status: data.status || "ACTIVE",
          category: data.category || "",
          mainImage: null,
          images: [],
          videos: [],
        });
        setMainImagePreview(data.mainImage || null);
        setImagePreviews(data.images || []);
        setVideoPreviews(data.videos || []);
      } catch (err) {
        console.error(err);
        setAlertMessage("לא ניתן לטעון את המוצר");
        setAlertTextColor("text-red-600");
      }
    }
    fetchProduct();
  }, [productId]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await api.get<ProductData[]>("/products");
        const count: Record<string, number> = {};
        res.data.forEach(p => {
          if (p.status === "ACTIVE") count[p.category] = (count[p.category] || 0) + 1;
        });
        setActiveDealsCount(count);
      } catch (err) {
        console.error(err);
      }
    }
    fetchProducts();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const immutableFields = ["regularPrice", "discountPrice", "requiredUsers", "targetDate", "supplier", "status"];
    if (immutableFields.includes(name)) return;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === "category") setShowDropdown(true);
  };

  const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm(prev => ({ ...prev, mainImage: file }));
    setMainImagePreview(file ? URL.createObjectURL(file) : mainImagePreview);
  };

  const handleFilesChange = (e: ChangeEvent<HTMLInputElement>, type: "images" | "videos") => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setForm(prev => ({ ...prev, [type]: [...prev[type], ...files] }));
    if (type === "images") setImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    else setVideoPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const handleRemoveFile = (index: number, type: "images" | "videos") => {
    setForm(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== index) }));
    if (type === "images") setImagePreviews(prev => prev.filter((_, i) => i !== index));
    else setVideoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;

    if (form.category && !categories.some(cat => cat.name === form.category)) {
      setAlertMessage("הקטגוריה שבחרת אינה קיימת ברשימה");
      setAlertTextColor("text-red-600");
      return;
    }

    try {
      const formData = new FormData();
      if (form.mainImage) formData.append("mainImage", form.mainImage);
      form.images.forEach(file => formData.append("images", file));
      form.videos.forEach(file => formData.append("videos", file));
      if (form.name) formData.append("name", form.name);
      if (form.category) formData.append("category", form.category);

      setIsUploading(true);
      setUploadProgress(0);

      await api.patch(`/products/${productId}`, formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });

      setAlertMessage("המוצר עודכן בהצלחה!");
      setAlertTextColor("text-green-600");
      setIsUploading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setAlertMessage("אירעה שגיאה בעדכון המוצר");
      setAlertTextColor("text-red-600");
      setIsUploading(false);
    }
  };

  const filteredCategories = categories.filter(cat => cat.name.toLowerCase().includes(form.category.toLowerCase()));

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">ערוך מוצר</h1>

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
          <input type="text" name="name" value={form.name} onChange={handleChange} className="border p-2 rounded-lg w-full" />
        </div>

        <div>
          <label className="block font-medium mb-1">תיאור מוצר</label>
          <textarea name="content" value={form.content} onChange={handleChange} className="border p-2 rounded-lg w-full" />
        </div>

        <div className="relative">
          <label className="block font-medium mb-1">קטגוריה</label>
          <input type="text" name="category" value={form.category} onChange={handleChange} onFocus={() => setShowDropdown(true)} className="border p-2 rounded-lg w-full" />
          {showDropdown && (
            <div className="absolute z-10 bg-white border w-full max-h-48 overflow-y-auto mt-1 rounded shadow">
              {filteredCategories.map(cat => (
                <div key={cat.id} onClick={() => { setForm(prev => ({ ...prev, category: cat.name })); setShowDropdown(false); }} className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
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
          {mainImagePreview && <div className="mt-2 relative w-full h-60 border rounded-lg overflow-hidden bg-gray-100"><Image src={mainImagePreview} alt="Preview" fill className="object-cover" /></div>}
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

        <button type="submit" className={`relative flex items-center justify-center bg-blue-500 text-white p-3 mt-2 rounded-lg font-semibold disabled:opacity-50 hover:bg-blue-600 transition`} disabled={isUploading}>
          {isUploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              מעלה... {uploadProgress}%
            </>
          ) : "עדכן מוצר"}
        </button>

      </form>
    </div>
  );
}
