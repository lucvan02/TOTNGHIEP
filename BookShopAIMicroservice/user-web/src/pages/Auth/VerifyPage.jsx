import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { Result, Spin } from "antd";

export default function VerifyPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      axiosClient
        .get(`/users/verify?token=${token}`)
        .then((res) => {
          setStatus("success");
          setMessage(res.data.message);
        })
        .catch((err) => {
          setStatus("error");
          setMessage(err.response?.data?.message || "Verify failed");
        });
    } else {
      setStatus("error");
      setMessage("No token found");
    }
  }, [token]);

  if (status === "loading") {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" />
        <p>Đang xác thực tài khoản...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 100 }}>
      <Result
        status={status}
        title={message}
        subTitle={
          status === "success"
            ? "Bạn có thể đăng nhập vào hệ thống ngay bây giờ."
            : "Vui lòng thử lại hoặc liên hệ hỗ trợ."
        }
      />
    </div>
  );
}
