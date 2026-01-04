"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../component/Input";
import Button from "../component/Button";
import api from "../api";
import { AxiosError } from "axios";
import Logo from "../component/Header/Logo";
import { useAuth } from "../context/AuthProvider";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post<{ accessToken: string }>("/auth/login", {
        email,
        password,
      });

      login(res.data.accessToken);
      router.push("/");
    } catch (err) {
      if (err instanceof AxiosError) {
        setError("שגיאה בהתחברות");
      } else {
        setError("שגיאה בהתחברות");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <Logo />

      <div className="w-full max-w-md sm:max-w-lg p-6 sm:p-10 bg-white rounded-3xl shadow-lg">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            התחברות
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            הכניסו את הפרטים שלכם כדי להתחבר
          </p>
        </div>

        <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2 text-right">
              כתובת אימייל
            </label>
            <Input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={setEmail}
              className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-right"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2 text-right">
              סיסמה
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-right"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm sm:text-base text-right">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full bg-linear-to-r from-indigo-600 to-purple-600 text-white py-3 sm:py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
          >
            {loading ? "טוען..." : "התחבר"}
          </Button>
        </form>

        <div className="mt-5 sm:mt-6 text-center text-sm sm:text-base">
          <Button
            onClick={() => router.push("/register")}
            className="text-indigo-600 hover:text-indigo-500 font-semibold p-0"
          >
            הרשם כאן
          </Button>
          ?אין לך חשבון{" "}
        </div>
      </div>
    </div>
  );
}
