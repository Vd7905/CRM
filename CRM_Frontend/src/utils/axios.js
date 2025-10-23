import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // backend base URL
  withCredentials: true, // needed if using cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token automatically from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // get stored JWT
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
