"use client";

import { User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/src/services/api";

export default function ActivityList() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["activity"],
    queryFn: api.getActivity,
  });

  const activities = Array.isArray(data) ? data : [];

  const getColor = (type) => {
    if (type === "Added") return "bg-green-100 text-green-600";
    if (type === "Updated") return "bg-blue-100 text-blue-600";
    if (type === "Expired") return "bg-red-100 text-red-500";
    if (type === "Deleted") return "bg-gray-100 text-gray-600";
    return "bg-gray-100 text-gray-500";
  };

  return (
    <div
      className="
        rounded-2xl p-6
        bg-white/60 backdrop-blur-2xl border border-white/40
        shadow-xl hover:shadow-2xl
        transition-all duration-300
      "
    >
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>

      {/* LOADING */}
      {isLoading && (
        <p className="text-sm text-gray-400">Loading activity...</p>
      )}

      {/* ERROR */}
      {isError && (
        <p className="text-sm text-red-500">
          {error?.message || "Failed to load activity"}
        </p>
      )}

      {/* EMPTY */}
      {!isLoading && !isError && activities.length === 0 && (
        <p className="text-sm text-gray-400">No recent activity</p>
      )}

      {/* DATA */}
      {!isLoading && !isError && activities.length > 0 && (
        <div className="space-y-4">
          {activities.map((item, index) => (
            <div
              key={index}
              className="
                flex items-center justify-between p-3 rounded-xl
                hover:bg-white/70 transition-all duration-200
              "
            >
              {/* LEFT */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 flex items-center justify-center rounded-full ${getColor(
                    item.type
                  )}`}
                >
                  <User size={16} />
                </div>

                <div>
                  <p className="text-sm text-gray-700">
                    {item.message || "No message"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : ""}
                  </p>
                </div>
              </div>

              {/* RIGHT */}
              <span className="text-xs text-gray-400 capitalize">
                {item.type || "info"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}