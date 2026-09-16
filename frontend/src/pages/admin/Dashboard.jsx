import React, { useEffect, useState } from "react";
import {
  Activity, Bell, BriefcaseBusiness, Check, CheckCircle2, Clock3, Edit3,
  ExternalLink, Eye, Grid2X2, HeartPulse, Layers3, Link2, Menu, Microscope,
  Plus, RefreshCw, Search, Settings, ShieldCheck, Sparkles, Trash2, Users, X,
  Tags, ChartNoAxesCombined, ChevronDown, LogOut, UserRound,
} from "lucide-react";
import { adminApi } from "../../services/adminApi";

const palette = {
  violet: "#642B87", orange: "#FFBA2E", red: "#F5222D", pink: "#F20F5B",
  cyan: "#08AABD", lime: "#B6D83E", yellow: "#FFD400",
};

const emptyForm = {
  title: "", category: "University", status: "active", url: "",
  description: "", color: "violet",
};

function initialsFor(user) {
  const label = user?.fullname || user?.name || user?.email || "Administrator";
  return label.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function displayNameFor(user) {
  return user?.fullname || user?.name || user?.email || "MCU Administrator";
}

function Sidebar({ serviceCount, open, onClose, onLogout, user }) {
  const links = [
    [Grid2X2, "Dashboard", "/admin"],
    [Layers3, "Web services", "/admin/systems", serviceCount],
    [Users, "Administrators", "/admin/users"],
    [Tags, "Categories", "/admin/categories"],
    [ChartNoAxesCombined, "Analytics", "/admin/analytics"],
  ];
  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="brand"><span className="brand-mark">M</span><span><strong>MCU</strong><small>ADMIN CONSOLE</small></span></div>
      <nav>
        {links.map(([Icon, label, href, count], index) => (
          <a className={index === 0 ? "active" : ""} href={href} key={label} onClick={onClose}>
            <Icon />{label}{count !== undefined && <b>{count}</b>}
          </a>
        ))}
        <span className="nav-label">SYSTEM</span>
        <a href="/admin/settings"><Settings />Settings</a>
        <a href="/api/health" target="_blank" rel="noreferrer"><HeartPulse />API status</a>
      </nav>
      <div className="sidebar-card">
        <span className="sidebar-card-icon"><Sparkles size={16} /></span>
        <strong>MCU All-in-One</strong>
        <p>Everything connected in one digital ecosystem.</p>
        <span className="system-online"><i /> All systems operational</span>
      </div>
      <div className="admin-profile">
        <span className="avatar">AD</span>
        <span><strong>MCU Administrator</strong><small>Super admin</small></span>
        <button onClick={onLogout} aria-label="Sign out" title="Sign out">↪</button>
      </div>
    </aside>
  );
}

function AccountMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const name = displayNameFor(user);
  const role = user?.role_name || user?.role || "Administrator";

  return <div className="header-account">
    <button className="header-account-trigger" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-haspopup="menu">
      <span className="header-avatar">{initialsFor(user)}</span>
      <span className="header-account-copy"><strong>{name}</strong><small>{role}</small></span>
      <ChevronDown size={16} className={open ? "rotated" : ""} />
    </button>
    {open && <div className="account-dropdown" role="menu">
      <div className="account-dropdown-summary">
        <span className="header-avatar large">{initialsFor(user)}</span>
        <span><strong>{name}</strong><small>{user?.email || "MCU account"}</small></span>
      </div>
      <a href="/admin/settings" role="menuitem" onClick={() => setOpen(false)}><UserRound size={16} />Account settings</a>
      <button type="button" role="menuitem" onClick={onLogout}><LogOut size={16} />Sign out</button>
    </div>}
  </div>;
}

function MetricCard({ tone, icon: Icon, label, value, children }) {
  return (
    <article className={`metric ${tone}`}>
      <div><Icon /><small>{label}</small></div>
      <strong>{value}</strong>
      <p>{children}</p><span className="metric-shape" />
    </article>
  );
}

