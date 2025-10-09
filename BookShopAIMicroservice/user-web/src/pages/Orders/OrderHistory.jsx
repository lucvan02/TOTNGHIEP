import { useEffect, useMemo, useState } from "react";
import { orderApi } from "../../api/orderApi";
import {
  Box, Card, CardContent, Typography, CircularProgress, Chip, Button,
  Table, TableHead, TableRow, TableCell, TableBody, Stack, Dialog,
  DialogTitle, DialogContent, DialogActions, Divider
} from "@mui/material";

const fmtVND = (n) => (n ?? 0).toLocaleString() + "₫";
const fmtDate = (s) => (s ? new Date(s).toLocaleString() : "");

const statusColor = (st) => {
  switch ((st || "").toUpperCase()) {
    case "PENDING":  return "warning";
    case "CONFIRM":  return "info";
    case "SHIPPED":  return "primary";
    case "COMPLETED":return "success";
    case "CANCELLED":return "error";
    default:         return "default";
  }
};
const payChip = (paid) => (
  <Chip label={paid ? "ĐÃ THANH TOÁN" : "CHƯA THANH TOÁN"} color={paid ? "success" : "default"} size="small" />
);

export default function OrderHistory() {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const uid = user?.uid;

  const load = async () => {
    try {
      const res = await orderApi.getHistory(uid);      // ApiResponse<List<Order>>
      setOrders(res.data.data || []);
    } catch (e) {
      console.error(e);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const sorted = useMemo(() => {
    if (!orders) return [];
    return [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders]);

  const openDetail = (o) => { setCurrent(o); setOpen(true); };
  const closeDetail = () => { setOpen(false); setCurrent(null); };

  if (loading) {
    return (
      <Box p={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (!sorted.length) {
    return (
      <Box p={5} textAlign="center">
        <Typography variant="h6">Bạn chưa có đơn hàng nào.</Typography>
        <Typography color="text.secondary">Hãy ghé danh mục sách và đặt thử nhé!</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h5" fontWeight={700} mb={2}>📚 Lịch sử đơn hàng</Typography>

      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ whiteSpace: "nowrap" }}>Mã đơn (UUID)</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Thanh toán</TableCell>
                <TableCell>Phương thức</TableCell>
                <TableCell align="right">Tổng tiền</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((o) => (
                <TableRow key={o.id} hover>
                  <TableCell sx={{ fontFamily: "monospace" }}>{o.id}</TableCell>
                  <TableCell>
                    <Chip label={o.status} color={statusColor(o.status)} size="small" />
                  </TableCell>
                  <TableCell>{payChip(o.paymentStatus)}</TableCell>
                  <TableCell>{o.paymentMethod || "-"}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{fmtVND(o.total)}</TableCell>
                  <TableCell>{fmtDate(o.createdAt)}</TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="outlined" onClick={() => openDetail(o)}>Xem chi tiết</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog chi tiết đơn */}
      <Dialog open={open} onClose={closeDetail} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết đơn • <span style={{ fontFamily: "monospace" }}>{current?.id}</span></DialogTitle>
        <DialogContent dividers>
          {current && (
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip label={current.status} color={statusColor(current.status)} />
                {payChip(current.paymentStatus)}
                <Chip label={`PM: ${current.paymentMethod || "-"}`} variant="outlined" />
                <Chip label={`Tổng: ${fmtVND(current.total)}`} color="primary" variant="outlined" />
              </Stack>

              <Box>
                <Typography fontWeight={700} mb={0.5}>📦 Địa chỉ nhận</Typography>
                <Typography>{current.receiveName}</Typography>
                <Typography>{current.receivePhone}</Typography>
                <Typography>{current.receiveAddress}</Typography>
                {current.note && <Typography mt={1} color="text.secondary">Ghi chú: {current.note}</Typography>}
              </Box>

              <Divider />

              <Box>
                <Typography fontWeight={700} mb={1}>🧾 Sản phẩm</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Ảnh</TableCell>
                      <TableCell>Sách</TableCell>
                      <TableCell align="right">Giá</TableCell>
                      <TableCell align="right">SL</TableCell>
                      <TableCell align="right">Thành tiền</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {current.items?.map((it) => (
                      <TableRow key={it.id}>
                        <TableCell>
                          <img src={it.bookImage} alt={it.bookTitle} style={{ width: 46, height: 46, borderRadius: 6, objectFit: "cover" }} />
                        </TableCell>
                        <TableCell>{it.bookTitle}</TableCell>
                        <TableCell align="right">{fmtVND(it.price)}</TableCell>
                        <TableCell align="right">{it.quantity}</TableCell>
                        <TableCell align="right">{fmtVND(it.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetail}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
