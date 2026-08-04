import { CategoryService } from "../services/CategoryService.js";
export const CategoryController = {
  async index(request, response) { response.json(await CategoryService.list({ includeDeleted: request.query.includeDeleted === "true" })); },
  async store(request, response) { response.status(201).json(await CategoryService.create(request.body, request.user.username || request.user.email)); },
  async update(request, response) {
    const item = await CategoryService.update(request.params.id, request.body, request.user.username || request.user.email);
    item ? response.json(item) : response.status(404).json({ message: "Category not found." });
  },
  async destroy(request, response) {
    const item = await CategoryService.remove(request.params.id, request.user.username || request.user.email);
    item ? response.status(204).end() : response.status(404).json({ message: "Category not found." });
  },
  async restore(request, response) {
    const item = await CategoryService.restore(request.params.id, request.user.username || request.user.email);
    item ? response.json(item) : response.status(404).json({ message: "Deleted category not found." });
  },
};
