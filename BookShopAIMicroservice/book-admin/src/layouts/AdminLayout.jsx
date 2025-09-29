import { Layout } from "antd";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const { Header, Content, Footer } = Layout;

const AdminLayout = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout>
        {/* <Header style={{ background: "#fff", paddingLeft: 20 }}>
          <h1 style={{ margin: 0 }}>Bookshop Admin</h1>
        </Header> */}
        <Content style={{ margin: "20px", background: "#fff", padding: 20 }}>
          <Outlet /> {/* nơi render page */}
        </Content>
        {/* <Footer style={{ textAlign: "center" }}>
          © {new Date().getFullYear()} Bookshop Admin
        </Footer> */}
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
