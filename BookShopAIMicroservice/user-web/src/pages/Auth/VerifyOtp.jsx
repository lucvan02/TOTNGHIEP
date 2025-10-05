import { Box, Button, Card, TextField, Typography } from "@mui/material";
import { message } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { authApi } from "../../api/authApi";

export default function VerifyOtp() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const email = state?.email || "";
  const [messageApi, contextHolder] = message.useMessage();

  const handleVerify = async () => {
    try {
      const res = await authApi.verifyOtp(email, otp);
      messageApi.success(res.data.message);
      navigate("/login");
    } catch {
      messageApi.error("Xác thực thất bại");
    }
  };

  const resendOtp = async () => {
    await authApi.resendOtp(email);
    message.info("OTP mới đã được gửi lại email");
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      {contextHolder}
      <Card sx={{ p: 4, width: 350 }}>
        <Typography variant="h6" mb={2} textAlign="center">
          Xác thực tài khoản
        </Typography>
        <TextField
          label="Mã OTP"
          fullWidth
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleVerify}
        >
          Xác nhận
        </Button>
        <Button
          variant="text"
          color="secondary"
          fullWidth
          sx={{ mt: 1 }}
          onClick={resendOtp}
        >
          Gửi lại OTP
        </Button>
      </Card>
    </Box>
  );
}
