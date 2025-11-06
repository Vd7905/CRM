import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  //baseURL: "https://crm-crm-backend.onrender.com",
  headers: { "Content-Type": "application/json" },
});

// 🔹 Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Identify which endpoint failed
    const url = originalRequest?.url || "";
    const isLogin = url.includes("/api/auth/login");
    const isRefresh = url.includes("/api/auth/refresh-token");

    // ⚠️ Skip redirect logic for login & refresh endpoints
    if (error.response?.status === 401 && !isLogin && !isRefresh && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token found");

        const res = await axios.post("https://crm-crm-backend.onrender.com/api/auth/refresh-token", {
          refreshToken,
        });

        const newAccessToken = res.data.accessToken || res.data.data?.accessToken;
        localStorage.setItem("accessToken", newAccessToken);

        api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        return api.request(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

        // Small delay for toast visibility before redirect
        setTimeout(() => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          if (window.location.pathname !== "/login") {
            window.location.replace("/login");
          }
        }, 1500);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
