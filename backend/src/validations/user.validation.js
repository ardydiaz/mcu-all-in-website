import { isEmail, isNonEmpty } from "../utils/validator.js";
export const userValidation = (body) => [
  ...(!isNonEmpty(body.name) ? ["Name is required."] : []),
  ...(!isEmail(body.email) ? ["A valid email is required."] : []),
];
