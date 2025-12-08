import axios from "axios";

const BASE = "http://localhost:8080"; // API Gateway
// axios interceptor  đã tự gắn Authorization nếu có

export const adminOrderApi = {
  // list all or by status
  list: (status) => axios.get(`${BASE}/api/orders`, { params: { status } }),
  // detail by orderId (UUID)
  detail: (orderId) => axios.get(`${BASE}/api/orders/${orderId}`),
  // update business status
  updateStatus: (orderId, status, cancelReason) =>
    axios.put(`${BASE}/api/orders/${orderId}/status`, { status, cancelReason }),
  // set paymentStatus (true/false)
  setPayment: (orderId, paid) =>
    axios.put(`${BASE}/api/orders/${orderId}/payment`, null, { params: { paid } }),

  getHistoryByUser: (uid) =>
    axios.get(`${BASE}/api/orders/${encodeURIComponent(uid)}/history`),

};
