
// import React, { useEffect, useState } from "react";
// import { Table, Button, Popconfirm, message, Input, Tag, Select } from "antd";
// import { useNavigate } from "react-router-dom";
// import bookApi from "../../api/bookApi";
// import { Image } from "antd";

// const { Search } = Input;

// const BookManage = () => {
//   const [books, setBooks] = useState([]);
//   const [displayedBooks, setDisplayedBooks] = useState([]); // danh sách sau khi lọc
//   const [loading, setLoading] = useState(false);
//   const [statusFilter, setStatusFilter] = useState("ALL");

//   const navigate = useNavigate();
//   const [messageApi, contextHolder] = message.useMessage();

//   useEffect(() => {
//     fetchBooks();
//   }, []);

//   // ==================================================
//   // FETCH
//   // ==================================================
//   const fetchBooks = async () => {
//     setLoading(true);
//     try {
//       const res = await bookApi.getAll();
//       const data = res.data.data || res.data;

//        // 👉 SORT MỚI NHẤT LÊN TRÊN theo id
//       data.sort((a, b) => b.id - a.id);

//       setBooks(data);
//       setDisplayedBooks(data); 
//     } catch (err) {
//       messageApi.error(err.response?.data?.message || "Lỗi khi tải danh sách sách");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ==================================================
//   // DELETE
//   // ==================================================
//   const handleDelete = async (id) => {
//     try {
//       const res = await bookApi.delete(id);
//       messageApi.success(res.data?.message || "Xoá sách thành công");
//       fetchBooks();
//     } catch (err) {
//       messageApi.error(err.response?.data?.message || "Xoá sách thất bại");
//     }
//   };

//   // ==================================================
//   // SEARCH
//   // ==================================================
//   const handleSearch = async (value) => {
//     if (!value) {
//       applyFilter(statusFilter, books);
//       return;
//     }
//     try {
//       const res = await bookApi.search(value);
//       const data = res.data.data || res.data;
//       applyFilter(statusFilter, data); // vẫn lọc theo trạng thái
//     } catch (err) {
//       messageApi.error(err.response?.data?.message || "Lỗi khi tìm kiếm");
//     }
//   };

//   // ==================================================
//   // FILTER THEO TRẠNG THÁI
//   // ==================================================
//   const applyFilter = (status, source) => {
//     let arr = [...source];

//     if (status !== "ALL") {
//       const statusNumber =
//         status === "ACTIVE" ? 1 :
//         status === "HIDDEN" ? 0 :
//         status === "STOP" ? 2 : null;

//       arr = arr.filter((b) => b.status === statusNumber);
//     }

//     setDisplayedBooks(arr);
//   };

//   const handleStatusChange = (value) => {
//     setStatusFilter(value);
//     applyFilter(value, books);
//   };

//   return (
//     <div>
//       {contextHolder}

//       {/* Header row */}
//       <div style={{ marginBottom: 16, display: "flex", gap: "12px", alignItems: "center" }}>
//         <Button type="primary" onClick={() => navigate("/books/create")}>
//           Thêm sách
//         </Button>

//         <Search
//           placeholder="Tìm theo tên sách"
//           onSearch={handleSearch}
//           style={{ maxWidth: 300 }}
//         />

//         {/* Bộ lọc trạng thái */}
//         <Select
//           value={statusFilter}
//           onChange={handleStatusChange}
//           style={{ width: 180 }}
//           options={[
//             { value: "ALL", label: "Tất cả trạng thái" },
//             { value: "ACTIVE", label: "Hiển thị" },
//             { value: "HIDDEN", label: "Ẩn" },
//             { value: "STOP", label: "Ngừng kinh doanh" },
//           ]}
//         />

//         {/* Tổng số sách */}
//         <div style={{ marginLeft: "auto", fontWeight: 600 }}>
//           Tổng số sách: {displayedBooks.length}
//         </div>
//       </div>

//       {/* TABLE */}
//       <Table
//         rowKey="id"
//         dataSource={displayedBooks}
//         loading={loading}
//         bordered
//         columns={[
//           { title: "ID", dataIndex: "id" },

//           {
//             title: "Ảnh",
//             dataIndex: "image",
//             render: (img) =>
//               img && (
//                 <Image
//                   src={img}
//                   alt="book"
//                   width={60}
//                   style={{ borderRadius: 4 }}
//                 />
//               ),
//           },

