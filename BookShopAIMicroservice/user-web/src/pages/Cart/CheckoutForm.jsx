// //src/pages/Cart/CheckoutForm.jsx
// import React, { useState } from "react";
// import {
//   Card,
//   CardContent,
//   Typography,
//   Box,
//   TextField,
//   Divider,
//   RadioGroup,
//   FormControlLabel,
//   Radio,
//   Button,
//   Tooltip,
// } from "@mui/material";
// import { orderApi } from "../../api/orderApi";

// export default function CheckoutForm({
//   cart,
//   uid,
//   itemsTotal,
//   canCheckout,
//   blockers,
//   meta,
//   busy,
//   setBusy,
//   notify,
//   load,
// }) {
//   const [form, setForm] = useState({
//     receiveName: `${JSON.parse(localStorage.getItem("user"))?.firstname || ""} ${
//       JSON.parse(localStorage.getItem("user"))?.lastname || ""
//     }`.trim(),
//     receivePhone:
//       JSON.parse(localStorage.getItem("user"))?.phone || "0359490251",
//     receiveAddress:
//       JSON.parse(localStorage.getItem("user"))?.address ||
//       "97 Man Thiện, Tăng Nhơn Phú A, Thủ Đức, HCM",
//     shippingFee: 15000,
//     note: "Giao giờ hành chính",
//     paymentMethod: "COD",
//   });

//   const handleCheckout = async () => {
//     if (!canCheckout) {
//       const msg = blockers
//         .map((b) => {
//           const t = meta[b.bookId]?.title || `Sách #${b.bookId}`;
//           return `• ${t}: ${b.reason}`;
//         })
//         .join("\n");
//       notify("error", `Không thể đặt hàng. Vui lòng xử lý:\n${msg}`);
//       return;
//     }

//     try {
//       setBusy(true);
//       // 🟢 Nếu chọn thanh toán online
//       if (form.paymentMethod === "ONLINE") {
//         const res = await orderApi.checkoutOnline(uid, form);
//         const paymentUrl = res?.data?.data?.paymentUrl;
//         if (paymentUrl) {
//           notify("success", "Đang chuyển đến cổng thanh toán...");
//           window.open(paymentUrl, "_blank"); // 👉 đi tới cổng thanh toán ở tab mới và ở tab hiện tại chuyển sang lịch sử đơn hang
//           setTimeout(() => (window.location.href = "/orders"), 1500);
//           return;
//         } else {
//           notify("error", "Không nhận được liên kết thanh toán");
//         }
//       } else {
//         // 🟠 COD bình thường
//         const res = await orderApi.checkout(uid, form);
//         const order = res?.data?.data;
//         notify("success", `Đặt hàng thành công • Mã đơn: ${order?.id}`);
//         setTimeout(() => (window.location.href = "/orders"), 1500);
//       }
//     } catch (e) {
//       console.error(e);
//       notify("error", e?.response?.data?.message || "Checkout thất bại");
//       load();
//     } finally {
//       setBusy(false);
//     }
//   };

//   return (
//     <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
//       <CardContent>
//         <Typography variant="h6" mb={2}>
//           📦 Thông tin nhận hàng
//         </Typography>
//         <Box display="grid" gap={1.5}>
//           <TextField
//             label="Họ tên"
//             size="small"
//             value={form.receiveName}
//             onChange={(e) => setForm({ ...form, receiveName: e.target.value })}
//           />
//           <TextField
//             label="Số điện thoại"
//             size="small"
//             value={form.receivePhone}
//             onChange={(e) => setForm({ ...form, receivePhone: e.target.value })}
//           />
//           <TextField
//             label="Địa chỉ"
//             size="small"
//             value={form.receiveAddress}
//             onChange={(e) => setForm({ ...form, receiveAddress: e.target.value })}
//           />
//           <TextField
//             label="Phí vận chuyển"
//             type="number"
//             size="small"
//             value={form.shippingFee}
//             onChange={(e) =>
//               setForm({ ...form, shippingFee: Number(e.target.value) })
//             }
//           />
//           <TextField
//             label="Ghi chú"
//             size="small"
//             value={form.note}
//             onChange={(e) => setForm({ ...form, note: e.target.value })}
//           />
//         </Box>

//         <Divider sx={{ my: 2 }} />

