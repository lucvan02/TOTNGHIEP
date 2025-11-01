

export const setToken = (token) => localStorage.setItem("token", token);
export const getToken = () => localStorage.getItem("token");
export const logOut = () => localStorage.clear();


export const setUid = (uid) => localStorage.setItem("uid", uid);

export const getUid = () => {
  const direct = localStorage.getItem("uid");
  if (direct) return direct;
  // fallback: parse JWT nếu gateway/user-service đã nhét uid vào claim `uid` hoặc `sub`
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.uid || payload.sub || null;
  } catch {
    return null;
  }
};






export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const obj = JSON.parse(raw);
    // Hỗ trợ cả 2 dạng: {uid,...} hoặc {user:{uid,...}}
    return obj?.user ?? obj ?? null;
  } catch {
    return null;
  }
};

// export const getUid = () => {
//   const u = getStoredUser();
//   return u?.uid ?? u?.userId ?? null;
// };

export const isLoggedIn = () => !!(localStorage.getItem("token") && getUid());
