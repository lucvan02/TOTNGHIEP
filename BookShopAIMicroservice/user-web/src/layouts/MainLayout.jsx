// src/layouts/MainLayout.jsx
import Header from "../components/Header/Header";

import { Outlet } from "react-router-dom";

import ChatWidget from "../components/chat/ChatWidget";


export default function MainLayout() {
  return (
    <>
      <Header />
      <ChatWidget />
      <Outlet />
    </>
  );
}
