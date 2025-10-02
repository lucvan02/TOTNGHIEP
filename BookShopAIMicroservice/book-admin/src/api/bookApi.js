
import axiosClient from "./axiosClient";

const bookApi = {
  getAll: () => axiosClient.get("api/books/get-all"),
  getById: (id) => axiosClient.get(`api/books/${id}`),
  create: (data) => axiosClient.post("api/books/create", data),
  update: (id, data) => axiosClient.put(`api/books/update/${id}`, data),
  delete: (id) => axiosClient.delete(`api/books/delete/${id}`),
  search: (keyword) => axiosClient.get(`api/books/search?keyword=${keyword}`),
  addAuthors: (bookId, authorIds) =>
    axiosClient.post(`api/books/${bookId}/add-authors`, authorIds),
  addCategories: (bookId, categoryIds) =>
    axiosClient.post(`api/books/${bookId}/add-categories`, categoryIds),
  uploadImage: (bookId, formData) =>
    axiosClient.post(`api/books/${bookId}/upload-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export default bookApi;
