import { SystemService } from "../services/SystemService.js";

export const SystemController = {
  async index(request, response) { response.json(await SystemService.list({ includeDeleted: request.query.includeDeleted === "true" })); },
  async publicIndex(_request, response) {
    const systems = await SystemService.list();
    response.json(systems.filter((item) => item.status === "active"));
  },
  async show(request, response) {
    const item = await SystemService.get(request.params.id);
    item ? response.json(item) : response.status(404).json({ message: "System not found." });
  },
  async store(request, response) { response.status(201).json(await SystemService.create(request.body, request.user.username)); },
  async update(request, response) {
    const item = await SystemService.update(request.params.id, request.body, request.user.username);
    item ? response.json(item) : response.status(404).json({ message: "System not found." });
  },
  async status(request, response) {
    const current = await SystemService.get(request.params.id);
    if (!current) return response.status(404).json({ message: "System not found." });
    response.json(await SystemService.update(request.params.id, { ...current, status: request.body.status }, request.user.username));
  },
  async destroy(request, response) {
    (await SystemService.remove(request.params.id, request.user.username))
      ? response.status(204).end()
      : response.status(404).json({ message: "System not found." });
  },
  async restore(request, response) {
    const item = await SystemService.restore(request.params.id, request.user.username || request.user.email);
    item ? response.json(item) : response.status(404).json({ message: "Deleted system not found." });
  },
};
