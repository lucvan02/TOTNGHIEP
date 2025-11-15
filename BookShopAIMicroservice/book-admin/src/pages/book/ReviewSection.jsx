import { useEffect, useMemo, useState } from "react";
import {
  Box, Typography, Card, CardContent, Rating, LinearProgress, Chip,
  ToggleButtonGroup, ToggleButton, Select, MenuItem, Stack, Pagination, Avatar
} from "@mui/material";
import { reviewApi } from "../../api/reviewApi";

const fmt = (s) => (s ? new Date(s).toLocaleString() : "");

export default function ReviewSection({ bookId, initialAvg = 0, initialCount = 0 }) {
  const [reviews, setReviews] = useState([]);
  const [avg, setAvg] = useState(initialAvg);
  const [count, setCount] = useState(initialCount);

  const [starFilter, setStarFilter] = useState(0);
  const [hasComment, setHasComment] = useState(false);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    (async () => {
      try {
        const rRes = await reviewApi.byBook(bookId);
        const data = rRes.data.data || [];
        setReviews(data);
        // nếu BE chưa ghi ratingAverage/Count vào book thì dùng số liệu thực tế từ review
        if (!initialCount || !initialAvg) {
          const cnt = data.length;
          const a = cnt ? data.reduce((s, r) => s + (r.stars || 0), 0) / cnt : 0;
          setAvg(a);
          setCount(cnt);
        }
      } catch (e) {
        // ignore
      }
    })();
    // eslint-disable-next-line
  }, [bookId]);

  const dist = useMemo(() => {
    const d = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => (d[r.stars] = (d[r.stars] || 0) + 1));
    return d;
  }, [reviews]);

  const filtered = useMemo(() => {
    let arr = [...reviews];
    if (starFilter) arr = arr.filter((r) => r.stars === starFilter);
    if (hasComment) arr = arr.filter((r) => (r.comment || "").trim().length > 0);
    if (sort === "newest") arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "highest") arr.sort((a, b) => b.stars - a.stars || new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "lowest") arr.sort((a, b) => a.stars - b.stars || new Date(a.createdAt) - new Date(b.createdAt));
    return arr;
  }, [reviews, starFilter, hasComment, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = useMemo(() => {
    const from = (page - 1) * pageSize;
    return filtered.slice(from, from + pageSize);
  }, [filtered, page]);

  return (
    <Card sx={{ p: 3, borderRadius: 3, boxShadow: 2, backgroundColor: "#fff" }}>
      <Typography variant="h6" mb={2}>⭐ Đánh giá</Typography>

      {/* summary + distribution */}
      <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "280px 1fr" }} gap={3} mb={2}>
        <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" sx={{ p: 2, border: "1px solid #eee", borderRadius: 2 }}>
          <Typography variant="h4" fontWeight={800}>{Number(avg || 0).toFixed(1)}</Typography>
          <Rating value={Number(avg) || 0} readOnly precision={0.1} size="large" />
          <Typography variant="body2" color="text.secondary">{count} lượt đánh giá</Typography>
        </Box>

        <Box sx={{ p: 1 }}>
          {[5, 4, 3, 2, 1].map((s) => {
            const c = dist[s] || 0;
            const pct = count ? Math.round((c * 100) / count) : 0;
            return (
              <Box key={s} display="grid" gridTemplateColumns="70px 1fr 60px" alignItems="center" gap={1} mb={1}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Typography fontWeight={700}>{s}</Typography>
                  <Typography>★</Typography>
                </Box>
                <LinearProgress variant="determinate" value={pct} />
                <Typography color="text.secondary">{c}</Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* filters */}
      <Stack direction={{ xs: "column", md: "row" }} gap={1.5} alignItems={{ xs: "stretch", md: "center" }} mb={2}>
        <ToggleButtonGroup
          color="primary" exclusive value={starFilter}
          onChange={(_, v) => { setStarFilter(v ?? 0); setPage(1); }} size="small"
        >
          <ToggleButton value={0}>Tất cả</ToggleButton>
          {[5,4,3,2,1].map((s) => <ToggleButton key={s} value={s}>{s}★ ({dist[s] || 0})</ToggleButton>)}
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
          <Select value={sort} size="small" onChange={(e) => { setSort(e.target.value); setPage(1); }}>
            <MenuItem value="newest">Mới nhất</MenuItem>
            <MenuItem value="highest">Điểm cao</MenuItem>
            <MenuItem value="lowest">Điểm thấp</MenuItem>
          </Select>
        </Box>
      </Stack>

      {/* list */}
      {filtered.length === 0 ? (
        <Typography color="text.secondary">Chưa có đánh giá phù hợp bộ lọc.</Typography>
      ) : (
        <Stack gap={1.5}>
          {pageData.map((rv) => (
            <Card key={rv.id} variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ pb: "12px !important" }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
                  <Avatar sx={{ width: 32, height: 32 }} src={rv.buyerAvatar || undefined}>
                    {((rv.buyerName || rv.buyerId || "U")[0] || "U").toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography fontWeight={600} fontSize={14}>
                      {rv.buyerName && rv.buyerName.trim().length ? rv.buyerName : "Người dùng"}
                    </Typography>
                    <Typography fontSize={12} color="text.secondary">{fmt(rv.createdAt)}</Typography>
                  </Box>
                </Box>
                <Rating value={rv.stars} readOnly size="small" />
                {rv.comment && (
                  <Typography mt={0.5} sx={{ whiteSpace: "pre-wrap" }}>
                    {rv.comment}
                  </Typography>
                )}
                {rv.adminReply && (
                  <Box mt={1.2} sx={{ background: "#f7f9fc", border: "1px solid #e6f0ff", p: 1.2, borderRadius: 1 }}>
                    <Typography fontWeight={700} fontSize={14} color="primary.main">
                      Phản hồi từ Shop{rv.adminReplier ? ` – ${rv.adminReplier}` : ""}
                    </Typography>
                    <Typography whiteSpace="pre-wrap">{rv.adminReply}</Typography>
                    <Typography fontSize={12} color="text.secondary" mt={0.5}>
                      {rv.adminRepliedAt ? new Date(rv.adminRepliedAt).toLocaleString() : ""}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* pagination */}
      {filtered.length > pageSize && (
        <Box mt={2} display="flex" justifyContent="center">
          <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} />
        </Box>
      )}
    </Card>
  );
}
