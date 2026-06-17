import { Router } from "express";
import {
  createLinkController,
  deleteLinkController,
  getUserLinksController,
  redirectToOriginalUrlController,
} from "src/controllers/link.controller";
import requireAuth from "src/middlewares/auth.middleware";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Links are working" });
});

// create short link or url
router.post("/", requireAuth, createLinkController);

// redirect to original url
router.get("/r/:code", requireAuth, redirectToOriginalUrlController);

// delete link
router.post("/delete", requireAuth, deleteLinkController);

router.get("/user/:user_id", requireAuth, getUserLinksController);

export default router;
