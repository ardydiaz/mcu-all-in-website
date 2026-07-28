import { loadEnvFile } from "node:process";

export function loadEnvironment() {
  try {
    loadEnvFile();
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
