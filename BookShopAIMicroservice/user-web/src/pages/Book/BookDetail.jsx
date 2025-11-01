import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { bookApi } from "../../api/bookApi";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardMedia,
  Divider,
  Rating,
  Snackbar,
  Alert,
} from "@mui/material";
import { Tag } from "antd";
import FavoriteButton from "../../components/favorite/FavoriteButton";
import AddToCartButton from "../../components/cart/AddToCartButton";
import ReviewSection from "./ReviewSection";

import { recoApi } from "../../api/recoApi";
import { Grid, Button } from "@mui/material"; // dùng Grid cho similar
import BookCard from "../../components/BookCard"; // Card sách cho similar
import Footer from "../../components/Footer/Footer";

const money = (n) => (n ?? 0).toLocaleString() + "₫";

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, type: "success", msg: "" });

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const uid = user?.uid;

  const notify = (type, msg) => setToast({ open: true, type, msg });

  const [similar, setSimilar] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const bRes = await bookApi.getById(id);
        setBook(bRes.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

   // === SIMILAR SECTION ===
  useEffect(() => {
    if (!id) return;
    setLoadingSimilar(true);
    (async () => {
      try {
        const res = await recoApi.similar(Number(id), 4);
        // API trả { base, similar: [{book_id, title, score, breakdown}] }
        const arr = res?.data?.similar || [];
        const ids = arr.map((x) => x.book_id);
        const details = await Promise.allSettled(ids.map((bid) => bookApi.getById(bid)));
        const books = details
          .filter((p) => p.status === "fulfilled" && p.value?.data?.data)
          .map((p) => p.value.data.data);

        // Sắp xếp theo score
        const scoreMap = new Map(arr.map((x) => [x.book_id, x.score]));
        books.sort((a, b) => (scoreMap.get(b.id) ?? 0) - (scoreMap.get(a.id) ?? 0));

        setSimilar(books);
      } catch (e) {
        console.error("Lỗi similar:", e);
        setSimilar([]);
      } finally {
        setLoadingSimilar(false);
      }
    })();
  }, [id]);

  const avg = useMemo(() => Number(book?.ratingAverage ?? book?.star ?? 0), [book]);
  const count = useMemo(() => Number(book?.ratingCount ?? book?.reviewCount ?? 0), [book]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );

  if (!book)
    return <Typography align="center">Không tìm thấy sách</Typography>;

  if (book.status === 0)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <Typography align="center" color="error" sx={{ fontSize: 22 }}>
          Sách này đã bị ẩn
        </Typography>
      </Box>
    );

  return (
    <>
    <Box
      p={5}
      display="flex"
      flexDirection="column"
      gap={4}
      sx={{ backgroundColor: "#fafafa", minHeight: "100vh" }}
    >
      <Card
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          p: 4,
          boxShadow: 4,
          borderRadius: 3,
          backgroundColor: "#fff",
        }}
      >
        <CardMedia
          component="img"
          image={book.image}
          alt={book.title}
          sx={{
            width: { xs: "100%", md: 320 },
            height: 450,
            objectFit: "cover",
            borderRadius: 2,
          }}
        />

        <Box flex={1} ml={{ md: 4 }} mt={{ xs: 3, md: 0 }}>
          <Typography variant="h4" fontWeight="bold" mb={1}>
            {book.title}
          </Typography>

          <Box display="flex" alignItems="center" gap={1} mb={1.5}>
            <Rating value={avg} readOnly precision={0.1} />
            <Typography variant="body1" color="text.secondary">
              {/* {avg.toFixed(1)} ({count} đánh giá) */}
            </Typography>
          </Box>

          {book.status === 2 ? (
            <Typography variant="subtitle1" color="text.secondary" mb={2}>
              <span style={{ color: "red", fontSize: "1.2rem" }}>Đã ngừng bán</span>
            </Typography>
          ) : (
            <>
              <Typography variant="subtitle1" color="text.secondary" mb={2}>
                <span style={{ color: "red", fontSize: "1.2rem" }}>
                  {book.stock === 0 ? "Hết hàng" : money(book.price)}
                </span>
                <br />
                Đã bán: {book.saleQuantity ?? 0}{" "}
                {book.stock === 0 ? "" : `| Còn lại: ${book.stock}`}
              </Typography>

              {/* ✅ Nút giỏ hàng và yêu thích */}
              <Box display="flex" gap={2} mb={3}>
                <AddToCartButton
                  buyerId={uid}
                  bookId={Number(id)}
                  disabled={book.stock === 0 || book.status === 2}
                />
                <FavoriteButton buyerId={uid} bookId={Number(id)} onNotify={notify} />
              </Box>
            </>
          )}

          <Divider sx={{ my: 2 }} />

          <Box>
            <Typography variant="body1" fontWeight="bold">Thể loại:</Typography>
            {book.categories?.map((c) => (
              <Tag
                color="geekblue"
                key={c.id}
                style={{ marginTop: 5, cursor: "pointer" }}
                onClick={() => navigate(`/category/${c.id}`)}
              >
                {c.name}
              </Tag>
            ))}
          </Box>

          <Box>
            <Typography variant="body1" fontWeight="bold">Tác giả:</Typography>
            {book.authors?.map((a) => (
              <Tag
                color="purple"
                key={a.id}
                style={{ marginTop: 5, cursor: "pointer" }}
                onClick={() => navigate(`/author/${a.id}`)}
              >
                {a.name}
              </Tag>
            ))}
          </Box>

          <Box>
            <Typography variant="body1" fontWeight="bold">Nhà xuất bản:</Typography>
            {book.publisher && (
              <Tag
                color="green"
                style={{ marginTop: 5, cursor: "pointer" }}
                onClick={() => navigate(`/publisher/${book.publisher.id}`)}
              >
                {book.publisher.name}
              </Tag>
            )}
          </Box>
        </Box>
      </Card>

      {/* Mô tả */}
      <Card sx={{ p: 3, borderRadius: 3, boxShadow: 2, backgroundColor: "#fff" }}>
        <Typography variant="h6" mb={2}>
          📖 Mô tả
        </Typography>
        <Typography
          variant="body1"
          sx={{ whiteSpace: "pre-wrap" }}
          dangerouslySetInnerHTML={{ __html: book.description }}
        />
      </Card>

      {/* Reviews */}
      <ReviewSection bookId={Number(id)} initialAvg={avg} initialCount={count} />

       {/* === KHỐI SÁCH TƯƠNG TỰ === */}
      <Card sx={{ p: 3, borderRadius: 3, boxShadow: 2, backgroundColor: "#fff" }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">📚 Có thể bạn cũng thích</Typography>
          {/* <Button size="small" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            Lên đầu trang
          </Button> */}
        </Box>
        {loadingSimilar ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
          </Box>
        ) : similar.length > 0 ? (
          <Grid container spacing={2}>
            {similar.map((b) => (
              <Grid key={b.id} item xs={12} sm={6} md={4} lg={3}>
                <BookCard book={b} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="text.secondary">Chưa có dữ liệu tương tự cho sách này.</Typography>
        )}
      </Card>

      <Snackbar
        open={toast.open}
        autoHideDuration={2000}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert severity={toast.type} variant="filled">
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
    <Footer />
    </>
  );
}
