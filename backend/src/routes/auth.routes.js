import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { loginValidation } from "../validations/auth.validation.js";

const router = Router();
router.get("/auth/microsoft", AuthController.microsoftRedirect);
router.get("/auth/microsoft/callback", AuthController.microsoftCallback);
router.post("/login", validate(loginValidation), AuthController.localLogin);
router.post("/logout", AuthController.logout);
router.get("/me", authMiddleware, AuthController.me);
export default router;
