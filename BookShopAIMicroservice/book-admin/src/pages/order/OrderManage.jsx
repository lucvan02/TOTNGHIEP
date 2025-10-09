import { useEffect, useMemo, useState } from "react";
import {
  Table, Tag, Space, Button, Select, Typography, message,
  Drawer, Descriptions, Divider, Popconfirm, Switch, Input, Flex
} from "antd";
import { EyeOutlined, ReloadOutlined, CheckOutlined, CarOutlined, SmileOutlined, StopOutlined } from "@ant-design/icons";
import { OrderApi } from "../../api/orderApi"
const { Title, Text } = Typography;
const { Option } = Select;

const STATUS_OPTIONS = ["PENDING", "CONFIRM", "SHIPPED", "COMPLETED", "CANCELLED"];
const STATUS_COLOR = {
  PENDING: "gold",
  CONFIRM: "geekblue",
  SHIPPED: "processing",
  COMPLETED: "green",
  CANCELLED: "red",
};
const money = (n) => (n ?? 0).toLocaleString("vi-VN") + " ₫";
const fmtDt = (s) => (s ? new Date(s).toLocaleString("vi-VN") : "");

export default function OrderManage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState(); // filter
  const [drawer, setDrawer] = useState({ open: false, order: null });
  const [searchText, setSearchText] = useState(""); // search by UUID

  const load = async () => {
    try {
      setLoading(true);
      const res = await OrderApi.list(status);
      // API: ApiResponse<List<Order>>
      setRows(res.data.data || []);
    } catch (e) {
      console.error(e);
      message.error("Không tải được danh sách đơn");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status]);

  const openDetail = async (orderId) => {
    try {
      const res = await OrderApi.detail(orderId);
      setDrawer({ open: true, order: res.data.data });
    } catch (e) {
      message.error("Không lấy được chi tiết đơn");
    }
  };

  const updateStatus = async (order, next) => {
    try {
      await OrderApi.updateStatus(order.id, next, undefined);
      message.success(`Đã cập nhật trạng thái: ${next}`);
      await load();
      // refresh drawer if open
      if (drawer.open && drawer.order?.id === order.id) {
        const res = await OrderApi.detail(order.id);
        setDrawer({ open: true, order: res.data.data });
      }
    } catch (e) {
      message.error(e?.response?.data?.message || "Cập nhật trạng thái thất bại");
    }
  };

  const cancelOrder = async (order) => {
    const reason = prompt("Lý do hủy đơn:");
    try {
      await OrderApi.updateStatus(order.id, "CANCELLED", reason || "");
      message.success("Đã hủy đơn");
      await load();
      if (drawer.open && drawer.order?.id === order.id) {
        const res = await OrderApi.detail(order.id);
        setDrawer({ open: true, order: res.data.data });
      }
    } catch (e) {
      message.error(e?.response?.data?.message || "Hủy đơn thất bại");
    }
  };

  const togglePayment = async (order, checked) => {
    try {
      await OrderApi.setPayment(order.id, checked);
      message.success(checked ? "Đã ghi nhận thanh toán" : "Đã chuyển về chưa thanh toán");
      await load();
      if (drawer.open && drawer.order?.id === order.id) {
        const res = await OrderApi.detail(order.id);
        setDrawer({ open: true, order: res.data.data });
      }
    } catch (e) {
      message.error("Không cập nhật được trạng thái thanh toán");
    }
  };

  const filteredRows = useMemo(() => {
    if (!searchText) return rows;
    return rows.filter((r) => (r.id || "").toLowerCase().includes(searchText.trim().toLowerCase()));
  }, [rows, searchText]);

  const columns = [
    {
      title: "Mã đơn (UUID)",
      dataIndex: "id",
      render: (v) => <Text code>{v}</Text>,
      width: 300,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s) => <Tag color={STATUS_COLOR[s] || "default"}>{s}</Tag>,
      filters: STATUS_OPTIONS.map((s) => ({ text: s, value: s })),
      onFilter: (val, rec) => rec.status === val,
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentStatus",
      render: (paid) => (paid ? <Tag color="green">ĐÃ THANH TOÁN</Tag> : <Tag>CHƯA</Tag>),
    },
    { title: "Phương thức", dataIndex: "paymentMethod", width: 120 },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      align: "right",
      render: (n) => <b>{money(n)}</b>,
      width: 140,
    },
    { title: "Tạo lúc", dataIndex: "createdAt", render: fmtDt, width: 170 },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 320,
      render: (_, order) => {
        const canConfirm = order.status === "PENDING";
        const canShip = order.status === "CONFIRM";
        const canComplete = order.status === "SHIPPED";
        const canCancel = !["COMPLETED", "CANCELLED"].includes(order.status);

        return (
          <Space wrap>
            <Button size="small" icon={<EyeOutlined />} onClick={() => openDetail(order.id)}>
              Xem
            </Button>

            <Switch
              size="small"
              checked={order.paymentStatus}
              onChange={(c) => togglePayment(order, c)}
              checkedChildren="Paid"
              unCheckedChildren="Unpaid"
            />

            <Button size="small" icon={<CheckOutlined />} disabled={!canConfirm}
                    onClick={() => updateStatus(order, "CONFIRM")}>Duyệt</Button>

            <Button size="small" icon={<CarOutlined />} disabled={!canShip}
                    onClick={() => updateStatus(order, "SHIPPED")}>Giao</Button>

            <Button size="small" icon={<SmileOutlined />} disabled={!canComplete}
                    onClick={() => updateStatus(order, "COMPLETED")}>Hoàn tất</Button>

            <Popconfirm
              title="Hủy đơn?"
              description="Bạn chắc chắn muốn hủy đơn này?"
              onConfirm={() => cancelOrder(order)}
              okText="Hủy"
              cancelText="Không"
              disabled={!canCancel}
            >
              <Button size="small" danger icon={<StopOutlined />} disabled={!canCancel}>
                Hủy
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Title level={4} style={{ marginBottom: 16 }}>Quản lý đơn hàng</Title>

      <Flex gap={8} wrap style={{ marginBottom: 12 }}>
        <Select
          allowClear
          placeholder="Lọc theo trạng thái"
          style={{ width: 220 }}
          value={status}
          onChange={setStatus}
        >
          {STATUS_OPTIONS.map((s) => (
            <Option key={s} value={s}>{s}</Option>
          ))}
        </Select>

        <Input.Search
          placeholder="Tìm theo UUID"
          allowClear
          style={{ width: 320 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <Button icon={<ReloadOutlined />} onClick={load}>Tải lại</Button>
      </Flex>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={filteredRows}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        scroll={{ x: 1100 }}
      />

      <Drawer
        title={
          <Space direction="vertical" size={0}>
            <div>Chi tiết đơn</div>
            <Text type="secondary" style={{ fontFamily: "monospace" }}>{drawer.order?.id}</Text>
          </Space>
        }
        width={820}
        open={drawer.open}
        onClose={() => setDrawer({ open: false, order: null })}
      >
        {drawer.order && (
          <>
            <Space size="small" wrap style={{ marginBottom: 8 }}>
              <Tag color={STATUS_COLOR[drawer.order.status] || "default"}>{drawer.order.status}</Tag>
              {drawer.order.paymentStatus ? <Tag color="green">ĐÃ THANH TOÁN</Tag> : <Tag>CHƯA THANH TOÁN</Tag>}
              <Tag>PM: {drawer.order.paymentMethod || "-"}</Tag>
              <Tag color="blue">Tổng: {money(drawer.order.total)}</Tag>
              <Tag>Ship: {money(drawer.order.shippingFee)}</Tag>
              <Tag>Ngày tạo: {fmtDt(drawer.order.createdAt)}</Tag>
            </Space>

            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Người nhận" span={1}>{drawer.order.receiveName}</Descriptions.Item>
              <Descriptions.Item label="SĐT" span={1}>{drawer.order.receivePhone}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>{drawer.order.receiveAddress}</Descriptions.Item>
              {drawer.order.note && (
                <Descriptions.Item label="Ghi chú" span={2}>{drawer.order.note}</Descriptions.Item>
              )}
            </Descriptions>

            <Divider />

            <Title level={5}>Sản phẩm</Title>
            <Table
              size="small"
              rowKey="id"
              pagination={false}
              dataSource={drawer.order.items || []}
              columns={[
                {
                  title: "Ảnh",
                  dataIndex: "bookImage",
                  render: (src) => <img src={src} alt="" style={{ width: 46, height: 46, objectFit: "cover", borderRadius: 6 }} />,
                  width: 70
                },
                { title: "Tên sách", dataIndex: "bookTitle" },
                { title: "Giá", dataIndex: "price", align: "right", render: money, width: 120 },
                { title: "SL", dataIndex: "quantity", align: "right", width: 80 },
                { title: "Thành tiền", dataIndex: "total", align: "right", render: money, width: 140 },
              ]}
            />
          </>
        )}
      </Drawer>
    </div>
  );
}
