// src/components/chat/ChatWidget.jsx
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./ChatWidget.css";

const API_BASE_URL = "http://localhost:8888/chatbot"; // backend FastAPI

// Định nghĩa cấu trúc tin nhắn để sử dụng trong state
const initialMessages = [
  {
    from: "bot",
    text:
      "Chào bạn, mình là trợ lý BookShopAI.\n" +
      "- Tab Gợi ý: nhập thể loại/chủ đề, mình sẽ đề xuất vài sách phù hợp.\n" +
      "- Tab Chat: hỏi đáp tự do về sách, mình trả lời chi tiết hơn.",
    isSystem: true, // Đánh dấu tin nhắn hệ thống
  },
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("recommend"); // mode: "recommend" | "chat"

  /**
   * messages:
   * - { from: "bot" | "me", text: string, isSystem?: boolean }
   * - { from: "bot", text: string, books: BookOut[] } // để render card sách
   */
  const [messages, setMessages] = useState(initialMessages);

  // Tham chiếu để tự động cuộn xuống cuối chat
  const chatBodyRef = useRef(null);

  // Cuộn xuống cuối khi messages thay đổi
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  // Hàm lọc lịch sử chat để gửi lên API
  const getChatHistory = () => {
    // Lọc ra các tin nhắn KHÔNG phải tin nhắn hệ thống, và giới hạn số lượng tin nhắn gần nhất (ví dụ: 10 tin nhắn)
    return messages
      .filter((msg) => !msg.isSystem && msg.text)
      .slice(-10) // Giới hạn 10 tin nhắn gần nhất (5 cặp Q&A) để tránh request quá lớn
      .map((msg) => ({
        role: msg.from === "me" ? "human" : "ai",
        content: msg.text,
      }));
  };

  const switchMode = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setMessages((prev) => [
      ...prev,
      {
        from: "bot",
        text:
          newMode === "recommend"
            ? "Bạn đang ở chế độ GỢI Ý NHANH: hãy nhập tổng quan sách bạn muốn tìm"
            : "Bạn đang ở chế độ CHAT AI: bạn có thể trò chuyện cùng AI nhưng sẽ giới hạn số lượt hỏi.",
        isSystem: true, // Đánh dấu đây là tin nhắn hệ thống, không gửi lên API chat
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
      const message = res?.data?.message; // Lấy thông báo từ backend (nếu có)

      if (!books.length) {
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: message ||
              "Mình chưa tìm được sách phù hợp với mô tả hiện tại (có thể do không đạt ngưỡng điểm). Bạn thử mô tả rõ hơn nhé.",
          },
        ]);
        return;
      }

      // Thêm message dạng "books" để render card
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: message || "Mình gợi ý cho bạn những lựa chọn sau:",
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
            "Có lỗi khi gọi dịch vụ gợi ý sách.\n" +
            "Bạn kiểm tra lại kết nối hoặc thử lại sau ít phút nhé.",
        },
      ]);
    }
  };

  // HÀM XỬ LÝ CHAT ĐÃ ĐƯỢC CẬP NHẬT ĐỂ GỬI LỊCH SỬ CHAT
  const handleChat = async (userMsg) => {
    // Lấy lịch sử chat (trừ tin nhắn user hiện tại)
    const history = getChatHistory();

    try {
      const res = await axios.post(`${API_BASE_URL}/chat`, {
        question: userMsg,
        history: history, // Gửi lịch sử chat
      });

      const answer =
        res?.data?.answer || "Mình chưa nhận được câu trả lời từ AI.";
      
      // Tin nhắn trả lời từ bot cần được thêm vào state ngay sau khi userMsg được thêm
      setMessages((prev) => [...prev, { from: "bot", text: answer }]);
    } catch (error) {
      console.error("Error calling /chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text:
            "Có lỗi khi gọi dịch vụ chat AI.\n" +
            "Bạn thử lại sau nhé.",
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
    // window.open(url, "_blank");
    window.open(url);//khong can _blank de tranh bi chan boi popup blocker
  };

  // Hàm render card sách (giữ nguyên)
  const renderBookCards = (books) => {
    return (
      <div className="book-list">
        {books.map((b) => {
          const title = b.title || "Không rõ tên sách";
          const authors = b.authors || "Không rõ tác giả";
          const categories = b.categories || "Không rõ thể loại";
          const price =
            typeof b.price === "number"
              ? `${b.price.toLocaleString()}₫`
              : "Không rõ giá";
          const star =
            typeof b.star === "number" ? `${b.star.toFixed(1)}/5` : "N/A";
          const img = b.image || "";
          const shortDesc =
            b.short_description || "Sách có nội dung gần với sở thích bạn mô tả.";

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
                  <div className="book-card-thumb-placeholder">No Image</div>
                )}
              </div>
              <div className="book-card-info">
                <div className="book-card-title">{title}</div>
                <div className="book-card-authors">{authors}</div>
                <div className="book-card-meta">
                  <span>{categories}</span>
                  <span>•</span>
                  <span>{price}</span>
                </div>
                <div className="book-card-star">Đánh giá: {star}</div>
                <div className="book-card-desc">{shortDesc}</div>
                <div className="book-card-link">Xem chi tiết &raquo;</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Giao diện chính (giữ nguyên)
  return (
    <>
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
          <div className="chat-body" ref={chatBodyRef}>
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
                    renderBookCards(msg.books)
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