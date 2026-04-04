"use client";

import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, Stethoscope } from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

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
    bg-gradient-to-b from-blue-700 via-blue-600 to-blue-500 text-white shadow-xl">

      {/* 🔷 TOP */}
      <div>

        {/* 🔥 LOGO / BRAND */}
        <div className="flex items-center gap-3 mb-12">
          <div className="relative w-11 h-11 rounded-xl bg-white/90 flex items-center justify-center shadow-lg">

            {/* Glow */}
            <div className="absolute inset-0 rounded-xl bg-blue-400 blur-xl opacity-20" />

            <Stethoscope className="text-blue-600 relative z-10" size={20} />
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-wide leading-tight">
              MedCare
            </h2>
            <p className="text-[10px] text-white/70">
              Doctor System
            </p>
          </div>
        </div>

        {/* 🔥 MENU */}
        <div className="space-y-2">
          {menu.map((item) => {
            const isActive = pathname === item.path;

            return (
              <div
                key={item.name}
                onClick={() => router.push(item.path)}
                className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-300
                ${
                  isActive
                    ? "bg-white/20 backdrop-blur-lg shadow-md"
                    : "hover:bg-white/10"
                }`}
              >

                {/* LEFT ACTIVE BAR */}
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-white" />
                )}

                {/* ICON */}
                <div
                  className={`transition ${
                    isActive
                      ? "text-white"
                      : "text-white/80 group-hover:text-white"
                  }`}
                >
                  {item.icon}
                </div>

                {/* TEXT */}
                <span
                  className={`text-sm font-medium transition ${
                    isActive
                      ? "text-white"
                      : "text-white/80 group-hover:text-white"
                  }`}
                >
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🔻 BOTTOM PROFILE */}
      <div className="pt-5 border-t border-white/20">

        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition cursor-pointer">

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center font-semibold shadow">
            A
          </div>

          {/* Info */}
          <div className="leading-tight">
            <p className="text-sm font-medium">Admin</p>
            <p className="text-xs text-white/70">admin@test.com</p>
          </div>
        </div>

      </div>
    </div>
  );
}