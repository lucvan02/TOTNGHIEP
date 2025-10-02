// import { useEffect, useState } from "react";
// import {
//   Table,
//   Button,
//   Modal,
//   Form,
//   InputNumber,
//   Select,
//   message,
//   Input,
// } from "antd";
// import receiptApi from "../../api/receiptApi";
// import bookApi from "../../api/bookApi";

// const { Option } = Select;

// const ReceiptManage = () => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [form] = Form.useForm();

//   const [selectedBooks, setSelectedBooks] = useState([]); // danh sách sản phẩm đã chọn
//   const [bookOptions, setBookOptions] = useState([]); // danh sách để search chọn

//   const [messageApi, contextHolder] = message.useMessage();

//   // load danh sách phiếu nhập
//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const res = await receiptApi.getAll();
//       setData(res.data.data || res.data);
//     } catch (err) {
//       messageApi.error("Không tải được dữ liệu phiếu nhập");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   // load danh sách sách để chọn
//   const fetchBooks = async () => {
//     try {
//       const res = await bookApi.getAll();
//       setBookOptions(res.data.data || res.data);
//     } catch (err) {
//       messageApi.error("Không tải được danh sách sách");
//     }
//   };

//   const openModal = () => {
//     setIsModalOpen(true);
//     form.resetFields();
//     setSelectedBooks([]);
//     fetchBooks();
//   };

//   const handleCancel = () => {
//     setIsModalOpen(false);
//   };

//   // thêm 1 sản phẩm vào danh sách nhập
//   const handleAddBook = (bookId) => {
//     if (!bookId) return;
//     const book = bookOptions.find((b) => b.id === bookId);
//     if (book && !selectedBooks.find((b) => b.id === bookId)) {
//       setSelectedBooks([
//         ...selectedBooks,
//         { ...book, quantity: 1, importPrice: 0 },
//       ]);
//     }
//   };

//   // chỉnh sửa số lượng/giá nhập
//   const updateBookField = (id, field, value) => {
//     setSelectedBooks((prev) =>
//       prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
//     );
//   };

//   // submit form
//   const handleOk = async () => {
//     if (selectedBooks.length === 0) {
//       messageApi.warning("Vui lòng chọn ít nhất 1 sản phẩm");
//       return;
//     }
//     try {
//       const receipt = {
//         receiptDetails: selectedBooks.map((b) => ({
//           bookId: b.id,
//           quantity: b.quantity,
//           importPrice: b.importPrice,
//         })),
//       };
//       const res = await receiptApi.create(receipt);
//       messageApi.success(res.data.message || "Thêm phiếu nhập thành công");
//       fetchData();
//       handleCancel();
//     } catch (err) {
//       messageApi.error(err.response?.data?.message || "Thêm phiếu nhập thất bại");
//     }
//   };

//   const columns = [
//     { title: "ID", dataIndex: "id", key: "id", width: "10%" },
//     { title: "Ngày nhập", dataIndex: "createdAt", key: "createdAt" },
//     { title: "Tổng tiền", dataIndex: "total", key: "total" },
//   ];

//   return (
//     <div>
//       {contextHolder}
//       <h2>Quản lý phiếu nhập</h2>
//       <Button type="primary" style={{ marginBottom: 16 }} onClick={openModal}>
//         Thêm phiếu nhập
//       </Button>

//       <Table rowKey="id" columns={columns} dataSource={data} loading={loading} bordered />

//       {/* Modal thêm phiếu nhập */}
//       <Modal
//         title="Thêm phiếu nhập"
//         open={isModalOpen}
//         onCancel={handleCancel}
//         onOk={handleOk}
//         okText="Lưu"
//         cancelText="Huỷ"
//         width={800}
//       >
//         <Form form={form} layout="vertical">
//           {/* chọn sản phẩm */}
//           <Form.Item label="Chọn sản phẩm">
//             <Select
//               showSearch
//               placeholder="Tìm sách..."
//               style={{ width: "100%" }}
//               onChange={handleAddBook}
//               filterOption={(input, option) =>
//                 option?.children?.toLowerCase().includes(input.toLowerCase())
//               }
//             >
//               {bookOptions.map((b) => (
//                 <Option key={b.id} value={b.id}>
//                   {b.title}
//                 </Option>
//               ))}
//             </Select>
//           </Form.Item>

//           {/* bảng sản phẩm đã chọn */}
//           <Table
//             rowKey="id"
//             dataSource={selectedBooks}
//             pagination={false}
//             bordered
//             columns={[
//               { title: "Tên sách", dataIndex: "title", key: "title" },
//               {
//                 title: "Số lượng",
//                 dataIndex: "quantity",
//                 key: "quantity",
//                 render: (_, record) => (
//                   <InputNumber
//                     min={1}
//                     value={record.quantity}
//                     onChange={(val) =>
//                       updateBookField(record.id, "quantity", val)
//                     }
//                   />
//                 ),
//               },
//               {
//                 title: "Giá nhập",
//                 dataIndex: "importPrice",
//                 key: "importPrice",
//                 render: (_, record) => (
//                   <InputNumber
//                     min={0}
//                     value={record.importPrice}
//                     onChange={(val) =>
//                       updateBookField(record.id, "importPrice", val)
//                     }
//                   />
//                 ),
//               },
//             ]}
//           />
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default ReceiptManage;




import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Input,
  InputNumber,
  Select,
  message,
} from "antd";
import receiptApi from "../../api/receiptApi";
import bookApi from "../../api/bookApi";

const { Option } = Select;

