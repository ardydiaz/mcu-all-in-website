export const normalizeText = (value) => String(value ?? "").trim();
export const toIsoDate = (value = new Date()) => new Date(value).toISOString();