//         <RadioGroup
//           row
//           value={form.paymentMethod}
//           onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
//         >
//           <FormControlLabel value="COD" control={<Radio />} label="COD" />
//           <FormControlLabel value="ONLINE" control={<Radio />} label="Online" />
//         </RadioGroup>

//         <Divider sx={{ my: 2 }} />

//         <Box display="flex" justifyContent="space-between" mb={1}>
//           <Typography>Tạm tính</Typography>
//           <Typography>{itemsTotal.toLocaleString()}₫</Typography>
//         </Box>
//         <Box display="flex" justifyContent="space-between" mb={1}>
//           <Typography>Phí ship</Typography>
//           <Typography>{(form.shippingFee || 0).toLocaleString()}₫</Typography>
//         </Box>
//         <Divider sx={{ my: 1 }} />
//         <Box
//           display="flex"
//           justifyContent="space-between"
//           fontWeight={700}
//           fontSize={17}
//         >
//           <Typography>Tổng cộng</Typography>
//           <Typography color="primary">
//             {(itemsTotal + (form.shippingFee || 0)).toLocaleString()}₫
//           </Typography>
//         </Box>

//         <Tooltip
//           title={
//             canCheckout
//               ? ""
//               : "Không thể đặt hàng do có sản phẩm không hiển thị/hết hàng. Hãy xoá hoặc chỉnh số lượng."
//           }
//         >
//           <span>
//             <Button
//               fullWidth
//               sx={{ mt: 2, py: 1.2, fontWeight: 600 }}
//               variant="contained"
//               color="primary"
//               disabled={busy || !canCheckout}
//               onClick={handleCheckout}
//             >
//               {form.paymentMethod === "ONLINE"
//                 ? "Thanh toán Online"
//                 : `Xác nhận đặt hàng (${form.paymentMethod})`}
//             </Button>
//           </span>
//         </Tooltip>
//       </CardContent>
//     </Card>
//   );
// }








import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Card, CardContent, Typography, Box, TextField, Divider,
  RadioGroup, FormControlLabel, Radio, Button, Tooltip, CircularProgress
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { GHNLocationApi } from "../../api/ghn_location_api";
import { calculateShippingFeeByServiceType } from "../../api/shipping_api";
import { orderApi } from "../../api/orderApi";

const STORAGE_KEY = "checkoutAddress.v1";
const DEFAULT_NOTE = "Giao giờ hành chính";
const FALLBACK_WEIGHT_PER_ITEM = 300; // gram/1 sp

