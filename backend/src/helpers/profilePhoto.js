import crypto from "node:crypto";
import path from "node:path";
import { projectRoot } from "../config/database.js";

const profilePhotoDirectory = path.join(projectRoot, "src", "uploads", "users");

export function microsoftPhotoPath(microsoftId) {
  const filename = crypto.createHash("sha256").update(String(microsoftId)).digest("hex");
  return path.join(profilePhotoDirectory, `${filename}.jpg`);
}

export { profilePhotoDirectory };
