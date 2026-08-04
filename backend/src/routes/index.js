import { Router } from "express";
import authRoutes from "./auth.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import usersRoutes from "./users.routes.js";
import systemsRoutes from "./systems.routes.js";
import categoriesRoutes from "./categories.routes.js";
import announcementsRoutes from "./announcements.routes.js";
import rolesRoutes from "./roles.routes.js";
import analyticsRoutes from "./analytics.routes.js";
import uploadsRoutes from "./uploads.routes.js";
import publicRoutes from "./public.routes.js";

const router = Router();
router.get("/health", (_request, response) => response.json({
  status: "ok", application: "MCU All-in-One API", timestamp: new Date().toISOString(),
}));
router.use("/public", publicRoutes);
router.use(authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/users", usersRoutes);
router.use("/systems", systemsRoutes);
router.use("/services", systemsRoutes);
router.use("/categories", categoriesRoutes);
router.use("/announcements", announcementsRoutes);
router.use("/roles", rolesRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/uploads", uploadsRoutes);
export default router;
