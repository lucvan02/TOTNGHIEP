import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/authApi";
import { setToken } from "../../api/localStorageService";
import { message } from "antd";

export default function Authenticate() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const isProcessing = useRef(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code && !isProcessing.current) {
      isProcessing.current = true;
      authApi.googleLogin(code)
        .then((res) => {
          messageApi.success("Đăng nhập Google thành công!");
          setToken(res.data.data.accessToken);
          navigate("/");
        })
        .catch((err) => {
          console.error(err);
          messageApi.error("Đăng nhập Google thất bại!");
        });
    }
  }, []);

  return (
    <>
      {contextHolder}
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>Đang xác thực Google...</h2>
      </div>
    </>
  );
}
