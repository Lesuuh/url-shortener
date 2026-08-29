import { SectionHead } from "./SectionHead";

const TESTIMONIALS = [
  {
    initials: "AO",
    name: "Ayo O.",
    role: "Indie developer",
    quote:
      "I self-hosted Knot on a spare VPS in an evening. The links resolve instantly and nothing phones home about the people clicking them.",
  },
  {
    initials: "MK",
    name: "Milan K.",
    role: "Open-source maintainer",
    quote:
      "The 30-day expiry is the killer feature. We stopped maintaining a graveyard of dead short links scattered across our docs and changelogs.",
  },
  {
    initials: "RW",
    name: "Ruth W.",
    role: "Product designer",
    quote:
      "No ads, no tracking pixels, no “optimized” redirect pages. Just a short link that takes you exactly where it says. That’s the whole job.",
  },
];

export function Testimonials() {
  return (
    <section className="border-t border-line py-20 sm:py-24">
      <SectionHead eyebrow="Testimonials" title="Trusted by people who shorten links all day">
        Teams, indie developers, and busy support pages rely on short links that behave.
      </SectionHead>

      <div className="mx-auto mt-12 grid max-w-6xl gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure key={t.name} className="card flex flex-col p-6">
            <span
              className="font-display text-4xl leading-none text-accent-strong select-none"
              aria-hidden="true"
            >
              “
            </span>
            <blockquote className="mt-2 text-sm leading-relaxed text-ink-soft">
              {t.quote}
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
              <span className="flex size-9 items-center justify-center rounded-full bg-accent-soft text-[12px] font-bold text-accent-strong">
                {t.initials}
              </span>
              <div>
                <p className="text-[13px] font-semibold">{t.name}</p>
                <p className="text-xs text-ink-mute">{t.role}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}