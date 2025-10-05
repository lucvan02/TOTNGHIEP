import { useEffect, useState } from "react";
import { bookApi } from "../../api/bookApi";
import Header from "../../components/Header/Header";
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CircularProgress,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const fetchBooks = async () => {
    try {
      const res = await bookApi.getAll();
      setBooks(res.data.data);
    } catch (e) {
      console.error("Lỗi khi lấy danh sách sách:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value) => {
    setKeyword(value);
    if (value.trim() === "") {
      fetchBooks();
      return;
    }
    try {
      const res = await bookApi.search(value);
      setBooks(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );

  return (
    <>
      <Header />
      <Box p={3} bgcolor={"#f9f9f9"} minHeight="100vh" marginTop={8}>
        {/* Thanh tìm kiếm */}
        <Box display="flex" justifyContent="center" mb={3}>
          <TextField
            placeholder="Tìm kiếm sách..."
            variant="outlined"
            sx={{ width: "60%", backgroundColor: "white" }}
            value={keyword}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Grid hiển thị sách */}
        <Grid container spacing={3}>
          {books.map((book) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
              <Card
                sx={{
                  cursor: "pointer",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: 3,
                  "&:hover": { transform: "scale(1.02)" },
                }}
                onClick={() => navigate(`/book/${book.id}`)}
              >
                <CardMedia
                  component="img"
                  height="280"
                  // image={`http://localhost:8080${book.image}`}
                  image={book.image}
                  alt={book.title}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom noWrap>
                    {book.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {book.authors.map((a) => a.name).join(", ")}
                  </Typography>
                  <Typography variant="subtitle1" color="primary">
                    {book.price.toLocaleString()}₫
                  </Typography>
                  <Typography variant="body2">
                    NXB: {book.publisher?.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
}
