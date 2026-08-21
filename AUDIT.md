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

- [ ] **2.1 Add missing dependencies**
  - `pg` is used in `lib/auth.ts` but not declared in `package.json` (only present as transitive dep).
  - **Fix:** `bun add pg` + `bun add -d @types/pg`.

- [ ] **2.2 Mount better-auth API handler**
  - Create `src/routes/api/auth/$.tsx` — TanStack Start API route that forwards all methods/paths to `auth.handler` converted via `toNodeHandler` (or nitro-equivalent).

- [ ] **2.3 Create auth client**
  - Create `src/lib/auth-client.ts` using `createAuthClient` from `better-auth/react`, base URL `/api/auth`.

- [ ] **2.4 Build real signin page**
  - Replace placeholder in `src/routes/auth/signin.tsx`.
  - Email/password form via `authClient.signIn.email`, loading state, error display, redirect on success, link to signup.

- [ ] **2.5 Build real signup page**
  - Replace placeholder in `src/routes/auth/signup.tsx`.
  - Email/password/name via `authClient.signUp.email`, same UX contract as signin, link back to signin.

- [ ] **2.6 Header auth link**
  - Point header CTA/link to working `/auth/signin` (or show signed-in state later).
  - *Acceptance: full signup → signout → signin flow works against the Neon DB in `.env`.*

---

## Phase 3 — Forms & data honesty

