// // src/pages/admin/UserManage.jsx
// import React, { useEffect, useState } from "react";
// import { Table, Tag, message, Avatar } from "antd";
// import { UserOutlined } from "@ant-design/icons";
// import userApi from "../../api/userApi";

// const UserManage = () => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [messageApi, contextHolder] = message.useMessage();

//   const fetchUsers = async () => {
//     setLoading(true);
//     try {
//       const res = await userApi.getAllAdminUsers();
//       const data = res.data.data || res.data; // ApiResponse<List<UserResponseDto>>
//       setUsers(data || []);
//     } catch (err) {
//       console.error(err);
//       messageApi.error(
//         err?.response?.data?.message || "Lỗi khi tải danh sách người dùng"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const columns = [
//     {
//       title: "UID",
//       dataIndex: "uid",
//       key: "uid",
//       width: 220,
//       ellipsis: true,
//     },
//     {
//       title: "Khách hàng",
//       key: "name",
//       width: 260,
//       render: (_, record) => {
//         const fullName =
//           `${record.firstname || ""} ${record.lastname || ""}`.trim() ||
//           record.username;
//         return (
//           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//             <Avatar
//               src={record.avatar || undefined}
//               icon={!record.avatar && <UserOutlined />}
//             />
//             <div>
//               <div style={{ fontWeight: 500 }}>{fullName}</div>
//               <div style={{ fontSize: 12, color: "#888" }}>
//                 @{record.username}
//               </div>
//             </div>
//           </div>
//         );
//       },
//     },
//     {
//       title: "Email",
//       dataIndex: "email",
//       key: "email",
//       width: 220,
//     },
//     {
//       title: "SĐT",
//       dataIndex: "phone",
//       key: "phone",
//       width: 140,
//     },
//     {
//       title: "Vai trò",
//       dataIndex: "role",
//       key: "role",
//       width: 100,
//       render: (role) =>
//         role === "ADMIN" ? (
//           <Tag color="red">ADMIN</Tag>
//         ) : (
//           <Tag color="blue">USER</Tag>
//         ),
//     },
//     {
//       title: "Trạng thái",
//       dataIndex: "active",
//       key: "active",
//       width: 120,
//       render: (active) =>
//         active ? (
//           <Tag color="green">Hoạt động</Tag>
//         ) : (
//           <Tag color="red">Đã khóa</Tag>
//         ),
//     },
//   ];

//   return (
//     <div>
//       {contextHolder}
//       <h2 style={{ marginBottom: 16 }}>Danh sách khách hàng</h2>
//       <Table
//         rowKey="uid"
//         loading={loading}
//         columns={columns}
//         dataSource={users}
//         pagination={false} // TẠM THỜI không phân trang
//         bordered
//       />
//     </div>
//   );
// };

// export default UserManage;














// import React, { useEffect, useState } from "react";
// import { Table, Tag, message, Avatar, Button } from "antd";
// import {
//   UserOutlined,
//   LockOutlined,
//   UnlockOutlined,
// } from "@ant-design/icons";
// import userApi from "../../api/userApi";

// const UserManage = () => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [messageApi, contextHolder] = message.useMessage();

//   const fetchUsers = async () => {
//     setLoading(true);
//     try {
//       const res = await userApi.getAllAdminUsers();
//       const data = res.data.data || res.data; // ApiResponse<List<UserResponseDto>>
//       setUsers(data || []);
//     } catch (err) {
//       console.error(err);
//       messageApi.error(
//         err?.response?.data?.message || "Lỗi khi tải danh sách người dùng"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const handleLockUnlock = async (record) => {
//     try {
//       if (record.active) {
//         await userApi.lockUser(record.uid);
//         messageApi.success("Đã khóa tài khoản");
//       } else {
//         await userApi.unlockUser(record.uid);
//         messageApi.success("Đã mở khóa tài khoản");
//       }
//       fetchUsers();
//     } catch (err) {
//       console.error(err);
//       messageApi.error(
//         err?.response?.data?.message || "Thao tác thất bại"
//       );
//     }
//   };

//   const columns = [
//     {
//       title: "UID",
//       dataIndex: "uid",
//       key: "uid",
//       width: 255,
//       ellipsis: true,
//     },
//     {
//       title: "Khách hàng",
//       key: "name",
//       width: 260,
//       render: (_, record) => {
//         const fullName =
//           `${record.firstname || ""} ${record.lastname || ""}`.trim() ||
//           record.username;
//         return (
//           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//             <Avatar
//               src={record.avatar || undefined}
//               icon={!record.avatar && <UserOutlined />}
//             />
//             <div>
//               <div style={{ fontWeight: 500 }}>{fullName}</div>
//               <div style={{ fontSize: 12, color: "#888" }}>
//                 @{record.username}
//               </div>
//             </div>
//           </div>
//         );
//       },
//     },
//     {
//       title: "Email",
//       dataIndex: "email",
//       key: "email",
//       width: 220,
//     },
//     {
//       title: "SĐT",
//       dataIndex: "phone",
//       key: "phone",
//       width: 140,
//     },
//     {
//       title: "Trạng thái",
//       dataIndex: "active",
//       key: "active",
//       width: 120,
//       render: (active) =>
//         active ? (
//           <Tag color="green">Hoạt động</Tag>
//         ) : (
//           <Tag color="red">Đã khóa</Tag>
//         ),
//     },
//     {
//       title: "Khóa / Mở",
//       key: "actions",
//       width: 160,
//       render: (_, record) => (
//         <Button
//           type={record.active ? "default" : "primary"}
//           danger={record.active}
//           icon={record.active ? <LockOutlined /> : <UnlockOutlined />}
//           onClick={() => handleLockUnlock(record)}
//         >
//           {record.active ? "Khóa" : "Mở khóa"}
//         </Button>
//       ),
//     },
//   ];

