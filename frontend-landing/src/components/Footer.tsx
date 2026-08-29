import { Link, useLocation } from "react-router";
import type { ReactNode } from "react";
import { APP_URL } from "../config";
import { BrandMark } from "./BrandMark";

function FooterCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-wide text-ink-mute uppercase">
        {title}
      </p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function FooterLink({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) {
  return (
    <Link to={to} className="footer-link">
      {children}
    </Link>
  );
}

export function Footer() {
  const { pathname } = useLocation();
  const isFeatures = pathname === "/features";
  const to = (hash: string) => (isFeatures ? `/${hash}` : hash);

  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <BrandMark />
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-ink-mute">
            A fast, self-hosted URL shortener. Short links that hold — no ads,
            no tracking pixels, no bloat.
          </p>
        </div>

        <FooterCol title="Product">
          <FooterLink to={to("#how")}>How it works</FooterLink>
          <FooterLink to="/features">Features</FooterLink>
          <FooterLink to={to("#app")}>The app</FooterLink>
          <FooterLink to={APP_URL}>Open app</FooterLink>
        </FooterCol>

        <FooterCol title="Resources">
          <FooterLink to="/llms.txt">For AI agents — llms.txt</FooterLink>
          <FooterLink to="/sitemap.xml">Sitemap</FooterLink>
          <FooterLink to="/404">A friendly 404</FooterLink>
        </FooterCol>

        <FooterCol title="Status">
          <FooterLink to="/api/links/health">API health</FooterLink>
          <FooterLink to="/api">API root</FooterLink>
        </FooterCol>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs text-ink-mute sm:px-6">
          <p>© 2026 Knot. Short links that hold.</p>
          <p className="font-mono">Express · PostgreSQL · React</p>
        </div>
      </div>
    </footer>
  );
}