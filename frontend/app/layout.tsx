import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./component/Header";
import Footer from "./component/Footer";
import { AuthProvider } from "./context/AuthProvider";
import { CategoryProvider } from "./context/CategoryContext";
import { SearchProvider } from "./context/SearchContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BuyForce",
  description:
    "BuyForce is a commerce platform that leverages collective purchasing power to unlock wholesale-level pricing for consumers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <CategoryProvider>
            <SearchProvider>
              <Header />
              {children}
              <Footer />
            </SearchProvider>
          </CategoryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
