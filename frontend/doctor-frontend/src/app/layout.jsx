import "../styles/globals.css";
import { Inter } from "next/font/google";
import ReactQueryProvider from "@/src/providers/ReactQueryProvider";
import ToasterProvider from "../providers/ToasterProvider";

// PREMIUM FONT
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "DocCare",
  description: "Manage doctor licenses and records",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-800 antialiased">

        {/* GLOBAL PROVIDERS */}
        <ReactQueryProvider>

          {/* APP ROOT */}
          <main className="min-h-screen flex flex-col">
            {children}
          </main>

          {/* FIXED TOASTER (CLIENT COMPONENT) */}
          <ToasterProvider />

        </ReactQueryProvider>

      </body>
    </html>
  );
}