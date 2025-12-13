// src/pages/Chatbot/ChatbotManage.jsx
import React, { useEffect, useState } from "react";
import { 
  Table, Button, Modal, Upload, Progress, Card, 
  Typography, Space, Tag, message, Popconfirm, Divider, Empty, List
} from "antd";
import { 
  CloudUploadOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  ReloadOutlined, 
  FileTextOutlined, 
  RobotOutlined,
  DatabaseOutlined,
  SendOutlined
} from "@ant-design/icons";
import {
  getPolicies,
  uploadPolicyFile,
  triggerIngest,
  getPolicyContent,
  deletePolicy,
} from "../../api/apiChatbot";
import "./ChatbotManage.css"; 

const { Title, Text } = Typography;
const { Dragger } = Upload;

export default function ChatbotManage() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // State quản lý danh sách file chờ upload
  const [fileList, setFileList] = useState([]);
  
  // State cho Progress bar ingest
  const [ingestPercent, setIngestPercent] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  // State cho Preview Modal (Dùng chung cho cả file trên server và file local)
  const [preview, setPreview] = useState({ open: false, filename: "", content: "" });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const list = await getPolicies();
      setPolicies(list || []);
    } catch (err) {
      message.error("Không thể tải danh sách tài liệu.");
    } finally {
      setLoading(false);
    }
  };

  // --- XỬ LÝ PREVIEW FILE LOCAL (TRƯỚC KHI UPLOAD) ---
  const handlePreviewLocalFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview({
        open: true,
        filename: file.name,
        content: e.target.result,
      });
    };
    reader.readAsText(file); // Đọc file dưới dạng text
  };

  // --- XỬ LÝ UPLOAD HÀNG LOẠT ---
  const handleStartUpload = async () => {
    if (fileList.length === 0) return;
    
    setUploading(true);
    let successCount = 0;

    for (const file of fileList) {
      try {
        await uploadPolicyFile(file);
        successCount++;
      } catch (err) {
        message.error(`Lỗi khi tải file ${file.name}`);
      }
    }

    if (successCount > 0) {
      message.success(`Đã tải lên thành công ${successCount} tập tin.`);
      setFileList([]); // Xóa danh sách chờ sau khi xong
      fetchPolicies();
    }
    setUploading(false);
  };

  // Cấu hình Dragger
  const uploadProps = {
    multiple: true,
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      // Kiểm tra định dạng file
      const isAllowed = [".txt", ".pdf", ".md"].some(ext => file.name.endsWith(ext));
      if (!isAllowed) {
        message.error(`${file.name} không đúng định dạng hỗ trợ.`);
        return Upload.LIST_IGNORE;
      }
      setFileList((prev) => [...prev, file]);
      return false; // Chặn không cho upload tự động lên server
    },
    fileList,
  };

  // --- CÁC HÀM CŨ (GIỮ NGUYÊN) ---
  const handleTriggerIngest = async () => {
    setIngestPercent(0);
    setShowProgress(true);
    const interval = setInterval(() => {
      setIngestPercent(prev => (prev >= 90 ? 90 : prev + 10));
    }, 400);

    setActionLoading(true);
    try {
      await triggerIngest();
      clearInterval(interval);
      setIngestPercent(100);
      message.success("Hệ thống đã cập nhật tri thức mới thành công!");
      setTimeout(() => setShowProgress(false), 2000);
    } catch (err) {
      clearInterval(interval);
      setShowProgress(false);
      message.error("Lỗi khi cập nhật dữ liệu.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePreviewServer = async (filename) => {
    setActionLoading(true);
    try {
      const data = await getPolicyContent(filename);
      setPreview({ open: true, filename: data.filename, content: data.content });
    } catch (err) {
      message.error("Không thể đọc nội dung file.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (filename) => {
    setActionLoading(true);
    try {
      await deletePolicy(filename);
      message.success(`Đã xóa file ${filename}`);
      fetchPolicies();
    } catch (err) {
      message.error("Xóa file thất bại.");
    } finally {
      setActionLoading(false);
      fetchPolicies();
    }
  };

  const humanSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const columns = [
    {
      title: "Tên tài liệu",
      dataIndex: "filename",
      key: "filename",
      render: (text) => (
        <Space>
          <FileTextOutlined style={{ color: "#1890ff" }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Kích thước",
      dataIndex: "size",
      key: "size",
      render: (size) => <Tag color="blue">{humanSize(size)}</Tag>,
    },
    {
      title: "Ngày tải lên",
      dataIndex: "uploaded_at",
      key: "uploaded_at",
      render: (date) => new Date(date).toLocaleString("vi-VN"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handlePreviewServer(record.filename)}>Xem</Button>
          <Popconfirm title="Xóa tài liệu?" onConfirm={() => handleDelete(record.filename)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <Button type="link" danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Card bordered={false} className="glass-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <Title level={2} style={{ margin: 0 }}><RobotOutlined /> Quản lý Tri thức Chatbot</Title>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchPolicies} loading={loading}>Làm mới</Button>
            <Button type="primary" icon={<DatabaseOutlined />} onClick={handleTriggerIngest} loading={actionLoading}>Cập nhật dữ liệu</Button>
          </Space>
        </div>

        {showProgress && (
          <div style={{ marginBottom: "24px", padding: "16px", background: "#f0f5ff", borderRadius: "8px" }}>
            <Text strong>Tiến trình đồng bộ Vector Database...</Text>
            <Progress percent={ingestPercent} status={ingestPercent === 100 ? "success" : "active"} />
          </div>
        )}

        <Table columns={columns} dataSource={policies} rowKey="filename" loading={loading} pagination={{ pageSize: 5 }} />

        <Divider orientation="left" style={{ marginTop: "40px" }}>Thêm tài liệu mới</Divider>
        
        <Card type="inner" title={<span><CloudUploadOutlined /> Tải lên tập tin (.txt, .pdf, .md)</span>}>
          <Dragger {...uploadProps} showUploadList={false}>
            <p className="ant-upload-drag-icon"><CloudUploadOutlined /></p>
            <p className="ant-upload-text">Nhấp hoặc kéo nhiều tệp vào đây</p>
          </Dragger>

          {/* HIỂN THỊ DANH SÁCH FILE CHỜ UPLOAD */}
          {fileList.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <Text strong>Hàng chờ tải lên ({fileList.length} file):</Text>
              <List
                size="small"
                bordered
                style={{ marginTop: 10, background: '#fff' }}
                dataSource={fileList}
                renderItem={(file) => (
                  <List.Item
                    actions={[
                      <Button size="small" icon={<EyeOutlined />} onClick={() => handlePreviewLocalFile(file)}>Xem trước</Button>,
                      <Button size="small" danger icon={<DeleteOutlined />} onClick={() => uploadProps.onRemove(file)} />
                    ]}
                  >
                    <Space>
                      <FileTextOutlined />
                      {file.name} 
                      <Text type="secondary">({humanSize(file.size)})</Text>
                    </Space>
                  </List.Item>
                )}
              />
              <Button 
                type="primary" 
                block 
                icon={<SendOutlined />} 
                style={{ marginTop: 16, height: 45 }}
                onClick={handleStartUpload}
                loading={uploading}
              >
                Xác nhận Tải {fileList.length} tập tin lên Server
              </Button>
            </div>
          )}
        </Card>
      </Card>

      {/* MODAL PREVIEW (Dùng chung) */}
      <Modal
        title={<Space><FileTextOutlined /> Nội dung: {preview.filename}</Space>}
        open={preview.open}
        onCancel={() => setPreview({ ...preview, open: false })}
        footer={[<Button key="close" onClick={() => setPreview({ ...preview, open: false })}>Đóng</Button>]}
        width={800}
        centered
      >
        <div style={{ maxHeight: "60vh", overflowY: "auto", background: "#f5f5f5", padding: "16px", borderRadius: "4px" }}>
          <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word", margin: 0 }}>
            {preview.content}
          </pre>
        </div>
      </Modal>
    </div>
  );
}