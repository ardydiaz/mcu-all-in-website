import { isNonEmpty } from "../utils/validator.js";
export const categoryValidation = (body) => !isNonEmpty(body.name) ? ["Category name is required."] : [];
