import React, { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Search, ShieldCheck, Users as UsersIcon } from "lucide-react";
import { adminApi } from "../../services/adminApi";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState(null);

  async function load() {
    try {
      const [userData, roleData, profileData] = await Promise.all([adminApi.getUsers(), adminApi.getRoles(), adminApi.getCurrentUser()]);
      setUsers(userData);
      setRoles(roleData);
      setCurrentUser(profileData.user);
    } catch (error) {
      if (error.status === 401) window.location.href = "/login";
      else setMessage(error.message);
    }
  }

  useEffect(() => { load(); }, []);

  const filteredUsers = useMemo(() => users.filter((user) =>
    `${user.fullname} ${user.email} ${user.department || ""} ${user.role_name || user.role || ""}`.toLowerCase().includes(query.toLowerCase()),
  ), [users, query]);

  async function changeRole(user, roleId) {
    if (String(user.role_id) === String(roleId)) return;
    setSavingId(user.id);
    setMessage("");
    try {
      const updatedUser = await adminApi.updateUserRole(user.id, Number(roleId));
      setUsers((items) => items.map((item) => String(item.id) === String(updatedUser.id) ? updatedUser : item));
      setMessage(`${updatedUser.fullname}'s role was updated.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSavingId(null);
    }
  }

  const canManageRoles = currentUser?.role === "super_admin";

  return (
    <main className="admin-users-page">
      <section className="admin-users-hero">
        <div><span className="eyebrow"><i /> ACCESS MANAGEMENT</span><h1>Users & roles</h1><p>Manage MCU accounts created through Microsoft Entra ID.</p></div>
        <div className="users-total"><UsersIcon /><span><strong>{users.length}</strong><small>registered users</small></span></div>
      </section>

      <section className="users-management-card">
        <div className="users-toolbar">
          <div><h2>Directory users</h2><p>Role changes are limited to Super Admin accounts.</p></div>
          <label className="users-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, or role…" /></label>
        </div>

        {message && <p className="users-message" role="status">{message}</p>}
        <div className="users-table-wrap">
          <table className="users-table">
            <thead><tr><th>User</th><th>Department</th><th>Current role</th><th>Status</th><th>Change role</th></tr></thead>
            <tbody>{filteredUsers.map((user) => {
              const initials = (user.fullname || user.email || "U").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
              return <tr key={user.id}>
                <td><div className="directory-user"><span>{initials}</span><div><strong>{user.fullname}</strong><small>{user.email}</small></div></div></td>
                <td>{user.department || "—"}</td>
                <td><span className={`role-badge ${user.role || "student"}`}><ShieldCheck size={14} />{user.role_name || user.role || "Student"}</span></td>
                <td><span className={`user-status ${user.status || "active"}`}><i />{user.status || "active"}</span></td>
                <td><select value={user.role_id || ""} disabled={!canManageRoles || savingId === user.id} onChange={(event) => changeRole(user, event.target.value)} aria-label={`Change role for ${user.fullname}`}>
                  {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                </select></td>
              </tr>;
            })}</tbody>
          </table>
          {!filteredUsers.length && <div className="users-empty"><BadgeCheck /><h3>No users found</h3><p>Try another search term or sign in through Microsoft first.</p></div>}
        </div>
        {!canManageRoles && <div className="role-permission-note"><ShieldCheck size={18} />Only a Super Admin can promote or change user roles.</div>}
      </section>
    </main>
  );
}
