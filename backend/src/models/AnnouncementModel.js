import { isDatabaseEnabled, query, readCollection, writeCollection } from "../config/database.js";

export const AnnouncementModel = {
  async all() {
    if (!isDatabaseEnabled()) return readCollection("announcements", []);
    return query("SELECT id, title, slug, content, excerpt, image_path AS imagePath, link_url AS linkUrl, audience, status, is_featured AS isFeatured, starts_at AS startsAt, ends_at AS endsAt, published_at AS publishedAt, created_at AS createdAt, updated_at AS updatedAt FROM announcements ORDER BY created_at DESC");
  },
  async saveAll(items) {
    if (!isDatabaseEnabled()) return writeCollection("announcements", items);
    return items;
  },
};
