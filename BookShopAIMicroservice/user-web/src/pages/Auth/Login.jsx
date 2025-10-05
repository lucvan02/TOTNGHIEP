import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { authApi } from "../../api/authApi";
import { setToken } from "../../api/localStorageService";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

    const [messageApi, contextHolder] = message.useMessage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authApi.login(form);
      messageApi.success(res.data.message);
      setToken(res.data.data);
      navigate("/profile");
    } catch {
      messageApi.error("Đăng nhập thất bại");
    }
  };

  
  const handleClick = () => {
    const googleAuthUrl = `${OAuthConfig.authUri}?client_id=${OAuthConfig.clientId}&redirect_uri=${OAuthConfig.redirectUri}&response_type=code&scope=openid%20email%20profile`;
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
      }}
    >
      {contextHolder}
      <Card sx={{ width: 400, p: 3 }}>
        <CardContent>
          <Typography variant="h5" textAlign="center" mb={2}>
            Đăng nhập
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Tên đăng nhập"
              name="username"
              fullWidth
              margin="normal"
              onChange={(e) =>
                setForm((f) => ({ ...f, username: e.target.value }))
              }
            />
            <TextField
              label="Mật khẩu"
              type="password"
              fullWidth
              margin="normal"
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
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
            {/* quên mật khẩu */}
            <Button variant="text" fullWidth onClick={() => navigate("/forgot-password")}>
              Quên mật khẩu?
            </Button>
            <Button
              variant="text"
              color="secondary"
              fullWidth
              sx={{ mt: 1 }}
              onClick={() => navigate("/register")}
            >
              Chưa có tài khoản? Đăng ký
            </Button>

           
            <Button
              variant="outlined"
              color="error"
              fullWidth
              sx={{ mt: 2 }}
              href={`https://accounts.google.com/o/oauth2/v2/auth?client_id=124223479536-3bn4fvk4us52otg229jqq0etjp296s5s.apps.googleusercontent.com&redirect_uri=http://localhost:3000/authenticate&response_type=code&scope=openid%20email%20profile`}
              // onClick={handleClick}
            >
              Đăng nhập với Google
            </Button>
          </Box>

          
        </CardContent>
      </Card>
    </Box>
  );
}
