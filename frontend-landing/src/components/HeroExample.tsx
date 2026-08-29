import { useState } from "react";
import { ArrowDownIcon, LinkIcon } from "./icons";

export function HeroExample() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const ok =
      navigator.clipboard && window.isSecureContext
        ? await navigator.clipboard.writeText("https://knot.to/abcd12")
        : false;
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="relative hidden lg:block" aria-hidden="true">
      <div className="card animate-rise p-5 shadow-sm">
        <p className="flex items-center gap-2 text-[11px] font-semibold tracking-wide text-ink-mute uppercase">
          <LinkIcon width={13} height={13} />
          From this
        </p>
        <p className="mt-2 truncate rounded-md bg-surface-2 px-3 py-2 font-mono text-[12px] text-ink-soft">
          https://www.some-long-domain.example/very/deep/path?utm_source=newsletter
          &utm_campaign=june&ref=share
        </p>

        <div className="my-4 flex items-center gap-2 text-ink-mute">
          <span className="h-px flex-1 bg-line" aria-hidden></span>
          <ArrowDownIcon width={14} height={14} />
          <span className="h-px flex-1 bg-line" aria-hidden></span>
        </div>

        <p className="flex items-center gap-2 text-[11px] font-semibold tracking-wide text-ink-mute uppercase">
          <LinkIcon width={13} height={13} />
          To this
        </p>
        <div className="mt-2 flex items-center justify-between gap-2 rounded-md border border-line bg-surface px-3 py-2.5">
          <span className="font-mono text-[13px] font-semibold text-accent-strong">
            knot.to/abcd12
          </span>
          <button type="button" onClick={() => void copy()} className="btn-ghost h-7 shrink-0 px-2 text-[11px]">
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <div
        className="card animate-rise absolute -right-6 -bottom-8 flex items-center gap-2.5 px-3.5 py-2.5 shadow-md"
        style={{ animationDelay: "90ms" }}
      >
        <span className="flex size-7 items-center justify-center rounded-md bg-accent-soft text-accent-strong">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </span>
        <span className="text-[12px] font-medium">
          Auto-expires
          <span className="block text-[11px] font-normal text-ink-mute">
            30 days by default
          </span>
        </span>
      </div>
    </div>
  );
}