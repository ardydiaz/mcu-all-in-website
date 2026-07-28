import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";
import AuthLayout from "../layouts/AuthLayout";

import Home from "../pages/public/Home";
import Search from "../pages/public/Search";
import Systems from "../pages/public/Systems";

import Login from "../pages/auth/Login";

import Dashboard from "../pages/admin/Dashboard";
import Users from "../pages/admin/Users";
import Categories from "../pages/admin/Categories";
import AdminSystems from "../pages/admin/Systems";
import Analytics from "../pages/admin/Analytics";
import Settings from "../pages/admin/Settings";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC WEBSITE */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/systems" element={<Systems />} />
        </Route>

        {/* LOGIN */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* ADMIN */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/categories" element={<Categories />} />
          <Route path="/admin/systems" element={<AdminSystems />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
