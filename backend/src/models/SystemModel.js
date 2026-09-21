import { randomUUID } from "node:crypto";
import { isDatabaseEnabled, query, readCollection, writeCollection } from "../config/database.js";
import { normalizeText, toIsoDate } from "../utils/formatter.js";

const collection = "services";
const selectSystems = `SELECT s.id, s.name AS title, c.name AS category, s.description, s.url,
  s.status, s.color, s.created_at AS createdAt, s.updated_at AS updatedAt,
  s.deleted_at AS deletedAt, s.deleted_by AS deletedBy
  FROM systems s INNER JOIN categories c ON c.id = s.category_id`;

const slugify = (value) => normalizeText(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "system";

async function categoryIdFor(category) {
  const rows = await query("SELECT id FROM categories WHERE name = ? AND deleted_at IS NULL AND is_tab = TRUE LIMIT 1", [category]);
  if (!rows[0]) {
    const error = new Error(`\"${category}\" is not an assignable tab. Choose one of the categories created under Admin → Categories.`);
    error.status = 422;
    throw error;
  }
  return rows[0].id;
}

async function assertNoDuplicate({ name, url, excludeId = null }) {
  const params = [name, url];
  let sql = "SELECT id, name FROM systems WHERE deleted_at IS NULL AND (LOWER(name) = LOWER(?) OR LOWER(url) = LOWER(?))";
  if (excludeId) { sql += " AND id != ?"; params.push(excludeId); }
  sql += " LIMIT 1";
  const [duplicate] = await query(sql, params);
  if (duplicate) {
    const error = new Error(`A service named \"${duplicate.name}\" already exists. A service can only belong to one category — edit that entry instead of adding it again under another category.`);
    error.status = 409;
    throw error;
  }
}

const jsonModel = {
  async all({ includeDeleted = false } = {}) {
    const items = await readCollection(collection);
    return includeDeleted ? items : items.filter((item) => !item.deletedAt);
  },
  async findById(id) { return (await this.all({ includeDeleted: true })).find((item) => String(item.id) === String(id)) || null; },
  async create(payload) {
    const items = await this.all({ includeDeleted: true });
    const timestamp = toIsoDate();
    const item = normalize(payload, { id: randomUUID(), createdAt: timestamp, updatedAt: timestamp, deletedAt: null, deletedBy: null });
    items.unshift(item); await writeCollection(collection, items); return item;
  },
  async update(id, payload) {
    const items = await this.all({ includeDeleted: true }); const index = items.findIndex((item) => String(item.id) === String(id));
    if (index < 0) return null; items[index] = normalize(payload, { ...items[index], updatedAt: toIsoDate() }); await writeCollection(collection, items); return items[index];
  },
  async softDelete(id, deletedBy = "system") {
    const items = await this.all({ includeDeleted: true }); const index = items.findIndex((item) => String(item.id) === String(id));
    if (index < 0 || items[index].deletedAt) return null; items[index] = { ...items[index], status: "inactive", deletedAt: toIsoDate(), deletedBy, updatedAt: toIsoDate() }; await writeCollection(collection, items); return items[index];
  },
  async restore(id) {
    const items = await this.all({ includeDeleted: true }); const index = items.findIndex((item) => String(item.id) === String(id));
    if (index < 0 || !items[index].deletedAt) return null; items[index] = { ...items[index], status: "active", deletedAt: null, deletedBy: null, updatedAt: toIsoDate() }; await writeCollection(collection, items); return items[index];
  },
};

export const SystemModel = {
  async all({ includeDeleted = false } = {}) {
    if (!isDatabaseEnabled()) return jsonModel.all({ includeDeleted });
    return query(`${selectSystems} ${includeDeleted ? "" : "WHERE s.deleted_at IS NULL"} ORDER BY s.display_order, s.name`);
  },
  async findById(id) {
    if (!isDatabaseEnabled()) return jsonModel.findById(id);
    const rows = await query(`${selectSystems} WHERE s.id = ? LIMIT 1`, [id]); return rows[0] || null;
  },
  async create(payload) {
    if (!isDatabaseEnabled()) return jsonModel.create(payload);
    const item = normalize(payload);
    await assertNoDuplicate({ name: item.title, url: item.url });
    const categoryId = await categoryIdFor(item.category);
    const result = await query("INSERT INTO systems (category_id, name, slug, description, url, color, status) VALUES (?, ?, ?, ?, ?, ?, ?)", [categoryId, item.title, `${slugify(item.title)}-${Date.now()}`, item.description, item.url, item.color, item.status]);
    return this.findById(result.insertId);
  },
  async update(id, payload) {
    if (!isDatabaseEnabled()) return jsonModel.update(id, payload);
    const current = await this.findById(id); if (!current || current.deletedAt) return null;
    const item = normalize(payload, current);
    await assertNoDuplicate({ name: item.title, url: item.url, excludeId: id });
    const categoryId = await categoryIdFor(item.category);
    await query("UPDATE systems SET category_id = ?, name = ?, description = ?, url = ?, color = ?, status = ? WHERE id = ?", [categoryId, item.title, item.description, item.url, item.color, item.status, id]);
    return this.findById(id);
  },
  async softDelete(id, deletedBy = null) {
    if (!isDatabaseEnabled()) return jsonModel.softDelete(id, deletedBy);
    const current = await this.findById(id); if (!current || current.deletedAt) return null;
    await query("UPDATE systems SET status = 'inactive', deleted_at = CURRENT_TIMESTAMP, deleted_by = NULL WHERE id = ?", [id]);
    return this.findById(id);
  },
  async restore(id) {
    if (!isDatabaseEnabled()) return jsonModel.restore(id);
    const current = await this.findById(id); if (!current || !current.deletedAt) return null;
    await query("UPDATE systems SET status = 'active', deleted_at = NULL, deleted_by = NULL WHERE id = ?", [id]);
    return this.findById(id);
  },
};

function normalize(payload, base = {}) {
  return { ...base, title: normalizeText(payload.title ?? base.title), category: normalizeText(payload.category ?? base.category ?? "University"), description: normalizeText(payload.description ?? base.description), url: normalizeText(payload.url ?? base.url ?? "#"), status: payload.status === "inactive" ? "inactive" : "active", color: normalizeText(payload.color ?? base.color ?? "violet") };
}
