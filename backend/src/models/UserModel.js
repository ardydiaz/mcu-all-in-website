import { query } from "../config/database.js";

const selectUser = `
  SELECT
    u.id,
    u.microsoft_id,
    u.email,
    u.fullname,
    u.role_id,
    u.department,
    u.status,
    u.created_at,
    r.name AS role_name,
    r.slug AS role
  FROM users u
  INNER JOIN roles r ON r.id = u.role_id
`;

export const UserModel = {
  all() {
    return query(`${selectUser} ORDER BY u.created_at DESC`);
  },
  async findByEmail(email) {
    const rows = await query(`${selectUser} WHERE LOWER(u.email) = LOWER(?) LIMIT 1`, [email]);
    return rows[0] || null;
  },
  async findByMicrosoftId(microsoftId) {
    const rows = await query(`${selectUser} WHERE u.microsoft_id = ? LIMIT 1`, [microsoftId]);
    return rows[0] || null;
  },
  async createFromMicrosoft(profile, roleId = 4) {
    const result = await query(
      `INSERT INTO users (microsoft_id, email, fullname, role_id, department, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [profile.id, profile.email, profile.fullname, roleId, profile.department || null],
    );
    const rows = await query(`${selectUser} WHERE u.id = ? LIMIT 1`, [result.insertId]);
    return rows[0];
  },
  async syncMicrosoftProfile(id, profile) {
    await query(
      `UPDATE users
       SET microsoft_id = ?, email = ?, fullname = ?, department = COALESCE(?, department)
       WHERE id = ?`,
      [profile.id, profile.email, profile.fullname, profile.department || null, id],
    );
    const rows = await query(`${selectUser} WHERE u.id = ? LIMIT 1`, [id]);
    return rows[0];
  },
};
