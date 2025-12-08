// import axiosClient from "./axiosClient";

// //tao bien baseURL de dung chung cho cac api lien quan den user
// const baseURL = "http://localhost:8082/api/admin/users";
// const userApi = {
//   getAdminUsers: (page = 0, size = 20, keyword = "") =>
//     axiosClient.get(
//       `api/admin/users?page=${page}&size=${size}${
//         keyword ? `&keyword=${encodeURIComponent(keyword)}` : ""
//       }`
//     ),

//   lockUser: (uid) => axiosClient.patch(`api/admin/users/${uid}/lock`),

//   unlockUser: (uid) => axiosClient.patch(`api/admin/users/${uid}/unlock`),

//   getProfile: (username) =>
//     axiosClient.get(
//       `api/users/profile?username=${encodeURIComponent(username)}`
//     ),

//   getAllAdminUsers: () => axiosClient.get("http://localhost:8082/api/admin/users/all"),
// };

// export default userApi;



import axiosClient from "./axiosClient";

//tao bien baseURL de dung chung cho cac api lien quan den user
const baseURL = "http://localhost:8082/api/admin/users";
const userApi = {
  getAdminUsers: (page = 0, size = 20, keyword = "") =>
    axiosClient.get(
      `${baseURL}?page=${page}&size=${size}${
        keyword ? `&keyword=${encodeURIComponent(keyword)}` : ""
      }`
    ),

  lockUser: (uid) => axiosClient.patch(`${baseURL}/${uid}/lock`),

  unlockUser: (uid) => axiosClient.patch(`${baseURL}/${uid}/unlock`),

  getProfile: (username) =>
    axiosClient.get(
      `api/users/profile?username=${encodeURIComponent(username)}`
    ),

  getAllAdminUsers: () => axiosClient.get(`${baseURL}/all`),
};

export default userApi;
