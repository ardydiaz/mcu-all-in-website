import { isNonEmpty } from "../utils/validator.js";
export const categoryValidation = (body) => !isNonEmpty(body.name)
  ? [{ field: "name", message: "Category name is required." }]
  : [];
