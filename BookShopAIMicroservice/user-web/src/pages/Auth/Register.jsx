import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  TextField,
  Typography,
  Divider,
} from "@mui/material";
import { useState } from "react";
import { authApi } from "../../api/authApi";
import { message } from "antd";
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
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authApi.register(form);
      messageApi.success(res.data.message);
      navigate("/verify-otp", { state: { email: form.email } });
    } catch {
      messageApi.error("Đăng ký thất bại");
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
      <Card sx={{ width: 400, boxShadow: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" textAlign="center" gutterBottom>
            Tạo tài khoản mới
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            {["username", "password", "email", "firstname", "lastname", "phone"].map(
              (f) => (
                <TextField
                  key={f}
                  label={f}
                  name={f}
                  type={f === "password" ? "password" : "text"}
                  fullWidth
                  margin="normal"
                  value={form[f]}
                  onChange={handleChange}
                />
              )
            )}
            <Button type="submit" variant="contained" fullWidth color="success">
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