//           {
//             title: "Tên sách",
//             dataIndex: "title",
//             render: (title) => (
//               <span style={{ fontWeight: "bold" }} title={title}>
//                 {title.length > 20 ? `${title.slice(0, 20)}...` : title}
//               </span>
//             ),
//           },

//           {
//             title: "Giá",
//             dataIndex: "price",
//             render: (price) => (
//               <span style={{ color: "red" }}>
//                 {price?.toLocaleString() + " đ"}
//               </span>
//             ),
//           },

//           { title: "Kho", dataIndex: "stock" },
//           { title: "Đã bán", dataIndex: "saleQuantity" },

//           {
//             title: "Trạng thái",
//             dataIndex: "status",
//             render: (status) =>
//               status === 1 ? (
//                 <Tag color="green">Hiển thị</Tag>
//               ) : status === 0 ? (
//                 <Tag color="orange">Ẩn</Tag>
//               ) : (
//                 <Tag color="red">Ngừng kinh doanh</Tag>
//               ),
//           },

//           {
//             title: "Thao tác",
//             render: (_, record) => (
//               <>
//                 <Button
//                   size="small"
//                   type="link"
//                   onClick={() => navigate(`/books/detail/${record.id}`)}
//                 >
//                   Sửa
//                 </Button>

//                 <Popconfirm
//                   title="Bạn có chắc chắn muốn xóa?"
//                   onConfirm={() => handleDelete(record.id)}
//                 >
//                   <Button size="small" type="link" danger>
//                     Xóa
//                   </Button>
//                 </Popconfirm>
//               </>
//             ),
//           },
//         ]}
//       />
//     </div>
//   );
// };

// export default BookManage;

















