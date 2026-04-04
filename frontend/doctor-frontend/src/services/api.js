const BASE_URL = "http://localhost:5278/api";

// GET TOKEN
const getToken = () => localStorage.getItem("token");

// HANDLE RESPONSE (CORE LOGIC)
const handleResponse = async (res) => {
  const text = await res.text();

  // TOKEN EXPIRED / UNAUTHORIZED
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Session expired. Please login again.");
  }

  // ERROR HANDLING (REAL MESSAGE)
  if (!res.ok) {
    try {
      const errorData = JSON.parse(text);

      // if backend sends structured error
      throw new Error(
        errorData.message ||
        errorData.title ||
        text ||
        "Something went wrong"
      );
    } catch {
      throw new Error(text || "Something went wrong");
    }
  }

  // SUCCESS
  return text ? JSON.parse(text) : {};
};

// COMMON HEADERS
const getHeaders = (isJson = true) => ({
  ...(isJson && { "Content-Type": "application/json" }),
  Authorization: `Bearer ${getToken()}`,
});

// API METHODS
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
    const query = `?PageNumber=${page}&PageSize=${pageSize}&search=${search}&status=${status}`;

    const res = await fetch(`${BASE_URL}/doctors${query}`, {
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

  // UPDATE
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