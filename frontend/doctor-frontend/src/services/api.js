const BASE_URL = "http://localhost:5278/api";

// helper
const getToken = () => localStorage.getItem("token");

// common headers
const getHeaders = (isJson = true) => ({
  ...(isJson && { "Content-Type": "application/json" }),
  Authorization: `Bearer ${getToken()}`,
});

export const api = {
  // LOGIN
  login: async (data) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Login failed");

    const result = await res.json();

    // store token automatically
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

    if (!res.ok) throw new Error("Failed to fetch summary");

    return res.json();
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

    if (!res.ok) throw new Error("Failed to fetch doctors");

    const result = await res.json();

    // normalize response
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

    if (!res.ok) throw new Error("Create failed");

    return res.json();
  },

  //UPDATE
  updateDoctor: async (id, data) => {
    const res = await fetch(`${BASE_URL}/doctors/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Update failed");

    return res.json();
  },

  // DELETE
  deleteDoctor: async (id) => {
    const res = await fetch(`${BASE_URL}/doctors/${id}`, {
      method: "DELETE",
      headers: getHeaders(false),
    });

    if (!res.ok) throw new Error("Delete failed");

    return res.json();
  },
};