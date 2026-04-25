import axios from "axios";

// Construct the base URL safely, ensuring it always ends with /api
let configuredBaseUrl =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
if (!configuredBaseUrl.endsWith("/api")) {
  configuredBaseUrl += "/api";
}

export const api = axios.create({
  // Automatically switch between localhost for dev and your deployed backend URL for production
  baseURL: configuredBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
