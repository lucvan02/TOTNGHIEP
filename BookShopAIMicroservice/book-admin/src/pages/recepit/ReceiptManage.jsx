// import { useEffect, useState } from "react";
// import {
//   Table,
//   Button,
//   Modal,
//   InputNumber,
//   Select,
//   message,
// } from "antd";
// import { UploadOutlined } from "@ant-design/icons";
// import { Upload } from "antd";
// import dayjs from "dayjs";
// import receiptApi from "../../api/receiptApi";
// import bookApi from "../../api/bookApi";
// import * as XLSX from "xlsx";

// const { Option } = Select;

// const ReceiptManage = () => {
//   const [receipts, setReceipts] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isDetailOpen, setIsDetailOpen] = useState(false);

//   const [selectedBooks, setSelectedBooks] = useState([]);
//   const [bookOptions, setBookOptions] = useState([]);
//   const [detailReceipt, setDetailReceipt] = useState(null);

//   const [messageApi, contextHolder] = message.useMessage();

//   const [previewData, setPreviewData] = useState([]);
//   const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  

//   // Parse Excel ngay khi upload
// // const handleImportPreview = (file) => {
// //   const reader = new FileReader();
// //   reader.onload = (e) => {
// //     const data = new Uint8Array(e.target.result);
// //     const workbook = XLSX.read(data, { type: "array" });
// //     const sheet = workbook.Sheets[workbook.SheetNames[0]];
// //     const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// //     // Bỏ header
// //     const parsed = rows.slice(1).map((r) => ({
// //       bookId: r[0],
// //       bookTitle: r[1],
// //       quantity: r[2],
// //       importPrice: r[3],
// //     }));
// //     setPreviewData(parsed);
// //     setIsPreviewOpen(true);
// //   };
// //   reader.readAsArrayBuffer(file);
// // };

// const handleImportPreview = (file) => {
//   const reader = new FileReader();
//   reader.onload = (e) => {
//     try {
//       const data = new Uint8Array(e.target.result);
//       const workbook = XLSX.read(data, { type: "array" });
//       const sheet = workbook.Sheets[workbook.SheetNames[0]];
//       const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

//       // ✅ Check header chính xác
//       const header = rows[0];
//       const expectedHeader = [
//         "Mã sách (bookId)",
//         "Tên sách (tham khảo)",
//         "Số lượng nhập",
//         "Giá nhập",
//       ];
//       if (!header || expectedHeader.some((h, i) => header[i] !== h)) {
//         message.error("File không đúng định dạng mẫu!");
//         return;
//       }

//       // ✅ Parse rows
//       const parsed = [];
//       const errors = [];
//       rows.slice(1).forEach((r, idx) => {
//         if (!r || r.length < 4) return;
//         const [bookId, bookTitle, quantity, importPrice] = r;

//         const book = bookOptions.find((b) => b.id === Number(bookId));
//         if (!book) {
//           errors.push(`Dòng ${idx + 2}: bookId ${bookId} không tồn tại`);
//           return;
//         }

//         if (book.title.trim() !== String(bookTitle).trim()) {
//           errors.push(`⚠️ Dòng ${idx + 2}: Tên sách không khớp với bookId`);
//         }

//         if (!quantity || quantity <= 0) {
//           errors.push(`Dòng ${idx + 2}: Số lượng phải > 0`);
//         }
//         if (importPrice < 0) {
//           errors.push(`Dòng ${idx + 2}: Giá nhập không hợp lệ`);
//         }

//         parsed.push({
//           bookId: Number(bookId),
//           bookTitle,
//           quantity: Number(quantity),
//           importPrice: Number(importPrice),
//         });
//       });

//       if (errors.length > 0) {
//         message.error("Có lỗi trong file:\n" + errors.join("\n"));
//         return;
//       }

//       setPreviewData(parsed);
//       setIsPreviewOpen(true);
//     } catch (err) {
//       message.error("Không đọc được file Excel");
//     }
//   };
//   reader.readAsArrayBuffer(file);
//   return false; // chặn upload auto
// };

