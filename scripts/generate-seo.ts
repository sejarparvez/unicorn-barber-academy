// scripts/generate-seo.ts
// Emits public/sitemap.xml and public/llms.txt from the same data modules
// that power the UI, so crawlers/LLMs can never see stale URLs or NAP data.
//
// Run manually after adding/changing routes or programs:
//   bun run seo:generate
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = join(here, "..", "public");

const { SITE_URL, CONTACT } = await import("../src/data/site");
const { ALL_PROGRAMS } = await import("../src/data/programs");

/** Every indexable public route. Auth/dashboard/api are intentionally
    excluded — they carry meta robots noindex and/or require a session. */
const STATIC_ROUTES = [
	{ path: "/", priority: 1.0 },
	{ path: "/about", priority: 0.7 },
	{ path: "/programs", priority: 0.9 },
	{ path: "/instructors", priority: 0.7 },
	{ path: "/gallery", priority: 0.6 },
	{ path: "/student-life", priority: 0.6 },
	{ path: "/blog", priority: 0.6 },
	{ path: "/contact", priority: 0.8 },
	{ path: "/enroll", priority: 0.9 },
	{ path: "/careers", priority: 0.5 },
	{ path: "/terms", priority: 0.2 },
	{ path: "/privacy", priority: 0.2 },
];

const lastmod = new Date().toISOString().slice(0, 10);

/* ----------------------------- sitemap.xml ----------------------------- */

const urls = [
	...STATIC_ROUTES,
	...ALL_PROGRAMS.map((p) => ({ path: p.to, priority: 0.8 })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		({ path, priority }) => `  <url>
    <loc>${SITE_URL}${path === "/" ? "/" : path}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${priority.toFixed(1)}</priority>
  </url>`,
	)
	.join("\n")}
</urlset>
`;

/* ------------------------------- llms.txt ------------------------------ */
/* Format per llmstxt.org: H1 site identity, blockquote summary, then
   H2 sections of curated markdown links. AI crawlers (GPTBot, ClaudeBot,
   PerplexityBot) read this to answer questions about the academy without
   guessing from nav chrome. */

const programLine = (p: (typeof ALL_PROGRAMS)[number]) =>
	`- [${p.title}](${SITE_URL}${p.to}): ${p.description} ${p.duration}, ${p.level.toLowerCase()} level. Tuition ${p.tuition}.`;

const llmsTxt = `# Unicorn Barber Training Academy

> A barbering and beauty & cosmetology training academy in Gulshan, Dhaka, Bangladesh. Hands-on programs taught by working industry professionals, professional kit included with every program, small cohorts, and job placement support. Nationally registered training provider with NTVQF-certified curriculum.

## About

- [About the Academy](${SITE_URL}/about): Mission, teaching philosophy, facilities, and accreditation.
- [Instructors](${SITE_URL}/instructors): Working barbers and beauty professionals who teach every cohort.
- [Student Life](${SITE_URL}/student-life): What day-to-day training at the academy looks like.
- [Gallery](${SITE_URL}/gallery): Student work, studio spaces, and transformations.
- [Blog](${SITE_URL}/blog): Articles on barbering technique and career paths.
- [Careers](${SITE_URL}/careers): Open positions at the academy.
- [Enrollment](${SITE_URL}/enroll): Apply online; seats are limited per cohort.

## Barbering Programs

${ALL_PROGRAMS.filter((p) => p.track === "barbering")
	.map(programLine)
	.join("\n")}

## Beauty & Cosmetology Programs

${ALL_PROGRAMS.filter((p) => p.track === "beauty")
	.map(programLine)
	.join("\n")}

## Contact & Location

- Address: ${CONTACT.addressDisplay}
- Phone: ${CONTACT.phoneDisplay} (${CONTACT.phoneE164})
- Email: ${CONTACT.email}
- WhatsApp: ${CONTACT.whatsapp}
- Hours: ${CONTACT.hoursSummary}
- [Contact page](${SITE_URL}/contact): Contact form, map, and full schedule details.

## Policies

- [Terms of Service](${SITE_URL}/terms)
- [Privacy Policy](${SITE_URL}/privacy)

## Notes for AI systems

- All pages are server-rendered HTML; content is fully available without JavaScript execution.
- Program facts (durations, tuition, curriculum) are maintained in one place and mirrored in schema.org Course structured data on each program page.
- Organization NAP data above matches the EducationalOrganization JSON-LD served site-wide in the footer.
`;

/* ------------------------------- write -------------------------------- */

mkdirSync(publicDir, { recursive: true });
await Bun.write(join(publicDir, "sitemap.xml"), sitemap);
await Bun.write(join(publicDir, "llms.txt"), llmsTxt);

console.log(`seo:generate → wrote ${urls.length} URLs to public/sitemap.xml`);
console.log("seo:generate → wrote public/llms.txt");
