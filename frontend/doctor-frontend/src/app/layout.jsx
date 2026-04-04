import "../styles/globals.css";
import { Toaster } from "react-hot-toast";
import { Inter } from "next/font/google";
import ReactQueryProvider from "@/src/providers/ReactQueryProvider";

// PREMIUM FONT
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Doctor License Management",
  description: "Manage doctor licenses and records",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-800 antialiased">
        {/* GLOBAL PROVIDERS */}
        <ReactQueryProvider>
          {/* PREMIUM TOAST */}
          <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={12}
            containerStyle={{
              top: 20,
            }}
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: "16px",
                background: "rgba(17, 24, 39, 0.95)",
                color: "#fff",
                padding: "14px 18px",
                fontSize: "14px",
                fontWeight: "500",
                backdropFilter: "blur(12px)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              },
              success: {
                icon: null,
                style: {
                  background: "linear-gradient(135deg, #16a34a, #22c55e)",
                },
              },
              error: {
                icon: null,
                style: {
                  background: "linear-gradient(135deg, #dc2626, #ef4444)",
                },
              },
            }}
          />

          {/* APP ROOT */}
          <main className="min-h-screen flex flex-col">{children}</main>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
