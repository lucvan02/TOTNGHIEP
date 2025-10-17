import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderApi } from "../../api/orderApi";
import { reviewApi } from "../../api/reviewApi";
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Snackbar,
  Alert,
  Stack,
} from "@mui/material";
import { Modal as AntdModal, Radio, Space, message } from "antd";

const money = (n) => (n ?? 0).toLocaleString() + "₫";
const fmt = (s) => (s ? new Date(s).toLocaleString() : "");
const color = (st) =>
  ({ PENDING: "warning", CONFIRM: "info", SHIPPED: "primary", COMPLETED: "success", CANCELLED: "error" }[st] ||
    "default");

export default function OrderDetail() {
  const { id } = useParams(); // orderId
  const nav = useNavigate();
  const uid = useMemo(() => JSON.parse(localStorage.getItem("user") || "null")?.uid, []);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // snackbar
  const [toast, setToast] = useState({ open: false, type: "success", msg: "" });
  const notify = (type, msg) => setToast({ open: true, type, msg });

  // Cancel modal
  const [cancelDlg, setCancelDlg] = useState({
    open: false,
    reasonType: "OTHER",
    other: "Không muốn tiết lộ",
  });

  // Review dialog
  const [rvOpen, setRvOpen] = useState(false);
  const [rvForm, setRvForm] = useState({ orderItemId: null, stars: 5, comment: "" });

  const load = async () => {
    try {
      const res = await orderApi.getOrderDetail(id); // ApiResponse<Order>
      setOrder(res.data.data);
    } catch (e) {
      console.error(e);
      notify("error", "Không tải được chi tiết đơn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const canCancel = order?.status === "PENDING";

  const openCancel = () => setCancelDlg({ open: true, reasonType: "OTHER", other: "Không muốn tiết lộ" });
  const closeCancel = () => setCancelDlg({ open: false, reasonType: "OTHER", other: "Không muốn tiết lộ" });

  const doCancel = async () => {
    const map = {
      OUT_OF_STOCK: "Không muốn mua nữa",
      INVALID_INFO: "Sửa đổi thông tin",
      OTHER: cancelDlg.other?.trim() || "Không muốn tiết lộ",
    };
    const reason = cancelDlg.reasonType === "OTHER" ? map.OTHER : map[cancelDlg.reasonType];

    try {
      const res = await orderApi.cancelOrder(uid, order.id, reason);
      const updated = res.data.data;
      setOrder((prev) => ({ ...prev, status: updated.status, cancelReason: updated.cancelReason }));
      notify("success", "Đã hủy đơn");
      closeCancel();
    } catch (e) {
      console.error(e);
      message.error(e?.response?.data?.message || "Hủy đơn thất bại");
    }
  };

  // Review handlers
  const openReview = (orderItem) => {
    setRvForm({ orderItemId: orderItem.id, stars: 5, comment: "" });
    setRvOpen(true);
  };
  const closeReview = () => setRvOpen(false);

  const submitReview = async () => {
    try {
      await reviewApi.create(uid, rvForm);
      // cập nhật item tại chỗ
      setOrder((prev) => ({
        ...prev,
        items: prev.items.map((it) => (it.id === rvForm.orderItemId ? { ...it, hasReview: true } : it)),
      }));
      setRvOpen(false);
      notify("success", "Đã gửi đánh giá");
    } catch (e) {
      console.error(e);
      notify("error", e?.response?.data?.message || "Gửi đánh giá thất bại");
    }
  };

  if (loading)
    return (
      <Box p={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );

  if (!order)
    return (
      <Box p={4}>
        <Typography>Không tìm thấy đơn.</Typography>
        <Button sx={{ mt: 2 }} variant="outlined" onClick={() => nav("/orders")}>
          Về lịch sử đơn hàng
        </Button>
      </Box>
    );

  return (
    <Box p={4} display="grid" gap={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
        <Typography variant="h5" fontWeight={700}>
          Đơn hàng • <span style={{ fontFamily: "monospace" }}>{order.id}</span>
        </Typography>

        <Box display="flex" gap={1} alignItems="center">
          {/* trạng thái đơn hàng thay thành tiếng Việt, có các trạng thái: PENDING, CONFIRM, SHIPPED, COMPLETED, CANCELED */}

          <Chip label={order.status === "PENDING" ? "CHỜ XÁC NHẬN" : order.status === "CONFIRM" ? "ĐÃ XÁC NHẬN" : order.status === "SHIPPED" ? "ĐANG GIAO" : order.status === "COMPLETED" ? "ĐÃ HOÀN TẤT" : "ĐÃ HỦY"} color={color(order.status)} />
          <Chip label={order.paymentStatus ? "ĐÃ THANH TOÁN" : "CHƯA THANH TOÁN"} />
          <Chip label={`PM: ${order.paymentMethod || "-"}`} variant="outlined" />
          <Chip label={`Tổng: ${money(order.total)}`} color="primary" variant="outlined" />
          {canCancel && (
            <Button color="error" variant="outlined" onClick={openCancel}>
              Hủy đơn
            </Button>
          )}
          <Button variant="text" onClick={() => nav("/orders")}>
            ← Quay lại lịch sử
          </Button>
        </Box>
      </Stack>

      <Card>
        <CardContent>
          <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
            <Chip label={`Tạo lúc: ${fmt(order.createdAt)}`} />
            <Chip label={`Cập nhật: ${fmt(order.updatedAt)}`} />
            {/* {order.confirmedAt && <Chip label={`Xác nhận: ${fmt(order.confirmedAt)}`} />}
            {order.shippedAt && <Chip label={`Giao hàng: ${fmt(order.shippedAt)}`} />}
            {order.completedAt && <Chip label={`Hoàn tất: ${fmt(order.completedAt)}`} />}
            {order.cancelledAt && <Chip label={`Hủy lúc: ${fmt(order.cancelledAt)}`} />} */}
            {order.shippingFee != null && <Chip label={`Ship: ${money(order.shippingFee)}`} />}
            {order.cancelReason && <Chip color="error" label={`Lý do hủy: ${order.cancelReason}`} />}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" fontWeight={700}>
            Thông tin nhận
          </Typography>
          <Typography>
            {order.receiveName} • {order.receivePhone}
          </Typography>
          <Typography>{order.receiveAddress}</Typography>
          {order.note && <Typography color="text.secondary">Ghi chú: {order.note}</Typography>}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} mb={1}>
            Sản phẩm
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Ảnh</TableCell>
                <TableCell>Tên sách</TableCell>
                <TableCell align="right">Giá</TableCell>
                <TableCell align="right">SL</TableCell>
                <TableCell align="right">Thành tiền</TableCell>
                <TableCell align="center">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items?.map((it) => (
                <TableRow key={it.id}>
                  <TableCell>
                    <img
                      src={it.bookImage}
                      alt={it.bookTitle}
                      style={{ width: 46, height: 46, objectFit: "cover", borderRadius: 6 }}
                    />
                  </TableCell>
                  <TableCell>{it.bookTitle}</TableCell>
                  <TableCell align="right">{money(it.price)}</TableCell>
                  <TableCell align="right">{it.quantity}</TableCell>
                  <TableCell align="right">{money(it.total)}</TableCell>
                  <TableCell align="center">
                    {/* chỉ cho đánh giá nếu đơn đã hoàn thành */}
                    {order.status === "COMPLETED" ? (
                      it.hasReview ? (
                        <Typography color="success.main" fontSize={13}>
                          Đã đánh giá
                        </Typography>
                      ) : (
                        <Button size="small" variant="outlined" onClick={() => openReview(it)}>
                          Đánh giá
                        </Button>
                      )
                    ) : (
                      ""
                    )}

                    {/* neu trang thai don la pending thi hien thi nut huy don */}
                    {/* {order.status === "PENDING" && (
                      <Button size="small" variant="outlined" color="error" onClick={openCancel}>
                        Hủy đơn
                      </Button>
                    )} */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog đánh giá */}
      <Dialog open={rvOpen} onClose={closeReview} maxWidth="sm" fullWidth>
        <DialogTitle>Đánh giá sản phẩm</DialogTitle>
        <DialogContent dividers>
          <Box display="grid" gap={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography>Chấm sao:</Typography>
              <Rating
                value={rvForm.stars}
                onChange={(_, v) => setRvForm((f) => ({ ...f, stars: v || 5 }))}
              />
            </Box>
            <TextField
              label="Nhận xét"
              multiline
              minRows={3}
              value={rvForm.comment}
              onChange={(e) => setRvForm((f) => ({ ...f, comment: e.target.value }))}
            />
            <Typography variant="body2" color="text.secondary">
              Bạn chỉ có thể đánh giá mỗi sản phẩm trong đơn một lần.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeReview}>Hủy</Button>
          <Button variant="contained" onClick={submitReview}>
            Gửi đánh giá
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal hủy đơn */}
      <AntdModal
        title="Hủy đơn hàng"
        open={cancelDlg.open}
        okText="Hủy đơn"
        okButtonProps={{ danger: true }}
        onOk={doCancel}
        onCancel={closeCancel}
      >
        <Radio.Group
          value={cancelDlg.reasonType}
          onChange={(e) => setCancelDlg((s) => ({ ...s, reasonType: e.target.value }))}
        >
          <Space direction="vertical">
            <Radio value="OUT_OF_STOCK">Không muốn mua nữa</Radio>
            <Radio value="INVALID_INFO">Sửa đổi thông tin</Radio>
            <Radio value="OTHER">Lý do khác</Radio>
          </Space>
        </Radio.Group>

        {cancelDlg.reasonType === "OTHER" && (
          <TextField
            fullWidth
            label="Lý do"
            margin="dense"
            value={cancelDlg.other}
            onChange={(e) => setCancelDlg((s) => ({ ...s, other: e.target.value }))}
          />
        )}

        <Typography mt={1} variant="body2" color="text.secondary">
          Sau khi xác nhận, đơn sẽ chuyển sang trạng thái hủy
        </Typography>
      </AntdModal>

      <Snackbar
        open={toast.open}
        autoHideDuration={2200}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      >
        <Alert severity={toast.type} variant="filled">
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
