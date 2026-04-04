"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/src/layout/Sidebar";
import Header from "@/src/layout/Header";
import DoctorCard from "@/src/components/doctors/DoctorCard";
import { api } from "@/src/services/api";
import { Search, Plus } from "lucide-react";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchDoctors = async () => {
    try {
      setLoading(true);

      const res = await api.getDoctors({
        page,
        search,
        status,
      });

      setDoctors(res.data || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login";
  }
  }, [page, search, status]);

  const handleDelete = async (id) => {
    await api.deleteDoctor(id);
    fetchDoctors();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Sidebar />

      <div className="flex flex-col flex-1 ml-64 px-8 py-6 overflow-hidden">

        {/* HEADER */}
        <Header title="Doctor Management" />

        {/* MAIN WRAPPER */}
        <div className="w-full max-w-7xl mx-auto flex flex-col flex-1 overflow-hidden">

          {/* PREMIUM TOOLBAR */}
          <div className="bg-white/60 backdrop-blur-2xl border border-white/40 shadow-xl rounded-2xl px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">

            {/* SEARCH */}
            <div className="relative w-full md:max-w-xl group">
              <Search
                size={18}
                className="absolute left-4 top-3 text-gray-400 group-focus-within:text-blue-600 transition"
              />

              <input
                placeholder="Search doctors by name, specialization..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-md 
                focus:ring-2 focus:ring-blue-500 focus:border-blue-400 outline-none 
                transition-all text-sm shadow-sm hover:shadow-md"
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
            </div>

            {/* FILTER + BUTTON */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">

              <select
                className="px-4 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-md text-sm 
                focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm hover:shadow-md"
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value);
                }}
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Inactive">Suspended</option>
              </select>

              <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 
              text-white px-5 py-3 rounded-xl shadow-lg hover:shadow-2xl hover:scale-[1.04] 
              active:scale-[0.97] transition-all text-sm font-semibold">
                <Plus size={18} />
                Add Doctor
              </button>
            </div>
          </div>

          {/* 🔥 MAIN CARD */}
          <div className="flex flex-col flex-1 bg-white/70 backdrop-blur-2xl border border-white/40 rounded-3xl shadow-2xl overflow-hidden">

            {/* 🔥 HEADER ROW */}
            <div className="px-8 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100 text-xs text-gray-500 flex justify-between font-semibold tracking-wide uppercase">
              <span>Doctor Information</span>
              <span>Status & Actions</span>
            </div>

            {/* 🔥 LIST */}
            <div className="flex-1 overflow-y-auto px-8 py-5 space-y-4">

              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-pulse text-gray-400 text-sm">
                    Loading doctors...
                  </div>
                </div>
              ) : doctors.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <p className="text-lg font-semibold">
                    No doctors found
                  </p>
                  <p className="text-sm">
                    Try adjusting filters or search
                  </p>
                </div>
              ) : (
                doctors.map((doc) => (
                  <DoctorCard
                    key={doc.id}
                    doctor={doc}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>

            {/* 🔥 PREMIUM PAGINATION */}
            <div className="border-t bg-white/50 backdrop-blur-xl px-8 py-4 flex items-center justify-between">

              {/* INFO */}
              <p className="text-xs text-gray-500">
                Showing page{" "}
                <span className="font-semibold text-gray-700">
                  {page}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-700">
                  {totalPages}
                </span>
              </p>

              {/* CONTROLS */}
              <div className="flex items-center gap-2">

                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-1.5 rounded-lg border text-xs hover:bg-gray-100 transition disabled:opacity-40"
                >
                  Prev
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`px-4 py-1.5 text-xs rounded-lg transition-all ${
                      page === i + 1
                        ? "bg-blue-600 text-white shadow-lg scale-105"
                        : "border hover:bg-gray-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-1.5 rounded-lg border text-xs hover:bg-gray-100 transition disabled:opacity-40"
                >
                  Next
                </button>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}