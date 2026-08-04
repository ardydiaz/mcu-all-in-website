import { CategoryModel } from "../models/CategoryModel.js";
import { ActivityLogModel } from "../models/ActivityLogModel.js";
import { publishDirectoryUpdate } from "../helpers/directoryEvents.js";

export const CategoryService = {
  list: (options) => CategoryModel.all(options),
  async create(payload, actor) {
    const item = await CategoryModel.create(payload);
    await ActivityLogModel.record("category.created", actor, { id: item.id, name: item.name });
    publishDirectoryUpdate("category.created");
    return item;
  },
  async update(id, payload, actor) {
    const item = await CategoryModel.update(id, payload);
    if (item) await ActivityLogModel.record("category.updated", actor, { id, name: item.name });
    if (item) publishDirectoryUpdate("category.updated");
    return item;
  },
  async remove(id, actor) {
    const item = await CategoryModel.softDelete(id, actor);
    if (item) await ActivityLogModel.record("category.soft_deleted", actor, { id, name: item.name });
    if (item) publishDirectoryUpdate("category.deleted");
    return item;
  },
  async restore(id, actor) {
    const item = await CategoryModel.restore(id);
    if (item) await ActivityLogModel.record("category.restored", actor, { id, name: item.name });
    if (item) publishDirectoryUpdate("category.restored");
    return item;
  },
};
