import { isNonEmpty, isUrl } from "../utils/validator.js";
export const systemValidation = (body) => [
  ...(!isNonEmpty(body.title) ? ["Title is required."] : []),
  ...(!isNonEmpty(body.description) ? ["Description is required."] : []),
  ...(body.url && !isUrl(body.url) ? ["URL must start with http:// or https://."] : []),
];
