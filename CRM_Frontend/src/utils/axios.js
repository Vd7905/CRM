import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // backend base URL
  withCredentials: true, // if you're using cookies or auth tokens
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Automatically attach manual token to all requests
const manualToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YzQ0NjRhYTU4ZWI2YjdmODM5NTRjMCIsImVtYWlsIjoidmlrYXNkaXhpdHRlbXBAZ21haWwuY29tIiwiaWF0IjoxNzYxMTU2OTAxLCJleHAiOjE3NjExNzQ5MDF9.MWi9PdkgbhWWWqRd1iRelbVUOiW2jUN_BXRba4HMBHk";

api.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${manualToken}`;
  return config;
});

export default api;
