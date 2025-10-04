import { Form, Input, Button, message } from "antd";
import axiosClient from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const onFinish = (values) => {
    axiosClient
      .post("/users/login", values)
      .then((res) => {
        message.success(res.data.message);
        localStorage.setItem("token", res.data.data);
        navigate("/profile");
      })
      .catch((err) => {
        message.error(err.response?.data?.message || "Login failed");
      });
  };

  return (
    <div className="form-container">
      <h2>Đăng nhập</h2>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="username" label="Tên đăng nhập" required>
          <Input />
        </Form.Item>
        <Form.Item name="password" label="Mật khẩu" required>
          <Input.Password />
        </Form.Item>
        <Button type="primary" htmlType="submit" block>
          Đăng nhập
        </Button>
      </Form>
    </div>
  );
}
