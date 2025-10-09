// @api/clients/ghn_service_api.ts

const SERVICE_API = 'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services';
const GHN_TOKEN = 'ce200e6a-5946-11f0-a16a-2e9c57086fef';
const SHOP_ID = 5873601;

export async function getAvailableServices(toDistrict: number) {
    const response = await fetch(SERVICE_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Token': GHN_TOKEN
        },
        body: JSON.stringify({
            shop_id: SHOP_ID,
            from_district: 3695,// ID của quận huyện nơi shop đặt hàng (Thủ Đức)
            to_district: toDistrict
        })
    });

    const data = await response.json();
    if (data.code !== 200) throw new Error(data.message);
    return data.data; // Mảng các dịch vụ { service_id, short_name, ... }
}
