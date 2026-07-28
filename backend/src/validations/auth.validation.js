import { isNonEmpty } from "../utils/validator.js";
export const loginValidation = (body) => [
  ...(!isNonEmpty(body.username) ? ["Username is required."] : []),
  ...(!isNonEmpty(body.password) ? ["Password is required."] : []),
];
