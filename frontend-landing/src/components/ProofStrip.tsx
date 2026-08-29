const STATS = [
  { value: "≈0s", label: "link shortens the moment you paste it" },
  { value: "30 days", label: "default auto-expiry, before codes rot" },
  { value: "One 302", label: "redirect per click — nothing in between" },
  { value: "Yours", label: "every link tied to your account, never public" },
];

export function ProofStrip() {
  return (
    <section
      className="border-y border-line bg-surface-2/40 py-10 sm:py-12"
      aria-label="Knot at a glance"
    >
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.value}>
            <p className="display text-2xl text-accent-strong">{stat.value}</p>
            <p className="mt-1.5 max-w-[26ch] text-[13px] leading-relaxed text-ink-mute">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}