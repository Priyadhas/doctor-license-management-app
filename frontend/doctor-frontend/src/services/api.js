import axios from "axios";

const BASE_URL = "http://localhost:5278/api";

// ============================
// AXIOS INSTANCE
// ============================
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================
// REQUEST INTERCEPTOR (TOKEN)
// ============================
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ============================
// RESPONSE INTERCEPTOR (ERROR HANDLING)
// ============================
apiClient.interceptors.response.use(
  (response) => response.data,

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.title ||
      "Invalid credentials";

    return Promise.reject(new Error(message));
  }
);

// ============================
// API METHODS
// ============================
export const api = {
  // ============================
  // LOGIN
  // ============================
  login: async (data) => {
    const res = await apiClient.post("/auth/login", data);

    if (res?.token) {
      localStorage.setItem("token", res.token);
    }

    return res;
  },

  // ============================
  // DASHBOARD SUMMARY
  // ============================
  getSummary: async () => {
    const res = await apiClient.get("/doctors/summary");
    return res.data || res;
  },

  // ============================
  // GET DOCTORS
  // ============================
  getDoctors: async ({
    page = 1,
    pageSize = 5,
    search = "",
    status = "",
  } = {}) => {
    const res = await apiClient.get("/doctors", {
      params: {
        PageNumber: page,
        PageSize: pageSize,
        search,
        status,
      },
    });

    return {
      data: res.data || [],
      totalPages: res.totalPages || 1,
      totalCount: res.totalCount || 0,
    };
  },

  // ============================
  // CREATE DOCTOR
  // ============================
  createDoctor: async (data) => {
    return await apiClient.post("/doctors", data);
  },

  // ============================
  // UPDATE DOCTOR
  // ============================
  updateDoctor: async (id, data) => {
    return await apiClient.put(`/doctors/${id}`, data);
  },

  // ============================
  // DELETE DOCTOR
  // ============================
  deleteDoctor: async (id) => {
    return await apiClient.delete(`/doctors/${id}`);
  },

  // ============================
  // RECENT ACTIVITY
  // ============================
  getActivity: async () => {
    const res = await apiClient.get("/doctors/activity");
    return res.data || [];
  },
};