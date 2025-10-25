import axios from "axios";
const BASE = "http://localhost:8080";

export const adminApi = {
  analyticsSummary: (from, to) =>
    axios.get(`${BASE}/api/admin/analytics/summary`, { params: { from, to } }),
  analyticsDaily: (from, to) =>
    axios.get(`${BASE}/api/admin/analytics/daily`, { params: { from, to } }),
  analyticsTopBooks: (from, to, limit = 10) =>
    axios.get(`${BASE}/api/admin/analytics/top-books`, { params: { from, to, limit } }),
};
