import { NotificationService } from "../services/NotificationService.js";

function userId(request) {
  const id = Number(request.user?.sub);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export const NotificationController = {
  async index(request, response) {
    const id = userId(request);
    if (!id) return response.status(422).json({ message: "A database-backed user account is required." });
    response.json(await NotificationService.listForUser(id));
  },
  async markRead(request, response) {
    const id = userId(request);
    if (!id) return response.status(422).json({ message: "A database-backed user account is required." });
    const marked = await NotificationService.markRead(id, request.params.id);
    marked ? response.status(204).end() : response.status(404).json({ message: "Announcement not found." });
  },
};
