
// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";             
// import { bookApi } from "../../api/bookApi";
// import { orderApi } from "../../api/orderApi";                           
// import { getUid } from "../../api/localStorageService";                    
// import {
//   Box, Typography, CircularProgress, Card, CardMedia,
//   Divider, Button, Rating, Snackbar, Alert
// } from "@mui/material";
// import { Tag } from "antd";
// import { ShoppingCartOutlined } from "@ant-design/icons";
// import { Favorite } from "@mui/icons-material";

// export default function BookDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();                               
//   const [book, setBook] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);                         
//   const [toast, setToast] = useState({ open: false, type: "success", msg: "" });
//   const user = JSON.parse(localStorage.getItem("user"));

//   useEffect(() => {
//     const fetchBook = async () => {
//       try {
//         const res = await bookApi.getById(id);
//         setBook(res.data.data);
//       } catch (e) {
//         console.error("Lỗi khi lấy chi tiết sách:", e);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchBook();
//   }, [id]);

//   const notify = (type, msg) => setToast({ open: true, type, msg });       

//   const handleAddToCart = async () => {                                    
//     // const uid = getUid();
//     const uid = user.uid;
//     if (!uid) return notify("error", "Bạn cần đăng nhập để thêm vào giỏ");
//     try {
//       setSaving(true);
//       await orderApi.addToCart(uid, { bookId: Number(id), quantity: 1 });
//       notify("success", "Đã thêm vào giỏ hàng");
//     } catch (e) {
//       console.error(e);
//       notify("error", e?.response?.data?.message || "Không thêm được vào giỏ");
//     } finally {
//       setSaving(false);
//     }
//   };



//   const handleFavorite = () => {                                          // NEW
//     notify("info", "Tính năng đang phát triển");
//   }

//   if (loading)
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
//         <CircularProgress />
//       </Box>
//     );

//   if (!book) return <Typography align="center">Không tìm thấy sách</Typography>;

//   return (
//     <Box p={5} display="flex" flexDirection="column" gap={4} sx={{ backgroundColor: "#fafafa", minHeight: "100vh" }}>
//       <Card sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, p: 4, boxShadow: 4, borderRadius: 3, backgroundColor: "#fff" }}>
//         <CardMedia component="img" image={book.image} alt={book.title}
//           sx={{ width: { xs: "100%", md: 320 }, height: 450, objectFit: "cover", borderRadius: 2 }} />

//         <Box flex={1} ml={{ md: 4 }} mt={{ xs: 3, md: 0 }}>
//           <Typography variant="h4" fontWeight="bold" mb={1}>{book.title}</Typography>

//           {/* Đánh giá sao trung bình */}
//           <Typography variant="body1" color="text.secondary" mb={2}>
//             <Rating value={book.star} readOnly precision={0.1} />
//             <span style={{ marginLeft: 8 }}>{book.star?.toFixed(1)}</span>
//           </Typography>

//           {/* //Tồn kho và đã bán */}
//           <Typography variant="subtitle1" color="text.secondary" mb={2}>
//             Đã bán: {book.saleQuantity} || Hiện có: {book.stock}
//           </Typography>

//           <Box display="flex" gap={2} mb={3}>
//             <Button variant="contained" color="primary" startIcon={<ShoppingCartOutlined />} disabled={saving}
//               onClick={handleAddToCart}>
//               Thêm vào giỏ
//             </Button>
        
//             <Button variant="outlined" color="secondary" disabled={saving}
//               onClick={handleFavorite}>
//               Yêu thích
//             </Button>
//           </Box>

//           <Divider sx={{ my: 2 }} />
//           <Box>
//             <Typography variant="body1" fontWeight="bold">Thể loại:</Typography>
//             {book.categories?.map((c) => (
//               <Tag color="geekblue" key={c.id} style={{ marginTop: 5 }}>{c.name}</Tag>
//             ))}
//           </Box>

//           <Box>
//             <Typography variant="body1" fontWeight="bold">Tác giả:</Typography>
//             {book.authors?.map((a) => (
//               <Tag color="purple" key={a.id} style={{ marginTop: 5 }}>{a.name}</Tag>
//             ))}
//           </Box>

