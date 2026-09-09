# Architecture — Unicorn Barber Training Academy

## Stack

TanStack Start (React 19, SSR) + TanStack Router (file-based routes),
Vite 8, Nitro 3. Tailwind CSS v4, shadcn-style UI primitives. PostgreSQL
via Prisma Next (DDL contract) + raw `pg` (all queries). Better Auth
(OAuth + email). TanStack Query client state. Bun runtime, package manager,
and test runner. Biome lint/format.

## Layer flow (one direction, never reversed)

```
src/routes/      file-based routes — thin: guards, loaders, composing features
src/features/    domain components (per page/area)
src/components/  shared UI: layout/, providers/, ui/ (shadcn primitives)
src/service/     client-side TanStack Query hooks + query-keys.ts (single source)
src/lib/         isomorphic shared code: types, validation helpers, markdown
src/server/<domain>/  SERVER-ONLY per domain: db.ts, validate.ts, fns.ts
src/server/      cross-cutting: guards, session, auth, mail, rate-limit,
                 storage, db, console-fns, program-utils
src/data/        seed sources + truly static content (program copy, image seeds)
prisma/          schema.prisma (DDL single source of truth) + generated files
```

## Server layer rules

- Route loaders never import `db.ts` — they call `createServerFn` wrappers
  from `fns.ts` so client navigations re-run on the server.
- `features/**` and `components/**` never import `@/server/**` (Biome
  enforced). Types come from `@/lib/*`.
- Mutations validate via `validate.ts` before touching `db.ts`.
- Public write endpoints go through `rate-limit.ts`; privileged fns call
  `requireAdminSession()` in-handler (route guards don't protect RPC).
- Admin mutations log to `admin_audit_log` fire-and-forget (never blocks).

## Data ownership

- **Prisma contract owns DDL.** Never hand-write schema SQL. Runtime
  queries stay raw `pg`; better-auth owns its tables via its own pool.
- **better-auth owns auth tables** (`user`, `session`, `account`,
  `verification`) including `role` as plain text — never a Postgres enum.
- **Settings merge:** DB rows overlay `data/site.ts` defaults per-key; UI
  and JSON-LD share the resolved object (`useSite()`).
- **Content images:** Cloudinary URL → bundled `pic()` seed bridge →
  shared placeholder. Pages never break during photo migration.

## Key flows

- **Enrollment:** intake → application (seat-hold transaction) → status
  pipeline (audit-logged, role upgrade on approval, decision emails) →
  fee ledger (derived paid flag) → certificate (gated on completed + paid).
- **Blog:** Markdown → sanitize → SSR HTML + TOC; slug renames leave 301s;
  view counts increment fire-and-forget (previews + admins excluded).
- **Contact:** form → validate → rate-limit → DB inbox row + notification
  email (inbox survives email failure).