const ReceiptManage = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [selectedBooks, setSelectedBooks] = useState([]);
  const [bookOptions, setBookOptions] = useState([]);
  const [detailReceipt, setDetailReceipt] = useState(null);

  const [messageApi, contextHolder] = message.useMessage();

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await receiptApi.getAll();
      setReceipts(res.data);
    } catch {
      messageApi.error("Không tải được dữ liệu phiếu nhập");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await bookApi.getAll();
      setBookOptions(res.data.data || res.data);
    } catch {
      messageApi.error("Không tải được danh sách sách");
    }
  };

  const openCreateModal = () => {
    setIsModalOpen(true);
    setSelectedBooks([]);
    fetchBooks();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleAddBook = (bookId) => {
    const book = bookOptions.find((b) => b.id === bookId);
    if (book && !selectedBooks.find((b) => b.id === bookId)) {
      setSelectedBooks([
        ...selectedBooks,
        { ...book, quantity: 1, importPrice: 0 },
      ]);
    }
  };

  const updateBookField = (id, field, value) => {
    setSelectedBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const handleSaveReceipt = async () => {
    if (selectedBooks.length === 0) {
      messageApi.warning("Chưa chọn sản phẩm nào!");
      return;
    }
    try {
      const receipt = {
        receiptDetails: selectedBooks.map((b) => ({
          bookId: b.id,
          quantity: b.quantity,
          importPrice: b.importPrice,
        })),
      };
      await receiptApi.create(receipt);
      messageApi.success("Thêm phiếu nhập thành công");
      fetchReceipts();
      setIsModalOpen(false);
    } catch {
      messageApi.error("Thêm phiếu nhập thất bại");
    }
  };

  const showDetail = async (record) => {
    try {
      const res = await receiptApi.getById(record.id);
      setDetailReceipt(res.data);
      setIsDetailOpen(true);
    } catch {
      messageApi.error("Không tải được chi tiết phiếu nhập");
    }
  };

  return (
    <div>
      {contextHolder}
      <h2>Lịch sử nhập hàng</h2>
      <Button type="primary" onClick={openCreateModal} style={{ marginBottom: 16 }}>
        + Tạo phiếu nhập
      </Button>

      {/* Bảng danh sách phiếu nhập */}
      <Table
        rowKey="id"
        loading={loading}
        dataSource={receipts}
        columns={[
          { title: "Mã phiếu", dataIndex: "id", width: "15%" },
          { title: "Ngày tạo", dataIndex: "createdAt", width: "35%" },
          {
            title: "Hành động",
            render: (_, record) => (
              <Button type="link" onClick={() => showDetail(record)}>
                Xem chi tiết
              </Button>
            ),
          },
        ]}
        bordered
      />

      {/* Modal tạo phiếu nhập */}
      <Modal
        title="Tạo phiếu nhập"
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleSaveReceipt}
        width={900}
        okText="Lưu phiếu nhập"
        cancelText="Hủy"
      >
        <Select
          showSearch
          placeholder="Tìm sản phẩm..."
          style={{ width: "100%", marginBottom: 16 }}
          onChange={handleAddBook}
          filterOption={(input, option) =>
            option?.children?.toLowerCase().includes(input.toLowerCase())
          }
        >
          {bookOptions.map((b) => (
            <Option key={b.id} value={b.id}>
              {b.title}
            </Option>
          ))}
        </Select>

        <Table
          rowKey="id"
          pagination={false}
          bordered
          dataSource={selectedBooks}
          columns={[
            { title: "Mã", dataIndex: "id", width: "5%" },
            {
              title: "Hình ảnh",
              dataIndex: "image",
              render: (img) =>
                img ? <img src={img} alt="" style={{ width: 50 }} /> : "No image",
            },
            { title: "Tên sản phẩm", dataIndex: "title" },
            { title: "Hiện có", dataIndex: "stock", width: "10%" },
            {
              title: "Nhập thêm",
              dataIndex: "quantity",
              render: (_, record) => (
                <InputNumber
                  min={1}
                  value={record.quantity}
                  onChange={(val) => updateBookField(record.id, "quantity", val)}
                />
              ),
            },
            {
              title: "Sau nhập",
              render: (_, record) => record.stock + record.quantity,
            },
            {
              title: "Giá nhập",
              dataIndex: "importPrice",
              render: (_, record) => (
                <InputNumber
                  min={0}
                  value={record.importPrice}
                  onChange={(val) =>
                    updateBookField(record.id, "importPrice", val)
                  }
                />
              ),
            },
            {
              title: "Thao tác",
              render: (_, record) => (
                <Button danger onClick={() =>
                  setSelectedBooks(selectedBooks.filter((b) => b.id !== record.id))
                }>
                  Xóa
                </Button>
              ),
            },
          ]}
        />
      </Modal>

      {/* Modal chi tiết phiếu nhập */}
      <Modal
        title={`Chi tiết phiếu nhập #${detailReceipt?.id}`}
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        footer={null}
        width={900}
      >
        <p><b>Ngày tạo:</b> {detailReceipt?.createdAt}</p>
        <Table
          rowKey="id"
          bordered
          pagination={false}
          dataSource={detailReceipt?.receiptDetails || []}
          columns={[
            { title: "STT", render: (_, __, index) => index + 1, width: "5%" },
            {
              title: "Ảnh",
              dataIndex: "bookTitle",
              render: (_, record) =>
                record.bookImage ? (
                  <img src={record.bookImage} alt="" style={{ width: 50 }} />
                ) : (
                  "No image"
                ),
            },
            { title: "Tên sản phẩm", dataIndex: "bookTitle" },
            { title: "Số lượng nhập", dataIndex: "quantity" },
            {
              title: "Giá nhập",
              dataIndex: "importPrice",
              render: (val) => `${val.toLocaleString()} VND`,
            },
          ]}
        />
      </Modal>
    </div>
  );
};

export default ReceiptManage;
