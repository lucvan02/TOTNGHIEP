import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  InputBase,
  Badge,
  MenuItem,
  Menu,
  Button,
  Typography,
} from "@mui/material";
// import SearchIcon from "@mui/icons-material/Search";
import AccountCircle from "@mui/icons-material/AccountCircle";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { useNavigate } from "react-router-dom";
import { getToken, logOut } from "../../api/localStorageService";
import { categoryApi } from "../../api/categoryApi";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

export default function Header() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [menuCategoryEl, setMenuCategoryEl] = React.useState(null);
  const [categories, setCategories] = React.useState([]);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  const isMenuOpen = Boolean(anchorEl);
  const isCategoryOpen = Boolean(menuCategoryEl);

  React.useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
    // setIsLoggedIn(!!localStorage.getItem("user"));

    // Gọi API lấy danh sách thể loại
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getAll();
        setCategories(res.data.data);
      } catch (err) {
        console.error("Lỗi khi lấy thể loại:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleCategoryOpen = (event) => setMenuCategoryEl(event.currentTarget);
  const handleCategoryClose = () => setMenuCategoryEl(null);

  const handleLogout = () => {
    logOut();
    setIsLoggedIn(false);
    navigate("/login");
  };

  const menuId = "primary-search-account-menu";
  const renderProfileMenu = (
    <Menu
      anchorEl={anchorEl}
      open={isMenuOpen}
      onClose={handleMenuClose}
      PaperProps={{ sx: { mt: 1.5 } }}
    >
      <MenuItem onClick={() => navigate("/profile")}>Thông tin cá nhân</MenuItem>
      <MenuItem onClick={() => navigate("/orders")}>Lịch sử mua hàng</MenuItem>
      <MenuItem onClick={() => navigate("/favorites")}>Sách yêu thích</MenuItem>
      <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
    </Menu>
  );

  const renderCategoryMenu = (
    <Menu
      anchorEl={menuCategoryEl}
      open={isCategoryOpen}
      onClose={handleCategoryClose}
      PaperProps={{ sx: { mt: 1.5 } }}
    >
      {categories.map((cat) => (
        <MenuItem
          key={cat.id}
          onClick={() => {
            handleCategoryClose();
            navigate(`/category/${cat.id}`);
          }}
        >
          {cat.name}
        </MenuItem>
      ))}
    </Menu>
  );

  return (
    <>
      {/* cho header margin bottom de noi phan cach voi noi dung trang */}
      <Box sx={{ mb: 5 }}></Box>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="fixed" sx={{ backgroundColor: "#19add2ff" }}>
          <Toolbar>
            {/* Logo */}
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="logo"
              sx={{ mr: 2 }}
              onClick={() => navigate("/")}
            >
              <MenuBookIcon sx={{ fontSize: 30 }} />
            </IconButton>

            {/* Menu điều hướng */}
            <Box sx={{ display: "flex", gap: 3 }}>
              <Button color="inherit" onClick={() => navigate("/")}>
                Trang chủ
              </Button>
              <Button color="inherit" onClick={() => navigate("/about")}>
                Giới thiệu
              </Button>
              <Button color="inherit" onClick={handleCategoryOpen}>
                Thể loại
              </Button>
            </Box>

            {/* Search box */}
            {/* <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase placeholder="Tìm kiếm sách..." />
            </Search> */}

            <Box sx={{ flexGrow: 1 }} />

            {/* Nếu chưa đăng nhập */}
            {!isLoggedIn ? (
              <Button
                color="inherit"
                variant="outlined"
                onClick={() => navigate("/login")}
              >
                Đăng nhập
              </Button>
            ) : (
              //them icon gio hang ben canh icon nguoi dung

              <>
                <IconButton
                  size="large"
                  edge="end"
                  aria-label="cart"
                  color="inherit"
                  onClick={() => navigate("/cart")}
                >
                  <ShoppingCartIcon />
                </IconButton>

                <IconButton
                  size="large"
                  edge="end"
                  aria-controls={menuId}
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
              </>
            )}
          </Toolbar>
        </AppBar>

        {renderProfileMenu}
        {renderCategoryMenu}
      </Box>
    </>
  );
}
