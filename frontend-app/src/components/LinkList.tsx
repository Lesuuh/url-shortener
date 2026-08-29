import { QRCodeCanvas } from "qrcode.react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/auth";
import { api, ApiError } from "../lib/api";
import { copyToClipboard } from "../lib/clipboard";
import { toCsv, downloadCsv } from "../lib/csv";
import { formatDate, hostname, isExpired, shortUrl } from "../lib/format";
import type { LinkRecord } from "../types";
import {
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  ExternalIcon,
  HistoryIcon,
  LinkIcon,
  QrCodeIcon,
  SearchIcon,
  SpinnerIcon,
  TrashIcon,
  XIcon,
} from "./Icons";

interface LinkListProps {
  refreshSignal: number;
}

type Tab = "all" | "active" | "expired";

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "expired", label: "Expired" },
];

export function LinkList({ refreshSignal }: LinkListProps) {
  const { user } = useAuth();
  const [links, setLinks] = useState<LinkRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [qrLink, setQrLink] = useState<LinkRecord | null>(null);
  const [exporting, setExporting] = useState(false);

  const copy = useCallback(async (code: string) => {
    const ok = await copyToClipboard(shortUrl(code));
    if (!ok) return;
    setCopiedCode(code);
    window.setTimeout(() => setCopiedCode(null), 1600);
  }, []);

  const load = useCallback(async () => {
    setError(null);
    setLinks((prev) => prev ?? null);
    try {
      const res = await api.myLinks();
      setLinks(res.allLinks);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setLinks([]);
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Couldn’t load your links.");
      }
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setLinks(null);
      return;
    }
    void load();
  }, [user, refreshSignal, load]);

  const stats = useMemo(() => {
    if (!links) return null;
    const active = links.filter((l) => !isExpired(l.expires_at)).length;
    return {
      total: links.length,
      active,
      expired: links.length - active,
    };
  }, [links]);

  const visible = useMemo(() => {
    if (!links) return [];
    const q = query.trim().toLowerCase();
    return links.filter((link) => {
      if (tab === "active" && isExpired(link.expires_at)) return false;
      if (tab === "expired" && !isExpired(link.expires_at)) return false;
      if (!q) return true;
      return (
        link.short_code.toLowerCase().includes(q) ||
        (link.custom_alias?.toLowerCase().includes(q) ?? false) ||
        link.original_url.toLowerCase().includes(q) ||
        hostname(link.original_url).toLowerCase().includes(q)
      );
    });
  }, [links, tab, query]);

  const counts = useMemo(() => {
    if (!links) return { all: 0, active: 0, expired: 0 };
    const active = links.filter((l) => !isExpired(l.expires_at)).length;
    return { all: links.length, active, expired: links.length - active };
  }, [links]);

  if (!user) return null;

  const filteredOut = links !== null && visible.length === 0;
  const hasQuery = query.trim() !== "";

  return (
    <section
      id="history"
      aria-label="Your links"
      className="mx-auto mt-12 w-full"
    >
      {/* Stats overview */}
      {stats && stats.total > 0 && (
        <div className="animate-rise mb-6 grid grid-cols-3 gap-3">
          <StatCard label="Total links" value={stats.total} />
          <StatCard
            label="Active"
            value={stats.active}
            tone={stats.active > 0 ? "accent" : undefined}
          />
          <StatCard
            label="Expired"
            value={stats.expired}
            tone={stats.expired > 0 ? "danger" : undefined}
          />
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="flex items-center gap-2 text-sm font-bold tracking-tight">
            <HistoryIcon width={15} height={15} className="text-ink-mute" />
            Your links
          </h2>

          <div
            className="flex items-center rounded-md bg-surface-2 p-0.5"
            role="tablist"
            aria-label="Filter links"
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none ${
                  tab === t.id
                    ? "bg-surface text-ink shadow-sm"
                    : "text-ink-mute hover:text-ink"
                }`}
              >
                {t.label}
                <span className="ml-1 text-[11px] opacity-60">
                  {counts[t.id]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
            <SearchIcon
              width={14}
              height={14}
              className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-ink-mute"
            />
            <input
              type="search"
              spellCheck={false}
              placeholder="Search links…"
              aria-label="Search your links"
              className="field h-8 border-transparent bg-surface pl-8 text-[13px] focus:border-accent"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="btn-quiet h-8 shrink-0"
            disabled={links === null}
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => {
              if (!links || links.length === 0) return;
              setExporting(true);
              const rows: (string | number)[][] = [
                ["Short URL", "Custom alias", "Original URL", "Created", "Expires"],
                ...links.map((l) => [
                  shortUrl(l.short_code),
                  l.custom_alias ?? "",
                  l.original_url,
                  l.createdAt,
                  l.expires_at ?? "",
                ]),
              ];
              downloadCsv(
                `knot-links-${new Date().toISOString().slice(0, 10)}.csv`,
                toCsv(rows),
              );
              window.setTimeout(() => setExporting(false), 600);
            }}
            className="btn-quiet h-8 shrink-0"
            disabled={links === null || links.length === 0 || exporting}
            title="Download your links as CSV"
            aria-label="Export links as CSV"
          >
            <DownloadIcon width={14} height={14} />
            CSV
          </button>
        </div>
      </div>

      {links === null && !error && (
        <div className="card divide-y divide-line">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="h-3.5 w-32 animate-pulse rounded bg-line" />
              <div className="h-3.5 w-48 animate-pulse rounded bg-line" />
              <div className="ml-auto h-3.5 w-14 animate-pulse rounded bg-line" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="animate-rise flex items-start gap-2 rounded-md border border-danger/30 bg-danger-soft px-3 py-2.5 text-[13px] text-danger-strong"
        >
          <span aria-hidden>⚠</span>
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void load()}
            className="ml-auto shrink-0 font-semibold underline-offset-2 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {links !== null && links.length === 0 && (
        <div className="card flex flex-col items-center justify-center px-6 py-12 text-center">
          <span className="mb-3 flex size-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <LinkIcon width={19} height={19} />
          </span>
          <p className="text-sm font-semibold">No links yet</p>
          <p className="mt-1 max-w-xs text-[13px] text-ink-mute">
            Shorten your first link above — it’ll appear here and stay
            attached to your account.
          </p>
        </div>
      )}

      {links !== null && links.length > 0 && filteredOut && (
        <div className="card flex flex-col items-center justify-center px-6 py-10 text-center">
          <p className="text-sm font-semibold">
            {hasQuery ? "No links match your search" : "Nothing here"}
          </p>
          <p className="mt-1 max-w-xs text-[13px] text-ink-mute">
            {hasQuery
              ? "Try a different search term or switch tabs."
              : `You don’t have any ${tab} links right now.`}
          </p>
        </div>
      )}

      {visible.length > 0 && (
        <>
          <div className="card hidden overflow-hidden md:block">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-line text-[11px] tracking-wide text-ink-mute uppercase">
                  <th className="px-3 py-2 font-semibold">Short link</th>
                  <th className="px-3 py-2 font-semibold">Original</th>
                  <th className="px-3 py-2 font-semibold">Created</th>
                  <th className="px-3 py-2 font-semibold">Expires</th>
                  <th className="px-3 py-2 text-right font-semibold">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((link) => (
                  <RowDesktop
                    key={link.id}
                    link={link}
                    copied={copiedCode === link.short_code}
                    onCopy={() => void copy(link.short_code)}
                    onQr={() => setQrLink(link)}
                    confirming={confirmId === link.id}
                    deleting={deletingId === link.id}
                    onAskDelete={() =>
                      setConfirmId(confirmId === link.id ? null : link.id)
                    }
                    onCancelDelete={() => setConfirmId(null)}
                    onDelete={() => void removeLink(link.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 md:hidden">
            {visible.map((link) => (
              <RowMobile
                key={link.id}
                link={link}
                copied={copiedCode === link.short_code}
                onCopy={() => void copy(link.short_code)}
                onQr={() => setQrLink(link)}
                confirming={confirmId === link.id}
                deleting={deletingId === link.id}
                onAskDelete={() =>
                  setConfirmId(confirmId === link.id ? null : link.id)
                }
                onCancelDelete={() => setConfirmId(null)}
                onDelete={() => void removeLink(link.id)}
              />
            ))}
          </div>

          {qrLink && (
            <QrModal link={qrLink} onClose={() => setQrLink(null)} />
          )}
        </>
      )}
    </section>
  );

  async function removeLink(id: string) {
    setConfirmId(null);
    setDeletingId(id);
    try {
      await api.deleteLink(id);
      setLinks((prev) => prev?.filter((l) => l.id !== id) ?? null);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn’t delete the link. Please try again.",
      );
    } finally {
      setDeletingId(null);
    }
  }
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "accent" | "danger";
}) {
  return (
    <div className="card px-4 py-3.5">
      <p className="text-[11px] font-semibold tracking-wide text-ink-mute uppercase">
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-bold tracking-tight ${
          tone === "accent"
            ? "text-accent-strong"
            : tone === "danger"
              ? "text-danger-strong"
              : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function linkUrl(link: LinkRecord): string {
  return link.custom_alias ?? link.short_code;
}

function ExpiryBadge({ link }: { link: LinkRecord }) {
  const expired = isExpired(link.expires_at);
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
        expired
          ? "bg-danger-soft text-danger-strong"
          : "bg-accent-soft text-accent-strong"
      }`}
      title={expired ? "This link has expired" : undefined}
    >
      {formatDate(link.expires_at)}
    </span>
  );
}

