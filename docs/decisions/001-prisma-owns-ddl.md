# ADR 001 — Prisma contract owns DDL, raw pg owns queries

**Status:** accepted.

**Context:** Schema lived in hand-written `scripts/sql/*.sql` files while
`prisma/schema.prisma` was documentation-only. Two sources of truth drifted
(`application_status_log` existed in SQL only; the contract used syntax the
Prisma 8 toolchain rejected).

**Decision:** `prisma/schema.prisma` is the single DDL source of truth
(`db:emit` → `db:migrate` → `db:status`). Runtime queries stay raw `pg`
(one engine per table; better-auth owns its tables via its own pool).
Neon-only; DDL runs against the direct URL, never the pooler.

**Consequences:** SQL files deleted; `*-validate.ts` still guards values
the DB no longer CHECKs (statuses, cohorts); Neon data is disposable-test
data during development.
