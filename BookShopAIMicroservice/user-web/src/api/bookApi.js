import axios from "axios";

const API_URL = "http://localhost:8080/api/books";

export const bookApi = {
  getAll: () => axios.get(`${API_URL}/get-all`),
  getById: (id) => axios.get(`${API_URL}/${id}`),
  search: (keyword) => axios.get(`${API_URL}/search?keyword=${keyword}`),
};
