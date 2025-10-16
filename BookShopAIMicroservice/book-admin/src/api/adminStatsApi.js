// src/api/adminStatsApi.js
import axios from "axios";
const BASE = "http://localhost:8080/api/admin/stats";

export const statsApi = {
  kpis: (from, to) => axios.get(`${BASE}/kpis`, { params: { from, to } }),
  revenueDaily: (from, to) => axios.get(`${BASE}/revenue/daily`, { params: { from, to } }),
  ordersDaily: (from, to) => axios.get(`${BASE}/orders/daily`, { params: { from, to } }),
  orderStatus: (from, to) => axios.get(`${BASE}/orders/status`, { params: { from, to } }),
  paymentMethods: (from, to) => axios.get(`${BASE}/payments/methods`, { params: { from, to } }),
  topBooks: (from, to, limit = 10) => axios.get(`${BASE}/top-books`, { params: { from, to, limit } }),
};
