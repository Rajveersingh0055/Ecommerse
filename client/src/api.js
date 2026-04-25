import axios from "axios";

const normalizeApiBaseUrl = (url) => {
  const trimmedUrl = url.trim().replace(/\/+$/, "");
  return trimmedUrl.endsWith("/api") ? trimmedUrl : `${trimmedUrl}/api`;
};

const configuredBaseUrl = normalizeApiBaseUrl(
  import.meta.env.VITE_API_URL || "http://localhost:5000/api",
);

export const api = axios.create({
  baseURL: configuredBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