interface RowProps {
  link: LinkRecord;
  copied: boolean;
  onCopy: () => void;
  onQr: () => void;
  confirming: boolean;
  deleting: boolean;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}

interface DeleteActionsProps {
  label: string;
  confirming: boolean;
  deleting: boolean;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}

function DeleteActions({
  label,
  confirming,
  deleting,
  onAskDelete,
  onCancelDelete,
  onDelete,
}: DeleteActionsProps) {
  if (deleting) {
    return <SpinnerIcon width={15} height={15} className="text-ink-mute" />;
  }
  if (confirming) {
    return (
      <span className="flex items-center gap-1">
        <span className="mr-0.5 text-xs text-ink-mute">Sure?</span>
        <button
          type="button"
          onClick={onDelete}
          className="flex size-7 items-center justify-center rounded-md bg-danger text-page transition hover:bg-danger-strong"
          aria-label="Confirm delete"
        >
          <CheckIcon width={14} height={14} />
        </button>
        <button
          type="button"
          onClick={onCancelDelete}
          className="flex size-7 items-center justify-center rounded-md text-ink-mute transition hover:bg-surface-2 hover:text-ink"
          aria-label="Cancel delete"
        >
          ✕
        </button>
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onAskDelete}
      className="btn-quiet hover:text-danger"
      title="Delete link"
      aria-label={`Delete ${label}`}
    >
      <TrashIcon width={15} height={15} />
    </button>
  );
}

