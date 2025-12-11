// src/components/ChatbotManage.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  getPolicies,
  uploadPolicyFile,
  triggerIngest,
} from "../../api/apiChatbot";
import "./ChatbotManage.css"; // optional, add styles if you want

export default function ChatbotManage() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const fileRef = useRef();

  useEffect(() => {
    fetchPolicies();
  }, []);

  async function fetchPolicies() {
    setLoading(true);
    setError(null);
    try {
      const list = await getPolicies();
      setPolicies(list || []);
    } catch (err) {
      console.error("Lỗi khi lấy policies:", err);
      setError("Không lấy được danh sách file. Kiểm tra backend /policies.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    const file = fileRef.current && fileRef.current.files && fileRef.current.files[0];
    if (!file) {
      setError("Vui lòng chọn file để upload (txt/pdf/md).");
      return;
    }

    setUploading(true);
    try {
      const res = await uploadPolicyFile(file);
      // res có thể là {status: 'accepted', message: '...'} hoặc success
      setMessage(
        res?.message ||
          "File đã gửi lên. Nếu backend chạy ingest nền, chờ một chút rồi bấm Làm mới."
      );
      // làm mới danh sách (sau 1s chờ backend lưu file)
      setTimeout(() => fetchPolicies(), 1200);
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Có lỗi khi upload file. Kiểm tra console."
      );
    } finally {
      setUploading(false);
      // reset input
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleTriggerIngest() {
    setIngesting(true);
    setError(null);
    setMessage(null);
    try {
      const res = await triggerIngest();
      setMessage(
        res?.message ||
          "Đã gửi lệnh ingest. Nếu chạy nền, kiểm tra logs để biết tiến trình."
      );
    } catch (err) {
      console.error("Trigger ingest error:", err);
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Có lỗi khi gọi /ingest. Kiểm tra backend."
      );
    } finally {
      setIngesting(false);
    }
  }

  function humanSize(bytes) {
    if (!bytes && bytes !== 0) return "-";
    const kb = 1024;
    if (bytes < kb) return `${bytes} B`;
    if (bytes < kb ** 2) return `${(bytes / kb).toFixed(1)} KB`;
    if (bytes < kb ** 3) return `${(bytes / kb ** 2).toFixed(1)} MB`;
    return `${(bytes / kb ** 3).toFixed(1)} GB`;
  }

  return (
    <div className="chatbot-manage">
      <h2>Quản lý Chatbot — Tài liệu & Ingest</h2>

      <div className="panel">
        <div className="panel-head">
          <strong>Danh sách tài liệu (policy / FAQ)</strong>
          <div style={{ marginLeft: "auto" }}>
            <button onClick={fetchPolicies} disabled={loading}>
              {loading ? "Đang tải..." : "Làm mới"}
            </button>
            <button
              onClick={handleTriggerIngest}
              disabled={ingesting}
              style={{ marginLeft: 8 }}
            >
              {ingesting ? "Đang chạy..." : "Load lại dữ liệu"}
            </button>
          </div>
        </div>

        <div className="panel-body">
          {error && <div className="error-box">{error}</div>}
          {message && <div className="message-box">{message}</div>}

          {policies.length === 0 ? (
            <div className="empty">Chưa có file nào. Bạn có thể upload file bên dưới.</div>
          ) : (
            <table className="policy-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tên file</th>
                  <th>Kích thước</th>
                  <th>Ngày tải lên</th>
                  <th>Nguồn</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((p, idx) => (
                  <tr key={p.filename || idx}>
                    <td>{idx + 1}</td>
                    <td style={{ maxWidth: 420 }}>
                      <div className="filename">{p.filename}</div>
                    </td>
                    <td>{humanSize(p.size)}</td>
                    <td>{p.uploaded_at ? new Date(p.uploaded_at).toLocaleString() : "-"}</td>
                    <td>{p.source || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-head">
          <strong>Upload tài liệu mới</strong>
        </div>
        <div className="panel-body">
          <form onSubmit={handleUpload} className="upload-form">
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.pdf,.md"
              disabled={uploading}
            />
            <button type="submit" disabled={uploading} style={{ marginLeft: 8 }}>
              {uploading ? "Đang upload..." : "Upload & Load lại dữ liệu"}
            </button>
            <small style={{ display: "block", marginTop: 8, color: "#666" }}>
              Chỉ chấp nhận: .txt, .pdf, .md. Sau upload hệ thống sẽ chạy nền.
            </small>
          </form>
        </div>
      </div>
    </div>
  );
}
