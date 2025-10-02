import { useState } from "react";
import { Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import ReceiptPreviewModal from "./ReceiptPreviewModal";
import receiptApi from "../../api/receiptApi";

const ImportExcelButton = ({ books, onSuccess }) => {
  const [previewData, setPreviewData] = useState([]);
  const [open, setOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();


    const handleImportPreview = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // ✅ Check header chính xác
      const header = rows[0];
      const expectedHeader = [
        "Mã sách",
        "Tên sách",
        "Số lượng nhập",
        "Giá nhập",
      ];
      if (!header || expectedHeader.some((h, i) => header[i] !== h)) {
        messageApi.error("❌ File không đúng định dạng mẫu!");
        return;
      }

      // ✅ Parse rows
      const parsed = [];
      const errors = [];
      rows.slice(1).forEach((r, idx) => {
        if (!r || r.length < 4) return;
        const [bookId, bookTitle, quantity, importPrice] = r;

        const book = bookOptions.find((b) => b.id === Number(bookId));
        if (!book) {
          errors.push(`Dòng ${idx + 2}: ❌ bookId ${bookId} không tồn tại`);
          return;
        }

        if (book.title.trim() !== String(bookTitle).trim()) {
          errors.push(`⚠️ Dòng ${idx + 2}: Tên sách không khớp với bookId`);
        }

        if (!quantity || quantity <= 0) {
          errors.push(`Dòng ${idx + 2}: ❌ Số lượng phải > 0`);
        }
        if (importPrice < 0) {
          errors.push(`Dòng ${idx + 2}: ❌ Giá nhập không hợp lệ`);
        }

        parsed.push({
          bookId: Number(bookId),
          bookTitle,
          quantity: Number(quantity),
          importPrice: Number(importPrice),
        });
      });

      if (errors.length > 0) {
        messageApi.error("Có lỗi trong file, kiểm tra lại!");
        errors.forEach((err) => messageApi.warning(err));
        return;
      }

      setPreviewData(parsed);
      setIsPreviewOpen(true);
    } catch (err) {
      messageApi.error("❌ Dữ liệu file không hợp lệ");
    }
  };
  reader.readAsArrayBuffer(file);
  return false; // chặn upload auto
};


  const handleConfirm = async () => {
    try {
      const receipt = {
        receiptDetails: previewData.map((b) => ({
          bookId: b.bookId,
          quantity: b.quantity,
          importPrice: b.importPrice,
        })),
      };
      await receiptApi.create(receipt);
      message.success("Nhập hàng thành công");
      setOpen(false);
      onSuccess();
    } catch {
      message.error("Import thất bại");
    }
  };




  return (
    <>
        {contextHolder}
      <Upload accept=".xlsx,.xls" showUploadList={false} beforeUpload={handleImportPreview}>
        <Button icon={<UploadOutlined />}>Import Excel</Button>
      </Upload>

      <ReceiptPreviewModal
        open={open}
        data={previewData}
        onCancel={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
};

export default ImportExcelButton;
