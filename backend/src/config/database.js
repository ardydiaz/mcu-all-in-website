import { readFile, writeFile, mkdir } from "node:fs/promises";
import mysql from "mysql2/promise";
import path from "node:path";
import { fileURLToPath } from "node:url";

const srcDirectory = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(srcDirectory, "../..");
export const dataDirectory = path.join(projectRoot, "data");
let pool;

export function getDatabase() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "127.0.0.1",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "root",
      database: process.env.DB_NAME || "mcu_all_in_one",
      waitForConnections: true,
      connectionLimit: 10,
      timezone: "Z",
    });
  }
  return pool;
}

export async function query(sql, parameters = []) {
  const [rows] = await getDatabase().execute(sql, parameters);
  return rows;
}

export async function readCollection(name, fallback = []) {
  try {
    return JSON.parse(await readFile(path.join(dataDirectory, `${name}.json`), "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await writeCollection(name, fallback);
    return fallback;
  }
}

export async function writeCollection(name, value) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(path.join(dataDirectory, `${name}.json`), `${JSON.stringify(value, null, 2)}\n`, "utf8");
  return value;
}

export async function connectDatabase() {
  await mkdir(dataDirectory, { recursive: true });
  if (process.env.DB_ENABLED === "true") {
    await query("SELECT 1");
    return { driver: "mysql", database: process.env.DB_NAME || "mcu_all_in_one" };
  }
  return { driver: "json+mysql-ready", location: dataDirectory };
}
