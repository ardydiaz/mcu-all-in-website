import { CategoryGroupModel } from "../models/CategoryGroupModel.js";

export const CategoryGroupController = {
  async index(request, response) {
    const groups = await CategoryGroupModel.allWithTabs();
    response.json(groups);
  },

  async show(request, response) {
    const group = await CategoryGroupModel.withTabs(request.params.id);
    group ? response.json(group) : response.status(404).json({ message: "Group not found." });
  },
};