function ServiceModal({ service, categories, onClose, onSave }) {
  const [form, setForm] = useState(service ? { ...service } : emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // A native select visually shows its first option when its value is absent,
  // but it does not change React form state. Keep the submitted category in
  // sync with the active categories supplied by the API.
  useEffect(() => {
    if (service || !categories.length) return;
    setForm((current) => (
      categories.some((item) => item.name === current.category)
        ? current
        : { ...current, category: categories[0].name }
    ));
  }, [categories, service]);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } catch (error) {
      const fieldErrors = (error.errors || []).reduce((result, item) => ({ ...result, [item.field]: item.message }), {});
      setErrors(Object.keys(fieldErrors).length ? fieldErrors : { form: error.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit}>
        <div className="modal-header">
          <div><span className="eyebrow">SERVICE DETAILS</span><h2>{service ? "Edit service" : "Add new service"}</h2></div>
          <button type="button" className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="form-grid">
          <label className={`full ${errors.title ? "has-error" : ""}`}>Service name<input value={form.title} onChange={(e) => update("title", e.target.value)} aria-invalid={Boolean(errors.title)} placeholder="e.g. Student Portal" />{errors.title && <small className="field-error">{errors.title}</small>}</label>
          <label className={errors.category ? "has-error" : ""}>Category<select value={form.category} onChange={(e) => update("category", e.target.value)} aria-invalid={Boolean(errors.category)}>{categories.map((item) => <option value={item.name} key={item.id || item.name}>{item.name}</option>)}</select>{errors.category && <small className="field-error">{errors.category}</small>}</label>
          <label>Status<select value={form.status} onChange={(e) => update("status", e.target.value)}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
          <label className={`full ${errors.url ? "has-error" : ""}`}>Website URL<input value={form.url === "#" ? "" : form.url} onChange={(e) => update("url", e.target.value)} type="text" aria-invalid={Boolean(errors.url)} placeholder="https://www.example.com" />{errors.url && <small className="field-error">{errors.url}</small>}</label>
          <label className={`full ${errors.description ? "has-error" : ""}`}>Description<textarea value={form.description} onChange={(e) => update("description", e.target.value)} aria-invalid={Boolean(errors.description)} rows="3" />{errors.description && <small className="field-error">{errors.description}</small>}</label>
          <fieldset className="full"><legend>Accent color</legend><div className="color-options">
            {Object.entries(palette).map(([name, color]) => <label className="color-option" title={name} key={name}><input type="radio" name="color" value={name} checked={form.color === name} onChange={() => update("color", name)} /><span style={{ "--swatch": color }} /></label>)}
          </div></fieldset>
        </div>
        {errors.form && <p className="modal-form-error">{errors.form}</p>}<div className="modal-actions"><button type="button" className="cancel-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? "Saving..." : "Save service"}</button></div>
      </form>
    </div>
  );
}

function ServicesPanel({ services, query, category, onCategory, onEdit, onDelete, onStatus }) {
  const [showAll, setShowAll] = useState(false);
  const categories = ["All", ...new Set(services.map((service) => service.category))];
  const filtered = services.filter((service) =>
    (category === "All" || service.category === category) &&
    `${service.title} ${service.description} ${service.category}`.toLowerCase().includes(query.toLowerCase()),
  );
  const shown = showAll ? filtered : filtered.slice(0, 6);
  return (
    <div className="panel services-panel" id="services">
      <div className="panel-heading">
        <div><h2>Website services</h2><p>Manage links shown in the MCU directory.</p></div>
        <div className="table-tools"><select value={category} onChange={(e) => onCategory(e.target.value)}>{categories.map((item) => <option value={item} key={item}>{item === "All" ? "All categories" : item}</option>)}</select><button className="more-button">•••</button></div>
      </div>
      <div className="table-wrap">
        {shown.length ? <table>
          <thead><tr><th>Service</th><th>Category</th><th>Status</th><th>Updated</th><th /></tr></thead>
          <tbody>{shown.map((service) => (
            <tr key={service.id}>
              <td><div className="service-cell"><span className="service-icon" style={{ "--service-color": palette[service.color] || palette.violet }}><Link2 /></span><span><strong>{service.title}</strong><small>{service.description}</small></span></div></td>
              <td><span className="category-pill">{service.category}</span></td>
              <td><button className={`status-pill ${service.status}`} onClick={() => onStatus(service)}><i />{service.status === "active" ? "Active" : "Inactive"}</button></td>
              <td className="updated-cell">{new Date(service.updatedAt).toDateString() === new Date().toDateString() ? "Today" : new Date(service.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
              <td><div className="row-actions"><button onClick={() => onEdit(service)} aria-label={`Edit ${service.title}`}><Edit3 /></button><button className="delete" onClick={() => onDelete(service)} aria-label={`Delete ${service.title}`}><Trash2 /></button></div></td>
            </tr>
          ))}</tbody>
        </table> : <div className="empty-state"><Search /><h3>No services found</h3><p>Try another search or filter.</p></div>}
      </div>
      <div className="panel-footer"><span>Showing {shown.length} of {filtered.length} services</span>{filtered.length > 6 && <button onClick={() => setShowAll((value) => !value)}>{showAll ? "Show less" : "View all services →"}</button>}</div>
    </div>
  );
}

function ActivityPanel({ activities = [] }) {
  const fallbackItems = [
    { action: "system.updated", actor: "Admin", details: { title: "Admissions" }, createdAt: new Date().toISOString() },
    { action: "system.created", actor: "Admin", details: { title: "Alumni Network" }, createdAt: new Date().toISOString() },
  ];
  const items = (activities.length ? activities : fallbackItems).slice(0, 4);
  const iconForAction = (action) => action.includes("created") ? [Plus, "pink-bg"] : action.includes("deleted") ? [Trash2, "orange-bg"] : [RefreshCw, "cyan-bg"];
  return <aside className="panel activity-panel" id="activity">
    <div className="panel-heading"><div><h2>Recent activity</h2><p>Latest admin actions</p></div><button className="more-button">•••</button></div>
    <div className="timeline">{items.map((item, index) => {
      const [Icon, tone] = iconForAction(item.action);
      const title = item.details?.title || item.action.replace("system.", "System ").replace("_", " ");
      const time = item.createdAt || item.created_at;
      return <div className="timeline-item" key={item.id || index}><span className={`timeline-icon ${tone}`}><Icon /></span><div><p><strong>{title}</strong> {item.action.replace("system.", "").replace("_", " ")}</p><small>{time ? new Date(time).toLocaleString() : "Just now"} · by {item.actor || "System"}</small></div></div>;
    })}</div>
    <button className="activity-link">View activity log <span>→</span></button>
  </aside>;
}

function Dashboard() {
  const [services, setServices] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [modalService, setModalService] = useState(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [serviceCategories, setServiceCategories] = useState([]);

  async function loadServices() {
    try {
      const [serviceData, dashboardData, profileData, categoryData] = await Promise.all([adminApi.getServices(), adminApi.getDashboard(), adminApi.getCurrentUser(), adminApi.getCategories()]);
      setServices(serviceData);
      setDashboard(dashboardData);
      setCurrentUser(profileData.user);
      setServiceCategories(categoryData.filter((item) => item.status === "active"));
    }
    catch (error) { if (error.status === 401) window.location.href = "/login?returnTo=/admin"; else showToast(error.message); }
  }
  useEffect(() => { loadServices(); }, []);
  function showToast(message) { setToast(message); setTimeout(() => setToast(""), 2400); }
  async function logout() { await adminApi.logout(); window.location.href = "/login?logout=success"; }
  async function save(service) {
    service.id ? await adminApi.updateService(service.id, service) : await adminApi.createService(service);
    setModalOpen(false); showToast(service.id ? "Service updated successfully." : "Service added successfully."); loadServices();
  }
  async function remove(service) {
    if (!window.confirm(`Delete "${service.title}"? This cannot be undone.`)) return;
    await adminApi.deleteService(service.id); showToast(`${service.title} deleted.`); loadServices();
  }
  async function toggleStatus(service) {
    await adminApi.updateStatus(service.id, service.status === "active" ? "inactive" : "active");
    showToast(`${service.title} status updated.`); loadServices();
  }
  const activeCount = dashboard?.metrics?.activeSystems ?? services.filter((service) => service.status === "active").length;

  return <div className="admin-shell">
    <Sidebar serviceCount={services.length} open={menuOpen} onClose={() => setMenuOpen(false)} onLogout={logout} user={currentUser} />
    <div className="main-area">
      <header className="topbar">
        <button className="mobile-menu" onClick={() => setMenuOpen((value) => !value)}><Menu /></button>
        <label className="global-search"><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} type="search" placeholder="Search services..." /><kbd>⌘ K</kbd></label>
        <div className="top-actions"><button className="icon-button"><Bell /><i /></button><span className="top-divider" /><div className="date-block"><small>TODAY</small><strong>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong></div><span className="top-divider account-divider" /><AccountMenu user={currentUser} onLogout={logout} /></div>
      </header>
      <main>
        <section className="welcome" id="dashboard"><div><span className="eyebrow"><i /> ADMIN OVERVIEW</span><h1>Good day, Administrator.</h1><p>Here’s what’s happening across the MCU digital ecosystem.</p></div><button className="primary-button" onClick={() => { setModalService(undefined); setModalOpen(true); }}><span>＋</span> Add new service</button></section>
        <section className="metrics">
          <MetricCard tone="violet" icon={Layers3} label="TOTAL SERVICES" value={dashboard?.metrics?.systems ?? services.length}><b>↑ 2</b> from last month</MetricCard>
          <MetricCard tone="cyan" icon={CheckCircle2} label="ACTIVE SERVICES" value={activeCount}><i /> Live and accessible</MetricCard>
          <MetricCard tone="orange" icon={Eye} label="VISITS THIS MONTH" value={dashboard?.metrics?.visits ? `${(dashboard.metrics.visits / 1000).toFixed(1)}K` : "—"}><b>↑ {dashboard?.metrics?.visitChangePercent ?? 0}%</b> vs. last month</MetricCard>
          <MetricCard tone="pink" icon={Clock3} label="LAST UPDATED" value="Today">Service directory synced</MetricCard>
        </section>
        <section className="content-grid">
          <ServicesPanel services={services} query={query} category={category} onCategory={setCategory} onEdit={(service) => { setModalService(service); setModalOpen(true); }} onDelete={remove} onStatus={toggleStatus} />
          <ActivityPanel activities={dashboard?.recentActivity} />
        </section>
      </main>
    </div>
    {modalOpen && <ServiceModal service={modalService} categories={serviceCategories.length ? serviceCategories : [{ id: "university", name: "University" }]} onClose={() => setModalOpen(false)} onSave={save} />}
    <div className={`toast ${toast ? "show" : ""}`} role="status">{toast}</div>
  </div>;
}

export default Dashboard;
