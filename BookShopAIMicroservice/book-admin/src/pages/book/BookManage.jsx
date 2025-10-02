import React, { useEffect, useState } from "react";
import { Table, Button, Popconfirm, message, Input, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import bookApi from "../../api/bookApi";

const { Search } = Input;

const BookManage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ dùng messageApi
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await bookApi.getAll();
      setBooks(res.data.data || res.data);
    } catch (err) {
      messageApi.error(err.response?.data?.message || "Lỗi khi tải danh sách sách");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await bookApi.delete(id);
      messageApi.success(res.data?.message || "Xoá sách thành công");
      fetchBooks();
    } catch (err) {
      messageApi.error(err.response?.data?.message || "Xoá sách thất bại");
    }
  };

  const handleSearch = async (value) => {
    if (!value) {
      fetchBooks();
      return;
    }
    try {
      const res = await bookApi.search(value);
      setBooks(res.data.data || res.data);
      messageApi.success(res.data?.message || "Tìm kiếm thành công");
    } catch (err) {
      messageApi.error(err.response?.data?.message || "Lỗi khi tìm kiếm");
    }
  };

  return (
    <div>
      {/* để message hiển thị */}
      {contextHolder}

      <div style={{ marginBottom: 16, display: "flex", gap: "12px" }}>
        <Button type="primary" onClick={() => navigate("/books/create")}>
          Thêm sách
        </Button>
        <Search
          placeholder="Tìm theo tên sách"
          onSearch={handleSearch}
          style={{ maxWidth: 300 }}
        />
      </div>

      <Table
        rowKey="id"
        dataSource={books}
        loading={loading}
        bordered
        columns={[
          { title: "ID", dataIndex: "id" },
          {
            title: "Ảnh",
            dataIndex: "image",
            render: (img) =>
              img && (
                <img
                  src={img}
                  alt="book"
                  width={60}
                  style={{ borderRadius: 4 }}
                />
              ),
          },
          { title: "Tên sách", dataIndex: "title" },
          { title: "Giá", dataIndex: "price" },
          { title: "Kho", dataIndex: "stock" },
          { title: "Đã bán", dataIndex: "saleQuantity" },
          {
            title: "Trạng thái",
            dataIndex: "status",
            render: (status) => (
              status === 1 ? (
                <Tag color="green">Hiển thị</Tag>
              ) : status === 0 ? (
                <Tag color="orange">Ẩn</Tag>
              ) : (
                <Tag color="red">Ngừng kinh doanh</Tag>
              )
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
