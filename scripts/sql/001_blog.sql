-- scripts/sql/001_blog.sql
-- Blog system tables (categories + posts). Idempotent: safe to re-run.
--
-- Ownership: these tables are written by the application's own pg pool
-- (src/server/db.ts) — the same engine that owns the better-auth tables.
-- Prisma remains contract-as-documentation only (prisma/schema.prisma).
--
-- Conventions:
--   * snake_case for our own tables (better-auth keeps its camelCase).
--   * Plain VARCHAR status instead of a Postgres enum — matches how
--     better-auth stores `user.role` text, and CHECK constraint still
--     guards the allowed values.
--   * Arrays (text[]) for tags/keywords/takeaways: blog taxonomy is
--     free-form; no join-table machinery needed at this scale.

CREATE TABLE IF NOT EXISTS blog_category (
	id          SERIAL PRIMARY KEY,
	name        VARCHAR(80)  NOT NULL,
	slug        VARCHAR(120) NOT NULL UNIQUE,
	created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blog_post (
	id                  SERIAL PRIMARY KEY,
	slug                VARCHAR(220) NOT NULL UNIQUE,
	title               VARCHAR(200) NOT NULL,
	-- Short teaser used on cards + JSON-LD description fallback.
	excerpt             VARCHAR(400),
	-- Markdown source of truth. HTML is rendered server-side per request,
	-- so stored content stays diff-friendly and LLM-ready.
	content_md          TEXT         NOT NULL DEFAULT '',
	cover_image_url     TEXT,
	-- Alt text IS the image-keyword mechanism: read by crawlers, screen
	-- readers, and AI engines alike. Required whenever a cover is set
	-- (enforced in the API layer so editors can't skip it).
	cover_image_alt     VARCHAR(300),
	-- ---- SEO block (all optional; public head() falls back sensibly) ----
	meta_title          VARCHAR(200),
	meta_description    VARCHAR(400),
	focus_keyword       VARCHAR(120),
	seo_keywords        TEXT[]       NOT NULL DEFAULT '{}',
	canonical_url       TEXT,
	og_image_url        TEXT,
	noindex             BOOLEAN      NOT NULL DEFAULT FALSE,
	-- ---- AIO block: shaped for AI/LLM extraction -----------------------
	-- TL;DR bullets rendered above the article, into llms.txt, and as
	-- JSON-LD `abstract` — the format GPTBot/ClaudeBot/PerplexityBot
	-- extract most reliably.
	key_takeaways       TEXT[]       NOT NULL DEFAULT '{}',
	-- [{ "q": "...", "a": "..." }] rendered as an FAQ section plus
	-- FAQPage JSON-LD. Q&A-shaped content is heavily cited by answer
	-- engines even after Google demoted FAQ rich results.
	faq                 JSONB        NOT NULL DEFAULT '[]',
	-- Slugs from src/data/programs.ts — builds topical clusters between
	-- the journal and program pages (JSON-LD `about` references too).
	related_program_slugs TEXT[]     NOT NULL DEFAULT '{}',
	tags                TEXT[]       NOT NULL DEFAULT '{}',
	status              VARCHAR(16)  NOT NULL DEFAULT 'draft'
		CHECK (status IN ('draft', 'published', 'archived')),
	category_id         INT REFERENCES blog_category(id) ON DELETE SET NULL,
	author_id           INT REFERENCES "user"(id) ON DELETE SET NULL,
	reading_minutes     INT          NOT NULL DEFAULT 1,
	published_at        TIMESTAMPTZ,
	created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
	updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_post_published
	ON blog_post (status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_post_category
	ON blog_post (category_id);
