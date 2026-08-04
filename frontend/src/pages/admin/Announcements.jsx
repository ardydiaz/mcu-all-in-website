import React, { useEffect, useState } from "react";
import { CalendarDays, Megaphone, Plus, Trash2 } from "lucide-react";
import { adminApi } from "../../services/adminApi";

const initialForm = { title: "", content: "", excerpt: "", linkUrl: "", audience: "all", status: "draft", isFeatured: false, startsAt: "", endsAt: "" };

export default function Announcements() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const load = () => adminApi.getAnnouncements().then(setItems).catch((error) => setMessage(error.message));
  useEffect(() => { load(); }, []);
  const update = (field, value) => { setForm((current) => ({ ...current, [field]: value })); setErrors((current) => ({ ...current, [field]: "" })); };

  async function submit(event) {
    event.preventDefault(); setSaving(true); setMessage(""); setErrors({});
    try {
      await adminApi.createAnnouncement({ ...form, startsAt: form.startsAt || null, endsAt: form.endsAt || null });
      setForm(initialForm); setMessage("Announcement saved successfully."); load();
    } catch (error) {
      const fieldErrors = (error.errors || []).reduce((result, item) => ({ ...result, [item.field]: item.message }), {});
      setErrors(Object.keys(fieldErrors).length ? fieldErrors : { form: error.message });
    } finally { setSaving(false); }
  }
  async function remove(item) { if (!window.confirm(`Delete “${item.title}”?`)) return; try { await adminApi.deleteAnnouncement(item.id); setMessage("Announcement moved to archived items."); load(); } catch (error) { setMessage(error.message); } }

  return <main className="admin-simple-page announcements-page">
    <section className="simple-page-heading"><span className="eyebrow"><i /> COMMUNICATIONS</span><h1>Announcements</h1><p>Create messages that appear in the public notification bell.</p></section>
    <section className="announcement-admin-grid">
      <form className="simple-card announcement-form" onSubmit={submit} noValidate>
        <div className="simple-card-title"><div><h2>Create announcement</h2><p>Publish immediately or save as a draft.</p></div><Megaphone /></div>
        <div className="announcement-form-fields">
          <label>Title<input className={errors.title ? "input-error" : ""} value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="e.g. Enrollment Advisory" />{errors.title && <small className="field-error">{errors.title}</small>}</label>
          <label>Short description<input value={form.excerpt} onChange={(event) => update("excerpt", event.target.value)} placeholder="Brief notification preview" /></label>
          <label className="announcement-wide">Message<textarea className={errors.content ? "input-error" : ""} value={form.content} onChange={(event) => update("content", event.target.value)} placeholder="Write the full announcement…" />{errors.content && <small className="field-error">{errors.content}</small>}</label>
          <label className="announcement-wide">Link URL (optional)<input className={errors.linkUrl ? "input-error" : ""} value={form.linkUrl} onChange={(event) => update("linkUrl", event.target.value)} placeholder="https://mcu.edu.ph/..." />{errors.linkUrl && <small className="field-error">{errors.linkUrl}</small>}</label>
          <label>Audience<select value={form.audience} onChange={(event) => update("audience", event.target.value)}><option value="all">Everyone</option><option value="students">Students</option><option value="faculty">Faculty</option><option value="administrators">Administrators</option></select></label>
          <label>Status<select value={form.status} onChange={(event) => update("status", event.target.value)}><option value="draft">Draft</option><option value="published">Published</option></select></label>
          <label>Start date<input type="datetime-local" value={form.startsAt} onChange={(event) => update("startsAt", event.target.value)} /></label>
          <label>End date<input className={errors.endsAt ? "input-error" : ""} type="datetime-local" value={form.endsAt} onChange={(event) => update("endsAt", event.target.value)} />{errors.endsAt && <small className="field-error">{errors.endsAt}</small>}</label>
          <label className="announcement-featured"><input type="checkbox" checked={form.isFeatured} onChange={(event) => update("isFeatured", event.target.checked)} />Feature this announcement</label>
        </div>
        {errors.form && <p className="modal-form-error">{errors.form}</p>}<div className="announcement-submit"><button disabled={saving}><Plus size={17} />{saving ? "Saving…" : "Save announcement"}</button></div>
      </form>
      <section className="simple-card announcement-list-card"><div className="simple-card-title"><div><h2>Saved announcements</h2><p>{items.length} announcement{items.length === 1 ? "" : "s"} in the API.</p></div><CalendarDays /></div><div className="announcement-admin-list">{items.map((item) => <article key={item.id}><span><Megaphone size={18} /></span><div><strong>{item.title}</strong><small>{item.excerpt || item.content}</small><em className={item.status}>{item.status}</em></div><button onClick={() => remove(item)} aria-label={`Delete ${item.title}`}><Trash2 size={16} /></button></article>)}{!items.length && <p>No announcements yet. Create your first notification.</p>}</div></section>
    </section>
  </main>;
}
