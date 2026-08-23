-- scripts/sql/003_enrollment.sql
-- Enrollment system: managed program intakes + admission applications.
--
-- Design decisions (locked with management):
--   * Applications always belong to a registered account (form is behind
--     sign-in); approval upgrades role 'user' -> 'student' (app layer).
--   * Standard admissions pipeline: pending → reviewing → approved /
--     waitlisted / rejected.
--   * Offline fee tracking only (bKash/cash at academy) — no gateway.
--   * Seats are consumed by pending/reviewing/approved applications;
--     waitlisted/rejected do NOT hold a seat. Seat integrity is enforced
--     transactionally in src/server/enrollment-db.ts (SELECT ... FOR UPDATE).
--
-- Idempotent, safe to re-run.

CREATE TABLE IF NOT EXISTS program_intake (
	id            SERIAL PRIMARY KEY,
	program_slug  VARCHAR(120) NOT NULL, -- validated against src/data/programs.ts (single source of truth)
	cohort        VARCHAR(16)  NOT NULL CHECK (cohort IN ('day', 'evening')),
	starts_on     DATE         NOT NULL,
	seats_total   INT          NOT NULL DEFAULT 12 CHECK (seats_total > 0),
	is_open       BOOLEAN      NOT NULL DEFAULT TRUE,
	created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
	UNIQUE (program_slug, cohort, starts_on)
);

CREATE INDEX IF NOT EXISTS idx_program_intake_open
	ON program_intake (program_slug, is_open, starts_on);

CREATE TABLE IF NOT EXISTS enrollment_application (
	id             SERIAL PRIMARY KEY,
	reference      VARCHAR(20)  NOT NULL UNIQUE,
	user_id        INT          NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
	intake_id      INT          NOT NULL REFERENCES program_intake(id) ON DELETE RESTRICT,
	status         VARCHAR(16)  NOT NULL DEFAULT 'pending'
		CHECK (status IN ('pending', 'reviewing', 'approved', 'waitlisted', 'rejected')),
	-- Applicant snapshot at submission time (survives profile edits).
	full_name      VARCHAR(160) NOT NULL,
	email          VARCHAR(200) NOT NULL,
	phone          VARCHAR(40)  NOT NULL,
	experience_note TEXT,
	hear_about     VARCHAR(80),
	-- Decision tracking.
	decided_at     TIMESTAMPTZ,
	decided_by     INT REFERENCES "user"(id) ON DELETE SET NULL,
	decision_note  TEXT,
	-- Offline registration-fee tracking (bKash/cash/bank at the academy).
	fee_status     VARCHAR(16)  NOT NULL DEFAULT 'unpaid'
		CHECK (fee_status IN ('unpaid', 'paid')),
	fee_paid_at    TIMESTAMPTZ,
	created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
	updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_application_status_created
	ON enrollment_application (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_application_user
	ON enrollment_application (user_id);
CREATE INDEX IF NOT EXISTS idx_application_intake
	ON enrollment_application (intake_id);
