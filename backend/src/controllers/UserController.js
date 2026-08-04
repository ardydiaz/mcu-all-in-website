import { UserService } from "../services/UserService.js";
export const UserController = { async index(_request, response) {
  const users = await UserService.list();
  response.json(users.map(({ passwordHash, ...user }) => user));
}, async updateRole(request, response) {
  const user = await UserService.updateRole(request.params.id, request.body.roleId);
  response.json(user);
} };
