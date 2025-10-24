import { useEffect, useState, useMemo } from "react";
import { orderApi } from "../../api/orderApi";
import { bookApi } from "../../api/bookApi";
import { Box, Typography, Snackbar, Alert } from "@mui/material";
import CartItems from "./CartItems";
import CheckoutForm from "./CheckoutForm";
import { useCart } from "../../context/CartContext";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "success", msg: "" });
  const { refreshCart } = useCart();

  const user = JSON.parse(localStorage.getItem("user"));
  const uid = user?.uid;

  const notify = (type, msg) => setToast({ open: true, type, msg });

  const load = async () => {
    try {
      setLoading(true);
      const res = await orderApi.getCart(uid);
      const c = res.data.data || null;
      setCart(c);
      if (c?.items?.length) {
        const ids = [...new Set(c.items.map((x) => x.bookId))];
        const metas = await Promise.all(
          ids.map(async (id) => {
            try {
              const r = await bookApi.getById(id);
              const b = r.data.data;
              return [
                id,
                {
                  stock: b?.stock ?? null,
                  status: b?.status ?? 1,
                  title: b?.title,
                  image: b?.image,
                },
              ];
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

  useEffect(() => {
    load();
  }, []);

  const itemsTotal = useMemo(() => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, it) => sum + (it.total || 0), 0);
  }, [cart]);

  // xác định sản phẩm không thể mua
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

  if (loading) return <Typography p={4}>Đang tải giỏ hàng...</Typography>;
  if (!cart || !cart.items?.length)
    return (
      <Typography p={4} textAlign="center" fontSize={18} mt={5}>
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
      <CartItems
        cart={cart}
        setCart={setCart}
        meta={meta}
        busy={busy}
        setBusy={setBusy}
        notify={notify}
        refreshCart={refreshCart}
      />
      <CheckoutForm
        cart={cart}
        uid={uid}
        itemsTotal={itemsTotal}
        canCheckout={canCheckout}
        blockers={blockers}
        meta={meta}
        busy={busy}
        setBusy={setBusy}
        notify={notify}
        load={load}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={2600}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert severity={toast.type} variant="filled" sx={{ whiteSpace: "pre-line" }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
