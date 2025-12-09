import FooterCTA from "./Footer/FooterCTA";
import FooterBrand from "./Footer/FooterBrand";
import FooterLinks from "./Footer/FooterLinks";
import FooterSocial from "./Footer/FooterSocial";
import FooterCopyright from "./Footer/FooterCopyright";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <FooterCTA />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
        <FooterBrand />
        <FooterLinks 
          title="החברה" 
          links={["אודות", "צור קשר", "קריירה"]} 
        />
        <FooterLinks 
          title="תמיכה" 
          links={["מרכז עזרה", "תנאי שימוש", "מדיניות פרטיות"]} 
        />
        <FooterSocial />
      </div>
      <FooterCopyright />
    </footer>
  );
}
