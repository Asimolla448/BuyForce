import Logo from "../Header/Logo";

export default function FooterBrand() {
  return (
    <div className="text-white">
      <div className="flex items-center space-x-2 mb-4">
       <Logo/>
      </div>
      <p className="text-gray-300">
        הפלטפורמה הישראלית הראשונה לקנייה קבוצתית חכמה
      </p>
    </div>
  );
}
