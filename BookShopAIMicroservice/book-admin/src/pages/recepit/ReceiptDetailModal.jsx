import { Modal, Table } from "antd";
import dayjs from "dayjs";

const ReceiptDetailModal = ({ receipt, onClose }) => {
  if (!receipt) return null;

  return (
    <Modal
      title={`Chi tiết phiếu nhập #${receipt.id}`}
      open={!!receipt}
      onCancel={onClose}
      footer={null}
      width={900}
    >
      <p>
        <b>Ngày tạo:</b> {dayjs(receipt.createdAt).format("DD/MM/YYYY HH:mm")}
      </p>
      <p>
        <b>Tổng tiền:</b> {(receipt.total || 0).toLocaleString()} VND
      </p>

      <Table
        rowKey="id"
        bordered
        pagination={false}
        dataSource={receipt.receiptDetails || []}
        columns={[
          { title: "STT", render: (_, __, index) => index + 1, width: "5%" },
          { title: "Hình ảnh", dataIndex: "bookImage", render: (val) => <img src={val} alt="book" style={{ width: 50 }} /> },
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
              <Table.Summary.Cell colSpan={4}>Tổng cộng</Table.Summary.Cell>
              <Table.Summary.Cell>
                <b>{total.toLocaleString()} VND</b>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
    </Modal>
  );
};

export default ReceiptDetailModal;
