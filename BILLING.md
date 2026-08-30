# Knot Billing — Implementation Checklist

Locked decisions: **Paystack** · **NGN** · **3-month pass (₦7,500 one-time, no auto-renew)** · Pro gates = **custom aliases + longer link expiry + CSV export**.

Facts you'll need constantly:

- Paystack base: `https://api.paystack.co`, header `Authorization: Bearer <sk_test_...>`
- Amounts are in **kobo**: ₦7,500 = `750_000`
- Test card: `4084 0840 8408 4081` (success), `5060 6600 0000 0000` (PIN), `5078 5000 0000 0002` (OTP)
- No new npm dependency needed — Node 22 has global `fetch`.

---

## Phase 1 — Backend: data model

- [ ] **1. Edit `backend/prisma/schema.prisma`**
  - Add to `User`: `pro_expires_at DateTime?` and a `payments Payment[]` relation.
  - Add below `UserTier`:

```prisma
enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
}

model Payment {
  id          String        @id @default(cuid())
  user_id     String
  user        User          @relation(fields: [user_id], references: [id], onDelete: Cascade)
  provider    String        @default("paystack")
  reference   String        @unique
  amount      Int           // kobo
  currency    String        @default("NGN")
  status      PaymentStatus @default(PENDING)
  periodStart DateTime?
  periodEnd   DateTime?
  createdAt   DateTime      @default(now())

  @@index([user_id])
}
```

- [ ] **2. Env config** — add to `backend/.env` and `backend/.env.example`:

```
PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_PUBLIC_KEY=pk_test_xxx
FRONTEND_URL=http://localhost:5173
PRO_PRICE_KOBO=750000
PRO_CURRENCY=NGN
PRO_DURATION_MONTHS=3
```

- [ ] **3. Migrate** (from `backend/`):

```
npx prisma migrate dev --name add_billing
```

This also regenerates the client into `src/generated/prisma`. Verify you can `import prisma` and see `payment` in the client.

---

## Phase 2 — Backend: Paystack service

- [ ] **4. Create `backend/src/services/billing.service.ts`**
  - `getProConfig()` — read `PRO_PRICE_KOBO`/`PRO_CURRENCY`/`PRO_DURATION_MONTHS`.
  - `createCheckout(user)`:
    - Generate unique `reference` (`knot-<cuid or random>`; max 128 chars, alphanum + `-_.`).
    - `POST /transaction/initialize` → body `{ email, amount, currency, reference, callback_url, metadata: { user_id } }`; callback_url = `${FRONTEND_URL}/app/billing/callback`.
    - Insert a `Payment` row `PENDING` (idempotent guard: `reference` is `@unique`).
    - Return `{ authorization_url, reference }`.
  - `verifyAndActivate(userId, reference)`:
    - `GET /transaction/verify/:reference`.
    - If **not** `"success"` → update Payment to `FAILED`/`ABANDONED`, return status.
    - If success → call `applyProGrant` **inside a `prisma.$transaction`** that first checks the Payment `status` is still not `SUCCESS` (prevents double-grant on webhook+callback race), then update Payment → `SUCCESS`, and set user: `tier: "PRO"`, `pro_expires_at = later(now, user.pro_expires_at) + 3 months` (renewals stack).
  - `applyProGrant` — shared by callback + webhook.
  - `syncTier(userId)` — lazy downgrade: if `tier === "PRO" && pro_expires_at <= now`, set `BASIC`. Call from `/me` and link creation.
  - `verifyWebhookSignature(rawBody, signature)` — HMAC **sha512** of the raw body with `PAYSTACK_SECRET_KEY`, compare via `crypto.timingSafeEqual`.
  - `handleWebhook(event)` — on `charge.success`: find Payment by `data.reference`, `syncTier` + `applyProGrant` if amount matches `PRO_PRICE_KOBO`.

- [ ] **5. Webhook gotcha (important):** `backend/src/app.ts` runs global `app.use(express.json())`, which consumes the raw body you need for the HMAC. Change it to:

```ts
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf.toString("utf8");
    },
  }),
);
```

