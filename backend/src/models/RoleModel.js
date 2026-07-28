import { query } from "../config/database.js";

export const RoleModel = {
  all() {
    return query("SELECT id, name, slug, created_at FROM roles ORDER BY id");
  },
  async findById(id) {
    const rows = await query("SELECT id, name, slug, created_at FROM roles WHERE id = ? LIMIT 1", [id]);
    return rows[0] || null;
  },
};
