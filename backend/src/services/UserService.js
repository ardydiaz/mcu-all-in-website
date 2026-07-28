import { UserModel } from "../models/UserModel.js";
export const UserService = { list: () => UserModel.all() };
