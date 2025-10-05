import axios from "axios";

const API_URL = "http://localhost:8080/api/categories";

export const categoryApi = {
  getAll: () => axios.get(`${API_URL}/get-all`),
};
