import { randomUUID } from "node:crypto";
import { isDatabaseEnabled, query, readCollection, writeCollection } from "../config/database.js";

function detailsFrom(value) {
  if (!value) return {};
  if (typeof value === "object") return value;
  try { return JSON.parse(value); } catch { return {}; }
}

export const ActivityLogModel = {
  async all() {
    if (!isDatabaseEnabled()) return readCollection("activity-logs", []);
    const rows = await query("SELECT id, action, description, new_values AS details, created_at AS createdAt FROM activity_logs ORDER BY created_at DESC LIMIT 500");
    return rows.map((row) => ({ ...row, actor: row.description || "System", details: detailsFrom(row.details) }));
  },
  async record(action, actor = "system", details = {}) {
    if (!isDatabaseEnabled()) {
      const logs = await this.all(); const entry = { id: randomUUID(), action, actor, details, createdAt: new Date().toISOString() };
      logs.unshift(entry); await writeCollection("activity-logs", logs.slice(0, 500)); return entry;
    }
    const result = await query("INSERT INTO activity_logs (action, description, new_values) VALUES (?, ?, ?)", [action, String(actor).slice(0, 500), JSON.stringify(details)]);
    return { id: result.insertId, action, actor, details, createdAt: new Date().toISOString() };
  },
};
