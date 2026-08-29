import type { ReactNode } from "react";

export function SectionHead({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-head">
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="display mt-4 text-balance text-3xl sm:text-4xl">{title}</h2>
      {children && (
        <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-ink-soft">
          {children}
        </p>
      )}
    </div>
  );
}