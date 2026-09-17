import { Router } from "express";
import { CategoryGroupController } from "../controllers/CategoryGroupController.js";

const router = Router();
router.get("/", CategoryGroupController.index);
router.get("/:id", CategoryGroupController.show);

export default router;
