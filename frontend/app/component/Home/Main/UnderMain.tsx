import {
  FaMobileAlt,
  FaLaptop,
  FaTv,
  FaHome,
  FaPlane,
  FaCouch,
} from "react-icons/fa";

export default function UnderMain() {
  const categories = [
    { icon: <FaMobileAlt />, label: "סמארטפונים" },
    { icon: <FaLaptop />, label: "מחשבים" },
    { icon: <FaTv />, label: "טלוויזיות" },
    { icon: <FaHome />, label: "בית וגן" },
    { icon: <FaPlane />, label: "נסיעות" },
    { icon: <FaCouch />, label: "ריהוט" },
  ];

  const steps = [
    { num: 1, title: "בחר מוצר", text: "מצא מוצר והצטרף עם ₪1 בלבד" },
    { num: 2, title: "הקבוצה מתמלאת", text: "כשהקבוצה מלאה ההנחה נפתחת" },
    { num: 3, title: "קבל את המוצר", text: "משלוח מהיר עד הבית" },
  ];

  return (
    <section className="py-20 bg-linear-to-b from-white to-gray-50">
      <h2 className="text-3xl font-bold text-center mb-12">קטגוריות מובילות</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 max-w-6xl mx-auto px-6">
        {categories.map((c, i) => (
          <div
            key={i}
            className="group flex flex-col items-center cursor-pointer"
          >
            <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-white shadow-md group-hover:shadow-xl transition text-3xl text-purple-600">
              {c.icon}
            </div>
            <p className="mt-3 text-gray-700 font-medium group-hover:text-purple-600 transition">
              {c.label}
            </p>
          </div>
        ))}
      </div>

      <h2 id="info" className="text-3xl font-bold text-center mt-24 mb-12">איך זה עובד</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">
        {steps.map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-md p-8 text-center hover:shadow-xl transition"
          >
            <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl mx-auto mb-6">
              {s.num}
            </div>
            <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
            <p className="text-gray-600">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
