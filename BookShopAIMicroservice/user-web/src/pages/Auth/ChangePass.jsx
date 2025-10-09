import { Box, Button, Card, TextField, Typography } from "@mui/material";
import { message } from "antd";
import { useState } from "react";
import { authApi } from "../../api/authApi";
import { useNavigate } from "react-router-dom";

export default function ChangePass() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  

  const handleSubmit = async () => {
    try {
      await authApi.changePassword(email, newPassword);
      messageApi.success("Đã thay đổi mật khẩu thành công");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch {
      message.error("Thay đổi mật khẩu thất bại");
    }
  };
  

  return (
    <>
      {contextHolder}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        sx={{
          backgroundImage: "url('/logo/login-book-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Card sx={{ p: 4, width: 350 }}>
          <Typography variant="h6" textAlign="center" mb={2}>
            Đổi mật khẩu
          </Typography>
          <TextField
            label="Mật khẩu mới"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleSubmit}>
            Đổi mật khẩu
          </Button>

          <Button
            variant="text"
            fullWidth
            sx={{ mt: 1 }}
            onClick={() => window.location.href = "/login"}
          >
            Quay lại đăng nhập
          </Button>
        </Card>
      </Box>
    </>
  );
}
