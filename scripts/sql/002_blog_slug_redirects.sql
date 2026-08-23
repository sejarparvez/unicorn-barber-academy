-- scripts/sql/002_blog_slug_redirects.sql
-- Slug-rename safety net: when a published post's slug changes, its old URL
-- keeps resolving via a 301 instead of hard-404ing (preserves accumulated
-- rankings). Rows are maintained by src/server/blog-db.ts on every slug
-- change; lookups join blog_post so chains (A→B→C) resolve in one hop.
--
-- Idempotent, safe to re-run.

CREATE TABLE IF NOT EXISTS blog_slug_redirect (
	id         SERIAL PRIMARY KEY,
	old_slug   VARCHAR(220) NOT NULL UNIQUE,
	post_id    INT          NOT NULL REFERENCES blog_post(id) ON DELETE CASCADE,
	created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_slug_redirect_post
	ON blog_slug_redirect (post_id);
