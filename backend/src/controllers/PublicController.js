import { SystemService } from "../services/SystemService.js";
import { CategoryService } from "../services/CategoryService.js";
import { AnnouncementService } from "../services/AnnouncementService.js";

export const PublicController = {
  async systems(_request, response) {
    const systems = await SystemService.list();
    response.json(systems.filter((system) => system.status === "active"));
  },
  async categories(_request, response) {
    const categories = await CategoryService.list();
    response.json(categories.filter((category) => category.status === "active"));
  },
  async announcements(_request, response) {
    response.json(await AnnouncementService.publicList());
  },
};
