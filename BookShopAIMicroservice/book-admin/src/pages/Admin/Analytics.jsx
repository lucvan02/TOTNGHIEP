
import { useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";
import {
  Box, Card, CardContent, Typography, Grid, TextField, Button, CircularProgress, Divider
} from "@mui/material";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

const money = (n) => (n ?? 0).toLocaleString() + "₫";
const COLORS = ["#0284c7", "#22c55e", "#ef4444", "#f59e0b", "#8b5cf6", "#14b8a6", "#f43f5e"];

export default function Analytics() {
  const today = new Date();
  const dateTo = today.toISOString().slice(0, 10);
  const dateFrom = new Date(today.getTime() - 6 * 86400000).toISOString().slice(0, 10);

  const [from, setFrom] = useState(dateFrom);
  const [to, setTo] = useState(dateTo);
  const [loading, setLoading] = useState(false);
  const [sum, setSum] = useState(null);
  const [daily, setDaily] = useState([]);
  const [topBooks, setTopBooks] = useState([]);


  const STATUS_COLORS = {
  PENDING: "gold",
  CONFIRM: "geekblue",
  SHIPPED: "processing",
  COMPLETED: "green",
  CANCELLED: "red",
};

  const load = async () => {
    try {
      setLoading(true);
      const [s, d, t] = await Promise.all([
        adminApi.analyticsSummary(from, to),
        adminApi.analyticsDaily(from, to),
        adminApi.analyticsTopBooks(from, to, 8),
      ]);
      setSum(s.data.data);
      setDaily(d.data.data);
      setTopBooks(t.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load();}, []);

  return (
    <Box sx={{ maxWidth: "1600px", mx: "auto", width: "100%", p: { xs: 2, md: 4 } }}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        📊 Thống kê đơn hàng & doanh thu
      </Typography>

      {/* Filter */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
            <TextField
              label="Từ ngày"
              type="date"
              size="small"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Đến ngày"
              type="date"
              size="small"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Button variant="contained" onClick={load}>XEM THỐNG KÊ</Button>
            {loading && <CircularProgress size={22} />}
          </Box>
        </CardContent>
      </Card>

      {/* Summary cards */}
      {sum && (
        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card><CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography color="text.secondary">Doanh thu</Typography>
              <Typography variant="h5" fontWeight={700}>{money(sum.revenue)}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card><CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography color="text.secondary">Tổng đơn</Typography>
              {/* tổng đơn là không có trạng thái giỏ hàng */}
              <Typography variant="h5" fontWeight={700}>{sum.ordersCount - (sum.byStatus.CART || 0)}</Typography>

              {/* <Typography variant="h5" fontWeight={700}>{sum.ordersCount}</Typography> */}
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card><CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography color="text.secondary">Hoàn tất</Typography>
              <Typography variant="h5" fontWeight={700}>{sum.completedCount}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card><CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography color="text.secondary">Đang chờ</Typography>
              <Typography variant="h5" fontWeight={700}>{sum.pendingCount}</Typography>
            </CardContent></Card>
          </Grid>
        </Grid>
      )}


      
        <Grid item xs={12} md={8}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography fontWeight={700} mb={1}>Doanh thu theo ngày</Typography>
              <ResponsiveContainer width="100%" height={360}>
                <LineChart data={daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(v, n) => (n === "revenue" ? money(v) : v)} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#0284c7" dot={false} />
                  <Line type="monotone" dataKey="orders" name="Số đơn" stroke="#22c55e" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

      
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography fontWeight={700} mb={1}>Cơ cấu trạng thái</Typography>
              <Divider sx={{ mb: 1 }} />
              {sum && (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      // data={Object.entries(sum.byStatus).map(([name, value]) => ({ name, value }))}

                      data={Object.entries(sum.byStatus)
                      .filter(([name]) => name !== "CART")
                      .map(([name, value]) => ({ name, value }))}


                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={100}
                      label
                    >
                      {/* {Object.entries(sum.byStatus).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))} */}

                      {Object.entries(sum.byStatus)
                        .filter(([name]) => name !== "CART")
                        .map(([name], i) => (
                          <Cell key={i} fill={STATUS_COLORS[name] || COLORS[i % COLORS.length]} />
                      ))}

                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>


      {/* Top books full width */}
      <Card sx={{ mt: 2 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Typography fontWeight={700} mb={1}>Top sách bán chạy</Typography>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={topBooks}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip formatter={(v, n) => (n === "revenue" ? money(v) : v)} />
              <Legend />
              <Bar dataKey="quantity" name="Số lượng" fill="#22c55e" />
              <Bar dataKey="revenue" name="Doanh thu" fill="#0284c7" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  );
}


