# ADR 002 — User roles stay plain-text strings

**Status:** accepted.

**Context:** Proposal to convert `user.role` to a Postgres enum for
DB-level integrity.

**Decision:** Keep `String` with the `Role` union (`user | student |
instructor | admin`) enforced in TypeScript (`src/lib/roles.ts`,
`parseRole` fail-closed at every trust boundary).

**Rationale:** better-auth owns writes to the `user` table through kysely
and expects a text column; an enum risks breaking its queries,
introspection, and future migrations for marginal gain (only three
writers exist, all constrained).

**Consequences:** Integrity lives in app code + admin UI guards (no
self-demote, no admin-demote, no self/admin ban, last-admin protection).