//   return (
//     <div>
//       {contextHolder}
//       <h2 style={{ marginBottom: 16 }}>Danh sách khách hàng</h2>
//       <Table
//         rowKey="uid"
//         loading={loading}
//         columns={columns}
//         dataSource={users}
//         pagination={false}
//         bordered
//       />
//     </div>
//   );
// };

// export default UserManage;
















// src/pages/admin/UserManage.jsx

import React, { useEffect, useState } from "react";
import { Table, Tag, message, Avatar, Button, Modal } from "antd";
import {
  UserOutlined,
  LockOutlined,
  UnlockOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import userApi from "../../api/userApi";
import  { adminOrderApi } from "../../api/orderApi";

const money = (n) =>
  (n ?? 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "₫";

const UserManage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // modal đơn hàng
  const [ordersVisible, setOrdersVisible] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // ================= LOAD USERS =================
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userApi.getAllAdminUsers();
      const data = res.data.data || res.data;
      setUsers(data || []);
    } catch (err) {
      messageApi.error("Lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ================= KHÓA / MỞ =================
  const handleLockUnlock = async (record) => {
    try {
      if (record.active) {
        await userApi.lockUser(record.uid);
        messageApi.success("Đã khóa tài khoản");
      } else {
        await userApi.unlockUser(record.uid);
        messageApi.success("Đã mở khóa tài khoản");
      }
      fetchUsers();
    } catch (err) {
      messageApi.error("Thao tác thất bại");
    }
  };

  // ================= XEM ĐƠN HÀNG =================
  const openOrdersModal = async (record) => {
    setSelectedUser(record);
    setOrdersVisible(true);
    setOrders([]);
    setOrdersLoading(true);

    try {
      const res = await adminOrderApi.getHistoryByUser(record.uid); // ⭐ API mới
      const data = res.data.data || res.data;
      setOrders(data || []);
    } catch (err) {
      messageApi.error("Lỗi khi tải đơn hàng của khách");
    } finally {
      setOrdersLoading(false);
    }
  };

  // ================= COLUMNS =================
  const columns = [
    {
      title: "UID",
      dataIndex: "uid",
      key: "uid",
      width: 220,
      ellipsis: true,
    },
    {
      title: "Khách hàng",
      key: "name",
      width: 260,
      render: (_, record) => {
        const fullName =
          `${record.firstname || ""} ${record.lastname || ""}`.trim() ||
          record.username;

        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar
              src={record.avatar || undefined}
              icon={!record.avatar && <UserOutlined />}
            />
            <div>
              <div style={{ fontWeight: 500 }}>{fullName}</div>
              <div style={{ fontSize: 12, color: "#888" }}>
                @{record.username}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      width: 230,
    },
    {
      title: "SĐT",
      dataIndex: "phone",
      width: 140,
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      width: 120,
      render: (active) =>
        active ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Đã khóa</Tag>
        ),
    },
    {
      title: "Khóa / Mở",
      key: "lock",
      width: 150,
      render: (_, record) => (
        <Button
          type={record.active ? "default" : "primary"}
          danger={record.active}
          icon={record.active ? <LockOutlined /> : <UnlockOutlined />}
          onClick={() => handleLockUnlock(record)}
        >
          {record.active ? "Khóa" : "Mở"}
        </Button>
      ),
    },
    {
      title: "Đơn hàng",
      key: "orders",
      width: 140,
      render: (_, record) => (
        <Button
          icon={<FileTextOutlined />}
          onClick={() => openOrdersModal(record)}
        >
          Xem
        </Button>
      ),
    },
  ];

  // COLS ORDER
  const orderColumns = [
    {
      title: "Mã đơn",
      dataIndex: "code",
      width: 180,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      width: 150,
      render: (v) => money(v),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 140,
      render: (v) => <Tag>{v}</Tag>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      width: 180,
      render: (v) =>
        v ? new Date(v).toLocaleString("vi-VN") : "",
    },
  ];

  const fullNameSelected =
    selectedUser &&
    (
      `${selectedUser.firstname || ""} ${
        selectedUser.lastname || ""
      }`.trim() || selectedUser.username
    );

  return (
    <div>
      {contextHolder}
      <h2 style={{ marginBottom: 16 }}>Danh sách khách hàng</h2>

      <Table
        rowKey="uid"
        loading={loading}
        columns={columns}
        dataSource={users}
        pagination={false}
        bordered
      />

      <Modal
        open={ordersVisible}
        onCancel={() => setOrdersVisible(false)}
        footer={null}
        width={900}
        title={`Đơn hàng của ${fullNameSelected || ""}`}
      >
        <Table
          rowKey={(row) => row.id || row.code}
          loading={ordersLoading}
          columns={orderColumns}
          dataSource={orders}
          pagination={false}
          size="small"
          bordered
        />
      </Modal>
    </div>
  );
};

export default UserManage;
