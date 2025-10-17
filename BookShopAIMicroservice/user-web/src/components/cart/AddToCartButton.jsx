import { useState } from "react";
import { Button, Snackbar, Alert } from "@mui/material";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { orderApi } from "../../api/orderApi";
import { useCart } from "../../context/CartContext";

export default function AddToCartButton({ buyerId, bookId, disabled }) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "success", msg: "" });
  const { refreshCart } = useCart();

  const notify = (type, msg) => setToast({ open: true, type, msg });

  const handleAdd = async () => {
    if (!buyerId) return notify("error", "Bạn cần đăng nhập để thêm vào giỏ");
    try {
      setLoading(true);
      await orderApi.addToCart(buyerId, { bookId, quantity: 1 });
      notify("success", "Đã thêm vào giỏ hàng");
      await refreshCart(); // ✅ cập nhật realtime
    } catch (e) {
      console.error(e);
      notify("error", e?.response?.data?.message || "Không thêm được vào giỏ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<ShoppingCartOutlined />}
        disabled={loading || disabled}
        onClick={handleAdd}
      >
        Thêm vào giỏ
      </Button>

      <Snackbar
        open={toast.open}
        autoHideDuration={2000}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert severity={toast.type} variant="filled">
          {toast.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
