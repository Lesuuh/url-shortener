import { useState } from "react";
import type { FormEvent } from "react";
import { useAppActions } from "../hooks/useAppActions";
import { useAuth } from "../context/auth";
import { api, ApiError } from "../lib/api";
import { AppShell } from "./AppShell";
import { KeyIcon, RocketIcon } from "./Icons";
import { useToast } from "./Toast";

export function SettingsPage() {
  const { user, ready } = useAuth();
  const { handleNeedAuth, handleSignIn, handleSignOut, handleNewLink } =
    useAppActions();
  const { toast } = useToast();

  if (!ready) return null; // RequireAuth already shows a spinner while restoring

  if (!user) {
    handleNeedAuth();
    return null;
  }

  return (
    <AppShell
      title="Settings"
      onNewLink={handleNewLink}
      onSignIn={handleSignIn}
      onSignOut={() => void handleSignOut()}
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-8 animate-rise">
        {/* Tier panel */}
        <section className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <RocketIcon width={18} height={18} />
            </span>
            <div>
              <p className="flex items-center gap-2 text-[13px] font-semibold">
                {user.tier === "PRO" ? "Pro plan" : "Basic plan"}
                {user.tier === "PRO" && (
                  <span className="rounded bg-accent-soft px-1.5 py-0.5 text-[11px] font-bold text-accent-strong">
                    ACTIVATED
                  </span>
                )}
              </p>
              <p className="mt-0.5 max-w-md text-[13px] text-ink-mute">
                {user.tier === "PRO"
                  ? "Pro links keep up to 6 months and you get the whole toolbox."
                  : "Free forever. Link lifetimes scale with your tier."}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={user.tier === "PRO"}
            onClick={() =>
              toast("Pro is coming soon — it'll land without a card.")
            }
            className="btn-quiet shrink-0 self-start sm:self-center disabled:opacity-100"
          >
            {user.tier === "PRO" ? (
              <span className="flex items-center gap-1.5">
                <KeyIcon width={13} height={13} /> Already Pro
              </span>
            ) : (
              "Upgrade to Pro"
            )}
          </button>
        </section>

        <ProfileCard name={user.name} email={user.email} />
        <PasswordCard />
        <DangerCard onNeedAuth={handleNeedAuth} />
      </div>
    </AppShell>
  );
}

/* ---------------- Profile ---------------- */

function ProfileCard({ name, email }: { name: string; email: string }) {
  const { setUser } = useAuth();
  const { toast } = useToast();
  const [nameValue, setNameValue] = useState(name);
  const [emailValue, setEmailValue] = useState(email);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await api.updateProfile({ name: nameValue, email: emailValue });
      setUser(updated);
      toast("Profile saved");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card p-5">
      <h2 className="label mb-3">Profile</h2>
      <form onSubmit={(e) => void submit(e)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="profile-name" className="label">
            Name
          </label>
          <input
            id="profile-name"
            className="field"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            minLength={3}
          />
        </div>
        <div>
          <label htmlFor="profile-email" className="label">
            Email
          </label>
          <input
            id="profile-email"
            type="email"
            className="field"
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
          />
        </div>
        {error && (
          <p role="alert" className="text-[13px] text-danger-strong">
            {error}
          </p>
        )}
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </section>
  );
}

/* ---------------- Password ---------------- */

function PasswordCard() {
  const { toast } = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (next.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.changePassword({ currentPassword: current, newPassword: next });
      setCurrent("");
      setNext("");
      setConfirm("");
      toast("Password updated");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card p-5">
      <h2 className="label mb-3 flex items-center gap-2">
        <KeyIcon width={14} height={14} /> Change password
      </h2>
      <form onSubmit={(e) => void submit(e)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="pw-current" className="label">
            Current password
          </label>
          <input
            id="pw-current"
            type="password"
            className="field py-2"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pw-new" className="label">
              New password
            </label>
            <input
              id="pw-new"
              type="password"
              className="field py-2"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              minLength={8}
            />
          </div>
          <div>
            <label htmlFor="pw-confirm" className="label">
              Confirm new
            </label>
            <input
              id="pw-confirm"
              type="password"
              className="field py-2"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
        </div>
        {error && (
          <p role="alert" className="text-[13px] text-danger-strong">
            {error}
          </p>
        )}
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving…" : "Update password"}
          </button>
        </div>
      </form>
    </section>
  );
}

/* ---------------- Danger ---------------- */

function DangerCard({ onNeedAuth }: { onNeedAuth: () => void }) {
  const { setUser } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.deleteAccount();
      try {
        await api.logout();
      } catch {
        /* server already dropped the session */
      }
      setUser(null);
      window.location.replace("/app/login");
    } catch (err) {
      setError(errorMessage(err));
      if (err instanceof ApiError && err.status === 401) onNeedAuth();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card border-danger/30 p-5">
      <h2 className="label mb-1 text-danger-strong">Danger zone</h2>
      <p className="text-[13px] text-ink-mute">
        This permanently closes your account and deletes all your links.
      </p>
      {confirming && (
        <p role="alert" className="mt-2 text-[13px] text-danger-strong">
          Really? Everything is wiped. Click again to confirm.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-[13px] text-danger-strong">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={() => void run()}
        disabled={busy}
        className="btn-quiet mt-3 w-full justify-center hover:bg-danger/10 hover:text-danger-strong disabled:opacity-50"
      >
        {busy ? "Deleting…" : "Delete account"}
      </button>
    </section>
  );
}

/* ---------------- helpers ---------------- */

function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401)
      return "Your session expired — please sign in again.";
    return err.message;
  }
  return "Something went wrong. Please try again.";
}
