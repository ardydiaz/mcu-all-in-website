import { isNonEmpty, isUrl } from "../utils/validator.js";
const categoriesOf = (body) => (Array.isArray(body.categories) ? body.categories : body.category ? [body.category] : []).filter(Boolean);
export const systemValidation = (body) => [
  ...(!isNonEmpty(body.title) ? [{ field: "title", message: "Service name is required." }] : []),
  ...(!categoriesOf(body).length ? [{ field: "categories", message: "Select at least one category." }] : []),
  ...(!isNonEmpty(body.description) ? [{ field: "description", message: "Description is required." }] : []),
  ...(!isNonEmpty(body.url) ? [{ field: "url", message: "Website URL is required." }] : []),
  ...(isNonEmpty(body.url) && !isUrl(body.url) ? [{ field: "url", message: "URL must start with http:// or https://." }] : []),
];
