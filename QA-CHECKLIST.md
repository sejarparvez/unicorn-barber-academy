# Manual QA Guide — Unicorn Barber Training Academy

Complete start-to-finish manual test plan. Every feature, flow, and fix in the
codebase is covered. Run top-to-bottom; earlier sections set up state later
sections depend on (e.g., you must create an intake before you can enroll).

Check items as you go: `[ ]` → `[x]`.

---

## 0. Environment Setup (one time)

| # | Step | Expected |
|---|---|---|
| 0.1 | `bun install` completes | No errors |
| 0.2 | `.env` exists with `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL=http://localhost:3000` | App boots without fail-fast errors |
| 0.3 | `bun run db:status` | Migrations applied, including `004_certificates.sql` |
| 0.4 | `bun run db:blog` | All 4 SQL files apply idempotently, no failures |
| 0.5 | `bun run dev` | Server starts on http://localhost:3000 |
| 0.6 | `bun run typecheck` | No type errors |
| 0.7 | `bun run test` | All tests pass (150 across 15 files at time of writing) |
| 0.8 | `bun run check` | Biome clean (format + lint) |

**Degraded-mode notes (test BOTH if possible):**
- No `RESEND_API_KEY` → emails print **links to the server terminal** instead of sending.
- No `S3_*` vars → avatar & blog image uploads show a clear "not configured" error instead of crashing.
- No `GOOGLE_CLIENT_ID/SECRET` → Google button hidden/inert; only email sign-in works.
- No `VITE_PLAUSIBLE_DOMAIN` → no analytics script loads anywhere (by design; see §2.16).

---

## 1. Seed Data (admin account + first intake)

| # | Step | Expected |
|---|---|---|
| 1.1 | Sign up normally via the site (Section 4 first if needed), then run `bun scripts/set-role.ts <your-email> admin` | Console confirms role change |
| 1.2 | Sign out and back in | Header shows your name; role is admin |

