
// src/components/ChatWidget.jsx

import { useState } from "react";
import axios from "axios";
import "./ChatWidget.css";

const API_BASE_URL = "http://localhost:8888"; // backend FastAPI

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // mode: "recommend" | "chat"
  const [mode, setMode] = useState("recommend");

  /**
   * messages:
   * - { from: "bot" | "me", text: string }
   * - { from: "bot", text: string, books: BookOut[] } // để render card sách
   */
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text:
        "Chào bạn, mình là trợ lý BookShopAI.\n" +
        "- Tab Gợi ý: nhập thể loại/chủ đề, mình sẽ đề xuất vài sách phù hợp.\n" +
        "- Tab Chat: hỏi đáp tự do về sách, mình trả lời chi tiết hơn.",
    },
  ]);

  const switchMode = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setMessages((prev) => [
      ...prev,
      {
        from: "bot",
        text:
          newMode === "recommend"
            ? "Bạn đang ở chế độ GỢI Ý NHANH: hãy nhập thể loại/chủ đề (vd: trinh thám, self-help, lập trình...)."
            : "Bạn đang ở chế độ CHAT AI: bạn có thể hỏi về thể loại, nội dung, so sánh sách, v.v.",
      },
    ]);
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg = trimmed;
    setInput("");

    // Push message của user
    setMessages((prev) => [...prev, { from: "me", text: userMsg }]);
    setLoading(true);

    if (mode === "recommend") {
      await handleRecommend(userMsg);
    } else {
      await handleChat(userMsg);
    }

    setLoading(false);
  };

  const handleRecommend = async (userMsg) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/recommend`, {
        query: userMsg,
      });

      const books = res?.data?.books || [];

      if (!books.length) {
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text:
              "Mình chưa tìm được sách phù hợp với mô tả hiện tại.\n" +
              "Bạn thử mô tả rõ hơn thể loại, tác giả, chủ đề hoặc khoảng giá nhé.",
          },
        ]);
        return;
      }

      // Thêm message dạng "books" để render card
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "Mình gợi ý cho bạn những lựa chọn sau:",
          books, // để render card
        },
      ]);
    } catch (error) {
      console.error("Error calling /recommend:", error);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text:
            "Có lỗi khi gọi dịch vụ gợi ý sách (/recommend).\n" +
            "Bạn kiểm tra lại kết nối hoặc thử lại sau ít phút nhé.",
        },
      ]);
    }
  };

  const handleChat = async (userMsg) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/chat`, {
        question: userMsg,
      });

      const answer =
        res?.data?.answer || "Mình chưa nhận được câu trả lời từ AI.";
      setMessages((prev) => [...prev, { from: "bot", text: answer }]);
    } catch (error) {
      console.error("Error calling /chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text:
            "Có lỗi khi gọi dịch vụ chat AI (/chat).\n" +
            "Bạn kiểm tra GOOGLE_API_KEY ở backend hoặc thử lại sau nhé.",
        },
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!loading) {
        sendMessage();
      }
    }
  };

  const goToBookDetail = (bookId) => {
    if (!bookId) return;
    const url = `http://localhost:3000/book/${bookId}`;
    window.open(url, "_blank");
  };

  return (
    <>
      {/* Nút tròn mở/đóng widget */}
      <div className="chat-toggle" onClick={() => setOpen((prev) => !prev)}>
        💬
      </div>

      {open && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <span>BookShopAI – Trợ lý sách</span>
            <button
              className="close-btn"
              onClick={() => setOpen(false)}
              aria-label="Đóng"
            >
              ×
            </button>
          </div>

          {/* Tabs chế độ */}
          <div className="chat-tabs">
            <button
              className={`chat-tab ${mode === "recommend" ? "active" : ""}`}
              onClick={() => switchMode("recommend")}
            >
              Gợi ý nhanh
            </button>
            <button
              className={`chat-tab ${mode === "chat" ? "active" : ""}`}
              onClick={() => switchMode("chat")}
            >
              Chat với AI
            </button>
          </div>

          {/* Body */}
          <div className="chat-body">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.from}`}>
                <div className="chat-bubble-wrapper">
                  {/* Text */}
                  {msg.text && (
                    <div
                      className="chat-bubble"
                      dangerouslySetInnerHTML={{
                        __html: msg.text.replace(/\n/g, "<br />"),
                      }}
                    />
                  )}

                  {/* Nếu có books -> render list card */}
                  {msg.books && Array.isArray(msg.books) && msg.books.length > 0 && (
                    <div className="book-list">
                      {msg.books.map((b) => {
                        const title = b.title || "Không rõ tên sách";
                        const authors = b.authors || "Không rõ tác giả";
                        const categories = b.categories || "Không rõ thể loại";
                        const price =
                          typeof b.price === "number"
                            ? `${b.price.toLocaleString()}₫`
                            : "Không rõ giá";
                        const star =
                          typeof b.star === "number"
                            ? `${b.star.toFixed(1)}/5`
                            : "N/A";
                        const img = b.image || ""; // có thể là full URL từ backend
                        const shortDesc =
                          b.short_description ||
                          "Sách có nội dung gần với sở thích bạn mô tả.";

                        return (
                          <div
                            key={b.book_id || title}
                            className="book-card"
                            onClick={() => goToBookDetail(b.book_id)}
                          >
                            <div className="book-card-thumb">
                              {img ? (
                                <img src={img} alt={title} />
                              ) : (
                                <div className="book-card-thumb-placeholder">
                                  No Image
                                </div>
                              )}
                            </div>
                            <div className="book-card-info">
                              <div className="book-card-title">{title}</div>
                              <div className="book-card-authors">
                                {authors}
                              </div>
                              <div className="book-card-meta">
                                <span>{categories}</span>
                                <span>•</span>
                                <span>{price}</span>
                              </div>
                              <div className="book-card-star">
                                Đánh giá: {star}
                              </div>
                              <div className="book-card-desc">
                                {shortDesc}
                              </div>
                              <div className="book-card-link">
                                Xem chi tiết &raquo;
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-msg bot">
                <div className="chat-bubble typing">
                  {mode === "recommend"
                    ? "Đang tìm sách phù hợp cho bạn..."
                    : "Đang suy nghĩ câu trả lời..."}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "recommend"
                  ? "Mô tả thể loại/chủ đề bạn muốn tìm..."
                  : "Đặt câu hỏi về sách, thể loại, gợi ý đọc..."
              }
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button onClick={sendMessage} disabled={loading}>
              {loading ? "..." : "Gửi"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
