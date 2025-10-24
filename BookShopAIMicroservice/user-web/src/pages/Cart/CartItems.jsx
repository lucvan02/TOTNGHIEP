// src/pages/Cart/CartItems.jsx
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  TextField,
  Chip,
} from "@mui/material";
import { Add, Remove, DeleteOutline, ReportGmailerrorred } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { orderApi } from "../../api/orderApi";

export default function CartItems({
  cart,
  setCart,
  meta,
  busy,
  setBusy,
  notify,
  refreshCart,
}) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const uid = user?.uid;

  const updateQuantity = async (it, nextQty) => {
    if (nextQty < 1) nextQty = 1;
    const m = meta[it.bookId];
    if (m && Number.isInteger(m.stock) && nextQty > m.stock) {
      notify("error", `Vượt quá tồn kho • Còn lại: ${m.stock}`);
      nextQty = m.stock;
    }

    const snapshot = structuredClone(cart);
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((x) =>
        x.id === it.id ? { ...x, quantity: nextQty, total: (x.price || 0) * nextQty } : x
      ),
    }));
    try {
      setBusy(true);
      await orderApi.updateQty(uid, { bookId: it.bookId, quantity: nextQty });
      await refreshCart();
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
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((x) => x.id !== it.id),
    }));
    try {
      setBusy(true);
      await orderApi.removeItem(uid, it.bookId);
      await refreshCart();
      notify("success", "Đã xóa sản phẩm khỏi giỏ");
    } catch (e) {
      console.error(e);
      setCart(snapshot);
      notify("error", e?.response?.data?.message || "Xóa thất bại");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" mb={2}>
          🧾 Sản phẩm trong giỏ
        </Typography>

        {cart.items.map((it) => {
          const m = meta[it.bookId] || {};
          const hidden = m.status !== undefined && m.status !== 1;
          const out = Number.isInteger(m.stock) && m.stock < it.quantity;

          return (
            <Box
              key={it.id}
              display="grid"
              gridTemplateColumns="90px 1fr 160px 40px"
              alignItems="center"
              gap={2}
              mb={2}
              sx={{
                p: 1.5,
                border: "1px solid #eee",
                borderRadius: 2,
                ...(hidden || out
                  ? { background: "#fff7f7", borderColor: "#ffcdd2" }
                  : {}),
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
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/book/${it.bookId}`)}
              />
              <Box>
                <Typography fontWeight={600} fontSize={16}>
                  {it.bookTitle}
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <Typography color="text.secondary" fontSize={14}>
                    {(it.price || 0).toLocaleString()}₫ / cuốn
                  </Typography>
                  {Number.isInteger(m.stock) && (
                    <Chip size="small" label={`Còn: ${m.stock}`} />
                  )}
                  {hidden && (
                    <Chip
                      size="small"
                      color="error"
                      variant="outlined"
                      label="Tạm ẩn / ngừng bán"
                    />
                  )}
                  {out && !hidden && (
                    <Chip
                      size="small"
                      color="warning"
                      variant="outlined"
                      label="Không đủ hàng"
                    />
                  )}
                </Box>

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

              <IconButton disabled={busy} color="error" onClick={() => removeLine(it)}>
                <DeleteOutline />
              </IconButton>

              {(hidden || out) && (
                <Box gridColumn="1 / -1" display="flex" alignItems="center" gap={1} mt={0.5}>
                  <ReportGmailerrorred fontSize="small" color="error" />
                  <Typography fontSize={13} color="error.main">
                    {hidden
                      ? "Sản phẩm đang tạm ngưng. Vui lòng xoá khỏi giỏ để tiếp tục."
                      : `Không đủ hàng. Còn lại: ${m.stock}. Hãy giảm số lượng hoặc xoá sản phẩm.`}
                  </Typography>
                </Box>
              )}
            </Box>
          );
        })}
      </CardContent>
    </Card>
  );
}
