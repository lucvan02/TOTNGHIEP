import { Table, Button } from "antd";
import dayjs from "dayjs";

const ReceiptTable = ({ receipts, loading, onShowDetail }) => (
  <Table
    rowKey="id"
    loading={loading}
    dataSource={receipts}
    bordered
    columns={[
      { title: "Mã phiếu", dataIndex: "id", width: "10%" },
      {
        title: "Ngày tạo",
        dataIndex: "createdAt",
        render: (val) => dayjs(val).format("DD/MM/YYYY HH:mm"),
      },
      {
        title: "Tổng tiền",
        dataIndex: "total",
        render: (val) => `${(val || 0).toLocaleString()} VND`,
      },
      {
        title: "Hành động",
        render: (_, record) => (
          <Button type="link" onClick={() => onShowDetail(record)}>
            Xem chi tiết
          </Button>
        ),
      },
    ]}
  />
);

export default ReceiptTable;
