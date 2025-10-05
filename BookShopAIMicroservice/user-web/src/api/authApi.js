import axios from "axios";
const API_URL = "http://localhost:8080/api/users"; // qua gateway

export const authApi = {
  register: (data) => axios.post(`${API_URL}/register`, data),
  verifyOtp: (email, otp) =>
    axios.post(`${API_URL}/verify-otp?email=${email}&otp=${otp}`),
  login: (data) => axios.post(`${API_URL}/login`, data),
  resendOtp: (email) => axios.post(`${API_URL}/resend-otp?email=${email}`),
  changePassword: (username, data) =>
    axios.post(`${API_URL}/change-password?username=${username}`, data),
  getProfile: (username) => axios.get(`${API_URL}/profile?username=${username}`),
  googleLogin: (code) => axios.post(`http://localhost:8082/api/auth/google`, { code })
};


// export const authApi = {
//   googleLogin: (code) => axios.post(`${API_URL}/google`, { code }),
// };