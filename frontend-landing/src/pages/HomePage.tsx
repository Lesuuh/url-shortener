import { Link } from "react-router";
import { APP_URL } from "../config";
import { FeatureCard, type Feature } from "../components/FeatureCard";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { HeroDemo } from "../components/HeroDemo";
import { HeroExample } from "../components/HeroExample";
import { ProofStrip } from "../components/ProofStrip";
import { Testimonials } from "../components/Testimonials";
import { PricingTable } from "../components/PricingTable";
import { Faq } from "../components/Faq";
import { SectionHead } from "../components/SectionHead";
import {
  BoltIcon,
  ClockIcon,
  HouseIcon,
  LockIcon,
  TrashIcon,
  WandIcon,
} from "../components/icons";

const STEPS = [
  {
    n: "1",
    title: "Paste a long URL",
    body: "Any link with lots of query parameters, tracking junk, or nesting. Knot handles http and https.",
  },
  {
    n: "2",
    title: "Get a knot.to code",
    body: "A short code is generated instantly in the app. Visitors follow it and land exactly where you meant.",
  },
  {
    n: "3",
    title: "Share, manage, delete",
    body: "Copy it into chats and emails. Sign in to give it a custom alias, watch it expire, or delete it whenever.",
  },
];

const FEATURES: Feature[] = [
  {
    icon: <WandIcon width={18} height={18} />,
    title: "Custom aliases",
    description:
      "Replace random codes with your own words — knot.to/blog — as long as they’re not already taken.",
  },
  {
    icon: <ClockIcon width={18} height={18} />,
    title: "Auto-expiry",
    description:
      "Links expire after 30 days by default, so short codes can’t rot forever or point at dead content.",
  },
  {
    icon: <HouseIcon width={18} height={18} />,
    title: "Your links, saved",
    description:
      "Sign in and every link you shorten lands in your own dashboard, ready to copy or remove.",
  },
  {
    icon: <BoltIcon width={18} height={18} />,
    title: "Fast redirects",
    description:
      "Short links resolve with a simple 302. No interstitial pages, no waiting screens.",
  },
  {
    icon: <TrashIcon width={18} height={18} />,
    title: "Delete & manage",
    description:
      "Expired or unwanted links are one click away from gone. You own every code you create.",
  },
  {
    icon: <LockIcon width={18} height={18} />,
    title: "Private by default",
    description:
      "Your links are tied to your account and visible only to you. Anonymous links exist without a trace back.",
  },
];

export function HomePage() {
  return (
    <div className="bg-page font-sans text-ink antialiased">
      <Header />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="dot-grid pointer-events-none absolute inset-0 -z-10"></div>
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-2 lg:pt-24">
            <div>
              <span className="eyebrow">
                <span className="size-1.5 rounded-full bg-accent" aria-hidden></span>
                URL shortener for people who ship
              </span>
              <h1 className="display mt-6 text-balance text-4xl leading-[1.05] sm:text-5xl lg:text-[3.6rem]">
                Short links
                <br />
                that <span className="text-accent-strong">hold</span>.
              </h1>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-soft">
                Knot turns long, ugly URLs into short ones you can share without
                the paste-noise. Fast redirects, custom aliases, auto-expiry, and
                a dashboard that keeps your links tidy.
              </p>

              <div className="mt-8 max-w-md">
                <HeroDemo />
              </div>
              <p className="mt-3 text-[13px] text-ink-mute">
                Paste a link above and we’ll carry it into the app, ready to
                shorten — your link gets saved to your account.
              </p>
            </div>

            <HeroExample />
          </div>
        </section>

        <ProofStrip />

        {/* Why */}
        <section className="py-14 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="card border-accent-soft bg-accent-soft/50 px-6 py-12 text-center sm:px-12 sm:py-16">
              <span className="eyebrow">Why it matters</span>
              <h2 className="display mx-auto mt-4 max-w-2xl text-balance text-2xl sm:text-3xl">
                Long URLs are noise.{" "}
                <span className="text-accent-strong">
                  Your short link is a decision.
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">
                Query strings bury where someone is actually going. Knot gives
                you a link you can read, type, and trust — one that expires
                before it turns stale, and never sends your visitors through a
                tracker.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-24 py-20 sm:py-24">
          <SectionHead eyebrow="How it works" title="Three steps. Ten seconds.">
            Paste your link on this page and we carry it into the app. Sign in
            once, and every link you shorten is saved to your account.
          </SectionHead>

          <div className="mx-auto mt-12 grid max-w-6xl gap-5 px-4 sm:grid-cols-3 sm:px-6">
            {STEPS.map((step) => (
              <div key={step.n} className="card flex flex-col gap-3 p-5">
                <span className="flex size-8 items-center justify-center rounded-md bg-accent-soft font-display text-sm font-bold text-accent-strong">
                  {step.n}
                </span>
                <h3 className="text-sm font-bold">{step.title}</h3>
                <p className="text-[13px] leading-relaxed text-ink-soft">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="scroll-mt-24 border-y border-line bg-surface-2/50 py-20 sm:py-24"
        >
          <SectionHead eyebrow="Features" title="Everything you need to shorten links">
            Knot stays focused: a small, fast tool that does the job properly.
            No ads, no tracking pixels, no bloat.
          </SectionHead>

          <div className="mx-auto mt-12 grid max-w-6xl gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link to="/features" className="btn-ghost h-9 px-4">
              More about the details
            </Link>
          </div>
        </section>

        {/* App preview */}
        <section id="app" className="scroll-mt-24 py-20 sm:py-24">
          <SectionHead eyebrow="The app" title="Your links, in one place">
            A single screen: shorten at the top, your history below. Custom
            aliases, copy, open, and delete — no hunting around.
          </SectionHead>

          <div className="mx-auto mt-12 max-w-5xl px-4 sm:px-6">
            <div className="card overflow-hidden shadow-sm">
              <picture>
                <source
                  srcSet="/screens/app-dark.png"
                  media="(prefers-color-scheme: dark)"
                />
                <img
                  src="/screens/app-light.png"
                  alt="Knot app dashboard: a shorten box at the top and a list of your links below"
                  width="2880"
                  height="1800"
                  loading="lazy"
                  className="block w-full"
                />
              </picture>
            </div>
            <p className="mt-3 text-center text-xs text-ink-mute">
              The Knot dashboard — shorten, copy, open, delete.
            </p>
            <div className="mt-6 text-center">
              <a href={APP_URL} className="btn-primary h-10 px-5 text-sm">
                Open the app
              </a>
            </div>
          </div>
        </section>

        <Testimonials />
        <PricingTable />
        <Faq />

        {/* CTA */}
        <section className="pb-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="card relative overflow-hidden p-10 text-center sm:p-14">
              <div
                className="dot-grid pointer-events-none absolute inset-0 -z-10"
                aria-hidden="true"
              ></div>
              <h2 className="display mx-auto max-w-xl text-balance text-3xl sm:text-4xl">
                Shorten your first link. It takes seconds.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
                Open the app, paste a link, and it’s shortened and saved to your
                account. Sign-up is quick and free.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <a href={APP_URL} className="btn-primary h-10 px-5 text-sm">
                  Open the app
                </a>
                <Link to="/features" className="btn-ghost h-10 px-5 text-sm">
                  See all features
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}