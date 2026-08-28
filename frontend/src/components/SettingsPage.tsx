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
      const updated = await api.updateProfile({
        name: nameValue,
        email: emailValue,
      });
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
            className="field py-2"
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
            className="field py-2"
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
            readOnly
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
    if (next.length < 6) {
      setError("New password must be at least 6 characters.");
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
              minLength={6}
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

  const runDelete = async () => {
    setBusy(true);
    setError(null);

    try {
      await api.deleteAccount();

      try {
        await api.logout();
      } catch {
        // Account/session already removed
      }

      setUser(null);
      window.location.replace("/app/login");
    } catch (err) {
      setError(errorMessage(err));

      if (err instanceof ApiError && err.status === 401) {
        setConfirming(false);
        onNeedAuth();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="card border-danger/30 p-5">
        <h2 className="label mb-1 text-danger-strong">Danger zone</h2>

        <p className="text-[13px] text-ink-mute">
          This permanently closes your account and deletes all your links.
        </p>

        {error && (
          <p role="alert" className="mt-2 text-[13px] text-danger-strong">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            setError(null);
            setConfirming(true);
          }}
          disabled={busy}
          className="btn-quiet mt-3 w-full justify-center hover:bg-danger/10 hover:text-danger-strong disabled:opacity-50"
        >
          Delete account
        </button>
      </section>

      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !busy) {
              setConfirming(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            aria-describedby="delete-account-description"
            className="card w-full max-w-md p-6 shadow-xl"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-danger/10 text-danger-strong">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v5" />
                <path d="M14 11v5" />
              </svg>
            </div>

            <h2
              id="delete-account-title"
              className="mt-4 text-lg font-bold tracking-tight"
            >
              Delete your account?
            </h2>

            <p
              id="delete-account-description"
              className="mt-2 text-sm leading-relaxed text-ink-soft"
            >
              This will permanently delete your account and all of your
              shortened links. This action cannot be undone.
            </p>

            {error && (
              <p
                role="alert"
                className="mt-3 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger-strong"
              >
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirming(false)}
                className="btn-ghost h-10 px-4"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() => void runDelete()}
                className="btn-primary h-10 bg-danger-strong px-4 text-white hover:opacity-90 disabled:opacity-50"
              >
                {busy ? "Deleting…" : "Yes, delete account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
