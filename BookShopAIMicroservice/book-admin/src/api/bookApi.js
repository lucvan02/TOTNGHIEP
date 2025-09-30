import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/", // api gateway
});

// Lấy tất cả sách
export const getAllBooks = () => api.get("/api/books/get-all");

// Tạo sách
export const createBook = (data) => api.post("/api/books/create", data);

// Update sách
export const updateBook = (id, data) => api.put(`/api/books/update/${id}`, data);

// Delete sách
export const deleteBook = (id) => api.delete(`/api/books/delete/${id}`);

// Search
export const searchBooks = (keyword) => api.get(`/api/books/search?keyword=${keyword}`);

// Upload ảnh
export const uploadImage = (id, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post(`api/books/upload-image/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};




import axiosClient from "./axiosClient";

const bookApi = {
  getAll: () => axiosClient.get("/api/books/get-all"),
  getById: (id) => axiosClient.get(`/api/books/${id}`),
  create: (data) => axiosClient.post("/api/books/create", data),
  update: (id, data) => axiosClient.put(`/api/books/update/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/books/delete/${id}`),
  uploadImage: (id, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post(`/api/books/upload-image/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default bookApi;
