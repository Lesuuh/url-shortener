import { useRef, useState, type FormEvent } from "react";
import { API_BASE, APP_URL, shortUrl } from "../config";
import { isValidUrl, normalizeUrl } from "../lib/format";
import { CheckIcon, CopyIcon, LinkIcon } from "./icons";

export function HeroDemo() {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const clean = normalizeUrl(url);
    if (!clean || !isValidUrl(clean)) {
      setError("Enter a valid link that starts with http:// or https://");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: clean }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Signed-in links need an account: hand the URL to the app, pre-filled.
        if (res.status === 401) {
          window.location.assign(`${APP_URL}?url=${encodeURIComponent(clean)}`);
          return;
        }
        setError(
          typeof data.error === "string"
            ? data.error
            : "Couldn’t shorten that link.",
        );
        return;
      }
      setResult(shortUrl(data.link.fullShortUrl));
    } catch {
      setError("Can’t reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!result) return;
    const ok =
      navigator.clipboard && window.isSecureContext
        ? await navigator.clipboard.writeText(result)
        : false;
    if (!ok) return;
    setCopied(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => void submit(e)}
        className="card flex items-center gap-2 p-2 shadow-sm"
      >
        <div className="relative min-w-0 flex-1">
          <LinkIcon
            width={15}
            height={15}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-mute"
          />
          <input
            type="text"
            inputMode="url"
            autoComplete="url"
            spellCheck={false}
            aria-label="Paste a long link"
            placeholder="Paste a long link — https://…"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            disabled={busy}
            className="h-11 w-full rounded-md border border-transparent bg-transparent pr-3 pl-9 text-sm text-ink placeholder:text-ink-mute/60 focus:border-accent focus:bg-surface focus:ring-2 focus:ring-accent/25 focus:outline-none"
          />
        </div>
        <button type="submit" disabled={busy} className="btn-primary h-11 shrink-0 px-4">
          {busy ? "Shortening…" : "Shorten"}
        </button>
      </form>

      {error && (
        <p
          role="alert"
          className="animate-rise mt-2 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-[13px] text-danger-strong"
        >
          {error}
        </p>
      )}

      {result && (
        <div className="animate-pop mt-2 overflow-hidden rounded-md border border-line bg-surface">
          <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="mb-0.5 text-[11px] font-semibold tracking-wide text-accent-strong uppercase">
                Ready to share
              </p>
              <button
                type="button"
                onClick={() => void copy()}
                className="font-mono block max-w-full truncate text-[15px] font-semibold text-ink underline-offset-4 hover:underline"
                title="Copy to clipboard"
              >
                {result}
              </button>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => void copy()}
                className={`btn-primary h-8 ${copied ? "bg-accent-strong" : ""}`}
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
              <a
                href={`${APP_URL}?url=${encodeURIComponent(normalizeUrl(url))}`}
                className="btn-ghost h-8"
              >
                Open in app
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}