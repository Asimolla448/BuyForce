import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'res.cloudinary.com',          // תמונות מ־Cloudinary
      'cdn-icons-png.flaticon.com',  // תמונות מ־Flaticon
    ],
  },
};

export default nextConfig;
