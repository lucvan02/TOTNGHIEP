// import axios from "axios";

// const API_URL = "http://localhost:8080/api/categories";

// export const categoryApi = {
//   getAll: () => axios.get(`${API_URL}/get-all`),
// };


import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

// export const authorApi = {
//   getById: (id) => axios.get(`${BASE_URL}/authors/${id}`),
// };

export const categoryApi = {
  getById: (id) => axios.get(`${BASE_URL}/categories/${id}`),
  getAll: () => axios.get(`${BASE_URL}/categories/get-all`),
};
