import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { api, ApiError } from "../lib/api";
import { AlertIcon, CheckIcon, SpinnerIcon } from "./Icons";
import { AuthShell } from "./AuthShell";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token");

  return token ? (
    <ResetForm token={token} />
  ) : (
    <AuthShell
      title="Reset link invalid"
      subtitle="This link is missing its reset token."
      footer={
        <p className="text-xs text-ink-mute">
          Need a fresh link?{" "}
          <Link
            to="/forgot-password"
            className="font-semibold text-ink-soft underline-offset-2 hover:text-ink hover:underline"
          >
            Request one
          </Link>
        </p>
      }
    >
      <div className="space-y-4">
        <div
          role="alert"
          className="animate-fade flex items-start gap-2 rounded-md border border-danger/30 bg-danger-soft px-3 py-2.5 text-[13px] text-danger-strong"
        >
          <AlertIcon width={15} height={15} className="mt-0.5 shrink-0" />
          <span>
            The reset link was incomplete. Open the exact link from your email,
            or request a new one.
          </span>
        </div>
        <Link
          to="/forgot-password"
          className="btn-ghost flex h-10 w-full items-center justify-center"
        >
          Request a new link
        </Link>
      </div>
    </AuthShell>
  );
}

function ResetForm({ token }: { token: string }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log(newPassword);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.resetPassword(token, newPassword);
      setDone(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't reset your password. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <AuthShell
        title="Password updated"
        subtitle="You're all set — sign in with your new password."
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-md border border-accent/30 bg-accent-soft px-3 py-2.5 text-[13px] text-accent-strong">
            <CheckIcon width={15} height={15} className="mt-0.5 shrink-0" />
            <span>
              Your password has been changed and other sessions were signed out.
            </span>
          </div>
          <Link
            to="/login"
            className="btn-primary flex h-10 w-full items-center justify-center"
          >
            Sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Use something you haven't used here before."
      footer={
        <p className="text-xs text-ink-mute">
          Changed your mind?{" "}
          <Link
            to="/login"
            className="font-semibold text-ink-soft underline-offset-2 hover:text-ink hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      }
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        noValidate
        className="space-y-4"
      >
        <div>
          <label htmlFor="reset-password" className="label">
            New password
          </label>
          <input
            id="reset-password"
            type="password"
            autoComplete="new-password"
            autoFocus
            minLength={6}
            className={`field h-10 ${error ? "border-danger/50 focus:border-danger focus:ring-danger/30" : ""}`}
            placeholder="At least 6 characters"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setError(null);
            }}
          />
        </div>
        <div>
          <label htmlFor="reset-confirm" className="label">
            Confirm new password
          </label>
          <input
            id="reset-confirm"
            type="password"
            autoComplete="new-password"
            className={`field h-10 ${error ? "border-danger/50 focus:border-danger focus:ring-danger/30" : ""}`}
            placeholder="Repeat it"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              setError(null);
            }}
          />
        </div>

        {error && (
          <div
            role="alert"
            className="animate-fade flex items-start gap-2 rounded-md border border-danger/30 bg-danger-soft px-3 py-2.5 text-[13px] text-danger-strong"
          >
            <AlertIcon width={15} height={15} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary h-10 w-full"
        >
          {submitting && <SpinnerIcon width={15} height={15} />}
          Update password
        </button>
      </form>
    </AuthShell>
  );
}
