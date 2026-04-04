"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { z } from "zod";
import { api } from "@/src/services/api";

// VALIDATION
const schema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  specialization: z.string().min(2, "Specialization is required"),
  licenseExpiryDate: z.string().min(1, "Expiry date is required"),
  status: z.string(),
});

export default function EditDoctorModal({ open, onClose, doctor }) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    specialization: "",
    licenseExpiryDate: "",
    status: "Active",
  });

  // SAFE PREFILL (NO WARNING)
  useEffect(() => {
    if (!open || !doctor) return;

    setForm({
      fullName: doctor.fullName ?? "",
      email: doctor.email ?? "",
      specialization: doctor.specialization ?? "",
      licenseExpiryDate: doctor.licenseExpiryDate
        ? doctor.licenseExpiryDate.split("T")[0]
        : "",
      status: doctor.status ?? "Active",
    });

  }, [doctor, open]);

  // 🔥 MUTATION
  const mutation = useMutation({
    mutationFn: (data) => api.updateDoctor(doctor.id, data),

    onSuccess: () => {
      toast.success("Doctor updated successfully");
      queryClient.invalidateQueries(["doctors"]);
      onClose();
    },

    onError: (err) => {
      toast.error(err.message || "Update failed");
    },
  });

  // SUBMIT
  const handleSubmit = (e) => {
    e.preventDefault();

    const result = schema.safeParse(form);

    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    mutation.mutate({
      ...form,
      licenseExpiryDate: new Date(form.licenseExpiryDate)
        .toISOString()
        .split("T")[0],
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
        >
          <X size={18} />
        </button>

        <h2 className="text-lg font-semibold mb-5">
          Edit Doctor
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          <input
            value={form.fullName}
            onChange={(e) =>
              setForm({ ...form, fullName: e.target.value })
            }
            className="input"
            placeholder="Full Name"
          />

          <input
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            className="input"
            placeholder="Email"
          />

          <input
            value={form.specialization}
            onChange={(e) =>
              setForm({ ...form, specialization: e.target.value })
            }
            className="input"
            placeholder="Specialization"
          />

          <input
            type="date"
            value={form.licenseExpiryDate}
            onChange={(e) =>
              setForm({ ...form, licenseExpiryDate: e.target.value })
            }
            className="input"
          />

          <select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value })
            }
            className="input"
          >
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg 
            hover:bg-blue-700 transition disabled:opacity-60"
          >
            {mutation.isPending ? "Updating..." : "Update Doctor"}
          </button>

        </form>
      </div>
    </div>
  );
}