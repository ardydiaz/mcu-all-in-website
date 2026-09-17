import React, { useEffect, useState } from "react";
import { Plus, Tags, Trash2, Layers } from "lucide-react";
import { adminApi } from "../../services/adminApi";

export default function Categories() {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [tabName, setTabName] = useState("");
  const [tabGroupId, setTabGroupId] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const load = () => adminApi.getCategoryGroups().then(setGroups).catch((error) => setMessage(error.message));
  useEffect(() => { load(); }, []);

  async function addGroup(event) {
    event.preventDefault(); setErrors({}); setMessage("");
    try {
      await adminApi.createCategoryGroup({ name: groupName.trim() });
      setGroupName(""); setMessage("Category group added."); load();
    } catch (error) {
      const fieldErrors = (error.errors || []).reduce((result, item) => ({ ...result, [item.field]: item.message }), {});
      setErrors(Object.keys(fieldErrors).length ? fieldErrors : { groupForm: error.message });
    }
  }

  async function addTab(event) {
    event.preventDefault(); setErrors({}); setMessage("");
    if (!tabGroupId) { setErrors({ tabGroup: "Choose which group this tab belongs to." }); return; }
    try {
      await adminApi.createCategory({ name: tabName.trim(), categoryGroupId: tabGroupId, status: "active" });
      setTabName(""); setMessage("Tab added."); load();
    } catch (error) {
      const fieldErrors = (error.errors || []).reduce((result, item) => ({ ...result, [item.field]: item.message }), {});
      setErrors(Object.keys(fieldErrors).length ? fieldErrors : { tabForm: error.message });
    }
  }

  async function removeGroup(group) {
    if (!window.confirm(`Remove group "${group.name}"? Its tabs will become ungrouped.`)) return;
    try { await adminApi.deleteCategoryGroup(group.id); setMessage("Group removed."); load(); }
    catch (error) { setMessage(error.message); }
  }

  async function removeTab(tab) {
    if (!window.confirm(`Remove tab "${tab.name}"?`)) return;
    try { await adminApi.deleteCategory(tab.id); setMessage("Tab removed."); load(); }
    catch (error) { setMessage(error.message); }
  }

  return (
    <main className="admin-simple-page">
      <section className="simple-page-heading">
        <span className="eyebrow"><i /> DIRECTORY MANAGEMENT</span>
        <h1>Categories</h1>
        <p>Organize MCU systems into public directory groups and tabs.</p>
      </section>

      <section className="simple-card">
        <div className="simple-card-title">
          <div><h2>Category groups</h2><p>Each group becomes a section on the public directory (e.g. "Administrator").</p></div>
          <Layers />
        </div>
        <form className="category-create" onSubmit={addGroup}>
          <div className="category-input-wrap">
            <input
              value={groupName}
              onChange={(event) => { setGroupName(event.target.value); setErrors((current) => ({ ...current, name: "" })); }}
              className={errors.name ? "input-error" : ""}
              aria-invalid={Boolean(errors.name)}
              placeholder="New group name (e.g. Administrator)"
            />
            {errors.name && <small className="field-error">{errors.name}</small>}
          </div>
          <button><Plus size={16} />Add group</button>
        </form>
        {errors.groupForm && <p className="modal-form-error">{errors.groupForm}</p>}
      </section>

      <section className="simple-card">
        <div className="simple-card-title">
          <div><h2>Tabs</h2><p>Add a tab under a group. A single-tab group (same name as its group) shows as "All | GroupName". Multiple tabs show as "All | Tab1 | Tab2".</p></div>
          <Tags />
        </div>
        <form className="category-create" onSubmit={addTab}>
          <div className="category-input-wrap">
            <select
              value={tabGroupId}
              onChange={(event) => { setTabGroupId(event.target.value); setErrors((current) => ({ ...current, tabGroup: "" })); }}
              className={errors.tabGroup ? "input-error" : ""}
            >
              <option value="">Choose a group…</option>
              {groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
            </select>
            {errors.tabGroup && <small className="field-error">{errors.tabGroup}</small>}
          </div>
          <div className="category-input-wrap">
            <input
              value={tabName}
              onChange={(event) => { setTabName(event.target.value); setErrors((current) => ({ ...current, name: "" })); }}
              className={errors.name ? "input-error" : ""}
              aria-invalid={Boolean(errors.name)}
              placeholder="Tab name (e.g. Student, or same as group)"
            />
            {errors.name && <small className="field-error">{errors.name}</small>}
          </div>
          <button><Plus size={16} />Add tab</button>
        </form>
        {errors.tabForm && <p className="modal-form-error">{errors.tabForm}</p>}
      </section>

      {message && <p className="users-message">{message}</p>}

      <section className="simple-card">
        <div className="simple-card-title">
          <div><h2>Current structure</h2><p>Groups and their tabs as they appear on the public directory.</p></div>
        </div>
        <div className="category-grid">
          {groups.map((group) => (
            <article key={group.id} style={{ flexDirection: "column", alignItems: "stretch", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <strong>{group.name}</strong>
                <button onClick={() => removeGroup(group)} aria-label={`Delete group ${group.name}`}><Trash2 size={16} /></button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {(group.tabs || []).length === 0 && <small>No tabs yet — add one above.</small>}
                {(group.tabs || []).map((tab) => (
                  <span key={tab.id} style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 8px", borderRadius: "999px", background: "#f1f0fb" }}>
                    {tab.name}
                    <button onClick={() => removeTab(tab)} aria-label={`Delete tab ${tab.name}`} style={{ display: "inline-flex" }}><Trash2 size={12} /></button>
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
