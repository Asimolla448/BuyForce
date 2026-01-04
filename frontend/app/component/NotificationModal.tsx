'use client';

interface NotificationModalProps {
  title: string;
  message: string;
  onClose: () => void;
}

export default function NotificationModal({ title, message, onClose }: NotificationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto bg-white w-full max-w-md rounded-xl shadow-2xl p-5 animate-fadeIn">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-700 mb-4 leading-relaxed">{message}</p>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}