//           <Box>
//             <Typography variant="body1" fontWeight="bold">Nhà xuất bản:</Typography>
//             {book.publisher && <Tag color="green" style={{ marginTop: 5 }}>{book.publisher.name}</Tag>}
//           </Box>
//         </Box>
//       </Card>

//       <Card
//         sx={{
//           p: 3,
//           borderRadius: 3,
//           boxShadow: 2,
//           backgroundColor: "#fff",
//         }}
//       >
//         <Typography variant="h6" mb={2}>
//           📖 Mô tả
//         </Typography>
//         <Typography
//           variant="body1"
//           sx={{ whiteSpace: "pre-wrap" }}
//           dangerouslySetInnerHTML={{ __html: book.description }}
//         />
//       </Card>

//       {/* Khu vực đánh giá */}
//       <Card
//         sx={{
//           p: 3,
//           borderRadius: 3,
//           boxShadow: 2,
//           backgroundColor: "#fff",
//         }}
//       >
//         <Typography variant="h6" mb={2}>
//           ⭐ Đánh giá (chưa có)
//         </Typography>
//         <Box display="flex" flexDirection="column" alignItems="center">
//           <Rating value={0} readOnly size="large" />
//           <Typography mt={1} color="text.secondary">
//             Tính năng đánh giá sẽ sớm được cập nhật!
//           </Typography>
//         </Box>
//       </Card>

//       <Snackbar open={toast.open} autoHideDuration={2000} onClose={() => setToast({ ...toast, open: false })}>
//         <Alert severity={toast.type} variant="filled">{toast.msg}</Alert>
//       </Snackbar>
//     </Box>
//   );
// }









import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { bookApi } from "../../api/bookApi";
import { orderApi } from "../../api/orderApi";
import { reviewApi } from "../../api/reviewApi";
import {
  Box, Typography, CircularProgress, Card, CardMedia,
  Divider, Button, Rating, Snackbar, Alert, Chip, LinearProgress,
  ToggleButton, ToggleButtonGroup, MenuItem, Select, Pagination, Stack, Avatar, CardContent
} from "@mui/material";
import { Tag } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";

