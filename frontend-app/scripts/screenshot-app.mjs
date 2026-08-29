/**
 * Captures product screenshots (app light/dark + marketing pages) into public/screens/.
 * Requires the integrated stack running on :5000 with SERVE_FRONTEND=true
 * (backend serving the built frontend).
 *
 *   node scripts/screenshot-app.mjs
 */
import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const BASE = "http://localhost:5000";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCREENS = path.join(ROOT, "public", "screens");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (msg) => console.log(msg);

async function api(pathname, { method = "GET", body, cookie } = {}) {
  const res = await fetch(`${BASE}${pathname}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { res, data: await res.json() };
}

async function registerUser() {
  const email = `shot-${Date.now()}@example.com`;
  const { res, data } = await api("/api/auth/register", {
    method: "POST",
    body: { name: "Demo User", email, password: "password123" },
  });
  if (res.status !== 201) throw new Error(`register failed: ${JSON.stringify(data)}`);
  const setCookie = res.headers.get("set-cookie") ?? "";
  const token = /token=([^;]+)/.exec(setCookie)?.[1];
  if (!token) throw new Error("no token cookie");
  return { user: data.user, cookie: `token=${token}` };
}

async function seedLinks(cookie) {
  const suffix = Date.now().toString(36).slice(-3);
  const links = [
    { url: "https://stripe.com/docs/payments?ref=newsletter", custom_alias: `pay-${suffix}` },
    { url: "https://vercel.com/blog", custom_alias: `blog-${suffix}` },
    { url: "https://github.com/anomalyco/opencode", custom_alias: `dev-${suffix}` },
  ];
  for (const body of links) {
    const { res } = await api("/api/links/", { method: "POST", body, cookie });
    if (res.status !== 201) throw new Error(`link create failed for ${body.url}`);
  }
}

async function setSession(page, { user, cookie, theme }) {
  await page.goto(`${BASE}/app`, { waitUntil: "networkidle0" });
  await page.evaluate((u) => localStorage.setItem("shrt.user", JSON.stringify(u)), user);
  await page.evaluate((t) => localStorage.setItem("shrt.theme", t), theme);
  const cdp = await page.createCDPSession();
  await cdp.send("Network.enable");
  await cdp.send("Network.setCookie", {
    name: "token",
    value: cookie.split("=")[1],
    domain: "localhost",
    path: "/",
    httpOnly: true,
    sameSite: "Strict",
  });
  await page.reload({ waitUntil: "networkidle0" });
}

async function capture(page, file, waitFor) {
  await page.waitForSelector(waitFor, { timeout: 15000 });
  await sleep(900);
  await page.screenshot({ path: path.join(SCREENS, file), type: "png" });
  log(`wrote ${file}`);
}

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

try {
  readdirSync(SCREENS, { recursive: true });

  const { user, cookie } = await registerUser();
  await seedLinks(cookie);

  const app = await browser.newPage();
  await app.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await setSession(app, { user, cookie, theme: "light" });
  await capture(app, "app-light.png", "main table tbody tr");
  await app.evaluate(() => localStorage.setItem("shrt.theme", "dark"));
  await app.reload({ waitUntil: "networkidle0" });
  await capture(app, "app-dark.png", "main table tbody tr");
  await app.close();

  for (const [file, urlPath, theme] of [
    ["home-light.png", "/", "light"],
    ["home-dark.png", "/", "dark"],
    ["features-light.png", "/features", "light"],
    ["features-dark.png", "/features", "dark"],
  ]) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 900, deviceScaleFactor: 2 });
    await page.goto(`${BASE}${urlPath}`, { waitUntil: "networkidle0" });
    await page.evaluate((t) => localStorage.setItem("shrt.theme", t), theme);
    await page.reload({ waitUntil: "networkidle0" });
    await page.waitForSelector("main h1, main h2", { timeout: 15000 });
    await sleep(600);
    await page.screenshot({ path: path.join(SCREENS, file), type: "png" });
    log(`wrote ${file}`);
    await page.close();
  }

  log("SCREENSHOTS DONE");
} finally {
  await browser.close();
}
