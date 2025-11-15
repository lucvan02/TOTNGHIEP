import { useEffect, useMemo, useState } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Typography,
  message,
  Drawer,
  Descriptions,
  Divider,
  Switch,
  Input,
  Modal,
  Radio,
} from "antd";
import {
  EyeOutlined,
  ReloadOutlined,
  CheckOutlined,
  CarOutlined,
  SmileOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { adminOrderApi } from "../../api/orderApi";

const { Title, Text } = Typography;


const STATUS_LABEL = {
  PENDING: "Chờ xác nhận",
  CONFIRM: "Đã xác nhận",
  SHIPPED: "Đang giao",
  COMPLETED: "Đã hoàn tất",
  CANCELLED: "Đã hủy",
};


const STATUS_COLOR = {
  PENDING: "gold",
  CONFIRM: "geekblue",
  SHIPPED: "processing",
  COMPLETED: "green",
  CANCELLED: "red",
};

// Các trạng thái được phép hủy
const CANCELLABLE = new Set(["PENDING", "CONFIRM", "SHIPPED"]);

const money = (n) => (n ?? 0).toLocaleString("vi-VN") + " ₫";
const fmtDt = (s) => (s ? new Date(s).toLocaleString("vi-VN") : "");

/* ================= component ================= */
export default function OrderManage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState(); // filter nếu cần dùng ngoài
  const [searchText, setSearchText] = useState("");

  const [drawer, setDrawer] = useState({ open: false, order: null });

  // Cancel modal state
  const [cancelModal, setCancelModal] = useState({
    open: false,
    order: null,
    reasonType: "OUT_OF_STOCK",
    other: "",
  });

  const load = async () => {
    try {
      setLoading(true);
      const res = await adminOrderApi.list(status); // ApiResponse<List<Order>>
      setRows(res.data.data || []);
    } catch (e) {
      console.error(e);
      message.error("Không tải được danh sách đơn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const openDetail = async (orderId) => {
    try {
      const res = await adminOrderApi.detail(orderId);
      setDrawer({ open: true, order: res.data.data });
    } catch (e) {
      message.error("Không lấy được chi tiết đơn");
    }
  };
  const closeDetail = () => setDrawer({ open: false, order: null });

  const refreshDrawerIfSame = async (orderId) => {
    if (drawer.open && drawer.order?.id === orderId) {
      const res = await adminOrderApi.detail(orderId);
      setDrawer({ open: true, order: res.data.data });
    }
  };

  const updateStatus = async (order, next) => {
    try {
      await adminOrderApi.updateStatus(order.id, next, undefined);
      message.success(`Đã cập nhật trạng thái: ${STATUS_LABEL[next] || next}`);
      await load();
      await refreshDrawerIfSame(order.id);
    } catch (e) {
      message.error(e?.response?.data?.message || "Cập nhật trạng thái thất bại");
    }
  };

  const togglePayment = async (order, checked) => {
    try {
      await adminOrderApi.setPayment(order.id, checked);
      message.success(checked ? "Đã ghi nhận thanh toán" : "Đã chuyển về chưa thanh toán");
      await load();
      await refreshDrawerIfSame(order.id);
    } catch {
      message.error("Không cập nhật được trạng thái thanh toán");
    }
  };

  // ====== Cancel flow ======
  const openCancelModal = (order) =>
    setCancelModal({ open: true, order, reasonType: "OUT_OF_STOCK", other: "" });
  const closeCancelModal = () =>
    setCancelModal({ open: false, order: null, reasonType: "OUT_OF_STOCK", other: "" });

  const submitCancel = async () => {
    const { order, reasonType, other } = cancelModal;
    const map = {
      OUT_OF_STOCK: "Hết hàng",
      INVALID_INFO: "Thông tin không hợp lệ",
      OTHER: other?.trim() || "Lý do khác",
    };
    const reason = reasonType === "OTHER" ? map.OTHER : map[reasonType];

    try {
      await adminOrderApi.updateStatus(order.id, "CANCELLED", reason);
      message.success("Đã hủy đơn và gửi email cho khách");
      closeCancelModal();
      await load();
      await refreshDrawerIfSame(order.id);
    } catch (e) {
      message.error(e?.response?.data?.message || "Hủy đơn thất bại");
    }
  };

  const filteredRows = useMemo(() => {
    if (!searchText) return rows;
    return rows.filter((r) =>
      (r.id || "").toLowerCase().includes(searchText.trim().toLowerCase())
    );
  }, [rows, searchText]);

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "id",
      render: (v) => <Text code>{v}</Text>,
      width: 220,
    },
    { title: "Người nhận", dataIndex: "receiveName", width: 100 },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s) => <Tag color={STATUS_COLOR[s] || "default"}>{STATUS_LABEL[s] || s}</Tag>,
      filters: Object.entries(STATUS_LABEL).map(([code, label]) => ({
        text: label,
        value: code,
      })),
      onFilter: (val, rec) => rec.status === val,
      width: 100,
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentStatus",
      render: (paid) => (paid ? <Tag color="green">ĐÃ THANH TOÁN</Tag> : <Tag>CHƯA THANH TOÁN</Tag>),
      width: 100,
    },
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
      width: 420,
      render: (_, order) => {
        const canConfirm = order.status === "PENDING";
        const canShip = order.status === "CONFIRM";
        const canComplete = order.status === "SHIPPED";
        const canCancel = CANCELLABLE.has(order.status); // cho phép hủy: PENDING/CONFIRM/SHIPPED

        return (
          <Space wrap>
            <Button size="small" icon={<EyeOutlined />} onClick={() => openDetail(order.id)}>
              Xem
            </Button>

            <Switch
              size="small"
              checked={order.paymentStatus}
              onChange={(c) => togglePayment(order, c)}
              checkedChildren="Đã thanh toán"
              unCheckedChildren="Chưa thanh toán"
            />

            <Button
              size="small"
              icon={<CheckOutlined />}
              disabled={!canConfirm}
              onClick={() => updateStatus(order, "CONFIRM")}
            >
              Duyệt
            </Button>

            <Button
              size="small"
              icon={<CarOutlined />}
              disabled={!canShip}
              onClick={() => updateStatus(order, "SHIPPED")}
            >
              Giao
            </Button>

            <Button
              size="small"
              icon={<SmileOutlined />}
              disabled={!canComplete}
              onClick={() => updateStatus(order, "COMPLETED")}
            >
              Hoàn tất
            </Button>

            <Button
              size="small"
              danger
              icon={<StopOutlined />}
              disabled={!canCancel}
              onClick={() => openCancelModal(order)}
            >
              Hủy
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Title level={4} style={{ marginBottom: 16 }}>
        Quản lý đơn hàng
      </Title>

      <Space wrap style={{ marginBottom: 12 }}>
        <Input.Search
          placeholder="Tìm theo mã đơn"
          allowClear
          style={{ width: 340 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <Button icon={<ReloadOutlined />} onClick={load}>
          Tải lại
        </Button>
      </Space>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={filteredRows}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        scroll={{ x: 1180 }}
      />

      {/* Drawer detail */}
      <Drawer
        title={
          <Space direction="vertical" size={0}>
            <div>Chi tiết đơn</div>
            <Text type="secondary" style={{ fontFamily: "monospace" }}>
              {drawer.order?.id}
            </Text>
          </Space>
        }
        width={820}
        open={drawer.open}
        onClose={closeDetail}
      >
        {drawer.order && (
          <>
            <Space size="small" wrap style={{ marginBottom: 8 }}>
              <Tag color={STATUS_COLOR[drawer.order.status] || "default"}>
                {STATUS_LABEL[drawer.order.status] || drawer.order.status}
              </Tag>
              {drawer.order.paymentStatus ? (
                <Tag color="green">ĐÃ THANH TOÁN</Tag>
              ) : (
                <Tag>CHƯA THANH TOÁN</Tag>
              )}
              <Tag>PM: {drawer.order.paymentMethod || "-"}</Tag>
              <Tag color="blue">Tổng: {money(drawer.order.total)}</Tag>
              <Tag>Ship: {money(drawer.order.shippingFee)}</Tag>
              <Tag>Ngày tạo: {fmtDt(drawer.order.createdAt)}</Tag>
              <Tag>Cập nhật: {fmtDt(drawer.order.updatedAt)}</Tag>
            </Space>

            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Người nhận" span={1}>
                {drawer.order.receiveName}
              </Descriptions.Item>
              <Descriptions.Item label="SĐT" span={1}>
                {drawer.order.receivePhone}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>
                {drawer.order.receiveAddress}
              </Descriptions.Item>
              {drawer.order.note && (
                <Descriptions.Item label="Ghi chú" span={2}>
                  {drawer.order.note}
                </Descriptions.Item>
              )}
              {drawer.order.cancelReason && (
                <Descriptions.Item label="Lý do hủy" span={2}>
                  {drawer.order.cancelReason}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider />

            <Title level={5} style={{ marginBottom: 8 }}>
              Sản phẩm
            </Title>
            <Table
              size="small"
              rowKey="id"
              pagination={false}
              dataSource={drawer.order.items || []}
              columns={[
                {
                  title: "Ảnh",
                  dataIndex: "bookImage",
                  width: 70,
                  render: (src) => (
                    <img
                      src={src}
                      alt=""
                      style={{ width: 46, height: 46, objectFit: "cover", borderRadius: 6 }}
                    />
                  ),
                },
                { title: "Tên sách", dataIndex: "bookTitle" },
                { title: "Giá", dataIndex: "price", align: "right", width: 120, render: money },
                { title: "SL", dataIndex: "quantity", align: "right", width: 80 },
                { title: "Thành tiền", dataIndex: "total", align: "right", width: 140, render: money },
              ]}
            />
          </>
        )}
      </Drawer>

      {/* Cancel modal */}
      <Modal
        title="Hủy đơn hàng"
        open={cancelModal.open}
        okText="Hủy đơn"
        okButtonProps={{ danger: true }}
        onOk={submitCancel}
        onCancel={closeCancelModal}
      >
        <Radio.Group
          value={cancelModal.reasonType}
          onChange={(e) =>
            setCancelModal((s) => ({ ...s, reasonType: e.target.value }))
          }
        >
          <Space direction="vertical">
            <Radio value="OUT_OF_STOCK">Hết hàng</Radio>
            <Radio value="INVALID_INFO">Thông tin không hợp lệ</Radio>
            <Radio value="OTHER">Lý do khác</Radio>
          </Space>
        </Radio.Group>

        {cancelModal.reasonType === "OTHER" && (
          <Input.TextArea
            autoSize={{ minRows: 3 }}
            placeholder="Nhập lý do hủy..."
            style={{ marginTop: 10 }}
            value={cancelModal.other}
            onChange={(e) =>
              setCancelModal((s) => ({ ...s, other: e.target.value }))
            }
          />
        )}

        <div style={{ marginTop: 12 }}>
          <Text type="secondary">
            Khi xác nhận, hệ thống sẽ gửi email thông báo hủy đơn cho khách hàng.
          </Text>
        </div>
      </Modal>
    </div>
  );
}
