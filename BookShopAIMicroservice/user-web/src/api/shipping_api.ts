// // @api/clients/shipping_api.ts
// // const GHN_API = 'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee';
// const GHN_API = 'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee';
// const GHN_TOKEN = 'ce200e6a-5946-11f0-a16a-2e9c57086fef';
// const SHOP_ID = 5873601;

// export async function calculateShippingFee(
//     toDistrictId: number,
//     toWardCode: string,
//     weight: number,
//     insuranceValue: number
// ) {
//     const response = await fetch(GHN_API, {
//         method: 'GET',
//         headers: {
//             // 'Content-Type': 'application/json',
//             'token': GHN_TOKEN,
//             'shop_id': SHOP_ID.toString(),
//         },
//         body: JSON.stringify({
//             from_district_id: 3695, // cố định quận gửi là Thủ Đức
//             service_id: 53321,      // bạn có thể gọi API /available-services để lấy đúng service_id
//             to_district_id: toDistrictId,
//             to_ward_code: toWardCode,
//             height: 15,
//             length: 15,
//             weight: weight,
//             width: 15,
//             insurance_value: insuranceValue,
//             coupon: null
//         })

//         // body: JSON.stringify({
//         //     from_district_id: 3695, // cố định quận gửi là Thủ Đức
//         //     service_id: 53321,      // bạn có thể gọi API /available-services để lấy đúng service_id
//         //     to_district_id: 3254,
//         //     to_ward_code: '370504',
//         //     height: 15,
//         //     length: 15,
//         //     weight: 1000,
//         //     width: 15,
//         //     insurance_value: 15000000,
//         //     coupon: null
//         // })
//     });

//     const data = await response.json();
//     if (data.code !== 200) throw new Error(data.message);
//     return data.data.total; // đơn vị: VND
// }

const GHN_API =
  "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee";
const GHN_TOKEN = "ce200e6a-5946-11f0-a16a-2e9c57086fef";
const SHOP_ID = 5873601;

// export async function calculateShippingFee(
//     toDistrictId: number,
//     toWardCode: string,
//     weight: number,
//     insuranceValue: number
// ) {
//     const serviceId = 53321;
//     const fromDistrictId = 3695;

//     const params = new URLSearchParams({
//         from_district_id: fromDistrictId.toString(),
//         to_district_id: toDistrictId.toString(),
//         to_ward_code: toWardCode,
//         service_id: serviceId.toString(),
//         weight: weight.toString(),
//         insurance_value: insuranceValue.toString(),
//     });

//     const response = await fetch(`${GHN_API}?${params.toString()}`, {
//         method: 'GET',
//         headers: {
//             'Token': GHN_TOKEN,
//             'ShopId': SHOP_ID.toString(),
//         }
//     });

//     const data = await response.json();
//     if (data.code !== 200) throw new Error(data.message);
//     return data.data.total;
// }

export async function calculateShippingFee(
  toDistrictId: number,
  toWardCode: string,
  weight: number,
  insuranceValue: number,
  serviceId: number
) {
  const response = await fetch(GHN_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Token: GHN_TOKEN,
      ShopId: SHOP_ID.toString(),
    },
    body: JSON.stringify({
      from_district_id: 3695,
      service_id: serviceId,
      to_district_id: toDistrictId,
      to_ward_code: toWardCode,
      height: 15,
      length: 15,
      weight: weight,
      width: 15,
      insurance_value: insuranceValue,
    }),
  });

  const data = await response.json();
  if (data.code !== 200) throw new Error(data.message);
  return data.data.total;
}

export async function calculateShippingFeeBySerViceTypeId(
  toDistrictId: number,
  toWardCode: string,
  weight: number,
  insuranceValue: number
) {
  console.log("TINH PHI VAN CHUYEN");

  const response = await fetch(GHN_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Token: GHN_TOKEN,
      ShopId: SHOP_ID.toString(),
    },
    body: JSON.stringify({
      from_district_id: 3695,
      service_type_id: 2,
      to_district_id: toDistrictId,
      to_ward_code: toWardCode,
      height: 15,
      length: 15,
      weight: weight,
      width: 15,
      insurance_value: insuranceValue,
    }),
  });

  const data = await response.json();
  if (data.code !== 200) throw new Error(data.message);
  return data.data.total;
}
