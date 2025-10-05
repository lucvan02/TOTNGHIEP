// import { Form, Input, Button, message } from "antd";
// import axiosClient from "../../api/axiosClient";

// export default function RegisterPage() {
//   const onFinish = (values) => {
//     axiosClient
//       .post("/users/register", values)
//       .then((res) => {
//         message.success(res.data.message);
//       })
//       .catch((err) => {
//         message.error(err.response?.data?.message || "Register failed");
//       });
//   };

//   return (
//     <div className="form-container">
//       <h2>Đăng ký tài khoản</h2>
//       <Form layout="vertical" onFinish={onFinish}>
//         <Form.Item name="username" label="Tên đăng nhập" required>
//           <Input />
//         </Form.Item>
//         <Form.Item name="password" label="Mật khẩu" required>
//           <Input.Password />
//         </Form.Item>
//         <Form.Item name="email" label="Email" required>
//           <Input type="email" />
//         </Form.Item>
//         <Form.Item name="firstname" label="Tên" required>
//           <Input />
//         </Form.Item>
//         <Form.Item name="lastname" label="Họ" required>
//           <Input />
//         </Form.Item>
//         <Form.Item name="phone" label="Số điện thoại" required>
//           <Input />
//         </Form.Item>
//         <Button type="primary" htmlType="submit" block>
//           Đăng ký
//         </Button>
//       </Form>
//     </div>
//   );
// }
