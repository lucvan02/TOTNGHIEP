import { Box, Card, Typography } from "@mui/material";
import Header from "../../components/Header/Header";
import { useEffect, useState } from "react";
import { authApi } from "../../api/authApi";
import { getToken } from "../../api/localStorageService";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const username = getToken(); // tạm dùng token làm username demo
    if (username) {
      authApi.getProfile(username).then((res) => setUser(res.data.data));
    }
  }, []);

  return (
    <>
      <Header />
      <Box display="flex" justifyContent="center" alignItems="center" height="90vh">
        <Card sx={{ p: 4, width: 400 }}>
          <Typography variant="h5" mb={2}>
            Thông tin người dùng
          </Typography>
          {user ? (
            <>
              <Typography>Tên đăng nhập: {user.username}</Typography>
              <Typography>Email: {user.email}</Typography>
              <Typography>Họ tên: {user.firstname} {user.lastname}</Typography>
              <Typography>Vai trò: {user.role}</Typography>
            </>
          ) : (
            <Typography>Đang tải...</Typography>
          )}
        </Card>
      </Box>
    </>
  );
}
