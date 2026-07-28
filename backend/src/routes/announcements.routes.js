import { Router } from "express";
import { AnnouncementController } from "../controllers/AnnouncementController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
const router = Router();
router.get("/", authMiddleware, adminOnly, AnnouncementController.index);
export default router;
