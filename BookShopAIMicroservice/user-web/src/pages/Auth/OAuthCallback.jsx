import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/authApi";
import { setToken } from "../../api/localStorageService";

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      authApi.googleLogin(code).then((res) => {
        setToken(res.data.data.accessToken);
        navigate("/");
      });
    }
  }, [navigate]);

  return <div>Đang đăng nhập bằng Google...</div>;
}
