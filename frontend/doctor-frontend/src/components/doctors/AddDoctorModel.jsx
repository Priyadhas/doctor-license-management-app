"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import toast from "react-hot-toast";
import { api } from "@/src/services/api";

// VALIDATION
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

  // MUTATION (WITH TOAST)
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
      onClose();
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to add doctor",
        { icon: null }
      );
    },
  });

  // HANDLE CHANGE
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    // clear error while typing
    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = schema.safeParse(form);

    if (!result.success) {
      const fieldErrors = {};

      // FIXED: use issues
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

    await mutation.mutateAsync({
      ...form,
      fullName: formattedName,
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

        <h2 className="text-lg font-semibold mb-4">
          Add Doctor
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* NAME */}
          <div>
            <input
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              className={`input w-full ${errors.fullName ? "border-red-500" : ""}`}
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className={`input w-full ${errors.email ? "border-red-500" : ""}`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* SPECIALIZATION */}
          <div>
            <input
              name="specialization"
              placeholder="Specialization"
              value={form.specialization}
              onChange={handleChange}
              className={`input w-full ${errors.specialization ? "border-red-500" : ""}`}
            />
            {errors.specialization && (
              <p className="text-red-500 text-xs mt-1">
                {errors.specialization}
              </p>
            )}
          </div>

          {/* LICENSE */}
          <div>
            <input
              name="licenseNumber"
              placeholder="License Number"
              value={form.licenseNumber}
              onChange={handleChange}
              className={`input w-full ${errors.licenseNumber ? "border-red-500" : ""}`}
            />
            {errors.licenseNumber && (
              <p className="text-red-500 text-xs mt-1">
                {errors.licenseNumber}
              </p>
            )}
          </div>

          {/* DATE */}
          <div>
            <input
              type="date"
              name="licenseExpiryDate"
              value={form.licenseExpiryDate}
              onChange={handleChange}
              className={`input w-full ${errors.licenseExpiryDate ? "border-red-500" : ""}`}
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
            hover:bg-blue-700 transition"
          >
            {mutation.isPending ? "Adding..." : "Add Doctor"}
          </button>

        </form>
      </div>
    </div>
  );
}