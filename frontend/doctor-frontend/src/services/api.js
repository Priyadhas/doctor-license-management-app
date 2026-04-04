const BASE_URL = "http://localhost:5278/api";

// GET TOKEN
const getToken = () => localStorage.getItem("token");

// HANDLE RESPONSE
const handleResponse = async (res) => {
  const text = await res.text();

  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Session expired. Please login again.");
  }

  if (!res.ok) {
    try {
      const errorData = JSON.parse(text);

      throw new Error(
        errorData.message ||
        errorData.title ||
        "Something went wrong"
      );
    } catch {
      throw new Error(text || "Something went wrong");
    }
  }

  return text ? JSON.parse(text) : {};
};

// HEADERS
const getHeaders = (isJson = true) => ({
  ...(isJson && { "Content-Type": "application/json" }),
  Authorization: `Bearer ${getToken()}`,
});

// ============================
// API METHODS
// ============================
export const api = {
  // LOGIN
  login: async (data) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await handleResponse(res);

    if (result.token) {
      localStorage.setItem("token", result.token);
    }

    return result;
  },

  // ============================
  // DASHBOARD SUMMARY
  // ============================
  getSummary: async () => {
    const res = await fetch(`${BASE_URL}/doctors/summary`, {
      headers: getHeaders(false),
    });

    const result = await handleResponse(res);

    // normalize response
    return result?.data ?? result ?? {};
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
    const query = `?PageNumber=${page}&PageSize=${pageSize}&search=${search}&status=${status}`;

    const res = await fetch(`${BASE_URL}/doctors${query}`, {
      headers: getHeaders(false),
    });

    const result = await handleResponse(res);

    return {
      data: result?.data ?? [],
      totalPages: result?.totalPages ?? 1,
      totalCount: result?.totalCount ?? 0,
    };
  },

  // ============================
  // CREATE
  // ============================
  createDoctor: async (data) => {
    const res = await fetch(`${BASE_URL}/doctors`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    return handleResponse(res);
  },

  // ============================
  // UPDATE
  // ============================
  updateDoctor: async (id, data) => {
    const res = await fetch(`${BASE_URL}/doctors/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    return handleResponse(res);
  },

  // ============================
  // DELETE
  // ============================
  deleteDoctor: async (id) => {
    const res = await fetch(`${BASE_URL}/doctors/${id}`, {
      method: "DELETE",
      headers: getHeaders(false),
    });

    return handleResponse(res);
  },

  // ============================
  // RECENT ACTIVITY
  // ============================
  getActivity: async () => {
    const res = await fetch(`${BASE_URL}/doctors/activity`, {
      headers: getHeaders(false),
    });

    const result = await handleResponse(res);

    return Array.isArray(result)
      ? result
      : result?.data ?? [];
  },
};