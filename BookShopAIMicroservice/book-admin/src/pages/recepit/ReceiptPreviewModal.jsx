import { Modal, Table } from "antd";

const ReceiptPreviewModal = ({ open, data, onCancel, onConfirm }) => {
    // Kiểm tra nếu có bất kỳ dòng nào warn thì disable nút xác nhận
    const hasWarn = data?.some((item) => item.warn);

    return (
        <Modal
            title="Xem lại phiếu nhập"
            open={open}
            onCancel={onCancel}
            onOk={onConfirm}
            okText="Xác nhận nhập"
            cancelText="Huỷ"
            width={800}
            okButtonProps={{ disabled: hasWarn }}
        >
            <Table
                rowKey={(r, idx) => idx}
                dataSource={data}
                bordered
                pagination={false}
                columns={[
                    { title: "Mã sách", dataIndex: "bookId" },
                    {
                        title: "Tên sách",
                        dataIndex: "bookTitle",
                        render: (val, record) =>
                            record.warn ? <span style={{ color: "orange" }}>⚠ {val} (không khớp DB)</span> : val,
                    },

                    { title: "Số lượng", dataIndex: "quantity" },
                    { title: "Giá nhập", dataIndex: "importPrice" },
                    {
                        title: "Thành tiền",
                        render: (_, r) => (r.quantity * r.importPrice).toLocaleString() + " VND",
                    },
                ]}
                summary={(pageData) => {
                    const total = pageData.reduce((sum, r) => sum + r.quantity * r.importPrice, 0);
                    return (
                        <Table.Summary.Row>
                            <Table.Summary.Cell colSpan={4}>Tổng cộng</Table.Summary.Cell>
                            <Table.Summary.Cell>
                                <b>{total.toLocaleString()} VND</b>
                            </Table.Summary.Cell>
                        </Table.Summary.Row>
                    );
                }}
            />
        </Modal>
    );
};

export default ReceiptPreviewModal;
