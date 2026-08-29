import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";

const backendTarget = process.env.VITE_BACKEND_TARGET || "http://localhost:5000";

/** Shared design tokens + pure utils, consumed as source. */
const sharedSrc = fileURLToPath(
  new URL("../packages/shared/src", import.meta.url),
);

/** Dep pre-bundle cache, pinned inside the hoisted root node_modules so Vite
    doesn't manufacture a per-workspace node_modules/.vite for this package. */
const cacheDir = fileURLToPath(
  new URL("../node_modules/.vite/app", import.meta.url),
);

/**
 * In dev, Vite's history fallback serves index.html (which doesn't exist in
 * this project) for unknown paths, so /app/* SPA routes never mount app.html.
 * Rewrites any /app request to app.html so React Router boots. The built app
 * doesn't need this — backend/src/app.ts handles /app/* itself.
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

export default defineConfig(({ command }) => ({
  cacheDir,
  // Built assets live under /app/ so the backend can serve the landing site
  // and the app independently; dev stays at / so the shell URL stays /app/*.
  base: command === "build" ? "/app/" : "/",
  plugins: [react(), tailwindcss(), serveAppShell()],
  resolve: {
    alias: {
      "@knot/shared": sharedSrc,
    },
  },
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
        app: fileURLToPath(new URL("./app.html", import.meta.url)),
      },
    },
  },
}));