// // Xác nhận nhập -> gọi API
// const handleConfirmImport = async () => {
//   try {
//     const receipt = {
//       receiptDetails: previewData.map((b) => ({
//         bookId: b.bookId,
//         quantity: b.quantity,
//         importPrice: b.importPrice,
//       })),
//     };
//     const res = await receiptApi.create(receipt);
//     messageApi.success(res.data.message || "Nhập hàng thành công");
//     setIsPreviewOpen(false);
//     fetchReceipts();
//   } catch (err) {
//     messageApi.error(err.response?.data?.message || "Import thất bại");
//   }
// };

//   // 📌 load danh sách phiếu nhập
//   const fetchReceipts = async () => {
//     setLoading(true);
//     try {
//       const res = await receiptApi.getAll();
//       const data = res.data.data || [];
//       setReceipts(data);
//       // messageApi.success(res.data.message || "Lấy danh sách phiếu nhập thành công");
//     } catch (err) {
//       messageApi.error(err.response?.data?.message || "Không tải được dữ liệu phiếu nhập");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchReceipts();
//   }, []);

//   useEffect(() => {
//   // lấy danh sách book để so sánh ID - Tên
//   const fetchBooks = async () => {
//     try {
//       const res = await bookApi.getAll();
//       setBookOptions(res.data.data || res.data);
//     } catch {
//       message.error("Không tải được danh sách sách để kiểm tra import");
//     }
//   };
//   fetchBooks();
// }, []);

//   // 📌 load danh sách sách
//   const fetchBooks = async () => {
//     try {
//       const res = await bookApi.getAll();
//       setBookOptions(res.data.data || res.data || []);
//     } catch (err) {
//       messageApi.error(err.response?.data?.message || "Không tải được danh sách sách");
//     }
//   };

//   const openCreateModal = () => {
//     setIsModalOpen(true);
//     setSelectedBooks([]);
//     fetchBooks();
//   };

//   const handleCancel = () => {
//     setIsModalOpen(false);
//   };

//   // 📌 thêm sách vào danh sách nhập
//   const handleAddBook = (bookId) => {
//     const book = bookOptions.find((b) => b.id === bookId);
//     if (book && !selectedBooks.find((b) => b.id === bookId)) {
//       setSelectedBooks([
//         ...selectedBooks,
//         { ...book, quantity: 1, importPrice: 0 },
//       ]);
//     }
//   };

//   const updateBookField = (id, field, value) => {
//     setSelectedBooks((prev) =>
//       prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
//     );
//   };

//   // 📌 lưu phiếu nhập
//   const handleSaveReceipt = async () => {
//     if (selectedBooks.length === 0) {
//       messageApi.warning("Chưa chọn sản phẩm nào!");
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
//       fetchReceipts();
//       setIsModalOpen(false);
//     } catch (err) {
//       messageApi.error(err.response?.data?.message || "Thêm phiếu nhập thất bại");
//     }
//   };

//   // 📌 xem chi tiết phiếu nhập
//   const showDetail = async (record) => {
//     try {
//       const res = await receiptApi.getById(record.id);
//       setDetailReceipt(res.data.data);
//       setIsDetailOpen(true);
//       // messageApi.success(res.data.message || "Lấy chi tiết phiếu nhập thành công");
//     } catch (err) {
//       messageApi.error(err.response?.data?.message || "Không tải được chi tiết phiếu nhập");
//     }
//   };

//   return (
//     <div>
//       {contextHolder}
//       <h2>Lịch sử nhập hàng</h2>
//       <Button type="primary" onClick={openCreateModal} style={{ marginBottom: 16 }}>
//         + Tạo phiếu nhập
//       </Button>

//       {/* <Button
//         icon={<UploadOutlined />}
//         onClick={() => {}}
//         style={{ marginLeft: 8 }}
//       >
//         Import Excel/CSV
//       </Button> */}

