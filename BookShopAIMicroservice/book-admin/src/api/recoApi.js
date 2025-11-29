import axios from "axios";

const BASE_PATH = import.meta.env.VITE_RECO_BASE_URL || "http://localhost:8000/cbf";

const recoApi = {
  reload: () => axios.post(`${BASE_PATH}/reload`),
};

export default recoApi;   // 👈 thêm dòng này
export { recoApi };      // (tùy chọn) vẫn cho phép import theo tên
