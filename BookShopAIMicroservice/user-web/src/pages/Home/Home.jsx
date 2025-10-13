
// import { useEffect, useState } from "react";
// import { bookApi } from "../../api/bookApi";

// import {
//   Box,
//   Grid,
//   CircularProgress,
//   TextField,
//   InputAdornment,
//   Typography,
// } from "@mui/material";
// import SearchIcon from "@mui/icons-material/Search";
// import BookCard from "../../components/BookCard";

// export default function Home() {
//   const [books, setBooks] = useState([]);
//   const [topBooks, setTopBooks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searching, setSearching] = useState(false);
//   const [keyword, setKeyword] = useState("");

//   // ✅ Lấy danh sách toàn bộ và top sale
//   const fetchBooks = async () => {
//     setLoading(true);
//     try {
//       const [allRes, topRes] = await Promise.all([
//         bookApi.getAll(),
//         bookApi.getTopSale(),
//       ]);
//       setBooks(allRes.data.data || []);
//       setTopBooks(topRes.data.data || []);
//     } catch (e) {
//       console.error("Lỗi khi lấy danh sách sách:", e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Tìm kiếm
//   const searchBooks = async (value) => {
//     try {
//       setSearching(true);
//       if (!value.trim()) {
//         fetchBooks();
//         return;
//       }
//       const res = await bookApi.search(value);
//       setBooks(res.data.data || []);
//     } catch (e) {
//       console.error("Lỗi tìm kiếm:", e);
//     } finally {
//       setSearching(false);
//     }
//   };

//   // ✅ Debounce search
//   useEffect(() => {
//     const delayDebounce = setTimeout(() => {
//       searchBooks(keyword);
//     }, 500);
//     return () => clearTimeout(delayDebounce);
//   }, [keyword]);

//   // ✅ Lần đầu load trang
//   useEffect(() => {
//     fetchBooks();
//   }, []);

//   if (loading)
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
//         <CircularProgress />
//       </Box>
//     );

//   return (
//     <>

//       {/* Thanh tìm kiếm */}
//         <Box display="flex" justifyContent="center" mb={1} mt={10}>
//           <TextField
//             placeholder="Tìm kiếm sách..."
//             variant="outlined"
//             sx={{ width: "60%", backgroundColor: "white" }}
//             value={keyword}
//             onChange={(e) => setKeyword(e.target.value)}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <SearchIcon />
//                 </InputAdornment>
//               ),
//               endAdornment: searching && (
//                 <InputAdornment position="end">
//                   <CircularProgress size={20} thickness={4} />
//                 </InputAdornment>
//               ),
//             }}
//           />
//         </Box>
//       <Box p={3} bgcolor="#f9f9f9" minHeight="100vh" marginTop={8}>
//         {/* TOP SALE SECTION */}
//         <Typography variant="h5" fontWeight="bold" mb={2}>
//           🔥 Top Sách Bán Chạy
//         </Typography>
//         <Grid container spacing={3} mb={5}>
//           {topBooks.length > 0 ? (
//             topBooks.map((book) => (
//               <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
//                 <BookCard book={book} />
//               </Grid>
//             ))
//           ) : (
//             <Typography textAlign="center" color="text.secondary">
//               Chưa có dữ liệu top bán chạy
//             </Typography>
//           )}
//         </Grid>

        

//         {/* Danh sách tất cả sách */}
//         <Typography variant="h5" fontWeight="bold" mb={2}>
//           📚 Tất Cả Sách
//         </Typography>
//         {books.length > 0 ? (
//           <Grid container spacing={3}>
//             {books.map((book) => (
//               <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
//                 <BookCard book={book} />
//               </Grid>
//             ))}
//           </Grid>
//         ) : (
//           <Typography textAlign="center" variant="h6" color="text.secondary" mt={5}>
//             Không tìm thấy sách nào.
//           </Typography>
//         )}
//       </Box>
//     </>
//   );
// }






