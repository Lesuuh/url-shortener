import type { ReactNode } from "react";

export interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: Feature) {
  return (
    <div className="feature-card">
      <span className="flex size-9 items-center justify-center rounded-md bg-accent-soft text-accent-strong">
        {icon}
      </span>
      <h3 className="text-sm font-bold">{title}</h3>
      <p className="text-[13px] leading-relaxed text-ink-soft">{description}</p>
    </div>
  );
}