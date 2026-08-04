import { SystemModel } from "../models/SystemModel.js";
import { UserModel } from "../models/UserModel.js";
import { CategoryModel } from "../models/CategoryModel.js";
import { ActivityLogModel } from "../models/ActivityLogModel.js";

export const DashboardService = {
  async overview() {
    const [systems, users, categories, activity] = await Promise.all([
      SystemModel.all(), UserModel.all(), CategoryModel.all(), ActivityLogModel.all(),
    ]);
    return {
      metrics: {
        systems: systems.length,
        activeSystems: systems.filter((item) => item.status === "active").length,
        inactiveSystems: systems.filter((item) => item.status === "inactive").length,
        users: users.length,
        categories: categories.length,
        visits: 24800,
        visitChangePercent: 12.4,
      },
      recentActivity: activity.slice(0, 8),
    };
  },
};