export default function CheckoutForm({
  cart, uid, itemsTotal, canCheckout, blockers, meta,
  busy, setBusy, notify, load,
}) {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingFee, setLoadingFee] = useState(false);
  const [errors, setErrors] = useState({});

  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

  const [form, setForm] = useState({
    receiveName: `${currentUser?.firstname || ""} ${currentUser?.lastname || ""}`.trim(),
    receivePhone: currentUser?.phone || "",
    province: saved?.province || null,
    district: saved?.district || null,
    ward: saved?.ward || null,
    addressDetail: saved?.addressDetail || "",
    receiveAddress: saved?.receiveAddress || "",
    shippingFee: saved?.shippingFee || 0,
    note: saved?.note ?? DEFAULT_NOTE,
    paymentMethod: "COD",
  });

  // tổng khối lượng (realtime khi cart thay đổi)
  const totalWeight = useMemo(() => {
    if (!cart?.items?.length) return 0;
    return cart.items.reduce((sum, it) => {
      const w = it.weight ? Number(it.weight) : FALLBACK_WEIGHT_PER_ITEM;
      return sum + w * (it.quantity || 1);
    }, 0);
  }, [cart]);

  useEffect(() => { GHNLocationApi.getProvinces().then(setProvinces).catch(console.error); }, []);

  useEffect(() => {
    if (form.province?.ProvinceID) {
      GHNLocationApi.getDistricts(form.province.ProvinceID)
        .then((list) => { setDistricts(list); setWards([]); })
        .catch(console.error);
      setForm((f) => ({ ...f, district: null, ward: null }));
      setErrors((e) => ({ ...e, province: undefined, district: undefined, ward: undefined }));
    }
  }, [form.province?.ProvinceID]);

  useEffect(() => {
    if (form.district?.DistrictID) {
      GHNLocationApi.getWards(form.district.DistrictID)
        .then(setWards)
        .catch(console.error);
      setForm((f) => ({ ...f, ward: null }));
      setErrors((e) => ({ ...e, district: undefined, ward: undefined }));
    }
  }, [form.district?.DistrictID]);

  // ghép địa chỉ hiển thị
  useEffect(() => {
    const addr = [
      form.addressDetail?.trim(),
      form.ward?.WardName,
      form.district?.DistrictName,
      form.province?.ProvinceName,
    ].filter(Boolean).join(", ");
    if (addr !== form.receiveAddress) setForm((f) => ({ ...f, receiveAddress: addr }));
  }, [form.addressDetail, form.ward?.WardName, form.district?.DistrictName, form.province?.ProvinceName]);

  // debounce tính phí ship khi đủ ward + weight thay đổi
  const feeTimer = useRef(null);
  useEffect(() => {
    if (!form.district?.DistrictID || !form.ward?.WardCode) return;
    if (feeTimer.current) clearTimeout(feeTimer.current);
    feeTimer.current = setTimeout(async () => {
      try {
        setLoadingFee(true);
        const fee = await calculateShippingFeeByServiceType(
          form.district.DistrictID, String(form.ward.WardCode), Math.max(totalWeight, 200)
        );
        setForm((f) => ({ ...f, shippingFee: fee }));
      } catch (e) {
        notify("error", e.message || "Không tính được phí vận chuyển");
      } finally {
        setLoadingFee(false);
      }
    }, 350);
    return () => clearTimeout(feeTimer.current);
  }, [form.district?.DistrictID, form.ward?.WardCode, totalWeight]);

  // lưu tạm thời vào localStorage (prefill lần sau)
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        province: form.province,
        district: form.district,
        ward: form.ward,
        addressDetail: form.addressDetail,
        receiveAddress: form.receiveAddress,
        shippingFee: form.shippingFee,
        note: form.note,
      })
    );
  }, [form.province, form.district, form.ward, form.addressDetail, form.receiveAddress, form.shippingFee, form.note]);

  // ====== VALIDATE khi bấm đặt hàng ======
  const validate = () => {
    const next = {};
    const phoneOk = /^0\d{9}$/.test((form.receivePhone || "").trim()); // SĐT VN cơ bản 10 số bắt đầu 0
    if (!form.receiveName?.trim()) next.receiveName = "Vui lòng nhập họ tên";
    if (!form.receivePhone?.trim()) next.receivePhone = "Vui lòng nhập số điện thoại";
    else if (!phoneOk) next.receivePhone = "Số điện thoại không hợp lệ (10 số, bắt đầu 0)";
    if (!form.province?.ProvinceID) next.province = "Chọn Tỉnh/Thành";
    if (!form.district?.DistrictID) next.district = "Chọn Quận/Huyện";
    if (!form.ward?.WardCode) next.ward = "Chọn Phường/Xã";
    if (!form.addressDetail?.trim()) next.addressDetail = "Nhập số nhà, tên đường";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCheckout = async () => {
    if (!canCheckout) {
      const msg = blockers.map((b) => {
        const t = meta[b.bookId]?.title || `Sách #${b.bookId}`;
        return `• ${t}: ${b.reason}`;
      }).join("\n");
      notify("error", `Không thể đặt hàng:\n${msg}`);
      return;
    }

    if (!validate()) {
      notify("error", "Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }

    try {
      setBusy(true);
      const payload = {
        ...form,
        provinceId: form.province.ProvinceID,
        districtId: form.district.DistrictID,
        wardCode: form.ward.WardCode,
        shippingFee: form.shippingFee,
      };

      if (form.paymentMethod === "ONLINE") {
        const res = await orderApi.checkoutOnline(uid, payload);
        const url = res?.data?.data?.paymentUrl;
        if (url) {
          notify("success", "Đang chuyển đến cổng thanh toán...");
          window.open(url, "_blank");
          setTimeout(() => (window.location.href = "/orders"), 1500);
          return;
        }
        notify("error", "Không nhận được liên kết thanh toán");
      } else {
        const res = await orderApi.checkout(uid, payload);
        notify("success", `Đặt hàng thành công • Mã đơn: ${res.data.data.id}`);
        setTimeout(() => (window.location.href = "/orders"), 1500);
      }
    } catch (e) {
      notify("error", e?.response?.data?.message || e.message || "Checkout thất bại");
      load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" mb={2}>📦 Thông tin nhận hàng</Typography>

        <Box display="grid" gap={1.5}>
          <TextField
            label="Họ tên"
            size="small"
            required
            error={!!errors.receiveName}
            helperText={errors.receiveName}
            value={form.receiveName}
            onChange={(e) => { setForm({ ...form, receiveName: e.target.value }); setErrors((x)=>({...x,receiveName:undefined})); }}
          />
          <TextField
            label="Số điện thoại"
            size="small"
            required
            error={!!errors.receivePhone}
            helperText={errors.receivePhone}
            value={form.receivePhone}
            onChange={(e) => { setForm({ ...form, receivePhone: e.target.value }); setErrors((x)=>({...x,receivePhone:undefined})); }}
          />

          {/* Tỉnh */}
          <Autocomplete
            size="small"
            options={provinces}
            getOptionLabel={(o) => o?.ProvinceName || ""}
            isOptionEqualToValue={(o, v) => o.ProvinceID === v?.ProvinceID}
            value={form.province}
            onChange={(_, v) => setForm((f) => ({ ...f, province: v }))}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tỉnh/Thành"
                required
                error={!!errors.province}
                helperText={errors.province}
              />
            )}
          />

          {/* Huyện */}
          <Autocomplete
            size="small"
            options={districts}
            getOptionLabel={(o) => o?.DistrictName || ""}
            isOptionEqualToValue={(o, v) => o.DistrictID === v?.DistrictID}
            value={form.district}
            onChange={(_, v) => setForm((f) => ({ ...f, district: v }))}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Quận/Huyện"
                required
                disabled={!form.province}
                error={!!errors.district}
                helperText={errors.district}
              />
            )}
          />

          {/* Xã */}
          <Autocomplete
            size="small"
            options={wards}
            getOptionLabel={(o) => o?.WardName || ""}
            isOptionEqualToValue={(o, v) => String(o.WardCode) === String(v?.WardCode)}
            value={form.ward}
            onChange={(_, v) => setForm((f) => ({ ...f, ward: v }))}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Phường/Xã"
                required
                disabled={!form.district}
                error={!!errors.ward}
                helperText={errors.ward}
              />
            )}
          />

          {/* Địa chỉ chi tiết */}
          <TextField
            label="Số nhà, tên đường"
            size="small"
            required
            error={!!errors.addressDetail}
            helperText={errors.addressDetail}
            value={form.addressDetail}
            onChange={(e) => { setForm({ ...form, addressDetail: e.target.value }); setErrors((x)=>({...x,addressDetail:undefined})); }}
          />

          {/* Ghi chú */}
          <TextField
            label="Ghi chú cho đơn hàng"
            size="small"
            multiline
            minRows={2}
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography>Phí ship</Typography>
          <Typography color="primary">
            {loadingFee ? <CircularProgress size={20} /> : `${(form.shippingFee || 0).toLocaleString()}₫`}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <RadioGroup
          row
          value={form.paymentMethod}
          onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
        >
          <FormControlLabel value="COD" control={<Radio />} label="COD" />
          <FormControlLabel value="ONLINE" control={<Radio />} label="Online" />
        </RadioGroup>

        <Divider sx={{ my: 2 }} />

        <Box display="flex" justifyContent="space-between" mb={0.5}>
          <Typography>Tạm tính</Typography>
          <Typography>{itemsTotal.toLocaleString()}₫</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" mb={0.5}>
          <Typography>Phí ship</Typography>
          <Typography>{(form.shippingFee || 0).toLocaleString()}₫</Typography>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h6">Tổng cộng</Typography>
          <Typography variant="h6" color="primary">
            {(itemsTotal + (form.shippingFee || 0)).toLocaleString()}₫
          </Typography>
        </Box>

        <Tooltip
          title={canCheckout ? "" : "Không thể đặt hàng do có sản phẩm không hiển thị/hết hàng"}
        >
          <span>
            <Button
              fullWidth
              sx={{ mt: 2, py: 1.2, fontWeight: 600 }}
              variant="contained"
              color="primary"
              disabled={busy || !canCheckout}
              onClick={handleCheckout}
            >
              {form.paymentMethod === "ONLINE" ? "Thanh toán Online" : `Xác nhận đặt hàng (${form.paymentMethod})`}
            </Button>
          </span>
        </Tooltip>
      </CardContent>
    </Card>
  );
}
