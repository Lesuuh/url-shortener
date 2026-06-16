import { Router } from "express";
import {
  LoginController,
  LogoutController,
  RegisterController,
} from "src/controllers/auth.controller";

const router = Router();

router.post("/login", LoginController);
router.post("/register", RegisterController);
router.post("/logout", LogoutController);

export default Router();
