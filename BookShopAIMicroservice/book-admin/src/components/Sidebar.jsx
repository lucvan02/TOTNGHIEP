import { Layout, Menu } from "antd";
import {
  BarChartOutlined,
  BookOutlined,
  TeamOutlined,
  UserOutlined,
  FileTextOutlined,
  ShopOutlined,
  LogoutOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";

const { Sider } = Layout;

const Sidebar = () => {
  const location = useLocation();

  return (
    <Sider collapsible>
      <div
        style={{
          // height: 64,
          // margin: 16,
          textAlign: "center",
          color: "white",
          fontWeight: "bold",
          fontSize: 18,
        }}
      >
        📚 Admin
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={["sub-products"]}
      >
        {/* Dashboard */}
        <Menu.Item key="/statistics" icon={<BarChartOutlined />}>
          <Link to="/statistics">Thống kê</Link>
        </Menu.Item>

        {/* Quản lý sản phẩm */}
        <Menu.SubMenu
          key="sub-products"
          icon={<BookOutlined />}
          title="Quản lý sản phẩm"
        >
          <Menu.Item key="/receipts" icon={<FileTextOutlined />}>
            <Link to="/receipts">Lịch sử nhập</Link>
          </Menu.Item>
          <Menu.Item key="/books" icon={<AppstoreOutlined />}>
            <Link to="/books">Quản lý sách</Link>
          </Menu.Item>
          <Menu.Item key="/authors" icon={<UserOutlined />}>
            <Link to="/authors">Quản lý tác giả</Link>
          </Menu.Item>
          <Menu.Item key="/categories" icon={<AppstoreOutlined />}>
            <Link to="/categories">Quản lý thể loại</Link>
          </Menu.Item>
          <Menu.Item key="/publishers" icon={<TeamOutlined />}>
            <Link to="/publishers">Quản lý nhà xuất bản</Link>
          </Menu.Item>
        </Menu.SubMenu>

        {/* Quản lý đơn hàng */}
        <Menu.Item key="/orders" icon={<ShopOutlined />}>
          <Link to="/orders">Quản lý đơn hàng</Link>
        </Menu.Item>

        {/* Quản lý người dùng */}
        {/* <Menu.Item key="/users" icon={<UserOutlined />}>
          <Link to="/users">Quản lý người dùng</Link>
        </Menu.Item> */}

        {/* Đăng xuất */}
        <Menu.Item key="/logout" icon={<LogoutOutlined />}>
          <Link to="/login">Đăng xuất</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Sidebar;
