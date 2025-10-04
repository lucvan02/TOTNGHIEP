import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api", // URL backend User Service
  headers: {
    "Content-Type": "application/json",
  },
});

// Gắn token JWT nếu có
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosClient;
