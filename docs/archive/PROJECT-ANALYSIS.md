# Project Analysis — Unicorn Barber Training Academy

> Deep audit conducted on the full codebase. Organized by priority for
> incremental implementation.

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [1. Bugs & Issues](#1-bugs--issues)
- [2. Missing Features](#2-missing-features)
- [3. UX Improvements](#3-ux-improvements)
- [4. Admin Experience](#4-admin-experience)
- [5. SEO Optimization](#5-seo-optimization)
- [6. Dead Code & Unused Items](#6-dead-code--unused-items)
- [7. Code Quality](#7-code-quality)
- [8. Test Coverage](#8-test-coverage)
- [9. Priority Action Plan](#9-priority-action-plan)

---

## Executive Summary

This is a well-architected, production-quality codebase with strong security,
accessibility, and SEO. The main gaps are in test coverage (~9%), loading state
UX, and some admin power-user features.

| Area | Rating |
|------|--------|
| Architecture | Excellent |
| Security | Excellent |
| Accessibility | Excellent |
| SEO | Outstanding |
| Test Coverage | Low (~9%) |
| UX Polish | Good (needs skeletons, optimistic updates) |
| Admin Power Features | Good (needs bulk ops, search, filters) |

---

## 1. Bugs & Issues

### Critical Issues

**None found.** The codebase is clean of critical bugs.

### Minor Issues

| # | Issue | Location | Severity |
|---|-------|----------|----------|
| 1 | `SectionEyebrow` unused `guard` prop — declared required in type but never destructured or used. 40+ call sites pass it to no effect. | `src/components/effects.tsx:180` | Medium |
| 2 | `useMyCertificates` exported but never imported — certificates page calls server function directly via loader. | `src/service/certificate.ts:13` | Low |
| 3 | `isStorageReady` exported but never called | `src/server/storage.ts:86` | Low |
| 4 | `isAdmin` exported but only used in tests | `src/lib/roles.ts:34` | Low |
| 5 | `SocialPlatform` type exported but never imported | `src/lib/social.ts:13` | Low |
| 6 | Stale ESLint comment in a Biome project | `src/features/gallery/gallery-page.tsx:51` | Cosmetic |
| 7 | Repo directory typo — `unicorn-barber-trainin-academy` (missing 'g') vs package.json correct spelling | Root | Cosmetic |
| 8 | `.cta.json` says `npm` but project uses `bun` | `.cta.json` | Cosmetic |

### Architecture Discrepancy

**AGENTS.md** says "Database: PostgreSQL 17+ via Prisma Next (v8 RC)" but the
actual code uses raw `pg` for all writes. Prisma Next is installed but serves
purely as contract documentation. This could confuse new contributors.

---

## 2. Missing Features

### High Impact

| Feature | Current State | Recommendation |
|---------|--------------|----------------|
| Skeleton loading states | Plain "Loading..." text in dashed boxes | Add skeleton components matching content shape |
| Route transition indicators | No visual feedback on navigation | Add top progress bar (NProgress pattern) |
| Optimistic updates | All mutations wait for server round-trip | Add for fee toggle, status changes, publish/unpublish |
| Inline form validation | Enrollment shows single error at bottom | Add field-level `aria-describedby` errors |
| Blog post search (admin) | No search in admin blog list | Add title/slug search |
| Application advanced filters | Single text field | Add date range, program, cohort, fee status filters |

### Medium Impact

| Feature | Recommendation |
|---------|----------------|
| Bulk operations | Select multiple applications, batch status change |
| Activity log/audit trail | Track who changed what and when per application |
| Keyboard shortcuts | Cmd+K for search, shortcuts in blog editor |
| Auto-save for blog posts | Periodic save to prevent data loss |
| Live markdown preview | Side-by-side preview in blog editor |
| Real-time notifications | SSE/WebSocket for new application alerts |
| Bengali localization | Add i18n framework for Bangla language support |

---

## 3. UX Improvements

### Strengths

- Excellent accessibility (skip links, ARIA labels, keyboard nav, reduced motion)
- Responsive mobile-first design with Sheet drawer nav
- Thoughtful empty states everywhere
- Consistent error recovery patterns
- Confirmation dialogs on destructive actions
- Toast notifications via Sonner
- Comprehensive `prefers-reduced-motion` support across 15+ components

### Gaps

1. **No skeleton components** — Users see "Loading..." text instead of
   content-shaped placeholders, causing layout shift and perceived slowness.
2. **No focus announcements after actions** — After status changes, fee
   toggles, etc., no screen reader announcement.
3. **Inconsistent delete confirmations** — Mix of two-click pattern and
   AlertDialog across post list and editor.
4. **Category rename loses focus** — After renaming, input disappears with
   no focus management.
5. **Pagination lacks total count** — Shows "Page 1 of 5" without
   "(100 results)".

### Recommendations

| Priority | Item | Effort |
|----------|------|--------|
| High | Add skeleton loading components | 2-3 hours |
| High | Add route transition progress bar | 1 hour |
| High | Add optimistic updates for admin mutations | 3-4 hours |
| Medium | Add inline validation to enrollment form | 2-3 hours |
| Medium | Unify delete confirmation patterns (use AlertDialog everywhere) | 1 hour |
| Medium | Add focus management after category rename | 30 min |
| Low | Add total count to pagination footers | 30 min |

---

## 4. Admin Experience

### Strengths

- Clear dashboard overview with deep-linked stats
- Intake fill-rate progress bars
- Decision note sync between admins
- CSV export (honestly labeled as "Export page")
- Two-click certificate revocation
- Dirty tracking on blog editor + enrollment forms
- Role-based navigation filtering

### Gaps

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| No bulk operations | High | Multi-select applications, batch status change |
| No activity log | High | Timeline of status changes per application |
| No real-time updates | Medium | SSE/WebSocket for new application alerts |
| Blog admin lacks search | Medium | Add title/slug search |
| Blog admin lacks category filter | Low | Add category dropdown filter |
| No keyboard shortcuts | Medium | Cmd+K search, editor shortcuts |
| No auto-save in blog editor | Medium | Periodic save to prevent data loss |
| Intake create form always visible | Low | Collapsible or modal pattern |

---

## 5. SEO Optimization

### Rating: Excellent (9/10)

| Area | Status | Notes |
|------|--------|-------|
| Meta titles | Complete | Unique title on every public page |
| Meta descriptions | Complete | All public pages covered |
| Open Graph | Very Good | Minor gaps on 5 routes |
| Twitter Cards | Good | Root defaults work; some routes lack explicit overrides |
| Canonical URLs | Complete | Every public route |
| Structured data | Outstanding | WebSite, LocalBusiness, Course, BlogPosting, FAQPage, JobPosting, Review, BreadcrumbList |
| Sitemap | Excellent | Dynamic, database-driven, real `lastmod` |
| RSS Feed | Complete | Auto-discovered via `<link rel="alternate">` |
| robots.txt | Excellent | Dual strategy with meta robots |
| AIO/LLM | Outstanding | llms.txt, markdown mirrors, key takeaways, FAQ |

### SEO Gaps

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| 1 | 6 routes missing explicit Twitter Card tags | `/instructors`, `/student-life`, `/terms`, `/privacy`, `/programs/$slug`, `/media` | Add `twitter:title` and `twitter:description` |
| 2 | `/blog/category/$slug` missing `og:description` | `blog.category.$slug.tsx` | Add `og:description` meta |
| 3 | Testimonial avatars use `alt=""` | `home/sections/testimonials.tsx:87` | Change to `alt={testimonial.name}` |
| 4 | Blog post route missing explicit `twitter:site` | `blog.$slug.tsx` | Add `twitter:site` meta |

### What's Already Excellent

- Dynamic XML sitemap with real `lastmod` timestamps
- RSS feed auto-discovered in `<head>`
- JSON-LD structured data with `@id` cross-referencing
- Safe JSON-LD serialization (`stringifyJsonLd()` prevents XSS)
- Full SEO admin panel with checklist, character counters, keyword management
- robots.txt with AI crawler allowances (14 named agents)
- Markdown mirrors for AI crawlers
- `llms.txt` per llmstxt.org spec
- noindex on drafts, thin archives, infinite URL spaces

---

## 6. Dead Code & Unused Items

### Unused Exports (Remove)

| Export | File | Action |
|--------|------|--------|
| `useMyCertificates` | `src/service/certificate.ts:13` | Remove export |
| `isStorageReady` | `src/server/storage.ts:86` | Remove export |
| `isAdmin` | `src/lib/roles.ts:34` | Remove from production exports |
| `SocialPlatform` | `src/lib/social.ts:13` | Remove export |
| `SectionEyebrow.guard` prop | `src/components/effects.tsx:180` | Remove from type + 40+ call sites |

### Internal-Only Type Exports (Un-export)

These types are only used within their own module. Un-exporting them won't
break anything but reduces public API surface:

| Type | File |
|------|------|
| `ContactPayload`, `ContactResponse` | `src/lib/api/contact.ts` |
| `SubmitApplicationPayload`, `SubmitResult` | `src/lib/api/enrollment.ts` |
| `MailInput`, `ApplicationEmailData`, `CertificateEmailData`, `ContactInquiryData` | `src/server/mail.ts` |
| `AdminGuardResult` | `src/server/admin-api.ts` |
| `MEDIA_TYPES`, `MediaType` | `src/data/media.ts` (only used in test file) |

### Dependency Placement

| Dependency | Current | Should Be |
|------------|---------|-----------|
| `dotenv` | dependencies | devDependencies (only used in CLI scripts) |
| `shadcn` | dependencies | devDependencies (CLI tool, not runtime) |

### What's Clean

- No `console.log` in client code
- No `debugger` statements
- No commented-out code blocks
- No TODO/FIXME/HACK comments
- No unused imports (Biome enforces this)

---

## 7. Code Quality

### Strengths

- **TypeScript strict mode** with `noUnusedLocals`, `noUnusedParameters`,
  `verbatimModuleSyntax`
- **Near-zero `any` usage** — only in auto-generated files
- **Excellent error handling** — `runSafe()` never leaks driver details to
  clients
- **No memory leaks** — all event listeners properly cleaned up
- **XSS defense thorough** — markdown sanitized, JSON-LD escaped, emails
  HTML-escaped
- **Consistent patterns** — server layer, query keys, validation, auth guards
- **Architecture boundaries enforced** — Biome prevents features/components
  from importing server code

### Issues to Fix

| Issue | Location | Fix |
|-------|----------|-----|
| DB row casts without runtime validation | `enrollment-db.ts`, `certificate-db.ts`, `blog-db.ts` | Use `parseApplicationStatus()` etc. in DB mappers |
| Logo markup duplicated (~30 lines) | `header/index.tsx` mobile + desktop | Extract `<Logo>` component |
| JSON-LD `dangerouslySetInnerHTML` boilerplate (30x) | Various route files | Create `<JsonLdScript>` wrapper component |
| No CSP headers | Server config | Add Content-Security-Policy |
| `isSameOrigin + overRateLimit` guard pattern duplicated | `api/upload/avatar.tsx`, `api/enroll.tsx` | Extract shared API guard middleware |

### Security Notes

| Item | Status | Note |
|------|--------|------|
| SQL injection | Protected | All queries use parameterized placeholders |
| XSS | Protected | Markdown sanitized, JSON-LD escaped |
| CSRF | Protected | `isSameOrigin()` on all POST endpoints |
| Rate limiting | Active | In-process memory (not Redis — documented limitation) |
| File uploads | Protected | MIME sniffing, size limits, Cloudinary signatures |
| Redirects | Protected | `safeRedirect()` prevents open redirects |
| Secrets in .env | Properly gitignored | Ensure repo access is restricted |
| Certificate codes | Sequential within year | Predictable format (low risk but noted) |

---

## 8. Test Coverage

### Current: ~9% by file count, ~35-40% by critical logic

| Layer | Files | Tested | Coverage |
|-------|-------|--------|----------|
| `src/lib/` | 14 | 8 | ~57% |
| `src/server/` | 17 | 5 | ~29% |
| `src/service/` | 4 | 0 | 0% |
| `src/routes/` | 54 | 0 | 0% |
| `src/features/` | 40+ | 0 | 0% |
| `src/components/` | 27 | 0 | 0% |

### Well-Tested Modules

| Module | Why It Stands Out |
|--------|-------------------|
| `server/rate-limit.test.ts` | 134 lines — IP spoofing, CIDR, IPv4/IPv6, proxy chains |
| `server/mail-templates.test.ts` | XSS escaping with `<script>`, `onerror` |
| `server/enrollment-validate.test.ts` | Bad phones, SQL injection, length caps |
| `server/blog-validate.test.ts` | URL validation, alt-text, FAQ sanitization |
| `lib/redirect.test.ts` | Open-redirect prevention |
| `lib/markdown.test.ts` | XSS sanitization, link hygiene |
| `lib/csv.test.ts` | Formula injection prevention |
| `data/content-integrity.test.ts` | Cross-referential data integrity |

### Priority Tests Needed

#### P0 — Critical Security/Business Logic

| Module | Lines to Test | Why |
|--------|---------------|-----|
| `server/guards.ts` | ~50 | Gates every protected route |
| `server/admin-api.ts` | ~40 | CSRF+session+role guard for admin API |
| `server/enrollment-db.ts` | ~100 | Seat-locking transactions, status state machine |
| `server/certificate-db.ts` | ~60 | Certificate eligibility enforcement |

#### P1 — Important Logic

| Module | Lines to Test | Why |
|--------|---------------|-----|
| `server/storage.ts` | ~80 | MIME sniffing (security-critical) |
| `lib/date.ts` | ~40 | Timezone-sensitive formatting |
| `lib/auth-errors.ts` | ~30 | Regex matching |
| `lib/preview-markdown.ts` | ~40 | Heading demotion, anchor ID dedup |
| `service/query-keys.ts` | ~20 | Key structure validation |

#### P2 — Larger Effort

| Module | Why |
|--------|-----|
| Component tests | Biggest gap — needs `@testing-library/react` setup |
| Integration tests for server functions | End-to-end with test database |
| API route handler tests | `/api/admin/*` endpoints |

---

## 9. Priority Action Plan

### Phase 1: Quick Wins (1-2 hours)

- [ ] Remove dead exports (`useMyCertificates`, `isStorageReady`, `isAdmin`, `SocialPlatform`)
- [ ] Remove `SectionEyebrow.guard` prop from type and 40+ call sites
- [ ] Remove stale ESLint comment in gallery
- [ ] Add missing Twitter Card tags to 6 routes
- [ ] Add `og:description` to `/blog/category/$slug`
- [ ] Fix testimonial avatar alt text
- [ ] Move `dotenv` and `shadcn` to devDependencies

### Phase 2: UX Polish (4-8 hours)

- [ ] Add skeleton loading components
- [ ] Add route transition progress bar
- [ ] Add optimistic updates for admin mutations
- [ ] Create `<JsonLdScript>` component to reduce boilerplate
- [ ] Create `<Logo>` component to eliminate header duplication
- [ ] Unify delete confirmation patterns (AlertDialog everywhere)
- [ ] Add focus management after category rename

### Phase 3: Admin Power Features (1-2 days)

- [ ] Add blog post search in admin
- [ ] Add application advanced filters (date range, program, cohort, fee status)
- [ ] Add inline validation to enrollment form
- [ ] Add total count to pagination footers
- [ ] Add keyboard shortcuts for admin (Cmd+K search)

### Phase 4: Testing (2-3 days)

- [ ] Add P0 tests: guards, admin-api, storage MIME sniffing
- [ ] Add P1 tests: date.ts, auth-errors.ts, preview-markdown.ts, query-keys.ts
- [ ] Add runtime validation to DB mappers (use parse* helpers)
- [ ] Set up `@testing-library/react` for component tests

### Phase 5: Larger Efforts (1-2 weeks)

- [ ] Add CSP headers
- [ ] Add bulk operations for applications
- [ ] Add activity log/audit trail
- [ ] Add auto-save for blog editor
- [ ] Add real-time notifications (SSE/WebSocket)
- [ ] Add Bengali localization (i18n framework)
- [ ] Extract shared API guard middleware

---

## Appendix: File Reference

### Key Files by Domain

| Domain | Files |
|--------|-------|
| Server layer | `src/server/{blog,enrollment,certificate}-{db,validate,fns}.ts` |
| Auth | `src/server/auth.ts`, `guards.ts`, `session.ts`, `admin-api.ts` |
| Services | `src/service/{blog,enrollment,certificate}.ts`, `query-keys.ts` |
| SEO | `src/routes/__root.tsx`, `sitemap[.]xml.tsx`, `feed[.]xml.tsx`, `llms[.]txt.tsx` |
| Static data | `src/data/{programs,instructors,gallery,site,media,images}.ts` |
| UI components | `src/components/ui/*.tsx` (19 shadcn-style primitives) |
| Feature modules | `src/features/*` (15 domains) |
| API routes | `src/routes/api/**/*.tsx` (23 endpoints) |

### Generated Files (Never Edit)

- `src/routeTree.gen.ts`
- `prisma/schema.json`
- `prisma/schema.d.ts`
- `migrations/snapshots/**`
