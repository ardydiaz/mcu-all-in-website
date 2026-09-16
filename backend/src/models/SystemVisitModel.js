import { isDatabaseEnabled, query } from "../config/database.js";

const selectRecentSystems = `
  SELECT s.id, s.name AS title, c.name AS category, s.description, s.url,
    s.status, s.color, MAX(v.visited_at) AS visitedAt
  FROM system_visits v
  INNER JOIN systems s ON s.id = v.system_id
  INNER JOIN categories c ON c.id = s.category_id
  WHERE v.user_id = ?
    AND v.visited_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    AND s.deleted_at IS NULL
    AND s.status = 'active'
  GROUP BY s.id, s.name, c.name, s.description, s.url, s.status, s.color
  ORDER BY visitedAt DESC`;

export const SystemVisitModel = {
  async recentForUser(userId, limit = 3) {
    if (!isDatabaseEnabled()) return [];
    // MySQL prepared statements reject a bound LIMIT value in this setup.
    // Clamp and interpolate the integer so it remains safe.
    const safeLimit = Math.min(12, Math.max(1, Number.parseInt(limit, 10) || 3));
    return query(`${selectRecentSystems} LIMIT ${safeLimit}`, [userId]);
  },

  async record({ userId, systemId, referrer, userAgent }) {
    if (!isDatabaseEnabled()) return null;
    const systems = await query(
      "SELECT id FROM systems WHERE id = ? AND status = 'active' AND deleted_at IS NULL LIMIT 1",
      [systemId],
    );
    if (!systems[0]) return null;
    const result = await query(
      "INSERT INTO system_visits (system_id, user_id, referrer, user_agent) VALUES (?, ?, ?, ?)",
      [systemId, userId, String(referrer || "").slice(0, 2048) || null, String(userAgent || "").slice(0, 500) || null],
    );
    return { id: result.insertId, systemId };
  },
};
