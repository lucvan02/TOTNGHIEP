import axios from "axios";

const BASE = "http://localhost:8080"; // API Gateway
const USE_PATH_BUYERID = true;        // =false nếu bạn đã chuyển sang JWT/X-User-Id

export const orderApi = {
  addToCart: (buyerId, { bookId, quantity }) =>
    USE_PATH_BUYERID
      ? axios.post(`${BASE}/api/carts/${encodeURIComponent(buyerId)}/items`, { bookId, quantity })
      : axios.post(`${BASE}/api/carts/items`, { bookId, quantity }, { headers: { "X-User-Id": buyerId } }),

  getCart: (buyerId) =>
    USE_PATH_BUYERID
      ? axios.get(`${BASE}/api/carts/${encodeURIComponent(buyerId)}`)
      : axios.get(`${BASE}/api/carts`, { headers: { "X-User-Id": buyerId } }),

  checkout: (buyerId, payload) =>
    USE_PATH_BUYERID
      ? axios.post(`${BASE}/api/orders/${encodeURIComponent(buyerId)}/checkout`, payload)
      : axios.post(`${BASE}/api/orders/checkout`, payload, { headers: { "X-User-Id": buyerId } }),
};
