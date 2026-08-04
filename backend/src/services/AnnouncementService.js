import { AnnouncementModel } from "../models/AnnouncementModel.js";
import { ActivityLogModel } from "../models/ActivityLogModel.js";
import { publishDirectoryUpdate } from "../helpers/directoryEvents.js";
export const AnnouncementService = {
  list: (options) => AnnouncementModel.all(options),
  publicList: () => AnnouncementModel.published(),
  get: (id) => AnnouncementModel.findById(id),
  async create(payload, actor, actorId) {
    const item = await AnnouncementModel.create(payload, actorId);
    await ActivityLogModel.record("announcement.created", actor, { id: item.id, title: item.title });
    publishDirectoryUpdate("announcement.created");
    return item;
  },
  async update(id, payload, actor, actorId) {
    const item = await AnnouncementModel.update(id, payload, actorId);
    if (item) await ActivityLogModel.record("announcement.updated", actor, { id, title: item.title });
    if (item) publishDirectoryUpdate("announcement.updated");
    return item;
  },
  async remove(id, actor, actorId) {
    const item = await AnnouncementModel.softDelete(id, actorId);
    if (item) await ActivityLogModel.record("announcement.soft_deleted", actor, { id, title: item.title });
    if (item) publishDirectoryUpdate("announcement.deleted");
    return item;
  },
  async restore(id, actor, actorId) {
    const item = await AnnouncementModel.restore(id, actorId);
    if (item) await ActivityLogModel.record("announcement.restored", actor, { id, title: item.title });
    if (item) publishDirectoryUpdate("announcement.restored");
    return item;
  },
};
