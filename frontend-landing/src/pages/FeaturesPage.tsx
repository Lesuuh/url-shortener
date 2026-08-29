import { Link } from "react-router";
import type { ReactNode } from "react";
import { APP_URL } from "../config";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import {
  BoltIcon,
  ClockIcon,
  HouseIcon,
  LockIcon,
  TrashIcon,
  WandIcon,
} from "../components/icons";
import {
  CodeSample,
  Comment,
  MarketingFeature,
} from "../components/MarketingFeature";

function Key({ children }: { children: ReactNode }) {
  return <span className="text-accent-strong">{children}</span>;
}

export function FeaturesPage() {
  return (
    <div className="bg-page font-sans text-ink antialiased">
      <Header />

      <main>
        <section className="py-16 sm:py-20">
          <div className="section-head">
            <span className="eyebrow">Features</span>
            <h1 className="display mt-4 text-balance text-3xl leading-tight sm:text-5xl">
              Small tool. Proper job.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">
              Knot doesn’t try to be everything. It shortens links well, keeps
              them yours, and gets out of the way. Here’s exactly what that means.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl space-y-6 px-4 pb-20 sm:px-6">
          <MarketingFeature
            icon={<WandIcon width={20} height={20} />}
            title="Custom aliases"
            description={
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                Want a link that says what it means? Set an alias and your short
                link becomes{" "}
                <span className="font-mono text-[13px]">knot.to/blog</span>
                instead of a random code.
              </p>
            }
            example={
              <CodeSample>
                <Comment>// optional — skip it for a random code</Comment>
                <p>
                  <span className="text-ink-mute">url</span>:{" "}
                  <Key>https://example.com/…</Key>
                </p>
                <p>
                  <span className="text-ink-mute">custom_alias</span>:{" "}
                  <Key>blog</Key>
                </p>
                <p className="mt-2 text-ink-mute">
                  → <Key>knot.to/blog</Key>
                </p>
                <Comment>// 3–32 chars · letters, numbers, “-” and “_”</Comment>
              </CodeSample>
            }
          />

          <MarketingFeature
            icon={<ClockIcon width={20} height={20} />}
            title="Auto-expiry"
            description={
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                Every link carries an expiry date. By default it’s 30 days out,
                so short codes never linger forever, pointing at content that’s
                long gone.
              </p>
            }
            example={
              <CodeSample>
                <p>
                  <span className="text-ink-mute">expires_at</span>:{" "}
                  <Key>2026-09-12T10:00:00Z</Key>
                </p>
                <Comment>// after this, following the code returns 410 Gone</Comment>
                <p className="mt-2">
                  <span className="text-ink-mute">follows before expiry</span>:{" "}
                  <Key>302 → original URL</Key>
                </p>
                <Comment>
                  // follow after expiry: marked expired in your dashboard
                </Comment>
              </CodeSample>
            }
          />

          <MarketingFeature
            icon={<HouseIcon width={20} height={20} />}
            title="Your links, saved"
            description={
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                Create a free account and every link you shorten lands in your
                own dashboard. Copy, open, or clean them up from one screen.
              </p>
            }
            example={
              <CodeSample>
                <Comment>// your dashboard</Comment>
                <p>
                  <Key>knot.to/abcd12</Key>{" "}
                  <span className="text-ink-mute">
                    → example.com/docs …exp 12 Sep
                  </span>
                </p>
                <p>
                  <Key>knot.to/blog</Key>{" "}
                  <span className="text-ink-mute">
                    → example.com/blog …exp 02 Aug
                  </span>
                </p>
                <p className="mt-2 text-ink-mute">// copy · open · delete</p>
              </CodeSample>
            }
          />

          <MarketingFeature
            icon={<BoltIcon width={20} height={20} />}
            title="Fast redirects"
            description={
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                Following a short link is a single HTTP 302 to the destination.
                No click-tracking interstitials, no waiting screens, nothing in
                the way.
              </p>
            }
            example={
              <CodeSample>
                <Comment>$ curl -I https://knot.to/abcd12</Comment>
                <p className="text-ink-mute">
                  HTTP/1.1 <Key>302 Found</Key>
                </p>
                <p className="text-ink-mute">
                  Location: <Key>https://example.com/…</Key>
                </p>
                <Comment>// that’s it — straight to your link</Comment>
              </CodeSample>
            }
          />

          <MarketingFeature
            icon={<TrashIcon width={20} height={20} />}
            title="Delete & manage"
            description={
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                Unwanted or expired links disappear in one click. Deleting a
                link also removes its short code, so it stops resolving
                immediately.
              </p>
            }
            example={
              <CodeSample>
                <Comment>DELETE /api/links/:id</Comment>
                <p className="text-ink-mute">
                  → <Key>200 "Link deleted successfully"</Key>
                </p>
                <Comment>// the code no longer resolves</Comment>
                <Comment>// unauthenticated delete is rejected with 401</Comment>
              </CodeSample>
            }
          />

          <MarketingFeature
            icon={<LockIcon width={20} height={20} />}
            title="Private by default"
            description={
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                Links created while signed in belong to your account and are
                listed only for you. Nothing is public, nothing is shared,
                nothing leaks back to us.
              </p>
            }
            example={
              <CodeSample>
                <Comment>// ownership is enforced server-side</Comment>
                <p>
                  <span className="text-ink-mute">user_id</span>:{" "}
                  <Key>from JWT, never from the client</Key>
                </p>
                <Comment>
                  // your links list only ever returns your own rows
                </Comment>
                <Comment>
                  // no analytics, no tracking pixels, no cookies from us
                </Comment>
              </CodeSample>
            }
          />
        </section>

        <section className="pb-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="card relative overflow-hidden p-10 text-center sm:p-14">
              <h2 className="display mx-auto max-w-xl text-balance text-3xl sm:text-4xl">
                Shorten your first link. It takes seconds.
              </h2>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <a href={APP_URL} className="btn-primary h-10 px-5 text-sm">
                  Open the app
                </a>
                <Link to="/" className="btn-ghost h-10 px-5 text-sm">
                  Back to home
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