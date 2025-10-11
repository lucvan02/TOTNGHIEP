import axios from "axios";
const BASE = "http://localhost:8080";
const USE_PATH_BUYERID = true;

export const favoriteApi = {
  list: (buyerId) =>
    USE_PATH_BUYERID
      ? axios.get(`${BASE}/api/favorites/${encodeURIComponent(buyerId)}`)
      : axios.get(`${BASE}/api/favorites`, { headers: { "X-User-Id": buyerId } }),

  add: (buyerId, bookId) =>
    USE_PATH_BUYERID
      ? axios.post(`${BASE}/api/favorites/${encodeURIComponent(buyerId)}/${bookId}`)
      : axios.post(`${BASE}/api/favorites/${bookId}`, null, { headers: { "X-User-Id": buyerId } }),

  remove: (buyerId, bookId) =>
    USE_PATH_BUYERID
      ? axios.delete(`${BASE}/api/favorites/${encodeURIComponent(buyerId)}/${bookId}`)
      : axios.delete(`${BASE}/api/favorites/${bookId}`, { headers: { "X-User-Id": buyerId } }),

  exists: (buyerId, bookId) =>
    USE_PATH_BUYERID
      ? axios.get(`${BASE}/api/favorites/${encodeURIComponent(buyerId)}/exists/${bookId}`)
      : axios.get(`${BASE}/api/favorites/exists/${bookId}`, { headers: { "X-User-Id": buyerId } }),
};
