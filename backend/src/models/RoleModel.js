import { isDatabaseEnabled, query } from "../config/database.js";

const developmentRoles = [
  { id: 1, name: "Super Admin", slug: "super_admin" },
  { id: 2, name: "Administrator", slug: "administrator" },
  { id: 3, name: "Faculty", slug: "faculty" },
  { id: 4, name: "Student", slug: "student" },
];

export const RoleModel = {
  all() {
    if (!isDatabaseEnabled()) return developmentRoles;
    return query("SELECT id, name, slug, created_at FROM roles ORDER BY id");
  },
  async findById(id) {
    if (!isDatabaseEnabled()) return developmentRoles.find((role) => role.id === Number(id)) || null;
    const rows = await query("SELECT id, name, slug, created_at FROM roles WHERE id = ? LIMIT 1", [id]);
    return rows[0] || null;
  },
};
