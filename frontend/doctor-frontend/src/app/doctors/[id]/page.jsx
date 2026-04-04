"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/src/services/api";

export default function EditDoctor() {
  const { id } = useParams();

  const [doctor, setDoctor] = useState({});

  useEffect(() => {
    api.get(`/doctors/${id}`).then((res) => setDoctor(res.data));
  }, [id]);

  const handleSave = async () => {
    await api.put(`/doctors/${id}`, doctor);
    alert("Updated");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <input
        className="border p-2 w-full mb-3"
        value={doctor.fullName || ""}
        onChange={(e) =>
          setDoctor({ ...doctor, fullName: e.target.value })
        }
      />

      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save
      </button>
    </div>
  );
}