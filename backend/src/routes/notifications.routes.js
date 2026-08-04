import { Router } from "express";
import { NotificationController } from "../controllers/NotificationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();
router.use(authMiddleware);
router.get("/", NotificationController.index);
router.post("/:id/read", NotificationController.markRead);
export default router;
