import axios from "axios";
const BASE = "http://localhost:8080"; // gateway
const USE_PATH_BUYERID = true;

export const reviewApi = {
  create: (buyerId, payload) =>
    USE_PATH_BUYERID
      ? axios.post(`${BASE}/api/reviews/${encodeURIComponent(buyerId)}`, payload)
      : axios.post(`${BASE}/api/reviews`, payload), // header X-User-Id nếu bạn dùng JWT
  myReviews: (buyerId) =>
    USE_PATH_BUYERID
      ? axios.get(`${BASE}/api/reviews/${encodeURIComponent(buyerId)}`)
      : axios.get(`${BASE}/api/reviews`),
   // ✅ lấy review theo sách
  byBook: (bookId) => axios.get(`${BASE}/api/reviews/book/${bookId}`),

};
