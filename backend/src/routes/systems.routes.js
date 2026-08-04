import { Router } from "express";
import { SystemController } from "../controllers/SystemController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { systemValidation } from "../validations/system.validation.js";

const router = Router();
router.use(authMiddleware);
router.use(adminOnly);
router.get("/", SystemController.index);
router.post("/", validate(systemValidation), SystemController.store);
router.get("/:id", SystemController.show);
router.put("/:id", validate(systemValidation), SystemController.update);
router.patch("/:id/status", SystemController.status);
router.delete("/:id", SystemController.destroy);
router.patch("/:id/restore", SystemController.restore);
export default router;
