"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#fff",
          color: "#333",
          borderRadius: "10px",
          padding: "12px 16px",
        },
      }}
    />
  );
}