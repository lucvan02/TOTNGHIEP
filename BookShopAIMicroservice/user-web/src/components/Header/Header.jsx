import * as React from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Button,
  Typography,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { categoryApi } from "../../api/categoryApi";
import { getToken, logOut } from "../../api/localStorageService";
import { useCart } from "../../context/CartContext";

export default function Header() {
  const navigate = useNavigate();
  const [categories, setCategories] = React.useState([]);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [menuCategoryEl, setMenuCategoryEl] = React.useState(null);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  // const { cartCount, clear, refreshCart } = useCart();
  const { cartCount, totalQty, clear, refreshCart } = useCart();

  React.useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
    const loadCategories = async () => {
      try {
        const res = await categoryApi.getAll();
        setCategories(res.data.data);
      } catch (e) {
        console.error(e);
      }
    };
    loadCategories();
    if (token) refreshCart();
  }, []);

  const handleLogout = () => {
    logOut();
    setIsLoggedIn(false);
    clear();
    navigate("/login");
  };

  return (
    <>
      <Box sx={{ mb: 5 }} />
      <AppBar position="fixed" sx={{ backgroundColor: "#19add2" }}>
        <Toolbar>
          <IconButton onClick={() => navigate("/")} color="inherit">
            <MenuBookIcon sx={{ fontSize: 30 }} />
          </IconButton>

          <Button color="inherit" onClick={() => navigate("/")}>
            Trang chủ
          </Button>
          <Button color="inherit" onClick={() => navigate("/about")}>
            Giới thiệu
          </Button>
          <Button
            color="inherit"
            onClick={(e) => setMenuCategoryEl(e.currentTarget)}
          >
            Thể loại
          </Button>

          <Box sx={{ flexGrow: 1 }} />

          {!isLoggedIn ? (
            <Button color="inherit" onClick={() => navigate("/login")}>
              Đăng nhập
            </Button>
          ) : (
            <>
              <IconButton color="inherit" onClick={() => navigate("/cart")}>
                <Badge
                  badgeContent={cartCount}
                  color="error"
                  invisible={cartCount === 0}
                >

                {/* <Badge badgeContent={totalQty} color="error"> */}

                  <ShoppingCartIcon />
                </Badge>

                

                {/* <Tooltip title={`${totalQty} cuốn sách trong giỏ`}>
                  <Badge badgeContent={cartCount} color="error" invisible={cartCount === 0}>
                    <ShoppingCartIcon />
                  </Badge>
                </Tooltip> */}
              </IconButton>

              <IconButton
                color="inherit"
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                <AccountCircle />
              </IconButton>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={menuCategoryEl}
        open={Boolean(menuCategoryEl)}
        onClose={() => setMenuCategoryEl(null)}
      >
        {categories.map((cat) => (
          <MenuItem
            key={cat.id}
            onClick={() => {
              navigate(`/category/${cat.id}`);
              setMenuCategoryEl(null);
            }}
          >
            {cat.name}
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => navigate("/profile")}>Thông tin cá nhân</MenuItem>
        <MenuItem onClick={() => navigate("/orders")}>Lịch sử mua hàng</MenuItem>
        <MenuItem onClick={() => navigate("/favorites")}>Sách yêu thích</MenuItem>
        <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
      </Menu>
    </>
  );
}