import React, { useEffect, useState } from "react";
import { Table, Button, Popconfirm, message, Input, Tag, Select, Space, Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import bookApi from "../../api/bookApi";
import recoApi from "../../api/recoApi";
import { Image } from "antd";
import { ThunderboltOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons"; 

const { Search } = Input;

const BookManage = () => {
  const [books, setBooks] = useState([]);
  const [displayedBooks, setDisplayedBooks] = useState([]); // danh sách sau khi lọc
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [training, setTraining] = useState(false);        // 👉 trạng thái train
  const [lastTrainedAt, setLastTrainedAt] = useState(null); // 👉 thời điểm train gần nhất

  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetchBooks();
  }, []);

  // ==================================================
  // FETCH
  // ==================================================
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await bookApi.getAll();
      const data = res.data.data || res.data;

       // 👉 SORT MỚI NHẤT LÊN TRÊN theo id
      data.sort((a, b) => b.id - a.id);

      setBooks(data);
      setDisplayedBooks(data); 
    } catch (err) {
      messageApi.error(err.response?.data?.message || "Lỗi khi tải danh sách sách");
    } finally {
      setLoading(false);
    }
  };


   // ==================================================
  // TRAIN (reload vectors)
  // ==================================================
  const handleTrain = async () => {
    setTraining(true);
    try {
      const res = await recoApi.reload();
      const count = res?.data?.books ?? undefined;
      messageApi.success(
        count !== undefined ? `Đã train xong vectors cho ${count} sách.` : "Đã train xong dữ liệu gợi ý."
      );
      setLastTrainedAt(new Date());
    } catch (err) {
      messageApi.error(err.response?.data?.detail || "Train thất bại. Kiểm tra service FastAPI /cbf/reload.");
    } finally {
      setTraining(false);
    }
  };

  // ==================================================
  // DELETE
  // ==================================================
  const handleDelete = async (id) => {
    try {
      const res = await bookApi.delete(id);
      messageApi.success(res.data?.message || "Xoá sách thành công");
      fetchBooks();
    } catch (err) {
      messageApi.error(err.response?.data?.message || "Xoá sách thất bại");
    }
  };

  // ==================================================
  // SEARCH
  // ==================================================
  const handleSearch = async (value) => {
    if (!value) {
      applyFilter(statusFilter, books);
      return;
    }
    try {
      const res = await bookApi.search(value);
      const data = res.data.data || res.data;
      applyFilter(statusFilter, data); // vẫn lọc theo trạng thái
    } catch (err) {
      messageApi.error(err.response?.data?.message || "Lỗi khi tìm kiếm");
    }
  };

  // ==================================================
  // FILTER THEO TRẠNG THÁI
  // ==================================================
  const applyFilter = (status, source) => {
    let arr = [...source];

    if (status !== "ALL") {
      const statusNumber =
        status === "ACTIVE" ? 1 :
        status === "HIDDEN" ? 0 :
        status === "STOP" ? 2 : null;

      arr = arr.filter((b) => b.status === statusNumber);
    }

    setDisplayedBooks(arr);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    applyFilter(value, books);
  };

  return (
    <div>
      {contextHolder}

      {/* Header row */}
      <div style={{ marginBottom: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <Space wrap>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/books/create")}>
            Thêm sách
          </Button>

          {/* 👉 Nút Train dữ liệu (reload vectors) */}
          <Tooltip title="Reload vocab + vectors của hệ gợi ý (FastAPI /cbf/reload)">
            <Button
              icon={<ThunderboltOutlined />}
              loading={training}
              onClick={handleTrain}
              disabled={loading}
            >
              Train dữ liệu
            </Button>
          </Tooltip>

          {/* Optional: refresh danh sách sách */}
          <Button icon={<ReloadOutlined />} onClick={fetchBooks} disabled={loading || training}>
            Làm mới danh sách
          </Button>
        </Space>

        <Search
          placeholder="Tìm theo tên sách"
          onSearch={handleSearch}
          style={{ maxWidth: 300 }}
          allowClear
        />

        {/* Bộ lọc trạng thái */}
        <Select
          value={statusFilter}
          onChange={handleStatusChange}
          style={{ width: 180 }}
          options={[
            { value: "ALL", label: "Tất cả trạng thái" },
            { value: "ACTIVE", label: "Hiển thị" },
            { value: "HIDDEN", label: "Ẩn" },
            { value: "STOP", label: "Ngừng kinh doanh" },
          ]}
        />

        {/* Tổng số sách + lần train gần nhất */}
        <div style={{ marginLeft: "auto", fontWeight: 600 }}>
          Tổng số sách: {displayedBooks.length}
          {lastTrainedAt && (
            <span style={{ fontWeight: 400, marginLeft: 12 }}>
              • Train gần nhất: {lastTrainedAt.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* TABLE */}
      <Table
        rowKey="id"
        dataSource={displayedBooks}
        loading={loading}
        bordered
        columns={[
          { title: "ID", dataIndex: "id", width: 80 },

          {
            title: "Ảnh",
            dataIndex: "image",
            render: (img) =>
              img && (
                <Image
                  src={img}
                  alt="book"
                  width={60}
                  style={{ borderRadius: 4 }}
                  placeholder
                />
              ),
            width: 90,
          },

          {
            title: "Tên sách",
            dataIndex: "title",
            render: (title) => (
              <span style={{ fontWeight: 600 }} title={title}>
                {title?.length > 40 ? `${title.slice(0, 40)}…` : title}
              </span>
            ),
            ellipsis: true,
          },

          {
            title: "Giá",
            dataIndex: "price",
            render: (price) => <span style={{ color: "red" }}>{(price ?? 0).toLocaleString()} đ</span>,
            width: 140,
          },

          { title: "Kho", dataIndex: "stock", width: 90 },
          { title: "Đã bán", dataIndex: "saleQuantity", width: 110 },

          {
            title: "Trạng thái",
            dataIndex: "status",
            render: (status) =>
              status === 1 ? (
                <Tag color="green">Hiển thị</Tag>
              ) : status === 0 ? (
                <Tag color="orange">Ẩn</Tag>
              ) : (
                <Tag color="red">Ngừng kinh doanh</Tag>
              ),
            width: 160,
          },

          {
            title: "Thao tác",
            fixed: "right",
            width: 140,
            render: (_, record) => (
              <>
                <Button
                  size="small"
                  type="link"
                  onClick={() => navigate(`/books/detail/${record.id}`)}
                >
                  Sửa
                </Button>

                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa?"
                  okText="Xóa"
                  cancelText="Hủy"
                  onConfirm={() => handleDelete(record.id)}
                >
                  <Button size="small" type="link" danger>
                    Xóa
                  </Button>
                </Popconfirm>
              </>
            ),
          },
        ]}
      />
    </div>
  );
};

export default BookManage;