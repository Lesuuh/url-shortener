import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";

const backendTarget = process.env.VITE_BACKEND_TARGET || "http://localhost:5000";

/**
 * Replaces __SITE_URL__ / __OG_IMAGE__ placeholders in static HTML at build
 * time. Defaults to the canonical brand domain (knot.to) unless overridden
 * with VITE_SITE_URL.
 */
function injectSiteEnv(): Plugin {
  const site = (process.env.VITE_SITE_URL || "https://knot.to").replace(/\/+$/, "");
  return {
    name: "knot-inject-site-env",
    transformIndexHtml(html) {
      return html
        .replaceAll("__SITE_URL__", site)
        .replaceAll("__OG_IMAGE__", `${site}/og.png`);
    },
  };
}

/**
 * In dev, Vite's history fallback serves index.html (the marketing page) for
 * every unknown path, so /app/* SPA routes never mount app.html. Rewrites any
 * /app request to app.html so the React Router app boots. The built app doesn't
 * need this — backend/src/app.ts handles /app/* itself.
 */
function serveAppShell(): Plugin {
  return {
    name: "knot-serve-app-shell",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url && req.url.startsWith("/app")) {
          req.url = "/app.html";
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), injectSiteEnv(), serveAppShell()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      "/api": {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL("./index.html", import.meta.url)),
        features: fileURLToPath(new URL("./features.html", import.meta.url)),
        app: fileURLToPath(new URL("./app.html", import.meta.url)),
      },
    },
  },
});
