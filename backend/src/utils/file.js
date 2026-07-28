import { mkdir } from "node:fs/promises";

export async function ensureDirectory(directory) {
  await mkdir(directory, { recursive: true });
  return directory;
}
