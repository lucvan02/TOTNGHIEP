// import { useEffect, useMemo, useState } from "react";
// import { orderApi } from "../../api/orderApi";
// import {
//   Box, Typography, Card, CardContent, Button, Divider,
//   TextField, Snackbar, Alert, IconButton, Radio, RadioGroup,
//   FormControlLabel, FormLabel
// } from "@mui/material";
// import { Add, Remove, DeleteOutline } from "@mui/icons-material";
// import { useNavigate } from "react-router-dom";

// export default function Cart() {
//   const [cart, setCart] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [busy, setBusy] = useState(false); // disable khi đang gọi API
//   const [toast, setToast] = useState({ open: false, type: "success", msg: "" });
//   const navigate = useNavigate();

//   const user = JSON.parse(localStorage.getItem("user"));
//   const uid = user?.uid;

//   const [form, setForm] = useState({
//     receiveName: `${user?.firstname || ""} ${user?.lastname || ""}`.trim(),
//     receivePhone: user?.phone || "0359490251",
//     receiveAddress: user?.address || "97 Man Thiện, Tăng Nhơn Phú A, Thủ Đức,HCM",
//     shippingFee: 15000,
//     note: "Giao giờ hành chính",
//     paymentMethod: "COD", // 👈 có thể đổi sang ONLINE
//   });

//   const notify = (type, msg) => setToast({ open: true, type, msg });

//   const load = async () => {
//     try {
//       const res = await orderApi.getCart(uid);
//       setCart(res.data.data || null); // ApiResponse<Order>
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

//   const updateQuantity = async (it, nextQty) => {
//     if (nextQty < 1) nextQty = 1;
//     const snapshot = structuredClone(cart);
//     // optimistic UI
//     setCart((prev) => ({
//       ...prev,
//       items: prev.items.map((x) =>
//         x.id === it.id ? { ...x, quantity: nextQty, total: (x.price || 0) * nextQty } : x
//       ),
//     }));
//     try {
//       setBusy(true);
//       await orderApi.updateQty(uid, { bookId: it.bookId, quantity: nextQty });
//       const res = await orderApi.getCart(uid);
//       setCart(res.data.data || null);
//     } catch (e) {
//       console.error(e);
//       setCart(snapshot);
//       notify("error", e?.response?.data?.message || "Cập nhật số lượng thất bại");
//     } finally {
//       setBusy(false);
//     }
//   };

//   // ✅ xóa 1 product khỏi giỏ
//   const removeLine = async (it) => {
//     const snapshot = structuredClone(cart);
//     setCart((prev) => ({ ...prev, items: prev.items.filter((x) => x.id !== it.id) }));
//     try {
//       setBusy(true);
//       await orderApi.removeItem(uid, it.bookId);
//       const res = await orderApi.getCart(uid);
//       setCart(res.data.data || null);
//       notify("success", "Đã xóa sản phẩm khỏi giỏ");
//     } catch (e) {
//       console.error(e);
//       setCart(snapshot);
//       notify("error", e?.response?.data?.message || "Xóa thất bại");
//     } finally {
//       setBusy(false);
//     }
//   };

//   const handleCheckout = async () => {
//     try {
//       setBusy(true);
//       const res = await orderApi.checkout(uid, form);
//       const order = res.data.data; 
//       notify("success", `Đặt hàng thành công • Mã đơn (UUID): ${order.id}`);
//       setCart(order); 
//       window.location.href = `/orders`;
//     } catch (e) {
//       console.error(e);
//       notify("error", e?.response?.data?.message || "Checkout thất bại");
//     } finally {
//       setBusy(false);
//     }
//   };

//   if (loading) return <Typography p={4}>Đang tải giỏ hàng...</Typography>;
//   if (!cart || !cart.items?.length)
//     return (
//       <Typography p={4} textAlign="center" fontSize={18} mt={5}>
//         🛒 Giỏ hàng của bạn đang trống
//       </Typography>
//     );

//   return (
//     <Box p={4} display="grid" gridTemplateColumns={{ xs: "1fr", md: "1.5fr 1fr" }} gap={3}>
//       {/* Left: Items */}
//       <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
//         <CardContent>
//           <Typography variant="h6" mb={2}>🧾 Sản phẩm trong giỏ</Typography>

