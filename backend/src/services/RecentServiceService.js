import { SystemVisitModel } from "../models/SystemVisitModel.js";

export const RecentServiceService = {
  recentForUser: (userId) => SystemVisitModel.recentForUser(userId),
  recordVisit: (userId, systemId, metadata) => SystemVisitModel.record({ userId, systemId, ...metadata }),
};