function RowDesktop(props: RowProps) {
  const { link, copied, onCopy } = props;
  const expired = isExpired(link.expires_at);
  const code = linkUrl(link);
  return (
    <tr className="group transition hover:bg-surface-hover">
      <td className="max-w-[11rem] px-3 py-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onCopy}
            className={`truncate font-mono text-[13px] font-medium underline-offset-2 hover:underline ${
              expired ? "text-ink-mute line-through" : "text-accent-strong"
            }`}
            title="Copy short link"
          >
            {code}
          </button>
          <button
            type="button"
            onClick={onCopy}
            className="text-ink-mute opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
            aria-label={`Copy short link for ${code}`}
          >
            {copied ? (
              <CheckIcon width={13} height={13} className="text-accent-strong" />
            ) : (
              <CopyIcon width={13} height={13} />
            )}
          </button>
          <button
            type="button"
            onClick={props.onQr}
            className="text-ink-mute opacity-0 transition group-hover:opacity-100 hover:text-ink focus-visible:opacity-100"
            aria-label={`Show QR code for ${code}`}
            title="QR code"
          >
            <QrCodeIcon width={13} height={13} />
          </button>
        </div>
        <a
          href={shortUrl(code)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-xs text-ink-mute hover:text-ink"
        >
          open <ExternalIcon width={10} height={10} />
        </a>
      </td>
      <td className="max-w-[18rem] truncate px-3 py-2 text-ink-soft">
        {hostname(link.original_url)}
        <span className="hidden text-xs text-ink-mute lg:inline">
          {" "}
          · {link.original_url}
        </span>
      </td>
      <td className="px-3 py-2 text-xs whitespace-nowrap text-ink-mute">
        {formatDate(link.createdAt)}
      </td>
      <td className="px-3 py-2">
        <ExpiryBadge link={link} />
      </td>
      <td className="px-3 py-2 text-right">
        <DeleteActions label={linkUrl(link)} {...props} />
      </td>
    </tr>
  );
}

function RowMobile(props: RowProps) {
  const { link, copied, onCopy } = props;
  const expired = isExpired(link.expires_at);
  const code = linkUrl(link);
  return (
    <div className="card p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <button
            type="button"
            onClick={onCopy}
            className={`block truncate font-mono text-[13px] font-medium underline-offset-2 hover:underline ${
              expired ? "text-ink-mute line-through" : "text-accent-strong"
            }`}
          >
            {code}
          </button>
          <a
            href={shortUrl(code)}
            target="_blank"
            rel="noreferrer"
            className="mt-0.5 flex items-center gap-1 text-xs text-ink-mute hover:text-ink"
          >
            {link.original_url} <ExternalIcon width={10} height={10} />
          </a>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onCopy}
            className="btn-quiet"
            aria-label={`Copy ${code}`}
          >
            {copied ? (
              <CheckIcon width={15} height={15} className="text-accent-strong" />
            ) : (
              <CopyIcon width={15} height={15} />
            )}
          </button>
          <button
            type="button"
            onClick={props.onQr}
            className="btn-quiet"
            aria-label={`Show QR code for ${code}`}
          >
            <QrCodeIcon width={15} height={15} />
          </button>
          <DeleteActions label={linkUrl(link)} {...props} />
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-2 text-xs text-ink-mute">
        <span>Created {formatDate(link.createdAt)}</span>
        <span aria-hidden>·</span>
        <ExpiryBadge link={link} />
      </div>
    </div>
  );
}