Webhook handler then signs `req.rawBody`. (In dev, Paystack can't reach `localhost` — the callback-verify path is your primary flow; webhook is for production.)

---

## Phase 3 — Backend: routes + wiring

- [ ] **6. Create `backend/src/routes/billing.routes.ts` + `controllers/billing.controller.ts`**
  - `POST /checkout` (requireAuth) → `createCheckout` → `{ authorization_url, reference }`. Wrap in `authLimit`.
  - `GET /callback?reference=...` (requireAuth) → `verifyAndActivate` → `{ status, user? }`.
  - `POST /webhook` (no auth — signature-verified, `express.json` with the `verify` hook above) → respond `200` fast; ALWAYS return `200` to Paystack.

- [ ] **7. Wire in `backend/src/app.ts`** — mount `app.use("/api/billing", globalRateLimit, billingRoutes);` (put `/webhook` on the raw-body parser if you go the separate-router route) and add the new endpoints to the `/api` text listing.

---

## Phase 4 — Backend: auth payload + security fix

- [ ] **8. `backend/src/services/auth.service.ts`** — add to `AuthResult.user`: `tier` and `proExpiresAt` (read from the Prisma user in `register` and `login`). Run `syncTier` in `login`/`getMe` so expired PRO reflects immediately.

- [ ] **9. `backend/src/controllers/auth.controller.ts`** — `meController` currently returns the full Prisma user **including `password_hash`**. Build a `publicUser()` helper (id, name, email, tier, proExpiresAt, createdAt) and use it in register/login/me.

---

## Phase 5 — Backend: gating

- [ ] **10. `backend/src/services/link.service.ts`** — in `createLink`:
  - Call `syncTier(user_id)` after fetching the user.
  - **Custom alias gate:** if `custom_alias` is set and `user.tier !== UserTier.PRO` → `throw new Error("PRO_REQUIRED")`.
  - Expiry stays: PRO → +6 months, BASIC → +1 month (already implemented around line 20).

- [ ] **11. `backend/src/controllers/link.controller.ts`** — catch `PRO_REQUIRED` → `res.status(403).json({ error: "Custom aliases are a Pro feature." })`. Keep `500` for everything else.

✅ **Backend done.** Test with curl: register → login (cookie) → `POST /api/billing/checkout` → open `authorization_url` → Paystack test card → redirected to `/app/billing/callback?reference=...` → confirm `tier: "PRO"` on `/api/auth/me`, and that a non-PRO alias creation returns 403.

---

## Phase 6 — Frontend app: plumbing

- [ ] **12. `frontend-app/src/types.ts`**
  - `User`: add `proExpiresAt: string | null`. **Remove `password_hash`** (it was only there because the API leaked it).

- [ ] **13. `frontend-app/src/lib/api.ts`**
  - Add `billingCheckout()` → `POST /billing/checkout` → `{ authorization_url, reference }`.
  - Add `billingVerify(reference)` → `GET /billing/callback?reference=...` → `{ status, user? }`.
  - (Pre-existing bug while you're here: `updateProfile` calls `/users/me` but the route is `PATCH /auth/me` — fix it.)

- [ ] **14. `frontend-app/src/components/BillingPage.tsx`** (new)
  - **Plan card**: current status — `user.tier` + `proExpiresAt` formatted (`lib/format.ts` has `formatDate`); "expires <date>" when PRO.
  - **2 pricing cards** (Basic free / Pro ₦7,500 for 3 months) mirroring the landing page.
  - **Upgrade flow**: Pro card button → `billingCheckout()` → `window.location.href = authorization_url`.
  - **Callback state**: read `reference` from `?reference=` search param → `billingVerify` → show success / abandoned (failed) state → on success, `setUser(await api.me())` so all gates re-evaluate immediately → "Back to dashboard" link.
  - Loading, error, and "verifying…" UI states with existing `card`/`btn-primary`/`SpinnerIcon` classes and `useToast`.

- [ ] **15. `frontend-app/src/App.tsx`** — add inside `<RequireAuth>`: `<Route path="/billing" element={<BillingPage />} />` and `<Route path="/billing/callback" element={<BillingPage />} />`.

- [ ] **16. `frontend-app/src/components/AppShell.tsx`**
  - Add a "Billing" `NavLink` under `Manage` (next to Settings, ~line 70) → `/billing`.
  - In `AccountMenu`, next to the user's name (~line 163), render a small `PRO` pill when `user.tier === "PRO"`.

- [ ] **17. `frontend-app/src/components/SettingsPage.tsx`** — replace the "coming soon" toast (~line 56):
  - BASIC → `Link to="/billing"` "Upgrade to Pro".
  - PRO → keep "Already Pro" and add `· active until <formatDate(user.proExpiresAt)>` to the plan copy.

---

## Phase 7 — Frontend app: gating the UI

- [ ] **18. `frontend-app/src/components/Shortener.tsx`** — gate alias by tier:
  - BASIC → clicking "Custom alias" (~line 189) shows a locked row: lock icon + "Custom aliases are a Pro feature" + `Link to="/billing"`. Disable the input.
  - PRO → current behavior unchanged.

- [ ] **19. `frontend-app/src/components/LinkList.tsx`** — gate CSV export (~line 199):
  - If `user.tier !== "PRO"` → hide the button and show a lock/upgrade affordance (e.g. `Link to="/billing"` "Export is Pro"), or keep the button but intercept → navigate to `/billing` + toast.

---

## Phase 8 — Landing

- [ ] **20. `frontend-landing/src/components/PricingTable.tsx`** — rewrite `PLANS` to **two** (drop Self-hosted + the Monthly/Annual toggle):
  - **Basic** — free, current features (random codes, 30-day expiry, delete anytime).
  - **Pro** — featured card: **₦7,500 for 3 months** (one-time, paid via Paystack, renew to keep going), features = custom aliases, links saved to dashboard, 6-month expiry, copy/open/delete, CSV export. CTA → `APP_URL`.
  - Update `SectionHead` copy + footnote; remove the `billing` state type.

---

## Phase 9 — Verify

- [ ] **21.** From repo root: `npm run typecheck`; build backend (`tsc` or your `tsx` build), `npm run build:app` and `npm run build:landing`. Every frontend `npm run build` runs type-checking for them.
- [ ] **22. Manual test pass** (test mode): register `test@example.com` → checkout (test card) → callback lands on `PRO` → confirm a 6-month link + alias works + CSV exports → confirm BASIC alias creation is blocked with 403 → confirm `/me` has no `password_hash`.
