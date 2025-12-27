
// import { useEffect, useState } from "react";
// import Header from "../../components/Header/Header";
// import Footer from "../../components/Footer/Footer";
// import BookCard from "../../components/BookCard";
// import { bookApi } from "../../api/bookApi";
// import { recoApi } from "../../api/recoApi";
// import {
//   Box, Grid, Typography, CircularProgress, Button, Divider,
// } from "@mui/material";

// /** Utils: đọc user/uid từ localStorage */
// function getStoredUser() {
//   try {
//     const raw = localStorage.getItem("user");
//     if (!raw) return null;
//     const obj = JSON.parse(raw);
//     return obj?.user ?? obj ?? null; // hỗ trợ {user:{...}} hoặc {...}
//   } catch {
//     return null;
//   }
// }
// function getUid() {
//   const u = getStoredUser();
//   return u?.uid ?? u?.userId ?? null;
// }

// /** Nếu BE chưa có /books/by-ids, dùng Promise.all getById */
// async function fetchBooksByIds(ids) {
//   const list = await Promise.allSettled(ids.map((id) => bookApi.getById(id)));
//   return list
//     .filter((p) => p.status === "fulfilled" && p.value?.data?.data)
//     .map((p) => p.value.data.data);
// }

// export default function Recommend() {
//   const [uid, setUid] = useState(getUid());
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Sync uid nếu tab khác đăng nhập/đăng xuất
//   useEffect(() => {
//     const sync = () => setUid(getUid());
//     window.addEventListener("storage", sync);
//     return () => window.removeEventListener("storage", sync);
//   }, []);

//   const fetchUserReco = async () => {
//     const userId = getUid();
//     if (!userId) { setItems([]); setLoading(false); return; }
//     try {
//       const res = await recoApi.recommend(userId, 4, true);
//       const scored = res?.data || []; // [{book_id, score}]
//       if (scored.length === 0) { setItems([]); return; }

//       const ids = scored.map((x) => x.book_id);
//       const details = await fetchBooksByIds(ids);

//       // map score để sắp xếp theo điểm
//       const scoreMap = new Map(scored.map((x) => [x.book_id, x.score]));
//       details.sort((a, b) => (scoreMap.get(b.id) ?? 0) - (scoreMap.get(a.id) ?? 0));

//       setItems(details);
//     } catch (e) {
//       console.error("Lỗi recommend:", e);
//       setItems([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Lần đầu + khi uid đổi
//   useEffect(() => {
//     setLoading(true);
//     fetchUserReco();
 
//   }, [uid]);

//   return (
//     <>
//       <Header />
//       <Box mt={10} p={3} bgcolor="#f9f9f9" minHeight="100vh">
//         <Box display="flex" alignItems="baseline" justifyContent="space-between" mb={2}>
//           <Typography variant="h4" fontWeight="bold">
//             Gợi ý cho bạn
//           </Typography>
//           <Box display="flex" gap={1}>
//             <Button size="small" onClick={() => { setLoading(true); fetchUserReco(); }} disabled={loading}>
//               Làm mới
//             </Button>
//             {/* Tùy chọn: gọi POST /cbf/reload nếu vừa thêm sách/thuộc tính mới */}
//             {/* <Button size="small" onClick={() => recoApi.reload()}>Reload vectors</Button> */}
//           </Box>
//         </Box>
//         <Divider sx={{ mb: 3 }} />

//         {!uid && (
//           <Typography color="text.secondary" mb={3}>
//             Hãy <b>đăng nhập</b> để nhận gợi ý cá nhân hoá (từ đánh giá & yêu thích).
//           </Typography>
//         )}

//         {loading ? (
//           <Box display="flex" justifyContent="center" alignItems="center" py={8}>
//             <CircularProgress />
//           </Box>
//         ) : items.length > 0 ? (
//           <Grid container spacing={3}>
//             {items.map((book) => (
//               <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
//                 <BookCard book={book} />
//               </Grid>
//             ))}
//           </Grid>
//         ) : (
//           <Typography color="text.secondary">
//             Chưa có dữ liệu gợi ý. Hãy đánh giá/yêu thích vài cuốn để hệ thống học khẩu vị của bạn.
//           </Typography>
//         )}
//       </Box>
//       <Footer />
//     </>
//   );
// }



















import { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import BookCard from "../../components/BookCard";
import { bookApi } from "../../api/bookApi";
import { recoApi } from "../../api/recoApi";
import {
  Box, Grid, Typography, CircularProgress, Button, Divider,
} from "@mui/material";

/** Utils: đọc user/uid từ localStorage */
function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const obj = JSON.parse(raw);
    return obj?.user ?? obj ?? null; // hỗ trợ {user:{...}} hoặc {...}
  } catch {
    return null;
  }
}
function getUid() {
  const u = getStoredUser();
  return u?.uid ?? u?.userId ?? null;
}

/** Nếu BE chưa có /books/by-ids, dùng Promise.all getById */
async function fetchBooksByIds(ids) {
  const list = await Promise.allSettled(ids.map((id) => bookApi.getById(id)));
  return list
    .filter((p) => p.status === "fulfilled" && p.value?.data?.data)
    .map((p) => p.value.data.data);
}

const SCORE_THRESHOLD = 0.5; // chỉ lấy gợi ý có điểm >= 0.5

export default function Recommend() {
  const [uid, setUid] = useState(getUid());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync uid nếu tab khác đăng nhập/đăng xuất
  useEffect(() => {
    const sync = () => setUid(getUid());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const fetchUserReco = async () => {
    const userId = getUid();
    if (!userId) { setItems([]); setLoading(false); return; }
    try {
      // gọi nhiều hơn rồi mới lọc theo threshold
      const res = await recoApi.recommend(userId, /* topK */ 20, /* excludeInteracted */ true);
      const scored = res?.data || []; // [{book_id, score}]
      // LỌC score >= 0.5
      const filtered = scored.filter(x => (x?.score ?? 0) >= SCORE_THRESHOLD);
      if (filtered.length === 0) { setItems([]); return; }

      const ids = filtered.map((x) => x.book_id);
      const details = await fetchBooksByIds(ids);

      // map score để hiển thị/sắp xếp theo điểm
      const scoreMap = new Map(filtered.map((x) => [x.book_id, x.score]));
      const merged = details
        .map(b => ({ ...b, _score: scoreMap.get(b.id) ?? 0 }))
        .sort((a, b) => b._score - a._score);

      setItems(merged);
    } catch (e) {
      console.error("Lỗi recommend:", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Lần đầu + khi uid đổi
  useEffect(() => {
    setLoading(true);
    fetchUserReco();
  }, [uid]);

  return (
    <>
      <Header />
      <Box mt={10} p={3} bgcolor="#f9f9f9" minHeight="100vh">
        <Box display="flex" alignItems="baseline" justifyContent="space-between" mb={2}>
          <Typography variant="h4" fontWeight="bold">
            Gợi ý cho bạn
          </Typography>
          <Box display="flex" gap={1}>
            <Button size="small" onClick={() => { setLoading(true); fetchUserReco(); }} disabled={loading}>
              Làm mới
            </Button>
            {/* Tùy chọn: gọi POST /cbf/reload nếu vừa thêm sách/thuộc tính mới */}
            {/* <Button size="small" onClick={() => recoApi.reload()}>Reload vectors</Button> */}
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />

        {!uid && (
          <Typography color="text.secondary" mb={3}>
            Hãy <b>đăng nhập</b> để nhận gợi ý cá nhân hoá (từ đánh giá & yêu thích).
          </Typography>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={8}>
            <CircularProgress />
          </Box>
        ) : items.length > 0 ? (
          <Grid container spacing={3}>
            {items.map((book) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                {/* Nếu muốn hiển thị điểm, có thể truyền thêm prop hoặc render nhẹ ở đây */}
                <div style={{ position: "relative" }}>
                  <BookCard book={book} />
                  {typeof book._score === "number" && (
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        background: "rgba(0,0,0,0.6)",
                        color: "#fff",
                        fontSize: 12,
                        padding: "2px 6px",
                        borderRadius: 6,
                      }}
                      title="Điểm gợi ý"
                    >
                      {book._score.toFixed(3)}
                    </div>
                  )}
                </div>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="text.secondary">
            Chưa có dữ liệu để gợi ý. Hãy đánh giá/yêu thích thêm để hệ thống hiểu khẩu vị của bạn.
          </Typography>
        )}
      </Box>
      <Footer />
    </>
  );
}
