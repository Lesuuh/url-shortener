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
router.get("/r/:code", redirectToOriginalUrlController);

// delete link
router.post("/delete", requireAuth, deleteLinkController);

router.get("/user/:user_id", requireAuth, getUserLinksController);

// catch all route
router.all("*path", (req, res) => {
  if (req.accepts("json") || req.path.startsWith("/api/")) {
    return res.status(404).json({
      error: "Not Found",
      message: `The requested path '${req.originalUrl}' does not exist on this server.`,
    });
  }

  // Fallback for browsers clicking broken redirection short-links
  return res.status(404).send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px;">
      <h1>404 - Link Not Found</h1>
      <p>The short link or page you are looking for doesn't exist or has expired.</p>
      <a href="http://localhost:3000" style="color: #2563eb; text-decoration: none;">Go to Dashboard</a>
    </div>
  `);
});

export default router;