- [ ] **3.1 Contact form actually submits**
  - `src/routes/contact.tsx:240-245` — `handleSubmit` only calls `preventDefault()` + `setSubmitted(true)`; nothing is sent anywhere while UI claims "Your message has been logged."
  - **Fix:** create `/api/contact` endpoint (mirror enroll's validate→log pattern), wire form to it with loading/error states.

- [ ] **3.2 Contact Select default value**
  - `src/routes/contact.tsx:333-347` — Program select has no `defaultValue`; untouched submissions send empty string.
  - **Fix:** set `defaultValue="not-applicable"` matching the placeholder option.

- [ ] **3.3 Unify contradictory business hours**
  - Homepage (`index.tsx:108`): "Monday–Saturday, 9AM–7PM"
  - Contact page (`contact.tsx:518-522`): Sun–Thu 9–9, split Friday, Sat 9–7
  - **Fix:** single source of truth constant in `site-data.ts` (done together with Phase 5.2).

---

## Phase 4 — SEO & accessibility (medium)

### SEO
- [ ] **4.1 Default og:image** — no `og:image` anywhere; homepage declares `twitter:card: summary_large_image` with no image → blank social cards. Add default in `__root.tsx` head, override per page where assets exist.
- [ ] **4.2 programs.$slug 404 head** — `head()` returns `{}` when loaderData absent → 404 response has no title/description (`programs.$slug.tsx:28`). Return "Program not found" title.
- [ ] **4.3 About JSON-LD NAP** — `ORG_JSON_LD` hardcodes address/phone inline (`about.tsx:70-77`); import shared contact constants instead (with Phase 5.2).

### Accessibility
- [ ] **4.4 Missing `<h1>`** — about.tsx (first heading is h2 at ~line 224) and instructors.tsx (first heading h2 at ~line 128). Convert hero statements to `<h1>`.
- [ ] **4.5 Heading order violation** — `programs.index.tsx:114-115`: eyebrow renders `<h2>` before the page's `<h1>`. Reorder or drop eyebrow there.
- [ ] **4.6 Fake ARIA tabs patterns** — gallery.tsx:128-161 and programs.index.tsx:233-266 use `role="tablist"/"tab"` + `aria-selected` with no tabpanels, no keyboard nav. Downgrade to plain buttons with `aria-pressed`.
- [ ] **4.7 Gallery lightbox dialog** — `gallery.tsx:220-293`: `role="dialog" aria-modal="true"` without focus trap, focus move/restore, or scroll lock. Wrap in Base UI Dialog (already a dependency) or add focus-trap + body scroll lock.
- [ ] **4.8 Skip link broken/duplicated** — header skip link targets `#main-content` but only home route has that id; home also ends up with two skip links. Put `id="main-content"` on the wrapper div in `__root.tsx:40`, remove per-route skip links/duplicates.
- [ ] **4.9 Contrast failures** — bump low-opacity small text (~WCAG AA fails/borderlines):
  - footer:259 (`/50`), testimonials:93 (`/50`), stats:35 (`/55`), hero:116 (`/55`), contact:569 (`/55`), about:386 / instructors:155 / programs.$slug:368 (`text-muted-foreground/60` ≈ 2.2:1)
- [ ] **4.10 Copy-to-clipboard announcement** — contact.tsx CopyRow "copied" state is visual only; add `aria-live="polite"` region.

### Bugs
- [ ] **4.11 Attribute typo** — `components/pages/home/programs.tsx:138`: `aia-labelledby={trackId}` → `aria-labelledby`.
- [ ] **4.12 Embla listener leak** — `components/ui/carousel.tsx:93-102`: cleanup calls `api.off("select", onSelect)` but not `api.off("reInit", onSelect)`. Add missing off.
- [ ] **4.13 Invalid figcaption** — `testimonials.tsx:79`: `<figcaption>` with no ancestor `<figure>`. Wrap card in `<figure>`.

---

## Phase 5 — Performance & DRY polish

### Performance
- [ ] **5.1 Image CLS fixes** — raw `<img>` without width/height on LCP/masonry images:
  - careers.tsx:94-103, student-life.tsx:96-110 + masonry 183-188/270-275, index.tsx:122-126, gallery.tsx:175-180
  - Data (`w`/`h`) already exists in `GalleryItem`. Migrate to `@unpic/react <Image>` (pattern already used on contact/about heroes) or add intrinsic dimensions.

### DRY refactor
- [ ] **5.2 Centralize CONTACT constants** — phone/email/address/hours hardcoded ~25× across 6+ files (index, contact ×5 formats, terms, privacy, about, enroll FinalCta copy, footer, header TODO comments). Export `CONTACT = { phoneDisplay, phoneTel, whatsapp, email, address, hours }` from `site-data.ts`; replace all occurrences.
- [ ] **5.3 Extract legal page scaffolding** — `LegalHero` + `LegalContent` duplicated byte-for-byte between terms.tsx:227-282 and privacy.tsx:216-271 → move to `components/site/legal.tsx`.
- [ ] **5.4 Extract `useFadeUp()` hook** — identical motion helper copy-pasted in careers.tsx:78-89, contact.tsx:107-118, student-life.tsx:80-91, terms.tsx:229-240, privacy.tsx:218-229 → put in `decor.tsx`.
- [ ] **5.5 Dedupe home sections** — index.tsx:136-187 re-implements shared `FinalCta` (decor.tsx:220-266); why-us.tsx:37-66 and student-life.tsx:43-60 re-inline `SectionEyebrow` (decor.tsx:130). Use shared components.
- [ ] **5.6 Move ProgramCard out of route file** — exported from `programs.index.tsx` for cross-route reuse (unconventional for file-based routing); imports sit at bottom of file. Move to `components/site/program-card.tsx`, hoist imports.

### Small stuff
- [ ] **5.7 Footer year hydration guard** — `footer/index.tsx:259` `new Date().getFullYear()` can mismatch between SSR and client around New Year → compute once or `suppressHydrationWarning`.
- [ ] **5.8 Header JSON-LD shape** — header:40-45 uses parallel arrays for name/url in `SiteNavigationElement`; schema.org reads them as unrelated values. Use `itemListElement: [{ "@type": "ListItem", ... }]`.
- [ ] **5.9 Legal breadcrumbs** — terms.tsx:252, privacy.tsx:241 use raw `<a href="/">` (full reload) → TanStack `<Link to="/">`.
- [ ] **5.10 Gallery dead code** — gallery.tsx:97-99 `useEffect(() => { setSelected(null); }, [])` resets already-null state → delete.
- [ ] **5.11 Footer dead links** — footer:28 "Business of Barbering" → nonexistent slug; footer:41 "Sitemap" → no such route. Repoint/remove.
- [ ] **5.12 Optional cleanups** — pin `"latest"` versions of @tanstack deps in package.json; standardize mixed `#/` vs `@/` import style.

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
