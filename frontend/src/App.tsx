import { useCallback, useState } from "react";
import { AppShell } from "./components/AppShell";
import { AuthDialog } from "./components/AuthDialog";
import { LinkList } from "./components/LinkList";
import { Shortener } from "./components/Shortener";
import { ToastProvider, useToast } from "./components/Toast";
import { AuthProvider, useAuth } from "./context/auth";
import { api } from "./lib/api";
import type { User } from "./types";

interface PendingShorten {
  url: string;
  alias: string;
}

function AppInner() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authTitle, setAuthTitle] = useState<string | undefined>(undefined);
  const [pendingShorten, setPendingShorten] = useState<PendingShorten | null>(
    null,
  );
  const [refreshSignal, setRefreshSignal] = useState(0);

  const openAuth = useCallback(
    (mode: "login" | "register", title?: string) => {
      setAuthMode(mode);
      setAuthTitle(title);
      setAuthOpen(true);
    },
    [],
  );

  const closeAuth = useCallback(() => {
    setAuthOpen(false);
    if (!user) setPendingShorten(null);
  }, [user]);

  const handleNeedAuth = useCallback(
    (pending: PendingShorten) => {
      setPendingShorten(pending);
      openAuth("register", "Shortening needs an account. Create one free.");
    },
    [openAuth],
  );

  const handleAuthSuccess = useCallback(
    (authedUser: User) => {
      setUser(authedUser);
      setAuthOpen(false);
      if (pendingShorten) {
        setPendingShorten({ ...pendingShorten });
      }
      toast(`Signed in as ${authedUser.name ?? authedUser.email}`);
    },
    [setUser, toast, pendingShorten],
  );

  const handleSignOut = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      /* session already invalid — still sign out locally */
    }
    setUser(null);
    setPendingShorten(null);
    toast("Signed out");
  }, [setUser, toast]);

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
    <div className="flex min-h-dvh flex-col">
      <AppShell
        onNewLink={handleNewLink}
        onSignIn={() => openAuth("login")}
        onSignOut={() => void handleSignOut()}
      >
        <Shortener
          pendingShorten={pendingShorten}
          onPendingHandled={() => setPendingShorten(null)}
          onNeedAuth={handleNeedAuth}
          onCreated={handleCreated}
          onSignIn={() => openAuth("login")}
        />

        <div className="mt-10">
          <LinkList refreshSignal={refreshSignal} />
        </div>
      </AppShell>

      <AuthDialog
        open={authOpen}
        initialMode={authMode}
        title={authTitle}
        onClose={closeAuth}
        onSuccess={handleAuthSuccess}
      />
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
