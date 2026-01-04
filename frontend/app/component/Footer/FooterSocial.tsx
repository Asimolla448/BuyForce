import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";

export default function FooterSocial() {
  const social = [
    { icon: <FaFacebookF />, link: "#", label: "Facebook" },
    { icon: <FaInstagram />, link: "#", label: "Instagram" },
    { icon: <FaLinkedinIn />, link: "#", label: "LinkedIn" },
    { icon: <FaTwitter />, link: "#", label: "Twitter" },
  ];

  return (
    <div>
      <h3 className="font-semibold mb-4 text-white">עקוב אחרינו</h3>
      <div className="flex space-x-4 text-xl">
        {social.map((s, i) => (
          <a 
            key={i} 
            href={s.link} 
            aria-label={s.label}
            className="hover:text-white transition duration-200"
          >
            {s.icon}
          </a>
        ))}
      </div>
    </div>
  );
}
