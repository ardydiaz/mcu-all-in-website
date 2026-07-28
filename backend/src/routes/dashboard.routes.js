import { Router } from "express";
import { DashboardController } from "../controllers/DashboardController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
const router = Router();
router.get("/", authMiddleware, adminOnly, DashboardController.index);
export default router;
