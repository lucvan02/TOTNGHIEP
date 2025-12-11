// src/api/apiChatbot.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8888";

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
