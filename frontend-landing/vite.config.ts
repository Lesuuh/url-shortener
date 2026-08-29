import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv, type Plugin } from "vite";

const backendTarget = process.env.VITE_BACKEND_TARGET || "http://localhost:5000";

/** Shared design tokens + pure utils, consumed as source. */
const sharedSrc = fileURLToPath(
  new URL("../packages/shared/src", import.meta.url),
);

/**
 * Replaces __SITE_URL__ / __OG_IMAGE__ / __APP_URL__ placeholders in static
 * HTML. Defaults to the canonical brand domain (knot.to) and the same-origin
 * /app unless overridden with VITE_SITE_URL / VITE_APP_URL.
 */
function injectSiteEnv(appUrl: string): Plugin {
  const site = (process.env.VITE_SITE_URL || "https://knot.to").replace(/\/+$/, "");
  return {
    name: "knot-inject-site-env",
    transformIndexHtml(html) {
      return html
        .replaceAll("__SITE_URL__", site)
        .replaceAll("__OG_IMAGE__", `${site}/og.png`)
        .replaceAll("__APP_URL__", appUrl);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const appUrl = (env.VITE_APP_URL || "/app").replace(/\/+$/, "");

  return {
    plugins: [react(), tailwindcss(), injectSiteEnv(appUrl)],
    resolve: {
      alias: {
        "@knot/shared": sharedSrc,
      },
    },
    server: {
      port: 5174,
      proxy: {
        "/api": {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 4174,
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
        },
      },
    },
  };
});