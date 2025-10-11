import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { bookApi } from "../../api/bookApi";
import { authorApi } from "../../api/authorApi";
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

export default function AuthorBooks() {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchData = async (p = 0) => {
    setLoading(true);
    try {
      const [authorRes, bookRes] = await Promise.all([
        authorApi.getById(id),
        bookApi.getByAuthor(id, p, 8),
      ]);
      setAuthor(authorRes.data.data);
      const data = bookRes.data.data;
      setBooks(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      console.error("Lỗi khi lấy sách theo tác giả:", e);
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
          ✍️ Sách theo tác giả: {author?.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          {author?.description || "Chưa có mô tả cho tác giả này."}
        </Typography>

        <Grid container spacing={3}>
          {books.length > 0 ? (
            books.map((book) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                <BookCard book={book} />
              </Grid>
            ))
          ) : (
            <Typography textAlign="center" color="text.secondary" mt={5} width="100%">
              Không có sách nào của tác giả này.
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
