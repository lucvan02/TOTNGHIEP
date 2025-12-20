// import { useEffect, useState } from "react";
// import { authApi } from "../../api/authApi";
// import { Card, Typography, Box } from "@mui/material";

// export default function Profile() {
//   const [user, setUser] = useState(null);

//   // useEffect(() => {
//   //   authApi.getProfile().then((res) => {
//   //     setUser(res.data.data);
//   //   });
//   // }, []);

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     }
//   }, []);

//   return (
//     <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
//       <Card sx={{ p: 4, width: 400 }}>
//         <Typography variant="h5" mb={2}>
//           Thông tin người dùng
//         </Typography>
//         {user ? (
//           <>
//             <Typography>Email: {user.email}</Typography>
//             <Typography>Họ tên: {user.firstname} {user.lastname}</Typography>
//             {/* <Typography>Vai trò: {user.role}</Typography> */}
//             {/* <Typography>Provider: {user.provider}</Typography> */}
//             Ảnh đại diện:
//             <Box mt={2} display="flex" justifyContent="center">
//               <img
//                 src={user.avatar}
//                 alt="Avatar"
//                 style={{ borderRadius: "50%", width: 100, height: 100 }}
//               />
//             </Box>
//           </>
//         ) : (
//           <Typography>Đang tải...</Typography>
//         )}
//       </Card>
//     </Box>
//   );
// }





import { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Box,
  Button,
  TextField,
  Avatar,
  Stack,
} from "@mui/material";
import { Edit, Lock, Upload } from "@mui/icons-material";
import { message } from "antd";
import { authApi } from "../../api/authApi";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setForm(parsed);
    }
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const res = await authApi.updateProfile(form);
      setUser(res.data.data);
      localStorage.setItem("user", JSON.stringify(res.data.data));
      messageApi.success("Cập nhật thông tin thành công!");
      setIsEditing(false);
    } catch (err) {
      messageApi.error("Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Giả lập upload ảnh — có thể thay bằng API thực tế
    const fakeUrl = URL.createObjectURL(file);
    setUser((prev) => ({ ...prev, avatar: fakeUrl }));
    // messageApi.info("Ảnh đại diện đã được thay đổi tạm thời!");
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="85vh"
      sx={{ backgroundColor: "#f9f9f9" }}
    >
      {contextHolder}
      <Card
        sx={{
          p: 4,
          width: 500,
          borderRadius: 4,
          boxShadow: 4,
          backgroundColor: "#fff",
        }}
      >
        <Typography variant="h5" mb={3} align="center" fontWeight="bold">
          👤 Thông tin người dùng
        </Typography>

        {user ? (
          <Stack spacing={2}>
            {/* Ảnh đại diện */}
            <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
              <Avatar
                src={user.avatar}
                sx={{ width: 120, height: 120, mb: 1 }}
              />
              <Button
                component="label"
                variant="outlined"
                size="small"
                startIcon={<Upload />}
              >
                Thay ảnh
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </Button>
            </Box>

            {/* Thông tin người dùng */}

            {/* thêm cột uid */}
            <TextField
              label="UID"
              name="uid"
              value={form.uid || ""}
              onChange={handleChange}
              fullWidth
              disabled
            />
            <TextField
              label="Email"
              name="email"
              value={form.email || ""}
              onChange={handleChange}
              fullWidth
              disabled
            />
            <TextField
              label="Họ"
              name="lastname"
              value={form.lastname || ""}
              onChange={handleChange}
              fullWidth
              disabled={!isEditing}
            />
            <TextField
              label="Tên"
              name="firstname"
              value={form.firstname || ""}
              onChange={handleChange}
              fullWidth
              disabled={!isEditing}
            />
            <TextField
              label="Số điện thoại"
              name="phone"
              value={form.phone || ""}
              onChange={handleChange}
              fullWidth
              disabled={!isEditing}
            />

            {/* Nút hành động */}
            <Stack direction="row" spacing={2} mt={2}>
              {isEditing ? (
                <>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleUpdate}
                    disabled={loading}
                  >
                    Lưu thay đổi
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      setIsEditing(false);
                      setForm(user);
                    }}
                  >
                    Hủy
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={() => setIsEditing(true)}
                  >
                    Cập nhật thông tin
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    startIcon={<Lock />}
                    onClick={() => messageApi.info("Tính năng đổi mật khẩu sắp ra mắt!")}
                  >
                    Đổi mật khẩu
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        ) : (
          <Typography align="center">Đang tải...</Typography>
        )}
      </Card>
    </Box>
  );
}
