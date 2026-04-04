"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/src/services/api";

const schema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  specialization: z.string().optional(),
  licenseNumber: z.string().min(3),
  licenseExpiryDate: z.string(),
  status: z.enum(["Active", "Inactive", "Suspended"]),
});

export default function DoctorForm({ onSuccess }) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: api.createDoctor,
    onSuccess: () => {
      toast.success("Doctor added successfully");
      queryClient.invalidateQueries(["doctors"]); // 🔥 refresh list
      onSuccess();
    },
    onError: () => {
      toast.error("Failed to add doctor");
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      <input
        {...register("fullName")}
        placeholder="Full Name"
        className="input"
      />
      <p className="error">{errors.fullName?.message}</p>

      <input
        {...register("email")}
        placeholder="Email"
        className="input"
      />
      <p className="error">{errors.email?.message}</p>

      <input
        {...register("specialization")}
        placeholder="Specialization"
        className="input"
      />

      <input
        {...register("licenseNumber")}
        placeholder="License Number"
        className="input"
      />
      <p className="error">{errors.licenseNumber?.message}</p>

      <input
        type="date"
        {...register("licenseExpiryDate")}
        className="input"
      />

      <select {...register("status")} className="input">
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
        <option value="Suspended">Suspended</option>
      </select>

      <button
        type="submit"
        disabled={mutation.isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
      >
        {mutation.isLoading ? "Adding..." : "Add Doctor"}
      </button>
    </form>
  );
}