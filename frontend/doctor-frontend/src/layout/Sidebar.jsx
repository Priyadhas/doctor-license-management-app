"use client";

import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, Stethoscope } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    } catch {
      console.error("Invalid user data in storage");
    } finally {
      setMounted(true);
    }
  }, []);

  if (!mounted) return null;

  const menu = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      name: "Doctors",
      path: "/doctors",
      icon: <Stethoscope size={18} />,
    },
  ];

  return (
    <div className="w-64 h-screen fixed left-0 top-0 flex flex-col justify-between px-5 py-6
    bg-gradient-to-b from-blue-700 via-blue-600 to-blue-500 text-white shadow-2xl">

      {/* TOP */}
      <div>

        {/* BRAND */}
        <div className="flex items-center gap-3 mb-12">
          <div className="relative w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-lg">
            <div className="absolute inset-0 rounded-xl bg-blue-400 blur-xl opacity-20" />
            <Stethoscope className="text-blue-600 relative z-10" size={20} />
          </div>

          <div className="leading-tight">
            <h2 className="text-lg font-semibold tracking-wide">
              DocCare
            </h2>
            <p className="text-[10px] text-white/70">
              Doctor License Management
            </p>
          </div>
        </div>

        {/* MENU */}
        <div className="space-y-2">
          {menu.map((item) => {
            const isActive = pathname === item.path;

            return (
              <div
                key={item.name}
                onClick={() => router.push(item.path)}
                className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-300 group
                ${
                  isActive
                    ? "bg-white/20 backdrop-blur-lg shadow-md"
                    : "hover:bg-white/10"
                }`}
              >

                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r" />
                )}

                <div
                  className={`transition-all ${
                    isActive
                      ? "text-white"
                      : "text-white/80 group-hover:text-white"
                  }`}
                >
                  {item.icon}
                </div>

                <span
                  className={`text-sm font-medium transition-all ${
                    isActive
                      ? "text-white"
                      : "text-white/80 group-hover:text-white"
                  }`}
                >
                  {item.name}
                </span>

                <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>

      {/* PROFILE */}
      <div className="pt-5 border-t border-white/20">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 transition cursor-pointer">

          {/* AVATAR */}
          <div className="relative">
            <Image
              src="/images/doctor.png"
              alt="User"
              width={36}
              height={36}
              className="rounded-full object-cover border border-white/30 shadow-md"
            />

            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-blue-600 rounded-full" />
          </div>

          {/* USER INFO */}
          <div className="leading-tight">
            <p className="text-sm font-medium text-white">
              {user?.role || "User"}
            </p>
            <p className="text-[11px] text-white/70">
              {user?.email || "No Email"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}