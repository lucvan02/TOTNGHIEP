import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Upload,
  Button,
  message,
  Select,
  Card,
  Modal,
} from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import bookApi from "../../api/bookApi";
import publisherApi from "../../api/publisherApi";
import authorApi from "../../api/authorApi";
import categoryApi from "../../api/categoryApi";

const { Option } = Select;

// Nếu bạn có baseURL dùng chung:
const API_BASE = "http://localhost:8080";

const BookFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form] = Form.useForm();

  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");       // URL ảnh trên server (khi đã upload)
  const [previewUrl, setPreviewUrl] = useState("");   // preview local
  const [selectedFile, setSelectedFile] = useState(null); // file chờ upload (khi thêm mới hoặc đổi ảnh)

  const [publishers, setPublishers] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  // modal thêm nhanh
  const [quickAdd, setQuickAdd] = useState({ type: null, open: false });
  const [quickForm] = Form.useForm();

  useEffect(() => {
    fetchData();
    if (isEdit) fetchBook();
    else {
      // đảm bảo field description có giá trị khởi đầu cho ReactQuill controlled
      form.setFieldValue("description", "");
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const [pubRes, authRes, catRes] = await Promise.all([
        publisherApi.getAll(),
        authorApi.getAll(),
        categoryApi.getAll(),
      ]);
      setPublishers(pubRes.data.data || pubRes.data || []);
      setAuthors(authRes.data.data || authRes.data || []);
      setCategories(catRes.data.data || catRes.data || []);
    } catch {
      message.error("Lỗi khi tải dữ liệu phụ trợ");
    }
  };

  const fetchBook = async () => {
    try {
      const res = await bookApi.getById(id);
      const b = res.data.data || res.data;
      form.setFieldsValue({
        ...b,
        publisherId: b.publisher?.id,
        authors: b.authors?.map((a) => a.id) || [],
        categories: b.categories?.map((c) => c.id) || [],
        // đảm bảo description luôn có giá trị cho ReactQuill
        description: b.description || "",
      });
      setImageUrl(b.image || "");
      setPreviewUrl(b.image ? (b.image.startsWith("http") ? b.image : `${API_BASE}${b.image}`) : "");
    } catch {
      message.error("Không tìm thấy sách");
    }
  };

  // Chọn file ảnh
  const handleUpload = async ({ file }) => {
    // luôn preview local ngay
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setSelectedFile(file);

    // Nếu đang sửa (có id) => upload ngay để cập nhật ảnh
    if (isEdit) {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await bookApi.uploadImage(id, formData);
        const saved = res.data.data || res.data;
        setImageUrl(saved.image);
        // nếu backend trả relative path thì hiển thị kèm host
        setPreviewUrl(saved.image?.startsWith("http") ? saved.image : `${API_BASE}${saved.image}`);
        message.success("Upload ảnh thành công");
      } catch {
        message.error("Upload ảnh thất bại");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Chuẩn hóa payload theo DTO backend
      const payload = {
        title: values.title,
        description: values.description || "",
        price: Number(values.price || 0),
        weight: Number(values.weight || 0),
        image: imageUrl || null,
        publisher: { id: values.publisherId },
        authors: (values.authors || []).map((aid) => ({ id: aid })),
        categories: (values.categories || []).map((cid) => ({ id: cid })),
      };

      if (isEdit) {
        await bookApi.update(id, payload);
        // Nếu người dùng đổi/đã chọn lại ảnh trong edit mà bạn muốn upload sau update:
        if (selectedFile) {
          const formData = new FormData();
          formData.append("file", selectedFile);
          await bookApi.uploadImage(id, formData);
        }
        message.success("Cập nhật sách thành công");
        navigate("/books");
        return;
      }

      // Thêm mới:
      const createRes = await bookApi.create(payload);
      const created = createRes.data.data || createRes.data;
      const newId = created.id;
      // Nếu có chọn ảnh → upload sau khi có id
      if (selectedFile && newId) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        await bookApi.uploadImage(newId, formData);
      }
      message.success("Thêm sách thành công");
      navigate("/books");
    } catch (e) {
      message.error("Có lỗi khi lưu sách");
    }
  };

  // thêm nhanh
  const handleQuickAdd = async () => {
    try {
      const values = await quickForm.validateFields();
      let res, newItem;
      if (quickAdd.type === "publisher") {
        res = await publisherApi.create({ name: values.name });
        newItem = res.data.data || res.data;
        setPublishers((prev) => [...prev, newItem]);
        form.setFieldValue("publisherId", newItem.id);
      } else if (quickAdd.type === "author") {
        res = await authorApi.create({ name: values.name });
        newItem = res.data.data || res.data;
        setAuthors((prev) => [...prev, newItem]);
        form.setFieldValue("authors", [
          ...(form.getFieldValue("authors") || []),
          newItem.id,
        ]);
      } else if (quickAdd.type === "category") {
        res = await categoryApi.create({ name: values.name });
        newItem = res.data.data || res.data;
        setCategories((prev) => [...prev, newItem]);
        form.setFieldValue("categories", [
          ...(form.getFieldValue("categories") || []),
          newItem.id,
        ]);
      }
      message.success("Thêm mới thành công");
      setQuickAdd({ type: null, open: false });
      quickForm.resetFields();
    } catch {
      message.error("Thêm nhanh thất bại");
    }
  };

  return (
    <Card title={isEdit ? "Sửa sách" : "Thêm sách"}>
      <Form form={form} layout="vertical">
        <Form.Item name="title" label="Tên sách" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        {/* ReactQuill controlled */}
        <Form.Item name="description" label="Mô tả">
          <ReactQuill
            theme="snow"
            value={form.getFieldValue("description")}
            onChange={(val) => form.setFieldValue("description", val)}
            style={{ background: "#fff" }}
          />
        </Form.Item>

        <Form.Item name="price" label="Giá" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="weight" label="Khối lượng (gram)">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        {/* publisher */}
        <Form.Item
          name="publisherId"
          label="Nhà xuất bản"
          rules={[{ required: true }]}
        >
          <Select
            placeholder="Chọn nhà xuất bản"
            dropdownRender={(menu) => (
              <>
                {menu}
                <Button
                  type="link"
                  icon={<PlusOutlined />}
                  onClick={() => setQuickAdd({ type: "publisher", open: true })}
                  style={{ width: "100%", textAlign: "left" }}
                >
                  Thêm nhà xuất bản
                </Button>
              </>
            )}
            showSearch
            optionFilterProp="children"
          >
            {publishers.map((p) => (
              <Option key={p.id} value={p.id}>
                {p.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* authors */}
        <Form.Item name="authors" label="Tác giả" rules={[{ required: true }]}>
          <Select
            mode="multiple"
            placeholder="Chọn tác giả"
            dropdownRender={(menu) => (
              <>
                {menu}
                <Button
                  type="link"
                  icon={<PlusOutlined />}
                  onClick={() => setQuickAdd({ type: "author", open: true })}
                  style={{ width: "100%", textAlign: "left" }}
                >
                  Thêm tác giả
                </Button>
              </>
            )}
            showSearch
            optionFilterProp="children"
          >
            {authors.map((a) => (
              <Option key={a.id} value={a.id}>
                {a.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* categories */}
        <Form.Item
          name="categories"
          label="Thể loại"
          rules={[{ required: true }]}
        >
          <Select
            mode="multiple"
            placeholder="Chọn thể loại"
            dropdownRender={(menu) => (
              <>
                {menu}
                <Button
                  type="link"
                  icon={<PlusOutlined />}
                  onClick={() => setQuickAdd({ type: "category", open: true })}
                  style={{ width: "100%", textAlign: "left" }}
                >
                  Thêm thể loại
                </Button>
              </>
            )}
            showSearch
            optionFilterProp="children"
          >
            {categories.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* image */}
        <Form.Item label="Ảnh">
          <Upload customRequest={handleUpload} showUploadList={false}>
            <Button icon={<UploadOutlined />} loading={uploading}>
              Chọn ảnh
            </Button>
          </Upload>
          {previewUrl && (
            <div style={{ marginTop: 10 }}>
              <img
                src={previewUrl}
                alt="preview"
                width={150}
                style={{ border: "1px solid #ddd", borderRadius: 4 }}
              />
            </div>
          )}
        </Form.Item>

        <Button type="primary" onClick={handleSubmit}>
          {isEdit ? "Cập nhật" : "Thêm mới"}
        </Button>
      </Form>

      {/* modal thêm nhanh */}
      <Modal
        title={`Thêm ${
          quickAdd.type === "publisher"
            ? "nhà xuất bản"
            : quickAdd.type === "author"
            ? "tác giả"
            : "thể loại"
        }`}
        open={quickAdd.open}
        onCancel={() => setQuickAdd({ type: null, open: false })}
        onOk={handleQuickAdd}
      >
        <Form form={quickForm} layout="vertical">
          <Form.Item
            name="name"
            label="Tên"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default BookFormPage;








// import React, { useEffect, useState } from "react";
// import {
//   Form,
//   Input,
//   InputNumber,
//   Upload,
//   Button,
//   message,
//   Select,
//   Card,
//   Modal,
// } from "antd";
// import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
// import { useNavigate, useParams } from "react-router-dom";
// import ReactQuill from "react-quill-new";
// import "react-quill-new/dist/quill.snow.css";

// import bookApi from "../../api/bookApi";
// import publisherApi from "../../api/publisherApi";
// import authorApi from "../../api/authorApi";
// import categoryApi from "../../api/categoryApi";

// const { Option } = Select;
// const API_BASE = "http://localhost:8080";

// const BookFormPage = () => {
//   const { id } = useParams();
//   const [form] = Form.useForm();
//   const [uploading, setUploading] = useState(false);
//   const [imageUrl, setImageUrl] = useState("");
//   const [previewUrl, setPreviewUrl] = useState(""); // preview ảnh local
//   const [publishers, setPublishers] = useState([]);
//   const [authors, setAuthors] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const navigate = useNavigate();

//   // modal thêm nhanh
//   const [quickAdd, setQuickAdd] = useState({ type: null, open: false });
//   const [quickForm] = Form.useForm();

//   useEffect(() => {
//     fetchData();
//     if (id) fetchBook();
//   }, [id]);

//   const fetchData = async () => {
//     try {
//       const [pubRes, authRes, catRes] = await Promise.all([
//         publisherApi.getAll(),
//         authorApi.getAll(),
//         categoryApi.getAll(),
//       ]);
//       setPublishers(pubRes.data.data || pubRes.data);
//       setAuthors(authRes.data.data || authRes.data);
//       setCategories(catRes.data.data || catRes.data);
//     } catch {
//       message.error("Lỗi khi tải dữ liệu phụ trợ");
//     }
//   };

//   const fetchBook = async () => {
//     try {
//       const res = await bookApi.getById(id);
//       const b = res.data.data || res.data;
//       form.setFieldsValue({
//         ...b,
//         publisherId: b.publisher?.id,
//         authors: b.authors?.map((a) => a.id),
//         categories: b.categories?.map((c) => c.id),
//       });
//       setImageUrl(b.image || "");
//       setPreviewUrl(b.image ? (b.image.startsWith("http") ? b.image : `${API_BASE}${b.image}`) : "");
//     } catch {
//       message.error("Không tìm thấy sách");
//     }
//   };

//   const handleUpload = async ({ file }) => {
//     setUploading(true);
//     // preview local ngay khi chọn
//     setPreviewUrl(URL.createObjectURL(file));

//     const formData = new FormData();
//     formData.append("file", file);
//     try {
//       const res = await bookApi.uploadImage(id ?? 0, formData);
//       const savedBook = res.data.data || res.data;
//       setImageUrl(savedBook.image);
//       message.success("Upload thành công");
//     } catch {
//       message.error("Upload thất bại");
//     }
//     setUploading(false);
//   };

//   // build payload
//   const buildPayload = (values) => ({
//     id: id ?? null,
//     title: values.title,
//     description: values.description,
//     price: values.price,
//     weight: values.weight,
//     status: values.status ?? 1,
//     image: imageUrl,
//     publisher: values.publisherId ? { id: values.publisherId } : null,
//     authors: (values.authors || []).map((aid) => ({ id: aid })),
//     categories: (values.categories || []).map((cid) => ({ id: cid })),
//   });

//   const handleSubmit = async () => {
//     try {
//       const values = await form.validateFields();
//       const payload = buildPayload(values);

//       if (id) {
//         await bookApi.update(id, payload);
//         message.success("Cập nhật sách thành công");
//       } else {
//         await bookApi.create(payload);
//         message.success("Thêm sách thành công");
//       }
//       navigate("/books");
//     } catch {
//       message.error("Có lỗi khi lưu sách");
//     }
//   };

//   // thêm nhanh publisher/author/category
//   const handleQuickAdd = async () => {
//     try {
//       const values = await quickForm.validateFields();
//       let res, newItem;
//       if (quickAdd.type === "publisher") {
//         res = await publisherApi.create({ name: values.name });
//         newItem = res.data.data || res.data;
//         setPublishers((prev) => [...prev, newItem]);
//         form.setFieldValue("publisherId", newItem.id);
//       } else if (quickAdd.type === "author") {
//         res = await authorApi.create({ name: values.name });
//         newItem = res.data.data || res.data;
//         setAuthors((prev) => [...prev, newItem]);
//         form.setFieldValue("authors", [
//           ...(form.getFieldValue("authors") || []),
//           newItem.id,
//         ]);
//       } else if (quickAdd.type === "category") {
//         res = await categoryApi.create({ name: values.name });
//         newItem = res.data.data || res.data;
//         setCategories((prev) => [...prev, newItem]);
//         form.setFieldValue("categories", [
//           ...(form.getFieldValue("categories") || []),
//           newItem.id,
//         ]);
//       }
//       message.success("Thêm mới thành công");
//       setQuickAdd({ type: null, open: false });
//       quickForm.resetFields();
//     } catch {
//       message.error("Thêm nhanh thất bại");
//     }
//   };

//   return (
//     <Card title={id ? "Sửa sách" : "Thêm sách"}>
//       <Form form={form} layout="vertical">
//         <Form.Item name="title" label="Tên sách" rules={[{ required: true }]}>
//           <Input />
//         </Form.Item>

//         <Form.Item name="description" label="Mô tả">
//           <ReactQuill theme="snow" style={{ background: "#fff" }} />
//         </Form.Item>

//         <Form.Item name="price" label="Giá" rules={[{ required: true }]}>
//           <InputNumber min={0} style={{ width: "100%" }} />
//         </Form.Item>
//         <Form.Item name="weight" label="Khối lượng (gram)">
//           <InputNumber min={0} style={{ width: "100%" }} />
//         </Form.Item>

//         {/* publisher */}
//         <Form.Item
//           name="publisherId"
//           label="Nhà xuất bản"
//           rules={[{ required: true }]}
//         >
//           <Select
//             placeholder="Chọn nhà xuất bản"
//             dropdownRender={(menu) => (
//               <>
//                 {menu}
//                 <Button
//                   type="link"
//                   icon={<PlusOutlined />}
//                   onClick={() => setQuickAdd({ type: "publisher", open: true })}
//                   style={{ width: "100%", textAlign: "left" }}
//                 >
//                   Thêm nhà xuất bản
//                 </Button>
//               </>
//             )}
//           >
//             {publishers.map((p) => (
//               <Option key={p.id} value={p.id}>
//                 {p.name}
//               </Option>
//             ))}
//           </Select>
//         </Form.Item>

//         {/* authors */}
//         <Form.Item
//           name="authors"
//           label="Tác giả"
//           rules={[{ required: true }]}
//         >
//           <Select
//             mode="multiple"
//             placeholder="Chọn tác giả"
//             dropdownRender={(menu) => (
//               <>
//                 {menu}
//                 <Button
//                   type="link"
//                   icon={<PlusOutlined />}
//                   onClick={() => setQuickAdd({ type: "author", open: true })}
//                   style={{ width: "100%", textAlign: "left" }}
//                 >
//                   Thêm tác giả
//                 </Button>
//               </>
//             )}
//           >
//             {authors.map((a) => (
//               <Option key={a.id} value={a.id}>
//                 {a.name}
//               </Option>
//             ))}
//           </Select>
//         </Form.Item>

//         {/* categories */}
//         <Form.Item
//           name="categories"
//           label="Thể loại"
//           rules={[{ required: true }]}
//         >
//           <Select
//             mode="multiple"
//             placeholder="Chọn thể loại"
//             dropdownRender={(menu) => (
//               <>
//                 {menu}
//                 <Button
//                   type="link"
//                   icon={<PlusOutlined />}
//                   onClick={() => setQuickAdd({ type: "category", open: true })}
//                   style={{ width: "100%", textAlign: "left" }}
//                 >
//                   Thêm thể loại
//                 </Button>
//               </>
//             )}
//           >
//             {categories.map((c) => (
//               <Option key={c.id} value={c.id}>
//                 {c.name}
//               </Option>
//             ))}
//           </Select>
//         </Form.Item>

//         {/* image */}
//         <Form.Item label="Ảnh">
//           <Upload customRequest={handleUpload} showUploadList={false}>
//             <Button icon={<UploadOutlined />} loading={uploading}>
//               Chọn ảnh
//             </Button>
//           </Upload>
//           {previewUrl && (
//             <div style={{ marginTop: 10 }}>
//               <img
//                 src={previewUrl}
//                 alt="preview"
//                 width={150}
//                 style={{ border: "1px solid #ddd", borderRadius: 4 }}
//               />
//             </div>
//           )}
//         </Form.Item>

//         <Button type="primary" onClick={handleSubmit}>
//           {id ? "Cập nhật" : "Thêm mới"}
//         </Button>
//       </Form>

//       {/* modal thêm nhanh */}
//       <Modal
//         title={`Thêm ${
//           quickAdd.type === "publisher"
//             ? "nhà xuất bản"
//             : quickAdd.type === "author"
//             ? "tác giả"
//             : "thể loại"
//         }`}
//         open={quickAdd.open}
//         onCancel={() => setQuickAdd({ type: null, open: false })}
//         onOk={handleQuickAdd}
//       >
//         <Form form={quickForm} layout="vertical">
//           <Form.Item
//             name="name"
//             label="Tên"
//             rules={[{ required: true, message: "Vui lòng nhập tên" }]}
//           >
//             <Input />
//           </Form.Item>
//         </Form>
//       </Modal>
//     </Card>
//   );
// };

// export default BookFormPage;
