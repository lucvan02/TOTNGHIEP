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
import authorApi from "../../api/authorApi";


const AuthorManage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [form] = Form.useForm();

  // message API (AntD v5)
  const [messageApi, contextHolder] = message.useMessage();

  // fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await authorApi.getAll();
      setData(res.data.data || res.data);
    } catch (err) {
      messageApi.error("Không tải được dữ liệu tác giả");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // mở modal thêm/sửa
  const openModal = (record = null) => {
    setEditingAuthor(record);
    setIsModalOpen(true);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingAuthor(null);
    form.resetFields();
  };

  // submit form
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      let res;
      if (editingAuthor) {
        res = await authorApi.update(editingAuthor.id, values);
      } else {
        res = await authorApi.create(values);
      }
      messageApi.success(res.data.message || "Lưu tác giả thành công");
      fetchData();
      handleCancel();
    } catch (err) {
      messageApi.error(err.response?.data?.message || "Lưu tác giả thất bại");
    }
  };

  // xoá tác giả
  const handleDelete = async (id) => {
    try {
      const res = await authorApi.delete(id);
      messageApi.success(res.data?.message || "Xoá tác giả thành công");
      fetchData();
    } catch (err) {
      messageApi.error(err.response?.data?.message || "Xoá tác giả thất bại");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: "10%" },
    { title: "Tên tác giả", dataIndex: "name", key: "name", width: "20%" },
    { title: "Mô tả", dataIndex: "description", key: "description", width: "50%" },
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
      {/* để message hiển thị */}
      {contextHolder}

      <h2>Quản lý tác giả</h2>
      <Button
        type="primary"
        style={{ marginBottom: 16 }}
        onClick={() => openModal()}
      >
        Thêm tác giả
      </Button>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        bordered
      />

      {/* Modal thêm/sửa */}
      <Modal
        title={editingAuthor ? "Sửa tác giả" : "Thêm tác giả"}
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleOk}
        okText="Lưu"
        cancelText="Huỷ"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên tác giả"
            rules={[{ required: true, message: "Tên tác giả không được để trống" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AuthorManage;
