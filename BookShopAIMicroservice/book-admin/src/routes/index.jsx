import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";

import Login from "../pages/auth/Login";
import Statistics from "../pages/statistics/Statistics";
// import BookManage from "../pages/book/BookManage";
import AuthorManage from "../pages/author/AuthorManage";
import CategoryManage from "../pages/category/CategoryManage";
import PublisherManage from "../pages/publisher/PublisherManage";
import ReceiptManage from "../pages/recepit/ReceiptManage";
import OrderManage from "../pages/order/OrderManage";
// import UserManage from "../pages/user/UserManage";
// import BookList from "../pages/book/BookList";
// import BookForm from "../pages/book/BookForm";
import BookManage from "../pages/book/BookManage";
import BookFormPage from "../pages/book/BookFormPage";
import BookDetail from "../pages/book/BookDetail";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="/" element={<AdminLayout />}>
        <Route path="statistics" element={<Statistics />} />
        <Route path="authors" element={<AuthorManage />} />
        {/* <Route path="books" element={<BookList />} /> */}
        <Route path="books" element={<BookManage />} />
        <Route path="books/create" element={<BookFormPage />} />
        <Route path="books/edit/:id" element={<BookFormPage />} />
        <Route path="books/detail/:id" element={<BookDetail />} />
        {/* <Route path="books/add" element={<BookForm />} /> */}
        {/* <Route path="books/edit/:id" element={<BookForm />} /> */}

        <Route path="categories" element={<CategoryManage />} />
        <Route path="publishers" element={<PublisherManage />} />
        <Route path="receipts" element={<ReceiptManage />} />

        <Route path="orders" element={<OrderManage />} />
        {/* <Route path="users" element={<UserManage />} /> */}

        {/* Default route */}
        <Route index element={<Statistics />} />
        
      </Route>
    </Routes>
  );
};

export default AppRoutes;
