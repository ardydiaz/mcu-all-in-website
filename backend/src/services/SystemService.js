import { SystemModel } from "../models/SystemModel.js";
import { ActivityLogModel } from "../models/ActivityLogModel.js";

export const SystemService = {
  list: () => SystemModel.all(),
  get: (id) => SystemModel.findById(id),
  async create(payload, actor) {
    const item = await SystemModel.create(payload);
    await ActivityLogModel.record("system.created", actor, { id: item.id, title: item.title });
    return item;
  },
  async update(id, payload, actor) {
    const item = await SystemModel.update(id, payload);
    if (item) await ActivityLogModel.record("system.updated", actor, { id, title: item.title });
    return item;
  },
  async remove(id, actor) {
    const removed = await SystemModel.remove(id);
    if (removed) await ActivityLogModel.record("system.deleted", actor, { id });
    return removed;
  },
};
