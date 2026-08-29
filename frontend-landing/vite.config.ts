import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";

const backendTarget = process.env.VITE_BACKEND_TARGET || "http://localhost:5000";

/** Shared design tokens + pure utils, consumed as source. */
const sharedSrc = fileURLToPath(
  new URL("../packages/shared/src", import.meta.url),
);

/**
 * Replaces __SITE_URL__ / __OG_IMAGE__ placeholders in the static HTML heads.
 * Defaults to the canonical brand domain (knot.to) unless overridden with
 * VITE_SITE_URL. The app URL is resolved by React via src/config.ts instead.
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

export default defineConfig({
    plugins: [react(), tailwindcss(), injectSiteEnv()],
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
  });