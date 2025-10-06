import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { bookApi } from "../../api/bookApi";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardMedia,
  Divider,
  Button,
  Rating,
} from "@mui/material";
import { Tag } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );

  if (!book) return <Typography align="center">Không tìm thấy sách</Typography>;

  return (
    <Box
      p={5}
      display="flex"
      flexDirection="column"
      gap={4}
      sx={{ backgroundColor: "#fafafa", minHeight: "100vh" }}
    >
      {/* Vùng hiển thị chi tiết sách */}
      <Card
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          p: 4,
          boxShadow: 4,
          borderRadius: 3,
          backgroundColor: "#fff",
        }}
      >
        {/* Ảnh bìa sách */}
        <CardMedia
          component="img"
          image={book.image}
          alt={book.title}
          sx={{
            width: { xs: "100%", md: 320 },
            height: 450,
            objectFit: "cover",
            borderRadius: 2,
          }}
        />

        {/* Nội dung chi tiết */}
        <Box flex={1} ml={{ md: 4 }} mt={{ xs: 3, md: 0 }}>
          <Typography variant="h4" fontWeight="bold" mb={1}>
            {book.title}
          </Typography>

          <Typography variant="subtitle1" color="text.secondary" mb={2}>
            {book.authors?.map((a) => a.name).join(", ")}
          </Typography>

          {/* Giá và hành động */}
          <Typography
            variant="h5"
            color="primary"
            mb={2}
            fontWeight="bold"
          >
            {book.price.toLocaleString()}₫
          </Typography>

          <Box display="flex" gap={2} mb={3}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ShoppingCartOutlined />}
            >
              Thêm vào giỏ hàng
            </Button>
            <Button variant="outlined" color="secondary">
              Mua ngay
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Thông tin phụ */}
          <Box display="flex" flexDirection="column" gap={1}>
            <Box>
              <Typography variant="body1" fontWeight="bold">
                Thể loại:
              </Typography>
              {book.categories?.map((c) => (
                <Tag color="geekblue" key={c.id} style={{ marginTop: 5 }}>
                  {c.name}
                </Tag>
              ))}
            </Box>

            <Box>
              <Typography variant="body1" fontWeight="bold">
                Tác giả:
              </Typography>
              {book.authors?.map((a) => (
                <Tag color="purple" key={a.id} style={{ marginTop: 5 }}>
                  {a.name}
                </Tag>
              ))}
            </Box>

            <Box>
              <Typography variant="body1" fontWeight="bold">
                Nhà xuất bản:
              </Typography>
              {book.publisher && (
                <Tag color="green" style={{ marginTop: 5 }}>
                  {book.publisher.name}
                </Tag>
              )}
            </Box>
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
    </Box>
  );
}
