
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderApi } from "../../api/orderApi";
import { reviewApi } from "../../api/reviewApi";
import {
  Box, Card, CardContent, Typography, CircularProgress, Chip, Button, Table, TableHead,
  TableRow, TableCell, TableBody, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  Divider, TextField, Rating
} from "@mui/material";
import { Modal as AntdModal, Radio, Space, message } from "antd"; // dùng antd Modal cho popup lý do (mượt)

const fmtVND = (n) => (n ?? 0).toLocaleString() + "₫";
const fmtDate = (s) => (s ? new Date(s).toLocaleString() : "");
const statusColor = (st) => ({PENDING:"warning",CONFIRM:"info",SHIPPED:"primary",COMPLETED:"success",CANCELLED:"error"}[(st||"").toUpperCase()]||"default");
const PayChip = ({ paid }) => <Chip label={paid ? "ĐÃ THANH TOÁN" : "CHƯA THANH TOÁN"} color={paid ? "success" : "default"} size="small" />;

export default function OrderHistory() {
  const nav = useNavigate();
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);

  // Xem nhanh
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  // Đánh giá
  const [rvOpen, setRvOpen] = useState(false);
  const [rvForm, setRvForm] = useState({ orderItemId: null, stars: 5, comment: "" });

  // Hủy đơn (popup chọn lý do)
  const [cancelDlg, setCancelDlg] = useState({ open: false, order: null, reasonType: "OTHER", other: "Khách yêu cầu hủy" });

  const uid = JSON.parse(localStorage.getItem("user") || "null")?.uid;

  const load = async () => {
    try {
      if (!uid) { setOrders([]); return; }
      const res = await orderApi.getHistory(uid);
      setOrders(res?.data?.data || []);
    } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); /* eslint-disable-next-line */ },[]);

  const sorted = useMemo(()=> !orders?[]:[...orders].sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt)), [orders]);

  const openDetailQuick = (o) => { setCurrent(o); setOpen(true); };
  const closeDetail = () => { setOpen(false); setCurrent(null); };

  // Review
  const openReview = (orderItem) => { setRvForm({ orderItemId: orderItem.id, stars: 5, comment: "" }); setRvOpen(true); };
  const closeReview = () => setRvOpen(false);
  const submitReview = async () => {
    try {
      await reviewApi.create(uid, rvForm);
      // update current
      setCurrent(prev => prev ? ({ ...prev, items: prev.items.map(it => it.id===rvForm.orderItemId ? { ...it, hasReview: true } : it) }) : prev);
      // update list
      setOrders(prev => prev?.map(o => o.id!==current.id ? o : ({ ...o, items: o.items?.map(it => it.id===rvForm.orderItemId ? { ...it, hasReview: true } : it) })));
      setRvOpen(false);
      message.success("Đã gửi đánh giá");
    } catch (e) {
      console.error(e);
      message.error(e?.response?.data?.message || "Gửi đánh giá thất bại");
    }
  };

  // Cancel
  const openCancel = (order) => setCancelDlg({ open: true, order, reasonType: "OTHER", other: "Khách yêu cầu hủy" });
  const closeCancel = () => setCancelDlg({ open: false, order: null, reasonType: "OTHER", other: "Khách yêu cầu hủy" });
  const doCancel = async () => {
    const { order, reasonType, other } = cancelDlg;
    const map = {
      OUT_OF_STOCK: "Chỉnh sửa thông tin nhận",
      INVALID_INFO: "Đổi ý không muốn mua nữa",
      OTHER: other?.trim() || "Không muốn nói",
    };
    const reason = reasonType === "OTHER" ? map.OTHER : map[reasonType];

    try {
      const res = await orderApi.cancelOrder(uid, order.id, reason);
      const updated = res.data.data;
      // cập nhật list
      setOrders(prev => prev.map(o => o.id===order.id ? { ...o, status: updated.status, cancelReason: updated.cancelReason } : o));
      // cập nhật current trong dialog nếu đang mở
      setCurrent(prev => prev && prev.id===order.id ? { ...prev, status: updated.status, cancelReason: updated.cancelReason } : prev);

      message.success("Đã hủy đơn");
      closeCancel();
    } catch (e) {
      console.error(e);
      message.error(e?.response?.data?.message || "Hủy đơn thất bại");
    }
  };

  if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress/></Box>;
  if (!sorted.length)
    return (<Box p={5} textAlign="center"><Typography variant="h6">Bạn chưa có đơn hàng nào.</Typography><Typography color="text.secondary">Hãy đặt thử nhé!</Typography></Box>);

  return (
    <Box p={4}>
      <Typography variant="h5" fontWeight={700} mb={2}>📚 Lịch sử đơn hàng</Typography>

      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã đơn (UUID)</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Thanh toán</TableCell>
                <TableCell>Phương thức</TableCell>
                <TableCell align="right">Tổng tiền</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map(o=>(
                <TableRow key={o.id} hover>
                  <TableCell sx={{fontFamily:"monospace"}}>{o.id}</TableCell>
                  <TableCell><Chip label={o.status} color={statusColor(o.status)} size="small"/></TableCell>
                  <TableCell><PayChip paid={!!o.paymentStatus}/></TableCell>
                  <TableCell>{o.paymentMethod || "-"}</TableCell>
                  <TableCell align="right" sx={{fontWeight:700}}>{fmtVND(o.total)}</TableCell>
                  <TableCell>{fmtDate(o.createdAt)}</TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="contained" onClick={()=> nav(`/orders/${o.id}`)}>Xem</Button>
                    <Button size="small" sx={{ml:1}} variant="outlined" onClick={()=> openDetailQuick(o)}>Xem nhanh</Button>
                    {o.status === "PENDING" && (
                      <Button size="small" color="error" sx={{ml:1}} onClick={()=> openCancel(o)}>
                        Hủy đơn
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Xem nhanh */}
      <Dialog open={open} onClose={closeDetail} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết đơn • <span style={{fontFamily:"monospace"}}>{current?.id}</span></DialogTitle>
        <DialogContent dividers>
          {current && (
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip label={current.status} color={statusColor(current.status)} />
                <PayChip paid={!!current.paymentStatus} />
                <Chip label={`PM: ${current.paymentMethod || "-"}`} variant="outlined" />
                <Chip label={`Tổng: ${fmtVND(current.total)}`} color="primary" variant="outlined" />
              </Stack>

              <Box>
                <Typography fontWeight={700} mb={0.5}>📦 Địa chỉ nhận</Typography>
                <Typography>{current.receiveName}</Typography>
                <Typography>{current.receivePhone}</Typography>
                <Typography>{current.receiveAddress}</Typography>
                {current.note && <Typography mt={1} color="text.secondary">Ghi chú: {current.note}</Typography>}
                {current.cancelReason && <Typography mt={1} color="error.main">Lý do hủy: {current.cancelReason}</Typography>}
              </Box>

              <Divider />

              <Box>
                <Typography fontWeight={700} mb={1}>🧾 Sản phẩm</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Ảnh</TableCell>
                      <TableCell>Sách</TableCell>
                      <TableCell align="right">Giá</TableCell>
                      <TableCell align="right">SL</TableCell>
                      <TableCell align="right">Thành tiền</TableCell>
                      <TableCell align="center">Hành động</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(current.items||[]).map(it=>(
                      <TableRow key={it.id}>
                        <TableCell><img src={it.bookImage} alt={it.bookTitle} style={{width:46,height:46,borderRadius:6,objectFit:"cover"}}/></TableCell>
                        <TableCell>{it.bookTitle}</TableCell>
                        <TableCell align="right">{fmtVND(it.price)}</TableCell>
                        <TableCell align="right">{it.quantity}</TableCell>
                        <TableCell align="right">{fmtVND(it.total)}</TableCell>
                        <TableCell align="center">
                          {current.status === "COMPLETED" ? (
                            it.hasReview ? (
                              <Typography color="success.main" fontSize={13}>Đã đánh giá</Typography>
                            ) : (
                              <Button size="small" variant="outlined" onClick={()=> openReview(it)}>Đánh giá</Button>
                            )
                          ) : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions><Button onClick={closeDetail}>Đóng</Button></DialogActions>
      </Dialog>

      {/* Popup đánh giá */}
      <Dialog open={rvOpen} onClose={closeReview} maxWidth="sm" fullWidth>
        <DialogTitle>Đánh giá sản phẩm</DialogTitle>
        <DialogContent dividers>
          <Box display="grid" gap={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography>Chấm sao:</Typography>
              <Rating value={rvForm.stars} onChange={(_,v)=> setRvForm(f=>({...f, stars: v||5}))}/>
            </Box>
            <TextField label="Nhận xét" multiline minRows={3}
                       value={rvForm.comment}
                       onChange={(e)=> setRvForm(f=>({...f, comment: e.target.value}))}/>
            <Typography variant="body2" color="text.secondary">
              Bạn chỉ có thể đánh giá mỗi sản phẩm trong đơn một lần.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeReview}>Hủy</Button>
          <Button variant="contained" onClick={submitReview}>Gửi đánh giá</Button>
        </DialogActions>
      </Dialog>

      {/* Popup hủy đơn (Antd) */}
      <AntdModal
        title="Hủy đơn hàng"
        open={cancelDlg.open}
        okText="Hủy đơn"
        okButtonProps={{ danger: true }}
        onOk={doCancel}
        onCancel={closeCancel}
      >
        <Radio.Group
          value={cancelDlg.reasonType}
          onChange={(e)=> setCancelDlg(s=>({...s, reasonType: e.target.value}))}
        >
          <Space direction="vertical">
            <Radio value="OUT_OF_STOCK">Hết hàng</Radio>
            <Radio value="INVALID_INFO">Thông tin không hợp lệ</Radio>
            <Radio value="OTHER">Lý do khác</Radio>
          </Space>
        </Radio.Group>

        {cancelDlg.reasonType === "OTHER" && (
          <TextField
            fullWidth
            label="Lý do"
            margin="dense"
            value={cancelDlg.other}
            onChange={(e)=> setCancelDlg(s=>({...s, other: e.target.value}))}
          />
        )}

        <Typography mt={1} variant="body2" color="text.secondary">
          Sau khi xác nhận, đơn sẽ chuyển sang trạng thái <b>Cancelled</b>.
        </Typography>
      </AntdModal>
    </Box>
  );
}
