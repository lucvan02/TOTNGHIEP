// @api/clients/ghn_location_api.ts
const GHN_BASE = "https://online-gateway.ghn.vn/shiip/public-api/master-data";
const TOKEN = "ce200e6a-5946-11f0-a16a-2e9c57086fef";

async function fetchGHN(endpoint: string, body?: object) {
  const res = await fetch(`${GHN_BASE}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Token: TOKEN,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (data.code !== 200) throw new Error(data.message);
  return data.data;
}

export const GHNLocationApi = {
  getProvinces: () => fetchGHN("province"),
  getDistricts: (province_id: number) => fetchGHN("district", { province_id }),
  getWards: (district_id: number) => fetchGHN("ward", { district_id }),
};