//           {cart.items.map((it) => (
//             <Box key={it.id}
//               display="grid"
//               gridTemplateColumns="90px 1fr 130px 40px"
//               alignItems="center" gap={2} mb={2}
//               sx={{ p: 1.5, border: "1px solid #eee", borderRadius: 2, "&:hover": { boxShadow: 2 }, transition: "0.2s" }}>
//               <img src={it.bookImage} alt={it.bookTitle}
//                    style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, cursor: "pointer" }} onClick={() => navigate(`/book/${it.bookId}`)} />
//               <Box>
//                 <Typography fontWeight={600} fontSize={16}>{it.bookTitle}</Typography>
//                 <Typography color="text.secondary" fontSize={14}>
//                   {(it.price || 0).toLocaleString()}₫ / cuốn
//                 </Typography>
//                 <Box display="flex" alignItems="center" mt={1}>
//                   <IconButton disabled={busy} size="small" onClick={() => updateQuantity(it, it.quantity - 1)}>
//                     <Remove fontSize="small" />
//                   </IconButton>
//                   <TextField
//                     disabled={busy}
//                     value={it.quantity}
//                     onChange={(e) => updateQuantity(it, Number(e.target.value) || 1)}
//                     // type="number"
//                     inputProps={{ min: 1, style: { textAlign: "center" } }}
//                     size="small"
//                     sx={{ width: 60 }}
//                   />
//                   <IconButton disabled={busy} size="small" onClick={() => updateQuantity(it, it.quantity + 1)}>
//                     <Add fontSize="small" />
//                   </IconButton>
//                 </Box>
//               </Box>

//               <Typography textAlign="right" fontWeight={600}>
//                 {(it.total || 0).toLocaleString()}₫
//               </Typography>

//               {/* ✅ nút Xóa */}
//               <IconButton disabled={busy} color="error" onClick={() => removeLine(it)}>
//                 <DeleteOutline />
//               </IconButton>
//             </Box>
//           ))}
//         </CardContent>
//       </Card>

//       {/* Right: Shipping + Payment + Place order */}
//       <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
//         <CardContent>
//           <Typography variant="h6" mb={2}>📦 Thông tin nhận hàng</Typography>
//           <Box display="grid" gap={1.5}>
//             <TextField label="Họ tên" size="small"
//               value={form.receiveName} onChange={(e) => setForm({ ...form, receiveName: e.target.value })} />
//             <TextField label="Số điện thoại" size="small"
//               value={form.receivePhone} onChange={(e) => setForm({ ...form, receivePhone: e.target.value })} />
//             <TextField label="Địa chỉ" size="small"
//               value={form.receiveAddress} onChange={(e) => setForm({ ...form, receiveAddress: e.target.value })} />
//             <TextField label="Phí vận chuyển" type="number" size="small"
//               value={form.shippingFee} onChange={(e) => setForm({ ...form, shippingFee: Number(e.target.value) })} />
//             <TextField label="Ghi chú" size="small"
//               value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
//           </Box>

//           <Divider sx={{ my: 2 }} />

//           {/* ✅ Chọn phương thức thanh toán */}
//           <Box mb={1.5}>
//             <FormLabel component="legend">Phương thức thanh toán</FormLabel>
//             <RadioGroup
//               row
//               value={form.paymentMethod}
//               onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
//             >
//               <FormControlLabel value="COD" control={<Radio />} label="COD (thanh toán khi nhận)" />
//               <FormControlLabel value="ONLINE" control={<Radio />} label="Online" />
//             </RadioGroup>
//           </Box>

//           <Divider sx={{ my: 1.5 }} />

//           {/* Totals */}
//           <Box display="flex" justifyContent="space-between" mb={1}>
//             <Typography>Tạm tính</Typography>
//             <Typography>{itemsTotal.toLocaleString()}₫</Typography>
//           </Box>
//           <Box display="flex" justifyContent="space-between" mb={1}>
//             <Typography>Phí ship</Typography>
//             <Typography>{(form.shippingFee || 0).toLocaleString()}₫</Typography>
//           </Box>
//           <Divider sx={{ my: 1 }} />
//           <Box display="flex" justifyContent="space-between" fontWeight={700} fontSize={17}>
//             <Typography>Tổng cộng</Typography>
//             <Typography color="primary">
//               {(itemsTotal + (form.shippingFee || 0)).toLocaleString()}₫
//             </Typography>
//           </Box>

//           <Button
//             fullWidth sx={{ mt: 2, py: 1.2, fontWeight: 600 }}
//             variant="contained" color="primary"
//             disabled={busy}
//             onClick={handleCheckout}
//           >
//             Xác nhận đặt hàng ({form.paymentMethod})
//           </Button>
//         </CardContent>
//       </Card>

