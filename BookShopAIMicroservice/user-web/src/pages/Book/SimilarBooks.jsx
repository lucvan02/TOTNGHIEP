import { useEffect, useState } from "react";
import { Box, Card, CircularProgress, Grid, Typography } from "@mui/material";
import { recoApi } from "../../api/recoApi";
import { bookApi } from "../../api/bookApi";
import BookCard from "../../components/BookCard";

/**
 * Hiển thị sách tương tự theo nội dung.
 * - Lọc theo minScore (mặc định 0.5)
 * - Lấy tối đa `limit` sách sau khi lọc & sort theo score giảm dần
 */
export default function SimilarBooks({ bookId, minScore = 0.5, limit = 8 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!bookId) return;
      setLoading(true);
      try {
        const res = await recoApi.similar(Number(bookId), Math.max(limit * 2, 12));
        // API trả { base, similar: [{book_id, title, score, breakdown}] }
        const raw = res?.data?.similar || [];

        // 1) lọc score >= minScore, 2) sort giảm dần, 3) cắt còn `limit`
        const filtered = raw
          .filter(x => (x?.score ?? 0) >= minScore)
          .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
          .slice(0, limit);

        // Lấy chi tiết sách theo id
        const ids = filtered.map(x => x.book_id);
        const list = await Promise.allSettled(ids.map(id => bookApi.getById(id)));
        const details = list
          .filter(p => p.status === "fulfilled" && p.value?.data?.data)
          .map(p => p.value.data.data);

        // Giữ thứ tự theo điểm
        const scoreMap = new Map(filtered.map(x => [x.book_id, x.score]));
        details.sort((a, b) => (scoreMap.get(b.id) ?? 0) - (scoreMap.get(a.id) ?? 0));

        if (mounted) setItems(details);
      } catch (e) {
        console.error("Lỗi similar:", e);
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => { mounted = false; };
  }, [bookId, minScore, limit]);

  return (
    <Card sx={{ p: 3, borderRadius: 3, boxShadow: 2, backgroundColor: "#fff" }}>
      <Typography variant="h6" mb={2}>📚 Có thể bạn cũng thích</Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress />
        </Box>
      ) : items.length > 0 ? (
        <Grid container spacing={2}>
          {items.map(b => (
            <Grid key={b.id} item xs={12} sm={6} md={4} lg={3}>
              <BookCard book={b} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography color="text.secondary">
          Chưa có dữ liệu tương tự (≥ {minScore}).
        </Typography>
      )}
    </Card>
  );
}
