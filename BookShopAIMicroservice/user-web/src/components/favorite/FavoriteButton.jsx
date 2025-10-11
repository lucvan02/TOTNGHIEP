import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { favoriteApi } from "../../api/favoriteApi";

export default function FavoriteButton({ buyerId, bookId, onNotify = () => {} }) {
  const [fav, setFav] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (!buyerId) return;
        const ex = await favoriteApi.exists(buyerId, bookId);
        setFav(!!ex.data.data);
      } catch {
        // ignore
      }
    })();
  }, [buyerId, bookId]);

  const toggle = async () => {
    if (!buyerId) return onNotify("error", "Bạn cần đăng nhập để dùng yêu thích");
    try {
      setBusy(true);
      if (fav) {
        await favoriteApi.remove(buyerId, bookId);
        setFav(false);
        onNotify("success", "Đã xóa khỏi yêu thích");
      } else {
        await favoriteApi.add(buyerId, bookId);
        setFav(true);
        onNotify("success", "Đã thêm vào yêu thích");
      }
    } catch (e) {
      onNotify("error", e?.response?.data?.message || "Lỗi thao tác yêu thích");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant={fav ? "contained" : "outlined"}
      color="secondary"
      disabled={busy}
      onClick={toggle}
      startIcon={fav ? <Favorite /> : <FavoriteBorder />}
    >
      {fav ? "Đã yêu thích" : "Yêu thích"}
    </Button>
  );
}