//       {/* <Upload
//         name="file"
//         accept=".xlsx,.xls,.csv"
//         showUploadList={false}
//         customRequest={async ({ file, onSuccess, onError }) => {
//           try {
//             const formData = new FormData();
//             formData.append("file", file);
//             const res = await receiptApi.importFile(formData);
//             messageApi.success(res.data.message || "Import thành công");
//             fetchReceipts();
//             onSuccess();
//           } catch (err) {
//             messageApi.error(err.response?.data?.message || "Import thất bại");
//             onError();
//           }
//         }}
//       >
//         <Button icon={<UploadOutlined />}>Nhập từ file (Excel/CSV)</Button>
//       </Upload> */}

//       <Upload
//         accept=".xlsx,.xls"
//         showUploadList={false}
//         beforeUpload={(file) => {
//           handleImportPreview(file);
//           return false; // chặn upload auto
//         }}
//       >
//         <Button>Import Excel</Button>
//       </Upload>

//       {/* <Modal
//         title="Xem lại phiếu nhập"
//         open={isPreviewOpen}
//         onCancel={() => setIsPreviewOpen(false)}
//         onOk={handleConfirmImport}
//         okText="Xác nhận nhập"
//         cancelText="Huỷ"
//         width={800}
//       >
//         <Table
//           rowKey={(r, idx) => idx}
//           dataSource={previewData}
//           bordered
//           pagination={false}
//           columns={[
//             { title: "Mã sách", dataIndex: "bookId" },
//             { title: "Tên sách", dataIndex: "bookTitle" },
//             { title: "Số lượng", dataIndex: "quantity" },
//             { title: "Giá nhập", dataIndex: "importPrice" },
//             {
//               title: "Thành tiền",
//               render: (_, r) => (r.quantity * r.importPrice).toLocaleString() + " VND",
//             },
//           ]}
//           summary={(pageData) => {
//             const total = pageData.reduce((sum, r) => sum + r.quantity * r.importPrice, 0);
//             return (
//               <Table.Summary.Row>
//                 <Table.Summary.Cell colSpan={4}>Tổng cộng</Table.Summary.Cell>
//                 <Table.Summary.Cell>
//                   <b>{total.toLocaleString()} VND</b>
//                 </Table.Summary.Cell>
//               </Table.Summary.Row>
//             );
//           }}
//         />
//       </Modal> */}


//       <Modal
//         title="Xem lại phiếu nhập"
//         open={isPreviewOpen}
//         onCancel={() => setIsPreviewOpen(false)}
//         onOk={handleConfirmImport}
//         okText="Xác nhận nhập"
//         cancelText="Huỷ"
//         width={800}
//       >
//         <Table
//           rowKey={(r, idx) => idx}
//           dataSource={previewData}
//           bordered
//           pagination={false}
//           columns={[
//             { title: "Mã sách", dataIndex: "bookId" },
//             { title: "Tên sách", dataIndex: "bookTitle" },
//             { title: "Số lượng", dataIndex: "quantity" },
//             { title: "Giá nhập", dataIndex: "importPrice" },
//             {
//               title: "Thành tiền",
//               render: (_, r) => (r.quantity * r.importPrice).toLocaleString() + " VND",
//             },
//           ]}
//           summary={(pageData) => {
//             const total = pageData.reduce((sum, r) => sum + r.quantity * r.importPrice, 0);
//             return (
//               <Table.Summary.Row>
//                 <Table.Summary.Cell colSpan={4}>Tổng cộng</Table.Summary.Cell>
//                 <Table.Summary.Cell>
//                   <b>{total.toLocaleString()} VND</b>
//                 </Table.Summary.Cell>
//               </Table.Summary.Row>
//             );
//           }}
//         />
//       </Modal>

//       <Button
//         onClick={() =>
//           window.open("http://localhost:8080/api/receipts/template", "_blank")
//         }
//       >
//         Tải file mẫu
//       </Button>

