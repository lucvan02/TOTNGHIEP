import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  InputNumber,
  Select,
  message,
} from "antd";
import receiptApi from "../../api/receiptApi";
import bookApi from "../../api/bookApi";
import dayjs from "dayjs"; // 📌 thêm thư viện format ngày

const { Option } = Select;

const ReceiptManage = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [selectedBooks, setSelectedBooks] = useState([]);
  const [bookOptions, setBookOptions] = useState([]);
  const [detailReceipt, setDetailReceipt] = useState(null);

  const [messageApi, contextHolder] = message.useMessage();

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await receiptApi.getAll();

      // 📌 Thêm tổng tiền cho mỗi phiếu nhập
      const data = (res.data || []).map((r) => ({
        ...r,
        totalAmount: r.receiptDetails?.reduce(
          (sum, d) => sum + d.quantity * d.importPrice,
          0
        ) || 0,
      }));

      setReceipts(data);
    } catch {
      messageApi.error("Không tải được dữ liệu phiếu nhập");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await bookApi.getAll();
      setBookOptions(res.data.data || res.data);
    } catch {
      messageApi.error("Không tải được danh sách sách");
    }
  };

  const openCreateModal = () => {
    setIsModalOpen(true);
    setSelectedBooks([]);
    fetchBooks();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleAddBook = (bookId) => {
    const book = bookOptions.find((b) => b.id === bookId);
    if (book && !selectedBooks.find((b) => b.id === bookId)) {
      setSelectedBooks([
        ...selectedBooks,
        { ...book, quantity: 1, importPrice: 0 },
      ]);
    }
  };

  const updateBookField = (id, field, value) => {
    setSelectedBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const handleSaveReceipt = async () => {
    if (selectedBooks.length === 0) {
      messageApi.warning("Chưa chọn sản phẩm nào!");
      return;
    }
    try {
      const receipt = {
        receiptDetails: selectedBooks.map((b) => ({
          bookId: b.id,
          quantity: b.quantity,
          importPrice: b.importPrice,
        })),
      };
      await receiptApi.create(receipt);
      messageApi.success("Thêm phiếu nhập thành công");
      fetchReceipts();
      setIsModalOpen(false);
    } catch {
      messageApi.error("Thêm phiếu nhập thất bại");
    }
  };

  const showDetail = async (record) => {
    try {
      const res = await receiptApi.getById(record.id);
      // 📌 Tính tổng tiền ở chi tiết
      const totalAmount =
        res.data.receiptDetails?.reduce(
          (sum, d) => sum + d.quantity * d.importPrice,
          0
        ) || 0;

      setDetailReceipt({ ...res.data, totalAmount });
      setIsDetailOpen(true);
    } catch {
      messageApi.error("Không tải được chi tiết phiếu nhập");
    }
  };

  return (
    <div>
      {contextHolder}
      <h2>Lịch sử nhập hàng</h2>
      <Button type="primary" onClick={openCreateModal} style={{ marginBottom: 16 }}>
        + Tạo phiếu nhập
      </Button>

      {/* Bảng danh sách phiếu nhập */}
      <Table
        rowKey="id"
        loading={loading}
        dataSource={receipts}
        columns={[
          { title: "Mã phiếu", dataIndex: "id", width: "10%" },
          {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            width: "25%",
            render: (val) => dayjs(val).format("DD/MM/YYYY HH:mm"),
          },
          {
            title: "Tổng tiền",
            dataIndex: "totalAmount",
            render: (val) => `${val.toLocaleString()} VND`,
          },
          {
            title: "Hành động",
            render: (_, record) => (
              <Button type="link" onClick={() => showDetail(record)}>
                Xem chi tiết
              </Button>
            ),
          },
        ]}
        bordered
      />

      {/* Modal tạo phiếu nhập */}
      <Modal
        title="Tạo phiếu nhập"
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleSaveReceipt}
        width={900}
        okText="Lưu phiếu nhập"
        cancelText="Hủy"
      >
        <Select
          showSearch
          placeholder="Tìm sản phẩm..."
          style={{ width: "100%", marginBottom: 16 }}
          onChange={handleAddBook}
          filterOption={(input, option) =>
            option?.children?.toLowerCase().includes(input.toLowerCase())
          }
        >
          {bookOptions.map((b) => (
            <Option key={b.id} value={b.id}>
              {b.title}
            </Option>
          ))}
        </Select>

        <Table
          rowKey="id"
          pagination={false}
          bordered
          dataSource={selectedBooks}
          columns={[
            { title: "Mã", dataIndex: "id", width: "5%" },
            {
              title: "Hình ảnh",
              dataIndex: "image",
              render: (img) =>
                img ? <img src={img} alt="" style={{ width: 50 }} /> : "No image",
            },
            { title: "Tên sản phẩm", dataIndex: "title" },
            { title: "Hiện có", dataIndex: "stock", width: "10%" },
            {
              title: "Nhập thêm",
              dataIndex: "quantity",
              render: (_, record) => (
                <InputNumber
                  min={1}
                  value={record.quantity}
                  onChange={(val) => updateBookField(record.id, "quantity", val)}
                />
              ),
            },
            {
              title: "Sau nhập",
              render: (_, record) => record.stock + record.quantity,
            },
            {
              title: "Giá nhập",
              dataIndex: "importPrice",
              render: (_, record) => (
                <InputNumber
                  min={0}
                  value={record.importPrice}
                  onChange={(val) =>
                    updateBookField(record.id, "importPrice", val)
                  }
                />
              ),
            },
            {
              title: "Thành tiền",
              render: (_, record) =>
                `${(record.quantity * record.importPrice).toLocaleString()} VND`,
            },
            {
              title: "Thao tác",
              render: (_, record) => (
                <Button danger onClick={() =>
                  setSelectedBooks(selectedBooks.filter((b) => b.id !== record.id))
                }>
                  Xóa
                </Button>
              ),
            },
          ]}
          summary={(pageData) => {
            const total = pageData.reduce(
              (sum, b) => sum + b.quantity * b.importPrice,
              0
            );
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={6}>Tổng cộng</Table.Summary.Cell>
                <Table.Summary.Cell colSpan={2}>
                  <b>{total.toLocaleString()} VND</b>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Modal>

      {/* Modal chi tiết phiếu nhập */}
      <Modal
        title={`Chi tiết phiếu nhập #${detailReceipt?.id}`}
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        footer={null}
        width={900}
      >
        <p><b>Ngày tạo:</b> {dayjs(detailReceipt?.createdAt).format("DD/MM/YYYY HH:mm")}</p>
        <p><b>Tổng tiền:</b> {detailReceipt?.totalAmount?.toLocaleString()} VND</p>

        <Table
          rowKey="id"
          bordered
          pagination={false}
          dataSource={detailReceipt?.receiptDetails || []}
          columns={[
            { title: "STT", render: (_, __, index) => index + 1, width: "5%" },
            {
              title: "Ảnh",
              render: (_, record) =>
                record.bookImage ? (
                  <img src={record.bookImage} alt="" style={{ width: 50 }} />
                ) : (
                  "No image"
                ),
            },
            { title: "Tên sản phẩm", dataIndex: "bookTitle" },
            { title: "Số lượng nhập", dataIndex: "quantity" },
            {
              title: "Giá nhập",
              dataIndex: "importPrice",
              render: (val) => `${val.toLocaleString()} VND`,
            },
            {
              title: "Thành tiền",
              render: (_, record) =>
                `${(record.quantity * record.importPrice).toLocaleString()} VND`,
            },
          ]}
          summary={(pageData) => {
            const total = pageData.reduce(
              (sum, b) => sum + b.quantity * b.importPrice,
              0
            );
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={5}>Tổng cộng</Table.Summary.Cell>
                <Table.Summary.Cell>
                  <b>{total.toLocaleString()} VND</b>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Modal>
    </div>
  );
};

export default ReceiptManage;
