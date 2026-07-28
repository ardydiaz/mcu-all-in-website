import { SystemModel } from "../models/SystemModel.js";
export const AnalyticsService = {
  async summary() {
    const systems = await SystemModel.all();
    return { totalSystems: systems.length, activeSystems: systems.filter((item) => item.status === "active").length, visits: 24800, changePercent: 12.4 };
  },
};
