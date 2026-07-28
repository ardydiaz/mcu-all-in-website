import { Router } from "express";
import { RoleController } from "../controllers/RoleController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
const router = Router();
router.get("/", authMiddleware, adminOnly, RoleController.index);
export default router;
