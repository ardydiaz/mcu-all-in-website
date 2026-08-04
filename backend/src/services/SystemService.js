import { SystemModel } from "../models/SystemModel.js";
import { ActivityLogModel } from "../models/ActivityLogModel.js";
import { publishDirectoryUpdate } from "../helpers/directoryEvents.js";

export const SystemService = {
  list: (options) => SystemModel.all(options),
  get: (id) => SystemModel.findById(id),
  async create(payload, actor) {
    const item = await SystemModel.create(payload);
    await ActivityLogModel.record("system.created", actor, { id: item.id, title: item.title });
    publishDirectoryUpdate("system.created");
    return item;
  },
  async update(id, payload, actor) {
    const item = await SystemModel.update(id, payload);
    if (item) await ActivityLogModel.record("system.updated", actor, { id, title: item.title });
    if (item) publishDirectoryUpdate("system.updated");
    return item;
  },
  async remove(id, actor) {
    const removed = await SystemModel.softDelete(id, actor);
    if (removed) await ActivityLogModel.record("system.soft_deleted", actor, { id, title: removed.title });
    if (removed) publishDirectoryUpdate("system.deleted");
    return removed;
  },
  async restore(id, actor) {
    const restored = await SystemModel.restore(id);
    if (restored) await ActivityLogModel.record("system.restored", actor, { id, title: restored.title });
    if (restored) publishDirectoryUpdate("system.restored");
    return restored;
  },
};
