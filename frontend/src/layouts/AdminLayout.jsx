import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { BarChart3, Layers3, LogOut, Settings, Tags, Users } from "lucide-react";
import adminStylesUrl from "../styles/admin.css?url";
import { adminApi } from "../services/adminApi";

const navItems = [
  [Layers3, "Web services", "/admin/systems"],
  [Users, "Administrators", "/admin/users"],
  [Tags, "Categories", "/admin/categories"],
  [BarChart3, "Analytics", "/admin/analytics"],
];

function initials(user) {
  return (user?.fullname || user?.name || user?.email || "Administrator").split(/\s+/).slice(0, 2).map((value) => value[0]).join("").toUpperCase();
}

export default function AdminLayout() {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = adminStylesUrl;
    stylesheet.dataset.mcuAdminStyles = "true";
    document.head.appendChild(stylesheet);
    return () => stylesheet.remove();
  }, []);

  useEffect(() => {
    if (location.pathname === "/admin") return;
    adminApi.getCurrentUser().then((result) => setUser(result.user)).catch((error) => {
      if (error.status === 401) window.location.href = "/login";
    });
  }, [location.pathname]);

  async function logout() {
    await adminApi.logout();
    window.location.href = "/login?logout=success";
  }

  if (location.pathname === "/admin") return <div className="admin-route-layout"><Outlet /></div>;

  return <div className="admin-shell admin-subpage-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">M</span><span><strong>MCU</strong><small>ADMIN CONSOLE</small></span></div>
      <nav>
        <NavLink to="/admin" end><Layers3 />Dashboard</NavLink>
        {navItems.map(([Icon, label, path]) => <NavLink key={path} to={path}><Icon />{label}</NavLink>)}
        <span className="nav-label">SYSTEM</span>
        <NavLink to="/admin/settings"><Settings />Settings</NavLink>
      </nav>
      <div className="sidebar-card"><strong>MCU All-in-One</strong><p>Everything connected in one digital ecosystem.</p><span className="system-online"><i /> API connected</span></div>
      <div className="admin-profile"><span className="avatar">{initials(user)}</span><span><strong>{user?.fullname || user?.name || "MCU Administrator"}</strong><small>{user?.role_name || user?.role || "Administrator"}</small></span><button onClick={logout} aria-label="Sign out" title="Sign out"><LogOut size={16} /></button></div>
    </aside>
    <div className="main-area admin-subpage-main">
      <header className="topbar"><div className="admin-breadcrumb"><span>Administration</span><strong>{location.pathname.split("/").pop().replace(/(^|_)([a-z])/g, (_, prefix, letter) => `${prefix}${letter.toUpperCase()}`)}</strong></div><button className="subpage-logout" onClick={logout}><LogOut size={16} />Sign out</button></header>
      <Outlet />
    </div>
  </div>;
}
