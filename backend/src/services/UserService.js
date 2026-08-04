import { UserModel } from "../models/UserModel.js";
import { RoleModel } from "../models/RoleModel.js";

export const UserService = {
  list: () => UserModel.all(),
  async updateRole(userId, roleId) {
    const role = await RoleModel.findById(roleId);
    if (!role) {
      const error = new Error("The selected role does not exist.");
      error.status = 422;
      throw error;
    }
    const user = await UserModel.updateRole(userId, role);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }
    return user;
  },
};
