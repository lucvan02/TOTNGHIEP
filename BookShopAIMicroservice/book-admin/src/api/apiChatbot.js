// src/api/apiChatbot.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8888/chatbot";

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Lấy danh sách file chính sách từ backend
// Backend expected response: [{ filename: "...", source: "...", uploaded_at: "...", size: 12345 }, ...]
export async function getPolicies() {
  try {
    const res = await client.get("/policies");
    return res.data;
  } catch (err) {
    // rethrow để component xử lý
    throw err;
  }
}

// Upload 1 file; file is a File object from input[type=file]
// Returns backend response (IngestResponse or accepted)
export async function uploadPolicyFile(file) {
  try {
    const fd = new FormData();
    fd.append("file", file);

    const res = await client.post("/upload_file", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err) {
    throw err;
  }
}

// Kích hoạt ingest thủ công (reload toàn bộ dữ liệu) -> POST /ingest
export async function triggerIngest() {
  try {
    const res = await client.post("/ingest");
    return res.data;
  } catch (err) {
    throw err;
  }
}


// --- bổ sung vào src/api/apiChatbot.js ---
export async function getPolicyContent(filename) {
  try {
    const res = await client.post("/policy_content", { filename });
    return res.data; // { filename, content, truncated }
  } catch (err) {
    throw err;
  }
}

export async function deletePolicy(filename) {
  try {
    const res = await client.post("/delete_file", { filename });
    return res.data;
  } catch (err) {
    throw err;
  }
}










// // src/api/apiChatbot.js
// import axios from "axios";

// const API_BASE_URL = "http://localhost:8888"; // Đảm bảo đúng Port backend của bạn

// const client = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 60000, // Tăng timeout vì Ingest có thể lâu
// });

// export async function getPolicies() {
//   const res = await client.get("/chatbot/policies");
//   return res.data;
// }

// export async function uploadPolicyFile(file) {
//   const fd = new FormData();
//   fd.append("file", file);
//   const res = await client.post("/chatbot/upload_file", fd, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return res.data;
// }

// export async function triggerIngest() {
//   const res = await client.post("/chatbot/ingest");
//   return res.data;
// }

// // API lấy nội dung file
// export async function getPolicyContent(filename) {
//   const res = await client.get(`/chatbot/policies/content/${filename}`);
//   return res.data; // Trả về { filename, content }
// }

// // API xóa file
// export async function deletePolicy(filename) {
//   const res = await client.delete(`/chatbot/policies/${filename}`);
//   return res.data;
// }