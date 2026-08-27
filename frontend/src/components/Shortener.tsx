import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/auth";
import { api, ApiError } from "../lib/api";
import { useCopy } from "../lib/clipboard";
import { formatDate, isValidUrl, normalizeUrl } from "../lib/format";
import type { LinkRecord } from "../types";
import {
  CheckIcon,
  CopyIcon,
  ExternalIcon,
  LinkIcon,
  SpinnerIcon,
} from "./Icons";

interface ShortenerProps {
  pendingShorten: { url: string; alias: string } | null;
  onPendingHandled: () => void;
  onNeedAuth: (pending: { url: string; alias: string }) => void;
  onCreated: (link: LinkRecord) => void;
  onSignIn: () => void;
}

const ALIAS_PATTERN = /^[a-zA-Z0-9_-]{3,32}$/;

export function Shortener({
  pendingShorten,
  onPendingHandled,
  onNeedAuth,
  onCreated,
  onSignIn,
}: ShortenerProps) {
  const { user } = useAuth();
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [showAlias, setShowAlias] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    link: LinkRecord;
    fullShortUrl: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingHandledRef = useRef<object | null>(null);
  const pendingActiveRef = useRef(false);
  const { copied, copy } = useCopy();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefill = params.get("url");
    if (prefill) {
      setUrl(prefill);
      inputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    setResult(null);
  }, [user?.id]);

  const submit = useCallback(
    async (values: { url: string; alias: string } | undefined = undefined) => {
      const targetUrl = values ? values.url : url;
      const targetAlias = values ? values.alias : alias;
      const cleanUrl = normalizeUrl(targetUrl);

      if (!cleanUrl || !isValidUrl(cleanUrl)) {
        setError("Enter a valid link that starts with http:// or https://");
        return;
      }
      if (targetAlias && !ALIAS_PATTERN.test(targetAlias)) {
        setError(
          "Custom alias must be 3–32 characters: letters, numbers, “-” or “_”.",
        );
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await api.createLink(
          cleanUrl,
          targetAlias.trim() ? targetAlias.trim() : undefined,
        );
        setResult(res.link);
        setUrl("");
        setAlias("");
        onCreated(res.link.link);
        if (pendingActiveRef.current) onPendingHandled();
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          if (pendingActiveRef.current) {
            setError("Please sign in and try again.");
          } else {
            onNeedAuth({ url: cleanUrl, alias: targetAlias.trim() });
          }
        } else if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Something went wrong. Please try again.");
        }
      } finally {
        setLoading(false);
        pendingActiveRef.current = false;
      }
    },
    [url, alias, onNeedAuth, onCreated, onPendingHandled],
  );

  useEffect(() => {
    if (!pendingShorten) {
      pendingHandledRef.current = null;
      return;
    }
    if (pendingHandledRef.current === pendingShorten) return;
    pendingHandledRef.current = pendingShorten;
    pendingActiveRef.current = true;
    void submit(pendingShorten);
  }, [pendingShorten, submit]);

  return (
    <section
      id="shorten"
      aria-label="Shorten a link"
      className="mx-auto w-full"
    >
      <div className="card animate-rise overflow-hidden">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
          className="flex items-center gap-2 p-2"
        >
          <div className="relative min-w-0 flex-1">
            <LinkIcon
              width={16}
              height={16}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-mute"
            />
            <input
              ref={inputRef}
              type="text"
              inputMode="url"
              autoComplete="url"
              spellCheck={false}
              className="h-10 w-full rounded-md border border-transparent bg-transparent pr-16 pl-9 text-sm text-ink placeholder:text-ink-mute/60 focus:border-accent focus:bg-surface focus:ring-2 focus:ring-accent/25 focus:outline-none"
              placeholder="Paste a long link — https://…"
              aria-label="URL to shorten"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              disabled={loading}
            />
            <span className="kbd pointer-events-none absolute top-1/2 right-2 -translate-y-1/2">
              ⌘K
            </span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary h-10 shrink-0 px-4"
          >
            {loading ? (
              <>
                <SpinnerIcon width={15} height={15} />
                Shortening…
              </>
            ) : (
              "Shorten"
            )}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line bg-surface px-3 py-1.5">
          <button
            type="button"
            onClick={() => setShowAlias((s) => !s)}
            aria-expanded={showAlias}
            className={`btn-quiet -mx-1 h-6 ${showAlias ? "text-accent-strong" : ""}`}
          >
            <CheckIcon
              width={13}
              height={13}
              className={showAlias ? "opacity-100" : "opacity-30"}
            />
            Custom alias
          </button>

          {!user && (
            <span className="text-xs text-ink-mute">
              You’ll need an account to shorten —
              <button
                type="button"
                onClick={onSignIn}
                className="ml-1 font-semibold text-accent-strong underline-offset-2 hover:underline"
              >
                sign in free
              </button>
            </span>
          )}
        </div>

        {showAlias && (
          <div className="animate-fade border-t border-line bg-surface px-3 pb-3">
            <div className="flex items-center gap-2 rounded-md border border-line bg-page px-3 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25">
              <span className="font-mono text-[13px] text-ink-mute">
                {shortBaseHint()}
              </span>
              <input
                type="text"
                spellCheck={false}
                autoComplete="off"
                className="h-9 w-full bg-transparent font-mono text-[13px] text-ink placeholder:text-ink-mute/60 focus:outline-none"
                placeholder="my-alias"
                aria-label="Custom alias"
                value={alias}
                onChange={(e) => {
                  setAlias(e.target.value);
                  setError(null);
                }}
                disabled={loading}
              />
            </div>
            <p className="mt-1.5 text-xs text-ink-mute">
              3–32 characters. Letters, numbers, “-” and “_” only.
            </p>
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="animate-rise mt-2.5 flex items-start gap-2 rounded-md border border-danger/30 bg-danger-soft px-3 py-2.5 text-[13px] text-danger-strong"
        >
          <span aria-hidden>⚠</span>
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div
          role="status"
          className="card animate-pop mt-2.5 overflow-hidden"
        >
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-accent-strong uppercase">
                <CheckIcon width={12} height={12} />
                Your short link is ready
              </p>
              <a
                href={result.fullShortUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono block truncate text-[15px] font-semibold text-ink underline-offset-4 hover:underline"
              >
                {result.fullShortUrl}
              </a>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-mute">
                <span className="max-w-[24rem] truncate">
                  {result.link.original_url}
                </span>
                <span aria-hidden>·</span>
                <span>expires {formatDate(result.link.expires_at)}</span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <a
                href={result.fullShortUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost"
              >
                <ExternalIcon width={14} height={14} />
                Open
              </a>
              <button
                type="button"
                onClick={() => copy(result.fullShortUrl)}
                className={`btn-primary ${copied ? "bg-accent-strong" : ""}`}
              >
                {copied ? (
                  <>
                    <CheckIcon width={14} height={14} />
                    Copied
                  </>
                ) : (
                  <>
                    <CopyIcon width={14} height={14} />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function shortBaseHint(): string {
  if (import.meta.env.DEV) return "localhost:5000/";
  return `${window.location.origin}/`;
}
