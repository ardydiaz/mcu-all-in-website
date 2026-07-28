import { CategoryService } from "../services/CategoryService.js";
export const CategoryController = {
  async index(_request, response) { response.json(await CategoryService.list()); },
  async store(request, response) { response.status(201).json(await CategoryService.create(request.body)); },
};
