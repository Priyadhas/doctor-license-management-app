"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { z } from "zod";
import { api } from "@/src/services/api";

// WORLD-CLASS VALIDATION
const schema = z.object({
  fullName: z.string().trim().min(3, "Name must be at least 3 characters"),

  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),

  specialization: z.string().trim().min(2, "Specialization is required"),

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

  const [errors, setErrors] = useState({});

  // SAFE PREFILL (NO WARNING)
  useEffect(() => {
    if (!open || !doctor) return;

    // FIX: wrap inside microtask (prevents React warning)
    Promise.resolve().then(() => {
      setForm({
        fullName: doctor.fullName ?? "",
        email: doctor.email ?? "",
        specialization: doctor.specialization ?? "",
        licenseExpiryDate: doctor.licenseExpiryDate
          ? doctor.licenseExpiryDate.split("T")[0]
          : "",
        status: doctor.status ?? "Active",
      });

      setErrors({});
    });
  }, [doctor, open]);

  // MUTATION
  const mutation = useMutation({
    mutationFn: (data) => api.updateDoctor(doctor.id, data),

    onSuccess: () => {
      toast.success("Doctor updated successfully", {
        icon: null,
      });

      queryClient.invalidateQueries(["doctors"]);
      queryClient.invalidateQueries(["summary"]);   
      queryClient.invalidateQueries(["activity"]);
      onClose();
    },

    onError: (err) => {
      toast.error(
        err?.response?.data?.message || err?.message || "Update failed",
        { icon: null },
      );
    },
  });

  // INPUT CHANGE
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    // clear error while typing
    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));
  };

  // SUBMIT (WORLD-CLASS)
  const handleSubmit = (e) => {
    e.preventDefault();

    const result = schema.safeParse(form);

    if (!result.success) {
      const fieldErrors = {};

      // FIXED: issues instead of errors
      result.error.issues.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });

      setErrors(fieldErrors);

      // focus first error
      const firstError = Object.keys(fieldErrors)[0];
      document.querySelector(`[name="${firstError}"]`)?.focus();

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
      {/*  BORDER */}
      <div className="p-[1px] rounded-[18px] bg-gradient-to-br from-blue-400/40 via-white/40 to-blue-300/40">
        {/* CARD */}
        <div
          className="
          w-[300px]
          max-h-[72vh] overflow-y-auto
          bg-white/85 backdrop-blur-xl
          rounded-[16px]
          px-4 py-4
          shadow-[0_10px_30px_rgba(0,0,0,0.2)]
        "
        >
          {/* HEADER */}
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-base font-semibold">Edit Doctor</h2>

            <button
              onClick={() => onClose?.()}
              className="text-gray-400 hover:text-black"
            >
              <X size={16} />
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-2">
            {["fullName", "email", "specialization"].map((field) => (
              <div key={field}>
                <input
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  placeholder={
                    field === "fullName"
                      ? "Full Name"
                      : field === "email"
                        ? "Email"
                        : "Specialization"
                  }
                  className={`
                    w-full px-3 py-2 rounded-lg text-sm
                    bg-white/70 border
                    ${errors[field] ? "border-red-500" : "border-gray-200"}
                    focus:ring-2 focus:ring-blue-500
                    outline-none
                  `}
                />

                {errors[field] && (
                  <p className="text-red-500 text-[11px] mt-1">
                    {errors[field]}
                  </p>
                )}
              </div>
            ))}

            {/* DATE */}
            <div>
              <input
                type="date"
                name="licenseExpiryDate"
                value={form.licenseExpiryDate}
                onChange={handleChange}
                className={`
                  w-full px-3 py-2 rounded-lg text-sm
                  border
                  ${errors.licenseExpiryDate ? "border-red-500" : "border-gray-200"}
                `}
              />

              {errors.licenseExpiryDate && (
                <p className="text-red-500 text-[11px] mt-1">
                  {errors.licenseExpiryDate}
                </p>
              )}
            </div>

            {/* STATUS */}
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200"
            >
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="
                w-full py-2 rounded-lg
                bg-gradient-to-r from-blue-600 to-blue-400
                text-white text-sm font-medium
                shadow-md
                hover:shadow-lg hover:scale-[1.02]
                active:scale-[0.97]
                transition-all
              "
            >
              {mutation.isPending ? "Updating..." : "Update Doctor"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
