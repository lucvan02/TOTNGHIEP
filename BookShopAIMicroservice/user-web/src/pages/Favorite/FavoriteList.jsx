// import { useEffect, useState } from "react";
// import { favoriteApi } from "../../api/favoriteApi";
// import { Box, Card, CardMedia, CardContent, Typography, Button, Grid, CircularProgress } from "@mui/material";

// const money = (n) => (n ?? 0).toLocaleString() + "₫";

// export default function FavoriteList() {
//   const user = JSON.parse(localStorage.getItem("user") || "null");
//   const uid = user?.uid;
//   const [items, setItems] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const load = async () => {
//     try {
//       if (!uid) { setItems([]); return; }
//       const res = await favoriteApi.list(uid);
//       setItems(res.data.data || []);
//     } finally { setLoading(false); }
//   };

//   useEffect(()=>{ load(); /* eslint-disable-next-line */ }, []);

//   const removeOne = async (bookId) => {
//     try {
//       await favoriteApi.remove(uid, bookId);
//       setItems((prev)=> prev.filter(x => x.bookId !== bookId));
//     } catch {}
//   };

//   if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress/></Box>;
//   if (!items?.length) return <Typography p={4}>Chưa có sách yêu thích.</Typography>;

//   return (
//     <Box p={4}>
//       <Typography variant="h5" fontWeight={700} mb={2}>📚 Thư viện yêu thích</Typography>
//       <Grid container spacing={2}>
//         {items.map(it => (
//           <Grid key={it.id} item xs={12} sm={6} md={4} lg={3}>
//             <Card sx={{ borderRadius: 2, overflow: "hidden" }}>
//               <CardMedia component="img" image={it.image} alt={it.title} sx={{ height: 200, objectFit: "cover" }}/>
//               <CardContent>
//                 <Typography fontWeight={700} noWrap>{it.title}</Typography>
//                 <Typography color="primary" fontWeight={700}>{money(it.price)}</Typography>
//                 <Box display="flex" gap={1} mt={1.5}>
//                   <Button size="small" variant="outlined" onClick={()=> removeOne(it.bookId)}>Xóa</Button>
//                   <Button size="small" variant="contained" href={`/book/${it.bookId}`}>Xem sách</Button>
//                 </Box>

//               {/* <Typography color="text.secondary" fontSize={13}>
//                 {it.live ? "Live" : "Snapshot"} •
//                 {typeof it.stock === "number" ? ` Còn: ${it.stock}` : ""}
//                 {typeof it.status === "number" ? ` • Trạng thái: ${it.status === 1 ? "Hiển thị" : "Ẩn"}` : ""}
//               </Typography> */}


//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>
//     </Box>
//   );
// }





import { useEffect, useState } from "react";
import { favoriteApi } from "../../api/favoriteApi";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";

const money = (n) => (n ?? 0).toLocaleString() + "₫";

export default function FavoriteList() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const uid = user?.uid;
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      if (!uid) {
        setItems([]);
        return;
      }
      const res = await favoriteApi.list(uid);
      setItems(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); // eslint-disable-line
  }, []);

  const removeOne = async (bookId) => {
    try {
      await favoriteApi.remove(uid, bookId);
      setItems((prev) => prev.filter((x) => x.bookId !== bookId));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading)
    return (
      <Box p={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );

  if (!items?.length)
    return <Typography p={4}>Chưa có sách yêu thích.</Typography>;

  return (
    <Box p={4}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        📚 Thư viện yêu thích
      </Typography>

      <Box
        display="flex"
        flexWrap="wrap"
        justifyContent="flex-start"
        gap={3}
      >
        {items.map((it) => (
          <Card
            key={it.id}
            sx={{
              width: 200,
              display: "flex",
              flexDirection: "column",
              boxShadow: 3,
              borderRadius: 2,
              transition: "0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
          >
            <CardMedia
              component="img"
              image={it.image}
              alt={it.title}
              sx={{
                height: 300,
                objectFit: "cover",
              }}
            />

            <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                sx={{
                  height: 48,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  mb: 1,
                }}
              >
                {it.title}
              </Typography>

              <Typography color="primary" fontWeight={700} fontSize={14}>
                {money(it.price)}
              </Typography>

              <Box mt={2} display="flex" gap={1}>
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  onClick={() => removeOne(it.bookId)}
                >
                  Xóa
                </Button>
                <Button
                  fullWidth
                  size="small"
                  variant="contained"
                  href={`/book/${it.bookId}`}
                >
                  Xem
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
