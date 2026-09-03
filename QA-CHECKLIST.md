# Manual QA Guide — Unicorn Barber Training Academy

Complete start-to-end manual test plan. Every feature, flow, and fix in the
codebase is covered.

## How to use this checklist

The guide is grouped into **phases** that you run **in order**. Each phase builds
state that a later phase depends on (e.g. you must create an intake in Phase 3
before you can enroll in Phase 4, and graduate someone in Phase 4 before you can
test certificate revocation in Phase 5). Sign-in/sign-out transitions between
roles are called out explicitly — follow them or the flows won't line up.

Check items as you go: `[ ]` → `[x]`.

**State you'll need by the end (built up across phases):**
- ONE **admin** account
- ONE plain **user/student** account (the "applicant" on every flow)
- ONE **completed + fee-paid** application (the "graduate")

---

## PHASE 0 — Environment, Baseline & Build

> Run once. Confirms the toolchain is green and the app boots before any manual
> feature testing. Recommended: finish Phase 5 smoke at the end too.

### 0. Environment Setup

| # | Step | Expected |
|---|---|---|
| 0.1 | `bun install` completes | No errors |
| 0.2 | `.env` exists with `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL=http://localhost:3000` | App boots without fail-fast errors |
| 0.3 | `bun run db:status` | Migrations applied, including `004_certificates.sql` |
| 0.4 | `bun run db:blog` | All 4 SQL files apply idempotently, no failures |
| 0.5 | `bun run dev` | Server starts on http://localhost:3000, no Vite externalization warnings (`path`/`fs`/`url`/`source-map-js`), no `error loading dynamically imported module` |
| 0.6 | `bun run typecheck` | No type errors |
| 0.7 | `bun run test` | All tests pass (150 across 15 files at time of writing) |
| 0.8 | `bun run check` | Biome clean (format + lint) |

**Degraded-mode notes (test BOTH if possible):**
- No `RESEND_API_KEY` → emails print **links to the server terminal** instead of sending.
- No `CLOUDINARY_*` vars → avatar & blog image uploads show a clear "not configured" error instead of crashing.
- No `GOOGLE_CLIENT_ID/SECRET` → Google button hidden/inert; only email sign-in works.
- No `VITE_PLAUSIBLE_DOMAIN` → no analytics script loads anywhere (by design; see §1.16).

### 0. Build & Production Smoke (after the manual pass)

| # | Step | Expected |
|---|---|---|
| 0.9 | `bun run build` | Completes; `.output/` emitted (Nitro); `sanitize-html`/`qrcode`/`marked` land **only** in `.output/server/_libs/`, never the client bundle |
| 0.10 | Run the built server (with prod env vars) | Boots |
| 0.11 | Hit `/`, `/blog`, sign-in, one admin page | All function; `BETTER_AUTH_URL` fail-fast triggers loudly if unset |
| 0.12 | CI green | GitHub Actions runs typecheck + lint + tests |

---

## PHASE 1 — Public Marketing Site (anonymous)

> No login. Confirms the landing experience, SEO surface, and content.
> Sets up the pages every other phase navigates from.

### 1. Public Marketing Pages

For each page check: loads without console errors, images render, fonts load,
header/footer present, active nav link highlights (including child pages),
mobile layout at ~375px width.

