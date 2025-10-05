import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { clearToken } from "../../api/localStorageService";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6">📚 BookShop</Typography>
        <Button color="inherit" onClick={handleLogout}>
          Đăng xuất
        </Button>
      </Toolbar>
    </AppBar>
  );
}
