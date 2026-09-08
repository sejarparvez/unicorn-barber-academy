// scripts/seed-pillars.ts — one-time seed of the 5 pillar posts (drafts).
// Run: bun scripts/seed-pillars.ts  (re-runnable: skips slugs that exist)
import "dotenv/config";
import { createCategory, createPost } from "@/server/blog-db";

const CATS = [
	{ name: "Career Guides", slug: "career-guides" },
	{ name: "Techniques", slug: "techniques" },
	{ name: "Courses", slug: "courses" },
];

type Pillar = Parameters<typeof createPost>[0];

const POSTS: Pillar[] = [
	{
		slug: "how-to-become-a-barber-in-dhaka",
		title: "How to Become a Barber in Dhaka: Training, Cost & Career Guide",
		excerpt:
			"Everything you need to start barbering in Dhaka — skills, training paths, real course fees, and what working barbers actually earn.",
		contentMd: `## Is barbering a good career in Dhaka?

Short answer: yes — if you train properly. Dhaka's grooming market has grown fast over the last decade. Walk through Banasree, Uttara, or Dhanmondi and you will pass a salon or barbershop on nearly every block. Demand for skilled barbers outruns supply, especially for fades, beard work, and straight-razor shaves — the services clients pay a premium for.

A street-corner shop can survive on basic cuts. But the barbers earning real money — ৳40,000 to ৳80,000+ a month in good chairs, more if they open their own shop — share one thing: formal training plus deliberate practice. This guide maps the whole path.

## What skills does a barber actually need?

Clients judge you on four things:

1. **Clipper work** — fades, tapers, clipper-over-comb. This is 70% of chair time in a modern shop.
2. **Scissor work** — classic cuts, texture, finishing.
3. **Shaving and beard design** — straight-razor shaves and beard sculpting carry the highest margins per minute.
4. **Consultation** — reading face shapes, suggesting styles, and making clients feel heard. This is what brings repeat bookings.

Sanitation and tool care underpin all of it. A barber who disinfects visibly earns trust instantly — clients notice.

## Training vs apprenticeship: which path?

The traditional path is apprenticing under a senior barber for a year or more. It works, but it has real downsides: you learn one person's habits (including bad ones), progress depends on your ustad's mood and free time, and there is no certificate at the end.

Formal training compresses that year into weeks of structured practice:

- You learn every guard length systematically, not whenever a client happens to ask for it.
- You practice on mannequins before touching paying clients.
- You graduate with a certificate you can show employers — or use to justify your chair rent.

The strongest route is both: train formally, then refine under a working barber. That is exactly what our [Classic Barbering](/programs/classic-barbering) program is designed for — fundamentals first, live chair time after.

## How long does barber training take?

It depends on your starting point and goal:

| Goal | Path | Time |
| --- | --- | --- |
| Full professional barber | Classic Barbering | 14 weeks |
| Fade specialist (already cutting) | Fades & Tapers | 6 weeks |
| Beard and shave services | Beard Sculpting | 4 weeks |

Most complete beginners go from zero to job-ready in about three to four months of hands-on training. Compare that with a year-plus of unstructured apprenticeship.

## What do barber courses cost in Dhaka?

For the full picture, read our dedicated breakdown: [Barber Course Fees in Bangladesh](/blog/barber-course-fees-bangladesh). In short, at our academy:

- **Beard Sculpting** — ৳18,000 (4 weeks)
- **Fades & Tapers** — ৳22,000 (6 weeks)
- **Classic Barbering** — ৳45,000 (14 weeks, full professional path)

The professional kit is included — clipper set, shears, straight razor, cape and towels — so there are no hidden equipment costs. Fees are paid offline at the academy (bKash or cash).

## What can you earn as a barber?

Earnings scale with skill and location:

- **Junior barber (first year):** ৳15,000–25,000/month salary, or a revenue split.
- **Experienced chair (fades + beard + shaves):** ৳40,000–80,000/month in busy areas.
- **Shop owner:** income depends on chairs and location, but a two-chair shop in a good para routinely clears six figures monthly.

The math that matters: a ৳45,000 course that lifts you from junior pay to experienced-chair pay returns itself in two to three months.

## Your next step

If you are serious, do not just read — come see the chairs. Our Fall cohort is enrolling now with limited seats per batch so every student gets one-on-one instructor time. [Apply for enrollment](/enroll) or read [how to choose the right academy](/blog/barber-training-academy-dhaka-guide) first.`,
		coverImageUrl: null,
		coverImageAlt: null,
		metaTitle: "How to Become a Barber in Dhaka (2026 Guide)",
		metaDescription:
			"Training paths, real course fees, and earnings for aspiring barbers in Dhaka. From zero to job-ready in 14 weeks.",
		focusKeyword: "become a barber in Dhaka",
		seoKeywords: ["barber training Dhaka", "barber course Dhaka", "barber career Bangladesh", "learn barbering"],
		canonicalUrl: null,
		ogImageUrl: null,
		noindex: false,
		keyTakeaways: [
			"Demand for skilled barbers in Dhaka outruns supply, especially for fades and shaves.",
			"Formal training compresses a year of apprenticeship into 14 structured weeks.",
			"Complete beginners go from zero to job-ready in about three to four months.",
			"Course fees range from ৳18,000 to ৳45,000 with the professional kit included.",
			"Experienced chairs earn ৳40,000–80,000+ per month in busy areas.",
		],
		faq: [
			{ q: "Do I need any experience to start barber training?", a: "No. The Classic Barbering program assumes zero experience — you start with tool care and sanitation and build up to live clients over 14 weeks." },
			{ q: "How long does it take to become a job-ready barber?", a: "About three to four months of hands-on training for a complete beginner, versus a year or more of unstructured apprenticeship." },
			{ q: "Is the certificate recognized by employers?", a: "Yes. You graduate with a verifiable certificate (each carries a public verification code), and employers in Dhaka hire on demonstrated skill plus certification." },
			{ q: "How do I pay the course fee?", a: "Fees are paid offline at the academy in Banasree — bKash or cash. No online gateway, no hidden charges." },
			{ q: "Day or evening cohort — which should I choose?", a: "Same curriculum and instructors. Day suits full-time students; evening suits those working a job alongside training." },
		],
		relatedProgramSlugs: ["classic-barbering", "fades-and-tapers"],
		tags: ["career", "barber training", "Dhaka", "beginners"],
		status: "draft",
		categoryId: null,
		authorId: null,
	},
	{
		slug: "skin-fade-vs-taper-difference",
		title: "Skin Fade vs Taper: What's the Difference? (Clipper Guide)",
		excerpt:
			"Skin fades and tapers look similar but serve different clients. Learn the guard work, the blending, and which to master first.",
		contentMd: `## The 30-second answer

A **skin fade** blends the hair down to bare skin, usually all around the sides and back. A **taper** gradually shortens the hair — typically at the sideburns and neckline — without ever going fully bald. Fades are bold and high-contrast; tapers are subtle and office-friendly.

If you are learning, master the taper first: every skill in a taper transfers directly to fades, but not vice versa.

## Guard lengths: the numbers behind the blend

Barbers think in guard numbers. Memorize this ladder — it is the same reference professionals check mid-cut:

| Guard | Length | Used for |
| --- | --- | --- |
| #0 / foil / razor | Skin (0 mm) | Skin-fade baseline |
| #1 | 3 mm | Low-fade blend zone |
| #2 | 6 mm | Mid-fade transition |
| #3 | 10 mm | Taper work, bulk removal |
| #4 | 13 mm | Top blend, longer styles |

A skin fade typically runs #0 up through #2 into the top. A taper lives in the #2–#4 range with scissor finishing. When clients say "not too short," they almost always mean a taper.

## Skin fade: technique walkthrough

1. **Set the baseline** — establish your lowest guideline (low, mid, or high fade) with trimmers.
2. **Skin it out** — foil shaver or razor below the guideline for a true skin finish.
3. **Build the blend** — work upward in half-guard steps (#0 → #0.5 → #1 → #1.5 → #2), flicking the wrist at the top of each stroke so lines disappear.
4. **Erase the lines** — the clipper-over-comb pass at the parietal ridge is where fades are won or lost. No visible line should remain.
5. **Detail** — edge the hairline and neckline, but ask first: some clients want the natural hairline kept.

The classic beginner mistake is rushing step 3. Blending is slow work — speed comes after muscle memory, never before.

## Taper: technique walkthrough

1. **Map the taper zone** — sideburns and nape only; the bulk stays long.
2. **Work down, then up** — start with a #2 to set length, then taper to #1 and #0.5 at the very bottom edge.
3. **Scissor-blend the top** — the taper must melt into the longer hair above with no shelf.
4. **Finish the edges** — crisp lineup, conditioned on the client's preference.

Tapers reward patience more than fades do. The blend zone is smaller, so every millimeter shows.

## Which suits which client?

- **Skin fade:** younger clients, sharp contrast lovers, coarse hair that shows lines well. Needs a redo every 1–2 weeks.
- **Taper:** professionals, first-time clients, conservative families, fine hair. Grows out gracefully over 3–4 weeks.

A working barber's advice: learn to read the client in the chair. Ask what they do for work, how often they want to return, then recommend. That consultation skill is what turns a ৳200 cut into a loyal weekly booking — and it is taught explicitly in our [Fades & Tapers](/programs/fades-and-tapers) program.

## Tools you need for both

At minimum: a quality adjustable clipper, a trimmer for guidelines, a foil shaver for skin finishes, guards #0–#4 (plus half guards), a cutting comb, and disinfectant. Our course kit includes the full professional set, so students never buy tools twice.

## Keep learning

Fades and tapers are one chapter of the craft. Pair this with [how to become a barber in Dhaka](/blog/how-to-become-a-barber-in-dhaka) for the career path, and the 6-week [Fades & Tapers](/programs/fades-and-tapers) program if you want an instructor watching your blend lines.`,
		coverImageUrl: null,
		coverImageAlt: null,
		metaTitle: "Skin Fade vs Taper: Key Differences + Clipper Guide",
		metaDescription:
			"Skin fade vs taper explained with guard lengths and step-by-step blending technique for beginners.",
		focusKeyword: "skin fade vs taper",
		seoKeywords: ["skin fade", "taper haircut", "fade haircut guide", "clipper guard lengths"],
		canonicalUrl: null,
		ogImageUrl: null,
		noindex: false,
		keyTakeaways: [
			"Skin fades blend to bare skin; tapers shorten gradually without going bald.",
			"Master the taper first — every taper skill transfers to fades.",
			"Blend upward in half-guard steps and flick the wrist to erase lines.",
			"Tapers grow out gracefully over 3–4 weeks; skin fades need redoing in 1–2.",
			"Consultation — reading the client — is as valuable as clipper skill.",
		],
		faq: [
			{ q: "Which is easier to learn, skin fade or taper?", a: "The taper. Its blend zone is smaller and more forgiving, and every technique transfers directly when you move on to skin fades." },
			{ q: "What guard numbers are used for a skin fade?", a: "Typically #0 (skin) up through #2, built in half-guard steps, blended into the top with clipper-over-comb." },
			{ q: "How often does a skin fade need redoing?", a: "Every 1–2 weeks to stay sharp. Tapers last 3–4 weeks, which is why busy professionals prefer them." },
			{ q: "Can I learn fades without a course?", a: "You can try from videos, but blend lines need an instructor watching your technique in person. Our 6-week Fades & Tapers program exists for exactly this." },
		],
		relatedProgramSlugs: ["fades-and-tapers", "classic-barbering"],
		tags: ["techniques", "fades", "clippers", "beginners"],
		status: "draft",
		categoryId: null,
		authorId: null,
	},
	{
		slug: "barber-course-fees-bangladesh",
		title: "Barber Course Fees in Bangladesh: What You Actually Pay For",
		excerpt:
			"Real barber course fees in Bangladesh (৳18,000–৳45,000), what drives the price, and how to tell value from a rip-off.",
		contentMd: `## The honest price range

In Dhaka today, barber training falls into three bands:

- **Short specializations (4–6 weeks):** ৳15,000–25,000
- **Full professional courses (12–16 weeks):** ৳40,000–55,000
- **Single-day workshops:** ৳3,000–8,000 (a taste, not a career)

At our academy the menu is simple: [Beard Sculpting](/programs/beard-sculpting) ৳18,000 · [Fades & Tapers](/programs/fades-and-tapers) ৳22,000 · [Classic Barbering](/programs/classic-barbering) ৳45,000. Below is how to judge whether any fee — ours or anyone's — is fair.

## What drives the price? Five factors

### 1. Kit: included or extra?
This is the biggest hidden-cost trap in the industry. A professional starter kit (clipper set, shears, straight razor, cape, towels) costs ৳15,000–25,000 retail. Some academies advertise a low fee, then require you to buy their kit separately. Our fees include the full kit — when comparing prices, always ask: *"Kit included?"*

### 2. Who teaches?
Working barbers cost more than textbook teachers — and teach ten times more. An instructor who cut hair yesterday shows you what clients actually ask for. Ask any academy: do instructors currently work chairs? Ours do.

### 3. Hands-on ratio
Theory is cheap; supervised chair time is expensive. Small batches (we cap at 12 seats per intake) mean the instructor watches *your* blend lines, not a crowd's. A ৳30,000 course with 40 students per batch delivers less practice than a ৳45,000 course with 12.

### 4. Duration and depth
Four weeks teaches one skill well. Fourteen weeks builds a whole professional. Do not compare a specialization fee against a full-course fee — compare like with like.

### 5. Placement and certification
A verifiable certificate (ours carry public verification codes employers can check) plus job-placement support has real monetary value in your first year. Factor it in.

## The ROI math

Take the full Classic Barbering path at ৳45,000. A junior barber earns roughly ৳15,000–25,000/month; an experienced chair with fades, beard, and shave skills earns ৳40,000–80,000/month. The course pays for itself in **two to three months** of the pay bump it creates. Few investments in Bangladesh beat that return.

## How payment works here

Fees are paid **offline at the academy in Banasree** — bKash or cash. No online gateway, no processing surcharge, no hidden charges. You pay when you enroll for the Fall cohort, and your seat is held.

## Red flags when comparing academies

- Fee quoted without saying whether the kit is included.
- No working barbers on the instructor list.
- Batch sizes above 20 with one instructor.
- No certificate, or a certificate nobody can verify.
- Pressure tactics ("discount expires today").

Read our full checklist in [how to choose a barber academy](/blog/barber-training-academy-dhaka-guide) before you pay anyone — including us.`,
		coverImageUrl: null,
		coverImageAlt: null,
		metaTitle: "Barber Course Fees in Bangladesh (2026 Prices)",
		metaDescription:
			"Real barber course fees in Bangladesh: ৳18,000–৳45,000. What drives price, kit traps, and ROI math.",
		focusKeyword: "barber course fees Bangladesh",
		seoKeywords: ["barber course fee", "barber training cost Dhaka", "barber academy price"],
		canonicalUrl: null,
		ogImageUrl: null,
		noindex: false,
		keyTakeaways: [
			"Professional barber courses in Dhaka cost ৳40,000–55,000; specializations ৳15,000–25,000.",
			"Always ask whether the kit is included — it is worth ৳15,000–25,000 alone.",
			"Working-barber instructors and small batches are what a higher fee actually buys.",
			"A ৳45,000 course typically pays for itself in two to three months of higher earnings.",
			"Fees here are paid offline (bKash/cash) with zero hidden charges.",
		],
		faq: [
			{ q: "Is the kit included in the fee?", a: "Yes. Clipper set, shears, straight razor, cape and towels are all included — no separate equipment purchase." },
			{ q: "Can I pay in installments?", a: "Talk to us at the academy — we handle fee arrangements case by case for enrolled students. Payment is offline via bKash or cash." },
			{ q: "Are there any hidden costs?", a: "No. The quoted fee covers tuition and kit. There are no exam fees, certificate fees, or material surcharges." },
			{ q: "Which course gives the best value?", a: "For a complete beginner, Classic Barbering (৳45,000, 14 weeks) — it is the full professional path. Working barbers adding a skill should take the relevant specialization." },
		],
		relatedProgramSlugs: ["classic-barbering", "fades-and-tapers", "beard-sculpting"],
		tags: ["fees", "career", "guide", "Bangladesh"],
		status: "draft",
		categoryId: null,
		authorId: null,
	},
	{
		slug: "bridal-makeup-course-dhaka",
		title: "Bridal & Editorial Makeup Course in Dhaka: What You Learn",
		excerpt:
			"Inside our 5-week bridal and editorial makeup course — curriculum, portfolio shoot, fees, and who it is really for.",
		contentMd: `## Why bridal makeup pays in Dhaka

Bangladesh's wedding season runs roughly November through February, and bridal bookings are the highest-ticket service in beauty work. A single bridal package in Dhaka commands ৳10,000–50,000+ depending on reputation — which means a ৳28,000 course can return itself from a handful of bookings. Editorial work (photo shoots, fashion, media) builds the portfolio that justifies premium pricing.

But clients can spot an untrained hand instantly in photographs. Flash exposes every blending mistake. Training matters more here than almost anywhere else in beauty.

## The 5-week curriculum, week by week

Our [Bridal & Editorial Makeup](/programs/bridal-and-editorial-makeup) program runs five weeks:

- **Weeks 1–2 — Bridal look design.** Skin prep for Bangladeshi skin tones and humidity, long-wear base that survives a full wedding day, traditional red-and-gold bridal looks plus modern minimal bridal styles.
- **Week 3 — Editorial styling techniques.** Bold, photo-driven looks: cut crease, graphic liner, avant-garde concepts for fashion work.
- **Week 4 — Photo-ready finishing.** Flash-proof setting, contour that reads on camera, false-lash and airbrush basics.
- **Week 5 — Live shoot practicum.** A real styled shoot with a model and photographer. This is the centerpiece of your portfolio — you leave with published-quality images, not just practice faces.

## Who is it for?

Two profiles succeed here:

1. **Cosmetology graduates** — if you finished [Cosmetology Fundamentals](/programs/cosmetology-fundamentals) (or equivalent), this is your specialization year. Skincare and base knowledge transfers directly.
2. **Working makeup artists** — if you already do party makeup but lose bridal bookings to better-trained competitors, five weeks closes that gap.

Pure beginners should start with Cosmetology Fundamentals first — the bridal course assumes you can already handle brushes and base.

## Kit and fee

Fee is **৳28,000** for five weeks, including the bridal and editorial kit (false-lash and airbrush basics covered). Paid offline at the academy via bKash or cash. Compare: a single mid-range bridal booking covers a third of the course.

## Portfolio: the real outcome

Certificates open doors; portfolios close deals. Bridal clients book from photos, full stop. That is why week 5 is a live shoot, not an exam — you graduate with images you can post the same day. Our instructors (working makeup artists, including specialists in bridal and editorial) art-direct the shoot with you.

## Next step

Wedding season rewards the prepared. The Fall cohort has limited seats so every student gets chair-side feedback. [Apply here](/enroll), or compare the full beauty track starting from [Cosmetology Fundamentals](/programs/cosmetology-fundamentals).`,
		coverImageUrl: null,
		coverImageAlt: null,
		metaTitle: "Bridal Makeup Course in Dhaka: Curriculum & Fees",
		metaDescription:
			"5-week bridal & editorial makeup course in Dhaka: curriculum, live portfolio shoot, and ৳28,000 fee.",
		focusKeyword: "bridal makeup course Dhaka",
		seoKeywords: ["bridal makeup training", "editorial makeup course", "makeup academy Dhaka"],
		canonicalUrl: null,
		ogImageUrl: null,
		noindex: false,
		keyTakeaways: [
			"Bridal bookings (৳10,000–50,000+) make this the highest-ROI beauty specialization.",
			"Five weeks: bridal design, editorial technique, photo finishing, live shoot.",
			"You graduate with published-quality portfolio images, not just practice work.",
			"Fee is ৳28,000 with kit included; beginners should take Cosmetology Fundamentals first.",
			"Instructors are working makeup artists who art-direct your shoot.",
		],
		faq: [
			{ q: "Can a complete beginner join the bridal course?", a: "We recommend Cosmetology Fundamentals first — the bridal course assumes brush and base competence. Working artists can join directly." },
			{ q: "Are products and models provided?", a: "Yes. The kit is included in the fee, and the week-5 live shoot includes a model and photographer." },
			{ q: "Will I get bridal bookings after the course?", a: "You leave with a portfolio, a certificate, and pricing guidance. Bookings depend on your marketing, but graduates start with material most self-taught artists take a year to build." },
			{ q: "How do I pay?", a: "Offline at the academy in Banasree — bKash or cash. No hidden charges." },
		],
		relatedProgramSlugs: ["bridal-and-editorial-makeup", "cosmetology-fundamentals"],
		tags: ["beauty", "bridal", "makeup", "courses"],
		status: "draft",
		categoryId: null,
		authorId: null,
	},
	{
		slug: "barber-training-academy-dhaka-guide",
		title: "Barber Training Academy in Dhaka: How to Choose (2026)",
		excerpt:
			"A buyer's checklist for barber academies in Dhaka — instructors, batches, kit, placement — mapped against what we offer.",
		contentMd: `## Why choosing matters more than you think

A barber course costs ৳18,000–45,000 and three to four months of your life. The wrong academy wastes both: oversized batches where nobody corrects your technique, theory with no chair time, a certificate no employer respects. Use this checklist on every academy you visit — including ours.

## The 7-point checklist

### 1. Do instructors currently work chairs?
A teacher who cut hair yesterday teaches what clients ask for today. Ask for instructor names and where they work. Our instructors are working barbers and makeup artists — that is a hiring requirement here, not a bonus.

### 2. How many students per batch?
Above 20 per instructor, individual correction stops happening. We cap intakes at 12 seats — check the [open intakes](/enroll) and do the math yourself.

### 3. Is the kit included?
A ৳30,000 fee plus a ৳20,000 compulsory kit is a ৳50,000 course. Our published fees include the full professional kit. Get any academy's answer in writing.

### 4. How much is supervised practice vs theory?
You learn barbering with clippers in hand, not in a lecture. Ask: how many hours per week on mannequins and live models? Our programs are hands-on from week one — theory exists to support practice, never replace it.

### 5. Is the certificate verifiable?
A printed certificate anyone could forge is decoration. Ours carry public verification codes — employers can confirm them at our verification page in seconds.

### 6. Is there placement support?
Training ends; earning begins. Ask what happens after graduation: employer introductions, chair-rental guidance, freelance pricing help. We provide all three.

### 7. Can you visit before paying?
Never pay an academy you have not stood inside. We are in Banasree, Dhaka — come watch a class, hold the clippers, talk to students. Then decide.

## Red flags: walk away if you see these

- "Discount expires today" pressure tactics.
- No working barbers on staff — only career trainers.
- Batch sizes above 20 with a single instructor.
- Fee quoted without a straight answer on kit inclusion.
- No certificate, or one nobody can verify.
- No live class you are allowed to observe.

## How our programs map to the checklist

| Program | Length | Fee (kit incl.) | Best for |
| --- | --- | --- | --- |
| [Classic Barbering](/programs/classic-barbering) | 14 weeks | ৳45,000 | Complete beginners → professional |
| [Fades & Tapers](/programs/fades-and-tapers) | 6 weeks | ৳22,000 | Working barbers adding fade mastery |
| [Beard Sculpting](/programs/beard-sculpting) | 4 weeks | ৳18,000 | Shave and beard services |
| [Cosmetology Fundamentals](/programs/cosmetology-fundamentals) | 16 weeks | ৳50,000 | Beauty-track beginners |
| [Bridal & Editorial Makeup](/programs/bridal-and-editorial-makeup) | 5 weeks | ৳28,000 | Makeup specialization + portfolio |

Day and evening cohorts run the same curriculum — pick around your job, not around quality. Start dates and seat counts are on the [enrollment page](/enroll); the Fall cohort is open now.

## Suggested reading before you decide

- [How to become a barber in Dhaka](/blog/how-to-become-a-barber-in-dhaka) — the career path.
- [Barber course fees in Bangladesh](/blog/barber-course-fees-bangladesh) — the full price breakdown.
- [Skin fade vs taper](/blog/skin-fade-vs-taper-difference) — taste the craft.`,
		coverImageUrl: null,
		coverImageAlt: null,
		metaTitle: "Choose a Barber Training Academy in Dhaka (Guide)",
		metaDescription:
			"7-point checklist for choosing barber training in Dhaka: instructors, batches, kit, placement. Fall cohort open.",
		focusKeyword: "barber training Dhaka",
		seoKeywords: ["barber academy Dhaka", "barber course Dhaka", "best barber training"],
		canonicalUrl: null,
		ogImageUrl: null,
		noindex: false,
		keyTakeaways: [
			"Judge academies on working instructors, batch size, kit inclusion, and verifiable certificates.",
			"Above 20 students per instructor, individual correction effectively stops.",
			"A fee without kit disclosure can hide ৳15,000–25,000 in extra costs.",
			"Always visit and observe a live class before paying anyone.",
			"Fall cohort now enrolling with 12-seat capped intakes in Banasree.",
		],
		faq: [
			{ q: "Where is the academy located?", a: "Banasree, Dhaka (Rampura area). Visit-us details and a live map are on the homepage — come observe a class before enrolling." },
			{ q: "Day or evening cohort — is one better?", a: "No. Same curriculum, same instructors, same kit. Choose around your schedule." },
			{ q: "How many seats per batch?", a: "Intakes default to 12 seats so every student gets one-on-one instructor time. Open counts are shown live on the enrollment page." },
			{ q: "Can I visit before paying?", a: "Please do — we encourage it. Watch a class, talk to students, then decide." },
		],
		relatedProgramSlugs: ["classic-barbering", "fades-and-tapers", "cosmetology-fundamentals"],
		tags: ["guide", "academy", "Dhaka", "enrollment"],
		status: "draft",
		categoryId: null,
		authorId: null,
	},
];

