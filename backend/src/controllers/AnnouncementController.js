import { AnnouncementService } from "../services/AnnouncementService.js";

const actorId = (request) => /^\d+$/.test(String(request.user?.sub)) ? Number(request.user.sub) : null;
const actor = (request) => request.user?.email || request.user?.name || "administrator";

export const AnnouncementController = {
  async index(request, response) { response.json(await AnnouncementService.list({ includeDeleted: request.query.includeDeleted === "true" })); },
  async show(request, response) { const item = await AnnouncementService.get(request.params.id); item ? response.json(item) : response.status(404).json({ message: "Announcement not found." }); },
  async store(request, response) { response.status(201).json(await AnnouncementService.create(request.body, actor(request), actorId(request))); },
  async update(request, response) { const item = await AnnouncementService.update(request.params.id, request.body, actor(request), actorId(request)); item ? response.json(item) : response.status(404).json({ message: "Announcement not found." }); },
  async destroy(request, response) { (await AnnouncementService.remove(request.params.id, actor(request), actorId(request))) ? response.status(204).end() : response.status(404).json({ message: "Announcement not found." }); },
  async restore(request, response) { const item = await AnnouncementService.restore(request.params.id, actor(request), actorId(request)); item ? response.json(item) : response.status(404).json({ message: "Deleted announcement not found." }); },
};
