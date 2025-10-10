import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import VerifyOtp from "../pages/Auth/VerifyOtp";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ChangePass from "../pages/Auth/ChangePass";
import Profile from "../pages/Auth/Profile";
import Home from "../pages/Home/Home";
import BookDetail from "../pages/Book/BookDetail";
import Authenticate from "../pages/Auth/Authenticate";
import Cart from "../pages/Cart/Cart";
import MainLayout from "../layouts/MainLayout";
import OrderHistory from "../pages/Orders/OrderHistory";
import OrderDetail from "../pages/Orders/OrderDetail";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔹 Các trang KHÔNG có header */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/change-pass" element={<ChangePass />} />
        <Route path="/authenticate" element={<Authenticate />} />

        {/* 🔹 Các trang CÓ header */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
        </Route>

        <Route path="*" element={<h2>404 Not Found</h2>} />
      </Routes>
    </BrowserRouter>
  );
}
