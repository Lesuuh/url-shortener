import type { RequestHandler } from "express";
import cors from "cors";

/**
 * CORS for the deployed multi-origin setup:
 *   - landing  https://knot-links.vercel.app
 *   - app      https://knot-links-app.vercel.app
 * The Render backend is a separate origin, so both frontends perform
 * cross-origin API calls that carry httpOnly auth cookies — hence
 * credentials:true and exact (non-wildcard) origins.
 *
 * Override the allowed origins with CORS_ORIGINS (comma-separated).
 * Same-origin requests (no Origin header) are always allowed.
 */
const defaultOrigins = [
  "https://knot-links.vercel.app",
  "https://knot-links-app.vercel.app",
];

function resolveOrigins(): string[] {
  const fromEnv = process.env.CORS_ORIGINS;
  if (fromEnv) {
    return fromEnv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return defaultOrigins;
}

const ALLOWED_ORIGINS = resolveOrigins();

export const corsMiddleware: RequestHandler = cors({
  origin(origin, callback) {
    // Allow non-browser / same-origin requests (e.g. curl, server-to-server).
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
