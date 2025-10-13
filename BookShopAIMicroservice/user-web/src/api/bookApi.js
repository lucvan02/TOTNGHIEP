import axios from "axios";

const API_URL = "http://localhost:8080/api/books";

export const bookApi = {
  getAll: () => axios.get(`${API_URL}/get-all`),
  getById: (id) => axios.get(`${API_URL}/${id}`),
  search: (keyword) => axios.get(`${API_URL}/search?keyword=${keyword}`),

  // Thêm mới:
  // getByAuthor: (authorId) => axios.get(`${API_URL}/by-author/${authorId}`),
  // getByCategory: (categoryId) => axios.get(`${API_URL}/by-category/${categoryId}`),
  getTopSale: () => axios.get(`${API_URL}/top-sale`),

  // ✅ Dùng đúng phân trang backend
  getByAuthor: (authorId, page = 0, size = 8) =>
    axios.get(`${API_URL}/by-author/${authorId}?page=${page}&size=${size}`),

  getByCategory: (categoryId, page = 0, size = 8) =>
    axios.get(`${API_URL}/by-category/${categoryId}?page=${page}&size=${size}`),

  getByPublisher: (publisherId, page = 0, size = 8) =>
    axios.get(`${API_URL}/by-publisher/${publisherId}?page=${page}&size=${size}`),
};
