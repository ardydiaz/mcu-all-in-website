import { RecentServiceService } from "../services/RecentServiceService.js";

export const RecentServiceController = {
  async index(request, response) {
    response.json(await RecentServiceService.recentForUser(request.user.sub));
  },

  async store(request, response) {
    const systemId = Number.parseInt(request.params.systemId, 10);
    if (!Number.isSafeInteger(systemId) || systemId < 1) {
      return response.status(422).json({ message: "A valid system ID is required." });
    }
    const visit = await RecentServiceService.recordVisit(request.user.sub, systemId, {
      referrer: request.get("referer"),
      userAgent: request.get("user-agent"),
    });
    return visit
      ? response.status(201).json(visit)
      : response.status(404).json({ message: "Active system not found." });
  },
};
