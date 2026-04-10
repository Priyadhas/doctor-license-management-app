"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/src/layout/Sidebar";
import Header from "@/src/layout/Header";
import StatsCard from "../dashboard/StatCard";
import ActivityList from "../dashboard/ActivityList";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/src/services/api";

export default function DashboardPage() {
  const router = useRouter();

  // ============================
  // AUTH CHECK (IMPORTANT)
  // ============================
  useEffect(() => {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    if (!token) {
      router.replace("/login");
    }
  }, []);

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["summary"],
    queryFn: api.getSummary,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="flex-1 ml-64 px-8 py-6 overflow-hidden">

        <Header title="Dashboard" />

        <div className="max-w-7xl mx-auto space-y-6  overflow-hidden">

          {/*  LOADING UI */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 rounded-2xl bg-white/60 backdrop-blur-xl shadow-lg"
                />
              ))}
            </div>
          )}

          {/*  ERROR UI */}
          {isError && (
            <div className="text-center text-red-500 py-10 font-medium">
              Failed to load dashboard data
            </div>
          )}

          {/* DATA UI */}
          {!isLoading && data && (
            <>
              {/* STATS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <StatsCard
                  title="Total Doctors"
                  value={data.totalDoctors}
                  type="primary"
                />

                <StatsCard
                  title="Active Licenses"
                  value={data.activeDoctors}
                  type="success"
                />

                <StatsCard
                  title="Expired Licenses"
                  value={data.expiredDoctors}
                  type="danger"
                />

              </div>

              {/* ACTIVITY */}
              <div className="bg-white/70 backdrop-blur-2xl border border-white/40 rounded-3xl shadow-2xl overflow-hidden">
                
                <div className="px-6 py-4 border-b text-sm font-semibold text-gray-700">
                  Recent Activity
                </div>

                <div className="h-[300px] overflow-y-auto px-6 py-4">
                  <ActivityList />
                </div>

              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}