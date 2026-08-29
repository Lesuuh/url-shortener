import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { NavLink } from "react-router";
import { useAuth } from "../context/auth";
import { useTheme } from "../theme";
import {
  ChevronDownIcon,
  GearIcon,
  HistoryIcon,
  LogoMark,
  LogOutIcon,
  MenuIcon,
  MoonIcon,
  PlusIcon,
  SunIcon,
  XIcon,
} from "./Icons";

interface AppShellProps {
  title?: string;
  onNewLink: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  children: ReactNode;
}

interface NavFooterProps {
  onSignIn: () => void;
  onSignOut: () => void;
}

function Mark() {
  return (
    <a href="/" className="mark" aria-label="Knot home">
      <span className="mark-mark">
        <LogoMark width={14} height={14} />
      </span>
      knot
    </a>
  );
}

function NavPrimary({
  onNewLink,
  onMyLinks,
}: {
  onNewLink: () => void;
  onMyLinks?: () => void;
}) {
  return (
    <>
      <button type="button" onClick={onNewLink} className="btn-primary w-full justify-start">
        <PlusIcon width={14} height={14} />
        New link
      </button>
      <div className="pt-5">
        <p className="label px-2">Manage</p>
        <NavLink
          to="/"
          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-semibold text-ink-soft transition hover:bg-surface-2 hover:text-ink"
        >
          {({ isActive }) => (
            <>
              <HistoryIcon width={14} height={14} className="opacity-80" />
              My links
              {isActive && <span className="sr-only">(current)</span>}
            </>
          )}
        </NavLink>
        <NavLink
          to="/settings"
          onClick={onMyLinks}
          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-semibold text-ink-soft transition hover:bg-surface-2 hover:text-ink"
        >
          {({ isActive }) => (
            <>
              <GearIcon width={14} height={14} className="opacity-80" />
              Settings
              {isActive && <span className="sr-only">(current)</span>}
            </>
          )}
        </NavLink>
      </div>
    </>
  );
}

function NavFooter({ onSignIn, onSignOut }: NavFooterProps) {
  const { user } = useAuth();
  if (user) {
    return (
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
    );
  }
  return (
    <button type="button" onClick={onSignIn} className="btn-primary w-full">
      Sign in
    </button>
  );
}

function AccountMenu({
  onSignIn,
  onSignOut,
}: {
  onSignIn: () => void;
  onSignOut: () => void;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) {
    return (
      <button type="button" onClick={onSignIn} className="btn-primary">
        Sign in
      </button>
    );
  }

  const initial = (user.name?.[0] ?? user.email[0] ?? "?").toUpperCase();

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${user.email}`}
        className="flex cursor-pointer items-center gap-2 rounded-md border border-line bg-surface py-1 pr-1.5 pl-1 transition hover:border-line-strong focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded bg-accent-soft text-[11px] font-bold text-accent-strong">
          {initial}
        </span>
        <span className="hidden max-w-[10rem] truncate text-[13px] font-medium sm:inline">
          {user.name ?? user.email}
        </span>
        <ChevronDownIcon
          width={14}
          height={14}
          className={`text-ink-mute transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="animate-pop absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-line bg-surface shadow-xl"
        >
          <div className="border-b border-line px-3.5 py-2.5">
            <p className="truncate text-[13px] font-semibold">{user.name ?? user.email}</p>
            <p className="truncate text-xs text-ink-mute">{user.email}</p>
          </div>
          <div className="space-y-1 p-1">
            <NavLink
              to="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-[13px] font-medium text-ink-soft transition hover:bg-surface-2 hover:text-ink"
            >
              <GearIcon width={14} height={14} />
              Settings
            </NavLink>
            <button
              type="button"
              role="menuitem"
              onClick={onSignOut}
              className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-[13px] font-medium text-ink-soft transition hover:bg-surface-hover hover:text-ink"
            >
              <LogOutIcon width={14} height={14} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AppShell({
  title = "My links",
  onNewLink,
  onSignIn,
  onSignOut,
  children,
}: AppShellProps) {
  const { theme, toggle } = useTheme();
  const [navOpen, setNavOpen] = useState(false);

  const closeNav = () => setNavOpen(false);

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar nav */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface lg:flex">
        <div className="flex h-14 shrink-0 items-center border-b border-line px-4">
          <Mark />
        </div>
        <nav className="flex-1 overflow-y-auto p-3 pt-4">
          <NavPrimary onNewLink={onNewLink} />
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
          <p className="px-1 text-[11px] text-ink-mute">
            Knot · self-hosted short links
          </p>
        </div>
      </aside>

      {/* Mobile drawer nav */}
      {navOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeNav}
            className="animate-fade absolute inset-0 cursor-default bg-overlay backdrop-blur-[2px]"
          />
          <div className="animate-rise absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-line bg-surface shadow-xl">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
              <Mark />
              <button
                type="button"
                onClick={closeNav}
                className="btn-quiet"
                aria-label="Close menu"
              >
                <XIcon width={16} height={16} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 pt-4">
              <NavPrimary
                onNewLink={() => {
                  closeNav();
                  onNewLink();
                }}
                onMyLinks={closeNav}
              />
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
              <NavFooter onSignIn={onSignIn} onSignOut={onSignOut} />
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col lg:pl-64">
        {/* App top bar */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-line bg-page/85 px-4 backdrop-blur-lg sm:px-6">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            className="btn-quiet -ml-2 lg:hidden"
            aria-label="Open menu"
            aria-expanded={navOpen}
          >
            <MenuIcon width={17} height={17} />
          </button>

          <div className="lg:hidden">
            <Mark />
          </div>
          <h1 className="hidden text-[15px] font-bold tracking-tight lg:block">
            {title}
          </h1>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onNewLink}
              className="btn-primary h-8 hidden items-center sm:inline-flex"
            >
              <PlusIcon width={14} height={14} />
              New link
            </button>
            <button
              type="button"
              onClick={onNewLink}
              className="btn-ghost size-8 p-0 sm:hidden"
              aria-label="Create a new link"
            >
              <PlusIcon width={15} height={15} />
            </button>
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
            <AccountMenu onSignIn={onSignIn} onSignOut={onSignOut} />
          </div>
        </header>

        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-16 sm:px-6 lg:pt-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}