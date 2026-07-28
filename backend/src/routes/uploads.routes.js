import { Router } from "express";
import { UploadController } from "../controllers/UploadController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
import { uploadMiddleware } from "../middleware/uploadMiddleware.js";
const router = Router();
router.post("/", authMiddleware, adminOnly, uploadMiddleware, UploadController.store);
export default router;
