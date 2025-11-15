import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Rating,
  Pagination,
  Box,
  Stack,
  LinearProgress
} from "@mui/material";
import { reviewApi } from "../../api/reviewApi";

const fmt = (s) => (s ? new Date(s).toLocaleString() : "");

export default function AdminReviewList({ bookId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    (async () => {
      try {
        const res = await reviewApi.byBook(bookId);
        setReviews(res?.data?.data || []);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, [bookId]);

  const totalPages = Math.ceil(reviews.length / pageSize);
  const pageData = useMemo(() => {
    const from = (page - 1) * pageSize;
    return reviews.slice(from, from + pageSize);
  }, [reviews, page]);

  const avg = useMemo(() => {
    if (!reviews.length) return 0;
    return (
      reviews.reduce((s, r) => s + (r.stars || 0), 0) / reviews.length
    ).toFixed(1);
  }, [reviews]);

  const dist = useMemo(() => {
    const d = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => (d[r.stars] = (d[r.stars] || 0) + 1));
    return d;
  }, [reviews]);

  if (loading)
    return (
      <Card sx={{ p: 3 }}>
        <Typography>Đang tải đánh giá...</Typography>
      </Card>
    );

  return (
    <Card sx={{ p: 3, borderRadius: 3, boxShadow: 2, background: "#fff" }}>
      <Typography variant="h6" mb={2}>
        ⭐ Đánh giá của người mua
      </Typography>

      {/* SUMMARY */}
      <Box
        display="grid"
        gap={3}
        gridTemplateColumns={{ xs: "1fr", md: "250px 1fr" }}
        mb={3}
      >
        <Box
          sx={{
            border: "1px solid #eee",
            p: 2,
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="h4" fontWeight={800}>
            {avg}
          </Typography>
          <Rating value={Number(avg)} readOnly precision={0.1} />
          <Typography color="text.secondary">
            {reviews.length} lượt đánh giá
          </Typography>
        </Box>

        <Box>
          {[5, 4, 3, 2, 1].map((s) => {
            const c = dist[s] || 0;
            const pct =
              reviews.length === 0
                ? 0
                : Math.round((c / reviews.length) * 100);
            return (
              <Box
                key={s}
                display="grid"
                gridTemplateColumns="60px 1fr 50px"
                alignItems="center"
                gap={1}
                mb={1}
              >
                <Typography>{s} ★</Typography>
                <LinearProgress variant="determinate" value={pct} />
                <Typography>{c}</Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* LIST */}
      <Stack gap={1.5}>
        {pageData.map((rv) => (
          <Card key={rv.id} variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" gap={1.5} mb={1}>
                <Avatar src={rv.buyerAvatar}>
                  {(rv.buyerName || "U")[0].toUpperCase()}
                </Avatar>
                <Box>
                  <Typography fontWeight={600}>
                    {rv.buyerName || "Người dùng"}
                  </Typography>
                  <Typography fontSize={12} color="text.secondary">
                    {fmt(rv.createdAt)}
                  </Typography>
                </Box>
              </Box>

              <Rating value={rv.stars} readOnly size="small" />

              {rv.comment && (
                <Typography mt={1} sx={{ whiteSpace: "pre-wrap" }}>
                  {rv.comment}
                </Typography>
              )}

              {rv.adminReply && (
                <Box
                  mt={1.2}
                  sx={{
                    p: 1.3,
                    background: "#f7f9fc",
                    borderRadius: 1,
                    border: "1px solid #e6f0ff",
                  }}
                >
                  <Typography fontWeight={700} color="primary.main">
                    Phản hồi của Shop
                  </Typography>
                  <Typography whiteSpace="pre-wrap">{rv.adminReply}</Typography>
                  <Typography fontSize={11} color="text.secondary" mt={0.5}>
                    {rv.adminRepliedAt &&
                      new Date(rv.adminRepliedAt).toLocaleString()}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* PAGINATION */}
      {reviews.length > pageSize && (
        <Box mt={2} display="flex" justifyContent="center">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => setPage(p)}
          />
        </Box>
      )}
    </Card>
  );
}
