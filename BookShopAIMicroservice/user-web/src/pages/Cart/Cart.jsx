import { useEffect, useMemo, useState } from "react";
import { orderApi } from "../../api/orderApi";
import {
  Box, Typography, Card, CardContent, Button, Divider,
  TextField, Snackbar, Alert, IconButton, Radio, RadioGroup,
  FormControlLabel, FormLabel
} from "@mui/material";
import { Add, Remove, DeleteOutline } from "@mui/icons-material";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false); // disable khi đang gọi API
  const [toast, setToast] = useState({ open: false, type: "success", msg: "" });

  const user = JSON.parse(localStorage.getItem("user"));
  const uid = user?.uid;

  const [form, setForm] = useState({
    receiveName: `${user?.firstname || ""} ${user?.lastname || ""}`.trim(),
    receivePhone: user?.phone || "0900000000",
    receiveAddress: user?.address || "12 Nguyễn Huệ, Q1, HCM",
    shippingFee: 15000,
    note: "Giao giờ hành chính",
    paymentMethod: "COD", // 👈 có thể đổi sang ONLINE
  });

  const notify = (type, msg) => setToast({ open: true, type, msg });

  const load = async () => {
    try {
      const res = await orderApi.getCart(uid);
      setCart(res.data.data || null); // ApiResponse<Order>
    } catch (e) {
      console.error(e);
      notify("error", "Không tải được giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const itemsTotal = useMemo(() => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, it) => sum + (it.total || 0), 0);
  }, [cart]);

  const updateQuantity = async (it, nextQty) => {
    if (nextQty < 1) nextQty = 1;
    const snapshot = structuredClone(cart);
    // optimistic UI
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((x) =>
        x.id === it.id ? { ...x, quantity: nextQty, total: (x.price || 0) * nextQty } : x
      ),
    }));
    try {
      setBusy(true);
      await orderApi.updateQty(uid, { bookId: it.bookId, quantity: nextQty });
      const res = await orderApi.getCart(uid);
      setCart(res.data.data || null);
    } catch (e) {
      console.error(e);
      setCart(snapshot);
      notify("error", e?.response?.data?.message || "Cập nhật số lượng thất bại");
    } finally {
      setBusy(false);
    }
  };

  // ✅ xóa 1 product khỏi giỏ
  const removeLine = async (it) => {
    const snapshot = structuredClone(cart);
    setCart((prev) => ({ ...prev, items: prev.items.filter((x) => x.id !== it.id) }));
    try {
      setBusy(true);
      await orderApi.removeItem(uid, it.bookId);
      const res = await orderApi.getCart(uid);
      setCart(res.data.data || null);
      notify("success", "Đã xóa sản phẩm khỏi giỏ");
    } catch (e) {
      console.error(e);
      setCart(snapshot);
      notify("error", e?.response?.data?.message || "Xóa thất bại");
    } finally {
      setBusy(false);
    }
  };

  const handleCheckout = async () => {
    try {
      setBusy(true);
      const res = await orderApi.checkout(uid, form);
      const order = res.data.data; // ApiResponse<Order>
      notify("success", `Đặt hàng thành công • Mã đơn (UUID): ${order.id}`);
      setCart(order); // sau checkout status = PENDING
      load (); // load lại giỏ (sẽ trống)
    } catch (e) {
      console.error(e);
      notify("error", e?.response?.data?.message || "Checkout thất bại");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Typography p={4}>Đang tải giỏ hàng...</Typography>;
  if (!cart || !cart.items?.length)
    return (
      <Typography p={4} textAlign="center" fontSize={18} mt={5}>
        🛒 Giỏ hàng của bạn đang trống
      </Typography>
    );

  return (
    <Box p={4} display="grid" gridTemplateColumns={{ xs: "1fr", md: "1.5fr 1fr" }} gap={3}>
      {/* Left: Items */}
      <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>🧾 Sản phẩm trong giỏ</Typography>

          {cart.items.map((it) => (
            <Box key={it.id}
              display="grid"
              gridTemplateColumns="90px 1fr 130px 40px"
              alignItems="center" gap={2} mb={2}
              sx={{ p: 1.5, border: "1px solid #eee", borderRadius: 2, "&:hover": { boxShadow: 2 }, transition: "0.2s" }}>
              <img src={it.bookImage} alt={it.bookTitle}
                   style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />
              <Box>
                <Typography fontWeight={600} fontSize={16}>{it.bookTitle}</Typography>
                <Typography color="text.secondary" fontSize={14}>
                  {(it.price || 0).toLocaleString()}₫ / cuốn
                </Typography>
                <Box display="flex" alignItems="center" mt={1}>
                  <IconButton disabled={busy} size="small" onClick={() => updateQuantity(it, it.quantity - 1)}>
                    <Remove fontSize="small" />
                  </IconButton>
                  <TextField
                    disabled={busy}
                    value={it.quantity}
                    onChange={(e) => updateQuantity(it, Number(e.target.value) || 1)}
                    type="number"
                    inputProps={{ min: 1, style: { textAlign: "center" } }}
                    size="small"
                    sx={{ width: 60 }}
                  />
                  <IconButton disabled={busy} size="small" onClick={() => updateQuantity(it, it.quantity + 1)}>
                    <Add fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              <Typography textAlign="right" fontWeight={600}>
                {(it.total || 0).toLocaleString()}₫
              </Typography>

              {/* ✅ nút Xóa */}
              <IconButton disabled={busy} color="error" onClick={() => removeLine(it)}>
                <DeleteOutline />
              </IconButton>
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Right: Shipping + Payment + Place order */}
      <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>📦 Thông tin nhận hàng</Typography>
          <Box display="grid" gap={1.5}>
            <TextField label="Họ tên" size="small"
              value={form.receiveName} onChange={(e) => setForm({ ...form, receiveName: e.target.value })} />
            <TextField label="Số điện thoại" size="small"
              value={form.receivePhone} onChange={(e) => setForm({ ...form, receivePhone: e.target.value })} />
            <TextField label="Địa chỉ" size="small"
              value={form.receiveAddress} onChange={(e) => setForm({ ...form, receiveAddress: e.target.value })} />
            <TextField label="Phí vận chuyển" type="number" size="small"
              value={form.shippingFee} onChange={(e) => setForm({ ...form, shippingFee: Number(e.target.value) })} />
            <TextField label="Ghi chú" size="small"
              value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* ✅ Chọn phương thức thanh toán */}
          <Box mb={1.5}>
            <FormLabel component="legend">Phương thức thanh toán</FormLabel>
            <RadioGroup
              row
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            >
              <FormControlLabel value="COD" control={<Radio />} label="COD (thanh toán khi nhận)" />
              <FormControlLabel value="ONLINE" control={<Radio />} label="Online" />
            </RadioGroup>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* Totals */}
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Tạm tính</Typography>
            <Typography>{itemsTotal.toLocaleString()}₫</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Phí ship</Typography>
            <Typography>{(form.shippingFee || 0).toLocaleString()}₫</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box display="flex" justifyContent="space-between" fontWeight={700} fontSize={17}>
            <Typography>Tổng cộng</Typography>
            <Typography color="primary">
              {(itemsTotal + (form.shippingFee || 0)).toLocaleString()}₫
            </Typography>
          </Box>

          <Button
            fullWidth sx={{ mt: 2, py: 1.2, fontWeight: 600 }}
            variant="contained" color="primary"
            disabled={busy}
            onClick={handleCheckout}
          >
            Xác nhận đặt hàng ({form.paymentMethod})
          </Button>
        </CardContent>
      </Card>

      <Snackbar open={toast.open} autoHideDuration={2200}
        onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.type} variant="filled">{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
