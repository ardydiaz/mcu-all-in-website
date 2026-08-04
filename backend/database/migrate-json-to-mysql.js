import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectDatabase, query } from "../src/config/database.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slugify = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "item";

async function collection(name) {
  try { return JSON.parse(await readFile(path.join(root, "data", `${name}.json`), "utf8")); }
  catch (error) { if (error.code === "ENOENT") return []; throw error; }
}

await connectDatabase();
const [categories, systems, activities, announcements] = await Promise.all([
  collection("categories"), collection("services"), collection("activity-logs"), collection("announcements"),
]);

let categoryCount = 0;
for (const category of categories) {
  const name = String(category.name || "").trim();
  if (!name) continue;
  const existing = await query("SELECT id FROM categories WHERE name = ? LIMIT 1", [name]);
  if (!existing[0]) {
    await query("INSERT INTO categories (name, slug, status, deleted_at) VALUES (?, ?, ?, ?)", [name, slugify(name), category.deletedAt ? "inactive" : (category.status || "active"), category.deletedAt || null]);
    categoryCount += 1;
  }
}

let systemCount = 0;
for (const system of systems) {
  const title = String(system.title || system.name || "").trim();
  if (!title) continue;
  const exists = await query("SELECT id FROM systems WHERE name = ? LIMIT 1", [title]);
  if (exists[0]) continue;
  const category = await query("SELECT id FROM categories WHERE name = ? LIMIT 1", [system.category || "University"]);
  if (!category[0]) continue;
  await query("INSERT INTO systems (category_id, name, slug, description, url, color, status, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [category[0].id, title, `${slugify(title)}-${Date.now()}-${systemCount}`, system.description || null, system.url || "#", system.color || "violet", system.deletedAt ? "inactive" : (system.status || "active"), system.deletedAt || null]);
  systemCount += 1;
}

let activityCount = 0;
for (const activity of activities) {
  await query("INSERT INTO activity_logs (action, description, new_values) VALUES (?, ?, ?)", [activity.action || "legacy.import", String(activity.actor || "Legacy JSON import").slice(0, 500), JSON.stringify(activity.details || {})]);
  activityCount += 1;
}

let announcementCount = 0;
for (const announcement of announcements) {
  const title = String(announcement.title || "").trim();
  const content = String(announcement.content || "").trim();
  if (!title || !content) continue;
  const exists = await query("SELECT id FROM announcements WHERE title = ? LIMIT 1", [title]);
  if (exists[0]) continue;
  await query("INSERT INTO announcements (title, slug, content, status) VALUES (?, ?, ?, ?)", [title, `${slugify(title)}-${Date.now()}-${announcementCount}`, content, announcement.status || "draft"]);
  announcementCount += 1;
}

console.log(JSON.stringify({ imported: { categories: categoryCount, systems: systemCount, activityLogs: activityCount, announcements: announcementCount } }, null, 2));
process.exit(0);
