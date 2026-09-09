# Workflows — recurring academy operations

## Publishing a blog post

1. Dashboard → Blog → New post. Write in Markdown (toolbar covers
   formatting, links, images, tables).
2. Fill the SEO panel: title ≤60 chars, description 50–160, focus keyword
   present in title + slug, cover with alt text, 3–6 takeaways, FAQ pairs.
3. Add category, tags, related programs. Save as draft → preview (banner +
   noindex) → Publish. Renaming later keeps old URLs alive (301).

## Running admissions

1. Intakes page: create program/cohort/date/seats; open when ready.
2. Review applications: pending → reviewing → decision. Approval upgrades
   the account to Student and emails them.
3. Record each fee payment with method + receipt; the Paid flag derives.
4. Completed + paid → Issue certificate (verifiable code + QR).
5. Check Activity if anything looks off — every step is logged.

## Adding an instructor / gallery photo / testimonial / FAQ

Content section → form → Cloudinary upload where relevant (alt text
required) → Publish toggle → reorder with arrows. Unpublish hides
instantly; nothing deletes without an AlertDialog confirm.

## Changing site-wide info

Site page → edit → Save. Phone, address, hours, socials, stats, banner
propagate everywhere including Google structured data. Canonical site URL
stays in code.

## Triaging inbox messages

Inbox → unread-first → open → reply by email → Mark replied. Spam gets
deleted. If Resend is down, messages still land here.

## Database changes (developers)

1. Edit `prisma/schema.prisma`. 2. `bun run db:emit`. 3. `bun run
db:migrate` (direct Neon URL, never pooler). 4. `bun run db:status`.
5. Commit schema + generated files together. Never hand-write schema SQL,
never edit generated files.
