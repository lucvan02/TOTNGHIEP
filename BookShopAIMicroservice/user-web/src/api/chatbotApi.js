import axios from "axios";

const res = await axios.post("http://localhost:8888/recommend", {
  query: userMsg,
});

const books = res.data.books || [];
