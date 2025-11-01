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
        width: "250px",
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
        height="300"
        image={book.image || "/placeholder.jpg"}
        alt={book.title}
        sx={{
          objectFit: "cover",
          width: "200px",
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
        {/* <Typography variant="body2" color="text.secondary" noWrap>
          {book.authors?.map((a) => a.name).join(", ") || "Đang cập nhật"}
        </Typography> */}

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







// import {
//   Card,
//   CardContent,
//   Typography,
//   Box,
//   Rating,
//   Stack,
//   Chip,
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";

// const SIZES = {
//   sm: { w: 180, h: 320, img: 200, spine: 14, pages: 10 },
//   md: { w: 220, h: 380, img: 250, spine: 16, pages: 12 },
//   lg: { w: 260, h: 440, img: 290, spine: 18, pages: 14 },
// };

// export default function BookCard({
//   book,
//   size = "md",
//   badge, // "Bestseller" | "New" | "Sale" | string
// }) {
//   const navigate = useNavigate();
//   const { w, h, img, spine, pages } = SIZES[size] || SIZES.md;

//   const price = book.price ?? 0;
//   const salePrice = book.salePrice ?? null; // nếu có giá giảm
//   const hasDiscount = Number.isFinite(salePrice) && salePrice < price;

//   const fmt = (n) =>
//     (n ?? 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "₫";

//   return (
//     <Card
//       onClick={() => navigate(`/book/${book.id}`)}
//       sx={{
//         width: w,
//         height: h,
//         position: "relative",
//         display: "flex",
//         flexDirection: "column",
//         cursor: "pointer",
//         borderRadius: 0, // KHÔNG bo góc
//         backgroundColor: "#fff",
//         boxShadow:
//           "0 10px 22px rgba(0,0,0,.18), 0 2px 6px rgba(0,0,0,.10)",
//         transformStyle: "preserve-3d",
//         transformOrigin: "left center",
//         transition: "transform .28s ease, box-shadow .28s ease, filter .28s",
//         "&:hover": {
//           transform: "translateY(-6px) rotateY(-4deg)",
//           boxShadow:
//             "0 18px 36px rgba(0,0,0,.26), 0 4px 10px rgba(0,0,0,.12)",
//           filter: "saturate(1.03)",
//         },

//         // Sống lưng (spine) + chữ dọc
//         "&::before": {
//           content: '""',
//           position: "absolute",
//           left: 0,
//           top: 0,
//           width: spine + "px",
//           height: "100%",
//           background:
//             "linear-gradient(90deg,#2a2a2a 0%,#1c1c1c 45%,#2a2a2a 100%)",
//           boxShadow:
//             "inset -2px 0 6px rgba(255,255,255,.18), inset 1px 0 10px rgba(0,0,0,.35)",
//           zIndex: 3,
//         },
//         "& .spineText": {
//           position: "absolute",
//           left: 0,
//           top: 0,
//           width: spine + "px",
//           height: img + "px",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           writingMode: "vertical-rl",
//           textOrientation: "upright",
//           color: "#eaeaea",
//           fontSize: "10px",
//           letterSpacing: "2px",
//           textTransform: "uppercase",
//           opacity: 0.9,
//           zIndex: 4,
//           pointerEvents: "none",
//         },

//         // Mép giấy phải
//         "&::after": {
//           content: '""',
//           position: "absolute",
//           right: 0,
//           top: 0,
//           width: pages + "px",
//           height: "100%",
//           background:
//             "repeating-linear-gradient(180deg,#ffffff 0px,#f6f6f6 3px,#ededed 6px,#ffffff 9px)",
//           boxShadow:
//             "inset 2px 0 5px rgba(0,0,0,.10), 2px 0 6px rgba(0,0,0,.05)",
//           zIndex: 1,
//         },
//       }}
//     >
//       {/* Ribbon */}
//       {(badge || hasDiscount) && (
//         <Box
//           sx={{
//             position: "absolute",
//             top: 10,
//             right: pages + 6,
//             zIndex: 6,
//             transform: "translateZ(30px)",
//           }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           <Chip
//             label={
//               hasDiscount
//                 ? `Giảm ${Math.round(100 - (salePrice / price) * 100)}%`
//                 : badge
//             }
//             size="small"
//             sx={{
//               color: "#fff",
//               background:
//                 hasDiscount
//                   ? "linear-gradient(90deg,#EF4444,#DC2626)"
//                   : "linear-gradient(90deg,#3B82F6,#2563EB)",
//               fontWeight: 700,
//               letterSpacing: ".3px",
//               boxShadow: "0 4px 10px rgba(0,0,0,.18)",
//             }}
//           />
//         </Box>
//       )}

//       {/* Bìa (ảnh) + glossy highlight + viền bìa */}
//       <Box
//         sx={{
//           position: "relative",
//           width: "100%",
//           height: img,
//           overflow: "hidden",
//           pl: `${spine}px`,
//           pr: `${pages}px`,
//           backgroundColor: "#f3f3f3",
//           borderBottom: "1px solid rgba(0,0,0,.06)",
//           transform: "translateZ(20px)",
//         }}
//       >
//         <img
//           src={book.image || "/placeholder.jpg"}
//           alt={book.title}
//           loading="lazy"
//           style={{
//             width: "100%",
//             height: "100%",
//             objectFit: "cover",
//             display: "block",
//             filter: "contrast(1.02)",
//           }}
//         />
//         {/* Glossy highlight */}
//         <Box
//           sx={{
//             position: "absolute",
//             inset: 0,
//             background:
//               "linear-gradient(120deg, rgba(255,255,255,.18) 0%, rgba(255,255,255,0) 35%, rgba(0,0,0,0) 65%, rgba(0,0,0,.10) 100%)",
//             pointerEvents: "none",
//           }}
//         />
//         {/* Viền bìa rất mảnh */}
//         <Box
//           sx={{
//             position: "absolute",
//             inset: 0,
//             border: "1px solid rgba(0,0,0,.06)",
//             pointerEvents: "none",
//           }}
//         />
//         {/* Chữ trên sống lưng */}
//         <Box className="spineText">
//           <span title={book.title}>
//             {(book.title || "").slice(0, 18)}
//             {(book.title || "").length > 18 ? "…" : ""}
//           </span>
//         </Box>
//       </Box>

//       {/* Nội dung */}
//       <CardContent
//         sx={{
//           flex: 1,
//           p: 1.5,
//           pl: `calc(${spine}px + 10px)`,
//           pr: `calc(${pages}px + 10px)`,
//           display: "flex",
//           flexDirection: "column",
//           minHeight: 0,
//           background:
//             "linear-gradient(180deg, rgba(255,255,255,.98), rgba(250,250,250,.98))",
//           transform: "translateZ(10px)",
//         }}
//       >
//         {/* Tiêu đề: clamp 2 dòng */}
//         <Typography
//           variant="subtitle1"
//           fontWeight={900}
//           sx={{
//             fontSize: "1rem",
//             lineHeight: 1.25,
//             display: "-webkit-box",
//             WebkitLineClamp: 2,
//             WebkitBoxOrient: "vertical",
//             overflow: "hidden",
//             minHeight: "2.6em",
//             letterSpacing: ".15px",
//           }}
//         >
//           {book.title}
//         </Typography>

//         {/* Tác giả */}
//         <Typography
//           variant="body2"
//           color="text.secondary"
//           sx={{
//             mt: 0.5,
//             display: "-webkit-box",
//             WebkitLineClamp: 1,
//             WebkitBoxOrient: "vertical",
//             overflow: "hidden",
//             opacity: 0.9,
//           }}
//         >
//           {book.authors?.map((a) => a.name).join(", ") || "Đang cập nhật"}
//         </Typography>

//         {/* Đánh giá + đã bán */}
//         <Stack
//           direction="row"
//           alignItems="center"
//           spacing={1}
//           sx={{ mt: 1, mb: .5 }}
//         >
//           <Rating
//             value={Number(book.star) || 0}
//             precision={0.5}
//             size="small"
//             readOnly
//           />
//           <Typography variant="body2" color="text.secondary">
//             {book.star ? Number(book.star).toFixed(1) : "0.0"}
//           </Typography>
//           <Typography
//             variant="body2"
//             color="text.secondary"
//             sx={{ ml: "auto", whiteSpace: "nowrap" }}
//           >
//             Đã bán {book.saleQuantity || 0}
//           </Typography>
//         </Stack>

//         <Box sx={{ flex: 1 }} />

//         {/* Giá */}
//         <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mt: 1 }}>
//           {hasDiscount && (
//             <Typography
//               variant="body2"
//               color="text.secondary"
//               sx={{ textDecoration: "line-through" }}
//             >
//               {fmt(price)}
//             </Typography>
//           )}
//           <Typography
//             variant="h6"
//             color="primary"
//             fontWeight={900}
//             sx={{ letterSpacing: ".2px" }}
//           >
//             {fmt(hasDiscount ? salePrice : price)}
//           </Typography>
//         </Stack>

//         {/* NXB */}
//         <Typography
//           variant="body2"
//           color="text.secondary"
//           sx={{
//             mt: 0.3,
//             display: "-webkit-box",
//             WebkitLineClamp: 1,
//             WebkitBoxOrient: "vertical",
//             overflow: "hidden",
//           }}
//         >
//           NXB: {book.publisher?.name || "Chưa rõ"}
//         </Typography>
//       </CardContent>
//     </Card>
//   );
// }
