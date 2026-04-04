"use client";

import { Bell, ChevronDown } from "lucide-react";
import Image from "next/image";

export default function Header({ title = "Doctor Management" }) {
  return (
    <div className="sticky top-0 z-20 flex justify-center mb-6">

      {/* 🔥 PREMIUM GLASS HEADER */}
      <div className="w-full max-w-6xl flex items-center justify-between px-6 py-3
      bg-white/60 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-lg">

        {/* 🔹 LEFT: TITLE + CONTEXT */}
        <div className="flex flex-col">

          {/* Breadcrumb (premium touch) */}
          <span className="text-[11px] text-gray-400 mb-[2px] tracking-wide">
            Dashboard / Doctors
          </span>

          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
            {title}
          </h1>

          <p className="text-xs text-gray-500 mt-[2px]">
            Manage doctor records and licenses
          </p>
        </div>

        {/* 🔹 RIGHT: ACTIONS */}
        <div className="flex items-center gap-5">

          {/* 🔔 NOTIFICATION */}
          <div className="relative group cursor-pointer p-2 rounded-xl hover:bg-white/60 transition-all">

            {/* Glow */}
            <div className="absolute inset-0 rounded-xl bg-blue-400 blur-xl opacity-0 group-hover:opacity-20 transition" />

            <Bell className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition relative z-10" />

            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] px-1 rounded-full">
              3
            </span>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200" />

          {/* 👤 PROFILE */}
          <div className="flex items-center gap-3 cursor-pointer px-3 py-1.5 rounded-xl hover:bg-white/60 transition-all">

            {/* Avatar */}
            <div className="relative">
              <Image
                src="/images/doctor.png"
                alt="Profile"
                width={34}
                height={34}
                className="rounded-full object-cover border border-gray-300 shadow-sm"
              />

              {/* Online indicator */}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
            </div>

            {/* Info */}
            <div className="hidden md:block leading-tight">
              <p className="text-sm font-medium text-gray-800">
                Admin
              </p>
              <p className="text-[11px] text-gray-500">
                admin@test.com
              </p>
            </div>

            {/* Dropdown indicator */}
            <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
          </div>

        </div>
      </div>
    </div>
  );
}