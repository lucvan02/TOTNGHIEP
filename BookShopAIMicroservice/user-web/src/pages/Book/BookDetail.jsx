import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { bookApi } from "../../api/bookApi";
import {
  Box,
  Typography,
  CircularProgress,
  CardMedia,
  Divider,
} from "@mui/material";

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

  if (!book) return <Typography>Không tìm thấy sách</Typography>;

  return (
   
    <Box p={4} display="flex" flexDirection="row" gap={4}>
      <CardMedia
        component="img"
        // image={`http://localhost:8080${book.image}`}
        image={book.image}
        alt={book.title}
        sx={{ width: 300, height: 400, objectFit: "cover" }}
      />
      <Box>
        <Typography variant="h4">{book.title}</Typography>
        <Typography variant="h6" color="text.secondary" mb={2}>
          {book.authors.map((a) => a.name).join(", ")}
        </Typography>
        <Typography variant="h5" color="primary" mb={2}>
          {book.price.toLocaleString()}₫
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body1" dangerouslySetInnerHTML={{ __html: book.description }} />
        <Divider sx={{ my: 2 }} />
        <Typography>
          <strong>Nhà xuất bản:</strong> {book.publisher?.name}
        </Typography>
        <Typography>
          <strong>Thể loại:</strong> {book.categories.map((c) => c.name).join(", ")}
        </Typography>
      </Box>
    </Box>
    
  );
}
