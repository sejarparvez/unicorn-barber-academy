# Project Audit & Fix Plan

**Project:** Unicorn Barber Training Academy (TanStack Start + React 19 + Tailwind v4 + Prisma next RC + better-auth)
**Date:** 2026-08-21
**Static checks at time of audit:** Biome lint ✅ clean · TypeScript ❌ 1 error

---

## Decisions

| Topic | Decision |
|---|---|
| Auth stack | **Wire up properly** (mount handler, auth client, real signin/signup pages) |
| Fix scope | **Everything** (critical + medium + low) |
| Enroll page | **Strip to placeholder** ("This is the enroll page") — full redesign happens later; keep `/api/enroll` route file untouched for reuse |
| Contact form | Wire to a real `/api/contact` endpoint (validate → log pattern, no DB yet) |

---

## Phase 1 — Critical correctness

- [x] **1.1 Fix TypeScript build error — dead program link** ✅ 2026-08-21
  - `src/components/pages/home/hero.tsx:75`
  - `to="/programs/barbering"` → slug doesn't exist (real slugs: `classic-barbering`, `fades-and-tapers`, `beard-sculpting`, `cosmetology-fundamentals`, `hair-styling-and-colouring`, `bridal-and-editorial-makeup`) → guaranteed 404.
  - **Fix:** repoint to `/programs/classic-barbering` or `/programs`.
  - *Acceptance: `bun x tsc --noEmit` passes.*

- [x] **1.2 Consolidate production domains** ✅ 2026-08-21
  - Three different domains hardcoded:
    - `https://unicornbarberacademy.com` — `src/lib/site-data.ts:1`
    - `https://unicornbta.com` — header JSON-LD (`header/index.tsx:19`), footer JSON-LD (`footer/index.tsx:22`)
    - `https://unicornbarbertrainingacademy.com` — homepage local const (`routes/index.tsx:15`, used by canonical line 39 + og:url line 36)
  - Canonical URLs and structured data contradict each other per page → split SEO signals.
  - **Fix:** delete all local domain constants; import `SITE_URL` from `@/lib/site-data` everywhere.

- [x] **1.3 Strip enroll page to placeholder** ✅ 2026-08-21
  - `src/routes/enroll.tsx` (707 lines)
  - Also contains mojibake bug at line 362: `{s < step ? <span>???</span> : ...}` renders literal replacement chars instead of a checkmark on the conversion page.
  - **Fix:** replace entire file content with minimal placeholder route ("This is the enroll page" + proper title/meta). Keep `src/routes/api/enroll.tsx` untouched for the future redesign.

- [x] **1.4 Root document defaults** ✅ 2026-08-21
  - `src/routes/__root.tsx:19` — fallback title is still `"TanStack Start Starter"` (ships on any route without its own title, incl. 404).
  - `src/routes/__root.tsx:42-52` — `<TanStackDevtools>` renders unconditionally → devtools bundle ships to production.
  - **Fix:** brand fallback title; gate devtools behind `import.meta.env.DEV`.

---

## Phase 2 — Wire up auth properly

Current state: `src/lib/auth.ts` is imported nowhere, uses undeclared `pg` dependency, no `/api/auth/*` handler exists, no auth client, signin/signup pages are placeholders (`Hello "/auth/signin"!`). Prisma schema already has matching User/Session/Account/Verification tables.

