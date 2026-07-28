import { readCollection, writeCollection } from "../config/database.js";
export const AnnouncementModel = {
  all: () => readCollection("announcements", []),
  saveAll: (items) => writeCollection("announcements", items),
};