// helper
const money = (n) => (n ?? 0).toLocaleString() + "₫";
const fmt = (s) => (s ? new Date(s).toLocaleString() : "");
const maskName = (name) => {
  if (!name) return "Người dùng";
  const t = name.trim();
  if (t.length <= 2) return t[0] + "*";
  return t[0] + "*".repeat(Math.max(1, t.length - 2)) + t.at(-1);
};

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "success", msg: "" });

  // reviews
  const [reviews, setReviews] = useState([]); // raw
  const [starFilter, setStarFilter] = useState(0); // 0 = all, 1..5
  const [hasComment, setHasComment] = useState(false);
  const [sort, setSort] = useState("newest"); // newest|highest|lowest
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const notify = (type, msg) => setToast({ open: true, type, msg });

  // fetch book + reviews
  useEffect(() => {
    (async () => {
      try {
        const [bRes, rRes] = await Promise.all([
          bookApi.getById(id),
          reviewApi.byBook(Number(id)),
        ]);
        setBook(bRes.data.data);
        setReviews(rRes.data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // average & count (ưu tiên ratingAverage/ratingCount nếu BE đã cập nhật)
  const avg = book?.ratingAverage ?? book?.star ?? 0;
  const count = book?.ratingCount ?? book?.reviewCount ?? reviews.length ?? 0;

  // distribution 1..5
  const dist = useMemo(() => {
    const d = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of reviews) d[r.stars] = (d[r.stars] || 0) + 1;
    return d;
  }, [reviews]);

  const filtered = useMemo(() => {
    let arr = [...reviews];
    if (starFilter) arr = arr.filter((r) => r.stars === starFilter);
    if (hasComment) arr = arr.filter((r) => (r.comment || "").trim().length > 0);
    if (sort === "newest") arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "highest") arr.sort((a, b) => b.stars - a.stars || new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "lowest") arr.sort((a, b) => a.stars - b.stars || new Date(b.createdAt) - new Date(a.createdAt));
    return arr;
  }, [reviews, starFilter, hasComment, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = useMemo(() => {
    const from = (page - 1) * pageSize;
    return filtered.slice(from, from + pageSize);
  }, [filtered, page]);

  const handleAddToCart = async () => {
    const uid = user?.uid;
    if (!uid) return notify("error", "Bạn cần đăng nhập để thêm vào giỏ");
    try {
      setSaving(true);
      await orderApi.addToCart(uid, { bookId: Number(id), quantity: 1 });
      notify("success", "Đã thêm vào giỏ hàng");
    } catch (e) {
      console.error(e);
      notify("error", e?.response?.data?.message || "Không thêm được vào giỏ");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );

  if (!book) return <Typography align="center">Không tìm thấy sách</Typography>;

  return (
    <Box p={5} display="flex" flexDirection="column" gap={4} sx={{ backgroundColor: "#fafafa", minHeight: "100vh" }}>
      {/* Header card */}
      <Card sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, p: 4, boxShadow: 4, borderRadius: 3, backgroundColor: "#fff" }}>
        <CardMedia component="img" image={book.image} alt={book.title}
          sx={{ width: { xs: "100%", md: 320 }, height: 450, objectFit: "cover", borderRadius: 2 }} />

        <Box flex={1} ml={{ md: 4 }} mt={{ xs: 3, md: 0 }}>
          <Typography variant="h4" fontWeight="bold" mb={1}>{book.title}</Typography>

          {/* Avg rating */}
          <Box display="flex" alignItems="center" gap={1} mb={1.5}>
            <Rating value={Number(avg) || 0} readOnly precision={0.1} />
            <Typography variant="body1" color="text.secondary">
              {Number(avg || 0).toFixed(1)} ({count} đánh giá)
            </Typography>
          </Box>

          {/* bán & tồn */}
          <Typography variant="subtitle1" color="text.secondary" mb={2}>
            Đã bán: {book.saleQuantity ?? book.sale ?? 0} • Hiện có: {book.stock ?? 0}
          </Typography>

          <Box display="flex" gap={2} mb={3}>
            <Button variant="contained" color="primary" startIcon={<ShoppingCartOutlined />} disabled={saving}
              onClick={handleAddToCart}>
              Thêm vào giỏ
            </Button>
            <Button variant="outlined" color="secondary" disabled={saving} onClick={() => notify("info", "Tính năng yêu thích đang phát triển")}>
              Yêu thích
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box>
            <Typography variant="body1" fontWeight="bold">Thể loại:</Typography>
            {book.categories?.map((c) => (
              <Tag color="geekblue" key={c.id} style={{ marginTop: 5 }}>{c.name}</Tag>
            ))}
          </Box>

          <Box>
            <Typography variant="body1" fontWeight="bold">Tác giả:</Typography>
            {book.authors?.map((a) => (
              <Tag color="purple" key={a.id} style={{ marginTop: 5 }}>{a.name}</Tag>
            ))}
          </Box>

          <Box>
            <Typography variant="body1" fontWeight="bold">Nhà xuất bản:</Typography>
            {book.publisher && <Tag color="green" style={{ marginTop: 5 }}>{book.publisher.name}</Tag>}
          </Box>
        </Box>
      </Card>

      {/* Description */}
      <Card sx={{ p: 3, borderRadius: 3, boxShadow: 2, backgroundColor: "#fff" }}>
        <Typography variant="h6" mb={2}>📖 Mô tả</Typography>
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }} dangerouslySetInnerHTML={{ __html: book.description }} />
      </Card>

      {/* Reviews section */}
      <Card sx={{ p: 3, borderRadius: 3, boxShadow: 2, backgroundColor: "#fff" }}>
        <Typography variant="h6" mb={2}>⭐ Đánh giá</Typography>

        {/* Summary like Shopee */}
        <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "280px 1fr" }} gap={3} mb={2}>
          {/* left: average box */}
          <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" sx={{ p: 2, border: "1px solid #eee", borderRadius: 2 }}>
            <Typography variant="h4" fontWeight={800}>{Number(avg || 0).toFixed(1)}</Typography>
            <Rating value={Number(avg) || 0} readOnly precision={0.1} size="large" />
            <Typography variant="body2" color="text.secondary">{count} lượt đánh giá</Typography>
          </Box>

          {/* right: distribution bars */}
          <Box sx={{ p: 1 }}>
            {[5,4,3,2,1].map((s) => {
              const c = dist[s] || 0;
              const pct = count ? Math.round((c * 100) / count) : 0;
              return (
                <Box key={s} display="grid" gridTemplateColumns="70px 1fr 60px" alignItems="center" gap={1} mb={1}>
                  <Box display="flex" alignItems="center" gap={0.5}><Typography fontWeight={700}>{s}</Typography><Typography>★</Typography></Box>
                  <LinearProgress variant="determinate" value={pct} />
                  <Typography color="text.secondary">{c}</Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Filters row */}
        <Stack direction={{ xs: "column", md: "row" }} gap={1.5} alignItems={{ xs: "stretch", md: "center" }} mb={2}>
          <ToggleButtonGroup
            color="primary"
            exclusive
            value={starFilter}
            onChange={(_, v) => { setStarFilter(v ?? 0); setPage(1); }}
            size="small"
          >
            <ToggleButton value={0}>Tất cả</ToggleButton>
            {[5,4,3,2,1].map(s => <ToggleButton key={s} value={s}>{s}★ ({dist[s]||0})</ToggleButton>)}
          </ToggleButtonGroup>

          <Chip
            variant={hasComment ? "filled" : "outlined"}
            color={hasComment ? "primary" : "default"}
            label="Có nhận xét"
            onClick={() => { setHasComment(v => !v); setPage(1); }}
          />

          <Box sx={{ flex: 1 }} />
          <Box display="flex" alignItems="center" gap={1}>
            <Typography color="text.secondary">Sắp xếp:</Typography>
            <Select
              value={sort}
              size="small"
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
            >
              <MenuItem value="newest">Mới nhất</MenuItem>
              <MenuItem value="highest">Điểm cao</MenuItem>
              <MenuItem value="lowest">Điểm thấp</MenuItem>
            </Select>
          </Box>
        </Stack>

        {/* List reviews */}
        {filtered.length === 0 ? (
          <Typography color="text.secondary">Chưa có đánh giá phù hợp bộ lọc.</Typography>
        ) : (
          <Stack gap={1.5}>
            {/* {pageData.map((rv) => (
              <Card key={rv.id} variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ pb: "12px !important" }}>
                  <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
                    <Avatar sx={{ width: 32, height: 32 }}>{(rv.buyerId || "U").slice(0,1).toUpperCase()}</Avatar>
                    <Box>
                      <Typography fontWeight={600} fontSize={14}>{maskName(rv.buyerName || rv.buyerId)}</Typography>
                      <Typography fontSize={12} color="text.secondary">{fmt(rv.createdAt)}</Typography>
                    </Box>
                  </Box>
                  <Rating value={rv.stars} readOnly size="small" />
                  {rv.comment && (
                    <Typography mt={0.5} sx={{ whiteSpace: "pre-wrap" }}>{rv.comment}</Typography>
                  )}
                </CardContent>
              </Card>
            ))} */}

              
              {pageData.map((rv) => (
                <Card key={rv.id} variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ pb: "12px !important" }}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
                      <Avatar
                        sx={{ width: 32, height: 32 }}
                        src={rv.buyerAvatar || undefined}
                      >
                        {((rv.buyerName || rv.buyerId || "U")[0] || "U").toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={600} fontSize={14}>
                          {rv.buyerName && rv.buyerName.trim().length ? rv.buyerName : "Người dùng"}
                        </Typography>
                        <Typography fontSize={12} color="text.secondary">
                          {fmt(rv.createdAt)}
                        </Typography>
                      </Box>
                    </Box>

                    <Rating value={rv.stars} readOnly size="small" />
                    {rv.comment && (
                      <Typography mt={0.5} sx={{ whiteSpace: "pre-wrap" }}>
                        {rv.comment}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}


          </Stack>
        )}

        {/* Pagination */}
        {filtered.length > pageSize && (
          <Box mt={2} display="flex" justifyContent="center">
            <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} />
          </Box>
        )}
      </Card>

      <Snackbar open={toast.open} autoHideDuration={2000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.type} variant="filled">{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
