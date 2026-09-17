import { isDatabaseEnabled, query } from "../config/database.js";

const selectGroups = `SELECT id, name, slug, description, display_order AS displayOrder,
  status, created_at AS createdAt, updated_at AS updatedAt FROM category_groups`;

const slugify = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "group";

export const CategoryGroupModel = {
  async create(payload) {
    const name = String(payload.name).trim();
    const result = await query(
      "INSERT INTO category_groups (name, slug, description, display_order, status) VALUES (?, ?, ?, ?, ?)",
      [name, `${slugify(name)}-${Date.now()}`, payload.description || null, Number(payload.displayOrder) || 0, payload.status === "inactive" ? "inactive" : "active"]
    );
    return this.findById(result.insertId);
  },

  async remove(id) {
    const current = await this.findById(id);
    if (!current) return null;
    await query("DELETE FROM category_groups WHERE id = ?", [id]);
    return current;
  },

  async all({ includeInactive = false } = {}) {
    if (!isDatabaseEnabled()) return [];
    const rows = await query(
      `${selectGroups} ${includeInactive ? "" : "WHERE status = 'active'"} ORDER BY display_order, name`
    );
    return rows;
  },

  async findById(id) {
    if (!isDatabaseEnabled()) return null;
    const rows = await query(`${selectGroups} WHERE id = ? LIMIT 1`, [id]);
    return rows[0] || null;
  },

  async withTabs(id) {
    if (!isDatabaseEnabled()) return null;
    const group = await this.findById(id);
    if (!group) return null;

    const tabs = await query(
      `SELECT id, name, slug, display_order AS displayOrder, status FROM categories
       WHERE category_group_id = ? AND is_tab = TRUE ORDER BY display_order`,
      [id]
    );
    return { ...group, tabs };
  },

  async allWithTabs() {
    const groups = await this.all();
    const grouped = await Promise.all(groups.map((g) => this.withTabs(g.id)));
    return grouped;
  },
};
