import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { loginValidation } from "../validations/auth.validation.js";
import { localLoginLimiter, microsoftLoginLimiter } from "../config/rateLimit.js";

const router = Router();
router.get("/auth/microsoft", microsoftLoginLimiter, AuthController.microsoftRedirect);
router.get("/auth/microsoft/callback", AuthController.microsoftCallback);
router.post("/login", localLoginLimiter, validate(loginValidation), AuthController.localLogin);
router.post("/logout", AuthController.logout);
router.get("/me", authMiddleware, AuthController.me);
router.get("/me/photo", authMiddleware, AuthController.profilePhoto);
export default router;
