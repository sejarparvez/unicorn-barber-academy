# ADR 005 — Naive blog view counts

**Status:** accepted.

**Context:** Admin wanted per-post readership. Options: naive total
counter vs unique-visitor dedupe (IP hash + daily table + bot filtering).

**Decision:** Naive `view_count` increment, fire-and-forget, excluding
previews and signed-in admins.

**Rationale:** Counts page loads, not humans — but relative ranking across
a 5-post blog is the actual need, and the build is 1/3 the size. No
tracking cookies, no privacy surface.

**Revisit when:** numbers look bot-skewed; then add daily-unique dedupe.
