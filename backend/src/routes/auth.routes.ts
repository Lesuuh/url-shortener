import { Router } from "express";
import {
  LoginController,
  LogoutController,
  meController,
  RegisterController,
} from "src/controllers/auth.controller";
import requireAuth from "src/middlewares/auth.middleware";

const router = Router();

router.post("/login", LoginController);
router.post("/register", RegisterController);
router.post("/logout", LogoutController);
router.get("/me", requireAuth, meController);

export default router;
