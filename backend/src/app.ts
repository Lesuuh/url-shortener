import path from "node:path";
import fs from "node:fs";
import express from "express";
import linkRoutes from "./routes/link.routes.js";
import cookieParser from "cookie-parser";
import {
  authLimit,
  globalRateLimit,
} from "./middlewares/rate.limit.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import { redirectToOriginalUrlController } from "./controllers/link.controller";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authLimit, authRoutes);
app.use("/api/links", globalRateLimit, linkRoutes);

app.get("/api", (req, res) => {
  res.type("text/plain").send(
    [
      "Knot API",
      "",
      "GET    /api/links/health   health check",
      "POST   /api/auth/register  create an account",
      "POST   /api/auth/login     sign in (sets an httpOnly cookie)",
      "POST   /api/auth/logout    sign out",
      "POST   /api/links/         shorten a URL (auth)",
      "GET    /api/links/my-links your links (auth)",
      "DELETE /api/links/:id      delete one of your links (auth)",
    ].join("\n"),
  );
});

/* ---------- Frontend (built marketing site + app) ----------
   Served from ../../frontend/dist relative to this file, which resolves to
   <repo>/frontend/dist in both source (src/) and compiled (dist/) layouts.
   Enable with SERVE_FRONTEND=true or NODE_ENV=production; silently skipped
   when the build output is absent (e.g. running only the API). */
const FRONTEND_DIST = path.resolve(import.meta.dirname, "../../frontend/dist");
const HAS_FRONTEND =
  process.env.SERVE_FRONTEND === "true" ||
  (process.env.NODE_ENV === "production" && fs.existsSync(FRONTEND_DIST));
const FRONTEND_READY = HAS_FRONTEND && fs.existsSync(FRONTEND_DIST);

if (!FRONTEND_READY && HAS_FRONTEND) {
  console.warn(
    `[frontend] ${FRONTEND_DIST} not found — build the frontend (cd frontend && npm run build) before enabling SERVE_FRONTEND.`,
  );
}

// /404 must be explicit and BEFORE static so it always responds 404
app.get("/404", (req, res) => {
  if (!FRONTEND_READY) {
    return res.status(404).send("404 — page not found");
  }
  res.status(404).sendFile(path.join(FRONTEND_DIST, "404.html"));
});

if (FRONTEND_READY) {
  // Hashed build assets are immutable and can be cached aggressively.
  app.use(
    "/assets",
    express.static(path.join(FRONTEND_DIST, "assets"), {
      immutable: true,
      maxAge: "1y",
    }),
  );

  // Everything else: html pages, fonts, images, robots/sitemap/llms.txt.
  app.use(
    express.static(FRONTEND_DIST, {
      extensions: ["html"],
      index: "index.html",
    }),
  );

  // The app is a client-side SPA under /app — any sub-path falls back to it.
  app.get("/app", (req, res) =>
    res.sendFile(path.join(FRONTEND_DIST, "app.html")),
  );
  app.get("/app/*splat", (req, res) =>
    res.sendFile(path.join(FRONTEND_DIST, "app.html")),
  );
}

// Redirect for short codes — after static so files like /robots.txt win.
app.get("/:code", redirectToOriginalUrlController);

app.all("*path", (req, res) => {
  if (req.accepts("json") || req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Not Found" });
  }

  if (FRONTEND_READY) {
    return res.status(404).sendFile(path.join(FRONTEND_DIST, "404.html"));
  }

  return res.status(404).send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px;">
      <h1>404 - Link Not Found</h1>
      <p>The short link you are looking for doesn't exist.</p>
    </div>
  `);
});

export default app;
