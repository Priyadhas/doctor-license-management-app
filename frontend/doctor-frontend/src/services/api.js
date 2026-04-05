const BASE_URL = "http://localhost:5278/api";

// ============================
// GET TOKEN
// ============================
const getToken = () => {
  if (typeof window !== "undefined") {
    return (
      localStorage.getItem("token") ||
      sessionStorage.getItem("token")
    );
  }
  return null;
};

// ============================
// LOGOUT HELPER
// ============================
const clearAuth = () => {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
};

// ============================
// HANDLE RESPONSE (PREMIUM)
// ============================
const handleResponse = async (res) => {
  let data = null;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  //  HANDLE UNAUTHORIZED (AUTO LOGOUT)
  if (res.status === 401) {
    clearAuth();

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }

    throw new Error("Session expired. Please login again.");
  }

  //  HANDLE OTHER ERRORS
  if (!res.ok) {
    const message =
      data?.message ||
      data?.title ||
      "Something went wrong. Please try again.";

    
    console.warn("API Error:", message);
    throw new Error(message);
  }

  return data;
};

// ============================
// SAFE FETCH (NETWORK SAFE)
// ============================
const safeFetch = async (url, options) => {
  try {
    const res = await fetch(url, options);
    return await handleResponse(res);
  } catch (err) {
    //  NETWORK ERROR (server down etc)
    if (err.message.includes("Failed to fetch")) {
      throw new Error("Server not reachable 🚫");
    }

    throw err;
  }
};

// ============================
// HEADERS
// ============================
const getHeaders = (isJson = true) => {
  const token = getToken();

  return {
    ...(isJson && { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ============================
// API METHODS
// ============================
export const api = {
  // ============================
  // LOGIN
  // ============================
  login: async (data) => {
    const result = await safeFetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (result?.token) {
      localStorage.setItem("token", result.token);
    }

    return result;
  },

  // ============================
  // REGISTER
  // ============================
  register: async (data) => {
    return safeFetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  // ============================
  // FORGOT PASSWORD
  // ============================
  forgotPassword: async (email) => {
    return safeFetch(`${BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  },

  // ============================
  // RESET PASSWORD
  // ============================
  resetPassword: async (data) => {
    return safeFetch(`${BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  // ============================
  // DASHBOARD SUMMARY
  // ============================
  getSummary: async () => {
    const token = getToken();
    if (!token) throw new Error("Please login first");

    const result = await safeFetch(`${BASE_URL}/doctors/summary`, {
      headers: getHeaders(false),
    });

    return result.data;
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
    const token = getToken();
    if (!token) throw new Error("Please login first");

    const query = `?PageNumber=${page}&PageSize=${pageSize}&search=${search}&status=${status}`;

    const result = await safeFetch(`${BASE_URL}/doctors${query}`, {
      headers: getHeaders(false),
    });

    return {
      data: result?.data ?? [],
      totalPages: result?.totalPages ?? 1,
      totalCount: result?.totalCount ?? 0,
    };
  },

  // ============================
  // CREATE DOCTOR
  // ============================
  createDoctor: async (data) => {
    return safeFetch(`${BASE_URL}/doctors`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
  },

  // ============================
  // UPDATE DOCTOR
  // ============================
  updateDoctor: async (id, data) => {
    return safeFetch(`${BASE_URL}/doctors/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
  },

  // ============================
  // DELETE DOCTOR
  // ============================
  deleteDoctor: async (id) => {
    return safeFetch(`${BASE_URL}/doctors/${id}`, {
      method: "DELETE",
      headers: getHeaders(false),
    });
  },

  // ============================
  // ACTIVITY
  // ============================
  getActivity: async () => {
    const result = await safeFetch(`${BASE_URL}/doctors/activity`, {
      headers: getHeaders(false),
    });

    return result.data ?? [];
  },

  // ============================
  // LOGOUT (CLEAN)
  // ============================
  logout: () => {
    clearAuth();
    window.location.href = "/login";
  },
};