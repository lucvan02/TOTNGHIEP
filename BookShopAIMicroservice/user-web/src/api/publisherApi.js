import axios from "axios";
const BASE_URL = "http://localhost:8080/api";

export const publisherApi = {
  getById: (id) => axios.get(`${BASE_URL}/publishers/${id}`),
};
