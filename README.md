# Knot — short links that hold

Knot is a fast, self-hosted URL shortener with custom aliases, auto-expiry, and
a clean dashboard for your links. One repo: an Express + PostgreSQL API, a React
app, and a full marketing site — all served from a single origin.

## The product

- **Shorten** — paste a long URL, get a short code (`knot.to/abcd12`). Links
  resolve with a plain `302` to the destination.
- **Accounts** — sign in and every link you shorten is saved to *your* dashboard
  (history, copy, open, delete). Sign-out links are not visible to anyone.
- **Custom aliases** — `knot.to/blog` instead of a random code (3–32 chars,
  `a-zA-Z0-9_-`), globally unique.
- **Auto-expiry** — links expire 30 days after creation (6 months for PRO-tier
  users). Expired codes return `410`-style handling and are marked in the UI.
- **Privacy** — links are tied to the creating account and listed only for the
  owner. No analytics, no tracking pixels.

## The marketing site

A real, working marketing presence at `knot.to`:

- `index.html` — hero with a **live shorten client** (it genuinely calls the
  API; when a link needs an account it deep-links into the app with the URL
  pre-filled), "How it works", features grid, and an app preview.
- `features.html` — feature detail pages with honest API-level examples.
- `app.html` — the client-side app (shorten + manage), a SPA under `/app`.
- `public/404.html` — a standalone branded 404 page (also served for dead short
  links, with an `?reason=expired` variant).
- `public/robots.txt`, `public/sitemap.xml`, `public/llms.txt` — real files.
- Open Graph / Twitter meta, canonical URLs, and JSON-LD, all env-injected at
  build time (`__SITE_URL__`, `__OG_IMAGE__`).

## Stack

| Part | Tech |
| --- | --- |
| Backend | Express 5, PostgreSQL (Prisma), JWT cookies, rate limiting |
| Frontend | React 19, Vite 6, Tailwind CSS v4 |
| Brand | Knot — deep pine green accent ("vine"), Inter + Space Grotesk, dark & light |

## Layout

```
backend/   Express API + static serving of the built frontend
frontend/
  index.html       marketing home (Vite entry)
  features.html    marketing features (Vite entry)
  app.html         the app SPA (Vite entry)
  src/
    tokens.css     shared design system (fonts, tokens, components)
    marketing.css  marketing-only helpers
    App.tsx        app shell (sidebar, mobile header)
    components/    Shortener, LinkList, AuthDialog, AppShell, Toast, Icons
    marketing/     hero demo widget + theme toggle
  public/
    fonts/         self-hosted latin-subset woff2
    screens/       app + marketing screenshots (light/dark)
    og.png, apple-touch-icon.png, favicon.svg, robots.txt, sitemap.xml, llms.txt
  scripts/         asset + screenshot generators
  e2e.mjs          end-to-end test
```

## Run it

### 1. Database

```bash
cd backend
cp .env.example .env          # set DATABASE_URL and JWT_SECRET
npx prisma migrate dev        # apply schema migrations
```

### 2. Backend (API)

```bash
cd backend
npm run dev                   # Express on :5000
```

### 3. Frontend dev (hot reload, proxied to :5000)

```bash
cd frontend
npm install
npm run dev                   # Vite on :5173
```

### 4. Production — integrated single origin

```bash
cd frontend && npm run build          # MPA build → frontend/dist
cd backend && SERVE_FRONTEND=true npm run build && npm start
# or, during development:
cd backend && SERVE_FRONTEND=true npm run dev
```

With `SERVE_FRONTEND=true` (or `NODE_ENV=production` when the build exists),
Express serves everything:

| Path | Served by |
| --- | --- |
| `/` | `frontend/dist/index.html` |
| `/features` | `frontend/dist/features.html` |
| `/app`, `/app/*` | `frontend/dist/app.html` (SPA fallback) |
| `/404` | `frontend/dist/404.html` (status 404) |
| `/api/*` | Express API |
| `/:code` | short-link redirect (302), dead links → `/404` |
| `/robots.txt` `/sitemap.xml` `/llms.txt` | static files |

## Brand assets & screenshots

Screenshots and og images are generated (headless Chrome), not hand-drawn:

```bash
cd frontend
npm run assets        # og.png + apple-touch-icon.png → public/
npm run screenshots   # app + marketing shots (needs :5000 running w/ SERVE_FRONTEND) → public/screens/
```

## Tests

```bash
cd frontend
node e2e.mjs
```

The e2e runs against the integrated stack on `:5000` and covers: marketing
pages, robots/sitemap/llms, the branded 404 (and dead-short-link routing to it),
marketing → app deep-link prefill, sign-up + pending shorten, `302` redirect
verification, clipboard, validation, custom aliases, history, delete, sign-out,
and a console-error guard.

## API

- `GET /api` — API root listing
- `GET /api/links/health` — health check
- `POST /api/links/` — create a short link `{ url, custom_alias? }` (auth required)
- `POST /api/auth/register` | `login` | `logout`
- `GET /api/links/my-links` — your links (auth)
- `DELETE /api/links/:id` — delete one of your links (auth)

## Environment

See `frontend/.env.example` (`VITE_SITE_URL`, `VITE_APP_URL`, `VITE_SHORT_BASE`,
`VITE_API_BASE`) and `backend/.env.example` (`PORT`, `DATABASE_URL`,
`JWT_SECRET`, `SERVE_FRONTEND`, `APP_DOMAIN`).
