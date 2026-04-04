"use client";

import Sidebar from "@/src/layout/Sidebar";
import Header from "@/src/layout/Header";
import StatsCard from "../dashboard/StatCard";
import ActivityList from "../dashboard/ActivityList";

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="flex-1 ml-64 px-8 py-6">

        <Header title="Dashboard" />

        <div className="max-w-7xl mx-auto space-y-6">

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard title="Total Doctors" value="120" type="primary" />
            <StatsCard title="Active Licenses" value="85" type="success" />
            <StatsCard title="Expired Licenses" value="35" type="danger" />
          </div>

          {/* ACTIVITY */}
          <ActivityList />

        </div>
      </div>
    </div>
  );
}