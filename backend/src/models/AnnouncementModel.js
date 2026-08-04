import { randomUUID } from "node:crypto";
import { isDatabaseEnabled, query, readCollection, writeCollection } from "../config/database.js";
import { normalizeText, toIsoDate } from "../utils/formatter.js";

const collection = "announcements";
const selectAnnouncements = `SELECT id, title, slug, content, excerpt, image_path AS imagePath,
  link_url AS linkUrl, audience, status, is_featured AS isFeatured, starts_at AS startsAt,
  ends_at AS endsAt, published_at AS publishedAt, created_at AS createdAt, updated_at AS updatedAt,
  deleted_at AS deletedAt, deleted_by AS deletedBy FROM announcements`;
const slugify = (value) => normalizeText(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "announcement";
const validAudience = new Set(["all", "students", "faculty", "administrators"]);
const validStatus = new Set(["draft", "published", "archived"]);

function normalize(payload, base = {}) {
  const status = payload.status ?? base.status ?? "draft";
  return {
    ...base,
    title: normalizeText(payload.title ?? base.title),
    content: normalizeText(payload.content ?? base.content),
    excerpt: normalizeText(payload.excerpt ?? base.excerpt),
    linkUrl: normalizeText(payload.linkUrl ?? base.linkUrl) || null,
    imagePath: normalizeText(payload.imagePath ?? base.imagePath) || null,
    audience: validAudience.has(payload.audience) ? payload.audience : (base.audience || "all"),
    status: validStatus.has(status) ? status : "draft",
    isFeatured: Boolean(payload.isFeatured ?? base.isFeatured ?? false),
    startsAt: payload.startsAt ?? base.startsAt ?? null,
    endsAt: payload.endsAt ?? base.endsAt ?? null,
  };
}

const jsonModel = {
  async all({ includeDeleted = false } = {}) { const items = await readCollection(collection, []); return includeDeleted ? items : items.filter((item) => !item.deletedAt); },
  async findById(id) { return (await this.all({ includeDeleted: true })).find((item) => String(item.id) === String(id)) || null; },
  async create(payload) { const items = await this.all({ includeDeleted: true }); const now = toIsoDate(); const item = { ...normalize(payload), id: randomUUID(), slug: `${slugify(payload.title)}-${Date.now()}`, publishedAt: payload.status === "published" ? now : null, createdAt: now, updatedAt: now, deletedAt: null, deletedBy: null }; items.unshift(item); await writeCollection(collection, items); return item; },
  async update(id, payload) { const items = await this.all({ includeDeleted: true }); const index = items.findIndex((item) => String(item.id) === String(id)); if (index < 0 || items[index].deletedAt) return null; const next = normalize(payload, items[index]); items[index] = { ...next, id: items[index].id, slug: items[index].slug, publishedAt: next.status === "published" ? (items[index].publishedAt || toIsoDate()) : items[index].publishedAt, updatedAt: toIsoDate() }; await writeCollection(collection, items); return items[index]; },
  async softDelete(id, deletedBy) { const items = await this.all({ includeDeleted: true }); const index = items.findIndex((item) => String(item.id) === String(id)); if (index < 0 || items[index].deletedAt) return null; items[index] = { ...items[index], status: "archived", deletedAt: toIsoDate(), deletedBy, updatedAt: toIsoDate() }; await writeCollection(collection, items); return items[index]; },
  async restore(id) { const items = await this.all({ includeDeleted: true }); const index = items.findIndex((item) => String(item.id) === String(id)); if (index < 0 || !items[index].deletedAt) return null; items[index] = { ...items[index], deletedAt: null, deletedBy: null, updatedAt: toIsoDate() }; await writeCollection(collection, items); return items[index]; },
};

export const AnnouncementModel = {
  async all({ includeDeleted = false } = {}) { if (!isDatabaseEnabled()) return jsonModel.all({ includeDeleted }); return query(`${selectAnnouncements} ${includeDeleted ? "" : "WHERE deleted_at IS NULL"} ORDER BY created_at DESC`); },
  async findById(id) { if (!isDatabaseEnabled()) return jsonModel.findById(id); const rows = await query(`${selectAnnouncements} WHERE id = ? LIMIT 1`, [id]); return rows[0] || null; },
  async create(payload, actorId = null) { if (!isDatabaseEnabled()) return jsonModel.create(payload); const item = normalize(payload); const publishedAt = item.status === "published" ? new Date() : null; const result = await query("INSERT INTO announcements (title, slug, content, excerpt, image_path, link_url, audience, status, is_featured, starts_at, ends_at, published_at, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [item.title, `${slugify(item.title)}-${Date.now()}`, item.content, item.excerpt || null, item.imagePath, item.linkUrl, item.audience, item.status, item.isFeatured, item.startsAt, item.endsAt, publishedAt, actorId, actorId]); return this.findById(result.insertId); },
  async update(id, payload, actorId = null) { if (!isDatabaseEnabled()) return jsonModel.update(id, payload); const current = await this.findById(id); if (!current || current.deletedAt) return null; const item = normalize(payload, current); const publishedAt = item.status === "published" ? (current.publishedAt || new Date()) : current.publishedAt; await query("UPDATE announcements SET title = ?, content = ?, excerpt = ?, image_path = ?, link_url = ?, audience = ?, status = ?, is_featured = ?, starts_at = ?, ends_at = ?, published_at = ?, updated_by = ? WHERE id = ?", [item.title, item.content, item.excerpt || null, item.imagePath, item.linkUrl, item.audience, item.status, item.isFeatured, item.startsAt, item.endsAt, publishedAt, actorId, id]); return this.findById(id); },
  async softDelete(id, actorId = null) { if (!isDatabaseEnabled()) return jsonModel.softDelete(id, actorId); const current = await this.findById(id); if (!current || current.deletedAt) return null; await query("UPDATE announcements SET status = 'archived', deleted_at = CURRENT_TIMESTAMP, deleted_by = ?, updated_by = ? WHERE id = ?", [actorId, actorId, id]); return this.findById(id); },
  async restore(id, actorId = null) { if (!isDatabaseEnabled()) return jsonModel.restore(id); const current = await this.findById(id); if (!current || !current.deletedAt) return null; await query("UPDATE announcements SET deleted_at = NULL, deleted_by = NULL, updated_by = ? WHERE id = ?", [actorId, id]); return this.findById(id); },
  async published() { if (!isDatabaseEnabled()) { const now = new Date().toISOString(); return (await jsonModel.all()).filter((item) => item.status === "published" && item.audience === "all" && (!item.startsAt || item.startsAt <= now) && (!item.endsAt || item.endsAt >= now)); } return query(`${selectAnnouncements} WHERE deleted_at IS NULL AND status = 'published' AND audience = 'all' AND (starts_at IS NULL OR starts_at <= NOW()) AND (ends_at IS NULL OR ends_at >= NOW()) ORDER BY is_featured DESC, COALESCE(published_at, created_at) DESC LIMIT 15`); },
};
