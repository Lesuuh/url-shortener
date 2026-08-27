import puppeteer from "puppeteer-core";

const APP = process.env.APP_URL || "http://localhost:5000";
const EMAIL = `e2e-${Date.now()}@example.com`;
const PASSWORD = "password123";
const ALIAS = `alias${Date.now()}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (msg) => console.log(msg);

async function waitForText(page, selector, text, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const content = await page.$(selector);
    if (content) {
      const t = await page.evaluate((el) => el.textContent, content);
      if (t && t.includes(text)) return true;
    }
    await sleep(150);
  }
  throw new Error(`Timed out waiting for "${text}" in ${selector}`);
}

const click = (page, selector) =>
  page.$eval(selector, (el) => el.click()).catch((e) => {
    throw new Error(`click failed for ${selector}: ${e.message}`);
  });

const clickButtonByText = async (page, rootSelector, text) => {
  const ok = await page.evaluate(
    (rootSel, txt) => {
      const root = document.querySelector(rootSel);
      if (!root) return false;
      const btn = [...root.querySelectorAll("button")].find(
        (b) => b.textContent.trim() === txt,
      );
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    },
    rootSelector,
    text,
  );
  if (!ok) throw new Error(`No button with text "${text}" in ${rootSelector}`);
};

async function httpCheck(pathname) {
  const res = await fetch(APP + pathname, { redirect: "manual" });
  return {
    status: res.status,
    location: res.headers.get("location"),
    body: await res.text(),
  };
}

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--window-size=1440,1000"],
  defaultViewport: { width: 1440, height: 1000 },
});

const consoleErrors = [];

try {
  const page = await browser.newPage();
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    // Expected: the intentional unauthenticated shorten attempt returns 401
    // while the sign-in flow is still pending.
    if (/Failed to load resource.*401/.test(msg.text())) return;
    consoleErrors.push(`console: ${msg.text()}`);
  });
  page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message}`));

  const cdp = await page.createCDPSession();
  await cdp.send("Browser.grantPermissions", {
    origin: APP,
    permissions: ["clipboardReadWrite"],
  });

  /* ---------- Marketing site ---------- */
  await page.goto(APP, { waitUntil: "networkidle0" });
  log("PASS marketing home loads");
  await waitForText(page, "h1", "Short links");
  log("PASS marketing hero heading renders");
  if (!(await page.$('input[aria-label="Paste a long link"]'))) {
    throw new Error("Marketing hero demo input missing");
  }
  log("PASS marketing hero shortener client renders");

  await page.goto(APP + "/features", { waitUntil: "networkidle0" });
  await waitForText(page, "h1", "Proper job");
  log("PASS features page renders");

  for (const [pathname, needle] of [
    ["/robots.txt", "Disallow: /app"],
    ["/sitemap.xml", "knot.to"],
    ["/llms.txt", "Knot"],
  ]) {
    const { status, body } = await httpCheck(pathname);
    if (status !== 200 || !body.includes(needle)) {
      throw new Error(`${pathname} failed (${status})`);
    }
  }
  log("PASS robots.txt, sitemap.xml and llms.txt are real and correct");

  const health = await httpCheck("/api/links/health");
  if (health.status !== 200) throw new Error("health endpoint failed");
  log("PASS API health endpoint reachable");

  const notFound = await httpCheck("/404");
  if (notFound.status !== 404 || !notFound.body.includes("That link came loose")) {
    throw new Error(`/404 did not serve the branded page with 404 (${notFound.status})`);
  }
  log("PASS /404 is a real page served with 404 status");

  const deadCode = await httpCheck("/zz-no-such-code");
  if (deadCode.status !== 302 || !deadCode.location.includes("/404")) {
    throw new Error(
      `dead short link did not route to /404 (${deadCode.status} -> ${deadCode.location})`,
    );
  }
  log("PASS dead short links redirect to the 404 page");

  /* ---------- App requires sign-in ---------- */
  await page.goto(APP + "/app", { waitUntil: "networkidle0" });
  await waitForText(page, "main", "Sign in to Knot", 10000);
  log("PASS unauthenticated /app redirects to the sign-in page");

  /* ---------- Deep link → sign up → shorten ---------- */
  await page.goto(
    APP + "/app?url=" + encodeURIComponent("https://example.com/prefill"),
    { waitUntil: "networkidle0" },
  );
  await waitForText(page, "main", "Sign in to Knot", 10000);
  log("PASS marketing → app deep link lands on the sign-in page");

  const nameField = await page.$("#auth-name");
  if (!nameField) {
    await clickButtonByText(page, "main", "Create account");
    await sleep(200);
  }
  await page.type("#auth-name", "E2E Tester");
  await page.type("#auth-email", EMAIL);
  await page.type("#auth-password", PASSWORD);
  await click(page, 'main button[type="submit"]');
  await sleep(1800);

  await waitForText(page, "main", "Your links", 10000);
  const prefill = await page.$eval(
    'input[aria-label="URL to shorten"]',
    (el) => el.value,
  );
  if (prefill !== "https://example.com/prefill") {
    throw new Error(`deep-link prefill lost after sign-up: "${prefill}"`);
  }
  log("PASS sign-up returns to the app with the URL still pre-filled");

  await click(page, "main button[type=submit]");
  await waitForText(page, "main", "Your short link is ready", 15000);
  const shortLink = await page.$eval("main a.font-mono", (el) => el.textContent);
  if (!/localhost:5000\/[a-z0-9]+/i.test(shortLink)) {
    throw new Error("Unexpected short link: " + shortLink);
  }
  log(`PASS signed-in shorten creates: ${shortLink}`);

  const redirect = await httpCheck(new URL(shortLink).pathname);
  if (
    redirect.status !== 302 ||
    redirect.location !== "https://example.com/prefill"
  ) {
    throw new Error(
      `short link did not 302 to the original (${redirect.status} -> ${redirect.location})`,
    );
  }
  log("PASS short link resolves with a 302 to the original URL");

  await waitForText(page, "main", "Your links", 8000);
  log("PASS signed-in dashboard renders");

  await clickButtonByText(page, "main", "Copy");
  await sleep(600);
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  if (clip !== shortLink) throw new Error("Clipboard mismatch: " + clip);
  log("PASS clipboard contains the short link");

  const input2 = await page.$('input[aria-label="URL to shorten"]');
  await input2.type("not a url");
  await click(page, "main button[type=submit]");
  await waitForText(page, "main [role=alert]", "valid link", 8000);
  log("PASS invalid-URL validation error shown");

  const input3 = await page.$('input[aria-label="URL to shorten"]');
  await input3.click();
  await page.keyboard.down("Control");
  await page.keyboard.press("KeyA");
  await page.keyboard.up("Control");
  await page.keyboard.press("Backspace");
  await input3.type("https://www.stripe.com/");
  await clickButtonByText(page, "body", "Custom alias");
  await sleep(200);
  await page.type('input[aria-label="Custom alias"]', ALIAS);
  await click(page, "main button[type=submit]");
  await waitForText(page, "main a.font-mono", ALIAS, 15000);
  log("PASS custom alias short link created");

  await waitForText(page, "main", "stripe.com", 10000);
  log("PASS My links history lists the new link");

  const delSel = 'main table button[title="Delete link"]';
  const delBtnsBefore = (await page.$$(delSel)).length;
  if (delBtnsBefore === 0) throw new Error("Delete button missing");
  await page.$eval(delSel, (el) => el.click());
  await sleep(250);
  await click(page, 'button[aria-label="Confirm delete"]');
  await sleep(800);
  const delBtnsAfter = (await page.$$(delSel)).length;
  if (delBtnsAfter !== delBtnsBefore - 1) {
    throw new Error(
      `Expected ${delBtnsBefore - 1} delete buttons after delete, got ${delBtnsAfter}`,
    );
  }
  log("PASS delete link works");

  /* ---------- Sign out → back to the sign-in page ---------- */
  await click(page, 'button[aria-label^="Account menu"]');
  await sleep(200);
  await click(page, 'button[role="menuitem"]');
  await sleep(800);
  if (!page.url().includes("/app/login")) {
    throw new Error("Sign out did not land on the sign-in page: " + page.url());
  }
  await waitForText(page, "main", "Sign in to Knot", 8000);
  log("PASS sign out returns to the sign-in page");

  if (consoleErrors.length > 0) {
    throw new Error("Console errors detected:\n" + consoleErrors.join("\n"));
  }
  log("PASS no console errors during the entire session");

  log("E2E COMPLETE — all checks passed");
} finally {
  if (consoleErrors.length) {
    console.log("Console errors collected:\n" + consoleErrors.join("\n"));
  }
  await browser.close();
}
