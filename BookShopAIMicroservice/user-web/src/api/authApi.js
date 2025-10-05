// import axios from "axios";
// const API_URL = "http://localhost:8080/api/users"; // qua gateway

// export const authApi = {
//   register: (data) => axios.post(`${API_URL}/register`, data),
//   verifyOtp: (email, otp) =>
//     axios.post(`${API_URL}/verify-otp?email=${email}&otp=${otp}`),
//   login: (data) => axios.post(`${API_URL}/login`, data),
//   resendOtp: (email) => axios.post(`${API_URL}/resend-otp?email=${email}`),
//   changePassword: (username, data) =>
//     axios.post(`${API_URL}/change-password?username=${username}`, data),
//   getProfile: (username) => axios.get(`${API_URL}/profile?username=${username}`),
//   googleLogin: (code) => axios.post(`http://localhost:8082/api/auth/google`, { code })
// };


// export const setToken = (token) => localStorage.setItem("token", token);
// export const getToken = () => localStorage.getItem("token");
// export const logOut = () => localStorage.clear();



import axios from "axios";
const API_URL = "http://localhost:8080/api"; // gateway

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
};

export const setToken = (token) => localStorage.setItem("token", token);
export const getToken = () => localStorage.getItem("token");
export const logout = () => localStorage.clear();
