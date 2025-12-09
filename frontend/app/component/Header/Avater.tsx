import Image from "next/image";

export default function Avater() {
  return (
    <Image 
      src="/file.svg"  // קישור לתמונה או קובץ SVG בפרויקט
      width={32}
      height={32}
      alt="Profile"
      className="rounded-full"
    />
  );
}
