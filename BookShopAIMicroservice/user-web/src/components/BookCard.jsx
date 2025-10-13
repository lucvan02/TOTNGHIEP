// import { Card, CardMedia, CardContent, Typography } from "@mui/material";
// import { useNavigate } from "react-router-dom";

// export default function BookCard({ book }) {
//   const navigate = useNavigate();

//   return (
//     <Card
//       sx={{
//         cursor: "pointer",
//         height: "100%",
//         display: "flex",
//         flexDirection: "column",
//         boxShadow: 3,
//         transition: "transform 0.2s",
//         "&:hover": { transform: "scale(1.02)" },
//       }}
//       onClick={() => navigate(`/book/${book.id}`)}
//     >
//       <CardMedia
//         component="img"
//         height="260"
//         image={book.image || "/placeholder.jpg"}
//         alt={book.title}
//         sx={{ objectFit: "cover" }}
//       />
//       <CardContent sx={{ flexGrow: 1 }}>
//         <Typography variant="h6" gutterBottom noWrap>
//           {book.title}
//         </Typography>
//         <Typography variant="body2" color="text.secondary" noWrap>
//           {book.authors?.map((a) => a.name).join(", ") || "Đang cập nhật"}
//         </Typography>
//         <Typography variant="subtitle1" color="primary" sx={{ mt: 1 }}>
//           {book.price?.toLocaleString()}₫
//         </Typography>
//         <Typography variant="body2" color="text.secondary">
//           NXB: {book.publisher?.name || "Chưa rõ"}
//         </Typography>
//       </CardContent>
//     </Card>
//   );
// }






import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Rating,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function BookCard({ book }) {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        cursor: "pointer",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        transition: "transform 0.25s, box-shadow 0.25s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        },
      }}
      onClick={() => navigate(`/book/${book.id}`)}
    >
      {/* Hình ảnh sách */}
      <CardMedia
        component="img"
        height="260"
        image={book.image || "/placeholder.jpg"}
        alt={book.title}
        sx={{
          objectFit: "cover",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      />

      {/* Nội dung */}
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {/* Tiêu đề */}
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          gutterBottom
          noWrap
          sx={{ fontSize: "1rem" }}
        >
          {book.title}
        </Typography>

        {/* Tác giả */}
        <Typography variant="body2" color="text.secondary" noWrap>
          {book.authors?.map((a) => a.name).join(", ") || "Đang cập nhật"}
        </Typography>

        {/* Đánh giá và số lượng bán */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ mt: 1, mb: 1 }}
        >
          <Rating
            value={book.star || 0}
            precision={0.5}
            size="small"
            readOnly
          />
          <Typography variant="body2" color="text.secondary">
            {book.star ? book.star.toFixed(1) : "0.0"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
            Đã bán {book.saleQuantity || 0}
          </Typography>
        </Stack>

        {/* Giá tiền */}
        <Typography
          variant="h6"
          color="primary"
          fontWeight="bold"
          sx={{ mt: 1 }}
        >
          {book.price?.toLocaleString()}₫
        </Typography>

        {/* Nhà xuất bản */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5 }}
          noWrap
        >
          NXB: {book.publisher?.name || "Chưa rõ"}
        </Typography>
      </CardContent>
    </Card>
  );
}
