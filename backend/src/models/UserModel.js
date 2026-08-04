import { isDatabaseEnabled, query, readCollection, writeCollection } from "../config/database.js";

const developmentUsers = [{
  id: "api-test-admin",
  microsoft_id: "development-api-account",
  email: process.env.API_TEST_EMAIL || "api.admin@mcu.edu.ph",
  fullname: "MCU API Test Administrator",
  role_id: 1,
  role_name: "Super Admin",
  role: "super_admin",
  department: null,
  status: "active",
  created_at: new Date().toISOString(),
}];

const selectUser = `
  SELECT u.id, u.microsoft_id, u.email, u.fullname, u.role_id, u.department,
    u.status, u.created_at, r.name AS role_name, r.slug AS role
  FROM users u
  INNER JOIN roles r ON r.id = u.role_id
`;

async function developmentCollection() {
  return readCollection("users", developmentUsers);
}

export const UserModel = {
  async all() {
    if (!isDatabaseEnabled()) return developmentCollection();
    return query(`${selectUser} ORDER BY u.created_at DESC`);
  },
  async findByEmail(email) {
    if (!isDatabaseEnabled()) return (await developmentCollection()).find((user) => user.email.toLowerCase() === String(email).toLowerCase()) || null;
    const rows = await query(`${selectUser} WHERE LOWER(u.email) = LOWER(?) LIMIT 1`, [email]);
    return rows[0] || null;
  },
  async findByMicrosoftId(microsoftId) {
    if (!isDatabaseEnabled()) return (await developmentCollection()).find((user) => user.microsoft_id === microsoftId) || null;
    const rows = await query(`${selectUser} WHERE u.microsoft_id = ? LIMIT 1`, [microsoftId]);
    return rows[0] || null;
  },
  async updateRole(id, role) {
    if (!isDatabaseEnabled()) {
      const users = await developmentCollection();
      const index = users.findIndex((user) => String(user.id) === String(id));
      if (index < 0) return null;
      users[index] = {
        ...users[index],
        role_id: role.id,
        role_name: role.name,
        role: role.slug,
        updated_at: new Date().toISOString(),
      };
      await writeCollection("users", users);
      return users[index];
    }
    await query("UPDATE users SET role_id = ? WHERE id = ?", [role.id, id]);
    const rows = await query(`${selectUser} WHERE u.id = ? LIMIT 1`, [id]);
    return rows[0] || null;
  },
  async createFromMicrosoft(profile, roleId = 4) {
    if (!isDatabaseEnabled()) {
      const users = await developmentCollection();
      const user = { id: `dev-${Date.now()}`, microsoft_id: profile.id, email: profile.email, fullname: profile.fullname, role_id: roleId, role_name: "Student", role: "student", department: profile.department || null, status: "active", created_at: new Date().toISOString() };
      users.push(user);
      await writeCollection("users", users);
      return user;
    }
    const result = await query(`INSERT INTO users (microsoft_id, email, fullname, role_id, department, status) VALUES (?, ?, ?, ?, ?, 'active')`, [profile.id, profile.email, profile.fullname, roleId, profile.department || null]);
    const rows = await query(`${selectUser} WHERE u.id = ? LIMIT 1`, [result.insertId]);
    return rows[0];
  },
  async syncMicrosoftProfile(id, profile) {
    if (!isDatabaseEnabled()) {
      const users = await developmentCollection();
      const index = users.findIndex((user) => String(user.id) === String(id));
      if (index < 0) return null;
      users[index] = { ...users[index], microsoft_id: profile.id, email: profile.email, fullname: profile.fullname, department: profile.department || users[index].department };
      await writeCollection("users", users);
      return users[index];
    }
    await query(`UPDATE users SET microsoft_id = ?, email = ?, fullname = ?, department = COALESCE(?, department) WHERE id = ?`, [profile.id, profile.email, profile.fullname, profile.department || null, id]);
    const rows = await query(`${selectUser} WHERE u.id = ? LIMIT 1`, [id]);
    return rows[0];
  },
};
