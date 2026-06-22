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

// 1. Create a link (Authenticated)
router.post("/", requireAuth, createLinkController);

// 2. Get all links belonging *only* to the currently logged-in user
router.get("/my-links", requireAuth, getUserLinksController);

// 3. Delete a specific link by its unique ID (Authenticated)
router.delete("/:link_id", requireAuth, deleteLinkController);

export default router;
