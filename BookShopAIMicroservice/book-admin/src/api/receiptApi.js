import axiosClient from "./axiosClient";

const receiptApi = {
  getAll: () => axiosClient.get("api/receipts/get-all"),
  getById: (id) => axiosClient.get(`api/receipts/${id}`),
  create: (data) => axiosClient.post("api/receipts/create", data),
  importFile: (formData) =>
    axiosClient.post(`api/receipts/import`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export default receiptApi;
