"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/src/services/api";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import Image from "next/image";

// WORLD-CLASS VALIDATION
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // HANDLE INPUT
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setServerError("");
  };

  // LOGIN HANDLER
  const handleLogin = async (e) => {
    e.preventDefault();

    setErrors({});
    setServerError("");
    setSuccessMsg("");

    const result = loginSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setLoading(true);

      const res = await api.login(form);

      localStorage.setItem("token", res.token);

      setSuccessMsg("Login successful. Redirecting...");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);

    } catch (err) {
      setServerError(
        err?.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* BACKGROUND IMAGE (BLURRED) */}
      <Image
        src="/images/Doctors in a modern hospital setting.png"
        alt="Background"
        fill
        className="object-cover blur-xl scale-110"
        priority
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/30" />

      {/* LOGIN CARD */}
      <div className="relative z-10 w-full max-w-md px-6">

        <form
          onSubmit={handleLogin}
          className="
            bg-white/80 backdrop-blur-2xl 
            border border-white/40 
            rounded-3xl 
            shadow-2xl 
            p-8 space-y-6
            hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)]
            transition-all duration-500
          "
        >

          {/* TITLE */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">
              Welcome Back
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Access your medical license dashboard
            </p>
          </div>

          {/* SUCCESS MESSAGE */}
          {successMsg && (
            <div className="text-green-600 text-sm text-center font-medium">
              {successMsg}
            </div>
          )}

          {/* ERROR MESSAGE */}
          {serverError && (
            <div className="text-red-500 text-sm text-center font-medium">
              {serverError}
            </div>
          )}

          {/* EMAIL */}
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />

              <input
                name="email"
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                className={`
                  w-full pl-10 pr-4 py-3 rounded-xl border 
                  ${errors.email ? "border-red-400" : "border-gray-200"}
                  bg-white/90
                  focus:ring-2 focus:ring-blue-500 outline-none 
                  transition-all shadow-sm
                `}
              />
            </div>

            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />

              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className={`
                  w-full pl-10 pr-10 py-3 rounded-xl border 
                  ${errors.password ? "border-red-400" : "border-gray-200"}
                  bg-white/90
                  focus:ring-2 focus:ring-blue-500 outline-none 
                  transition-all shadow-sm
                `}
              />

              {/* TOGGLE */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3 rounded-xl 
              font-semibold shadow-lg 
              hover:shadow-2xl hover:scale-[1.03] 
              active:scale-[0.97]
              transition-all duration-300
              disabled:opacity-60
            "
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* FOOTER */}
          <p className="text-xs text-center text-gray-400 mt-2">
            © 2026 Doctor License Management
          </p>

        </form>
      </div>
    </div>
  );
}