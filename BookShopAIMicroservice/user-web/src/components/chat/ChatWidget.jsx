// import { useState } from "react";
// import "./ChatWidget.css";

// export default function ChatWidget() {
//   const [open, setOpen] = useState(false);
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState([
//     { from: "bot", text: "Xin chào! Tôi có thể giúp gì cho bạn?" }
//   ]);

//   const sendMessage = () => {
//     if (!input.trim()) return;

//     // push user message
//     setMessages([...messages, { from: "me", text: input }]);

//     // fake bot reply
//     setTimeout(() => {
//       setMessages((prev) => [
//         ...prev,
//         { from: "bot", text: "Tôi đang xử lý yêu cầu của bạn..." }
//       ]);
//     }, 600);

//     setInput("");
//   };

//   return (
//     <>
//       {/* Nút bật/tắt */}
//       <div className="chat-toggle" onClick={() => setOpen(!open)}>
//         💬
//       </div>

//       {/* Cửa sổ chat */}
//       {open && (
//         <div className="chat-window">
//           <div className="chat-header">
//             <span>BookShopAI Chatbot</span>
//             <button className="close-btn" onClick={() => setOpen(false)}>×</button>
//           </div>

//           <div className="chat-body">
//             {messages.map((msg, i) => (
//               <div key={i} className={`chat-msg ${msg.from}`}>
//                 <div className="chat-bubble">{msg.text}</div>
//               </div>
//             ))}
//           </div>

//           <div className="chat-input">
//             <input
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               placeholder="Nhập tin nhắn..."
//               onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//             />
//             <button onClick={sendMessage}>Gửi</button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }





import { useState } from "react";
import "./ChatWidget.css";

const BOOK_DB = [
  { title: "Sherlock Holmes", category: "trinh thám", price: 120000 },
  { title: "Kẻ Trộm Sách", category: "văn học", price: 150000 },
  { title: "Dune", category: "khoa học viễn tưởng", price: 180000 },
  { title: "Clean Code", category: "lập trình", price: 250000 },
  { title: "Java Core", category: "lập trình", price: 210000 },
  { title: "7 Thói Quen Hiệu Quả", category: "kỹ năng sống", price: 130000 },
  { title: "Tư Duy Nhanh và Chậm", category: "tâm lý", price: 160000 },
  { title: "Bí mật của may mắn", category: "kỹ năng sống", price: 110000 }
];

// Hàm lọc sách theo từ khóa
function recommendBooks(query) {
  const keywords = query.toLowerCase().split(" ");

  const result = BOOK_DB.filter(book =>
    keywords.some(k => book.category.includes(k) || book.title.toLowerCase().includes(k))
  );

  return result.length > 0 ? result : null;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "Bạn muốn gợi ý sách thể loại nào?" }
  ]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages([...messages, { from: "me", text: userMsg }]);
    setInput("");

    setTimeout(() => {
      const rec = recommendBooks(userMsg);

      if (!rec) {
        setMessages(prev => [
          ...prev,
          { from: "bot", text: "Tôi không tìm thấy sách phù hợp. Bạn thử mô tả lại thể loại nhé!" }
        ]);
        return;
      }

      const formatted =
        "Mình gợi ý cho bạn những cuốn sau:\n\n" +
        rec
          .map(b => `• **${b.title}** – ${b.category} – ${b.price.toLocaleString()}₫`)
          .join("\n");

      setMessages(prev => [...prev, { from: "bot", text: formatted }]);
    }, 500);
  };

  return (
    <>
      <div className="chat-toggle" onClick={() => setOpen(!open)}>💬</div>

      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <span>BookShopAI – Gợi ý sách</span>
            <button className="close-btn" onClick={() => setOpen(false)}>×</button>
          </div>

          <div className="chat-body">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.from}`}>
                <div
                  className="chat-bubble"
                  dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, "<br>") }}
                />
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Nhập yêu cầu gợi ý..."
              onKeyDown={e => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Gửi</button>
          </div>
        </div>
      )}
    </>
  );
}
