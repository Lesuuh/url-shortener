import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/auth";
import { api } from "../lib/api";
import type { User } from "../types";
import { AppShell } from "./AppShell";
import { LinkList } from "./LinkList";
import { Shortener } from "./Shortener";
import { useToast } from "./Toast";

interface PendingShorten {
  url: string;
  alias: string;
}

export function Dashboard() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [pendingShorten, setPendingShorten] = useState<PendingShorten | null>(
    null,
  );
  const [refreshSignal, setRefreshSignal] = useState(0);

  const handleSignIn = useCallback(() => navigate("/login"), [navigate]);

  const handleNeedAuth = useCallback(() => {
    setUser(null);
    navigate("/login");
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
    navigate("/login", { replace: true });
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

  return (
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
  );
}

function displayName(user: User): string {
  const source = user?.name?.trim() || user.email;
  const first = source.split(/[\s@]/)[0];
  return first.charAt(0).toUpperCase() + first.slice(1);
}
