import { Pencil, Trash2, Stethoscope } from "lucide-react";

export default function DoctorCard({ doctor, onDelete }) {
  const getStatusStyle = () => {
    switch (doctor.status) {
      case "Active":
        return "bg-green-50 text-green-700 border border-green-200";
      case "Expired":
        return "bg-red-50 text-red-600 border border-red-200";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-200";
    }
  };

  return (
    <div className="group bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between transition-all duration-200 hover:shadow-md hover:-translate-y-[1px]">

      {/* LEFT SECTION */}
      <div className="flex items-center gap-4">

        {/* AVATAR */}
        <div className="w-11 h-11 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <Stethoscope size={18} />
        </div>

        {/* INFO */}
        <div className="flex flex-col">
          <h3 className="text-[15px] font-semibold text-gray-800">
            {doctor.fullName}
          </h3>

          <p className="text-sm text-gray-500">
            {doctor.specialization}
          </p>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-4">

        {/* STATUS BADGE */}
        <span
          className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusStyle()}`}
        >
          {doctor.status}
        </span>

        {/* ACTIONS */}
        <div className="flex items-center gap-2">

          {/* EDIT */}
          <button className="p-2 rounded-full hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition">
            <Pencil size={16} />
          </button>

          {/* DELETE */}
          <button
            onClick={() => onDelete(doctor.id)}
            className="p-2 rounded-full hover:bg-red-50 text-gray-600 hover:text-red-600 transition"
          >
            <Trash2 size={16} />
          </button>

        </div>
      </div>
    </div>
  );
}