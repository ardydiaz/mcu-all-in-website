import { DashboardService } from "../services/DashboardService.js";
export const DashboardController = { async index(_request, response) { response.json(await DashboardService.overview()); } };
