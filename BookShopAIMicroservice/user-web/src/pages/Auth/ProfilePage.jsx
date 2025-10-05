// import { useEffect, useState } from "react";
// import { Card, Button, message } from "antd";
// import axiosClient from "../../api/axiosClient";
// import { useNavigate } from "react-router-dom";

// export default function ProfilePage() {
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     axiosClient
//       .get("/users/me")
//       .then((res) => setUser(res.data.data))
//       .catch(() => {
//         message.error("Vui lòng đăng nhập lại");
//         navigate("/login");
//       });
//   }, []);

//   return (
//     <div style={{ width: 400, margin: "100px auto" }}>
//       <Card title="Thông tin cá nhân">
//         {user && (
//           <>
//             <p><b>Họ tên:</b> {user.firstname} {user.lastname}</p>
//             <p><b>Email:</b> {user.email}</p>
//             <p><b>Điện thoại:</b> {user.phone}</p>
//             <Button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}>
//               Đăng xuất
//             </Button>
//           </>
//         )}
//       </Card>
//     </div>
//   );
// }
