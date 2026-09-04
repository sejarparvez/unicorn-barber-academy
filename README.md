# Unicorn Barber Training Academy

Marketing and enrollment website for **Unicorn Barber Training Academy** in Dhaka — public pages (programs, instructors, gallery, blog), a student enrollment flow, and an authenticated dashboard for application management and a blog CMS.

## Tech Stack

| Concern | Choice |
|---------|--------|
| Framework | TanStack Start (React 19, SSR) + TanStack Router |
| Build | Vite 8 + Nitro 3 |
| Styling | Tailwind CSS v4, shadcn-style UI primitives |
| Database | PostgreSQL 17+ via raw SQL (pg driver) |
| Auth | Better Auth (Google OAuth, email verification via Resend) |
| Client state | TanStack Query |
| Runtime / PM | Bun |
| Lint / format | Biome 2.x |

## Prerequisites

- [Bun](https://bun.sh/) runtime and package manager
- PostgreSQL 17+ (or a Neon serverless Postgres URL)
- A [Resend](https://resend.com/) API key for transactional email
- A [Cloudinary](https://cloudinary.com/) account for image uploads (optional for local dev)

## Quick Start

```bash
git clone <repo-url>
cd unicorn-barber-training-academy
cp .env.example .env    # fill in your values
bun install
bun run dev             # http://localhost:3000
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (Neon pooler URL) |
| `BETTER_AUTH_SECRET` | Yes | Random 32-byte secret for session signing |
| `BETTER_AUTH_URL` | Yes | App origin (e.g. `http://localhost:3000`) |
| `RESEND_API_KEY` | No | Email sending; without it, emails print to console |
| `CLOUDINARY_*` | No | Image uploads; without them, uploads show a clear error |
| `TRUSTED_PROXIES` | No | Proxy CIDRs for correct IP resolution behind a load balancer |
| `AUTH_IP_HEADERS` | No | Platform-set headers for IP detection (e.g. `x-real-ip`) |
| `VITE_PLAUSIBLE_DOMAIN` | No | Enables Plausible analytics script |

## Commands

```bash
bun install              # install dependencies
bun run dev              # dev server at http://localhost:3000
bun run build            # production build -> dist/
bun run preview          # preview production build
bun run test             # tests via `bun test`
bun run check            # biome check --write (format + lint + safe fixes)
bun run generate-routes  # regenerate route tree after adding/removing routes
```

## Project Structure

```
src/routes/       file-based routes — thin: guards, loaders, composing features
src/features/     domain components (about, auth, blog, enrollment, ...)
src/components/   shared UI: layout/, providers/, ui/ (shadcn-style primitives)
src/service/      client-side TanStack Query services + query-keys
src/lib/          isomorphic shared code: types, env parsing, roles, api clients
src/server/       SERVER-ONLY: db access, session, auth, mail, rate-limit, storage
src/data/         static site content (programs, instructors, gallery, site config)
```

## Architecture

Code flows in one direction:

```
src/routes/  →  src/features/  →  src/service/  →  src/server/
     ↓                                    ↓
  loaders                          createServerFn
     ↓                                    ↓
  src/server/*-fns.ts              src/server/*-db.ts
```

- Route loaders must not import `*-db.ts` directly — wrap calls in `*-fns.ts`
- `src/features/**` and `src/components/**` cannot import `@/server/**`
- Every query key lives in `src/service/query-keys.ts`
- Auth roles: `"user" | "student" | "instructor" | "admin"` (plain text, not Postgres enum)

## Testing

Tests colocate with source as `*.test.ts` and run with `bun test`:

```bash
bun test             # run all tests
bun test src/lib     # run tests in a specific directory
```

## Database

Uses raw SQL via the `pg` driver. Prisma schema is contract documentation only — do not use the Prisma client for writes. Migrations are in `scripts/sql/`:

```bash
# Apply schema changes (run the SQL files in order)
psql $DATABASE_URL -f scripts/sql/001_blog.sql
psql $DATABASE_URL -f scripts/sql/002_blog_slug_redirects.sql
# ... etc
```

## Deployment

Builds with Nitro as the server adapter — deploy to any Node/Bun-compatible host:

```bash
bun run build
bun run preview       # test production build locally
```

See [Nitro deployment docs](https://nitro.build/deploy) for platform-specific guides.

## License

Private — Unicorn Barber Training Academy.