function QrModal({
  link,
  onClose,
}: {
  link: LinkRecord;
  onClose: () => void;
}) {
  const code = linkUrl(link);
  const url = shortUrl(code);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`QR code for ${code}`}
    >
      <button
        type="button"
        aria-label="Close QR code"
        onClick={onClose}
        className="animate-fade absolute inset-0 cursor-default bg-overlay backdrop-blur-[2px]"
      />
      <div className="animate-pop relative flex w-full max-w-xs flex-col items-center gap-3 rounded-xl border border-line bg-surface p-6 text-center shadow-2xl">
        <QRCodeCanvas
          value={url}
          size={176}
          marginSize={2}
          className="rounded-md"
          fgColor="#111113"
          bgColor="#ffffff"
        />
        <div className="min-w-0 w-full">
          <p className="truncate font-mono text-[13px] font-medium text-accent-strong">
            {code}
          </p>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="mt-0.5 flex items-center justify-center gap-1 text-xs text-ink-mute hover:text-ink"
          >
            {hostname(link.original_url)} <ExternalIcon width={10} height={10} />
          </a>
        </div>
        <button
          type="button"
          onClick={() => void copyToClipboard(url)}
          className="btn-quiet w-full"
        >
          <CopyIcon width={14} height={14} />
          Copy link
        </button>
        <button
          type="button"
          onClick={onClose}
          className="btn-quiet"
          aria-label="Close"
        >
          <XIcon width={14} height={14} />
        </button>
      </div>
    </div>
  );
}