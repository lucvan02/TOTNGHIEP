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
import categoryApi from "../../api/categoryApi";

const CategoryManage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  const [messageApi, contextHolder] = message.useMessage();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await categoryApi.getAll();
      setData(res.data.data || res.data);
    } catch (err) {
      messageApi.error("Không tải được dữ liệu thể loại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (record = null) => {
    setEditingCategory(record);
    setIsModalOpen(true);
    if (record) form.setFieldsValue(record);
    else form.resetFields();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      let res;
      if (editingCategory) {
        res = await categoryApi.update(editingCategory.id, values);
      } else {
        res = await categoryApi.create(values);
      }
      messageApi.success(res.data.message || "Lưu thể loại thành công");
      fetchData();
      handleCancel();
    } catch (err) {
      messageApi.error(err.response?.data?.message || "Lưu thể loại thất bại");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await categoryApi.delete(id);
      messageApi.success(res.data?.message || "Xoá thể loại thành công");
      fetchData();
    } catch (err) {
      messageApi.error(err.response?.data?.message || "Xoá thể loại thất bại");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: "10%" },
    { title: "Tên thể loại", dataIndex: "name", key: "name", width: "70%" },
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
      <h2>Quản lý thể loại</h2>
      <Button type="primary" style={{ marginBottom: 16 }} onClick={() => openModal()}>
        Thêm thể loại
      </Button>

      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} bordered />

      <Modal
        title={editingCategory ? "Sửa thể loại" : "Thêm thể loại"}
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleOk}
        okText="Lưu"
        cancelText="Huỷ"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên thể loại"
            rules={[{ required: true, message: "Tên thể loại không được để trống" }]}
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

export default CategoryManage;
