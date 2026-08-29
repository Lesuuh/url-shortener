import { useCallback, useState } from "react";
import { useAppActions } from "../hooks/useAppActions";
import { useAuth } from "../context/auth";
import { AppShell } from "./AppShell";
import { LinkList } from "./LinkList";
import { Shortener } from "./Shortener";
import type { User } from "../types";

export function Dashboard() {
  const { user } = useAuth();
  const { handleNeedAuth, handleSignIn, handleSignOut, handleNewLink } =
    useAppActions();
  const [refreshSignal, setRefreshSignal] = useState(0);

  const handleCreated = useCallback(() => {
    setRefreshSignal((n) => n + 1);
  }, []);

  return (
    <AppShell title="My links" onNewLink={handleNewLink} onSignIn={handleSignIn} onSignOut={() => void handleSignOut()}>
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
        pendingShorten={null}
        onPendingHandled={() => undefined}
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
  const source = user.name?.trim() || user.email;
  const first = source.split(/[\s@]/)[0];
  return first.charAt(0).toUpperCase() + first.slice(1);
}