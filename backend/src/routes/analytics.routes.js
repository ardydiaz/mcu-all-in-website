import { Router } from "express";
import { AnalyticsController } from "../controllers/AnalyticsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
const router = Router();
router.get("/", authMiddleware, adminOnly, AnalyticsController.index);
export default router;
