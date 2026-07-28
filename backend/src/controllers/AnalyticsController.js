import { AnalyticsService } from "../services/AnalyticsService.js";
export const AnalyticsController = { async index(_request, response) { response.json(await AnalyticsService.summary()); } };
