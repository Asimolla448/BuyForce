"use client";

import { useAuth } from "../context/AuthProvider";
import { useState } from "react";
import Image from "next/image";
import api from "../api";
import { ChevronDown, Trash2, Camera } from "lucide-react";

type FormFields = "firstName" | "lastName" | "email" | "currentPassword" | "newPassword";

interface PopupProps {
  message: string;
  type: "success" | "error" | "confirm";
  onConfirm?: () => void;
  onCancel?: () => void;
}

function Popup({ message, type, onConfirm, onCancel }: PopupProps) {
  if (type === "confirm") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full text-center">
          <p className="mb-4 text-gray-800 font-medium">{message}</p>
          <div className="flex justify-around mt-4">
            <button onClick={onConfirm} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">מחק</button>
            <button onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">ביטול</button>
          </div>
        </div>
      </div>
    );
  }

  const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className={`${bgColor} text-white px-6 py-3 rounded-xl shadow-lg animate-fadeInOut pointer-events-auto`}>
        {message}
      </div>
      <style jsx>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-10px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        .animate-fadeInOut {
          animation: fadeInOut 3s ease forwards;
        }
      `}</style>
    </div>
  );
}

export default function SettingsPage() {
  const { user, refreshUser, logout } = useAuth();
  const [openSettings, setOpenSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [popup, setPopup] = useState<PopupProps | null>(null);

  const [form, setForm] = useState<Record<FormFields, string>>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
  });

  if (!user) return null;

  const handleInputChange = (key: FormFields, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (file: File) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const formData = new FormData();
    formData.append("file", file);
    setPreview(URL.createObjectURL(file));

    try {
      await api.patch("/auth/me/profile-image", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await refreshUser();
      setPopup({ message: "תמונת הפרופיל עודכנה בהצלחה!", type: "success" });
    } catch {
      setPopup({ message: "שגיאה בהעלאת תמונת פרופיל", type: "error" });
    }
  };

  const removeProfileImage = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await api.delete("/auth/me/profile-image", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPreview(null);
      await refreshUser();
      setPopup({ message: "תמונת הפרופיל הוסרה בהצלחה!", type: "success" });
    } catch {
      setPopup({ message: "שגיאה בהסרת תמונת פרופיל", type: "error" });
    }
  };

  const saveProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      const payload: Record<string, string> = {};
      if (form.firstName !== user.firstName && form.firstName) payload.firstName = form.firstName;
      if (form.lastName !== user.lastName && form.lastName) payload.lastName = form.lastName;
      if (form.email !== user.email && form.email) payload.email = form.email;
      if (form.currentPassword) payload.currentPassword = form.currentPassword;
      if (form.newPassword) payload.newPassword = form.newPassword;

      if (!Object.keys(payload).length) {
        setPopup({ message: "לא שינית אף שדה", type: "error" });
        setLoading(false);
        return;
      }

      await api.patch("/auth/me", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setForm(prev => ({ ...prev, currentPassword: "", newPassword: "" }));
      await refreshUser();
      setPopup({ message: "הפרטים עודכנו בהצלחה!", type: "success" });
    } catch {
      setPopup({ message: "שגיאה בעדכון פרופיל", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = () => {
    setPopup({
      message: "האם אתה בטוח שברצונך למחוק את המשתמש?",
      type: "confirm",
      onConfirm: async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
          await api.delete("/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          logout();
          setPopup({ message: "המשתמש נמחק בהצלחה", type: "success" });
        } catch {
          setPopup({ message: "שגיאה במחיקת המשתמש", type: "error" });
        }
      },
      onCancel: () => setPopup(null),
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {popup && (
        <Popup message={popup.message} type={popup.type} onConfirm={popup.onConfirm} onCancel={popup.onCancel} />
      )}

      <div className="flex flex-col items-center gap-4">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border shadow">
          <Image
            src={preview || user.profileImage || "/avatar.png"}
            alt="Profile"
            fill
            className="object-cover"
          />
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer text-blue-600 hover:underline">
          <Camera size={16} />
          שנה תמונת פרופיל
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={e => e.target.files && handleImageUpload(e.target.files[0])}
          />
        </label>

        {user.profileImage && (
          <button
            onClick={removeProfileImage}
            className="text-xs text-red-500 hover:underline"
          >
            הסר תמונת פרופיל
          </button>
        )}
      </div>

      <div className="mt-10 border rounded-xl shadow-sm">
        <button
          onClick={() => setOpenSettings(!openSettings)}
          className="w-full flex items-center justify-between p-4 font-medium"
        >
          הגדרות משתמש
          <ChevronDown className={`transition ${openSettings ? "rotate-180" : ""}`} />
        </button>

        {openSettings && (
          <div className="p-4 space-y-4 border-t bg-gray-50">
            {[
              { label: "שם פרטי", key: "firstName" as FormFields },
              { label: "שם משפחה", key: "lastName" as FormFields },
              { label: "אימייל", key: "email" as FormFields },
            ].map(field => (
              <div key={field.key}>
                <label className="text-sm text-gray-600">{field.label}</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={form[field.key]}
                  onChange={e => handleInputChange(field.key, e.target.value)}
                />
              </div>
            ))}

            <div>
              <label className="text-sm text-gray-600">סיסמה נוכחית (חובה לשינוי אימייל/סיסמה)</label>
              <input
                type="password"
                className="w-full border rounded-lg px-3 py-2"
                value={form.currentPassword}
                onChange={e => handleInputChange("currentPassword", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">סיסמה חדשה</label>
              <input
                type="password"
                className="w-full border rounded-lg px-3 py-2"
                value={form.newPassword}
                onChange={e => handleInputChange("newPassword", e.target.value)}
              />
            </div>

            <button
              onClick={saveProfile}
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              שמור שינויים
            </button>
          </div>
        )}
      </div>

      <div className="mt-12 border border-red-200 rounded-xl p-4">
        <h3 className="text-red-600 font-semibold mb-2">Danger Zone</h3>
        <button
          onClick={deleteUser}
          className="flex items-center gap-2 text-red-600 hover:underline text-sm"
        >
          <Trash2 size={16} />
          מחיקת משתמש
        </button>
      </div>
    </div>
  );
}
