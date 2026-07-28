import { randomUUID } from "node:crypto";
import { readCollection, writeCollection } from "../config/database.js";
import { normalizeText, toIsoDate } from "../utils/formatter.js";

const collection = "services";

export const SystemModel = {
  all: () => readCollection(collection),
  async findById(id) {
    return (await this.all()).find((item) => item.id === id) || null;
  },
  async create(payload) {
    const items = await this.all();
    const timestamp = toIsoDate();
    const item = normalize(payload, { id: randomUUID(), createdAt: timestamp, updatedAt: timestamp });
    items.unshift(item);
    await writeCollection(collection, items);
    return item;
  },
  async update(id, payload) {
    const items = await this.all();
    const index = items.findIndex((item) => item.id === id);
    if (index < 0) return null;
    items[index] = normalize(payload, { ...items[index], updatedAt: toIsoDate() });
    await writeCollection(collection, items);
    return items[index];
  },
  async remove(id) {
    const items = await this.all();
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length === items.length) return false;
    await writeCollection(collection, filtered);
    return true;
  },
};

function normalize(payload, base = {}) {
  return {
    ...base,
    title: normalizeText(payload.title ?? base.title),
    category: normalizeText(payload.category ?? base.category ?? "University"),
    description: normalizeText(payload.description ?? base.description),
    url: normalizeText(payload.url ?? base.url ?? "#"),
    status: payload.status === "inactive" ? "inactive" : "active",
    color: normalizeText(payload.color ?? base.color ?? "violet"),
  };
}
