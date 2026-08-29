import { Link } from "react-router";
import type { ReactNode } from "react";
import { APP_URL } from "../config";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import {
  CodeSample,
  Comment,
  MarketingFeature,
} from "../components/MarketingFeature";
import { BoltIcon } from "../components/icons";

function Key({ children }: { children: ReactNode }) {
  return <span className="text-accent-strong">{children}</span>;
}

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

export function HowItWorksPage() {
  return (
    <div className="bg-page font-sans text-ink antialiased">
      <Header />

      <main>
        <section className="py-16 sm:py-20">
          <div className="section-head">
            <span className="eyebrow">How it works</span>
            <h1 className="display mt-4 text-balance text-3xl leading-tight sm:text-5xl">
              Shorten a link in three steps.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">
              Paste, copy, share. Knot keeps the mechanics simple so the links
              stay honest.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="grid gap-5 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.n} className="card flex flex-col gap-3 p-5">
                <span className="flex size-8 items-center justify-center rounded-md bg-accent-soft font-display text-sm font-bold text-accent-strong">
                  {step.n}
                </span>
                <h2 className="text-sm font-bold">{step.title}</h2>
                <p className="text-[13px] leading-relaxed text-ink-soft">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <MarketingFeature
            icon={<BoltIcon width={20} height={20} />}
            title="What happens under the hood"
            description={
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                Shortening a link creates one row and one short code. Following
                that code is a plain HTTP 302 to your destination — no tracker,
                no interstitial — until the expiry passes and it becomes 410
                Gone.
              </p>
            }
            example={
              <CodeSample>
                <Comment># shorten — returns the code instantly</Comment>
                <p>
                  <span className="text-ink-mute">POST /api/links</span> →{" "}
                  <Key>knot.to/abcd12</Key>
                </p>
                <Comment># follow within 30 days</Comment>
                <p className="text-ink-mute">
                  HTTP/1.1 <Key>302 Found</Key> → Location: your URL
                </p>
                <Comment># follow after expiry</Comment>
                <p className="text-ink-mute">
                  HTTP/1.1 <Key>410 Gone</Key> — expires_at has passed
                </p>
                <Comment># delete — the code stops resolving</Comment>
                <p className="text-ink-mute">
                  DELETE /api/links/:id → <Key>200</Key> "deleted"
                </p>
              </CodeSample>
            }
          />
        </section>

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