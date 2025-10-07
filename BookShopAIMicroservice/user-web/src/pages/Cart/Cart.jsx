// import { useEffect, useMemo, useState } from "react";
// import { orderApi } from "../../api/orderApi";
// import { getUid } from "../../api/localStorageService";
// import {
//   Box, Typography, Card, CardContent, Button, Divider, TextField, Snackbar, Alert
// } from "@mui/material";

// export default function Cart() {
//   const [cart, setCart] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [toast, setToast] = useState({ open: false, type: "success", msg: "" });
//   const {user} = JSON.parse(localStorage.getItem("user")) || {};
//   const [form, setForm] = useState({
//     //sua lai gia tri mac dinh là cac thong tin cua user hien tai

//     receiveName: user.firstname + " " + user.lastname || "",
//     receivePhone: user.phone || "0900000000",
//     receiveAddress: user.address || "12 Nguyễn Huệ, Q1, HCM",
//     shippingFee: 15000,
//     note: "Giao giờ hành chính",
//     paymentMethod: "COD",
//   });

//   const notify = (type, msg) => setToast({ open: true, type, msg });
//   const uid = getUid();

//   const load = async () => {
//     try {
//       const res = await orderApi.getCart(uid);
//       setCart(res.data || null);
//     } catch (e) {
//       console.error(e);
//       notify("error", "Không tải được giỏ hàng");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

//   const itemsTotal = useMemo(() => {
//     if (!cart?.items) return 0;
//     return cart.items.reduce((sum, it) => sum + (it.total || 0), 0);
//   }, [cart]);

//   const handleCheckout = async () => {
//     try {
//       const res = await orderApi.checkout(uid, form);
//       notify("success", `Đặt hàng thành công • Mã: ${res.data.code || res.data.id}`);
//       setCart(res.data); // sau checkout cart chuyển sang PENDING/PAID
//     } catch (e) {
//       console.error(e);
//       notify("error", e?.response?.data?.message || "Checkout thất bại");
//     }
//   };

//   if (loading) return <Typography p={4}>Đang tải giỏ hàng...</Typography>;
//   if (!cart || !cart.items?.length) return <Typography p={4}>Giỏ hàng trống</Typography>;

//   return (
//     <Box p={4} display="grid" gridTemplateColumns={{ xs: "1fr", md: "1.4fr 1fr" }} gap={3}>
//       <Card>
//         <CardContent>
//           <Typography variant="h6" mb={2}>Sản phẩm</Typography>
//           {cart.items.map((it) => (
//             <Box key={it.id} display="grid" gridTemplateColumns="80px 1fr 100px" alignItems="center" gap={2} mb={2}>
//               <img src={it.bookImage} alt={it.bookTitle} style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8 }} />
//               <Box>
//                 <Typography fontWeight={600}>{it.bookTitle}</Typography>
//                 <Typography color="text.secondary">SL: {it.quantity}</Typography>
//               </Box>
//               <Typography textAlign="right">{(it.total || 0).toLocaleString()}₫</Typography>
//               <Divider sx={{ gridColumn: "1 / -1", my: 1 }} />
//             </Box>
//           ))}
//         </CardContent>
//       </Card>

//       <Card>
//         <CardContent>
//           <Typography variant="h6" mb={2}>Thông tin nhận hàng</Typography>
//           <Box display="grid" gap={1.5}>
//             <TextField label="Họ tên" value={form.receiveName} onChange={e => setForm({ ...form, receiveName: e.target.value })} />
//             <TextField label="SĐT" value={form.receivePhone} onChange={e => setForm({ ...form, receivePhone: e.target.value })} />
//             <TextField label="Địa chỉ" value={form.receiveAddress} onChange={e => setForm({ ...form, receiveAddress: e.target.value })} />
//             <TextField label="Phí ship" type="number" value={form.shippingFee} onChange={e => setForm({ ...form, shippingFee: Number(e.target.value) })} />
//             <TextField label="Ghi chú" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
//           </Box>

//           <Divider sx={{ my: 2 }} />

//           <Box display="flex" justifyContent="space-between" mb={1}>
//             <Typography>Tạm tính</Typography>
//             <Typography>{itemsTotal.toLocaleString()}₫</Typography>
//           </Box>
//           <Box display="flex" justifyContent="space-between" mb={1}>
//             <Typography>Phí ship</Typography>
//             <Typography>{(form.shippingFee || 0).toLocaleString()}₫</Typography>
//           </Box>
//           <Box display="flex" justifyContent="space-between" fontWeight={700}>
//             <Typography>Tổng cộng</Typography>
//             <Typography>{(itemsTotal + (form.shippingFee || 0)).toLocaleString()}₫</Typography>
//           </Box>

//           <Button fullWidth sx={{ mt: 2 }} variant="contained" color="primary" onClick={handleCheckout}>
//             Đặt hàng (COD)
//           </Button>
//         </CardContent>
//       </Card>

//       <Snackbar open={toast.open} autoHideDuration={2200} onClose={() => setToast({ ...toast, open: false })}>
//         <Alert severity={toast.type} variant="filled">{toast.msg}</Alert>
//       </Snackbar>
//     </Box>
//   );
// }





