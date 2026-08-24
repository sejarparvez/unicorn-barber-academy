// routes/[llms.txt].tsx
// GET /llms.txt — generated per request per llmstxt.org: H1 site identity,
// blockquote summary, H2 sections of curated markdown links. Blog section
// is queried live (with key takeaways + raw-markdown mirrors) so newly
// published articles are visible to AI crawlers immediately, in lockstep
// with the dynamic sitemap.
import { createFileRoute } from "@tanstack/react-router";
import { ALL_PROGRAMS } from "@/data/programs";
import { CONTACT, SITE_URL } from "@/data/site";
import { listPublishedForLlms } from "@/server/blog-db";

export const Route = createFileRoute("/llms.txt")({
	server: {
		handlers: {
			GET: async () => {
				const posts = await listPublishedForLlms(50);

				const blogSection =
					posts.length > 0
						? posts
								.map((post) => {
									const date = post.publishedAt
										? new Date(post.publishedAt).toISOString().slice(0, 10)
										: null;
									const takeaways =
										post.takeaways.length > 0
											? ` Key points: ${post.takeaways.join(" ")}`
											: "";
									return `- [${post.title}](${SITE_URL}/blog/${post.slug}): ${post.excerpt ?? ""}${takeaways}${date ? ` (${date})` : ""} Raw markdown: ${SITE_URL}/md/blog/${post.slug}`;
								})
								.join("\n")
						: "- Articles on barbering technique and career paths are published regularly.";

				const programLine = (p: (typeof ALL_PROGRAMS)[number]) =>
					`- [${p.title}](${SITE_URL}${p.to}): ${p.description} ${p.duration}, ${p.level.toLowerCase()} level. Tuition ${p.tuition}.`;

				const llmsTxt = `# Unicorn Barber Training Academy

> A barbering and beauty & cosmetology training academy in Banasree, Rampura, Dhaka, Bangladesh. Hands-on programs taught by working industry professionals, professional kit included with every program, small cohorts, and job placement support. Nationally registered training provider with NTVQF-certified curriculum.

## About

- [About the Academy](${SITE_URL}/about): Mission, teaching philosophy, facilities, and accreditation.
- [Instructors](${SITE_URL}/instructors): Working barbers and beauty professionals who teach every cohort.
- [Student Life](${SITE_URL}/student-life): What day-to-day training at the academy looks like.
- [Gallery](${SITE_URL}/gallery): Student work, studio spaces, and transformations.
- [Blog](${SITE_URL}/blog): Articles on barbering technique and career paths.
- [Careers](${SITE_URL}/careers): Open positions at the academy.
- [Enrollment](${SITE_URL}/enroll): Apply online; seats are limited per cohort.

## Blog

${blogSection}

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
- Every blog article has a raw markdown mirror at ${SITE_URL}/md/blog/<slug> (linked in each page's head) — prefer it for extraction.
- Program facts (durations, tuition, curriculum) are maintained in one place and mirrored in schema.org Course structured data on each program page.
- Blog articles carry BlogPosting, BreadcrumbList and FAQPage structured data.
`;

				return new Response(llmsTxt, {
					status: 200,
					headers: {
						"content-type": "text/plain; charset=utf-8",
						"cache-control": "public, max-age=3600",
					},
				});
			},
		},
	},
});
