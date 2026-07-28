import { randomUUID } from "node:crypto";
import { CategoryModel } from "../models/CategoryModel.js";

export const CategoryService = {
  list: () => CategoryModel.all(),
  async create(payload) {
    const items = await CategoryModel.all();
    const item = { id: randomUUID(), name: String(payload.name).trim(), status: payload.status === "inactive" ? "inactive" : "active" };
    items.push(item);
    await CategoryModel.saveAll(items);
    return item;
  },
};
