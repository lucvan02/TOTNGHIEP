// export const setToken = (token) => {
//   localStorage.setItem("token", token);
// };

// export const getToken = () => {
//   return localStorage.getItem("token");
// };

// export const clearToken = () => {
//   localStorage.removeItem("token");
// };


// export const logOut = () => {
//   localStorage.removeItem("token");
// };

// export const getToken = () => localStorage.getItem("accessToken");

// export const logOut = () => {
//   localStorage.removeItem("token");
//   localStorage.removeItem("user");
// };


export const setToken = (token) => localStorage.setItem("accessToken", token);
export const getToken = () => localStorage.getItem("accessToken");
export const logOut = () => localStorage.clear();
