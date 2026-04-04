"use client";

import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

export default function Header({ title = "Doctor Management" }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  // 🔥 close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="sticky top-0 z-20 flex justify-center mb-6">

      <div className="w-full max-w-7xl flex items-center justify-between px-6 py-3
      bg-white/60 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-xl">

        {/* 🔹 LEFT */}
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-400 tracking-wide">
            Dashboard / Doctors
          </span>

          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
            {title}
          </h1>

          <p className="text-xs text-gray-500">
            Manage doctor records and licenses
          </p>
        </div>

        {/* 🔹 RIGHT */}
        <div className="flex items-center gap-5">

          {/* 🔔 NOTIFICATION */}
          <button className="relative group p-2 rounded-xl hover:bg-white/60 transition">

            <div className="absolute inset-0 rounded-xl bg-blue-400 blur-xl opacity-0 group-hover:opacity-20 transition" />

            <Bell className="w-5 h-5 text-gray-600 group-hover:text-blue-600 relative z-10" />

            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] px-1 rounded-full">
              3
            </span>
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200" />

          {/* 👤 PROFILE DROPDOWN */}
          <div className="relative" ref={dropdownRef}>

            {/* TRIGGER */}
            <div
              onClick={() => setOpen(!open)}
              className="flex items-center gap-3 cursor-pointer px-3 py-1.5 rounded-xl hover:bg-white/60 transition"
            >
              <div className="relative">
                <Image
                  src="/images/doctor.png"
                  alt="Profile"
                  width={34}
                  height={34}
                  className="rounded-full object-cover border border-gray-300 shadow-sm"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
              </div>

              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-800">Admin</p>
                <p className="text-[11px] text-gray-500">admin@test.com</p>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition ${
                  open ? "rotate-180" : ""
                }`}
              />
            </div>

            {/* 🔥 DROPDOWN */}
            {open && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 animate-in fade-in zoom-in-95">

                <button className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 transition">
                  <User size={16} />
                  Profile
                </button>

                <button className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 transition">
                  <Settings size={16} />
                  Settings
                </button>

                <div className="my-1 border-t" />

                <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition">
                  <LogOut size={16} />
                  Logout
                </button>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}