import { UserAnnouncementReadModel } from "../models/UserAnnouncementReadModel.js";

export const NotificationService = {
  async listForUser(userId) {
    const announcements = await UserAnnouncementReadModel.forUser(userId);
    return { announcements, unreadCount: announcements.filter((item) => !item.isRead).length };
  },
  markRead: (userId, announcementId) => UserAnnouncementReadModel.markRead(userId, announcementId),
};
