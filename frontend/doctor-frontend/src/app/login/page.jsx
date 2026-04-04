"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/src/services/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.login({ email, password });

      localStorage.setItem("token", res.token);

      router.push("/dashboard");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex justify-center items-center w-full">
        <div className="bg-white p-6 rounded-xl shadow w-80">
          <h2 className="text-lg font-semibold mb-4">Login</h2>

          <input
            className="w-full border p-2 rounded mb-3"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full border p-2 rounded mb-3"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}