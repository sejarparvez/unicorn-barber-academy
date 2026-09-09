# ADR 003 — Markdown over TipTap for the blog editor

**Status:** accepted.

**Context:** Proposal to adopt a rich-text editor (TipTap) for blog posts.

**Decision:** Keep the Markdown textarea + toolbar + live preview.

**Rationale:** Single technical author; content is headings/tables/links/
images — Markdown's sweet spot. TipTap would add ~100KB bundle, a JSON
storage format needing renderers per surface (web, llms.txt, RSS), and a
content migration, for zero new capability. Markdown stays portable plain
text; the preview shares the production pipeline so it can't drift.

**Revisit when:** non-technical staff must publish, or articles need rich
embeds (video, galleries, callouts).
