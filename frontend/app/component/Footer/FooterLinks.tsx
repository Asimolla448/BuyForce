interface FooterLinksProps {
  title: string;
  links: string[];
}

export default function FooterLinks({ title, links }: FooterLinksProps) {
  return (
    <div>
      <h3 className="font-semibold mb-4 text-white">{title}</h3>
      <ul className="space-y-2">
        {links.map((link, i) => (
          <li key={i}>
            <a 
              href="#" 
              className="hover:text-white transition duration-200"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
