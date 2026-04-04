const BASE_URL = "http://localhost:5278/api";

// TOKEN
const getToken = () => localStorage.getItem("token");

// HEADERS
const getHeaders = (isJson = true) => {
  const headers = {};

  if (isJson) headers["Content-Type"] = "application/json";

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return headers;
};

// GLOBAL RESPONSE HANDLER (MOST IMPORTANT)
const handleResponse = async (res) => {
  // TOKEN EXPIRED / UNAUTHORIZED
  if (res.status === 401) {
    localStorage.removeItem("token");

    // optional: show message
    if (typeof window !== "undefined") {
      alert("Session expired. Please login again.");
      window.location.href = "/login";
    }

    throw new Error("Session expired");
  }

  // OTHER ERRORS
  if (!res.ok) {
    let message = "Something went wrong";

    try {
      const errorData = await res.json();
      message = errorData.message || message;
    } catch {
      // ignore parsing error
    }

    throw new Error(message);
  }

  return res.json();
};

// API
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

  // DASHBOARD
  getSummary: async () => {
    const res = await fetch(`${BASE_URL}/doctors/summary`, {
      headers: getHeaders(false),
    });

    return handleResponse(res);
  },

  // GET DOCTORS
  getDoctors: async ({
    page = 1,
    pageSize = 5,
    search = "",
    status = "",
  } = {}) => {
    const query = new URLSearchParams({
      PageNumber: page,
      PageSize: pageSize,
      search,
      status,
    }).toString();

    const res = await fetch(`${BASE_URL}/doctors?${query}`, {
      headers: getHeaders(false),
    });

    const result = await handleResponse(res);

    return {
      data: result.data || [],
      totalPages: result.totalPages || 1,
      totalCount: result.totalCount || 0,
    };
  },

  // CREATE
  createDoctor: async (data) => {
    const res = await fetch(`${BASE_URL}/doctors`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    return handleResponse(res);
  },

  // ✏️ UPDATE
  updateDoctor: async (id, data) => {
    const res = await fetch(`${BASE_URL}/doctors/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    return handleResponse(res);
  },

  // DELETE
  deleteDoctor: async (id) => {
    const res = await fetch(`${BASE_URL}/doctors/${id}`, {
      method: "DELETE",
      headers: getHeaders(false),
    });

    return handleResponse(res);
  },
};