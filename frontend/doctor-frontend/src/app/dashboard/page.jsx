"use client";

import Sidebar from "@/src/layout/Sidebar";
import Header from "@/src/layout/Header";
import StatsCard from "../dashboard/StatCard";
import ActivityList from "../dashboard/ActivityList";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/src/services/api";

export default function DashboardPage() {
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["summary"],
    queryFn: api.getSummary,
    staleTime: 1000 * 60 * 5, // cache 5 mins
  });

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="flex-1 ml-64 px-8 py-6 overflow-y-auto">

        <Header title="Dashboard" />

        <div className="max-w-7xl mx-auto space-y-6">

          {/* 🔥 LOADING UI */}
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

          {/* ❌ ERROR UI */}
          {isError && (
            <div className="text-center text-red-500 py-10 font-medium">
              Failed to load dashboard data
            </div>
          )}

          {/* ✅ DATA UI */}
          {!isLoading && data && (
            <>
              {/* 🔥 STATS */}
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

              {/* 🔥 ACTIVITY */}
              <ActivityList />
            </>
          )}
        </div>
      </div>
    </div>
  );
}