> ⚠️ You need TWO accounts by the end of Section 4: one **admin**, one plain
> **student/user** (to test the applicant's side of every flow).

---

## 2. Public Marketing Pages (anonymous)

For each page check: loads without console errors, images render, fonts load,
header/footer present, active nav link highlights (including child pages),
mobile layout at ~375px width.

| # | Page | Extra checks |
|---|---|---|
| 2.1 | `/` Home | **Headings render in Fraunces serif** (not Inter — check the hero "Master the fade."); gradient "Earn the chair." has a slow shimmer sweep; clipper-guard gauge (#0–#4 with mm hints) animates in between copy and photo; photo parallaxes gently on scroll; craft-words marquee (FADES · TAPERS · …) scrolls below hero and pauses on hover; stats count up when scrolled into view; all sections render (Why, Stats, Programs, Student Life, Instructors, Testimonials, FAQ accordion opens/closes); Visit-Us shows a **live Google Maps embed** (not placeholder image); phone displays `01337-229944`; address shows Banasree/Rampura; "GET DIRECTIONS" opens Google Maps in new tab |
| 2.1b | `/` Home extras | Floating WhatsApp button bottom-right (hidden on print); on mobile (~375px): after scrolling past hero a sticky "Enrollment open / ENROLL" bar appears at the bottom and disappears near the footer |
| 2.2 | `/about` | JSON-LD renders (view-source: sameAs includes all 5 social URLs incl. TikTok & X); content accurate |
| 2.3 | `/programs` | All program cards listed |
| 2.4 | `/programs/<slug>` for EACH program | Detail renders (curriculum, outcomes, FAQ); **view-source**: `og:image` is an **absolute** `https://…` URL, not `/assets/...`; Course JSON-LD present |
| 2.5 | `/instructors` | All instructors render; bios say Dhaka (not Gulshan); Instagram links point to the real academy handle |
| 2.6 | `/gallery` | Lightbox opens/closes (Esc), arrow keys navigate, focus is trapped while open |
| 2.7 | `/student-life` | Renders, no dead links |
| 2.8 | `/careers` | Renders; **view-source**: JobPosting JSON-LD present (3 roles, hiringOrganization + jobLocation addresses) |
| 2.9 | `/media` | Shows graceful "Coverage is coming soon" empty state (until you add stories to `src/data/media.ts`) |
| 2.10 | `/contact` | Address/phone/hours correct; **live map embed** interactive (can pan/zoom — no overlay blocking clicks); "Convenient for students from…" lists areas; FAQs include the two location questions; copy-to-clipboard rows show check + "Copied" for ~2s; success panel announces via `role="status"` |
| 2.11 | `/privacy`, `/terms` | Render; no lorem ipsum |
| 2.12 | `/enroll` (logged OUT) | Redirects to `/auth/signin?redirect=/enroll` — destination preserved after sign-in |
| 2.13 | Any garbage URL e.g. `/xyz` | Branded "Page not found" with BACK TO HOME button |
| 2.14 | Header (all pages) | Nav says **"Instructors"** (typo fixed); logo links home; Enroll Now button works; scroll hides/shows navbar; mobile drawer: tapping a nav link closes the drawer while navigating; avatar menu trigger has an accessible name ("Account menu for …") |
| 2.15 | Footer (all pages) | 5 social icons (IG/FB/YT/TikTok/X) with correct URLs; Press & Media link works; NAP block matches real data; **WhatsApp cohort-announcement capture**: submitting a number opens wa.me in a new tab |
| 2.16 | Analytics hook | With `VITE_PLAUSIBLE_DOMAIN` unset: no analytics script in view-source. Set it → `plausible.io/js/script.js` tag with `data-domain` appears |

---

## 3. SEO & Structured Data Spot Checks

| # | Check | How |
|---|---|---|
| 3.1 | Unique `<title>` + meta description per public page | View-source each page from §2 |
| 3.2 | Canonical URLs correct | Blog page 2 → `…/blog?page=2`; junk `?page=` → canonical `/blog` |
| 3.3 | OG tags absolute | All `og:image`/`og:url` start with `https://unicornbarberacademy.com` (or localhost origin in dev) |
| 3.4 | JSON-LD validates | Paste blocks into https://validator.schema.org — LocalBusiness (footer), Course (program), FAQPage (home/contact/blog posts), BreadcrumbList, BlogPosting, JobPosting (careers). All blocks are escaped via the shared `stringifyJsonLd()` helper — a post/FAQ title containing `</script>` must NOT break out of the tag |
| 3.5 | Footer LocalBusiness block | `@type` array contains **LocalBusiness**; hasMap → Google Maps URL; areaServed lists 7 neighborhoods; contactPoint has en/bn |
| 3.6 | `/robots.txt` | Allows `/`, disallows `/api/` and `/md/`, lists sitemap |
| 3.7 | `/sitemap.xml` | Valid XML; **does NOT contain `/enroll`** or any `/verify/*`; DOES contain `/media`; static routes have NO lastmod; `/blog` and category entries carry **real lastmod dates from post timestamps** (not today's date); blog posts have real lastmod |
| 3.8 | `/feed.xml` | Valid RSS, published posts only, absolute URLs. Every page's `<head>` also has RSS autodiscovery: `<link rel="alternate" type="application/rss+xml" href="/feed.xml">` |
| 3.9 | `/llms.txt` | Contains real address/phone (Banasree), program list, md-mirror links |
| 3.10 | Dashboard/auth routes are noindex | View-source any `/dashboard/*` page → `robots: noindex` |
| 3.11 | `/verify/<anything>` ships `robots: noindex` | Arbitrary certificate codes must not be indexable (meta robots, not robots.txt — crawlers can still see the directive) |
| 3.12 | og:image overrides | `/about` and `/contact` emit their own absolute og:image (page hero slot); other pages fall back to the default banner |

---

## 4. Authentication Flows

### 4.1 Email/password signup
| # | Step | Expected |
|---|---|---|
| 4.1.1 | `/auth/signup` with a NEW email | Success message; redirected to verify-email notice page |
| 4.1.2 | Copy verification link from **server terminal** (Resend off) and open it | Email verified; lands signed-in or at sign-in |
| 4.1.3 | Try signing up again with same email | Friendly error, no crash |
| 4.1.4 | Weak password / mismatched fields | Inline validation messages |

### 4.2 Sign in / out
| # | Step | Expected |
|---|---|---|
| 4.2.1 | `/auth/signin` correct credentials | Signed in; header updates **without full-page flicker** |
| 4.2.2 | Wrong password | Generic error (no user-enumeration wording) |
| 4.2.3 | Sign out | Header flips to signed-out state instantly |
| 4.2.4 | Visit `/dashboard` while signed out | Redirect to sign-in **with `?redirect=/dashboard`**; after signing in you land on `/dashboard` |
| 4.2.5 | Signed-in user visits `/auth/signin` | Bounced away (no double session confusion) |

### 4.3 Password reset
| # | Step | Expected |
|---|---|---|
| 4.3.1 | `/auth/forgot-password` with existing email | Reset link appears in server terminal |
| 4.3.2 | Use link → set new password → sign in with it | Works |
| 4.3.3 | Reuse the same reset link | Rejected (single-use) |

### 4.4 Google OAuth (only if configured)
| # | Step | Expected |
|---|---|---|
| 4.4.1 | Continue with Google | Returns to app signed-in; name/avatar populated |
| 4.4.2 | Avatar with blank/missing Google name | Header does NOT crash (initials fallback handles blank names) |

### 4.5 Second account
Create one plain **user** account (never promoted) — this is your "applicant"
for Sections 5–7.

---

## 5. Admin: Intakes First (admissions prerequisite)

Sign in as ADMIN.

| # | Step | Expected |
|---|---|---|
| 5.1 | `/dashboard` shows the role-aware sidebar; admins see Overview, Certificates, Admissions, Console, Blog, Settings | Sidebar visible on desktop; hamburger drawer on mobile with exactly those items |
| 5.2 | `/dashboard/admin` console | Stat cards render (zeros fine); "Upcoming intake seats" empty-state prompts to create intake |
| 5.3 | `/dashboard/enrollments/intakes` → create intake (future date, seats 12) | Appears in list; open-intake flag on |
| 5.4 | Create duplicate (same program/cohort/date) | Blocked with friendly "identical intake" error |
| 5.5 | Create with PAST date or invalid date (2026-02-30) | Rejected — future-date validation on CREATE |
| 5.6 | PATCH intake: seats outside 1–200 / shrink below occupied / move live intake into past | Rejected ("Seats must be between 1 and 200", "below occupied", future-date rule on PATCH too) |
| 5.7 | Delete unused intake | Works (no confirmation needed — nothing to lose) |
| 5.8 | Delete intake WITH applications | **AlertDialog opens** warning about the application count; after confirming, server still blocks with "has applications" error |
| 5.9 | Seats input: type an invalid value and blur (rejected by server) | After refetch, the input snaps back to the value actually in the DB — never keeps showing your rejected number |

---

## 6. Enrollment Flow (student account)

Sign OUT of admin; sign in as the PLAIN USER.

| # | Step | Expected |
|---|---|---|
| 6.1 | Visit `/enroll` | Intake selector shows the open intake with correct seats-left |
| 6.2 | Submit empty/invalid form | Inline field errors; error paragraph has `role="alert"` (screen-reader visible) |
| 6.3 | Invalid phone (`abc`, 40 digits) | Rejected client-side |
| 6.4 | Submit valid application | Success confirmation with reference `ENR-XXXXXX`; confirmation email printed to terminal |
| 6.5 | Submit AGAIN same intake | 409 duplicate message (friendly copy, not raw error) |
| 6.6 | Double-click submit rapidly | Only ONE application created (button disables while submitting) |
| 6.7 | `/dashboard` (student view) | My Applications card lists it with Pending badge; NO staff cards; sidebar shows Overview/Certificates/Settings only |
| 6.8 | Seats math | Intake seatsLeft dropped by 1 (check as admin later) |

---

## 7. Admissions Pipeline (admin)

| # | Step | Expected |
|---|---|---|
| 7.1 | `/dashboard/enrollments` list | Application visible; status tabs (All/Pending/In-review/Approved/**Completed**/Waitlisted/Rejected) filter correctly |
| 7.2 | Search box | Filters by name/email/phone/reference; `%` or `_` in search doesn't wildcard-match everything unexpectedly |
| 7.3 | Create ≥ 21 applications (or temporarily lower perPage) then paginate | Prev/Next changes rows AND footer count — **page param actually fetches new data** (regression check) |
| 7.4 | Status filter + search + page combined | Query string reflects all three; deep-linking the URL restores state |
| 7.5 | Export CSV | Button reads **"Export page (CSV)"** — it exports only the current page; downloads fine, opens in Excel/LibreOffice; any cell starting with `=`,`+`,`-`,`@` was neutralized (leading `'`) |
| 7.6 | Open application detail | All applicant data renders; decision-note textarea labeled. If another admin saves a note, your (untouched) textarea picks up their text on refetch; once you type, your draft is never overwritten |
| 7.7 | Transition pending→reviewing→approved | Badges update; approval email in terminal; applicant role upgraded to `student` (verify via set-role script listing or DB) |
| 7.8 | Mark fee paid → unpaid toggle | Badge flips both ways |
| 7.9 | Mark **completed** | Status becomes Completed; NO email sent (silent transition) |
| 7.10 | Certificate panel (before eligibility) | Issue button disabled with explanation when status≠completed or fee unpaid |
| 7.11 | Issue certificate (completed + paid) | Toast shows code `UBT-<year>-0001`; panel switches to issued state with Active badge + verify link |
| 7.12 | Issue again | Blocked: "already has a certificate" (409 path) |
| 7.13 | Waitlist another application | Waitlist email in terminal |
| 7.14 | Reject a third | Rejection email; decided-by/at stamped |
| 7.15 | Console `/dashboard/admin` refresh | Counts updated (pending/approved/completed/certificates=1); latest-applications table shows newest 8; intake fill bar reflects occupied seat |

---

## 8. Certificates — Student Side

Sign in as the STUDENT (the one who graduated).

| # | Step | Expected |
|---|---|---|
| 8.1 | Sidebar → Certificates | Card lists certificate: code, program title, cohort, issued date, Valid badge |
| 8.2 | Empty state (other account) | Friendly "No certificates yet" |
| 8.3 | Print / PDF | Opens print page — dashboard chrome absent; browser print preview (Ctrl+P): A4 portrait looks clean, gold frame intact, QR renders |
| 8.4 | Save as PDF | File generates correctly |
| 8.5 | Scan/print QR (or open URL shown under QR) | Lands on `/verify/<code>` showing **Valid certificate** with holder name, program, cohort, issue date |
| 8.6 | Share buttons | WhatsApp pre-fills text+URL; Facebook sharer; X intent; Copy link → toast + clipboard contains verify URL |
| 8.7 | Verify a GARBAGE code `/verify/UBT-9999-9999` | "No certificate found" state; lookup form at top re-submits and navigates |
| 8.8 | Verify lowercase code | Normalized, still resolves |

### Revocation round-trip (admin)
| # | Step | Expected |
|---|---|---|
| 8.9 | Application detail → Revoke… | **First click arms it** ("Click again to confirm revocation", red); second click revokes. Badge flips to Revoked. Restore stays a single click |
| 8.10 | Reload `/verify/<code>` | Explicit **Revoked certificate** state (not "not found") |
| 8.11 | Restore certificate | Back to Active; verify page shows Valid again |
| 8.12 | Student's cert card | Badge mirrored Revoked/Valid |

---

## 9. Profile & Settings (any signed-in user)

| # | Step | Expected |
|---|---|---|
| 9.1 | `/dashboard/settings` | Three cards render: Profile, Password, Sessions |
| 9.2 | Change display name → Save | Toast; header name updates after invalidation |
| 9.3 | Blank name / unchanged name | Save disabled |
| 9.4 | Upload avatar >2MB | Clear rejection message (2MB cap) |
| 9.4b | Upload a **text file renamed to .png** (fake extension) | Rejected 415 — the server sniffs magic bytes; declared Content-Type is never trusted |
| 9.5 | Upload valid avatar (S3 configured) | Toast; header + settings avatar update everywhere; the **previous** avatar object is deleted from the bucket (no orphaned files accumulating) |
| 9.5b | Same with NO S3 config | 503 message explains exactly which env vars are missing (graceful, not crash) |
| 9.6 | Resend verification (on unverified account) | Terminal prints fresh verification link |
| 9.7 | Change password (wrong current) | better-auth error surfaced |
| 9.8 | Change password (correct) | Success; other sessions revoked |
| 9.9 | Sessions card | Lists current device (shows "Loading sessions…" while fetching — never an ambiguous empty list); signing out current session ends it; other-session revoke removes just that row |

---

## 10. Blog CMS (admin)

| # | Step | Expected |
|---|---|---|
| 10.1 | `/dashboard/blog` list | Pagination footer works beyond 20 posts (**regression**: page param fetches); status tabs filter |
| 10.2 | New post → save draft | Editor dirty-guard: navigating away / closing tab warns while unsaved; disarms after save |
| 10.3 | Markdown toolbar | Bold/italic/heading/list/quote/code/link/image all insert correctly |
| 10.4 | Insert image (S3 configured) | Uploads, inserts URL; with NO S3 → clear "not configured" message |
| 10.5 | Publish | Post live at `/blog/<slug>`; publishedAt stamped |
| 10.6 | Rename slug of published post | Old URL 301-redirects to new (redirect table) |
| 10.7 | Unpublish/archive | Leaves public index; direct old URL handled gracefully |
| 10.8 | Draft preview as ADMIN | Draft URL renders with `noindex` meta |
| 10.9 | Draft URL as ANONYMOUS/student | Not found (no leak) |
| 10.10 | Categories | Create/rename/delete; rename has Save + Cancel buttons and Escape cancels; delete opens an **AlertDialog** warning that the public `/blog/category/<slug>` URL stops resolving; delete keeps posts (category becomes null) |
| 10.11 | Category input & slug conflict | Input labeled; renaming to a slug another category owns → friendly 409 "slug already in use", never a raw 500 |
| 10.12 | Markdown XSS attempt: post content with `<script>alert(1)</script>`, `[x](javascript:alert(1))`, `<a href="//evil.com" target="_blank">` | Nothing executes; external/protocol-relative anchors get `rel="noopener noreferrer nofollow"`; `</script>` inside a title/FAQ must not break the JSON-LD `<script>` tag (see §3.4) |
| 10.13 | Post delete (editor page) | Delete button opens an **AlertDialog** (no more "click again" timer); confirming navigates back to /dashboard/blog |

### Public blog
| # | Step | Expected |
|---|---|---|
| 10.14 | `/blog` | Cards, categories sidebar, pagination; dates render via the shared date-fns helpers ("Mar 1, 2026" style) |
| 10.15 | `/blog?page=999` | **404** (not "coming soon") — regression check |
| 10.16 | Category archive ≥3 posts | Lists; thin archive (<3) ships noindex + excluded from sitemap |
| 10.17 | Post page | Reading time, TOC anchors jump, related posts, **FAQ accordion (shadcn Accordion primitive — animated open/close)**, JSON-LD (BlogPosting/Breadcrumb/FAQ) |
| 10.18 | `/md/blog/<slug>` | Raw markdown mirror; renamed slugs redirect here too |

---

## 11. Contact Form

| # | Step | Expected |
|---|---|---|
| 11.1 | Submit valid message | Success state with reference `MSG-…`; **email arrives at hello@unicornbta.com** (with Resend) OR terminal logs skipped-send warning (without) |
| 11.2 | Received email | Reply-To = visitor's address; topic label; escaped HTML (try `<b>` in message — shows literally) |
| 11.3 | Invalid email / bad subject / oversized message (>5000 chars truncated-or-rejected per validation) | Proper 400 messages |
| 11.4 | Rate limit: 6 submissions in 1 min from same IP | 6th gets 429 "Too many requests" |
| 11.5 | Cross-site POST (curl with foreign Origin header) | 403 Forbidden |

---

## 12. Security Spot Checks (regressions)

| # | Attack | Expected result |
|---|---|---|
| 12.1 | Anonymous POST to admin server fns, e.g. `curl -X POST http://localhost:3000/_serverfn/<fnId>` style call of `listApplicationsAdminFn` / `getAdminPostFn` / `listIntakesAdminFn` | Error ("Admin access required") — **no PII/draft dump** (this was a critical hole, now closed) |
| 12.2 | Direct REST hits without session: `/api/admin/enrollments`, `/api/admin/blog`, `/api/admin/upload`, `/api/admin/certificates` | 401/403 JSON, never data |
| 12.3 | Student-role session calls admin endpoints | 403 |
| 12.4 | Spoofed `X-Forwarded-For: 1.2.3.4` on contact spam (direct, no proxy) | Rate-limit bucket keyed on nearest-proxy value — rotating fake XFF does NOT grant unlimited buckets |
| 12.5 | Open-redirect: `/auth/signin?redirect=//evil.com` and `?\redirect=/\evil.com` | sanitized to safe internal path |
| 12.6 | Upload wrong MIME / oversize / **fake-extension text file** to `/api/upload/avatar` and `/api/admin/upload` | 400/413/415 — server sniffs magic bytes; a `.txt` renamed `.png` is rejected even though the declared type looks valid |
| 12.7 | `/api/*` paths in robots | Disallowed (§3.6) |

> Finding the server-fn endpoint id: watch Network tab while loading an admin
> page as admin — the RPC URL contains the fn id. Replay it logged-out.

---

## 13. Error Handling & Resilience

| # | Scenario | Expected |
|---|---|---|
| 13.1 | Stop Postgres (or break DATABASE_URL), reload `/blog` | Branded "Something went wrong" error screen with RELOAD button (dev: error message box above it) — never the raw framework white screen |
| 13.2 | Restore DB → click RELOAD | Site recovers |
| 13.3 | Navigate fast between dashboard sections | No stuck loading states; skeletons/spinners acceptable |
| 13.4 | Browser back/forward across paginated lists & filters | State restored correctly |

---

## 14. Responsive & Accessibility Sweep

Repeat key pages at **375px**, **768px**, **1440px**:

| # | Check |
|---|
| 14.1 | Mobile drawer (Sheet) opens/closes; tapping a link closes it AND navigates |
| 14.2 | Tables scroll horizontally inside their container, don't break layout |
| 14.3 | Certificate print page usable on mobile (print dialog reachable); WhatsApp float + sticky enroll bar are hidden in print output |
| 14.4 | Keyboard-only pass: **"Skip to content" link appears on first Tab** and jumps past the header; visible focus rings everywhere |
| 14.5 | Form errors announced (role="alert" present on enroll/contact/blog-admin errors); contact success panel announces via role="status" |
| 14.6 | All images have alt text; decorative ones empty alt; blog-editor cover/alt inputs and markdown textarea are properly labeled |
| 14.7 | Color contrast on gold-on-white buttons readable |
| 14.8 | Gallery lightbox: Esc closes, arrows work, focus returns to thumbnail |
| 14.9 | prefers-reduced-motion: animations minimized (hero reveals, parallax, shimmer, marquee, count-up stats render final values instantly); **Lenis smooth scrolling is disabled entirely** |
| 14.10 | Lenis smooth scroll: wheel scrolling feels smooth/inertial on marketing pages; native (no smoothing) inside `/dashboard` and `/auth` |

---

## 15. Cross-Browser Matrix (minimum)

- [ ] Chrome (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop, if available) — especially print dialog & date inputs
- [ ] One real mobile device (iOS Safari or Android Chrome) — sheet menu, map embed touch, camera-roll avatar upload

---

## 16. Build & Production Smoke (after manual pass)

| # | Step | Expected |
|---|---|---|
| 16.1 | `bun run build` | Completes; `.output/` emitted (Nitro) |
| 16.2 | Run the built server (with prod env vars) | Boots |
| 16.3 | Hit `/`, `/blog`, sign-in, one admin page | All function; BETTER_AUTH_URL fail-fast triggers loudly if unset |
| 16.4 | CI green | GitHub Actions runs typecheck + lint + tests |

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
