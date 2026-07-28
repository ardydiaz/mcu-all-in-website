import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import adminStylesUrl from "../styles/admin.css?url";

export default function AuthLayout() {
  useEffect(() => {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = adminStylesUrl;
    stylesheet.dataset.mcuAdminStyles = "true";
    document.head.appendChild(stylesheet);
    return () => stylesheet.remove();
  }, []);

  return <div className="auth-route-layout"><Outlet /></div>;
}