//       {/* 📌 Bảng danh sách phiếu nhập */}
//       <Table
//         rowKey="id"
//         loading={loading}
//         dataSource={receipts}
//         bordered
//         columns={[
//           { title: "Mã phiếu", dataIndex: "id", width: "10%" },
//           {
//             title: "Ngày tạo",
//             dataIndex: "createdAt",
//             width: "25%",
//             render: (val) => dayjs(val).format("DD/MM/YYYY HH:mm"),
//           },
//           {
//             title: "Tổng tiền",
//             dataIndex: "total",
//             render: (val) => `${(val || 0).toLocaleString()} VND`,
//           },
//           {
//             title: "Hành động",
//             render: (_, record) => (
//               <Button type="link" onClick={() => showDetail(record)}>
//                 Xem chi tiết
//               </Button>
//             ),
//           },
//         ]}
//       />

//       {/* 📌 Modal tạo phiếu nhập */}
//       <Modal
//         title="Tạo phiếu nhập"
//         open={isModalOpen}
//         onCancel={handleCancel}
//         onOk={handleSaveReceipt}
//         width={900}
//         okText="Lưu phiếu nhập"
//         cancelText="Hủy"
//       >
//         <Select
//           showSearch
//           placeholder="Tìm sản phẩm..."
//           style={{ width: "100%", marginBottom: 16 }}
//           onChange={handleAddBook}
//           filterOption={(input, option) =>
//             option?.children?.toLowerCase().includes(input.toLowerCase())
//           }
//         >
//           {bookOptions.map((b) => (
//             <Option key={b.id} value={b.id}>
//               {b.title}
//             </Option>
//           ))}
//         </Select>

//         <Table
//           rowKey="id"
//           pagination={false}
//           bordered
//           dataSource={selectedBooks}
//           columns={[
//             { title: "Mã", dataIndex: "id", width: "5%" },
//             {
//               title: "Hình ảnh",
//               dataIndex: "image",
//               render: (img) =>
//                 img ? <img src={img} alt="" style={{ width: 50 }} /> : "No image",
//             },
//             { title: "Tên sản phẩm", dataIndex: "title" },
//             { title: "Hiện có", dataIndex: "stock", width: "10%" },
//             {
//               title: "Nhập thêm",
//               dataIndex: "quantity",
//               render: (_, record) => (
//                 <InputNumber
//                   min={1}
//                   value={record.quantity}
//                   onChange={(val) => updateBookField(record.id, "quantity", val)}
//                 />
//               ),
//             },
//             {
//               title: "Giá nhập",
//               dataIndex: "importPrice",
//               render: (_, record) => (
//                 <InputNumber
//                   min={0}
//                   value={record.importPrice}
//                   onChange={(val) =>
//                     updateBookField(record.id, "importPrice", val)
//                   }
//                 />
//               ),
//             },
//             {
//               title: "Thành tiền",
//               render: (_, record) =>
//                 `${(record.quantity * record.importPrice).toLocaleString()} VND`,
//             },
//             {
//               title: "Thao tác",
//               render: (_, record) => (
//                 <Button danger onClick={() =>
//                   setSelectedBooks(selectedBooks.filter((b) => b.id !== record.id))
//                 }>
//                   Xóa
//                 </Button>
//               ),
//             },
//           ]}
//           summary={(pageData) => {
//             const total = pageData.reduce(
//               (sum, b) => sum + b.quantity * b.importPrice,
//               0
//             );
//             return (
//               <Table.Summary.Row>
//                 <Table.Summary.Cell colSpan={6}>Tổng cộng</Table.Summary.Cell>
//                 <Table.Summary.Cell colSpan={2}>
//                   <b>{total.toLocaleString()} VND</b>
//                 </Table.Summary.Cell>
//               </Table.Summary.Row>
//             );
//           }}
//         />
//       </Modal>

