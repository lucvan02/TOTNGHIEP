import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { bookApi } from "../../api/bookApi";
import { categoryApi } from "../../api/categoryApi";
import Header from "../../components/Header/Header";
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Pagination,
  Stack,
} from "@mui/material";
import BookCard from "../../components/BookCard";

export default function CategoryBooks() {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchData = async (p = 0) => {
    setLoading(true);
    try {
      const [catRes, bookRes] = await Promise.all([
        categoryApi.getById(id),
        bookApi.getByCategory(id, p, 8),
      ]);
      setCategory(catRes.data.data);
      const data = bookRes.data.data;
      setBooks(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      console.error("Lỗi khi lấy sách theo thể loại:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );

  return (
    <>
      <Header />
      <Box p={3} marginTop={8} bgcolor="#f9f9f9" minHeight="100vh">
        <Typography variant="h5" fontWeight="bold" mb={1}>
          📚 Sách theo thể loại: {category?.name}
        </Typography>

        <Grid container spacing={3} mt={2}>
          {books.length > 0 ? (
            books.map((book) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                <BookCard book={book} />
              </Grid>
            ))
          ) : (
            <Typography textAlign="center" color="text.secondary" mt={5} width="100%">
              Không có sách nào trong thể loại này.
            </Typography>
          )}
        </Grid>

        {totalPages > 1 && (
          <Stack alignItems="center" mt={4}>
            <Pagination
              count={totalPages}
              page={page + 1}
              onChange={(e, newPage) => {
                setPage(newPage - 1);
                fetchData(newPage - 1);
              }}
              color="primary"
            />
          </Stack>
        )}
      </Box>
    </>
  );
}
