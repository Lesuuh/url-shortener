import type { ReactNode } from "react";

/** A muted comment/annotation line inside a feature code sample. */
function Comment({ children }: { children: ReactNode }) {
  return <p className="text-ink-mute">{children}</p>;
}

export function CodeSample({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-surface-2/60 p-4 font-mono text-[12px] leading-7">
      {children}
    </div>
  );
}

export { Comment };

export function MarketingFeature({
  icon,
  title,
  description,
  example,
}: {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  example?: ReactNode;
}) {
  return (
    <div className="card grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center">
      <div>
        <span className="flex size-10 items-center justify-center rounded-lg bg-accent-soft text-accent-strong">
          {icon}
        </span>
        <h2 className="mt-4 text-lg font-bold">{title}</h2>
        {description}
      </div>
      {example}
    </div>
  );
}