import axiosClient from "./axiosClient";

const categoryApi = {
  getAll: () => axiosClient.get("/api/categories/get-all"),
  getById: (id) => axiosClient.get(`/api/categories/${id}`),
  create: (data) => axiosClient.post("/api/categories/create", data),
  update: (id, data) => axiosClient.put(`/api/categories/update/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/categories/delete/${id}`),
};

export default categoryApi;
