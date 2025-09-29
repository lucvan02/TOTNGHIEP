import axiosClient from "./axiosClient";

const receiptApi = {
  getAll: () => axiosClient.get("/receipts"),
  getById: (id) => axiosClient.get(`/receipts/${id}`),
  create: (data) => axiosClient.post("/receipts", data),
};

export default receiptApi;
