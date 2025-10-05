
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { message } from "antd";
import { authApi } from "../../api/authApi";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    firstname: "",
    lastname: "",
    phone: "",
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authApi.register(form);
      if (res.data.message === "Tên đăng nhập đã tồn tại" || res.data.message === "Email đã tồn tại") {
  messageApi.error(res.data.message);
} else {
  messageApi.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực.");
setTimeout(() => {
  navigate("/verify-otp", { state: { email: form.email } });
}, 1000);
}

      // chuyển sang trang nhập OTP, truyền email
      // navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      messageApi.error("Đăng ký thất bại, vui lòng thử lại!");
    }
  };

  return (
    
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      sx={{
        backgroundImage: `url("/logo/login-book-bg.jpg")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {contextHolder}
      <Card sx={{ width: 400, boxShadow: 4, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" textAlign="center" mb={3}>
            Tạo tài khoản mới
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Tên đăng nhập"
              name="username"
              fullWidth
              margin="normal"
              required
              onChange={handleChange}
            />
            <TextField
              label="Mật khẩu"
              name="password"
              type="password"
              fullWidth
              margin="normal"
              required
              onChange={handleChange}
            />
            <TextField
              label="Email"
              name="email"
              fullWidth
              margin="normal"
              required
              onChange={handleChange}
            />
            <TextField
              label="Họ"
              name="firstname"
              fullWidth
              margin="normal"
              onChange={handleChange}
            />
            <TextField
              label="Tên"
              name="lastname"
              fullWidth
              margin="normal"
              onChange={handleChange}
            />
            <TextField
              label="Số điện thoại"
              name="phone"
              fullWidth
              margin="normal"
              onChange={handleChange}
            />

            <Button
              type="submit"
              variant="contained"
              color="success"
              fullWidth
              sx={{ mt: 2 }}
            >
              Đăng ký
            </Button>
          </Box>
        </CardContent>

        <CardActions>
          <Button fullWidth onClick={() => navigate("/login")}>
            Đã có tài khoản? Đăng nhập
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}
