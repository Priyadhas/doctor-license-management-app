"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import toast from "react-hot-toast";
import { api } from "@/src/services/api";

// ============================
// VALIDATION
// ============================
const schema = z.object({
  fullName: z.string().trim().min(3, "Name must be at least 3 characters"),

  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),

  specialization: z
    .string()
    .trim()
    .min(2, "Specialization is required"),

  licenseNumber: z
    .string()
    .trim()
    .min(3, "License number is required"),

  licenseExpiryDate: z
    .string()
    .min(1, "Expiry date is required"),

  status: z.string(),
});

export default function AddDoctorModal({ open, onClose }) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    specialization: "",
    licenseNumber: "",
    licenseExpiryDate: "",
    status: "Active",
  });

  const [errors, setErrors] = useState({});

  // ============================
  // MUTATION (FIXED)
  // ============================
  const mutation = useMutation({
    mutationFn: api.createDoctor,

    onSuccess: () => {
      toast.success("Doctor added successfully", {
        icon: null,
        style: {
          background: "linear-gradient(135deg, #16a34a, #22c55e)",
          color: "#fff",
          borderRadius: "14px",
          padding: "14px 18px",
        },
      });

      queryClient.invalidateQueries(["doctors"]);
      queryClient.invalidateQueries(["summary"]);
      queryClient.invalidateQueries(["activity"]);
      onClose();
    },

    onError: (error) => {
      const message = error?.message || "Failed to add doctor";

      // 🎯 FIELD LEVEL ERROR (BEST UX)
      if (message.toLowerCase().includes("license")) {
        setErrors((prev) => ({
          ...prev,
          licenseNumber: message,
        }));

        // focus license field
        document.querySelector('[name="licenseNumber"]')?.focus();
        return;
      }

      // fallback toast
      toast.error(message, { icon: null });
    },
  });

  // ============================
  // HANDLE INPUT
  // ============================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    // clear error while typing
    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));
  };

  // ============================
  // SUBMIT
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = schema.safeParse(form);

    if (!result.success) {
      const fieldErrors = {};

      result.error.issues.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });

      setErrors(fieldErrors);

      // focus first error
      const firstError = Object.keys(fieldErrors)[0];
      document.querySelector(`[name="${firstError}"]`)?.focus();

      return;
    }

    // FORMAT NAME
    let formattedName = form.fullName.trim();
    if (!formattedName.toLowerCase().startsWith("dr.")) {
      formattedName = "Dr. " + formattedName;
    }

    try {
      await mutation.mutateAsync({
        ...form,
        fullName: formattedName,
      });
    } catch {
    }
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

        <h2 className="text-lg font-semibold mb-4">
          Add Doctor
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* NAME */}
          <InputField
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            error={errors.fullName}
            onChange={handleChange}
          />

          {/* EMAIL */}
          <InputField
            name="email"
            placeholder="Email"
            value={form.email}
            error={errors.email}
            onChange={handleChange}
          />

          {/* SPECIALIZATION */}
          <InputField
            name="specialization"
            placeholder="Specialization"
            value={form.specialization}
            error={errors.specialization}
            onChange={handleChange}
          />

          {/* LICENSE */}
          <InputField
            name="licenseNumber"
            placeholder="License Number"
            value={form.licenseNumber}
            error={errors.licenseNumber}
            onChange={handleChange}
          />

          {/* DATE */}
          <div>
            <input
              type="date"
              name="licenseExpiryDate"
              value={form.licenseExpiryDate}
              onChange={handleChange}
              className={`input w-full ${
                errors.licenseExpiryDate ? "border-red-500" : ""
              }`}
            />
            {errors.licenseExpiryDate && (
              <p className="text-red-500 text-xs mt-1">
                {errors.licenseExpiryDate}
              </p>
            )}
          </div>

          {/* STATUS */}
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="input w-full"
          >
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-blue-600 text-white py-2 rounded-lg 
            hover:bg-blue-700 transition disabled:opacity-60"
          >
            {mutation.isPending ? "Adding..." : "Add Doctor"}
          </button>

        </form>
      </div>
    </div>
  );
}

// ============================
// REUSABLE INPUT COMPONENT (PREMIUM)
// ============================
function InputField({ name, placeholder, value, error, onChange }) {
  return (
    <div>
      <input
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`input w-full ${
          error ? "border-red-500 ring-1 ring-red-200" : ""
        }`}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1">
          {error}
        </p>
      )}
    </div>
  );
}