import { useEffect, useMemo, useState } from "react";
import { orderApi } from "../../api/orderApi";
import { getUid } from "../../api/localStorageService";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  TextField,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, type: "success", msg: "" });

  const user = JSON.parse(localStorage.getItem("user"));
  
  const [form, setForm] = useState({
    receiveName: `${user?.firstname || ""} ${user?.lastname || ""}`.trim(),
    receivePhone: user?.phone || "0900000000",
    receiveAddress: user?.address || "12 Nguyễn Huệ, Q1, HCM",
    shippingFee: 15000,
    note: "Giao giờ hành chính",
    paymentMethod: "COD",
  });

  const notify = (type, msg) => setToast({ open: true, type, msg });
//   const uid = getUid();
    const uid = user?.uid;

  const load = async () => {
    try {
      const res = await orderApi.getCart(uid);
      setCart(res.data || null);
    } catch (e) {
      console.error(e);
      notify("error", "Không tải được giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  // 🧮 Tính tổng tiền
  const itemsTotal = useMemo(() => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, it) => sum + (it.total || 0), 0);
  }, [cart]);

  // 🔢 Hàm thay đổi số lượng
  const updateQuantity = (itemId, quantity) => {
    if (quantity < 1) quantity = 1;
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((it) =>
        it.id === itemId ? { ...it, quantity, total: it.price * quantity } : it
      ),
    }));
  };

  const handleCheckout = async () => {
    try {
      const res = await orderApi.checkout(uid, form);
      notify("success", `Đặt hàng thành công • Mã: ${res.data.code || res.data.id}`);
      setCart(res.data);
    } catch (e) {
      console.error(e);
      notify("error", e?.response?.data?.message || "Checkout thất bại");
    }
  };

  if (loading) return <Typography p={4}>Đang tải giỏ hàng...</Typography>;
  if (!cart || !cart.items?.length)
    return (
      <Typography p={4} textAlign="center" fontSize={18}>
        🛒 Giỏ hàng của bạn đang trống
      </Typography>
    );

  return (
    <Box
      p={4}
      display="grid"
      gridTemplateColumns={{ xs: "1fr", md: "1.5fr 1fr" }}
      gap={3}
    >
      {/* Bên trái: Danh sách sản phẩm */}
      <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>
            🧾 Sản phẩm trong giỏ
          </Typography>

          {cart.items.map((it) => (
            <Box
              key={it.id}
              display="grid"
              gridTemplateColumns="90px 1fr 130px"
              alignItems="center"
              gap={2}
              mb={2}
              sx={{
                p: 1.5,
                border: "1px solid #eee",
                borderRadius: 2,
                "&:hover": { boxShadow: 2 },
                transition: "0.2s",
              }}
            >
              <img
                src={it.bookImage}
                alt={it.bookTitle}
                style={{
                  width: 80,
                  height: 80,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
              <Box>
                <Typography fontWeight={600} fontSize={16}>
                  {it.bookTitle}
                </Typography>
                <Typography color="text.secondary" fontSize={14}>
                  {(it.price || 0).toLocaleString()}₫ / cuốn
                </Typography>

                {/* Ô điều chỉnh số lượng */}
                <Box display="flex" alignItems="center" mt={1}>
                  <IconButton
                    size="small"
                    onClick={() => updateQuantity(it.id, it.quantity - 1)}
                  >
                    <Remove fontSize="small" />
                  </IconButton>
                  <TextField
                    value={it.quantity}
                    onChange={(e) =>
                      updateQuantity(it.id, Number(e.target.value) || 1)
                    }
                    type="number"
                    inputProps={{ min: 1, style: { textAlign: "center" } }}
                    size="small"
                    sx={{ width: 60 }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => updateQuantity(it.id, it.quantity + 1)}
                  >
                    <Add fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              <Typography textAlign="right" fontWeight={600}>
                {(it.total || 0).toLocaleString()}₫
              </Typography>
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Bên phải: Form thanh toán */}
      <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>
            📦 Thông tin nhận hàng
          </Typography>

          <Box display="grid" gap={1.5}>
            <TextField
              label="Họ tên"
              value={form.receiveName}
              onChange={(e) =>
                setForm({ ...form, receiveName: e.target.value })
              }
              size="small"
            />
            <TextField
              label="Số điện thoại"
              value={form.receivePhone}
              onChange={(e) =>
                setForm({ ...form, receivePhone: e.target.value })
              }
              size="small"
            />
            <TextField
              label="Địa chỉ"
              value={form.receiveAddress}
              onChange={(e) =>
                setForm({ ...form, receiveAddress: e.target.value })
              }
              size="small"
            />
            <TextField
              label="Phí vận chuyển"
              type="number"
              value={form.shippingFee}
              onChange={(e) =>
                setForm({ ...form, shippingFee: Number(e.target.value) })
              }
              size="small"
            />
            <TextField
              label="Ghi chú"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              size="small"
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Tổng tiền */}
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Tạm tính</Typography>
            <Typography>{itemsTotal.toLocaleString()}₫</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Phí ship</Typography>
            <Typography>{form.shippingFee.toLocaleString()}₫</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box
            display="flex"
            justifyContent="space-between"
            fontWeight={700}
            fontSize={17}
          >
            <Typography>Tổng cộng</Typography>
            <Typography color="primary">
              {(itemsTotal + form.shippingFee).toLocaleString()}₫
            </Typography>
          </Box>

          <Button
            fullWidth
            sx={{ mt: 2, py: 1.2, fontWeight: 600 }}
            variant="contained"
            color="primary"
            onClick={handleCheckout}
          >
            Xác nhận đặt hàng (COD)
          </Button>
        </CardContent>
      </Card>

      <Snackbar
        open={toast.open}
        autoHideDuration={2200}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert severity={toast.type} variant="filled">
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
