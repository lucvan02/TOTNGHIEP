// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { bookApi } from "../../api/bookApi";
// import {
//   Box,
//   Typography,
//   CircularProgress,
//   Card,
//   CardMedia,
//   Divider,
//   Button,
//   Rating,
// } from "@mui/material";
// import { Tag } from "antd";
// import { ShoppingCartOutlined } from "@ant-design/icons";

// export default function BookDetail() {
//   const { id } = useParams();
//   const [book, setBook] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchBook = async () => {
//       try {
//         const res = await bookApi.getById(id);
//         setBook(res.data.data);
//       } catch (e) {
//         console.error("Lỗi khi lấy chi tiết sách:", e);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchBook();
//   }, [id]);

//   if (loading)
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
//         <CircularProgress />
//       </Box>
//     );

//   if (!book) return <Typography align="center">Không tìm thấy sách</Typography>;

//   return (
//     <Box
//       p={5}
//       display="flex"
//       flexDirection="column"
//       gap={4}
//       sx={{ backgroundColor: "#fafafa", minHeight: "100vh" }}
//     >
//       {/* Vùng hiển thị chi tiết sách */}
//       <Card
//         sx={{
//           display: "flex",
//           flexDirection: { xs: "column", md: "row" },
//           p: 4,
//           boxShadow: 4,
//           borderRadius: 3,
//           backgroundColor: "#fff",
//         }}
//       >
//         {/* Ảnh bìa sách */}
//         <CardMedia
//           component="img"
//           image={book.image}
//           alt={book.title}
//           sx={{
//             width: { xs: "100%", md: 320 },
//             height: 450,
//             objectFit: "cover",
//             borderRadius: 2,
//           }}
//         />

//         {/* Nội dung chi tiết */}
//         <Box flex={1} ml={{ md: 4 }} mt={{ xs: 3, md: 0 }}>
//           <Typography variant="h4" fontWeight="bold" mb={1}>
//             {book.title}
//           </Typography>

//           <Typography variant="subtitle1" color="text.secondary" mb={2}>
//             {book.authors?.map((a) => a.name).join(", ")}
//           </Typography>

//           {/* Giá và hành động */}
//           <Typography
//             variant="h5"
//             color="primary"
//             mb={2}
//             fontWeight="bold"
//           >
//             {book.price.toLocaleString()}₫
//           </Typography>

//           <Box display="flex" gap={2} mb={3}>
//             <Button
//               variant="contained"
//               color="primary"
//               startIcon={<ShoppingCartOutlined />}
//             >
//               Thêm vào giỏ hàng
//             </Button>
//             <Button variant="outlined" color="secondary">
//               Mua ngay
//             </Button>
//           </Box>

//           <Divider sx={{ my: 2 }} />

//           {/* Thông tin phụ */}
//           <Box display="flex" flexDirection="column" gap={1}>
//             <Box>
//               <Typography variant="body1" fontWeight="bold">
//                 Thể loại:
//               </Typography>
//               {book.categories?.map((c) => (
//                 <Tag color="geekblue" key={c.id} style={{ marginTop: 5 }}>
//                   {c.name}
//                 </Tag>
//               ))}
//             </Box>

//             <Box>
//               <Typography variant="body1" fontWeight="bold">
//                 Tác giả:
//               </Typography>
//               {book.authors?.map((a) => (
//                 <Tag color="purple" key={a.id} style={{ marginTop: 5 }}>
//                   {a.name}
//                 </Tag>
//               ))}
//             </Box>

//             <Box>
//               <Typography variant="body1" fontWeight="bold">
//                 Nhà xuất bản:
//               </Typography>
//               {book.publisher && (
//                 <Tag color="green" style={{ marginTop: 5 }}>
//                   {book.publisher.name}
//                 </Tag>
//               )}
//             </Box>
//           </Box>
//         </Box>
//       </Card>

//       {/* Mô tả */}
//       <Card
//         sx={{
//           p: 3,
//           borderRadius: 3,
//           boxShadow: 2,
//           backgroundColor: "#fff",
//         }}
//       >
//         <Typography variant="h6" mb={2}>
//           📖 Mô tả
//         </Typography>
//         <Typography
//           variant="body1"
//           sx={{ whiteSpace: "pre-wrap" }}
//           dangerouslySetInnerHTML={{ __html: book.description }}
//         />
//       </Card>

//       {/* Khu vực đánh giá */}
//       <Card
//         sx={{
//           p: 3,
//           borderRadius: 3,
//           boxShadow: 2,
//           backgroundColor: "#fff",
//         }}
//       >
//         <Typography variant="h6" mb={2}>
//           ⭐ Đánh giá (chưa có)
//         </Typography>
//         <Box display="flex" flexDirection="column" alignItems="center">
//           <Rating value={0} readOnly size="large" />
//           <Typography mt={1} color="text.secondary">
//             Tính năng đánh giá sẽ sớm được cập nhật!
//           </Typography>
//         </Box>
//       </Card>
//     </Box>
//   );
// }




