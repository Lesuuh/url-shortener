import { Router } from "express";
import {
  createLinkController,
  deleteLinkController,
  getUserLinksController,
  redirectToOriginalUrlController,
} from "src/controllers/link.controller";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Links are working" });
});

// create short link or url
router.post("/", createLinkController);

// redirect to original url
router.get("/r/:code", redirectToOriginalUrlController);

// delete link
router.post("/delete", deleteLinkController);

router.get("/user/:user_id", getUserLinksController);

export default router;
