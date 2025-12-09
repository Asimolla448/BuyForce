import Button from "../Button";

export default function HeroSection() {
  return (
    <section className="bg-linear-to-br from-blue-500 to-purple-700 h-[400px] flex items-center text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl font-bold mb-4">קנייה קבוצתית חכמה</h1>
        <p className="text-xl mb-8 opacity-90">
          התחברו לקבוצות רכישה וקבלו מחירים סיטונאיים על מוצרים איכותיים
        </p>
        <div className="flex justify-center gap-4">
          <Button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
            התחל עכשיו
          </Button>

          <a href="#info">
          <Button  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition">
            איך זה עובד?
          </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
