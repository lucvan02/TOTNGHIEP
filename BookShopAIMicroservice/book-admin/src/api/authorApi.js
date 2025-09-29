import axiosClient from "./axiosClient";

const authorApi = {
  getAll: () => axiosClient.get("api/authors/get-all"),
  getById: (id) => axiosClient.get(`api/authors/${id}`),
  create: (data) => axiosClient.post("api/authors/create", data),
  update: (id, data) => axiosClient.put(`api/authors/update/${id}`, data),
  delete: (id) => axiosClient.delete(`api/authors/delete/${id}`),
};

export default authorApi;
