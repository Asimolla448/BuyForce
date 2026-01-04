'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../component/Input"; 
import Button from "../component/Button";
import api from "../api"; 
import { AxiosError } from "axios";
import Logo from "../component/Header/Logo";
import { useAuth } from "../context/AuthProvider";

export default function Register() {
  const router = useRouter();
  const { login } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('סיסמאות לא תואמות');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await api.post<{ accessToken: string }>('/auth/register', {
        firstName,
        lastName,
        email,
        birthDate,
        password,
      });

      if (res.data.accessToken) {
        login(res.data.accessToken);
        router.push('/');
      } else {
        router.push('/login');
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        setError('שגיאה בהרשמה');
      } else {
        setError('שגיאה בהרשמה');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <Logo />
      <div className="w-full max-w-md p-6 sm:p-8 lg:p-10 bg-white rounded-3xl shadow-lg">
        <div className="text-center mb-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">הרשמה</h2>
          <p className="text-gray-600 text-sm sm:text-base">צרו חשבון חדש והצטרפו אלינו</p>
        </div>

        <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Input
              type="text"
              placeholder="שם פרטי"
              value={firstName}
              onChange={setFirstName}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-right"
            />
            <Input
              type="text"
              placeholder="שם משפחה"
              value={lastName}
              onChange={setLastName}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-right"
            />
          </div>

          <Input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={setEmail}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-right"
          />
          <Input
            type="date"
            value={birthDate}
            onChange={setBirthDate}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-right"
          />
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-right"
          />
          <Input
            type="password"
            placeholder="אימות סיסמה"
            value={confirmPassword}
            onChange={setConfirmPassword}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-right"
          />

          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <input type="checkbox" required className="rounded border-gray-300 text-indigo-600" />
            <span className="text-gray-600">אני מסכים לתנאי השימוש ומדיניות הפרטיות</span>
          </div>

          {error && <p className="text-red-500 text-xs sm:text-sm">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-linear-to-r from-indigo-600 to-purple-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition"
          >
            {loading ? 'טוען...' : 'הרשם'}
          </Button>
        </form>

        <div className="mt-5 sm:mt-6 text-center text-sm sm:text-base">
          <Button
            onClick={() => router.push('/login')}
            className="text-indigo-600 hover:text-indigo-500 font-semibold p-0"
          >
            התחבר כאן
          </Button>
          ?יש לך כבר חשבון{" "}
        </div>
      </div>
    </div>
  );
}
