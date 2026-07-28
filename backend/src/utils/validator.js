export const isNonEmpty = (value) => typeof value === "string" && value.trim().length > 0;
export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
export const isUrl = (value) => value === "#" || /^https?:\/\/\S+$/i.test(String(value));
