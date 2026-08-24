-- scripts/sql/004_certificates.sql
-- Certificate system + 'completed' application status.
--
-- Design decisions:
--   * Applications gain a terminal 'completed' state (training finished).
--     Completed applications are certificate-eligible when the registration
--     fee is paid; issuance itself is an explicit admin action so codes are
--     only minted for real graduates.
--   * One certificate per issuance, code format UBT-YYYY-NNNN (per-year
--     sequence). Codes are public-facing: they power /verify/<code> lookups
--     and the QR code printed on the certificate.
--   * Revocation keeps the row (audit trail) — verify pages show revoked
--     certificates as invalid instead of hiding them.
--   * application_id is nullable ON DELETE SET NULL: deleting an old
--     application must not destroy the issued certificate.
--
-- Idempotent, safe to re-run.

-- 1. Extend the application lifecycle CHECK with 'completed'.
ALTER TABLE enrollment_application
	DROP CONSTRAINT IF EXISTS enrollment_application_status_check;
ALTER TABLE enrollment_application
	ADD CONSTRAINT enrollment_application_status_check
	CHECK (status IN ('pending', 'reviewing', 'approved', 'waitlisted', 'rejected', 'completed'));

-- 2. Issued certificates.
CREATE TABLE IF NOT EXISTS certificate (
	id             SERIAL PRIMARY KEY,
	code           VARCHAR(24) NOT NULL UNIQUE, -- UBT-YYYY-NNNN
	user_id        INT         NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
	application_id INT         REFERENCES enrollment_application(id) ON DELETE SET NULL,
	program_slug   VARCHAR(120) NOT NULL, -- validated against src/data/programs.ts
	cohort         VARCHAR(16) NOT NULL CHECK (cohort IN ('day', 'evening')),
	issued_on      DATE        NOT NULL DEFAULT CURRENT_DATE,
	revoked_at     TIMESTAMPTZ,
	revoked_reason TEXT,
	created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_certificate_user ON certificate (user_id);
CREATE INDEX IF NOT EXISTS idx_certificate_program ON certificate (program_slug);
-- One certificate per application (issuing twice mints a second code).
CREATE UNIQUE INDEX IF NOT EXISTS idx_certificate_application
	ON certificate (application_id);
