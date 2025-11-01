// // NOTE: nếu bạn đã route qua API Gateway thì sửa BASE_PATH tương ứng:
// //   - Qua gateway:   const BASE_PATH = "/cbf";           // ví dụ gateway map /cbf -> reco-service
// //   - Trực tiếp FE->FastAPI: dùng full URL từ .env: VITE_RECO_BASE=https://localhost:8000/cbf
// // const BASE_PATH = import.meta.env.VITE_RECO_BASE || "/cbf";
// const BASE_PATH = "http://localhost:8000/cbf";

// import axios from "axios";
// // import axiosClient from "./axiosClient";


// export const recoApi = {
//   recommend: (userId, topK = 3, excludePurchased = true) =>
//     axios.get(`${BASE_PATH}/recommend`, {
//       params: { user_id: userId, top_k: topK, exclude_purchased: excludePurchased },
//     }),

//   similar: (bookId, topK = 3) =>
//     axios.get(`${BASE_PATH}/similar`, {
//       params: { book_id: bookId, top_k: topK },
//     }),
// };





import axios from "axios";

// Có thể đưa BASE_PATH vào .env: VITE_RECO_BASE_URL=http://localhost:8000/cbf
const BASE_PATH = import.meta.env.VITE_RECO_BASE_URL || "http://localhost:8000/cbf";

export const recoApi = {
  // Gợi ý cá nhân cho user
  recommend: (userId, topK = 8, excludeInteracted = true) =>
    axios.get(`${BASE_PATH}/recommend`, {
      params: { user_id: userId, top_k: topK, exclude_interacted: excludeInteracted },
    }),

  // Sách tương tự (trả { base, similar: [...] })
  similar: (bookId, topK = 8) =>
    axios.get(`${BASE_PATH}/similar`, {
      params: { book_id: bookId, top_k: topK },
    }),

  // Reload lại vocab + vectors (khi thêm sách/thuộc tính mới) — tùy chọn
  reload: () => axios.post(`${BASE_PATH}/reload`),
};
