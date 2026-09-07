-- scripts/sql/006_application_status_log.sql
-- Audit trail for application status transitions. Every updateApplicationStatus
-- call inserts a row here so admins can see who changed what and when.
--
-- Idempotent, safe to re-run.

CREATE TABLE IF NOT EXISTS application_status_log (
	id              SERIAL PRIMARY KEY,
	application_id  INT          NOT NULL REFERENCES enrollment_application(id) ON DELETE CASCADE,
	admin_user_id   INT          NOT NULL REFERENCES "user"(id) ON DELETE SET NULL,
	from_status     VARCHAR(16),
	to_status       VARCHAR(16)  NOT NULL,
	note            TEXT,
	created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_status_log_application
	ON application_status_log (application_id, created_at DESC);
