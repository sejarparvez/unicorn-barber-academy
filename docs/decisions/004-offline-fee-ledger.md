# ADR 004 — Offline fee ledger with derived paid flag

**Status:** accepted.

**Context:** Fees were a manual paid/unpaid toggle — no amounts, methods,
receipts, or partials. The programs overview "collected" figure was an
estimate (paid count × fee).

**Decision:** `fee_payment` rows (amount, method, receipt, receiver,
timestamp); `enrollment_application.fee_status` derives from Σ payments ≥
program fee on every ledger write. Certificate issuance still gates on the
flag, now truthful. Existing paid rows were backfilled as ledger entries.

**Consequences:** Toggle retired (API returns 410); partials/discounts
work naturally; collected figures are actuals.