import { useEffect, useState } from "react";
import { bookApi } from "../../api/bookApi";
import Header from "../../components/Header/Header";
import {
  Box,
  Grid,
  CircularProgress,
  TextField,
  InputAdornment,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import BookCard from "../../components/BookCard";
import Slider from "react-slick";
import Footer from "../../components/Footer/Footer";

export default function Home() {
  const [books, setBooks] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [keyword, setKeyword] = useState("");

  // ✅ Lấy danh sách toàn bộ và top sale
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const [allRes, topRes] = await Promise.all([
        bookApi.getAll(),
        bookApi.getTopSale(),
      ]);
      setBooks(allRes.data.data || []);
      setTopBooks(topRes.data.data || []);
    } catch (e) {
      console.error("Lỗi khi lấy danh sách sách:", e);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Tìm kiếm
  const searchBooks = async (value) => {
    try {
      setSearching(true);
      if (!value.trim()) {
        fetchBooks();
        return;
      }
      const res = await bookApi.search(value);
      setBooks(res.data.data || []);
    } catch (e) {
      console.error("Lỗi tìm kiếm:", e);
    } finally {
      setSearching(false);
    }
  };

  // ✅ Debounce search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      searchBooks(keyword);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [keyword]);

  // ✅ Lần đầu load trang
  useEffect(() => {
    fetchBooks();
  }, []);

  // if (loading)
  //   return (
  //     <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
  //       <CircularProgress />
  //     </Box>
  //   );

  // ✅ Ảnh banner (demo)
  const banners = [
    "https://tudongchat.com/wp-content/uploads/2025/01/stt-ban-sach-5.jpg",
    "https://www.elle.vn/wp-content/uploads/2019/11/11/377919/review-sach-hay-dep-va-buon.jpg",
    "https://sikido.vn/uploads/source/hinhanhh/cafe-doc-sach-215537.jpg"
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };

  const isSearching = keyword.trim() !== "";

  return (
    <>
      <Header />

      {/* Thanh tìm kiếm */}
      <Box display="flex" justifyContent="center" mb={1} mt={10}>
        <TextField
          placeholder="Tìm kiếm sách..."
          variant="outlined"
          sx={{ width: "60%", backgroundColor: "white" }}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searching && (
              <InputAdornment position="end">
                <CircularProgress size={20} thickness={4} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Carousel banner */}
      {!isSearching && (
        <Box
          sx={{
            width: "80%",
            margin: "0 auto",
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: 3,
          }}
        >
          <Slider {...sliderSettings}>
            {banners.map((url, idx) => (
              <Box key={idx}>
                <img
                  src={url}
                  alt={`banner-${idx}`}
                  style={{
                    width: "100%",
                    height: "380px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              </Box>
            ))}
          </Slider>
        </Box>
      )}

      <Box p={3} bgcolor="#f9f9f9" minHeight="100vh" marginTop={4}>
        {/* Nếu đang tìm kiếm → chỉ hiện kết quả */}
        {isSearching ? (
          <>
            <Typography variant="h5" fontWeight="bold" mb={2}>
              🔎 Kết quả tìm kiếm
            </Typography>
            {books.length > 0 ? (
              <Grid container spacing={3}>
                {books.map((book) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                    <BookCard book={book} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography
                textAlign="center"
                variant="h6"
                color="text.secondary"
                mt={5}
              >
                Không tìm thấy sách nào.
              </Typography>
            )}
          </>
        ) : (
          <>
            {/* TOP SALE SECTION */}
            <Typography variant="h5" fontWeight="bold" mb={2}>
              🔥 Top Sách Bán Chạy
            </Typography>
            <Grid container spacing={3} mb={5}>
              {topBooks.length > 0 ? (
                topBooks.map((book) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                    <BookCard book={book} />
                  </Grid>
                ))
              ) : (
                <Typography textAlign="center" color="text.secondary">
                  Chưa có dữ liệu top bán chạy
                </Typography>
              )}
            </Grid>

            {/* Danh sách tất cả sách */}
            <Typography variant="h5" fontWeight="bold" mb={2}>
              📚 Tất Cả Sách
            </Typography>
            {books.length > 0 ? (
              <Grid container spacing={3}>
                {books.map((book) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                    <BookCard book={book} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography
                textAlign="center"
                variant="h6"
                color="text.secondary"
                mt={5}
              >
                Không có sách nào.
              </Typography>
            )}
          </>
        )}
      </Box>
      <Footer />
    </>
  );
}
