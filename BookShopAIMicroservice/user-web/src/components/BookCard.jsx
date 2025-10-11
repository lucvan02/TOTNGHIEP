import { Card, CardMedia, CardContent, Typography } from "@mui/material";
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
        boxShadow: 3,
        transition: "transform 0.2s",
        "&:hover": { transform: "scale(1.02)" },
      }}
      onClick={() => navigate(`/book/${book.id}`)}
    >
      <CardMedia
        component="img"
        height="260"
        image={book.image || "/placeholder.jpg"}
        alt={book.title}
        sx={{ objectFit: "cover" }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom noWrap>
          {book.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {book.authors?.map((a) => a.name).join(", ") || "Đang cập nhật"}
        </Typography>
        <Typography variant="subtitle1" color="primary" sx={{ mt: 1 }}>
          {book.price?.toLocaleString()}₫
        </Typography>
        <Typography variant="body2" color="text.secondary">
          NXB: {book.publisher?.name || "Chưa rõ"}
        </Typography>
      </CardContent>
    </Card>
  );
}
