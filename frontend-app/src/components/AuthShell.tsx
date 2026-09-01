import type { ReactNode } from "react";
import { useTheme } from "../theme";
import { LogoImage, MoonIcon, SunIcon } from "./Icons";
import { SITE_URL } from "../config";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
}

/** Full-page, unauthenticated layout shared by Sign in, Forgot password and
 *  Reset password — branded header, centered card, and footer. */
export function AuthShell({ title, subtitle, footer, children }: AuthShellProps) {
  const { theme, toggle } = useTheme();

  return (
    <div className="flex min-h-dvh flex-col bg-page">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-page/80 px-4 backdrop-blur-lg sm:px-6">
        <a href={SITE_URL} className="mark" aria-label="Knot home">
          <LogoImage className="h-7 w-7" />
          knot
        </a>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            className="btn-quiet"
            aria-label="Toggle color theme"
          >
            {theme === "dark" ? (
              <SunIcon width={16} height={16} />
            ) : (
              <MoonIcon width={16} height={16} />
            )}
          </button>
          <a href={SITE_URL} className="btn-ghost">
            Back to site
          </a>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-[24rem] animate-rise">
          <div className="mb-6 text-center">
            <LogoImage className="mx-auto h-11 w-11" />
            <h1 className="display mt-4 text-2xl">{title}</h1>
            {subtitle ? <p className="mt-1.5 text-sm text-ink-mute">{subtitle}</p> : null}
          </div>

          <div className="card p-5 shadow-sm sm:p-6">{children}</div>

          {footer ? <div className="mt-4 text-center">{footer}</div> : null}
        </div>
      </main>

      <footer className="border-t border-line py-5 text-center text-xs text-ink-mute">
        Knot — short links that hold. Fast, self-hosted, private by default.
      </footer>
    </div>
  );
}