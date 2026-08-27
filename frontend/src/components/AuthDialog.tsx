import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "../lib/api";
import type { User } from "../types";
import { AlertIcon, SpinnerIcon } from "./Icons";

type Mode = "login" | "register";

interface AuthDialogProps {
  open: boolean;
  initialMode?: Mode;
  title?: string;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  form?: string;
}

export function AuthDialog({
  open,
  initialMode = "login",
  title,
  onClose,
  onSuccess,
}: AuthDialogProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setErrors({});
      setPassword("");
      const t = window.setTimeout(() => emailRef.current?.focus(), 60);
      return () => window.clearTimeout(t);
    }
  }, [open, initialMode]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (mode === "register" && name.trim().length < 3) {
      next.name = "Name must be at least 3 characters long";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Enter a valid email address";
    }
    if (password.length < 6) {
      next.password = "Password must be at least 6 characters long";
    }
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      const res =
        mode === "register"
          ? await api.register(name.trim(), email.trim(), password)
          : await api.login(email.trim(), password);
      setPassword("");
      onSuccess(res.user);
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        setErrors(err.fields);
      } else if (err instanceof ApiError && err.status === 429) {
        setErrors({ form: err.message });
      } else if (err instanceof ApiError && err.status === 401) {
        setErrors({ form: "Invalid email or password." });
      } else if (err instanceof ApiError && err.status === 409) {
        setErrors({ form: "That email is already registered. Try signing in." });
      } else if (err instanceof ApiError && err.status === 0) {
        setErrors({ form: err.message });
      } else {
        setErrors({ form: "Something went wrong. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  }

  const switchMode = (next: Mode) => {
    setMode(next);
    setErrors({});
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "login" ? "Sign in" : "Create account"}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="animate-fade absolute inset-0 cursor-default bg-overlay backdrop-blur-[2px]"
      />

      <div className="animate-pop relative w-full max-w-md rounded-lg border border-line bg-surface p-5 shadow-xl sm:p-6">
        {title ? (
          <p className="mb-3 text-sm text-ink-soft">{title}</p>
        ) : null}

        <div
          className="mb-5 grid grid-cols-2 rounded-md bg-surface-2 p-1"
          role="tablist"
        >
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => switchMode(m)}
              className={`rounded-md px-3 py-1.5 text-[13px] font-semibold transition focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none ${
                mode === m
                  ? "bg-surface text-ink shadow-sm"
                  : "text-ink-mute hover:text-ink"
              }`}
            >
              {m === "login" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {mode === "register" && (
            <div>
              <label htmlFor="auth-name" className="label">
                Name
              </label>
              <input
                id="auth-name"
                type="text"
                autoComplete="name"
                className={`field ${errors.name ? "border-danger/50 focus:border-danger focus:ring-danger/30" : ""}`}
                placeholder="Ada Lovelace"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-danger-strong">
                  {errors.name}
                </p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="label">
              Email
            </label>
            <input
              id="auth-email"
              ref={emailRef}
              type="email"
              autoComplete="email"
              className={`field ${errors.email ? "border-danger/50 focus:border-danger focus:ring-danger/30" : ""}`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-danger-strong">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="auth-password" className="label">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className={`field ${errors.password ? "border-danger/50 focus:border-danger focus:ring-danger/30" : ""}`}
              placeholder={mode === "register" ? "At least 6 characters" : "••••••••"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <p className="mt-1.5 text-xs text-danger-strong">
                {errors.password}
              </p>
            )}
          </div>

          {errors.form && (
            <div
              role="alert"
              className="animate-fade flex items-start gap-2 rounded-md border border-danger/30 bg-danger-soft px-3 py-2.5 text-[13px] text-danger-strong"
            >
              <AlertIcon width={15} height={15} className="mt-0.5 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary h-9 w-full"
          >
            {submitting && <SpinnerIcon width={15} height={15} />}
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-ink-mute">
          {mode === "login"
            ? "New here? Switch to “Create account” to get started."
            : "Accounts keep your shortened links safe and organised."}
        </p>
      </div>
    </div>
  );
}
