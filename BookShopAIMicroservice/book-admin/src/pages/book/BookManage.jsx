// import React, { useEffect, useState } from "react";
// import { Table, Button, Popconfirm, message, Input, Tag } from "antd";
// import { useNavigate } from "react-router-dom";
// import bookApi from "../../api/bookApi";
// import { Image } from "antd";
// const { Search } = Input;

// const BookManage = () => {
//   const [books, setBooks] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   // ✅ dùng messageApi
//   const [messageApi, contextHolder] = message.useMessage();

//   useEffect(() => {
//     fetchBooks();
//   }, []);

//   const fetchBooks = async () => {
//     setLoading(true);
//     try {
//       const res = await bookApi.getAll();
//       setBooks(res.data.data || res.data);
//     } catch (err) {
//       messageApi.error(err.response?.data?.message || "Lỗi khi tải danh sách sách");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       const res = await bookApi.delete(id);
//       messageApi.success(res.data?.message || "Xoá sách thành công");
//       fetchBooks();
//     } catch (err) {
//       messageApi.error(err.response?.data?.message || "Xoá sách thất bại");
//     }
//   };

//   const handleSearch = async (value) => {
//     if (!value) {
//       fetchBooks();
//       return;
//     }
//     try {
//       const res = await bookApi.search(value);
//       setBooks(res.data.data || res.data);
//       messageApi.success(res.data?.message || "Tìm kiếm thành công");
//     } catch (err) {
//       messageApi.error(err.response?.data?.message || "Lỗi khi tìm kiếm");
//     }
//   };

//   return (
//     <div>
//       {/* để message hiển thị */}
//       {contextHolder}

//       <div style={{ marginBottom: 16, display: "flex", gap: "12px" }}>
//         <Button type="primary" onClick={() => navigate("/books/create")}>
//           Thêm sách
//         </Button>
//         <Search
//           placeholder="Tìm theo tên sách"
//           onSearch={handleSearch}
//           style={{ maxWidth: 300 }}
//         />
//       </div>

//       <Table
//         rowKey="id"
//         dataSource={books}
//         loading={loading}
//         bordered
//         columns={[
//           { title: "ID", dataIndex: "id" },
//           {
//             title: "Ảnh",//dung antd Image để có thể zoom ảnh
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
//           //thêm dấu ... vào giữa nếu tên sách quá dài, in đậm, đầy đủ khi hover
//           { title: "Tên sách", dataIndex: "title", render: (title) => (
//               <span style={{ fontWeight: "bold" }} title={title}>
//                 {title.length > 20 ? `${title.slice(0, 20)}...` : title}
//               </span>
//             ),
//           },
//           //thêm màu sắc cho giá
//           { title: "Giá", dataIndex: "price", render: (price) => <span style={{ color: "red" }}>{price?.toLocaleString() + " đ"}</span>, },
//           { title: "Kho", dataIndex: "stock" },
//           { title: "Đã bán", dataIndex: "saleQuantity" },
//           {
//             title: "Trạng thái",
//             dataIndex: "status",
//             render: (status) => (
//               status === 1 ? (
//                 <Tag color="green">Hiển thị</Tag>
//               ) : status === 0 ? (
//                 <Tag color="orange">Ẩn</Tag>
//               ) : (
//                 <Tag color="red">Ngừng kinh doanh</Tag>
//               )
//             ),
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
import { Table, Button, Popconfirm, message, Input, Tag, Select } from "antd";
import { useNavigate } from "react-router-dom";
import bookApi from "../../api/bookApi";
import { Image } from "antd";

const { Search } = Input;

const BookManage = () => {
  const [books, setBooks] = useState([]);
  const [displayedBooks, setDisplayedBooks] = useState([]); // danh sách sau khi lọc
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

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
      <div style={{ marginBottom: 16, display: "flex", gap: "12px", alignItems: "center" }}>
        <Button type="primary" onClick={() => navigate("/books/create")}>
          Thêm sách
        </Button>

        <Search
          placeholder="Tìm theo tên sách"
          onSearch={handleSearch}
          style={{ maxWidth: 300 }}
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

        {/* Tổng số sách */}
        <div style={{ marginLeft: "auto", fontWeight: 600 }}>
          Tổng số sách: {displayedBooks.length}
        </div>
      </div>

      {/* TABLE */}
      <Table
        rowKey="id"
        dataSource={displayedBooks}
        loading={loading}
        bordered
        columns={[
          { title: "ID", dataIndex: "id" },

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
                />
              ),
          },

          {
            title: "Tên sách",
            dataIndex: "title",
            render: (title) => (
              <span style={{ fontWeight: "bold" }} title={title}>
                {title.length > 20 ? `${title.slice(0, 20)}...` : title}
              </span>
            ),
          },

          {
            title: "Giá",
            dataIndex: "price",
            render: (price) => (
              <span style={{ color: "red" }}>
                {price?.toLocaleString() + " đ"}
              </span>
            ),
          },

          { title: "Kho", dataIndex: "stock" },
          { title: "Đã bán", dataIndex: "saleQuantity" },

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
          },

          {
            title: "Thao tác",
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
