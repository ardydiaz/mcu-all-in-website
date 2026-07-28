import { randomUUID } from "node:crypto";
import { readCollection, writeCollection } from "../config/database.js";

export const ActivityLogModel = {
  all: () => readCollection("activity-logs", []),
  async record(action, actor = "system", details = {}) {
    const logs = await this.all();
    const entry = { id: randomUUID(), action, actor, details, createdAt: new Date().toISOString() };
    logs.unshift(entry);
    await writeCollection("activity-logs", logs.slice(0, 500));
    return entry;
  },
};
