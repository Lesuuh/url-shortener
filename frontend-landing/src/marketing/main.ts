import "../marketing.css";
import { mountHeroDemo } from "./hero-demo";
import { initTheme, setupThemeToggle } from "./theme";

initTheme();

const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) setupThemeToggle(themeToggle);

const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    const hidden = mobileMenu.classList.toggle("hidden");
    menuToggle.setAttribute("aria-expanded", String(!hidden));
  });
}

const heroDemo = document.getElementById("hero-demo");
if (heroDemo) mountHeroDemo(heroDemo);

const copyButtons = document.querySelectorAll<HTMLElement>("[data-hero-copy]");
for (const btn of copyButtons) {
  btn.addEventListener("click", async () => {
    const text = btn.getAttribute("data-hero-copy") ?? "";
    const ok =
      navigator.clipboard && window.isSecureContext
        ? await navigator.clipboard.writeText(text)
        : false;
    if (!ok) return;
    const original = btn.textContent;
    btn.textContent = "Copied";
    window.setTimeout(() => {
      btn.textContent = original;
    }, 1600);
  });
}
