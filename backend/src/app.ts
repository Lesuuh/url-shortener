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
import { redirectToOriginalUrlController } from "./controllers/link.controller.js";
import { corsMiddleware } from "./middlewares/cors.middleware.js";

const app = express();

app.use(corsMiddleware);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authLimit, authRoutes);
app.use("/api/links", globalRateLimit, linkRoutes);

app.get("/api", (req, res) => {
  res
    .type("text/plain")
    .send(
      [
        "Knot API",
        "",
        "GET    /api/links/health   health check",
        "POST   /api/auth/register  create an account",
        "POST   /api/auth/login     sign in (sets an httpOnly cookie)",
        "GET    /api/auth/me        get the authenticated user (auth)",
        "POST   /api/auth/logout    sign out",
        "POST   /api/links/         shorten a URL (auth)",
        "GET    /api/links/my-links your links (auth)",
        "DELETE /api/links/:id      delete one of your links (auth)",
      ].join("\n"),
    );
});

/* ---------- Frontend (monorepo: landing site + app) ----------
   The repo is an npm-workspace monorepo. Two frontends build independently:
     <repo>/frontend-landing/dist — marketing site, served at /
     <repo>/frontend-app/dist     — authenticated React app, served at /app/*
   Enable with SERVE_FRONTEND=true or NODE_ENV=production; silently skipped
   when either build output is absent (e.g. running only the API). */
const LANDING_DIST = path.resolve(import.meta.dirname, "../../frontend-landing/dist");
const APP_DIST = path.resolve(import.meta.dirname, "../../frontend-app/dist");
const HAS_FRONTEND =
  process.env.SERVE_FRONTEND === "true" ||
  (process.env.NODE_ENV === "production" &&
    fs.existsSync(LANDING_DIST) &&
    fs.existsSync(APP_DIST));
const FRONTEND_READY = HAS_FRONTEND && fs.existsSync(LANDING_DIST);

if (HAS_FRONTEND && !fs.existsSync(LANDING_DIST)) {
  console.warn(
    `[frontend] ${LANDING_DIST} not found — build it (npm run build:landing) before enabling SERVE_FRONTEND.`,
  );
}
if (HAS_FRONTEND && !fs.existsSync(APP_DIST)) {
  console.warn(
    `[frontend] ${APP_DIST} not found — build it (npm run build:app) before enabling SERVE_FRONTEND.`,
  );
}

// /404 must be explicit and BEFORE static so it always responds 404
app.get("/404", (req, res) => {
  if (!FRONTEND_READY) {
    return res.status(404).send("404 — page not found");
  }
  res.status(404).sendFile(path.join(LANDING_DIST, "404.html"));
});

if (FRONTEND_READY) {
  // Landing site first: hashed assets (immutable, cache aggressively), then
  // everything else — html pages, fonts, images, robots/sitemap/llms.txt.
  app.use(
    "/assets",
    express.static(path.join(LANDING_DIST, "assets"), {
      immutable: true,
      maxAge: "1y",
    }),
  );
  app.use(
    express.static(LANDING_DIST, {
      extensions: ["html"],
      index: "index.html",
    }),
  );

  // The app builds with base "/app/", so its hashed assets live under
  // /app/assets; the SPA shell then falls back to app.html for any sub-path.
  if (fs.existsSync(APP_DIST)) {
    app.use(
      "/app/assets",
      express.static(path.join(APP_DIST, "assets"), {
        immutable: true,
        maxAge: "1y",
      }),
    );
    // Serves the app's own public assets (/app/logo.png, /app/favicon.png,
    // /app/apple-touch-icon.png) and the shell for /app itself; SPA routes
    // without a file fall through to the splat route below.
    app.use("/app", express.static(APP_DIST, { index: "app.html" }));
    app.get("/app", (req, res) =>
      res.sendFile(path.join(APP_DIST, "app.html")),
    );
    app.get("/app/*splat", (req, res) =>
      res.sendFile(path.join(APP_DIST, "app.html")),
    );
  }
}

// Redirect for short codes — after static so files like /robots.txt win.
app.get("/:code", redirectToOriginalUrlController);

app.all("*path", (req, res) => {
  if (req.accepts("json") || req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Not Found" });
  }

  if (FRONTEND_READY) {
    return res.status(404).sendFile(path.join(LANDING_DIST, "404.html"));
  }

  return res.status(404).send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px;">
      <h1>404 - Link Not Found</h1>
      <p>The short link you are looking for doesn't exist.</p>
    </div>
  `);
});

export default app;
