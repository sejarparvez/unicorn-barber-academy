# AGENTS.md

Guidance for AI coding assistants working in this repository.

## Project Overview

Marketing and enrollment website for **Unicorn Barber Training Academy** (Dhaka).
Public pages (programs, instructors, gallery, blog), a student enrollment flow,
and an authenticated dashboard: enrollment application management and a blog CMS
with S3-compatible image uploads.

## Tech Stack

| Concern        | Choice                                                              |
| -------------- | ------------------------------------------------------------------- |
| Framework      | TanStack Start (React 19, SSR) + TanStack Router (file-based routes) |
| Build          | Vite 8, Nitro 3 as server/deploy adapter                            |
| Styling        | Tailwind CSS v4 (+ typography plugin), shadcn-style UI primitives   |
| Database       | PostgreSQL ≥ 17 via Prisma Next (v8 RC)                             |
| Auth           | Better Auth (Google OAuth, email verification via Resend)            |
| Client state   | TanStack Query                                                      |
| Runtime / PM   | Bun — runtime, package manager (`bun.lock`), and test runner        |
| Lint / format  | Biome 2.x                                                           |

## Commands

Always use Bun:

```bash
bun install              # install dependencies
bun run dev              # dev server at http://localhost:3000
bun run build            # production build -> dist/
bun run preview          # preview production build
bun run test             # tests via `bun test`

# Quality — run before finishing any task
bun run check            # biome check --write (format + lint + safe fixes)

# Routing — REQUIRED after adding/removing/renaming anything in src/routes/
bun run generate-routes  # regenerates src/routeTree.gen.ts

# Database (Prisma Next)
bun run db:migrate       # prisma-next db init (set up database)
bun run db:emit          # regenerate contract.json/.d.ts after schema edits
bun run db:status        # migration status
```

## Setup

1. Copy `.env.example` to `.env` and fill in real values.
2. PostgreSQL 17+ is required (`DATABASE_URL`).
3. Without `RESEND_API_KEY`, email links print to the server console instead of sending.
4. Without `S3_*` variables, blog image uploads are disabled with a clear message.
5. Grant roles from repo root: `bun scripts/set-role.ts user@example.com admin`.

## Architecture

Code flows in one direction; never reverse it:

```
src/routes/      file-based routes — thin: guards, loaders, composing features
src/features/    domain components (about, auth, blog, blog-admin, enrollment, ...)
src/components/  shared UI: layout/, providers/, ui/ (shadcn-style primitives)
src/service/     client-side TanStack Query services + query-keys.ts (single source for keys)
src/lib/         isomorphic shared code: types, env parsing, roles, api clients, markdown
src/server/      SERVER-ONLY: db access, session, auth, mail, rate-limit, storage
src/data/        static site content (programs, instructors, gallery, site config)
```

### Server layer pattern (`src/server/`)

Per domain (blog, enrollment), three file types:

- `<domain>-db.ts` — Prisma data-access functions only.
- `<domain>-validate.ts` — input validation for mutations.
- `<domain>-fns.ts` — `createServerFn` wrappers that routes/loaders import.

Plus cross-cutting modules: `guards.ts` (`requireRoles`), `session.ts`
(`getSession`), `auth.ts`, `mail.ts`, `rate-limit.ts`, `storage.ts`.

Rules:

- Route loaders must **not** import `*-db.ts` directly. Wrap DB calls in
  `createServerFn` inside `*-fns.ts` so client-side navigations re-run on the server.
- `src/features/**` and `src/components/**` are Biome-enforced forbidden from
  importing `@/server/**`. Import types from `@/lib/types`, or call a server
  function from `*-fns.ts`.
- Mutating server functions validate input via `*-validate.ts` before touching
  `-db.ts`; respect `rate-limit.ts` on public write endpoints.

### Auth & roles

Roles: `"user" | "student" | "instructor" | "admin"` — typed contract in
`src/lib/roles.ts`. Stored as plain text in `User.role` because better-auth owns
writes to that table — do NOT convert to a Postgres enum.

Gate protected routes in `beforeLoad` using `requireRoles()` from
`src/server/guards.ts`:

```tsx
beforeLoad: async ({ location }) => ({
	session: await requireRoles({
		pathname: location.pathname,
		search: location.search as Record<string, string>,
		allowed: ["admin"], // omit to allow any authenticated user
	}),
}),
```

The root route loader fetches the session on every document load so `<Header/>`
renders the correct signed-in/out state during SSR without hydration flicker —
keep this intact.

### Data fetching

- Server-rendered reads: route `loader` → `*-fns.ts` server function.
- Client-side reads/mutations: TanStack Query service in `src/service/`.
- Every query key is registered in `src/service/query-keys.ts`. Convention:
  `[scope, ...params]` with detail keys nested under the same scope, so
  invalidating the parent clears every filtered list.

## Code Style

- Formatting/linting is Biome's job — run `bun run check` before finishing.
- Tabs for indentation, double quotes, organized imports.
- `verbatimModuleSyntax` is on: use `import type { ... }` for type-only imports.
- Strict TS: no unused locals or parameters.
- Never hand-edit generated files: `src/routeTree.gen.ts`,
  `prisma/schema.json`, `prisma/schema.d.ts`, `migrations/snapshots/**`.
- `src/components/ui/**` is excluded from linting (shadcn primitives); prefer
  not editing them by hand.

## Database Workflow (Prisma Next)

1. Edit `prisma/schema.prisma` (models: User, Session, Account, BlogPost,
   EnrollmentApplication, ...).
2. Run `bun run db:emit` to regenerate the contract files.
3. Apply changes with `bun run db:migrate`; verify with `bun run db:status`.
4. Commit `schema.prisma` together with regenerated contract files.

Notes:

- IDs are integer autoincrement paired with better-auth's
  `advanced.database.generateId: "serial"` (see top of schema.prisma).
- better-auth returns numeric ids as strings in its API responses — handle both.

## Testing

Tests run with `bun test` and colocate with source as `*.test.ts`
(e.g. `src/lib/redirect.test.ts`). Add new tests next to the module under test.

## Gotchas

- Adding/removing a route file without running `bun run generate-routes`
  breaks typed route imports.
- Blog slugs have a redirect table: renamed post URLs resolve with a 301 via
  `getPostForPublicFn` — preserve this behavior when touching blog routing.
- Markdown rendering goes through `marked` + `sanitize-html`
  (`src/lib/markdown.ts`). Keep sanitizing any HTML that originates from users.
- Public write endpoints must go through `src/server/rate-limit.ts`.
- The README contains TanStack Start boilerplate; this file takes precedence
  where they differ (e.g. package manager is Bun, not npm).
