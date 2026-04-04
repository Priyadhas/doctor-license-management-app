"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/src/services/api";
import { isAuthenticated } from "@/src/utils/auth";
import Sidebar from "@/src/layout/Sidebar";

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState({});

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    api.getSummary().then(setData);
  }, []);

  return (
    <div className="flex">
      <Sidebar />

      <div className="p-6 flex-1 grid grid-cols-3 gap-4">
        <div className="bg-white p-4 shadow rounded">
          Total Doctors: {data.total || 0}
        </div>

        <div className="bg-white p-4 shadow rounded">
          Active: {data.active || 0}
        </div>

        <div className="bg-white p-4 shadow rounded">
          Expired: {data.expired || 0}
        </div>
      </div>
    </div>
  );
}