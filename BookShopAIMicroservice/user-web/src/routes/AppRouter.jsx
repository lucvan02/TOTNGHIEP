import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import VerifyOtp from "../pages/Auth/VerifyOtp";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import Profile from "../pages/Auth/Profile";
import Home from "../pages/Home/Home";
import BookDetail from "../pages/Book/BookDetail";
import Authenticate from "../pages/Auth/Authenticate";


export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/" element={<Home />} />
        <Route path="/book/:id" element={<BookDetail />} />

        <Route path="/authenticate" element={<Authenticate />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<h2>404 Not Found</h2>} />

      </Routes>
    </BrowserRouter>
  );
}
