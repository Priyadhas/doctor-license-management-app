"use client";

import { useState } from "react";
import { api } from "@/src/services/api";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

// ============================
// PASSWORD STRENGTH FUNCTION
// ============================
const getPasswordStrength = (password) => {
  let score = 0;

  if (!password) return { score: 0, label: "", color: "" };

  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2)
    return { score, label: "Weak", color: "text-red-500" };

  if (score === 3)
    return { score, label: "Medium", color: "text-yellow-500" };

  return { score, label: "Strong", color: "text-green-500" };
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //  PASSWORD STRENGTH
  const strength = getPasswordStrength(form.newPassword);

  // ============================
  // SUBMIT
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.newPassword || !form.confirmPassword) {
      return setError("All fields are required");
    }

    if (strength.score <= 2) {
      return setError("Password is too weak");
    }

    if (form.newPassword !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setLoading(true);
      setError("");

      await api.resetPassword({
        email,
        token,
        newPassword: form.newPassword,
      });

      alert("Password reset successful");
      router.push("/login");
    } catch (err) {
      setError(err.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex overflow-hidden">

      {/* BACKGROUND */}
      <Image
        src="/images/Doctors in a modern hospital setting.jpeg"
        alt="Background"
        fill
        className="object-cover"
        priority
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/20" />

      {/* CARD */}
      <div className="relative z-10 w-full flex items-center justify-end pr-[12%]">
        <div className="w-full max-w-md px-6">
          <form
            onSubmit={handleSubmit}
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
                Reset Password
              </h2>
              <p className="text-gray-500 text-sm">
                Enter your new password
              </p>
            </div>

            {/* ERROR */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center px-4 py-2 rounded-xl">
                {error}
              </div>
            )}

            {/* NEW PASSWORD */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={form.newPassword}
                  onChange={(e) =>
                    setForm({ ...form, newPassword: e.target.value })
                  }
                  className="
                    w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200
                    focus:ring-2 focus:ring-blue-500 outline-none
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* 🔥 PASSWORD STRENGTH */}
              {form.newPassword && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Strength</span>
                    <span className={strength.color}>{strength.label}</span>
                  </div>

                  <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300
                        ${
                          strength.score <= 2
                            ? "bg-red-500 w-1/3"
                            : strength.score === 3
                            ? "bg-yellow-500 w-2/3"
                            : "bg-green-500 w-full"
                        }`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  className="
                    w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200
                    focus:ring-2 focus:ring-blue-500 outline-none
                  "
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {/*  MATCH CHECK */}
              {form.confirmPassword && (
                <p
                  className={`text-xs mt-1 ${
                    form.newPassword === form.confirmPassword
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {form.newPassword === form.confirmPassword
                    ? "Passwords match"
                    : "Passwords do not match"}
                </p>
              )}
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
              {loading ? "Updating..." : "Reset Password"}
            </button>

            {/* FOOTER */}
            <p className="text-sm text-center text-gray-500">
              Back to{" "}
              <span
                onClick={() => router.push("/login")}
                className="text-blue-600 cursor-pointer hover:underline"
              >
                Login
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