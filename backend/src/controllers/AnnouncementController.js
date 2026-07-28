import { AnnouncementService } from "../services/AnnouncementService.js";
export const AnnouncementController = { async index(_request, response) { response.json(await AnnouncementService.list()); } };
