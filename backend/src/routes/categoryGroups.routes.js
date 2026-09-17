import { Router } from "express";
import { CategoryGroupController } from "../controllers/CategoryGroupController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = Router();
router.get("/", CategoryGroupController.index);
router.get("/:id", CategoryGroupController.show);
router.post("/", authMiddleware, adminOnly, CategoryGroupController.store);
router.delete("/:id", authMiddleware, adminOnly, CategoryGroupController.destroy);

export default router;