//       {/* 📌 Modal chi tiết phiếu nhập */}
//       <Modal
//         title={`Chi tiết phiếu nhập #${detailReceipt?.id}`}
//         open={isDetailOpen}
//         onCancel={() => setIsDetailOpen(false)}
//         footer={null}
//         width={900}
//       >
//         <p><b>Ngày tạo:</b> {dayjs(detailReceipt?.createdAt).format("DD/MM/YYYY HH:mm")}</p>
//         <p><b>Tổng tiền:</b> {(detailReceipt?.total || 0).toLocaleString()} VND</p>

//         <Table
//           rowKey="id"
//           bordered
//           pagination={false}
//           dataSource={detailReceipt?.receiptDetails || []}
//           columns={[
//             { title: "STT", render: (_, __, index) => index + 1, width: "5%" },
//             {
//               title: "Ảnh",
//               render: (_, record) =>
//                 record.bookImage ? (
//                   <img src={record.bookImage} alt="" style={{ width: 50 }} />
//                 ) : (
//                   "No image"
//                 ),
//             },
//             { title: "Tên sản phẩm", dataIndex: "bookTitle" },
//             { title: "Số lượng nhập", dataIndex: "quantity" },
//             {
//               title: "Giá nhập",
//               dataIndex: "importPrice",
//               render: (val) => `${val.toLocaleString()} VND`,
//             },
//             {
//               title: "Thành tiền",
//               render: (_, record) =>
//                 `${(record.quantity * record.importPrice).toLocaleString()} VND`,
//             },
//           ]}
//           summary={(pageData) => {
//             const total = pageData.reduce(
//               (sum, b) => sum + b.quantity * b.importPrice,
//               0
//             );
//             return (
//               <Table.Summary.Row>
//                 <Table.Summary.Cell colSpan={5}>Tổng cộng</Table.Summary.Cell>
//                 <Table.Summary.Cell>
//                   <b>{total.toLocaleString()} VND</b>
//                 </Table.Summary.Cell>
//               </Table.Summary.Row>
//             );
//           }}
//         />
//       </Modal>
//     </div>
//   );
// };

// export default ReceiptManage;



import { useEffect, useState } from "react";
import { Button, message } from "antd";
import dayjs from "dayjs";
import receiptApi from "../../api/receiptApi";
import bookApi from "../../api/bookApi";

import ReceiptTable from "./ReceiptTable";
import ReceiptCreateModal from "./ReceiptCreateModal";
import ReceiptDetailModal from "./ReceiptDetailModal";
import ImportExcelButton from "./ImportExcelButton";

const ReceiptManage = () => {
  const [receipts, setReceipts] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailReceipt, setDetailReceipt] = useState(null);

  const [messageApi, contextHolder] = message.useMessage();

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await receiptApi.getAll();
      setReceipts(res.data.data || []);
    } catch (err) {
      messageApi.error("Không tải được phiếu nhập");
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      const res = await bookApi.getAll();
      setBooks(res.data.data || res.data || []);
    } catch {
      messageApi.error("Không tải được danh sách sách");
    }
  };

  useEffect(() => {
    fetchReceipts();
    fetchBooks();
  }, []);

  return (
    <div>
      {contextHolder}
      <h2>Lịch sử nhập hàng</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Button type="primary" onClick={() => setIsCreateOpen(true)}>
          + Tạo phiếu nhập
        </Button>
        <ImportExcelButton books={books} onSuccess={fetchReceipts} />
        <Button
          onClick={() =>
            window.open("http://localhost:8080/api/receipts/template", "_blank")
          }
        >
          Tải file mẫu
        </Button>
      </div>

      <ReceiptTable
        receipts={receipts}
        loading={loading}
        onShowDetail={setDetailReceipt}
      />

      <ReceiptCreateModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        books={books}
        onSuccess={fetchReceipts}
      />

      <ReceiptDetailModal
        receipt={detailReceipt}
        onClose={() => setDetailReceipt(null)}
      />
    </div>
  );
};

export default ReceiptManage;
