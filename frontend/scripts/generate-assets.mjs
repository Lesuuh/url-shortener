/**
 * Generates static brand assets (og.png, apple-touch-icon.png) into public/.
 *
 *   node scripts/generate-assets.mjs
 *
 * Renders deterministic HTML via headless Chrome and screenshots it.
 */
import { readFileSync, mkdirSync, copyFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");

/* Keep the self-hosted fonts in sync with the fontsource packages. */
const FONTS = [
  ["@fontsource-variable/inter/files/inter-latin-wght-normal.woff2", "inter-latin-wght-normal.woff2"],
  ["@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2", "space-grotesk-latin-wght-normal.woff2"],
];
mkdirSync(path.join(PUBLIC, "fonts"), { recursive: true });
for (const [from, to] of FONTS) {
  copyFileSync(path.join(ROOT, "node_modules", from), path.join(PUBLIC, "fonts", to));
  console.log(`copied font ${to}`);
}

const inter = readFileSync(
  path.join(PUBLIC, "fonts/inter-latin-wght-normal.woff2"),
).toString("base64");
const grotesk = readFileSync(
  path.join(PUBLIC, "fonts/space-grotesk-latin-wght-normal.woff2"),
).toString("base64");

const fonts = `
@font-face {
  font-family: "Inter";
  font-style: normal;
  font-weight: 100 900;
  src: url(data:font/woff2;base64,${inter}) format("woff2-variations");
}
@font-face {
  font-family: "Grotesk";
  font-style: normal;
  font-weight: 300 700;
  src: url(data:font/woff2;base64,${grotesk}) format("woff2-variations");
}
`;

const KNOT = `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 14.5 8 16a3 3 0 1 1-4.24-4.24L7 8.5a3 3 0 0 1 4.24 0"/><path d="M14.5 9.5 16 8a3 3 0 1 1 4.24 4.24L17 15.5a3 3 0 0 1-4.24 0"/></svg>`;

async function screenshot(browser, { html, width, height, dsf = 1, path: out }) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: dsf });
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8">${fonts}</head><body>${html}</body></html>`, {
    waitUntil: "networkidle0",
  });
  await page.screenshot({ path: out, type: "png" });
  await page.close();
  console.log(`wrote ${out}`);
}

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

/* ---- og.png 1200x630 ---- */
await screenshot(browser, {
  width: 1200,
  height: 630,
  path: path.join(PUBLIC, "og.png"),
  html: `
  <style>
    * { margin: 0; box-sizing: border-box; }
    body { width: 1200px; height: 630px; background: #f7f7f8; font-family: Inter, sans-serif; overflow: hidden; }
    .wrap { position: relative; width: 100%; height: 100%; padding: 84px 88px; }
    .dots {
      position: absolute; inset: 0;
      background-image: radial-gradient(#d3d3da 1.2px, transparent 1.2px);
      background-size: 22px 22px;
      -webkit-mask-image: radial-gradient(ellipse 55% 45% at 70% 30%, #000 30%, transparent 75%);
      mask-image: radial-gradient(ellipse 55% 45% at 70% 30%, #000 30%, transparent 75%);
    }
    .mark { width: 108px; height: 108px; border-radius: 28px; background: #0e7a5b; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 32px rgb(14 122 91 / 0.25); }
    .wordmark { font-family: Grotesk, sans-serif; font-weight: 700; font-size: 88px; letter-spacing: -0.03em; color: #17171b; }
    .brand { display: flex; align-items: center; gap: 28px; }
    .tagline { margin-top: 30px; font-size: 30px; font-weight: 450; color: #45454d; }
    .domain { margin-top: 26px; font-family: ui-monospace, Menlo, monospace; font-size: 22px; color: #71717a; }
    .card { position: absolute; right: 88px; top: 126px; width: 380px; background: #fff; border: 1px solid #e4e4e9; border-radius: 22px; padding: 30px 30px 26px; box-shadow: 0 20px 60px rgb(23 23 27 / 0.10); }
    .card-label { font-size: 15px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #71717a; }
    .card-short { margin-top: 14px; font-family: ui-monospace, Menlo, monospace; font-size: 42px; font-weight: 600; color: #0a5f47; }
    .card-row { margin-top: 20px; display: flex; align-items: center; gap: 12px; }
    .card-pill { background: #e6f2ec; color: #0a5f47; font-size: 16px; font-weight: 600; border-radius: 999px; padding: 7px 14px; }
    .card-mute { font-size: 15px; color: #71717a; }
    .hair { position: absolute; left: 88px; right: 88px; bottom: 40px; height: 1px; background: #e4e4e9; }
  </style>
  <div class="wrap">
    <div class="dots"></div>
    <div class="brand">
      <div class="mark">${KNOT}</div>
      <div class="wordmark">knot</div>
    </div>
    <p class="tagline">Short links that hold.</p>
    <p class="domain">https://knot.to</p>
    <div class="card">
      <p class="card-label">Short link</p>
      <p class="card-short">knot.to/abcd12</p>
      <div class="card-row">
        <span class="card-pill">302 → fast</span>
        <span class="card-mute">expires in 30 days</span>
      </div>
    </div>
    <div class="hair"></div>
  </div>`,
});

/* ---- apple-touch-icon.png 180x180 ---- */
await screenshot(browser, {
  width: 180,
  height: 180,
  dsf: 2,
  path: path.join(PUBLIC, "apple-touch-icon.png"),
  html: `
  <style>
    * { margin: 0; box-sizing: border-box; }
    body { width: 180px; height: 180px; overflow: hidden; }
    .tile { width: 180px; height: 180px; background: #0e7a5b; display: flex; align-items: center; justify-content: center; }
    svg { width: 84px; height: 84px; }
  </style>
  <div class="tile">${KNOT.replace('width="64" height="64"', "")}</div>`,
});

await browser.close();
