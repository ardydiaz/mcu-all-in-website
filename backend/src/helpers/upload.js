import path from "node:path";
import { randomUUID } from "node:crypto";

export function createUploadName(originalName = "file") {
  return `${randomUUID()}${path.extname(originalName).toLowerCase()}`;
}
