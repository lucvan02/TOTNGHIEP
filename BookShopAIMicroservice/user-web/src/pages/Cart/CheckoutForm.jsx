// import {
//   Card,
//   CardContent,
//   Typography,
//   Box,
//   TextField,
//   Divider,
//   RadioGroup,
//   FormControlLabel,
//   Radio,
//   Button,
//   Snackbar,
//   Alert,
// } from "@mui/material";
// import { useState, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import { orderApi } from "../../api/orderApi";

// export default function CheckoutForm({ cart, refreshCart }) {
//   const navigate = useNavigate();
//   const user = JSON.parse(localStorage.getItem("user"));
//   const uid = user?.uid;
//   const [form, setForm] = useState({
//     receiveName: `${user?.firstname || ""} ${user?.lastname || ""}`.trim(),
//     receivePhone: user?.phone || "",
//     receiveAddress: user?.address || "",
//     shippingFee: 15000,
//     note: "Giao giờ hành chính",
//     paymentMethod: "COD",
//   });
//   const [busy, setBusy] = useState(false);
//   const [toast, setToast] = useState({ open: false, type: "success", msg: "" });

//   const itemsTotal = useMemo(
//     () => cart.items.reduce((s, i) => s + (i.total || 0), 0),
//     [cart]
//   );

//   const notify = (type, msg) => setToast({ open: true, type, msg });

//   const handleCheckout = async () => {
//     try {
//       setBusy(true);
//       await orderApi.checkout(uid, form);
//       notify("success", "Đặt hàng thành công!");
//       await refreshCart(); // reset badge
//       setTimeout(() => navigate("/orders"), 1000);
//     } catch (e) {
//       console.error(e);
//       notify("error", "Checkout thất bại");
//     } finally {
//       setBusy(false);
//     }
//   };

//   return (
//     <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
//       <CardContent>
//         <Typography variant="h6" mb={2}>
//           📦 Thông tin nhận hàng
//         </Typography>
//         <Box display="grid" gap={1.5}>
//           <TextField
//             label="Họ tên"
//             size="small"
//             value={form.receiveName}
//             onChange={(e) => setForm({ ...form, receiveName: e.target.value })}
//           />
//           <TextField
//             label="Số điện thoại"
//             size="small"
//             value={form.receivePhone}
//             onChange={(e) => setForm({ ...form, receivePhone: e.target.value })}
//           />
//           <TextField
//             label="Địa chỉ"
//             size="small"
//             value={form.receiveAddress}
//             onChange={(e) => setForm({ ...form, receiveAddress: e.target.value })}
//           />
//           <TextField
//             label="Phí vận chuyển"
//             size="small"
//             type="number"
//             value={form.shippingFee}
//             onChange={(e) => setForm({ ...form, shippingFee: Number(e.target.value) })}
//           />
//           <TextField
//             label="Ghi chú"
//             size="small"
//             value={form.note}
//             onChange={(e) => setForm({ ...form, note: e.target.value })}
//           />
//         </Box>

//         <Divider sx={{ my: 2 }} />

//         <RadioGroup
//           row
//           value={form.paymentMethod}
//           onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
//         >
//           <FormControlLabel value="COD" control={<Radio />} label="COD" />
//           <FormControlLabel value="ONLINE" control={<Radio />} label="Online" />
//         </RadioGroup>

//         <Divider sx={{ my: 2 }} />

//         <Box display="flex" justifyContent="space-between" mb={1}>
//           <Typography>Tạm tính</Typography>
//           <Typography>{itemsTotal.toLocaleString()}₫</Typography>
//         </Box>
//         <Box display="flex" justifyContent="space-between" mb={1}>
//           <Typography>Phí ship</Typography>
//           <Typography>{form.shippingFee.toLocaleString()}₫</Typography>
//         </Box>
//         <Divider sx={{ my: 1 }} />
//         <Box display="flex" justifyContent="space-between" fontWeight={700}>
//           <Typography>Tổng cộng</Typography>
//           <Typography color="primary">
//             {(itemsTotal + form.shippingFee).toLocaleString()}₫
//           </Typography>
//         </Box>

