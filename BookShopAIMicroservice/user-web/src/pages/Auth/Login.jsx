import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Divider,
} from "@mui/material";
import { useState } from "react";
import { message } from "antd";
import { authApi, setToken } from "../../api/authApi";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authApi.login(form);
      const { accessToken, user } = res.data.data;

      setToken(accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      messageApi.success("Đăng nhập thành công!");
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      messageApi.error("Sai tên đăng nhập hoặc mật khẩu");
    }
  };

  const handleGoogleLogin = () => {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=124223479536-3bn4fvk4us52otg229jqq0etjp296s5s.apps.googleusercontent.com&redirect_uri=http://localhost:3000/authenticate&response_type=code&scope=openid%20email%20profile`;
    window.location.href = googleAuthUrl;
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
            Đăng nhập tài khoản
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Tên đăng nhập"
              name="username"
              value={form.username}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Mật khẩu"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Đăng nhập
            </Button>

            <Button
              variant="text"
              fullWidth
              onClick={() => navigate("/forgot-password")}
            >
              Quên mật khẩu?
            </Button>

            <Divider sx={{ my: 2 }}>Hoặc</Divider>

            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={handleGoogleLogin}
            >
              Đăng nhập bằng Google
            </Button>

            <Typography textAlign="center" mt={2}>
              Chưa có tài khoản?{" "}
              <Button onClick={() => navigate("/register")}>Đăng ký ngay</Button>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
