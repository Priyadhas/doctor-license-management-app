"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/* ✅ CONSTANT (prevents hook issues) */
const SLIDES = [
  "/images/doc-ban1.png",
  "/images/doc-ban2.png",
  "/images/doc-ban3.png",
];

export default function Home() {
  const [slide, setSlide] = useState(0);

  /* ✅ STABLE EFFECT (no dependency error) */
  useEffect(() => {
    const interval = setInterval(() => {
      setSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">

      {/* NAVBAR */}
      <div className="flex justify-between items-center px-10 py-6">
        <h1 className="text-2xl font-bold text-blue-600 tracking-wide">
          DocCare
        </h1>

        <Link href="/login">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow-md hover:bg-blue-700 hover:scale-105 transition">
            Login
          </button>
        </Link>
      </div>

      {/* 🔥 HERO SLIDER */}
      <div className="relative h-[500px] mx-10 rounded-2xl overflow-hidden">

        {SLIDES.map((img, i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{
              opacity: slide === i ? 1 : 0,
              scale: slide === i ? 1 : 1.05,
            }}
            transition={{ duration: 1 }}
          >
            {/* ✅ CORRECT IMAGE (NO WARNING, NO CROPPING ISSUE) */}
            <Image
              src={img}
              alt="Doctor Banner"
              fill
              priority
              className={`
                object-cover
                ${i === 0 ? "object-top" : ""}
                ${i === 1 ? "object-center" : ""}
                ${i === 2 ? "object-right" : ""}
              `}
            />
          </motion.div>
        ))}

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center px-12">
          <div className="text-white max-w-xl">
            <h2 className="text-5xl font-extrabold mb-4 drop-shadow-xl">
              Smart Doctor License Management
            </h2>

            <p className="text-lg mb-6 text-gray-200">
              Track licenses, manage doctors, and automate renewals with a modern system.
            </p>

            <Link href="/login">
              <button className="bg-blue-600 px-6 py-3 rounded-xl shadow-lg hover:scale-105 hover:bg-blue-700 transition">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* 📊 STATS */}
      <div className="grid md:grid-cols-3 gap-6 px-10 py-16">
        {[
          { label: "Doctors", value: 120 },
          { label: "Active Licenses", value: 95 },
          { label: "Expired Licenses", value: 25 },
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="bg-white p-8 rounded-2xl shadow-md text-center hover:shadow-xl transition"
          >
            <h3 className="text-4xl font-bold text-blue-600">
              {item.value}+
            </h3>
            <p className="text-gray-500">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* 🧑‍⚕️ DOCTORS */}
      <div className="px-10 py-10">
        <h3 className="text-3xl font-bold text-center mb-10">
          Our Doctors
        </h3>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { img: "doc1.png", name: "Dr. Ahmed Khan", spec: "Cardiologist" },
            { img: "doc2.png", name: "Dr. Roe Sharma", spec: "Neurologist" },
            { img: "doc3.png", name: "Dr. David Lee", spec: "Orthopedic Surgeon" },
          ].map((doc, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition"
            >
              <Image
                src={`/images/${doc.img}`}
                width={400}
                height={250}
                alt={doc.name}
                className="w-full h-60 object-cover object-top"
              />

              <div className="p-5">
                <h4 className="font-semibold">{doc.name}</h4>
                <p className="text-gray-500">{doc.spec}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 🏥 SERVICES */}
      <div className="px-10 py-16 bg-white overflow-hidden">
        <h3 className="text-3xl font-bold text-center mb-10">
          Our Services
        </h3>

        <motion.div
          className="flex gap-6 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
        >
          {[...Array(2)].flatMap(() => [
            "Emergency", "Cardiology", "Neurology", "Orthopedics",
            "Dentistry", "ENT", "Pediatrics", "Dermatology",
            "Radiology", "Oncology", "Gynecology", "Physiotherapy",
          ]).map((service, i) => (
            <div
              key={i}
              className="min-w-[220px] bg-blue-50 px-6 py-4 rounded-xl text-center shadow-sm hover:bg-blue-100 transition"
            >
              {service}
            </div>
          ))}
        </motion.div>
      </div>

      {/* CTA */}
      <div className="bg-blue-600 text-white text-center py-16">
        <h3 className="text-3xl font-bold mb-4">
          Start Managing Licenses Today
        </h3>

        <Link href="/login">
          <button className="bg-white text-blue-600 px-6 py-3 rounded-xl hover:bg-gray-100 transition">
            Login Now
          </button>
        </Link>
      </div>
    </div>
  );
}