/* App-level configuration, resolved from Vite env vars at build time. */

/** Base URL for API calls (proxied by Vite in dev, same-origin in prod). */
export const API_BASE: string = (
  import.meta.env.VITE_API_BASE || "/api"
).replace(/\/+$/, "");

/** Where the app lives — used by the app shell/bookmark links. */
export const APP_URL: string = (
  import.meta.env.VITE_APP_URL || "/"
).replace(/\/+$/, "");

/** The marketing/landing site origin — where the logo and "Back to site"
 *  links take users. Defaults to the landing deployment. */
export const SITE_URL: string = (
  import.meta.env.VITE_SITE_URL || "https://knot-links.vercel.app"
).replace(/\/+$/, "");

const shortBase =
  import.meta.env.VITE_SHORT_BASE ||
  (import.meta.env.DEV ? "http://localhost:5000" : window.location.origin);

/** Builds a full, clickable short URL from a code (or host/code). */
export function shortUrl(code: string): string {
  if (/^https?:\/\//i.test(code)) return code;
  const clean = code.replace(/^\/+/, "");
  return `${shortBase}/${clean}`;
}
