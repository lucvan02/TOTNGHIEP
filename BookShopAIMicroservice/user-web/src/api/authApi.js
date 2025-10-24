import axios from "axios";
const API_URL = "http://localhost:8080/api"; // gateway
// const API_URL = "https://d547vtj3-8080.asse.devtunnels.ms/api"; // gateway

// Tự động đính kèm token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  register: (data) => axios.post(`${API_URL}/users/register`, data),
  verifyOtp: (email, otp) =>
    axios.post(`${API_URL}/users/verify-otp?email=${email}&otp=${otp}`),
  login: (data) => axios.post(`${API_URL}/users/login`, data),
  googleLogin: (code) => axios.post(`${API_URL}/users/google-login`, { code }),
  getProfile: () => axios.get(`${API_URL}/users/profile`),
  changePassword: (data) => axios.post(`${API_URL}/users/change-password`, data),
  resendOtp: (email) => axios.post(`${API_URL}/users/resend-otp?email=${email}`),
  sendOtp: (email) => axios.post(`${API_URL}/users/send-otp?email=${email}`),
};

export const setToken = (token) => localStorage.setItem("token", token);
export const getToken = () => localStorage.getItem("token");
export const logout = () => localStorage.clear();

export const setUid = (uid) => localStorage.setItem("uid", uid);

export const getUid = () => {
  const direct = localStorage.getItem("uid");
  if (direct) return direct;
  // fallback: parse JWT nếu gateway/user-service đã nhét uid vào claim `uid` hoặc `sub`
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.uid || payload.sub || null;
  } catch {
    return null;
  }
};