//         <Button
//           fullWidth
//           variant="contained"
//           color="primary"
//           sx={{ mt: 2, py: 1.2 }}
//           disabled={busy}
//           onClick={handleCheckout}
//         >
//           Xác nhận đặt hàng ({form.paymentMethod})
//         </Button>

//         <Snackbar
//           open={toast.open}
//           autoHideDuration={2000}
//           onClose={() => setToast({ ...toast, open: false })}
//         >
//           <Alert severity={toast.type} variant="filled">
//             {toast.msg}
//           </Alert>
//         </Snackbar>
//       </CardContent>
//     </Card>
//   );
// }








import React from "react";

import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Tooltip,
} from "@mui/material";
import { orderApi } from "../../api/orderApi";

export default function CheckoutForm({
  cart,
  uid,
  itemsTotal,
  canCheckout,
  blockers,
  meta,
  busy,
  setBusy,
  notify,
  load,
}) {
  const [form, setForm] = React.useState({
    receiveName: `${JSON.parse(localStorage.getItem("user"))?.firstname || ""} ${
      JSON.parse(localStorage.getItem("user"))?.lastname || ""
    }`.trim(),
    receivePhone:
      JSON.parse(localStorage.getItem("user"))?.phone || "0359490251",
    receiveAddress:
      JSON.parse(localStorage.getItem("user"))?.address ||
      "97 Man Thiện, Tăng Nhơn Phú A, Thủ Đức, HCM",
    shippingFee: 15000,
    note: "Giao giờ hành chính",
    paymentMethod: "COD",
  });

  const handleCheckout = async () => {
    if (!canCheckout) {
      const msg = blockers
        .map((b) => {
          const t = meta[b.bookId]?.title || `Sách #${b.bookId}`;
          return `• ${t}: ${b.reason}`;
        })
        .join("\n");
      notify("error", `Không thể đặt hàng. Vui lòng xử lý:\n${msg}`);
      return;
    }

    try {
      setBusy(true);
      const res = await orderApi.checkout(uid, form);
      const order = res?.data?.data;
      notify("success", `Đặt hàng thành công • Mã đơn: ${order?.id}`);
      setTimeout(() => (window.location.href = "/orders"), 1500);
    } catch (e) {
      console.error(e);
      notify("error", e?.response?.data?.message || "Checkout thất bại");
      load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" mb={2}>
          📦 Thông tin nhận hàng
        </Typography>
        <Box display="grid" gap={1.5}>
          <TextField
            label="Họ tên"
            size="small"
            value={form.receiveName}
            onChange={(e) => setForm({ ...form, receiveName: e.target.value })}
          />
          <TextField
            label="Số điện thoại"
            size="small"
            value={form.receivePhone}
            onChange={(e) => setForm({ ...form, receivePhone: e.target.value })}
          />
          <TextField
            label="Địa chỉ"
            size="small"
            value={form.receiveAddress}
            onChange={(e) => setForm({ ...form, receiveAddress: e.target.value })}
          />
          <TextField
            label="Phí vận chuyển"
            type="number"
            size="small"
            value={form.shippingFee}
            onChange={(e) => setForm({ ...form, shippingFee: Number(e.target.value) })}
          />
          <TextField
            label="Ghi chú"
            size="small"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <RadioGroup
          row
          value={form.paymentMethod}
          onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
        >
          <FormControlLabel value="COD" control={<Radio />} label="COD" />
          <FormControlLabel value="ONLINE" control={<Radio />} label="Online" />
        </RadioGroup>

        <Divider sx={{ my: 2 }} />

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

        <Tooltip
          title={
            canCheckout
              ? ""
              : "Không thể đặt hàng do có sản phẩm không hiển thị/hết hàng. Hãy xoá hoặc chỉnh số lượng."
          }
        >
          <span>
            <Button
              fullWidth
              sx={{ mt: 2, py: 1.2, fontWeight: 600 }}
              variant="contained"
              color="primary"
              disabled={busy || !canCheckout}
              onClick={handleCheckout}
            >
              Xác nhận đặt hàng ({form.paymentMethod})
            </Button>
          </span>
        </Tooltip>
      </CardContent>
    </Card>
  );
}
