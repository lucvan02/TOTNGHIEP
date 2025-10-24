const GHN_API =
  "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee";
const GHN_TOKEN = "ce200e6a-5946-11f0-a16a-2e9c57086fef";
const SHOP_ID = 5873601; // id cửa hàng của bạn
const FROM_DISTRICT_ID = 3695; // ví dụ: Thủ Đức - Hồ Chí Minh

export async function calculateShippingFeeByServiceType(
  toDistrictId,
  toWardCode,
  weight,
  insuranceValue = 0
) {
  const body = {
    from_district_id: FROM_DISTRICT_ID,
    service_type_id: 2, // 2: tiêu chuẩn, 1: nhanh
    to_district_id: toDistrictId,
    to_ward_code: toWardCode,
    height: 15,
    length: 15,
    weight,
    width: 15,
    insurance_value: insuranceValue,
  };

  const res = await fetch(GHN_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Token: GHN_TOKEN,
      ShopId: SHOP_ID.toString(),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (data.code !== 200) throw new Error(data.message);
  return data.data.total; // phí vận chuyển
}