// Runner: create categories, resolve ids, insert drafts (skip existing slugs).
import { q } from "@/server/db";

const createdCats = [];
for (const c of CATS) {
	const existing = await q<{ id: number; name: string; slug: string }>(
		"SELECT id, name, slug FROM blog_category WHERE slug = $1",
		[c.slug],
	);
	createdCats.push(existing.rows[0] ?? (await createCategory(c)));
}
const catBySlug = new Map(createdCats.filter(Boolean).map((c) => [c!.slug, c!.id]));
const POST_CAT: Record<string, string> = {
	"how-to-become-a-barber-in-dhaka": "career-guides",
	"skin-fade-vs-taper-difference": "techniques",
	"barber-course-fees-bangladesh": "career-guides",
	"bridal-makeup-course-dhaka": "courses",
	"barber-training-academy-dhaka-guide": "courses",
};

let created = 0;
let skipped = 0;
for (const post of POSTS) {
	const dup = await q<{ id: number }>(
		"SELECT id FROM blog_post WHERE slug = $1",
		[post.slug],
	);
	if (dup.rows.length > 0) {
		skipped++;
		console.log(`skipped (exists) ${post.slug}`);
		continue;
	}
	const catSlug = POST_CAT[post.slug];
	const categoryId = catSlug ? (catBySlug.get(catSlug) ?? null) : null;
	const result = await createPost({ ...post, categoryId });
	if (result) {
		created++;
		console.log(`created draft #${result.id} ${post.slug}`);
	} else {
		skipped++;
		console.log(`FAILED ${post.slug}`);
	}
}
console.log(`seed-pillars → created ${created}, failed ${skipped}`);
process.exit(0);
