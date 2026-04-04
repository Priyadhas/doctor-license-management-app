"use client";

import { useState } from "react";
import { Pencil, Trash2, Stethoscope } from "lucide-react";
import EditDoctorModal from "../../components/doctors/EditDoctorModel";

export default function DoctorCard({ doctor, onDelete }) {
  const [editOpen, setEditOpen] = useState(false);

  // STATUS CONFIG
  const getStatus = () => {
    switch (doctor.status) {
      case "Active":
        return {
          style: "bg-green-50 text-green-700 border border-green-200",
          dot: "bg-green-500",
        };
      case "Expired":
        return {
          style: "bg-red-50 text-red-600 border border-red-200",
          dot: "bg-red-500",
        };
      case "Suspended":
        return {
          style: "bg-yellow-50 text-yellow-700 border border-yellow-200",
          dot: "bg-yellow-500",
        };
      default:
        return {
          style: "bg-gray-50 text-gray-600 border border-gray-200",
          dot: "bg-gray-400",
        };
    }
  };

  const status = getStatus();

  return (
    <>
      {/* CARD */}
      <div
        className="
  group grid grid-cols-4 items-center gap-4 px-6 py-4 rounded-2xl

  bg-white/70 backdrop-blur-xl border border-white/40    

  shadow-md hover:shadow-2xl                            

  transition-all duration-300 hover:scale-[1.01]         
"
      >
        {/*AVATAR + NAME */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-blue-100 text-blue-600 shadow-sm">
            <Stethoscope size={18} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {doctor.fullName}
            </p>

            {/* optional secondary info */}
            <p className="text-xs text-gray-400 truncate">{doctor.email}</p>
          </div>
        </div>

        {/*SPECIALIZATION */}
        <div className="text-sm text-gray-500 truncate font-medium">
          {doctor.specialization}
        </div>

        {/* STATUS */}
        <div>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 text-xs rounded-full font-medium ${status.style}`}
          >
            <span className={`w-2 h-2 rounded-full ${status.dot}`} />
            {doctor.status}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end items-center gap-2">
          {/* EDIT */}
          <div className="relative group/btn">
            <button
              onClick={() => setEditOpen(true)}
              className="p-2 rounded-lg hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition"
            >
              <Pencil size={16} />
            </button>

            {/* Tooltip */}
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition whitespace-nowrap">
              Edit Doctor
            </span>
          </div>

          {/* DELETE */}
          <div className="relative group/btn">
            <button
              onClick={() => onDelete(doctor.id)}
              className="p-2 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 transition"
            >
              <Trash2 size={16} />
            </button>

            {/* Tooltip */}
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition whitespace-nowrap">
              Delete Doctor
            </span>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      <EditDoctorModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        doctor={doctor}
      />
    </>
  );
}
