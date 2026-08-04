import { query } from "../config/database.js";

const availableAnnouncements = `a.deleted_at IS NULL AND a.status = 'published' AND a.audience = 'all'
  AND (a.starts_at IS NULL OR a.starts_at <= NOW()) AND (a.ends_at IS NULL OR a.ends_at >= NOW())`;

export const UserAnnouncementReadModel = {
  async forUser(userId) {
    return query(`SELECT a.id, a.title, a.content, a.excerpt, a.link_url AS linkUrl,
      a.published_at AS publishedAt, a.created_at AS createdAt,
      CASE WHEN r.read_at IS NULL THEN FALSE ELSE TRUE END AS isRead
      FROM announcements a LEFT JOIN user_announcement_reads r
        ON r.announcement_id = a.id AND r.user_id = ?
      WHERE ${availableAnnouncements}
      ORDER BY a.is_featured DESC, COALESCE(a.published_at, a.created_at) DESC`, [userId]);
  },
  async markRead(userId, announcementId) {
    const available = await query(`SELECT id FROM announcements a WHERE a.id = ? AND ${availableAnnouncements} LIMIT 1`, [announcementId]);
    if (!available[0]) return false;
    await query("INSERT INTO user_announcement_reads (user_id, announcement_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE read_at = read_at", [userId, announcementId]);
    return true;
  },
};
