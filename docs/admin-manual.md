# Admin Manual — Unicorn Barber Training Academy

How to run the academy from the dashboard. Every section below maps to a
sidebar item under **Dashboard** (admin role required).

## Console (`/dashboard/admin`)

At-a-glance overview: applications needing review, approved students,
certificates, published posts, intake seat fill, latest applications.
Start here each morning.

## Admissions (`/dashboard/enrollments`)

- **Applications table:** filter by status, program, cohort, fee; search by
  name/email/reference.
- **Review flow:** open an application → read details → set status
  (pending → reviewing → approved / waitlisted / rejected → completed).
  Terminal decisions email the applicant automatically. Approving upgrades
  the account to Student.
- **Bulk actions:** select many → change status at once.
- **Fees:** record each offline payment (taka amount, bKash/cash/bank,
  receipt ref). The Paid flag derives automatically when payments cover the
  program fee. Void mistaken entries — never edit them.

## Intakes (`/dashboard/enrollments/intakes`)

- **Create:** program + day/evening cohort + future start date + seats.
- **Programs overview** (top of page): per-program live status, seats
  filled/total, pending reviews, fees collected, fee + default seats editing,
  Live/Hide publish toggle. Hiding a program removes its intakes from the
  public apply form.
- Seats can't drop below held count; overbooked intakes warn in red.

## Certificates (`/dashboard/certificates`)

Issue for completed + fully-paid applications (code format UBT-YYYY-NNNN).
Revocation is soft — verification pages show revoked certificates as
invalid. QR codes on printouts link to `/verify/<code>`.

## Blog (`/dashboard/blog`)

Posts with SEO panel (title ≤60, description 50–160, focus keyword in title
+ slug), 3–6 takeaways, FAQ pairs, cover with alt text, related programs.
Publish/unpublish/archive from the list; "Top viewed" sorts by readership.
Renaming a slug keeps the old URL working (301). Categories managed
separately. Check the **Views** column to see what gets read.

## Users (`/dashboard/users`)

Search/filter accounts, change roles (confirmation dialog), ban with reason
+ optional expiry. **Hard rules:** you cannot change your own role, ban
yourself, ban an admin, or demote an admin. Removing a rogue admin takes
two steps by design: another admin demotes first — terminal fallback is
`bun scripts/set-role.ts`.

## Inbox (`/dashboard/inbox`)

Website contact-form messages, stored even if the notification email fails.
Unread-first, expandable, reply-by-email, mark read/replied, spam delete.

## Site (`/dashboard/site`)

Academy-global contact info, address, hours, areas served, social URLs,
homepage stats, announcement banner. Phone display text, tel:/WhatsApp
links, and map URLs derive automatically. Empty announcement hides the
banner. Changes appear site-wide immediately (visible pages + Google
structured data share one source).

## Content (Instructors / Gallery / Testimonials / FAQs)

- **Instructors:** roster with lead spotlight flag, program links, publish
  toggle, ordering. Empty photo keeps the bundled portrait.
- **Gallery:** upload-first flow (alt text required before upload),
  category, caption, ★ marks home-strip features, ordering.
- **Testimonials:** quotes with program/cohort/rating; no photo → initials
  avatar.
- **FAQs:** home + contact placements with tabs; feeds both FAQ sections
  and their Google FAQ structured data.

## Activity (`/dashboard/activity`)

Append-only trail of every privileged change: who, what, when. Filter by
action type. Read-only — rows are never edited or deleted.

## Account (`/dashboard/settings`)

Your own profile, password, and signed-in sessions. Academy-global
settings live under **Site**, not here.