import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";                 // NEW
import { bookApi } from "../../api/bookApi";
import { orderApi } from "../../api/orderApi";                             // NEW
import { getUid } from "../../api/localStorageService";                    // NEW
import {
  Box, Typography, CircularProgress, Card, CardMedia,
  Divider, Button, Rating, Snackbar, Alert
} from "@mui/material";
import { Tag } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { Favorite } from "@mui/icons-material";

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();                                          // NEW
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);                             // NEW
  const [toast, setToast] = useState({ open: false, type: "success", msg: "" }); // NEW
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await bookApi.getById(id);
        setBook(res.data.data);
      } catch (e) {
        console.error("Lỗi khi lấy chi tiết sách:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const notify = (type, msg) => setToast({ open: true, type, msg });       // NEW

  const handleAddToCart = async () => {                                    // NEW
    // const uid = getUid();
    const uid = user.uid;
    if (!uid) return notify("error", "Bạn cần đăng nhập để thêm vào giỏ");
    try {
      setSaving(true);
      await orderApi.addToCart(uid, { bookId: Number(id), quantity: 1 });
      notify("success", "Đã thêm vào giỏ hàng");
    } catch (e) {
      console.error(e);
      notify("error", e?.response?.data?.message || "Không thêm được vào giỏ");
    } finally {
      setSaving(false);
    }
  };

  const handleBuyNow = async () => {                                       // NEW
    // const uid = getUid();
    const uid = user.uid;
    if (!uid) return notify("error", "Bạn cần đăng nhập để mua hàng");
    try {
      setSaving(true);
      // 1) đảm bảo có trong giỏ (idempotent)
      await orderApi.addToCart(uid, { bookId: Number(id), quantity: 1 });
      // 2) checkout nhanh (demo COD)
      const payload = {
        receiveName: "Nguyễn Văn A",
        receivePhone: "0900000000",
        receiveAddress: "12 Nguyễn Huệ, Q1, HCM",
        shippingFee: 15000,
        note: "Mua ngay từ BookDetail",
        paymentMethod: "COD",
      };
      const res = await orderApi.checkout(uid, payload);
      notify("success", `Đặt hàng thành công • Mã: ${res.data.code || res.data.id}`);
      // chuyển sang trang giỏ/đơn tùy bạn muốn:
      setTimeout(() => navigate("/cart"), 600);
    } catch (e) {
      console.error(e);
      notify("error", e?.response?.data?.message || "Không checkout được");
    } finally {
      setSaving(false);
    }
  };

  const handleFavorite = () => {                                          // NEW
    notify("info", "Tính năng đang phát triển");
  }

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );

  if (!book) return <Typography align="center">Không tìm thấy sách</Typography>;

  return (
    <Box p={5} display="flex" flexDirection="column" gap={4} sx={{ backgroundColor: "#fafafa", minHeight: "100vh" }}>
      <Card sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, p: 4, boxShadow: 4, borderRadius: 3, backgroundColor: "#fff" }}>
        <CardMedia component="img" image={book.image} alt={book.title}
          sx={{ width: { xs: "100%", md: 320 }, height: 450, objectFit: "cover", borderRadius: 2 }} />

        <Box flex={1} ml={{ md: 4 }} mt={{ xs: 3, md: 0 }}>
          <Typography variant="h4" fontWeight="bold" mb={1}>{book.title}</Typography>

          {/* Đánh giá sao trung bình */}
          <Typography variant="body1" color="text.secondary" mb={2}>
            <Rating value={book.star} readOnly precision={0.1} />
            <span style={{ marginLeft: 8 }}>{book.star?.toFixed(1)}</span>
          </Typography>

          {/* //Tồn kho và đã bán */}
          <Typography variant="subtitle1" color="text.secondary" mb={2}>
            Đã bán: {book.saleQuantity} || Hiện có: {book.stock}
          </Typography>

          <Box display="flex" gap={2} mb={3}>
            <Button variant="contained" color="primary" startIcon={<ShoppingCartOutlined />} disabled={saving}
              onClick={handleAddToCart}>
              Thêm vào giỏ
            </Button>
            {/* <Button variant="outlined" color="secondary" disabled={saving} onClick={handleBuyNow}>
              Mua ngay
            </Button> */}
            {/* <Button variant="outlined" color="secondary" disabled={saving} onClick={() => notify("info", "Tính năng đang phát triển")}> */}
            <Button variant="outlined" color="secondary" disabled={saving}
              onClick={handleFavorite}>
              Yêu thích
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />
          <Box>
            <Typography variant="body1" fontWeight="bold">Thể loại:</Typography>
            {book.categories?.map((c) => (
              <Tag color="geekblue" key={c.id} style={{ marginTop: 5 }}>{c.name}</Tag>
            ))}
          </Box>

          <Box>
            <Typography variant="body1" fontWeight="bold">Tác giả:</Typography>
            {book.authors?.map((a) => (
              <Tag color="purple" key={a.id} style={{ marginTop: 5 }}>{a.name}</Tag>
            ))}
          </Box>

          <Box>
            <Typography variant="body1" fontWeight="bold">Nhà xuất bản:</Typography>
            {book.publisher && <Tag color="green" style={{ marginTop: 5 }}>{book.publisher.name}</Tag>}
          </Box>
        </Box>
      </Card>

            {/* Mô tả */}
      <Card
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: 2,
          backgroundColor: "#fff",
        }}
      >
        <Typography variant="h6" mb={2}>
          📖 Mô tả
        </Typography>
        <Typography
          variant="body1"
          sx={{ whiteSpace: "pre-wrap" }}
          dangerouslySetInnerHTML={{ __html: book.description }}
        />
      </Card>

      {/* Khu vực đánh giá */}
      <Card
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: 2,
          backgroundColor: "#fff",
        }}
      >
        <Typography variant="h6" mb={2}>
          ⭐ Đánh giá (chưa có)
        </Typography>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Rating value={0} readOnly size="large" />
          <Typography mt={1} color="text.secondary">
            Tính năng đánh giá sẽ sớm được cập nhật!
          </Typography>
        </Box>
      </Card>

      <Snackbar open={toast.open} autoHideDuration={2000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.type} variant="filled">{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
