import { useState } from "react";
import { SectionHead } from "./SectionHead";
import { ChevronDownIcon } from "./icons";

const FAQS = [
  {
    q: "How is Knot different from a typical URL shortener?",
    a: "Knot shortens links and stops there. There are no click-tracking interstitials, ad walls, or analytics waiting on your visitors, and links expire by default so short codes can’t linger forever pointing at dead pages.",
  },
  {
    q: "Do I need an account to shorten a link?",
    a: "No. Guest links shorten instantly with a random code and last 30 days. Sign in and every link you make is saved to your dashboard, where you can set custom aliases and extend expiry.",
  },
  {
    q: "What happens when a link expires?",
    a: "It stops resolving — following the code after its expiry returns 410 Gone — and it shows up as expired in your dashboard, where you can delete it in one click.",
  },
  {
    q: "Can I host Knot myself?",
    a: "Yes. Knot is built to be self-hosted: run the container, point it at a PostgreSQL database, and the links and the data are yours. No license walls and no feature gates on the self-hosted plan.",
  },
  {
    q: "Does Knot track my visitors?",
    a: "No. Short links are plain HTTP 302 redirects. Knot doesn’t embed tracking pixels, ads, or analytics on your links or anywhere in the redirect path.",
  },
  {
    q: "Is there an API I can build against?",
    a: "Yes. The backend is an Express REST API — the same endpoints the app uses — for health checks, links, and auth. The API root and health endpoint are linked in the footer.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="border-t border-line py-20 sm:py-24">
      <SectionHead eyebrow="FAQ" title="Frequently asked questions">
        The short answers. For anything else, the app itself is a good place to start.
      </SectionHead>

      <div className="mx-auto mt-12 max-w-3xl px-4 sm:px-6">
        <div className="card divide-y divide-line overflow-hidden">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q}>
                <h3>
                  <button
                    type="button"
                    id={`faq-button-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold transition hover:text-ink"
                  >
                    {item.q}
                    <ChevronDownIcon
                      width={16}
                      height={16}
                      className={
                        isOpen
                          ? "shrink-0 rotate-180 text-accent-strong transition-transform"
                          : "shrink-0 text-ink-mute transition-transform"
                      }
                    />
                  </button>
                </h3>
                <div
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-button-${i}`}
                  hidden={!isOpen}
                  className="px-5 pb-5 text-[13px] leading-relaxed text-ink-soft"
                >
                  {item.a}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}