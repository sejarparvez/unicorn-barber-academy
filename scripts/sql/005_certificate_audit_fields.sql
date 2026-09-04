-- 005_certificate_audit_fields.sql
-- Add issued_by and revoked_by columns to track which admin performed
-- certificate issuance and revocation actions.

ALTER TABLE certificate
  ADD COLUMN issued_by int REFERENCES "user"(id),
  ADD COLUMN revoked_by int REFERENCES "user"(id);
