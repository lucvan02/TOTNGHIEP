import { Box, Button, Card, TextField, Typography } from "@mui/material";
import { message } from "antd";
import { useState } from "react";
import { authApi } from "../../api/authApi";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    try {
      await authApi.resendOtp(email);
      message.success("Đã gửi mã OTP reset mật khẩu đến email");
    } catch {
      message.error("Gửi OTP thất bại");
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Card sx={{ p: 4, width: 350 }}>
        <Typography variant="h6" textAlign="center" mb={2}>
          Quên mật khẩu
        </Typography>
        <TextField
          label="Email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleSubmit}>
          Gửi OTP
        </Button>
      </Card>
    </Box>
  );
}
