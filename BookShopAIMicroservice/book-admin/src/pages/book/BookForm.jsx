import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { createBook, updateBook, getAllBooks, uploadImage } from "../../api/bookApi";
import { useNavigate, useParams } from "react-router-dom";

const BookForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [book, setBook] = useState(null);

  useEffect(() => {
    if (id) {
      getAllBooks().then((res) => {
        const found = res.data.data.find((b) => b.id === Number(id));
        if (found) {
          setBook(found);
          form.setFieldsValue(found);
        }
      });
    }
  }, [id]);

  const onFinish = async (values) => {
    try {
      let saved;
      if (id) {
        saved = await updateBook(id, values);
        message.success("Updated successfully");
      } else {
        saved = await createBook(values);
        message.success("Created successfully");
      }

      const bookId = id || saved.data.data.id;

      if (values.imageFile && values.imageFile.file) {
        await uploadImage(bookId, values.imageFile.file.originFileObj);
        message.success("Image uploaded successfully");
      }

      navigate("/books");
    } catch {
      message.error("Save failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>{id ? "Edit Book" : "Create Book"}</h2>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="price" label="Price">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="stock" label="Stock">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="imageFile" label="Upload Image">
          <Upload maxCount={1} beforeUpload={() => false}>
            <Button icon={<UploadOutlined />}>Select Image</Button>
          </Upload>
          {book?.image && (
            <img
              src={`http://localhost:8083${book.image}`}
              alt="Book"
              style={{ marginTop: 10, width: 100 }}
            />
          )}
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
          <Button onClick={() => navigate("/books")} style={{ marginLeft: 10 }}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default BookForm;
