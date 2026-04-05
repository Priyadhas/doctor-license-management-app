"use client";

import { useState } from "react";
import { api } from "@/src/services/api";
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // ============================
  // SUBMIT
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    //  VALIDATION
    if (!email.trim()) {
      return setError("Email is required");
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return setError("Enter a valid email address");
    }

    try {
      setLoading(true);

      await api.forgotPassword(email);

      //  ONLY AFTER SUCCESS
      setMessage("Reset link sent to your email");

      // optional clear
      setEmail("");

    } catch (err) {
      setError(err.message || "Something went wrong");
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
            className="bg-white/80 backdrop-blur-2xl border border-white/40 rounded-3xl shadow-2xl p-8 space-y-6"
          >
            {/* HEADER */}
            <div className="text-center space-y-1">
              <h2 className="text-3xl font-extrabold text-gray-800">
                Forgot Password
              </h2>
              <p className="text-gray-500 text-sm">
                Enter your email to receive reset link
              </p>
            </div>

            {/*  ERROR */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center px-4 py-2 rounded-xl">
                {error}
              </div>
            )}

            {/*  SUCCESS */}
            {message && (
              <div className="bg-green-50 border border-green-200 text-green-600 text-sm text-center px-4 py-2 rounded-xl">
                {message}
              </div>
            )}

            {/* EMAIL */}
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />

              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);

                  //  CLEAR STATES WHILE TYPING
                  setError("");
                  setMessage("");
                }}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3 rounded-xl font-semibold shadow-lg hover:scale-[1.02] transition disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            {/* LOGIN */}
            <p className="text-sm text-center text-gray-500">
              Remember your password?{" "}
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