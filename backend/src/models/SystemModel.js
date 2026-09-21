import { randomUUID } from "node:crypto";
import { isDatabaseEnabled, query, readCollection, writeCollection } from "../config/database.js";
import { normalizeText, toIsoDate } from "../utils/formatter.js";

const collection = "services";
const CATEGORY_SEPARATOR = "";
const selectSystems = `SELECT s.id, s.name AS title, c.name AS category, s.description, s.url, s.links,
  s.status, s.color, s.created_at AS createdAt, s.updated_at AS updatedAt,
  s.deleted_at AS deletedAt, s.deleted_by AS deletedBy,
  GROUP_CONCAT(DISTINCT cat.name ORDER BY cat.name SEPARATOR '${CATEGORY_SEPARATOR}') AS categoryNames
  FROM systems s
  INNER JOIN categories c ON c.id = s.category_id
  LEFT JOIN system_categories sc ON sc.system_id = s.id
  LEFT JOIN categories cat ON cat.id = sc.category_id`;
const groupBySystems = "GROUP BY s.id, s.name, c.name, s.description, s.url, s.links, s.status, s.color, s.created_at, s.updated_at, s.deleted_at, s.deleted_by";

const slugify = (value) => normalizeText(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "system";

function mapRow(row) {
  if (!row) return row;
  const { categoryNames, ...rest } = row;
  return { ...rest, categories: categoryNames ? categoryNames.split(CATEGORY_SEPARATOR) : [row.category] };
}

async function categoryIdsFor(categoryNames) {
  const names = [...new Set((Array.isArray(categoryNames) ? categoryNames : [categoryNames]).map((name) => normalizeText(name)).filter(Boolean))];
  if (!names.length) {
    const error = new Error("Select at least one category.");
    error.status = 422;
    throw error;
  }
  const placeholders = names.map(() => "?").join(", ");
  const rows = await query(`SELECT id, name FROM categories WHERE is_tab = TRUE AND deleted_at IS NULL AND name IN (${placeholders})`, names);
  const missing = names.filter((name) => !rows.some((row) => row.name === name));
  if (missing.length) {
    const error = new Error(`\"${missing[0]}\" is not an assignable tab. Choose one of the categories created under Admin → Categories.`);
    error.status = 422;
    throw error;
  }
  return rows.map((row) => row.id);
}

async function assertNoDuplicate({ name, url, excludeId = null }) {
  const params = [name, url];
  let sql = "SELECT id, name FROM systems WHERE deleted_at IS NULL AND (LOWER(name) = LOWER(?) OR LOWER(url) = LOWER(?))";
  if (excludeId) { sql += " AND id != ?"; params.push(excludeId); }
  sql += " LIMIT 1";
  const [duplicate] = await query(sql, params);
  if (duplicate) {
    const error = new Error(`A service named \"${duplicate.name}\" already exists. Edit that entry and add more categories to it instead of creating a new one.`);
    error.status = 409;
    throw error;
  }
}

async function syncCategories(systemId, categoryIds) {
  await query("DELETE FROM system_categories WHERE system_id = ?", [systemId]);
  if (!categoryIds.length) return;
  const values = categoryIds.map(() => "(?, ?)").join(", ");
  const params = categoryIds.flatMap((categoryId) => [systemId, categoryId]);
  await query(`INSERT INTO system_categories (system_id, category_id) VALUES ${values}`, params);
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
    const rows = await query(`${selectSystems} ${includeDeleted ? "" : "WHERE s.deleted_at IS NULL"} ${groupBySystems} ORDER BY s.display_order, s.name`);
    return rows.map(mapRow);
  },
  async findById(id) {
    if (!isDatabaseEnabled()) return jsonModel.findById(id);
    const rows = await query(`${selectSystems} WHERE s.id = ? ${groupBySystems} LIMIT 1`, [id]);
    return mapRow(rows[0]) || null;
  },
  async create(payload) {
    if (!isDatabaseEnabled()) return jsonModel.create(payload);
    const item = normalize(payload);
    await assertNoDuplicate({ name: item.title, url: item.url });
    const categoryIds = await categoryIdsFor(item.categories);
    const result = await query("INSERT INTO systems (category_id, name, slug, description, url, links, color, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [categoryIds[0], item.title, `${slugify(item.title)}-${Date.now()}`, item.description, item.url, JSON.stringify(item.links), item.color, item.status]);
    await syncCategories(result.insertId, categoryIds);
    return this.findById(result.insertId);
  },
  async update(id, payload) {
    if (!isDatabaseEnabled()) return jsonModel.update(id, payload);
    const current = await this.findById(id); if (!current || current.deletedAt) return null;
    const item = normalize(payload, current);
    await assertNoDuplicate({ name: item.title, url: item.url, excludeId: id });
    const categoryIds = await categoryIdsFor(item.categories);
    await query("UPDATE systems SET category_id = ?, name = ?, description = ?, url = ?, links = ?, color = ?, status = ? WHERE id = ?", [categoryIds[0], item.title, item.description, item.url, JSON.stringify(item.links), item.color, item.status, id]);
    await syncCategories(id, categoryIds);
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

function normalizeLinks(links) {
  if (!Array.isArray(links) || !links.length) return null;
  return links
    .filter((link) => link && link.label && link.url)
    .map((link) => ({ label: normalizeText(link.label), icon: link.icon, url: normalizeText(link.url) }));
}

function normalize(payload, base = {}) {
  const categories = payload.categories ?? (payload.category ? [payload.category] : base.categories ?? ["University"]);
  const links = payload.links !== undefined ? normalizeLinks(payload.links) : (base.links ?? null);
  return { ...base, title: normalizeText(payload.title ?? base.title), categories, category: categories[0], description: normalizeText(payload.description ?? base.description), url: normalizeText(payload.url ?? base.url ?? "#"), links, status: payload.status === "inactive" ? "inactive" : "active", color: normalizeText(payload.color ?? base.color ?? "violet") };
}