| # | Page | Extra checks |
|---|---|---|
| 1.1 | `/` Home | **Headings render in Fraunces serif** (not Inter — check the hero "Master the fade."); gradient "Earn the chair." has a slow shimmer sweep; clipper-guard gauge (#0–#4 with mm hints) animates in between copy and photo; photo parallaxes gently on scroll; craft-words marquee (FADES · TAPERS · …) scrolls below hero and pauses on hover; stats count up when scrolled into view; all sections render (Why, Stats, Programs, Student Life, Instructors, Testimonials, FAQ accordion opens/closes); Visit-Us shows a **live Google Maps embed** (not placeholder image); phone displays `01337-229944`; address shows Banasree/Rampura; "GET DIRECTIONS" opens Google Maps in new tab |
| 1.1b | `/` Home extras | Floating WhatsApp button bottom-right (hidden on print); on mobile (~375px): after scrolling past hero a sticky "Enrollment open / ENROLL" bar appears at the bottom and disappears near the footer |
| 1.2 | `/about` | JSON-LD renders (view-source: sameAs includes all 5 social URLs incl. TikTok & X); content accurate |
| 1.3 | `/programs` | All program cards listed |
| 1.4 | `/programs/<slug>` for EACH program | Detail renders (curriculum, outcomes, FAQ); **view-source**: `og:image` is an **absolute** `https://…` URL, not `/assets/...`; Course JSON-LD present |
| 1.5 | `/instructors` | All instructors render; bios say Dhaka (not Gulshan); Instagram links point to the real academy handle |
| 1.6 | `/gallery` | Lightbox opens/closes (Esc), arrow keys navigate, focus is trapped while open |
| 1.7 | `/student-life` | Renders, no dead links |
| 1.8 | `/careers` | Renders; **view-source**: JobPosting JSON-LD present (3 roles, hiringOrganization + jobLocation addresses) |
| 1.9 | `/media` | Shows graceful "Coverage is coming soon" empty state (until you add stories to `src/data/media.ts`) |
| 1.10 | `/contact` | Address/phone/hours correct; **live map embed** interactive (can pan/zoom — no overlay blocking clicks); "Convenient for students from…" lists areas; FAQs include the two location questions; copy-to-clipboard rows show check + "Copied" for ~2s; success panel announces via `role="status"` |
| 1.11 | `/privacy`, `/terms` | Render; no lorem ipsum |
| 1.12 | `/enroll` (logged OUT) | Redirects to `/auth/signin?redirect=/enroll` — destination preserved after sign-in (Phase 2) |
| 1.13 | Any garbage URL e.g. `/xyz` | Branded "Page not found" with BACK TO HOME button |
| 1.14 | Header (all pages) | Nav says **"Instructors"** (typo fixed); logo links home; Enroll Now button works; scroll hides/shows navbar; mobile drawer: tapping a nav link closes the drawer while navigating; avatar menu trigger has an accessible name ("Account menu for …") |
| 1.15 | Footer (all pages) | 5 social icons (IG/FB/YT/TikTok/X) with correct URLs; Press & Media link works; NAP block matches real data; **WhatsApp cohort-announcement capture**: submitting a number opens wa.me in a new tab |
| 1.16 | Analytics hook | With `VITE_PLAUSIBLE_DOMAIN` unset: no analytics script in view-source. Set it → `plausible.io/js/script.js` tag with `data-domain` appears |

### 1. SEO & Structured Data Spot Checks

| # | Check | How |
|---|---|---|
| 1.17 | Unique `<title>` + meta description per public page | View-source each page above |
| 1.18 | Canonical URLs correct | Blog page 2 → `…/blog?page=2`; junk `?page=` → canonical `/blog` |
| 1.19 | OG tags absolute | All `og:image`/`og:url` start with `https://unicornbarberacademy.com` (or localhost origin in dev) |
| 1.20 | JSON-LD validates | Paste blocks into https://validator.schema.org — LocalBusiness (footer), Course (program), FAQPage (home/contact/blog posts), BreadcrumbList, BlogPosting, JobPosting (careers). All blocks are escaped via the shared `stringifyJsonLd()` helper — a post/FAQ title containing `</script>` must NOT break out of the tag |
| 1.21 | Footer LocalBusiness block | `@type` array contains **LocalBusiness**; hasMap → Google Maps URL; areaServed lists 7 neighborhoods; contactPoint has en/bn |
| 1.22 | `/robots.txt` | Allows `/`, disallows `/api/` and `/md/`, lists sitemap |
| 1.23 | `/sitemap.xml` | Valid XML; **does NOT contain `/enroll`** or any `/verify/*`; DOES contain `/media`; static routes have NO lastmod; `/blog` and category entries carry **real lastmod dates from post timestamps** (not today's date); blog posts have real lastmod |
| 1.24 | `/feed.xml` | Valid RSS, published posts only, absolute URLs. Every page's `<head>` also has RSS autodiscovery: `<link rel="alternate" type="application/rss+xml" href="/feed.xml">` |
| 1.25 | `/llms.txt` | Contains real address/phone (Banasree), program list, md-mirror links |
| 1.26 | Dashboard/auth routes are noindex | View-source any `/dashboard/*` page → `robots: noindex` |
| 1.27 | `/verify/<anything>` ships `robots: noindex` | Arbitrary certificate codes must not be indexable (meta robots, not robots.txt — crawlers can still see the directive). [Full verify flow in Phase 4] |
| 1.28 | og:image overrides | `/about` and `/contact` emit their own absolute og:image (page hero slot); other pages fall back to the default banner |

---

## PHASE 2 — Accounts, Auth & Settings

> Get your two accounts set up here: one gets promoted to **admin**, the other
> stays a plain **user/student**. The student account must exist before Phase 3.

### 2. Authentication Flows

#### 2.1 Email/password signup
| # | Step | Expected |
|---|---|---|
| 2.1.1 | `/auth/signup` with a NEW email | Success message; redirected to verify-email notice page |
| 2.1.2 | Copy verification link from **server terminal** (Resend off) and open it | Email verified; lands signed-in or at sign-in |
| 2.1.3 | Try signing up again with same email | Friendly error, no crash |
| 2.1.4 | Weak password / mismatched fields | Inline validation messages |

#### 2.2 Sign in / out
| # | Step | Expected |
|---|---|---|
| 2.2.1 | `/auth/signin` correct credentials | Signed in; header updates **without full-page flicker** |
| 2.2.2 | Wrong password | Generic error (no user-enumeration wording) |
| 2.2.3 | Sign out | Header flips to signed-out state instantly |
| 2.2.4 | Visit `/dashboard` while signed out | Redirect to sign-in **with `?redirect=/dashboard`**; after signing in you land on `/dashboard` |
| 2.2.5 | Signed-in user visits `/auth/signin` | Bounced away (no double session confusion) |

#### 2.3 Password reset
| # | Step | Expected |
|---|---|---|
| 2.3.1 | `/auth/forgot-password` with existing email | Reset link appears in server terminal |
| 2.3.2 | Use link → set new password → sign in with it | Works |
| 2.3.3 | Reuse the same reset link | Rejected (single-use) |

#### 2.4 Google OAuth (optional — needs `GOOGLE_CLIENT_ID/SECRET`)
| # | Step | Expected |
|---|---|---|
| 2.4.1 | Continue with Google | Returns to app signed-in; name/avatar populated |
| 2.4.2 | Avatar with blank/missing Google name | Header does NOT crash (initials fallback handles blank names) |

### 2. Seed the two accounts

| # | Step | Expected |
|---|---|---|
| 2.5 | Keep the account from 2.1/2.2 as your **admin**; sign up/normal-sign-in a **second plain user** now (never promoted) | Two accounts exist |
| 2.6 | For the admin: run `bun scripts/set-role.ts <your-email> admin` | Console confirms role change |
| 2.7 | Admin signs out and back in | Header shows name; role is admin (role-aware nav appears — Phase 3) |

### 2. Profile & Settings (any signed-in user)

| # | Step | Expected |
|---|---|---|
| 2.8 | `/dashboard/settings` | Three cards render: Profile, Password, Sessions |
| 2.9 | Change display name → Save | Toast; header name updates after invalidation |
| 2.10 | Blank name / unchanged name | Save disabled |
| 2.11 | Upload avatar >2MB | Clear rejection message (2MB cap) |
| 2.11b | Upload a **text file renamed to .png** (fake extension) | Rejected 415 — the server sniffs magic bytes; declared Content-Type is never trusted |
| 2.12 | Upload valid avatar (Cloudinary configured) | Toast; header + settings avatar update everywhere; the **previous** avatar is **deleted from Cloudinary** (no orphaned files accumulating) |
| 2.12b | Same with NO Cloudinary config | 503 message explains exactly which env vars are missing (graceful, not crash) |
| 2.13 | Resend verification (on unverified account) | Terminal prints fresh verification link |
| 2.14 | Change password (wrong current) | better-auth error surfaced |
| 2.15 | Change password (correct) | Success; other sessions revoked |
| 2.16 | Sessions card | Lists current device (shows "Loading sessions…" while fetching — never an ambiguous empty list); signing out current session ends it; other-session revoke removes just that row |

---

## PHASE 3 — Admin: Intakes & Admissions

> Sign in as **ADMIN**. Create the intake that Phase 4's enrollment needs, and
> the pipeline that processes it.

### 3. Intakes first (admissions prerequisite)

| # | Step | Expected |
|---|---|---|
| 3.1 | `/dashboard` shows the role-aware sidebar; admins see Overview, Certificates, Admissions, Console, Blog, Settings | Sidebar visible on desktop; hamburger drawer on mobile with exactly those items |
| 3.2 | `/dashboard/admin` console | Stat cards render (zeros fine); "Upcoming intake seats" empty-state prompts to create intake |
| 3.3 | `/dashboard/enrollments/intakes` → create intake (future date, seats 12) | Appears in list; open-intake flag on |
| 3.4 | Create duplicate (same program/cohort/date) | Blocked with friendly "identical intake" error |
| 3.5 | Create with PAST date or invalid date (2026-02-30) | Rejected — future-date validation on CREATE |
| 3.6 | PATCH intake: seats outside 1–200 / shrink below occupied / move live intake into past | Rejected ("Seats must be between 1 and 200", "below occupied", future-date rule on PATCH too) |
| 3.7 | Delete unused intake | Works (no confirmation needed — nothing to lose) |
| 3.8 | Delete intake WITH applications | **AlertDialog opens** warning about the application count; after confirming, server still blocks with "has applications" error |
| 3.9 | Seats input: type an invalid value and blur (rejected by server) | After refetch, the input snaps back to the value actually in the DB — never keeps showing your rejected number |

### 3. Admissions pipeline (admin)

> Requires at least one application from Phase 4. Sign in as ADMIN.

| # | Step | Expected |
|---|---|---|
| 3.10 | `/dashboard/enrollments` list | Application visible; status tabs (All/Pending/In-review/Approved/**Completed**/Waitlisted/Rejected) filter correctly |
| 3.11 | Search box | Filters by name/email/phone/reference; `%` or `_` in search doesn't wildcard-match everything unexpectedly |
| 3.12 | Create ≥ 21 applications (or temporarily lower perPage) then paginate | Prev/Next changes rows AND footer count — **page param actually fetches new data** (regression check) |
| 3.13 | Status filter + search + page combined | Query string reflects all three; deep-linking the URL restores state |
| 3.14 | Export CSV | Button reads **"Export page (CSV)"** — it exports only the current page; downloads fine, opens in Excel/LibreOffice; any cell starting with `=`,`+`,`-`,`@` was neutralized (leading `'`) |
| 3.15 | Open application detail | All applicant data renders; decision-note textarea labeled. If another admin saves a note, your (untouched) textarea picks up their text on refetch; once you type, your draft is never overwritten |
| 3.16 | Transition pending→reviewing→approved | Badges update; approval email in terminal; applicant role upgraded to `student` (verify via set-role script listing or DB) |
| 3.17 | Mark fee paid → unpaid toggle | Badge flips both ways |
| 3.18 | Mark **completed** | Status becomes Completed; NO email sent (silent transition) |
| 3.19 | Console `/dashboard/admin` refresh | Counts updated; latest-applications table shows newest 8; intake fill bar reflects occupied seat |

> ✅ Your **graduate** now exists (completed + paid). This is the state Phase 4's
> certificate tests need — reach it by transitioning an application pending →
> approved → fee-paid → completed (steps 3.16–3.18).

---

## PHASE 4 — Student Enrollment & Certificates

> Sign in as the **plain user/student** (the applicant), and use the intake you
> created in Phase 3. Tests the applicant's whole journey through graduation.

### 4. Enrollment flow (student account)

Sign OUT of admin; sign in as the PLAIN USER.

| # | Step | Expected |
|---|---|---|
| 4.1 | Visit `/enroll` | Intake selector shows the open intake with correct seats-left |
| 4.2 | Submit empty/invalid form | Inline field errors; error paragraph has `role="alert"` (screen-reader visible) |
| 4.3 | Invalid phone (`abc`, 40 digits) | Rejected client-side |
| 4.4 | Submit valid application | Success confirmation with reference `ENR-XXXXXX`; confirmation email printed to terminal |
| 4.5 | Submit AGAIN same intake | 409 duplicate message (friendly copy, not raw error) |
| 4.6 | Double-click submit rapidly | Only ONE application created (button disables while submitting) |
| 4.7 | `/dashboard` (student view) | My Applications card lists it with Pending badge; NO staff cards; sidebar shows Overview/Certificates/Settings only |
| 4.8 | Seats math | Intake seatsLeft dropped by 1 (check as admin later) |

### 4. Issue the certificate (admin, cross-checking Phase 3)

| # | Step | Expected |
|---|---|---|
| 4.9 | Certificate panel (before eligibility) | Issue button disabled with explanation when status≠completed or fee unpaid |
| 4.10 | Issue certificate (completed + paid) | Toast shows code `UBT-<year>-0001`; panel switches to issued state with Active badge + verify link |
| 4.11 | Issue again | Blocked: "already has a certificate" (409 path) |

### 4. Certificates — student side

Sign in as the STUDENT (the one who graduated).

| # | Step | Expected |
|---|---|---|
| 4.12 | Sidebar → Certificates | Card lists certificate: code, program title, cohort, issued date, Valid badge |
| 4.13 | Empty state (other account) | Friendly "No certificates yet" |
| 4.14 | Print / PDF | Opens print page — dashboard chrome absent; browser print preview (Ctrl+P): A4 portrait looks clean, gold frame intact, QR renders (server-generated via `qrcode`, no client leak) |
| 4.15 | Save as PDF | File generates correctly |
| 4.16 | Scan/print QR (or open URL shown under QR) | Lands on `/verify/<code>` showing **Valid certificate** with holder name, program, cohort, issue date |
| 4.17 | Share buttons | WhatsApp pre-fills text+URL; Facebook sharer; X intent; Copy link → toast + clipboard contains verify URL |
| 4.18 | Verify a GARBAGE code `/verify/UBT-9999-9999` | "No certificate found" state; lookup form at top re-submits and navigates |
| 4.19 | Verify lowercase code | Normalized, still resolves |

#### 4. Revocation round-trip (admin)
| # | Step | Expected |
|---|---|---|
| 4.20 | Application detail → Revoke… | **First click arms it** ("Click again to confirm revocation", red); second click revokes. Badge flips to Revoked. Restore stays a single click |
| 4.21 | Reload `/verify/<code>` | Explicit **Revoked certificate** state (not "not found") |
| 4.22 | Restore certificate | Back to Active; verify page shows Valid again |
| 4.23 | Student's cert card | Badge mirrored Revoked/Valid |

---

## PHASE 5 — Content, Contact & Hardening

> Independent feature QA: the blog CMS, contact, security regressions, resilience,
> accessibility, and the cross-browser/build matrix. Can be done any time, but
> best after all state-dependent phases so nothing is reset mid-run.

### 5. Blog CMS (admin)

| # | Step | Expected |
|---|---|---|
| 5.1 | `/dashboard/blog` list | Pagination footer works beyond 20 posts (**regression**: page param fetches); status tabs filter |
| 5.2 | New post → save draft | Editor dirty-guard: navigating away / closing tab warns while unsaved; disarms after save |
| 5.3 | Markdown toolbar | Bold/italic/heading/list/quote/code/link/image all insert correctly; **preview renders with `marked` only (client-safe)** |
| 5.4 | Insert image (Cloudinary configured) | Uploads, inserts URL; with NO Cloudinary → clear "not configured" message (the client never ships `sanitize-html`/`qrcode`) |
| 5.5 | Publish | Post live at `/blog/<slug>`; publishedAt stamped |
| 5.6 | Rename slug of published post | Old URL 301-redirects to new (redirect table) |
| 5.7 | Unpublish/archive | Leaves public index; direct old URL handled gracefully |
| 5.8 | Draft preview as ADMIN | Draft URL renders with `noindex` meta |
| 5.9 | Draft URL as ANONYMOUS/student | Not found (no leak) |
| 5.10 | Categories | Create/rename/delete; rename has Save + Cancel buttons and Escape cancels; delete opens an **AlertDialog** warning that the public `/blog/category/<slug>` URL stops resolving; delete keeps posts (category becomes null) |
| 5.11 | Category input & slug conflict | Input labeled; renaming to a slug another category owns → friendly 409 "slug already in use", never a raw 500 |
| 5.12 | Markdown XSS attempt: post content with `<script>alert(1)</script>`, `[x](javascript:alert(1))`, `<a href="//evil.com" target="_blank">` | Nothing executes; external/protocol-relative anchors get `rel="noopener noreferrer nofollow"`; `</script>` inside a title/FAQ must not break the JSON-LD `<script>` tag (see §1.20). **Sanitizing happens on the server** (`getPostForPublicHtmlFn`) |
| 5.13 | Post delete (editor page) | Delete button opens an **AlertDialog** (no more "click again" timer); confirming navigates back to /dashboard/blog; **cover/OG images are deleted from Cloudinary** (best-effort) |

#### 5. Public blog
| # | Step | Expected |
|---|---|---|
| 5.14 | `/blog` | Cards, categories sidebar, pagination; dates render via the shared date-fns helpers ("Mar 1, 2026" style) |
| 5.15 | `/blog?page=999` | **404** (not "coming soon") — regression check |
| 5.16 | Category archive ≥3 posts | Lists; thin archive (<3) ships noindex + excluded from sitemap |
| 5.17 | Post page | Reading time, TOC anchors jump, related posts, **FAQ accordion (shadcn Accordion primitive — animated open/close)**, JSON-LD (BlogPosting/Breadcrumb/FAQ) |
| 5.18 | `/md/blog/<slug>` | Raw markdown mirror; renamed slugs redirect here too |

### 5. Contact form

| # | Step | Expected |
|---|---|---|
| 5.19 | Submit valid message | Success state with reference `MSG-…`; **email arrives at hello@unicornbta.com** (with Resend) OR terminal logs skipped-send warning (without) |
| 5.20 | Received email | Reply-To = visitor's address; topic label; escaped HTML (try `<b>` in message — shows literally) |
| 5.21 | Invalid email / bad subject / oversized message (>5000 chars truncated-or-rejected per validation) | Proper 400 messages |
| 5.22 | Rate limit: 6 submissions in 1 min from same IP | 6th gets 429 "Too many requests" |
| 5.23 | Cross-site POST (curl with foreign Origin header) | 403 Forbidden |

### 5. Security spot checks (regressions)

| # | Attack | Expected result |
|---|---|---|
| 5.24 | Anonymous POST to admin server fns, e.g. `curl -X POST http://localhost:3000/_serverfn/<fnId>` style call of `listApplicationsAdminFn` / `getAdminPostFn` / `listIntakesAdminFn` | Error ("Admin access required") — **no PII/draft dump** (this was a critical hole, now closed) |
| 5.25 | Direct REST hits without session: `/api/admin/enrollments`, `/api/admin/blog`, `/api/admin/upload`, `/api/admin/certificates` | 401/403 JSON, never data |
| 5.26 | Student-role session calls admin endpoints | 403 |
| 5.27 | Spoofed `X-Forwarded-For: 1.2.3.4` on contact spam (direct, no proxy) | Rate-limit bucket keyed on nearest-proxy value — rotating fake XFF does NOT grant unlimited buckets |
| 5.28 | Open-redirect: `/auth/signin?redirect=//evil.com` and `?\redirect=/\evil.com` | sanitized to safe internal path |
| 5.29 | Upload wrong MIME / oversize / **fake-extension text file** to `/api/upload/avatar` and `/api/admin/upload` | 400/413/415 — server sniffs magic bytes; a `.txt` renamed `.png` is rejected even though the declared type looks valid |
| 5.30 | `/api/*` paths in robots | Disallowed (§1.22) |

> Finding the server-fn endpoint id: watch Network tab while loading an admin
> page as admin — the RPC URL contains the fn id. Replay it logged-out.

### 5. Error handling & resilience

| # | Scenario | Expected |
|---|---|---|
| 5.31 | Stop Postgres (or break DATABASE_URL), reload `/blog` | Branded "Something went wrong" error screen with RELOAD button (dev: error message box above it) — never the raw framework white screen |
| 5.32 | Restore DB → click RELOAD | Site recovers |
| 5.33 | Navigate fast between dashboard sections | No stuck loading states; skeletons/spinners acceptable |
| 5.34 | Browser back/forward across paginated lists & filters | State restored correctly |

### 5. Responsive & accessibility sweep

Repeat key pages at **375px**, **768px**, **1440px**:

| # | Check |
|---|
| 5.35 | Mobile drawer (Sheet) opens/closes; tapping a link closes it AND navigates |
| 5.36 | Tables scroll horizontally inside their container, don't break layout |
| 5.37 | Certificate print page usable on mobile (print dialog reachable); WhatsApp float + sticky enroll bar are hidden in print output |
| 5.38 | Keyboard-only pass: **"Skip to content" link appears on first Tab** and jumps past the header; visible focus rings everywhere |
| 5.39 | Form errors announced (role="alert" present on enroll/contact/blog-admin errors); contact success panel announces via role="status" |
| 5.40 | All images have alt text; decorative ones empty alt; blog-editor cover/alt inputs and markdown textarea are properly labeled |
| 5.41 | Color contrast on gold-on-white buttons readable |
| 5.42 | Gallery lightbox: Esc closes, arrows work, focus returns to thumbnail |
| 5.43 | prefers-reduced-motion: animations minimized (hero reveals, parallax, shimmer, marquee, count-up stats render final values instantly); **Lenis smooth scrolling is disabled entirely** |
| 5.44 | Lenis smooth scroll: wheel scrolling feels smooth/inertial on marketing pages; native (no smoothing) inside `/dashboard` and `/auth` |

### 5. Cross-browser matrix (minimum)

- [ ] Chrome (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop, if available) — especially print dialog & date inputs
- [ ] One real mobile device (iOS Safari or Android Chrome) — sheet menu, map embed touch, camera-roll avatar upload

---

## Known intentional gaps (do NOT file as bugs)

- Instructor role has no dedicated tools yet (sees Overview/Certificates/Settings only).
- Admissions area is admin-only end-to-end (guards + API).
- `/media` is empty until real press entries are added to `src/data/media.ts`.
- All photos are `_placeholder.jpg` until real assets land in `src/assets/images/`.
- Emails require `RESEND_API_KEY`; otherwise links print to the dev terminal.
- No `aggregateRating` on the LocalBusiness JSON-LD — deliberately omitted until real Google review stats exist; do not fabricate.
- Careers JobPosting `datePosted` is a placeholder (`2026-01-01`) — update when roles actually open/close.
- Footer WhatsApp capture opens wa.me directly — no backend lead storage yet.
- Analytics is a hook point only: nothing loads until `VITE_PLAUSIBLE_DOMAIN` is set.
- Geo coordinates in `src/data/site.ts` need verification against the actual campus Google Maps pin.