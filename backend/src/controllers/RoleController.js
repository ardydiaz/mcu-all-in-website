import { RoleModel } from "../models/RoleModel.js";
export const RoleController = { async index(_request, response) { response.json(await RoleModel.all()); } };
