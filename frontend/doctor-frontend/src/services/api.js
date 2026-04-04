import axios from "axios";

const BASE_URL = "http://localhost:5278/api";

// ============================
// AXIOS INSTANCE
// ============================
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // ✅ prevent hanging requests
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================
// REQUEST INTERCEPTOR (TOKEN)
// ============================
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================
// RESPONSE INTERCEPTOR (CLEAN DATA + ERRORS)
// ============================
apiClient.interceptors.response.use(
  (response) => response.data, // ✅ ALWAYS return clean data

  (error) => {
    // 🔐 Handle unauthorized globally
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }

    // ✅ Extract best possible message
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.title ||
      error?.response?.data?.errors?.[0] || // ASP.NET validation
      error?.message ||
      "Something went wrong";

    return Promise.reject(new Error(message));
  }
);

// ============================
// API METHODS (CONSISTENT)
// ============================
export const api = {
  // ============================
  // AUTH
  // ============================
  login: async (data) => {
    const res = await apiClient.post("/auth/login", data);

    if (res?.token && typeof window !== "undefined") {
      localStorage.setItem("token", res.token);
    }

    return res;
  },

  // ============================
  // DASHBOARD
  // ============================
  getSummary: async () => {
    return await apiClient.get("/doctors/summary");
  },

  // ============================
  // DOCTORS LIST
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
      data: res.data ?? [],
      totalPages: res.totalPages ?? 1,
      totalCount: res.totalCount ?? 0,
    };
  },

  // ============================
  // CRUD
  // ============================
  createDoctor: async (data) => {
    return await apiClient.post("/doctors", data);
  },

  updateDoctor: async (id, data) => {
    return await apiClient.put(`/doctors/${id}`, data);
  },

  deleteDoctor: async (id) => {
    return await apiClient.delete(`/doctors/${id}`);
  },

  // ============================
  // ACTIVITY
  // ============================
  getActivity: async () => {
    return await apiClient.get("/doctors/activity");
  },
};