'use client';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-t-indigo-600 border-gray-200 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-700 font-medium">טוען...</p>
      </div>
    </div>
  );
}