//       <Snackbar open={toast.open} autoHideDuration={2200}
//         onClose={() => setToast({ ...toast, open: false })}>
//         <Alert severity={toast.type} variant="filled">{toast.msg}</Alert>
//       </Snackbar>
//     </Box>
//   );
// }









// src/pages/Cart/Cart.jsx
import { useEffect, useMemo, useState } from "react";
import { orderApi } from "../../api/orderApi";
import { bookApi } from "../../api/bookApi";
import {
  Box, Typography, Card, CardContent, Button, Divider,
  TextField, Snackbar, Alert, IconButton, Radio, RadioGroup,
  FormControlLabel, FormLabel, Chip, Tooltip
} from "@mui/material";
import { Add, Remove, DeleteOutline, ReportGmailerrorred } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "success", msg: "" });
  const [meta, setMeta] = useState({}); // { [bookId]: { stock, status, title, image } }
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const uid = user?.uid;

  const [form, setForm] = useState({
    receiveName: `${user?.firstname || ""} ${user?.lastname || ""}`.trim(),
    receivePhone: user?.phone || "0359490251",
    receiveAddress: user?.address || "97 Man Thiện, Tăng Nhơn Phú A, Thủ Đức,HCM",
    shippingFee: 15000,
    note: "Giao giờ hành chính",
    paymentMethod: "COD",
  });

  const notify = (type, msg) => setToast({ open: true, type, msg });

  // tải giỏ + meta sách (stock/status) song song
  const load = async () => {
    try {
      setLoading(true);
      const res = await orderApi.getCart(uid);
      const c = res.data.data || null;
      setCart(c);

      // build meta map
      if (c?.items?.length) {
        const ids = [...new Set(c.items.map((x) => x.bookId))];
        const metas = await Promise.all(
          ids.map(async (id) => {
            try {
              const r = await bookApi.getById(id);
              const b = r.data.data;
              return [id, {
                stock: b?.stock ?? null,
                status: b?.status ?? 1,   // 1 = hiển thị (giả định), khác 1 = ẩn/ngừng bán
                title: b?.title,
                image: b?.image,
              }];
            } catch {
              return [id, { stock: null, status: 1 }];
            }
          })
        );
        setMeta(Object.fromEntries(metas));
      } else {
        setMeta({});
      }
    } catch (e) {
      console.error(e);
      notify("error", e?.response?.data?.message || "Không tải được giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const itemsTotal = useMemo(() => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, it) => sum + (it.total || 0), 0);
  }, [cart]);

  // kiểm tra blocker: hết hàng / trạng thái ẩn
  const blockers = useMemo(() => {
    if (!cart?.items) return [];
    const list = [];
    for (const it of cart.items) {
      const m = meta[it.bookId] || {};
      if (m.status !== undefined && m.status !== 1) {
        list.push({ bookId: it.bookId, reason: "Sản phẩm tạm ẩn/không hiển thị" });
      }
      if (Number.isInteger(m.stock) && m.stock < it.quantity) {
        list.push({ bookId: it.bookId, reason: `Hết hàng (còn ${m.stock})` });
      }
    }
    return list;
  }, [cart, meta]);

  const canCheckout = blockers.length === 0;

  const updateQuantity = async (it, nextQty) => {
    if (nextQty < 1) nextQty = 1;

    // nếu biết stock và vượt → chặn
    const m = meta[it.bookId];
    if (m && Number.isInteger(m.stock) && nextQty > m.stock) {
      notify("error", `Vượt quá tồn kho • Còn lại: ${m.stock}`);
      nextQty = m.stock;
    }

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
      // sau khi setCart, meta cũ vẫn hợp lệ; nếu muốn chắc chắn, có thể gọi lại load()
    } catch (e) {
      console.error(e);
      setCart(snapshot);
      notify("error", e?.response?.data?.message || "Cập nhật số lượng thất bại");
    } finally {
      setBusy(false);
    }
  };

  const removeLine = async (it) => {
    const snapshot = structuredClone(cart);
    setCart((prev) => ({ ...prev, items: prev.items.filter((x) => x.id !== it.id) }));
    try {
      setBusy(true);
      await orderApi.removeItem(uid, it.bookId);
      const res = await orderApi.getCart(uid);
      setCart(res.data.data || null);
      // cập nhật meta map
      setMeta((m) => {
        const n = { ...m };
        delete n[it.bookId];
        return n;
      });
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
    if (!canCheckout) {
      // gộp lý do
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
      //tạm ngưng một thoi gian để khách hàng đọc thông báo
      setTimeout(() => { window.location.href = `/orders`; }, 1500);
    } catch (e) {
      console.error(e);
      // hiển thị message từ BE nếu có
      notify("error", e?.response?.data?.message || "Checkout thất bại");
      load(); // reload giỏ
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
      {/* LEFT: Items */}
      <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>🧾 Sản phẩm trong giỏ</Typography>

          {cart.items.map((it) => {
            const m = meta[it.bookId] || {};
            const hidden = m.status !== undefined && m.status !== 1;
            const out = Number.isInteger(m.stock) && m.stock < it.quantity;

            return (
              <Box key={it.id}
                display="grid"
                gridTemplateColumns="90px 1fr 160px 40px"
                alignItems="center" gap={2} mb={2}
                sx={{
                  p: 1.5, border: "1px solid #eee", borderRadius: 2,
                  ...(hidden || out ? { background: "#fff7f7", borderColor: "#ffcdd2" } : {}),
                  "&:hover": { boxShadow: 2 }, transition: "0.2s"
                }}>
                <img
                  src={it.bookImage}
                  alt={it.bookTitle}
                  style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, cursor: "pointer" }}
                  onClick={() => navigate(`/book/${it.bookId}`)}
                />
                <Box>
                  <Typography fontWeight={600} fontSize={16}>{it.bookTitle}</Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <Typography color="text.secondary" fontSize={14}>
                      {(it.price || 0).toLocaleString()}₫ / cuốn
                    </Typography>
                    {Number.isInteger(m.stock) && (
                      <Chip size="small" label={`Còn: ${m.stock}`} />
                    )}
                    {hidden && (
                      <Chip size="small" color="error" variant="outlined" label="Tạm ẩn / ngừng bán" />
                    )}
                    {out && !hidden && (
                      <Chip size="small" color="warning" variant="outlined" label="Không đủ hàng" />
                    )}
                  </Box>

                  {/* Quantity */}
                  <Box display="flex" alignItems="center" mt={1}>
                    <IconButton
                      disabled={busy || it.quantity <= 1}
                      size="small"
                      onClick={() => updateQuantity(it, it.quantity - 1)}
                    >
                      <Remove fontSize="small" />
                    </IconButton>
                    <TextField
                      disabled={busy}
                      value={it.quantity}
                      onChange={(e) => {
                        const v = Number(e.target.value) || 1;
                        updateQuantity(it, v);
                      }}
                      inputProps={{ min: 1, style: { textAlign: "center" } }}
                      size="small"
                      sx={{ width: 60 }}
                    />
                    <IconButton
                      disabled={busy || (Number.isInteger(m.stock) && it.quantity >= m.stock)}
                      size="small"
                      onClick={() => updateQuantity(it, it.quantity + 1)}
                    >
                      <Add fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Typography textAlign="right" fontWeight={600}>
                  {(it.total || 0).toLocaleString()}₫
                </Typography>

                {/* Delete */}
                <IconButton disabled={busy} color="error" onClick={() => removeLine(it)}>
                  <DeleteOutline />
                </IconButton>

                {/* Gợi ý xử lý */}
                {(hidden || out) && (
                  <Box gridColumn="1 / -1" display="flex" alignItems="center" gap={1} mt={0.5}>
                    <ReportGmailerrorred fontSize="small" color="error" />
                    <Typography fontSize={13} color="error.main">
                      {hidden ? "Sản phẩm đang tạm ngưng. Vui lòng xoá khỏi giỏ để tiếp tục." :
                        `Không đủ hàng. Số lượng còn lại: ${m.stock}. Hãy giảm số lượng hoặc xoá sản phẩm.`}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          })}
        </CardContent>
      </Card>

      {/* RIGHT: Shipping + Payment + Place order */}
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
                fullWidth sx={{ mt: 2, py: 1.2, fontWeight: 600 }}
                variant="contained" color="primary"
                disabled={busy || !canCheckout}
                onClick={handleCheckout}
              >
                Xác nhận đặt hàng ({form.paymentMethod})
              </Button>
            </span>
          </Tooltip>
        </CardContent>
      </Card>

      <Snackbar open={toast.open} autoHideDuration={2600}
        onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.type} variant="filled" sx={{ whiteSpace: "pre-line" }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
