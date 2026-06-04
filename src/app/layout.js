import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Luxe Cafe POS",
  description: "Modern POS System for Cafes and Restaurants",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en suppressHydrationWarning"
      className={`${geistSans.variable} ${geistMono.variable} h-full bg-[#0f0f10] text-[#e4e4e7] antialiased`}
    >
      <body className="h-full flex flex-col m-0 p-0 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}