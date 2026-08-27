import type { ReactNode } from "react";
import { useAuth } from "../context/auth";
import { useTheme } from "../theme";
import {
  HistoryIcon,
  LogOutIcon,
  LogoMark,
  MoonIcon,
  PlusIcon,
  SunIcon,
} from "./Icons";

interface AppShellProps {
  onNewLink: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  children: ReactNode;
}

export function AppShell({
  onNewLink,
  onSignIn,
  onSignOut,
  children,
}: AppShellProps) {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const initial = (user?.name?.[0] ?? user?.email[0] ?? "?").toUpperCase();

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface lg:flex">
        <div className="flex h-14 shrink-0 items-center border-b border-line px-4">
          <a href="/" className="mark" aria-label="Knot home">
            <span className="mark-mark">
              <LogoMark width={14} height={14} />
            </span>
            knot
          </a>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <button type="button" onClick={onNewLink} className="btn-ghost w-full justify-start">
            <PlusIcon width={14} height={14} />
            New link
          </button>
          <div className="pt-4">
            <p className="label px-2">Manage</p>
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("history")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="flex w-full cursor-pointer items-center gap-2 rounded-md bg-surface-2 px-2 py-1.5 text-[13px] font-semibold text-ink"
              aria-current="page"
            >
              <HistoryIcon width={14} height={14} className="text-ink-mute" />
              My links
            </button>
          </div>
        </nav>

        <div className="shrink-0 space-y-2 border-t border-line p-3">
          <div className="flex items-center justify-between rounded-md border border-line px-2.5 py-1.5">
            <span className="flex items-center gap-2 text-[13px] font-medium text-ink-soft">
              {theme === "dark" ? (
                <MoonIcon width={14} height={14} />
              ) : (
                <SunIcon width={14} height={14} />
              )}
              {theme === "dark" ? "Dark" : "Light"}
            </span>
            <button
              type="button"
              onClick={toggle}
              className="btn-quiet h-6"
              aria-label="Toggle color theme"
            >
              {theme === "dark" ? (
                <SunIcon width={13} height={13} />
              ) : (
                <MoonIcon width={13} height={13} />
              )}
            </button>
          </div>

          {user ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2 rounded-md border border-line px-2.5 py-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded bg-accent-soft text-[11px] font-bold text-accent-strong">
                  {initial}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                  {user.name ?? user.email}
                </span>
              </div>
              <button
                type="button"
                onClick={onSignOut}
                className="btn-quiet w-full justify-start"
                title="Sign out"
                aria-label={`Sign out ${user.email}`}
              >
                <LogOutIcon width={14} height={14} />
                Sign out
              </button>
            </div>
          ) : (
            <button type="button" onClick={onSignIn} className="btn-primary w-full">
              Sign in
            </button>
          )}
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-line bg-page/85 px-4 backdrop-blur-lg lg:hidden">
        <a href="/" className="mark" aria-label="Knot home">
          <span className="mark-mark h-6 w-6">
            <LogoMark width={13} height={13} />
          </span>
          knot
        </a>
        <div className="flex items-center gap-1">
          <button type="button" onClick={toggle} className="btn-quiet" aria-label="Toggle color theme">
            {theme === "dark" ? (
              <SunIcon width={15} height={15} />
            ) : (
              <MoonIcon width={15} height={15} />
            )}
          </button>
          {user ? (
            <button
              type="button"
              onClick={onSignOut}
              className="btn-quiet"
              title="Sign out"
              aria-label={`Sign out ${user.email}`}
            >
              <LogOutIcon width={15} height={15} />
            </button>
          ) : (
            <button type="button" onClick={onSignIn} className="btn-primary">
              Sign in
            </button>
          )}
        </div>
      </header>

      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-3xl px-4 pt-6 pb-16 sm:px-6 lg:pt-10">
          <div className="mb-6">
            <h1 className="text-xl font-bold tracking-tight">My links</h1>
            <p className="mt-0.5 text-[13px] text-ink-mute">
              Shorten, share, and manage your links.
            </p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
