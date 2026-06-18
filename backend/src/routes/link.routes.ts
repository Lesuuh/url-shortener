import { Router } from "express";
import {
  createLinkController,
  deleteLinkController,
  getUserLinksController,
} from "src/controllers/link.controller"; // 🔑 Removed redirect controller
import requireAuth from "src/middlewares/auth.middleware";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Links are working" });
});

router.post("/", requireAuth, createLinkController);
router.post("/delete", requireAuth, deleteLinkController);
router.get("/user/:user_id", requireAuth, getUserLinksController);

export default router;
