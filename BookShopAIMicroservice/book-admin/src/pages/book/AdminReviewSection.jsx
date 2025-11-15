import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Rating,
  LinearProgress,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
  Stack,
  Pagination
} from "@mui/material";
import { reviewApi } from "../../api/reviewApi";

const fmt = (s) => (s ? new Date(s).toLocaleString() : "");

export default function AdminReviewSection({ bookId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [starFilter, setStarFilter] = useState(0);
  const [hasComment, setHasComment] = useState(false);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const pageSize = 6;

  useEffect(() => {
    (async () => {
      try {
        const rRes = await reviewApi.byBook(bookId);
        setReviews(rRes.data.data || []);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, [bookId]);

  // Phân bố sao
  const dist = useMemo(() => {
    const d = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => (d[r.stars] = (d[r.stars] || 0) + 1));
    return d;
  }, [reviews]);

  // BỘ LỌC + SORT
  const filtered = useMemo(() => {
    let arr = [...reviews];
    if (starFilter) arr = arr.filter((r) => r.stars === starFilter);
    if (hasComment) arr = arr.filter((r) => (r.comment || "").trim().length > 0);

    if (sort === "newest")
      arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "highest")
      arr.sort((a, b) => b.stars - a.stars || new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "lowest")
      arr.sort((a, b) => a.stars - b.stars || new Date(a.createdAt) - new Date(b.createdAt));

    return arr;
  }, [reviews, starFilter, hasComment, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const pageData = useMemo(() => {
    const from = (page - 1) * pageSize;
    return filtered.slice(from, from + pageSize);
  }, [filtered, page]);

  const avg = useMemo(() => {
    if (!filtered.length) return 0;
    return (
      filtered.reduce((s, r) => s + (r.stars || 0), 0) / filtered.length
    );
  }, [filtered]);

  return (
    <Card sx={{ p: 3, borderRadius: 3, boxShadow: 2, backgroundColor: "#fff" }}>
      <Typography variant="h6" mb={2}>
        ⭐ Đánh giá sản phẩm
      </Typography>

      {loading ? (
        <Typography>Đang tải...</Typography>
      ) : (
        <>
          {/* Tổng quan */}
          <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "260px 1fr" }} gap={3} mb={3}>
            <Box
              sx={{
                p: 2,
                border: "1px solid #eee",
                borderRadius: 2,
                textAlign: "center",
              }}
            >
              <Typography variant="h4" fontWeight={800}>
                {avg.toFixed(1)}
              </Typography>
              <Rating value={avg} readOnly precision={0.1} />
              <Typography color="text.secondary">
                {filtered.length} lượt đánh giá phù hợp bộ lọc
              </Typography>
            </Box>

            {/* Distribution */}
            <Box>
              {[5, 4, 3, 2, 1].map((s) => {
                const c = filtered.filter((r) => r.stars === s).length;
                const pct = filtered.length ? Math.round((c * 100) / filtered.length) : 0;
                return (
                  <Box
                    key={s}
                    display="grid"
                    gridTemplateColumns="60px 1fr 60px"
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

          {/* BỘ LỌC */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            gap={1.5}
            mb={2}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <ToggleButtonGroup
              color="primary"
              exclusive
              value={starFilter}
              onChange={(_, v) => {
                setStarFilter(v ?? 0);
                setPage(1);
              }}
              size="small"
            >
              <ToggleButton value={0}>Tất cả</ToggleButton>
              {[5, 4, 3, 2, 1].map((s) => (
                <ToggleButton key={s} value={s}>
                  {s}★ ({dist[s]})
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <Chip
              label="Có nhận xét"
              variant={hasComment ? "filled" : "outlined"}
              color={hasComment ? "primary" : "default"}
              onClick={() => {
                setHasComment((v) => !v);
                setPage(1);
              }}
            />

            <Box sx={{ flex: 1 }} />

            <Box display="flex" alignItems="center" gap={1}>
              <Typography color="text.secondary">Sắp xếp:</Typography>
              <Select
                size="small"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="newest">Mới nhất</MenuItem>
                <MenuItem value="highest">Điểm cao</MenuItem>
                <MenuItem value="lowest">Điểm thấp</MenuItem>
              </Select>
            </Box>
          </Stack>

          {/* LIST */}
          <Stack gap={1.5}>
            {pageData.map((rv) => (
              <Card variant="outlined" key={rv.id} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar src={rv.buyerAvatar}>
                      {(rv.buyerName || "U")[0]}
                    </Avatar>
                    <Box>
                      <Typography fontWeight={600}>{rv.buyerName}</Typography>
                      <Typography fontSize={12} color="text.secondary">
                        {fmt(rv.createdAt)}
                      </Typography>
                    </Box>
                  </Box>

                  <Rating value={rv.stars} readOnly size="small" sx={{ mt: 1 }} />

                  {rv.comment && (
                    <Typography sx={{ mt: 1, whiteSpace: "pre-wrap" }}>
                      {rv.comment}
                    </Typography>
                  )}

                  {rv.adminReply && (
                    <Box
                      sx={{
                        mt: 1.2,
                        p: 1.2,
                        border: "1px solid #e6f0ff",
                        background: "#f7f9fc",
                        borderRadius: 1,
                      }}
                    >
                      <Typography fontWeight={700} color="primary.main">
                        Shop phản hồi
                      </Typography>
                      <Typography whiteSpace="pre-wrap">
                        {rv.adminReply}
                      </Typography>
                      <Typography fontSize={11} mt={0.5} color="text.secondary">
                        {fmt(rv.adminRepliedAt)}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Stack>

          {/* Pagination */}
          {filtered.length > pageSize && (
            <Box mt={2} display="flex" justifyContent="center">
              <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} />
            </Box>
          )}
        </>
      )}
    </Card>
  );
}
