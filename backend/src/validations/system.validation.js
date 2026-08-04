import { isNonEmpty, isUrl } from "../utils/validator.js";
export const systemValidation = (body) => [
  ...(!isNonEmpty(body.title) ? [{ field: "title", message: "Service name is required." }] : []),
  ...(!isNonEmpty(body.description) ? [{ field: "description", message: "Description is required." }] : []),
  ...(!isNonEmpty(body.url) ? [{ field: "url", message: "Website URL is required." }] : []),
  ...(isNonEmpty(body.url) && !isUrl(body.url) ? [{ field: "url", message: "URL must start with http:// or https://." }] : []),
];
