import { useCallback, useEffect, useState } from "react";
import { AppShell } from "./components/AppShell";
import { AuthPage } from "./components/AuthPage";
import { LinkList } from "./components/LinkList";
import { Shortener } from "./components/Shortener";
import { ToastProvider, useToast } from "./components/Toast";
import { AuthProvider, useAuth } from "./context/auth";
import { api } from "./lib/api";
import type { User } from "./types";

const LOGIN_PATH = "/app/login";
const APP_PATH = "/app";

interface PendingShorten {
  url: string;
  alias: string;
}

function AppInner() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [route, setRoute] = useState(() => window.location.pathname);
  const [pendingShorten, setPendingShorten] = useState<PendingShorten | null>(
    null,
  );
  const [refreshSignal, setRefreshSignal] = useState(0);

  const navigate = useCallback((path: string) => {
    window.history.pushState(null, "", path);
    setRoute(window.location.pathname);
  }, []);

  useEffect(() => {
    const onPop = () => setRoute(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Auth gate: the app requires a signed-in user. Unauthenticated visitors on
  // any /app route are sent to /app/login, carrying the query string (e.g. a
  // URL the marketing hero demo wants to shorten) so the handoff survives.
  useEffect(() => {
    if (user && route === LOGIN_PATH) {
      navigate(APP_PATH);
    } else if (!user && route !== LOGIN_PATH) {
      window.history.replaceState(null, "", LOGIN_PATH + window.location.search);
      setRoute(LOGIN_PATH);
    }
  }, [route, user, navigate]);

  const handleAuthSuccess = useCallback(
    (authedUser: User) => {
      setUser(authedUser);
      toast(`Signed in as ${authedUser.name ?? authedUser.email}`);
      navigate(APP_PATH + window.location.search);
    },
    [setUser, toast, navigate],
  );

  const handleSignIn = useCallback(() => {
    navigate(LOGIN_PATH);
  }, [navigate]);

  const handleNeedAuth = useCallback(() => {
    setUser(null);
    navigate(LOGIN_PATH);
  }, [setUser, navigate]);

  const handleSignOut = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      /* session already invalid — still sign out locally */
    }
    setUser(null);
    setPendingShorten(null);
    toast("Signed out");
    navigate(LOGIN_PATH);
  }, [setUser, toast, navigate]);

  const handleCreated = useCallback(() => {
    setRefreshSignal((n) => n + 1);
  }, []);

  const handleNewLink = useCallback(() => {
    document.getElementById("shorten")?.scrollIntoView({ behavior: "smooth" });
    window.setTimeout(() => {
      document
        .querySelector<HTMLInputElement>('[aria-label="URL to shorten"]')
        ?.focus();
    }, 300);
  }, []);

  // Signed-out visitors see the sign-in / sign-up page.
  if (route === LOGIN_PATH) {
    return (
      <AuthPage
        initialMode="login"
        onSuccess={handleAuthSuccess}
      />
    );
  }

  // Waiting for the auth-gate redirect to land — keep a blank frame.
  if (!user) {
    return <div className="min-h-dvh bg-page" />;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <AppShell
        onNewLink={handleNewLink}
        onSignIn={handleSignIn}
        onSignOut={() => void handleSignOut()}
      >
        <div className="mb-7 animate-rise">
          <h1 className="text-2xl font-bold tracking-tight">
            {user ? `Hi, ${displayName(user)}` : "Short links that hold"}
          </h1>
          <p className="mt-1 text-sm text-ink-mute">
            {user
              ? "Your links live here — shorten, copy, and tidy them up."
              : "Sign in and every link you shorten is saved to your account."}
          </p>
        </div>

        <Shortener
          pendingShorten={pendingShorten}
          onPendingHandled={() => setPendingShorten(null)}
          onNeedAuth={handleNeedAuth}
          onCreated={handleCreated}
          onSignIn={handleSignIn}
        />

        <div className="mt-10">
          <LinkList refreshSignal={refreshSignal} />
        </div>
      </AppShell>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </AuthProvider>
  );
}

function displayName(user: User): string {
  const source = user.name?.trim() || user.email;
  const first = source.split(/[\s@]/)[0];
  return first.charAt(0).toUpperCase() + first.slice(1);
}