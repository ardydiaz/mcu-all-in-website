import { Router } from "express";
import { UserController } from "../controllers/UserController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
const router = Router();
router.get("/", authMiddleware, adminOnly, UserController.index);
export default router;
