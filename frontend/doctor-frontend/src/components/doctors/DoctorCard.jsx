import { Pencil, Trash2, Stethoscope } from "lucide-react";

export default function DoctorCard({ doctor, onDelete }) {
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
      default:
        return {
          style: "bg-gray-50 text-gray-600 border border-gray-200",
          dot: "bg-gray-400",
        };
    }
  };

  const status = getStatus();

  return (
    <div className="group grid grid-cols-4 items-center gap-4 px-6 py-4 rounded-2xl bg-white border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-[2px]">

      {/* 🔹 COLUMN 1: AVATAR + NAME */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600">
          <Stethoscope size={18} />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {doctor.fullName}
          </p>
        </div>
      </div>

      {/* 🔹 COLUMN 2: SPECIALIZATION */}
      <div className="text-sm text-gray-500 truncate">
        {doctor.specialization}
      </div>

      {/* 🔹 COLUMN 3: STATUS */}
      <div>
        <div className={`inline-flex items-center gap-2 px-3 py-1 text-xs rounded-full font-medium ${status.style}`}>
          <span className={`w-2 h-2 rounded-full ${status.dot}`} />
          {doctor.status}
        </div>
      </div>

      {/* 🔹 COLUMN 4: ACTIONS */}
      <div className="flex justify-end items-center gap-2">

        {/* EDIT */}
        <div className="relative group">
          <button className="p-2 rounded-lg hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition">
            <Pencil size={16} />
          </button>

          {/* Tooltip */}
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
            Edit
          </span>
        </div>

        {/* DELETE */}
        <div className="relative group">
          <button
            onClick={() => onDelete(doctor.id)}
            className="p-2 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 transition"
          >
            <Trash2 size={16} />
          </button>

          {/* Tooltip */}
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
            Delete
          </span>
        </div>

      </div>
    </div>
  );
}