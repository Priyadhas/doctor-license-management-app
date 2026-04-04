"use client";

import { useState, useRef } from "react";
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
    .email("Enter a valid email"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Minimum 6 characters"),
});

export default function LoginPage() {
  const router = useRouter();

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isTyping = form.email.length > 0 || form.password.length > 0;

  // HANDLE INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    // REAL-TIME VALIDATION (PREMIUM UX)
    if (name === "email") {
      const check = loginSchema.shape.email.safeParse(value);
      setErrors((prev) => ({
        ...prev,
        email: check.success ? "" : check.error.issues[0].message,
      }));
    }

    if (name === "password") {
      const check = loginSchema.shape.password.safeParse(value);
      setErrors((prev) => ({
        ...prev,
        password: check.success ? "" : check.error.issues[0].message,
      }));
    }

    setServerError("");
  };

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    setErrors({});
    setServerError("");

    const result = loginSchema.safeParse(form);

    if (!result.success) {
      const formatted = result.error.flatten();

      const fieldErrors = {
        email: formatted.fieldErrors.email?.[0] || "",
        password: formatted.fieldErrors.password?.[0] || "",
      };

      setErrors(fieldErrors);

      if (fieldErrors.email) {
        emailRef.current?.focus();
      } else if (fieldErrors.password) {
        passwordRef.current?.focus();
      }

      return;
    }

    try {
      setLoading(true);

      const res = await api.login(form);

      localStorage.setItem("token", res.token);

      router.push("/dashboard");
    } catch (err) {
      // CLEAN ERROR
      if (err.message.toLowerCase().includes("invalid")) {
        setServerError("Invalid credentials");
      } else {
        setServerError(err.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* BACKGROUND */}
      <Image
        src="/images/Doctors in a modern hospital setting.png"
        alt="Background"
        fill
        className={`
          object-cover transition-all duration-700
          ${isTyping ? "blur-xl scale-110" : "blur-0 scale-100"}
        `}
        priority
      />

      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 w-full max-w-md px-6">

        {/* IMPORTANT: noValidate */}
        <form
          onSubmit={handleLogin}
          noValidate
          className="
            bg-white/80 backdrop-blur-2xl 
            border border-white/40 
            rounded-3xl 
            shadow-2xl 
            p-8 space-y-6
          "
        >

          {/* TITLE */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">
              Welcome Back
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Access your dashboard
            </p>
          </div>

          {/* SERVER ERROR */}
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center px-4 py-2 rounded-xl">
              {serverError}
            </div>
          )}

          {/* EMAIL */}
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />

              {/* FIXED: type="text" */}
              <input
                ref={emailRef}
                name="email"
                type="text"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                className={`
                  w-full pl-10 pr-4 py-3 rounded-xl border 
                  ${errors.email ? "border-red-400 ring-2 ring-red-200" : "border-gray-200"}
                  focus:ring-2 focus:ring-blue-500 outline-none
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
                ref={passwordRef}
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className={`
                  w-full pl-10 pr-10 py-3 rounded-xl border 
                  ${errors.password ? "border-red-400 ring-2 ring-red-200" : "border-gray-200"}
                  focus:ring-2 focus:ring-blue-500 outline-none
                `}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400"
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
              hover:scale-[1.02] active:scale-[0.98]
              transition
              disabled:opacity-60
            "
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-xs text-center text-gray-400">
            © 2026 Doctor License Management
          </p>

        </form>
      </div>
    </div>
  );
}