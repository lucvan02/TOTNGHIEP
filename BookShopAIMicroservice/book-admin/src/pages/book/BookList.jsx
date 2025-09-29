// import React, { useEffect, useState } from "react";
// import { Table, Button, Popconfirm, Input, Space, message } from "antd";
// import { getAllBooks, deleteBook, searchBooks } from "../api/bookApi";
// import { useNavigate } from "react-router-dom";

// const BookList = () => {
//   const [books, setBooks] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [keyword, setKeyword] = useState("");
//   const navigate = useNavigate();

//   const fetchBooks = async () => {
//     setLoading(true);
//     try {
//       const res = await getAllBooks();
//       setBooks(res.data.data || []);
//     } catch (err) {
//       message.error("Failed to load books");
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchBooks();
//   }, []);

//   const handleDelete = async (id) => {
//     try {
//       await deleteBook(id);
//       message.success("Deleted successfully");
//       fetchBooks();
//     } catch (err) {
//       message.error("Delete failed");
//     }
//   };

//   const handleSearch = async () => {
//     if (!keyword) return fetchBooks();
//     try {
//       const res = await searchBooks(keyword);
//       setBooks(res.data.data || []);
//     } catch {
//       message.error("Search failed");
//     }
//   };

//   const columns = [
//     { title: "ID", dataIndex: "id" },
//     { title: "Title", dataIndex: "title" },
//     { title: "Price", dataIndex: "price" },
//     { title: "Stock", dataIndex: "stock" },
//     {
//       title: "Actions",
//       render: (_, record) => (
//         <Space>
//           <Button type="primary" onClick={() => navigate(`/edit/${record.id}`)}>
//             Edit
//           </Button>
//           <Popconfirm
//             title="Are you sure?"
//             onConfirm={() => handleDelete(record.id)}
//           >
//             <Button danger>Delete</Button>
//           </Popconfirm>
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Book Management</h2>

//       <Space style={{ marginBottom: 20 }}>
//         <Input
//           placeholder="Search by title..."
//           value={keyword}
//           onChange={(e) => setKeyword(e.target.value)}
//         />
//         <Button onClick={handleSearch}>Search</Button>
//         <Button type="primary" onClick={() => navigate("/create")}>
//           Add Book
//         </Button>
//       </Space>

//       <Table
//         columns={columns}
//         dataSource={books}
//         rowKey="id"
//         loading={loading}
//       />
//     </div>
//   );
// };

// export default BookList;



import React, { useEffect, useState } from "react";
import { Table, Button, Popconfirm, Input, Space, message, Image } from "antd";
import { getAllBooks, deleteBook, searchBooks } from "../../api/bookApi";
import { useNavigate } from "react-router-dom";

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await getAllBooks();
      setBooks(res.data.data || []);
    } catch (err) {
      message.error("Failed to load books");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteBook(id);
      message.success("Deleted successfully");
      fetchBooks();
    } catch (err) {
      message.error("Delete failed");
    }
  };

  const handleSearch = async () => {
    if (!keyword) return fetchBooks();
    try {
      const res = await searchBooks(keyword);
      setBooks(res.data.data || []);
    } catch {
      message.error("Search failed");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id" },
    {
      title: "Image",
      dataIndex: "image",
      render: (url) =>
        url ? <Image src={`http://localhost:8083${url}`} width={50} /> : "No image",
    },
    { title: "Title", dataIndex: "title" },
    { title: "Price", dataIndex: "price" },
    { title: "Stock", dataIndex: "stock" },
    
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => navigate(`/books/edit/${record.id}`)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger>Xoá</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Quản lý sách</h2>

      <Space style={{ marginBottom: 20 }}>
        <Input
          placeholder="Tìm kiếm theo tiêu đề..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Button onClick={handleSearch}>Tìm kiếm</Button>
        <Button type="primary" onClick={() => navigate("/books/add")}>
          Thêm sách
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={books}
        rowKey="id"
        loading={loading}
      />
    </div>
  );
};

export default BookList;
