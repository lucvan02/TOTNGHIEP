import axiosClient from "./axiosClient";

const receiptApi = {
  getAll: () => axiosClient.get("api/receipts/get-all"),
  getById: (id) => axiosClient.get(`api/receipts/${id}`),
  create: (data) => axiosClient.post("api/receipts/create", data),
};

export default receiptApi;
