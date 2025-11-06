import axios from "axios";

const api = axios.create({
 // baseURL: "http://localhost:8000",
  baseURL:   "https://crm-crm-backend.onrender.com",
  headers: { "Content-Type": "application/json" },
});

// Attach token automatically from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const res = await axios.post("https://crm-crm-backend.onrender.com/api/auth/refresh-token", { refreshToken });

        const newAccessToken = res.data.accessToken || res.data.data?.accessToken;
        localStorage.setItem("accessToken", newAccessToken);

        api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        return api.request(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed", refreshError);
        //  localStorage.clear();
        //  window.location.href = "/login";
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
