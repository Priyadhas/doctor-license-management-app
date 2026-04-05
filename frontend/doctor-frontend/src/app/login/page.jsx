"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/src/services/api";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import Image from "next/image";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});

export default function LoginPage() {
  const router = useRouter();

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // HANDLE INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
    setServerError("");

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

      if (fieldErrors.email) emailRef.current?.focus();
      else if (fieldErrors.password) passwordRef.current?.focus();

      return;
    }

    try {
      setLoading(true);

      const res = await api.login(form);

      const token = res.token || res.data?.token;

      if (!token) throw new Error("Token not received");

      if (rememberMe) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }

      router.push("/dashboard");
    } catch (err) {
      setServerError(
        err.message.toLowerCase().includes("invalid")
          ? "Invalid credentials"
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex overflow-hidden">

      {/* BACKGROUND IMAGE (NO BLUR) */}
      <Image
        src="/images/Doctors in a modern hospital setting.jpeg"
        alt="Background"
        fill
        className="object-cover"
        priority
      />

      {/* LIGHT OVERLAY (NO BLUR) */}
      <div className="absolute inset-0 bg-black/20" />

      {/* LOGIN CARD (SHIFTED RIGHT PERFECTLY) */}
      <div className="relative z-10 w-full flex items-center justify-end pr-[12%]">
        
        <div className="w-full max-w-md px-6">
          <form
            onSubmit={handleLogin}
            noValidate
            className="
              bg-white/80 backdrop-blur-2xl
              border border-white/40
              rounded-3xl shadow-2xl
              p-8 space-y-6
            "
          >
            {/* HEADER */}
            <div className="text-center space-y-1">
              <h2 className="text-3xl font-extrabold text-gray-800">
                Welcome Back
              </h2>
              <p className="text-gray-500 text-sm">Sign in to continue</p>
            </div>

            {/* ERROR */}
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center px-4 py-2 rounded-xl">
                {serverError}
              </div>
            )}

            {/* EMAIL */}
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  ref={emailRef}
                  name="email"
                  type="text"
                  placeholder="Email address"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border
                    ${errors.email ? "border-red-400 ring-2 ring-red-200" : "border-gray-200"}
                    focus:ring-2 focus:ring-blue-500 outline-none`}
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
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border
                    ${errors.password ? "border-red-400 ring-2 ring-red-200" : "border-gray-200"}
                    focus:ring-2 focus:ring-blue-500 outline-none`}
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

            {/* REMEMBER ME */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-blue-600"
                />
                Remember me
              </label>

              <button
                type="button"
                onClick={() => router.push("/forget-password")}
                className="text-gray-500 hover:text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full bg-gradient-to-r from-blue-600 to-blue-400
                text-white py-3 rounded-xl font-semibold shadow-lg
                hover:scale-[1.02] active:scale-[0.98]
                transition disabled:opacity-60
              "
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* FOOTER */}
            <p className="text-sm text-center text-gray-500">
              Don’t have an account?{" "}
              <span
                onClick={() => router.push("/register")}
                className="text-blue-600 cursor-pointer hover:underline"
              >
                Register here
              </span>
            </p>

            <p className="text-xs text-center text-gray-400">
              © 2026 Doctor License Management
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}