import { Router } from "express";
import {
  ChangePasswordController,
  DeleteAccountController,
  ForgotPasswordController,
  LoginController,
  LogoutAllController,
  LogoutController,
  meController,
  PasswordResetController,
  RegisterController,
  updateUserController,
} from "src/controllers/auth.controller";
import requireAuth from "src/middlewares/auth.middleware";

const router = Router();

router.post("/login", LoginController);
router.post("/register", RegisterController);
router.post("/logout", LogoutController);
router.get("/me", requireAuth, meController);

router.post("/logout-all", requireAuth, LogoutAllController);
router.patch("/change-password", requireAuth, ChangePasswordController);
router.patch("/me", requireAuth, updateUserController);
router.delete("/delete-account", requireAuth, DeleteAccountController);

router.post("/forgot-password", ForgotPasswordController);
router.post("/reset-password", PasswordResetController);

export default router;