**Decisions** (confirmed with owner):
- Driver: plain `pg` Pool as drafted — better-auth's Prisma adapter targets classic Prisma Client, incompatible with this project's prisma-next 8 RC API.
- Live Neon auth tables exist and **may be altered/recreated** (no data to preserve).
- **IDs stay `Int autoincrement()`** (schema came from the better-auth CLI) — paired with `advanced.database.generateId: "serial"` in `auth.ts`, verified against installed better-auth 1.6.29 source (`create-context.mjs:117` skips id generation; `get-migration.mjs:227` emits identity columns for this mode). Trade-off: better-auth returns numeric ids as strings in API responses (documented in better-auth#2349).
- Header gets a **session-aware** state (SIGN IN ↔ name + SIGN OUT).
- Signin/signup pages are **branded** like the rest of the site (dark/gold, guild-seal accent).
- Scope stays at working email/password flow — no protected routes in this phase (enroll gating = follow-up).

- [x] **2.1 Add missing dependencies** ✅ 2026-08-21 — `pg@8.23.0` + `@types/pg@8.23.1`.
  - `pg` is used in `lib/auth.ts` but not declared in `package.json` (only resolvable transitively).
  - **Fix:** `bun add pg` + `bun add -d @types/pg`.

- [x] **2.2 Align DB schema with better-auth** ✅ 2026-08-21 — tables recreated via `db:emit` + `db:migrate`, introspection confirms `integer` PKs backed by sequences.
  - ~~better-auth generates UUID *string* ids~~ → only true by default; with `generateId: "serial"` it omits `id` on INSERT and the DB sequence fills it, matching the CLI-generated `Int autoincrement()` schema exactly (kept after cross-checking installed source + docs).
  - Added `advanced.database.generateId: "serial"` to `src/lib/auth.ts`; added explicit `import "dotenv/config"` there so `DATABASE_URL`/`BETTER_AUTH_SECRET` load under Vite+Nitro regardless of import order.

- [x] **2.3 Mount better-auth API handler** ✅ 2026-08-21 — `src/routes/api/auth/$.tsx` forwards GET/POST to `auth.handler(request)`; route generated. No `trustedOrigins` needed (same-origin requests pass origin checks as configured).
  - Create `src/routes/api/auth/$.tsx` — catch-all forwarding GET/POST to `auth.handler(request)`; web Request/Response passes straight through Nitro, so no `toNodeHandler` needed. Pattern follows `api/enroll.tsx` (`server.handlers`). Run `bun run generate-routes`.

- [x] **2.4 Create auth client** ✅ 2026-08-21 — `src/lib/auth-client.ts`. Gotcha fixed en route: `baseURL` must be **absolute** (better-auth validates with `new URL()`, relative path throws during SSR); resolved per-environment (`window.location.origin` in browser, `BETTER_AUTH_URL` on server).
  - Create `src/lib/auth-client.ts` using `createAuthClient` from `better-auth/react`, base URL `/api/auth`.

- [x] **2.5 Build real signin page** ✅ 2026-08-21
  - Replace placeholder in `src/routes/auth/signin.tsx`.
  - Branded layout consistent with site (dark backdrop, Grain/GuildSeal accent, font-heading title, centered card form).
  - Email/password form via `authClient.signIn.email`; loading state on submit button, inline error display, redirect on success honoring `?redirect=` (validated to same-origin paths), link to signup.

- [x] **2.6 Build real signup page** ✅ 2026-08-21 — shared shell extracted to `src/components/site/auth.tsx` (AuthHero/AuthCard/AuthAlert).
  - Replace placeholder in `src/routes/auth/signup.tsx`.
  - Name/email/password (+confirm password, min length per better-auth default 8) via `authClient.signUp.email`; same UX contract as signin, link back to signin.

- [x] **2.7 Session-aware header entry point** ✅ 2026-08-21 — desktop SIGN IN / HI, NAME + SIGN OUT beside CTA; mobile sheet equivalent; nothing rendered while session is loading (no flash).
  - Desktop nav area (beside ENROLL CTA) + mobile sheet: when signed out show SIGN IN link; when signed in show user name + SIGN OUT button (`authClient.useSession()`, `authClient.signOut()`).
  - Keep it lightweight — a small client component so the header bundle isn't affected elsewhere.

**Acceptance:** ✅ full flow E2E-tested against Neon via curl on the dev server: sign-up (200, user `id:"1"` from sequence) → get-session (200 w/ user) → sign-out (200) → get-session (null) → sign-in (200, new token). Test data cleaned up. tsc / biome / build all green.

---

## Phase 3 — Forms & data honesty

- [ ] **3.1 Contact form actually submits**
  - `src/routes/contact.tsx:240-245` — `handleSubmit` only calls `preventDefault()` + `setSubmitted(true)`; nothing is sent anywhere while UI claims "Your message has been logged."
  - **Fix:** create `/api/contact` endpoint (mirror enroll's validate→log pattern), wire form to it with loading/error states.

- [ ] **3.2 Contact Select default value**
  - `src/routes/contact.tsx:333-347` — Program select has no `defaultValue`; untouched submissions send empty string.
  - **Fix:** set `defaultValue="not-applicable"` matching the placeholder option.

- [x] **3.3 Unify contradictory business hours** ✅ 2026-08-21 (landed with 5.2) — canonical schedule is the detailed one from /contact (`CONTACT.hours` in site-data.ts); home VisitUs + footer now show `CONTACT.hoursSummary`, footer JSON-LD uses `OPENING_HOURS_SPEC` derived from the same data.
  - Homepage (`index.tsx:108`): "Monday–Saturday, 9AM–7PM"
  - Contact page (`contact.tsx:518-522`): Sun–Thu 9–9, split Friday, Sat 9–7
  - **Fix:** single source of truth constant in `site-data.ts` (done together with Phase 5.2).

---

## Phase 4 — SEO & accessibility (medium)

### SEO
- [x] **4.1 Default og:image** ✅ 2026-08-21 — `public/banner.png` (copied from `src/assets/logo/banner.png`, 4001×2001) + default og/twitter meta in root head; homepage's duplicate twitter:card removed. Also copied `public/logo.png` for footer JSON-LD.
- [x] **4.2 programs.$slug 404 head** ✅ 2026-08-21 — "Program not found" title + `robots: noindex`.
- [x] **4.3 About JSON-LD NAP** ✅ 2026-08-21 — `about.tsx` ORG_JSON_LD address + contactPoint now read from `CONTACT` (landed with 5.2).

### Accessibility
- [x] **4.4 Missing `<h1>`** ✅ 2026-08-21 — sr-only h1s added to about + instructors heroes (quote-led design kept intact).
- [x] **4.5 Heading order violation** ✅ 2026-08-21 — `SectionEyebrow` gained optional `as` prop; rendered as `p` on programs.index so the h1 leads.
- [x] **4.6 Fake ARIA tabs patterns** ✅ 2026-08-21 — converted to semantic `<fieldset>` + sr-only `<legend>` with `aria-pressed` buttons (Biome-enforced).
- [x] **4.7 Gallery lightbox dialog** ✅ 2026-08-21 — rebuilt on Base UI Dialog: focus trap, focus restore, scroll lock, Escape, backdrop click. Reduced-motion respected.
- [x] **4.8 Skip link broken/duplicated** ✅ 2026-08-21 — `id="main-content"` moved to root wrapper div; home's duplicate skip-link removed.
- [x] **4.9 Contrast failures** ✅ 2026-08-21 — bumped all `/50`–`/60` small-text opacities to `/65`+ across 14 files (incl. repeated breadcrumb pattern).
- [x] **4.10 Copy-to-clipboard announcement** ✅ 2026-08-21 — semantic `<output>` live region.

### Bugs
- [x] **4.11 Attribute typo** ✅ 2026-08-21 — fixed to `aria-labelledby`; container upgraded to semantic `<ul>` list (Biome flagged the roleless-div ARIA).
- [x] **4.12 Embla listener leak** ✅ 2026-08-21
- [x] **4.13 Invalid figcaption** ✅ 2026-08-21 — blockquote + figcaption wrapped in `<figure>`.

---

## Phase 5 — Performance & DRY polish

### Performance
- [x] **5.1 Image CLS fixes** ✅ 2026-08-21 — migrated to `@unpic/react <Image>`: hero backgrounds use `layout="fullWidth"` (+`priority` on the first tile), masonry images use constrained `width={item.w} height={item.h}` (careers, student-life hero + both masonry sections, home map, gallery grid).

### DRY refactor
- [x] **5.2 Centralize CONTACT constants** ✅ 2026-08-21 — `CONTACT` (email, phoneDisplay/Href/E164, whatsapp, address parts/display, hoursSummary, hours) + `OPENING_HOURS_SPEC` in `site-data.ts`; replaced hardcoded NAP in index VisitUs, contact ×5 spots, terms §11, privacy §5/§9, about JSON-LD, footer markup + LocalBusiness JSON-LD. Resolves 4.3 + 3.3.
- [x] **5.3 Extract legal page scaffolding** ✅ 2026-08-21 — `LegalHero`/`LegalContent` now in `components/site/legal.tsx`; terms/privacy import them.
- [x] **5.4 Extract `useFadeUp()` hook** ✅ 2026-08-21 — lives in `decor.tsx`; careers/contact/student-life heroes and the shared legal hero all consume it.
- [x] **5.5 Dedupe home sections** ✅ 2026-08-21 — home renders shared `<FinalCta>` with props; why-us's local `SectionEyebrow` copy deleted (student-life already used the shared one).
- [x] **5.6 Move ProgramCard out of route file** ✅ 2026-08-21 — now `components/site/program-card.tsx`; imported by programs.index + programs.$slug. Home's Card-based variant is intentionally different and stays put.

### Small stuff
- [x] **5.7 Footer year hydration guard** ✅ 2026-08-21 — year wrapped in `<span suppressHydrationWarning>`.
- [x] **5.8 Header JSON-LD shape** ✅ 2026-08-21 — `itemListElement: [{ "@type": "ListItem", position, name, url }]`.
- [x] **5.9 Legal breadcrumbs** ✅ 2026-08-21 — shared LegalHero uses TanStack `<Link to="/">`.
- [x] **5.10 Gallery dead code** ✅ 2026-08-21 — mount-only `setSelected(null)` effect deleted.
- [x] **5.11 Footer dead links** ✅ 2026-08-21 — removed "Business of Barbering" (nonexistent slug; also dropped from OfferCatalog JSON-LD) and "Sitemap" (no such route).
- [x] **5.12 Optional cleanups** ◑ 2026-08-21 — import style standardized (`#/` → `@/`, 9 files), then the `#` alias removed entirely: dropped `"#/*"` from `tsconfig.json` paths and the Node subpath `"imports"` map from `package.json` — `@/*` is now the only path alias. Version pinning of `"latest"` @tanstack deps still open (needs a deliberate upgrade pass, not a blind pin).

---

## Verification checklist (run after each phase)

```bash
bun x tsc --noEmit        # type check
bun x biome check .       # lint + format
bun run dev               # smoke-test routes
```

Route smoke list: `/`, `/about`, `/programs`, `/programs/classic-barbering`, `/programs/not-a-real-slug` (expect custom 404), `/instructors`, `/gallery`, `/student-life`, `/careers`, `/contact`, `/enroll` (placeholder), `/terms`, `/privacy`, `/auth/signin`, `/auth/signup`, plus signup→signin flow against Neon DB.

## Suggested execution order

Phases are ordered by impact and independence — execute top to bottom, checking off items. Phase 2 requires a reachable `DATABASE_URL` (Neon) for end-to-end testing. Phase 5.2 should land before 3.3 and 4.3 to avoid double-touching the same lines.
