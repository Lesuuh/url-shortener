import { useState } from "react";
import { Link, useLocation } from "react-router";
import { APP_URL } from "../config";
import { useTheme } from "../theme";
import { BrandMark } from "./BrandMark";
import { MenuIcon, MoonIcon, SunIcon } from "./icons";

const NAV = [
  { key: "how", label: "How it works", hash: "#how" },
  { key: "features", label: "Features", hash: "#features" },
  { key: "app", label: "The app", hash: "#app" },
];

export function Header() {
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();
  const isFeatures = pathname === "/features";
  const [menuOpen, setMenuOpen] = useState(false);

  const to = (hash: string) => (isFeatures ? `/${hash}` : hash);

  const dark = theme === "dark";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <BrandMark />

        <div className="hidden items-center gap-7 text-[13px] font-medium text-ink-soft md:flex">
          {NAV.map((item) => (
            <Link
              key={item.key}
              to={to(item.hash)}
              className={item.key === "features" && isFeatures
                ? "font-semibold text-ink"
                : "transition hover:text-ink"}
              aria-current={item.key === "features" && isFeatures ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            className="btn-quiet"
            aria-label={dark ? "Use light theme" : "Use dark theme"}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>

          {isFeatures && (
            <a href={`${APP_URL}/login`} className="btn-ghost hidden sm:inline-flex">
              Sign in
            </a>
          )}

          <Link to={APP_URL} className="btn-primary">
            Open app
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="btn-quiet md:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <MenuIcon />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-line bg-page px-4 py-3 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.key}
              to={to(item.hash)}
              onClick={() => setMenuOpen(false)}
              className={
                item.key === "features" && isFeatures
                  ? "block rounded-md px-2 py-2 text-sm font-medium text-ink hover:bg-surface-2"
                  : "block rounded-md px-2 py-2 text-sm font-medium text-ink-soft hover:bg-surface-2 hover:text-ink"
              }
            >
              {item.label}
            </Link>
          ))}
          <Link to={APP_URL} className="btn-primary mt-2 w-full">
            Open app
          </Link>
        </div>
      )}
    </header>
  );
}