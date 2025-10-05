import { useEffect, useState } from "react";
import { authApi } from "../../api/authApi";
import { Card, Typography, Box } from "@mui/material";

export default function Profile() {
  const [user, setUser] = useState(null);

  // useEffect(() => {
  //   authApi.getProfile().then((res) => {
  //     setUser(res.data.data);
  //   });
  // }, []);
  //lay tho ng tin user tu localstorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
      <Card sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" mb={2}>
          Thông tin người dùng
        </Typography>
        {user ? (
          <>
            <Typography>Email: {user.email}</Typography>
            <Typography>Họ tên: {user.firstname} {user.lastname}</Typography>
            <Typography>Vai trò: {user.role}</Typography>
            <Typography>Provider: {user.provider}</Typography>
          </>
        ) : (
          <Typography>Đang tải...</Typography>
        )}
      </Card>
    </Box>
  );
}
