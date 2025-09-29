import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Popconfirm,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import publisherApi from "../../api/publisherApi";

const PublisherManage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState(null);
  const [form] = Form.useForm();

  const [messageApi, contextHolder] = message.useMessage();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await publisherApi.getAll();
      setData(res.data.data || res.data);
    } catch (err) {
      messageApi.error("Không tải được dữ liệu nhà xuất bản");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (record = null) => {
    setEditingPublisher(record);
    setIsModalOpen(true);
    if (record) form.setFieldsValue(record);
    else form.resetFields();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingPublisher(null);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      let res;
      if (editingPublisher) {
        res = await publisherApi.update(editingPublisher.id, values);
      } else {
        res = await publisherApi.create(values);
      }
      messageApi.success(res.data.message || "Lưu NXB thành công");
      fetchData();
      handleCancel();
    } catch (err) {
      messageApi.error(err.response?.data?.message || "Lưu NXB thất bại");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await publisherApi.delete(id);
      messageApi.success(res.data?.message || "Xoá NXB thành công");
      fetchData();
    } catch (err) {
      messageApi.error(err.response?.data?.message || "Xoá NXB thất bại");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: "10%" },
    { title: "Tên NXB", dataIndex: "name", key: "name", width: "70%" },
    // { title: "Mô tả", dataIndex: "description", key: "description", width: "40%" },
    {
      title: "Hành động",
      width: "20%",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => openModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xoá?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger>
              Xoá
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <h2>Quản lý nhà xuất bản</h2>
      <Button type="primary" style={{ marginBottom: 16 }} onClick={() => openModal()}>
        Thêm nhà xuất bản
      </Button>

      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} bordered />

      <Modal
        title={editingPublisher ? "Sửa nhà xuất bản" : "Thêm nhà xuất bản"}
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleOk}
        okText="Lưu"
        cancelText="Huỷ"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên nhà xuất bản"
            rules={[{ required: true, message: "Tên NXB không được để trống" }]}
          >
            <Input />
          </Form.Item>
          {/* <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item> */}
        </Form>
      </Modal>
    </div>
  );
};

export default PublisherManage;
