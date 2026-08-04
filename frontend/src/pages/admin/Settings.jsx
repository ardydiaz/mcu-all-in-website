import React, { useEffect, useState } from "react";
import { Mail, Settings as SettingsIcon, ShieldCheck } from "lucide-react";
import { adminApi } from "../../services/adminApi";

export default function Settings() {
  const [user, setUser] = useState(null);
  useEffect(() => { adminApi.getCurrentUser().then((result) => setUser(result.user)).catch(() => {}); }, []);
  return (
    <main className="admin-simple-page"><section className="simple-page-heading"><span className="eyebrow"><i /> ADMINISTRATION</span><h1>Settings</h1><p>Account and platform configuration details.</p></section><section className="simple-card settings-card"><div className="simple-card-title"><div><h2>Signed-in account</h2><p>Your access is controlled through Microsoft Entra ID.</p></div><SettingsIcon /></div><div className="settings-row"><Mail /><span><small>Email</small><strong>{user?.email || "Loading account…"}</strong></span></div><div className="settings-row"><ShieldCheck /><span><small>Assigned role</small><strong>{user?.role_name || user?.role || "Loading role…"}</strong></span></div></section></main>
  );
}
