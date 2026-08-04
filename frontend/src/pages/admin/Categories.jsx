import React, { useEffect, useState } from "react";
import { Plus, Tags, Trash2 } from "lucide-react";
import { adminApi } from "../../services/adminApi";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const load = () => adminApi.getCategories().then(setCategories).catch((error) => setMessage(error.message));
  useEffect(() => { load(); }, []);
  async function add(event) {
    event.preventDefault(); setErrors({}); setMessage("");
    try { await adminApi.createCategory({ name: name.trim(), status: "active" }); setName(""); setMessage("Category added."); load(); }
    catch (error) {
      const fieldErrors = (error.errors || []).reduce((result, item) => ({ ...result, [item.field]: item.message }), {});
      setErrors(Object.keys(fieldErrors).length ? fieldErrors : { form: error.message });
    }
  }
  async function remove(category) { if (!window.confirm(`Remove ${category.name}?`)) return; try { await adminApi.deleteCategory(category.id); setMessage("Category moved to deleted items."); load(); } catch (error) { setMessage(error.message); } }
  return (
    <main className="admin-simple-page"><section className="simple-page-heading"><span className="eyebrow"><i /> DIRECTORY MANAGEMENT</span><h1>Categories</h1><p>Organize MCU systems into public directory groups.</p></section><section className="simple-card"><div className="simple-card-title"><div><h2>Directory categories</h2><p>Add or soft-delete categories without editing the frontend.</p></div><Tags /></div><form className="category-create" onSubmit={add}><div className="category-input-wrap"><input className={errors.name ? "input-error" : ""} value={name} onChange={(event) => { setName(event.target.value); setErrors((current) => ({ ...current, name: "" })); }} aria-invalid={Boolean(errors.name)} placeholder="New category name" />{errors.name && <small className="field-error">{errors.name}</small>}</div><button><Plus size={16} />Add category</button></form>{errors.form && <p className="modal-form-error">{errors.form}</p>}{message && <p className="users-message">{message}</p>}<div className="category-grid">{categories.map((category) => <article key={category.id}><span><Tags size={18} /></span><strong>{category.name}</strong><small>{category.status || "active"}</small><button onClick={() => remove(category)} aria-label={`Delete ${category.name}`}><Trash2 size={16} /></button></article>)}</div></section></main>
  );
}
