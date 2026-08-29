import { useState } from "react";
import { Link } from "react-router";
import { api, ApiError } from "../lib/api";
import { AlertIcon, CheckIcon, SpinnerIcon } from "./Icons";
import { AuthShell } from "./AuthShell";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.forgotPassword(trimmed);
      setSent(true);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 429
          ? err.message
          : "Couldn't send the reset link right now. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title={sent ? "Check your inbox" : "Reset your password"}
      subtitle={
        sent
          ? undefined
          : "We'll email you a link to pick a new password."
      }
      footer={
        <p className="text-xs text-ink-mute">
          Remembered it?{" "}
          <Link to="/login" className="font-semibold text-ink-soft underline-offset-2 hover:text-ink hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      {sent ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-md border border-accent/30 bg-accent-soft px-3 py-2.5 text-[13px] text-accent-strong">
            <CheckIcon width={15} height={15} className="mt-0.5 shrink-0" />
            <span>
              If an account exists for <span className="font-semibold">{email}</span>,
              a reset link is on its way. It expires quickly and only works once.
            </span>
          </div>
          <Link to="/login" className="btn-ghost flex h-10 w-full items-center justify-center">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={(e) => void handleSubmit(e)} noValidate className="space-y-4">
          <div>
            <label htmlFor="forgot-email" className="label">
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              autoFocus
              className={`field h-10 ${error ? "border-danger/50 focus:border-danger focus:ring-danger/30" : ""}`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
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

          <button type="submit" disabled={submitting} className="btn-primary h-10 w-full">
            {submitting && <SpinnerIcon width={15} height={15} />}
            Send reset link
          </button>
        </form>
      )}
    </AuthShell>
  );
}