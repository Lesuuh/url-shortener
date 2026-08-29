import { useState } from "react";
import { APP_URL } from "../config";
import { SectionHead } from "./SectionHead";
import { ArrowRightIcon, CheckIcon } from "./icons";

type Billing = "monthly" | "annual";

interface Plan {
  name: string;
  tagline: string;
  monthly: number;
  annual: number;
  featured?: boolean;
  priceNote: string;
  cta: string;
  features: string[];
}

const PLANS: Plan[] = [
  {
    name: "Free",
    tagline: "For the occasional link",
    monthly: 0,
    annual: 0,
    priceNote: "free — no trial, no card",
    cta: "Start free",
    features: [
      "Guest links, no account needed",
      "Random short codes",
      "30-day auto-expiry",
      "Delete anytime",
    ],
  },
  {
    name: "Pro",
    tagline: "For people who shorten all day",
    monthly: 6,
    annual: 5,
    featured: true,
    priceNote: "billed $60 a year",
    cta: "Go Pro",
    features: [
      "Custom aliases — knot.to/blog",
      "Links saved to your dashboard",
      "Longer expiry, up to 1 year",
      "Copy, open & delete from one screen",
      "Export your links (CSV)",
    ],
  },
  {
    name: "Self-hosted",
    tagline: "Your server, your data",
    monthly: 0,
    annual: 0,
    priceNote: "free, forever — bring your own server",
    cta: "Open the app",
    features: [
      "Everything in Pro",
      "Run it on your own infrastructure",
      "Docker + PostgreSQL",
      "Full ownership of link data",
      "No limits, no vendor lock-in",
    ],
  },
];

export function PricingTable() {
  const [billing, setBilling] = useState<Billing>("annual");

  return (
    <section className="border-t border-line py-20 sm:py-24">
      <SectionHead eyebrow="Pricing" title="Pricing that stays out of the way">
        Start free, upgrade when you want a longer leash, or self-host and keep
        everything yours.
      </SectionHead>

      <div className="mt-8 flex justify-center">
        <div className="inline-flex items-center rounded-full border border-line bg-surface p-1">
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            aria-pressed={billing === "monthly"}
            className={
              billing === "monthly"
                ? "rounded-full bg-accent px-3.5 py-1 text-xs font-semibold text-accent-contrast"
                : "rounded-full px-3.5 py-1 text-xs font-medium text-ink-mute transition hover:text-ink"
            }
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBilling("annual")}
            aria-pressed={billing === "annual"}
            className={
              billing === "annual"
                ? "rounded-full bg-accent px-3.5 py-1 text-xs font-semibold text-accent-contrast"
                : "rounded-full px-3.5 py-1 text-xs font-medium text-ink-mute transition hover:text-ink"
            }
          >
            Annual{" "}
            <span className="ml-0.5 text-[10px] opacity-80">−17%</span>
          </button>
        </div>
      </div>

      <div className="mx-auto mt-8 grid max-w-6xl items-stretch gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const featured = plan.featured === true;
          const perMonth = billing === "monthly" ? plan.monthly : plan.annual;
          const price = perMonth === 0 ? "$0" : `$${perMonth}`;
          return (
            <div
              key={plan.name}
              className={
                featured
                  ? "card relative -my-3 flex flex-col p-7 shadow-md ring-2 ring-accent-strong lg:-my-3 lg:py-10"
                  : "card relative flex flex-col p-7"
              }
            >
              {featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-accent-contrast uppercase">
                  Most popular
                </span>
              )}
              <h3 className="text-sm font-bold">{plan.name}</h3>
              <p className="mt-1 text-[12px] text-ink-mute">{plan.tagline}</p>

              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="display text-4xl">{price}</span>
                <span className="text-sm text-ink-mute">
                  {perMonth === 0 ? "" : "/mo"}
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-mute">{plan.priceNote}</p>

              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-[13px] text-ink-soft"
                  >
                    <CheckIcon
                      width={14}
                      height={14}
                      className="mt-0.5 shrink-0 text-accent-strong"
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href={APP_URL}
                className={
                  featured
                    ? "btn-primary mt-7 h-10 w-full px-5 text-sm"
                    : "btn-ghost mt-7 h-10 w-full px-5 text-sm"
                }
              >
                {plan.cta}
                <ArrowRightIcon width={14} height={14} />
              </a>
            </div>
          );
        })}
      </div>

      <p className="mt-10 text-center text-xs text-ink-mute">
        Unlimited redirects on every plan. No ads, no tracking, ever.
      </p>
    </section>
  );
}