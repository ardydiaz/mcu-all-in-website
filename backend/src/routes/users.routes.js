import { Router } from "express";
import { UserController } from "../controllers/UserController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminOnly, allowRoles } from "../middleware/roleMiddleware.js";
const router = Router();
router.get("/", authMiddleware, adminOnly, UserController.index);
router.patch("/:id/role", authMiddleware, allowRoles("super_admin"), UserController.updateRole);
export default router;
