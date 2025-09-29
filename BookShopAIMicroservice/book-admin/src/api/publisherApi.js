import axiosClient from "./axiosClient";

const publisherApi = {
  getAll: () => axiosClient.get("api/publishers/get-all"),
  getById: (id) => axiosClient.get(`api/publishers/${id}`),
  create: (data) => axiosClient.post("api/publishers/create", data),
  update: (id, data) => axiosClient.put(`api/publishers/update/${id}`, data),
  delete: (id) => axiosClient.delete(`api/publishers/delete/${id}`),
};

export default publisherApi;
