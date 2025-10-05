import { Modal, Table, Select, InputNumber, Button } from "antd";
import { useState } from "react";
import receiptApi from "../../api/receiptApi";
import { message } from "antd";

const { Option } = Select;

const ReceiptCreateModal = ({ open, onClose, books, onSuccess }) => {
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

  const handleAddBook = (bookId) => {
    const book = books.find((b) => b.id === bookId);
    if (book && !selectedBooks.find((b) => b.id === bookId)) {
      setSelectedBooks([...selectedBooks, { ...book, quantity: 1, importPrice: 0 }]);
    }
  };

  const updateBookField = (id, field, value) => {
    setSelectedBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const handleSave = async () => {
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
      onSuccess();
      onClose();
      setSelectedBooks([]);
    } catch {
      messageApi.error("Thêm phiếu nhập thất bại");
    }
  };

  return (
    <Modal
      title="Tạo phiếu nhập"
      open={open}
      onCancel={onClose}
      onOk={handleSave}
      width={900}
      okText="Lưu phiếu nhập"
      cancelText="Hủy"
    >
      {contextHolder}
      <Select
        showSearch
        placeholder="Tìm sản phẩm..."
        style={{ width: "100%", marginBottom: 16 }}
        onChange={handleAddBook}
        filterOption={(input, option) =>
          option?.children?.toLowerCase().includes(input.toLowerCase())
        }
      >
        {books.map((b) => (
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
          { title: "Hình ảnh", dataIndex: "image", render: (val) => <img src={val} alt="book" style={{ width: 50 }} /> },
          {
            title: "Tên sản phẩm",
            dataIndex: "title",
          },
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
            title: "Giá nhập",
            dataIndex: "importPrice",
            render: (_, record) => (
              <InputNumber
                min={0}
                value={record.importPrice}
                onChange={(val) => updateBookField(record.id, "importPrice", val)}
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
              <Button
                danger
                onClick={() =>
                  setSelectedBooks(selectedBooks.filter((b) => b.id !== record.id))
                }
              >
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
              <Table.Summary.Cell colSpan={5}>Tổng cộng</Table.Summary.Cell>
              <Table.Summary.Cell colSpan={2}>
                <b>{total.toLocaleString()} VND</b>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
    </Modal>
  );
};

export default ReceiptCreateModal;
