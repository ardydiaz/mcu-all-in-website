import crypto from "node:crypto";

export function hash(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

export function compare(value, digest) {
  return hash(value) === digest;
}
