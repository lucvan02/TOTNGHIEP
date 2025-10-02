import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Row,
  Col,
  message,
  InputNumber,
} from "antd";
import { UploadOutlined, EditOutlined } from "@ant-design/icons";
import bookApi from "../../api/bookApi";
import publisherApi from "../../api/publisherApi";
import authorApi from "../../api/authorApi";
import categoryApi from "../../api/categoryApi";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const API_BASE = "http://localhost:8080";

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [form] = Form.useForm();

  const [publishers, setPublishers] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);

  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetchBook();
    fetchOptions();
  }, [id]);

  const fetchBook = async () => {
    setLoading(true);
    try {
      const res = await bookApi.getById(id);
      const b = res.data.data || res.data;
      setBook(b);
    } catch {
      message.error("Lỗi khi tải dữ liệu sách");
    }
    setLoading(false);
  };

  const fetchOptions = async () => {
    try {
      const [pubRes, authorRes, cateRes] = await Promise.all([
        publisherApi.getAll(),
        authorApi.getAll(),
        categoryApi.getAll(),
      ]);
      setPublishers(pubRes.data.data || pubRes.data || []);
      setAuthors(authorRes.data.data || authorRes.data || []);
      setCategories(cateRes.data.data || cateRes.data || []);
    } catch {
      message.error("Lỗi khi tải dữ liệu chọn");
    }
  };

  // build payload cho update
  const buildPayload = (values) => ({
    id: book.id,
    title: values.title ?? book.title,
    description: values.description ?? book.description,
    price: values.price ?? book.price,
    weight: book.weight,
    star: book.star,
    status: values.status ?? book.status,
    image: book.image,
    publisher: values.publisherId
      ? { id: values.publisherId }
      : book.publisher
      ? { id: book.publisher.id }
      : null,
    authors: (values.authorIds || book.authors?.map((a) => a.id) || []).map(
      (id) => ({ id })
    ),
    categories: (
      values.categoryIds || book.categories?.map((c) => c.id) || []
    ).map((id) => ({ id })),
  });

  const handleUpdate = async (values) => {
    try {
      if (!book) return;
      const payload = buildPayload(values);
      await bookApi.update(id, payload);

      message.success("Cập nhật thành công");
      await fetchBook();
      setEditingField(null);
    } catch {
      message.error("Lỗi khi cập nhật");
    }
  };

  const fullImg = (img) =>
    img ? (img.startsWith("http") ? img : `${API_BASE}${img}`) : "";

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      {book && (
        <>
          <Card loading={loading} style={{ padding: 20 }}>
            <Row gutter={24}>
              {/* Ảnh sách */}
              <Col span={8} style={{ textAlign: "center" }}>
                <img
                  src={book.image}
                  alt={book.title}
                  style={{ width: "100%", maxHeight: 350, objectFit: "contain" }}
                />
                <Button
                  style={{ marginTop: 10 }}
                  icon={<UploadOutlined />}
                  onClick={() => setEditingField("image")}
                >
                  Đổi ảnh
                </Button>
              </Col>

              {/* Thông tin chi tiết */}
              <Col span={16}>
                <h2>
                  {book.title}{" "}
                  <Button
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => setEditingField("title")}
                  />
                </h2>
                <p>
                  <b>Giá:</b> {book.price?.toLocaleString()} VNĐ{" "}
                  <Button
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => setEditingField("price")}
                  />
                </p>
                <p>
                  <b>Tồn kho:</b> {book.stock} | <b>Đã bán:</b>{" "}
                  {book.saleQuantity}
                </p>
                <p>
                  <b>Trạng thái:</b>{" "}
                  {book.status === 1 ? (
                    <Tag color="green">Hiển thị</Tag>
                  ) : book.status === 0 ? (
                    <Tag color="orange">Ẩn</Tag>
                  ) : (
                    <Tag color="red">Ngừng kinh doanh</Tag>
                  )}
                  <Button
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => setEditingField("status")}
                  />
                </p>
                <p>
                  <b>Nhà xuất bản:</b> {book.publisher?.name}{" "}
                  <Button
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => setEditingField("publisher")}
                  />
                </p>
                <p>
                  <b>Tác giả:</b>{" "}
                  {book.authors?.map((a) => (
                    <Tag key={a.id}>{a.name}</Tag>
                  ))}
                  <Button
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => setEditingField("authors")}
                  />
                </p>
                <p>
                  <b>Thể loại:</b>{" "}
                  {book.categories?.map((c) => (
                    <Tag key={c.id}>{c.name}</Tag>
                  ))}
                  <Button
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => setEditingField("categories")}
                  />
                </p>
              </Col>
            </Row>

            {/* Mô tả sách */}
            <div style={{ marginTop: 30 }}>
              <h3>
                Mô tả{" "}
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => setEditingField("description")}
                />
              </h3>
              <div
                style={{
                  border: "1px solid #f0f0f0",
                  padding: "10px",
                  borderRadius: 4,
                  minHeight: 100,
                }}
                dangerouslySetInnerHTML={{ __html: book.description || "" }}
              />
            </div>

            <Button type="primary" onClick={() => navigate(`/books/edit/${book.id}`)}>
              Sửa nhanh
            </Button>

          </Card>

          {/* Modal chỉnh sửa */}
          <Modal
            open={!!editingField}
            title={`Sửa ${editingField}`}
            onCancel={() => setEditingField(null)}
            onOk={() => form.submit()}
            width={700}
            destroyOnClose
          >
            <Form form={form} layout="vertical" onFinish={handleUpdate}>
              {editingField === "title" && (
                <Form.Item
                  name="title"
                  initialValue={book.title}
                  label="Tiêu đề"
                  rules={[{ required: true, message: "Nhập tiêu đề" }]}
                >
                  <Input />
                </Form.Item>
              )}

              {editingField === "price" && (
                <Form.Item
                  name="price"
                  initialValue={book.price}
                  label="Giá"
                  rules={[{ required: true, message: "Nhập giá" }]}
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              )}

              {editingField === "status" && (
                <Form.Item
                  name="status"
                  initialValue={book.status}
                  label="Trạng thái"
                >
                  <Select>
                    <Select.Option value={0}>Ẩn</Select.Option>
                    <Select.Option value={1}>Hiển thị</Select.Option>
                    <Select.Option value={2}>Ngừng kinh doanh</Select.Option>
                  </Select>
                </Form.Item>
              )}

              {editingField === "publisher" && (
                <Form.Item
                  name="publisherId"
                  initialValue={book.publisher?.id}
                  label="Nhà xuất bản"
                  rules={[{ required: true, message: "Chọn nhà xuất bản" }]}
                >
                  <Select showSearch optionFilterProp="children">
                    {publishers.map((p) => (
                      <Select.Option key={p.id} value={p.id}>
                        {p.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              )}

              {editingField === "authors" && (
                <Form.Item
                  name="authorIds"
                  initialValue={book.authors?.map((a) => a.id)}
                  label="Tác giả"
                >
                  <Select mode="multiple" showSearch optionFilterProp="children">
                    {authors.map((a) => (
                      <Select.Option key={a.id} value={a.id}>
                        {a.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              )}

              {editingField === "categories" && (
                <Form.Item
                  name="categoryIds"
                  initialValue={book.categories?.map((c) => c.id)}
                  label="Thể loại"
                >
                  <Select mode="multiple" showSearch optionFilterProp="children">
                    {categories.map((c) => (
                      <Select.Option key={c.id} value={c.id}>
                        {c.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              )}

              {editingField === "description" && (
                <Form.Item
                  label="Mô tả"
                  name="description"
                  initialValue={book.description || ""}
                >
                  <ReactQuill
                    theme="snow"
                    value={
                      form.getFieldValue("description") ?? book.description ?? ""
                    }
                    onChange={(content) =>
                      form.setFieldValue("description", content)
                    }
                    style={{ height: "250px", marginBottom: "40px" }}
                  />
                </Form.Item>
              )}

              {editingField === "image" && (
                <Form.Item label="Ảnh">
                  <Upload
                    showUploadList={false}
                    customRequest={async ({ file, onError, onSuccess }) => {
                      try {
                        const formData = new FormData();
                        formData.append("file", file);
                        const res = await bookApi.uploadImage(id, formData);
                        onSuccess?.(res, file);
                        message.success("Đổi ảnh thành công");
                        await fetchBook();
                      } catch (e) {
                        onError?.(e);
                        message.error("Đổi ảnh thất bại");
                      }
                    }}
                  >
                    <Button icon={<UploadOutlined />}>Upload</Button>
                  </Upload>
                  <div style={{ marginTop: 10 }}>
                    <img
                      src={book.image}
                      alt="preview"
                      width={150}
                      style={{ border: "1px solid #ddd", borderRadius: 4 }}
                    />
                  </div>
                </Form.Item>
              )}
            </Form>
          </Modal>
        </>
      )}
    </div>
  );
};

export default BookDetail;
