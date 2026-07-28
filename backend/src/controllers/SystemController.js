import { SystemService } from "../services/SystemService.js";

export const SystemController = {
  async index(_request, response) { response.json(await SystemService.list()); },
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
};
