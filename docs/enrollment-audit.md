# Enrollment & Certificate Flow Audit

**Audit date:** 2026-11-08  
**Commit:** `9271823` (`updated site with the new form`)  
**Scope:** Enrollment application → approve/reject/delete → certificate → certificate edit/delete  
**Status:** Audit only — no source files were changed.

Baseline at audit time:

- `bun run test` — 343 pass, 0 fail
- `bun run typecheck` — clean

The issues below are semantic, runtime, or product gaps that the existing tests do
not cover.

## Findings at a glance

| # | Severity | Area | Finding |
|---|---|---|---|
| C1 | Critical | Admin list | Program/Cohort filters crash the query and render a false empty state |
| H1 | High | Missing feature | No application delete or applicant withdrawal |
| H2 | High | Missing feature | No certificate edit/delete; revoked certificates can never be reissued |
| H3 | High | Seats | Waitlisted → approved skips capacity checks and can overbook |
| H4 | High | Concurrency | Retry-after-unique-violation inside a transaction always fails |
| H5 | High | Roles | Approved → rejected leaves the applicant with the `student` role |
| H6 | High | Public API | Crafted `/api/enroll` requests can target hidden or non-barbering intakes |
| M1 | Medium | Fees | Ledger writes are not transactional; void is a hard delete |
| M2 | Medium | Email | Payment confirmation resends on every extra payment |
| M3 | Medium | UX/state | Quick approve/reject ignores failures; bulk invalidation is incomplete |
| M4 | Medium | Cache | Intake and application mutations do not refresh program stats |
| M5 | Medium | Search | Enrollment search escaping is broken for `%`, `_`, `\` |
| M6 | Medium | Data access | Removed program slugs make applications invisible; list totals disagree |
| S1 | Security | Certificates | Sequential codes + public verify expose graduate PII |
| S2 | Security | Rate limits | Limits are in-process memory only |
| L1–L6 | Low | Misc | Stale `decided_at`, irreversible `completed`, no DOB age bounds, no admin print, unused validator, test gaps |

---

## Critical

### C1. Program/Cohort filters break the admin applications list

**Where:** `src/server/enrollment/enrollment-db.ts:299-317`

The filter conditions can reference `i.program_slug` and `i.cohort`, but the count
query only selects from `enrollment_application a`:

```sql
SELECT count(*)::text AS count FROM enrollment_application a ${where}
```

The actual list query joins `program_intake i` (`enrollment-db.ts:339-344`), so the
two disagree. Selecting a Program or Cohort in the advanced filters produces
Postgres `missing FROM-clause entry for table "i"`. `runSafe` converts it to a
generic error, React Query has no data, and
`src/features/enrollment-admin/applications-list-page.tsx:423-427` renders
**“No applications found”** — hiding what is actually a server failure.

**Fix:** add the join to the count query:

```sql
SELECT count(*)::text AS count
FROM enrollment_application a
JOIN program_intake i ON i.id = a.intake_id
${where}
```

Add a DB-level test that exercises each filter combination, not just the parsers.

---

## High-impact missing features

### H1. No application delete or applicant withdrawal

**Where:** `src/routes/api/admin/enrollments/$id.tsx:25` only exposes `PATCH`;
there is no `DELETE`. No service/API helper exists either — the only deletes are
intakes and fee payments.

Consequences:

- Duplicate, test, or fraudulent applications are permanent.
- Applicants cannot withdraw.
- Applications tied to a program slug removed from `src/data/programs.ts` become
  invisible (`getApplicationDetail` returns `null` at `enrollment-db.ts:448-449`)
  and cannot even be cleaned up.

**Fix:** decide the policy first. A soft “withdrawn/archived” status is safer than
hard delete because `fee_payment` uses `onDelete: Restrict`
(`prisma/schema.prisma:417`) while `certificate.applicationId` uses `SetNull`
(`prisma/schema.prisma:197`). If hard delete is required, delete/void payments and
handle certificates explicitly inside one transaction, then audit it.

### H2. No certificate edit or delete; revocation is a dead end

**Where:** `src/routes/api/admin/certificates/$id.tsx:15` only supports
revoke/restore. There is no endpoint or DB function to correct `holder_name`,
`program_slug`, `cohort`, `issued_on`, or to delete a certificate.

Worse, reissue is impossible after revocation:

```ts
// certificate-db.ts:101-107
SELECT code FROM certificate WHERE application_id = $1
if (existing.rows[0]) return { ok: false, reason: "already-issued" };
```

The check ignores `revoked_at`, and `application_id` is unique, so a revoked
certificate permanently blocks a corrected replacement.

**Fix:** add an audited edit path for mutable certificate metadata, and either:

- allow reissue when the existing certificate is revoked, or
- add a soft-delete/void flag distinct from revocation and exclude it from the
  “already issued” check.

Do not implement delete as a hard `DELETE` plus `max(serial)` reuse — that would
recycle certificate codes. Keep codes unique forever.

### H3. Waitlisted → approved can overbook an intake

**Where:** `updateApplicationStatus` (`enrollment-db.ts:575-657`) validates the
transition but never counts or locks intake seats.

`SEAT_HOLDING_STATUSES` excludes `waitlisted` (`src/lib/enrollment.ts:51-56`), so
approving a waitlisted applicant increases occupancy by one with no capacity
check. `submitApplication` and `updateIntake` enforce capacity, but this path
bypasses both. The admin intakes screen only shows a warning after the fact
(`seatsWarning`, `enrollment-db.ts:846`).

**Fix:** inside the status transaction, lock the intake row (`FOR UPDATE`) and
recount seat-holding applications when moving to `approved`; return a distinct
`intake-full` result. Apply the same rule to bulk approvals.

### H4. Retry loops inside transactions cannot recover from unique violations

**Where:** `enrollment-db.ts:166-216` (reference generation) and
`certificate-db.ts:120-149` (certificate code generation).

Both catch `PG_UNIQUE_VIOLATION` and retry the next `INSERT` **inside** the same
`withTransaction` block. PostgreSQL aborts the entire transaction on a constraint
violation, so the next statement fails with `25P02`
(`current transaction is aborted`). `withTransaction` uses plain
`BEGIN`/`COMMIT`/`ROLLBACK` with no savepoints (`src/server/db.ts:54-69`).

This is rare for application references but realistic for certificates when two
admins issue at the same time.

**Fix:** one of:

- wrap each attempt in a `SAVEPOINT` / `ROLLBACK TO SAVEPOINT`;
- move the retry outside the transaction (retry the whole transaction);
- generate the code from a dedicated sequence/advisory lock;
- use `INSERT ... ON CONFLICT DO NOTHING RETURNING` and retry at the outer level.

### H5. Approved → rejected does not downgrade the `student` role

**Where:** `enrollment-db.ts:638-645` upgrades `user` → `student` on approval but
has no reverse path.

After rejecting an approved applicant, they retain student dashboard access and
identity. Do not blindly demote on every rejection though: check whether the user
has another `approved` or `completed` application first.

**Fix:** on rejection, if the current role is `student` and no other active
enrollment exists, set it back to `user`; record that in the audit log.

### H6. `/api/enroll` accepts hidden and non-barbering intakes

**Where:** `src/routes/api/enroll.tsx:45-71` calls `submitApplication` with only
the raw `intakeId`. `validateApplicationPayload` validates the ID is a positive
integer (`enrollment-validate.ts:68-71`), and `submitApplication` checks only
`is_open`, start date, capacity, and duplicates (`enrollment-db.ts:139-163`).

There is no check that the intake's program is published or that its track is
`barbering`. `listOpenIntakes` does filter both (`enrollment-db.ts:47-91`), but the
route only uses it **after** a successful insert, to build the confirmation email
(`enroll.tsx:94-98`). A crafted request can therefore apply to a hidden or
beauty-track intake.

**Fix:** resolve the intake + program inside `submitApplication` and require
`program.is_published` and `program.track = 'barbering'` before inserting. Return
a distinct error reason.

---

## Data integrity & concurrency

### M1. Fee ledger writes are non-atomic and void is a hard delete

**Where:** `recordFeePayment` (`enrollment-db.ts:698-730`) inserts, then recomputes
in a separate pool query. `deleteFeePayment` (`enrollment-db.ts:732-743`) deletes,
then recomputes. No transaction or row lock serializes them.

Risks: a failed or interleaved recompute leaves `fee_status` stale, and concurrent
record/void operations can race. “Void” permanently destroys the payment row and
receipt; only a summary remains in `admin_audit_log`.

**Fix:** use `withTransaction` with `SELECT ... FOR UPDATE` on the application,
write the ledger row, and recompute `fee_status` in the same transaction. Prefer
soft-void columns (`voided_at`, `voided_by`, `void_reason`) over `DELETE`.

### M2. Payment confirmation email resends on every extra payment

**Where:** `src/routes/api/admin/enrollments/$id.tsx:98-122`

After recording any payment, the route fetches the detail and sends the email
whenever `feeStatus === "paid"`. It never checks whether the ledger just
transitioned from `unpaid` to `paid`. A second payment after full settlement sends
another “Payment confirmed” email.

**Fix:** have `recordFeePayment` return the previous and new fee status, and send
only on `unpaid → paid`.

---

## UX and cache/state issues

### M3. Quick approve/reject ignores failures; bulk invalidation is incomplete

**Where:** `src/features/enrollment-admin/applications-list-page.tsx:547-566`
calls the bulk mutation for single-row approve/reject with no confirmation and no
`onError`. The route returns HTTP 200 even when every transition failed
(`{ applied: 0, failed: [...] }`), so illegal transitions look successful.

`useBulkSetApplicationStatus` only invalidates `applications` and `intakes`
(`src/service/enrollment.ts:162-170`, `:273-283`). It misses `consoleOverview`,
`myApplications`, and program stats.

**Fix:** inspect the result, toast partial failures, add confirmation for
destructive actions, and invalidate all derived query keys.

### M4. Intake mutations leave program stats stale

**Where:** `useCreateIntake`, `useUpdateIntake`, `useDeleteIntake`
(`src/service/enrollment.ts:227-270`) invalidate `intakes` and `openIntakes` only.

The admin program list derives `openIntakes`, `seatsTotal`, `seatsFilled`,
`pendingCount`, and `collectedPoisha` from those tables
(`src/server/program/program-db.ts:60-76`). Application status/fee mutations also
fail to invalidate `programs()`. The dashboard shows stale figures until a manual
refetch.

**Fix:** invalidate `queryKeys.programs()` on all intake and application
mutations.

### M5. Enrollment search escaping is broken

**Where:** `enrollment-db.ts:292-297` builds `%${escapeLike(term)}%`, but uses
`ESCAPE ''`. `escapeLike` inserts backslashes (`src/server/fn-utils.ts:29-31`), and
`ESCAPE ''` disables the escape character, so searching for `%`, `_`, or `\` never
matches literally.

The blog list does this correctly with `ESCAPE '\\'`
(`src/server/blog/blog-db.ts:464`). The users search has the same `ESCAPE ''` bug
(`src/server/users/users-db.ts:51`).

**Fix:** use the same `ESCAPE '\\'` pattern as the blog query, or switch to a
non-backslash escape character and update `escapeLike` consistently.

### M6. Removed program slugs make records invisible and break counts

**Where:** `getApplicationDetail` returns `null` when
`programTitle(row.program_slug)` is falsy (`enrollment-db.ts:448-449`); the list
drops rows the same way (`enrollment-db.ts:350-353`) while `total` comes from the
count query (`enrollment-db.ts:318`).

If a program is removed from `src/data/programs.ts`, existing applications
disappear from the admin UI and the displayed total can be larger than the rendered
rows. Combined with H1, those rows cannot be managed at all.

**Fix:** fall back to the database program title or raw slug instead of dropping
rows; join `program` in the list query and keep the count consistent.

---

## Security / privacy

### S1. Sequential certificate codes plus public verification expose graduate PII

**Where:** codes are minted as `UBT-YYYY-NNNN` from `max(serial) + 1`
(`certificate-db.ts:109-122`). The public verify function returns `holderName`,
program, cohort, and issue date without authentication
(`certificate-fns.ts:88-110`).

Anyone can walk `/verify/UBT-2026-0001`, `0002`, … and harvest names and program
details. The 30/min per-IP limit is a speed bump, not a control, and is per
process.

**Fix:** use high-entropy random codes (e.g. 10+ base32 characters) and/or disclose
less data publicly. Keep a persistent rate limit on verification.

### S2. Rate limits are in-process memory only

**Where:** `src/server/rate-limit.ts:7-11` explicitly documents this. It applies to
`/api/enroll`, contact, and certificate verification.

On multiple instances/replicas, limits multiply; restarts reset counters.

**Fix:** move to a shared store (Redis/Upstash) or enforce limits at the
platform/WAF layer.

---

## Lower-priority issues

- **L1 — Stale decision metadata:** `decided_at` / `decided_by` are stamped only
  on the first terminal decision (`enrollment-db.ts:604-621`). After
  `approved → rejected`, the application still shows the original approval
  timestamp; only the status log has the true history. Either update on every
  terminal transition or rename the fields to indicate “first decision.”
- **L2 — `completed` is irreversible:** `APPLICATION_TRANSITIONS` makes it
  terminal (`src/lib/enrollment.ts:47-48`). A mistaken completion cannot be undone
  in the app, and certificate issuance depends on this state. Add an audited admin
  override if mistakes are possible.
- **L3 — No date-of-birth age policy:** validation only rejects future dates
  (`src/server/enrollment/enrollment-validate.ts:91-94`). Add a business range
  (e.g. 14–80) if the academy requires one.
- **L4 — Admins cannot print a graduate's certificate:** the print route calls
  `getMyCertificateFn` and the query is ownership-scoped
  (`src/routes/certificates.$id.print.tsx:25-30`,
  `certificate-db.ts:203-211`). Admins can only print certificates they personally
  own. Add an admin-scoped print function if office reprints are needed.
- **L5 — Unused validator:** `parseFeePaymentPayload` exists and is tested
  (`src/server/enrollment/enrollment-validate.ts:269`) but the payment route
  duplicates validation inline (`src/routes/api/admin/enrollments/$id.tsx:50-70`).
  Wire it up to prevent divergence.
- **L6 — Test gap:** `src/server/enrollment/enrollment-bulk.test.ts` re-tests
  parsers and inline array logic rather than calling the route or DB. There are no
  integration tests for filter SQL, seat transitions, fee recomputation, or
  certificate issuance. That is why C1, H3, and H4 escaped.

---

## Remediation progress

Updated 2026-11-08 while addressing the audit:

| Finding | Status | Notes |
|---|---|---|
| C1 | Fixed | Count query now joins `program_intake`; read-only filter regression test added |
| H3 | Fixed | Waitlist → approved locks the intake and checks seat capacity |
| H4 | Fixed | Reference/certificate inserts use `ON CONFLICT … DO NOTHING` retries instead of aborting the transaction |
| H5 | Fixed | Rejection demotes `student` → `user` only when no other approved/completed application remains |
| H6 | Fixed | Submission requires a published barbering program |
| M1 | Partial | Ledger writes and fee-status recompute are now in one transaction; soft-void still pending |
| M2 | Fixed | Confirmation email sends only on an `unpaid → paid` transition |
| M3 | Fixed | Quick actions confirm and report failures; bulk mutation invalidates derived queries |
| M4 | Fixed | Intake/application mutations now invalidate program stats |
| M5 | Fixed | Enrollment (and users) search use the correct `ESCAPE` clause |
| M6 | Fixed | Stale program slugs fall back to the slug; list totals match rendered rows |
| L1 | Fixed | `decided_at`, `decided_by`, and the decision note update on every terminal transition |
| L4 | Fixed | Admins can reprint any certificate from the registry or application detail; print lookup allows owner or admin |
| L5 | Fixed | Payment route now uses `parseFeePaymentPayload` |
| L6 | Partial | Added a read-only DB regression test for list filters; broader integration coverage still pending |

Still open: H1, H2, S1, S2, L2, L3.

## Suggested fix order

1. **C1, M5, H4** — small changes with disproportionate impact: restore filters,
   correct escaping, fix retry/transaction handling.
2. **H3, H5, H6** — enforce capacity on approval, define the role-downgrade policy,
   and validate publication/track server-side.
3. **H1, H2** — add application delete/withdraw and certificate
   correction/reissue, with audit trails and explicit handling of
   payments/certificates.
4. **M1, M2, M3, M4** — transactional fee ledger, transition-based email,
   result-aware bulk actions, and complete cache invalidation.
5. **S1, S2, M6** — randomize certificate codes, move rate limiting to a shared
   store, and stop dropping applications with unknown program slugs.
6. Add DB-backed tests for the filter query, seat approval, fee transitions, and
   certificate issuance.
