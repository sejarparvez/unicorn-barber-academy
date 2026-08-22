// routes/programs.$slug.tsx
import {
	IconArrowRight,
	IconCheck,
	IconClipboardCheck,
	IconPackage,
} from "@tabler/icons-react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { FinalCta, Reveal, SectionEyebrow } from "@/components/site/decor";
import { ProgramCard } from "@/components/site/program-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
	ALL_PROGRAMS,
	getProgramBySlug,
	INSTRUCTORS,
	SITE_URL,
} from "@/lib/site-data";

export const Route = createFileRoute("/programs/$slug")({
	loader: ({ params }) => {
		const program = getProgramBySlug(params.slug);
		if (!program) throw notFound();
		return { program };
	},
	head: ({ loaderData }) => {
		if (!loaderData) {
			return {
				meta: [
					{ title: "Program not found | Unicorn Barber Training Academy" },
					{ name: "robots", content: "noindex" },
				],
			};
		}
		const { program } = loaderData;
		const url = `${SITE_URL}${program.to}`;
		return {
			meta: [
				{ title: `${program.title} | Unicorn Barber Training Academy` },
				{ name: "description", content: program.description },
				{
					property: "og:title",
					content: `${program.title} | Unicorn Barber Training Academy`,
				},
				{ property: "og:description", content: program.description },
				{ property: "og:type", content: "website" },
				{ property: "og:url", content: url },
				{ property: "og:image", content: program.image },
			],
			links: [{ rel: "canonical", href: url }],
		};
	},
	component: ProgramDetailPage,
	notFoundComponent: ProgramNotFound,
});

function ProgramNotFound() {
	return (
		<main className="mx-auto max-w-xl px-6 py-32 text-center">
			<h1 className="font-heading text-3xl font-medium text-foreground">
				Program not found
			</h1>
			<p className="mt-3 text-sm text-muted-foreground">
				That program doesn&rsquo;t exist, or may have been renamed.
			</p>
			<Link
				to="/programs"
				className="mt-8 inline-flex items-center gap-2 border border-primary px-6 py-3 text-[12px] font-semibold tracking-[0.16em] text-primary hover:bg-primary hover:text-primary-foreground"
			>
				BACK TO PROGRAMS
				<IconArrowRight className="h-3.5 w-3.5" stroke={1.75} />
			</Link>
		</main>
	);
}

function ProgramDetailPage() {
	const { program } = Route.useLoaderData();

	const trackLabel =
		program.track === "barbering" ? "Barbering" : "Beauty & Cosmetology";

	const teachers = INSTRUCTORS.filter(
		(instructor) => instructor.teaches.to === program.to,
	);

	const related = ALL_PROGRAMS.filter(
		(p) => p.track === program.track && p.slug !== program.slug,
	).slice(0, 3);

	const breadcrumbJsonLd = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
			{
				"@type": "ListItem",
				position: 2,
				name: "Programs",
				item: `${SITE_URL}/programs`,
			},
			{
				"@type": "ListItem",
				position: 3,
				name: program.title,
				item: `${SITE_URL}${program.to}`,
			},
		],
	};

	const courseJsonLd = {
		"@context": "https://schema.org",
		"@type": "Course",
		name: program.title,
		description: program.description,
		educationalLevel: program.level,
		url: `${SITE_URL}${program.to}`,
		provider: {
			"@type": "EducationalOrganization",
			name: "Unicorn Barber Training Academy",
			sameAs: SITE_URL,
		},
		hasCourseInstance: [
			{
				"@type": "CourseInstance",
				courseMode: "Onsite",
				courseSchedule: {
					"@type": "Schedule",
					repeatFrequency: "Weekly",
				},
				name: "Day cohort",
			},
			{
				"@type": "CourseInstance",
				courseMode: "Onsite",
				courseSchedule: {
					"@type": "Schedule",
					repeatFrequency: "Weekly",
				},
				name: "Evening cohort",
			},
		],
		offers: {
			"@type": "Offer",
			price: program.tuition.replace(/[^\d.]/g, ""),
			priceCurrency: "BDT",
			url: `${SITE_URL}/enroll`,
		},
	};

	return (
		<main>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: this is fine
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
			/>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: this is fine
				dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
			/>

			{/* ----------------------------- Hero ----------------------------- */}
			<section className="border-b border-border bg-background px-6 pt-28 pb-16 lg:px-10 lg:pt-36 lg:pb-20">
				<div className="mx-auto max-w-7xl">
					<div className="flex flex-wrap items-center gap-2 text-[11px] tracking-[0.22em] text-muted-foreground">
						<Link to="/" className="hover:text-primary">
							HOME
						</Link>
						<span aria-hidden="true">/</span>
						<Link to="/programs" className="hover:text-primary">
							PROGRAMS
						</Link>
						<span aria-hidden="true">/</span>
						<span className="text-primary">{program.title.toUpperCase()}</span>
					</div>

					<div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
						<div>
							<Badge className="rounded-none border border-primary/40 bg-transparent px-2.5 py-1 text-[10px] tracking-[0.16em] text-primary">
								{trackLabel.toUpperCase()}
							</Badge>

							<h1 className="mt-5 font-heading text-4xl font-medium leading-[1.08] sm:text-5xl">
								{program.title}
							</h1>

							<p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
								{program.description}
							</p>

							<dl className="mt-8 grid grid-cols-2 gap-6 border-t border-border pt-6 sm:grid-cols-4">
								{[
									{ label: "Duration", value: program.duration },
									{ label: "Level", value: program.level },
									{ label: "Tuition", value: program.tuition },
									{ label: "Format", value: "Day / Evening" },
								].map((item) => (
									<div key={item.label}>
										<dt className="text-[10px] tracking-[0.18em] text-muted-foreground">
											{item.label.toUpperCase()}
										</dt>
										<dd className="mt-1 text-sm font-semibold text-foreground">
											{item.value}
										</dd>
									</div>
								))}
							</dl>

							<div className="mt-9 flex flex-wrap gap-4">
								<Link
									to="/enroll"
									className="inline-flex items-center gap-2 border border-primary bg-primary px-6 py-3.5 text-[12px] font-semibold tracking-[0.16em] text-primary-foreground transition-colors hover:bg-transparent hover:text-primary"
								>
									ENROLL IN THIS PROGRAM
								</Link>
								<Link
									to="/contact"
									className="inline-flex items-center gap-2 border border-border px-6 py-3.5 text-[12px] font-semibold tracking-[0.16em] text-foreground transition-colors hover:border-primary hover:text-primary"
								>
									ASK A QUESTION
								</Link>
							</div>
						</div>

						<div className="relative aspect-4/5 overflow-hidden lg:aspect-4/5">
							<Image
								src={program.image}
								alt={program.alt}
								layout="constrained"
								width={640}
								height={800}
								fetchPriority="high"
								loading="eager"
								className="h-full w-full object-cover"
							/>
						</div>
					</div>
				</div>
			</section>

			{/* --------------------------- Curriculum --------------------------- */}
			<section
				className="section-light bg-background px-6 py-24 lg:px-10"
				aria-labelledby="curriculum-heading"
			>
				<div className="mx-auto max-w-4xl">
					<SectionEyebrow
						guard="1"
						title="Curriculum"
						id="curriculum-heading"
					/>
					<ol className="relative mt-14">
						<div
							aria-hidden="true"
							className="absolute top-2 bottom-2 left-3.75 w-px bg-border"
						/>
						{program.curriculum.map((module, i) => (
							<li
								key={module.title}
								className="relative flex gap-6 pb-10 last:pb-0"
							>
								<span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center border-2 border-primary bg-background font-heading text-xs text-primary">
									{i + 1}
								</span>
								<div>
									<p className="text-[10px] tracking-[0.18em] text-primary">
										{module.weeks.toUpperCase()}
									</p>
									<h3 className="mt-1 text-base font-semibold text-foreground">
										{module.title}
									</h3>
									<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
										{module.description}
									</p>
								</div>
							</li>
						))}
					</ol>
				</div>
			</section>

			{/* ------------------------ Kit + Prerequisites ------------------------ */}
			<section className="border-t border-border bg-muted/40 px-6 py-24 lg:px-10">
				<div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-2">
					<Card className="rounded-none border-border bg-background">
						<CardContent className="p-8">
							<IconPackage className="h-6 w-6 text-primary" stroke={1.5} />
							<h3 className="mt-4 font-heading text-lg font-medium text-foreground">
								What&rsquo;s Included
							</h3>
							<ul className="mt-4 space-y-2.5">
								{program.kitIncludes.map((item) => (
									<li
										key={item}
										className="flex items-start gap-2.5 text-sm text-muted-foreground"
									>
										<IconCheck
											className="mt-0.5 h-4 w-4 shrink-0 text-primary"
											stroke={1.75}
										/>
										{item}
									</li>
								))}
							</ul>
						</CardContent>
					</Card>

					<Card className="rounded-none border-border bg-background">
						<CardContent className="p-8">
							<IconClipboardCheck
								className="h-6 w-6 text-primary"
								stroke={1.5}
							/>
							<h3 className="mt-4 font-heading text-lg font-medium text-foreground">
								Prerequisites
							</h3>
							<p className="mt-4 text-sm leading-relaxed text-muted-foreground">
								{program.prerequisites}
							</p>

							<h3 className="mt-8 font-heading text-lg font-medium text-foreground">
								Where Graduates Go
							</h3>
							<ul className="mt-4 space-y-2.5">
								{program.outcomes.map((item) => (
									<li
										key={item}
										className="flex items-start gap-2.5 text-sm text-muted-foreground"
									>
										<IconCheck
											className="mt-0.5 h-4 w-4 shrink-0 text-primary"
											stroke={1.75}
										/>
										{item}
									</li>
								))}
							</ul>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* ----------------------------- Instructors ----------------------------- */}
			{teachers.length > 0 && (
				<section
					className="border-t border-border bg-background px-6 py-24 lg:px-10"
					aria-labelledby="teachers-heading"
				>
					<div className="mx-auto max-w-4xl">
						<SectionEyebrow guard="2" title="Taught By" id="teachers-heading" />
						<div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
							{teachers.map((instructor) => (
								<Reveal key={instructor.name}>
									<Link
										to="/instructors"
										className="group flex items-center gap-4 border border-border p-5 transition-colors hover:border-primary/40"
									>
										<Image
											src={instructor.image}
											alt={instructor.name}
											layout="constrained"
											width={64}
											height={64}
											className="h-16 w-16 shrink-0 rounded-full object-cover grayscale transition-all group-hover:grayscale-0"
										/>
										<span>
											<span className="block text-sm font-semibold text-foreground">
												{instructor.name}
											</span>
											<span className="block text-xs text-muted-foreground">
												{instructor.title}
											</span>
											<span className="mt-1 block text-[11px] tracking-widest text-muted-foreground">
												{instructor.years} YRS EXPERIENCE
											</span>
										</span>
									</Link>
								</Reveal>
							))}
						</div>
					</div>
				</section>
			)}

			{/* --------------------------- Related programs --------------------------- */}
			{related.length > 0 && (
				<section
					className="border-t border-border bg-muted/40 px-6 py-24 lg:px-10"
					aria-labelledby="related-heading"
				>
					<div className="mx-auto max-w-7xl">
						<SectionEyebrow
							guard="3"
							title={`More in ${trackLabel}`}
							id="related-heading"
						/>
						<div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
							{related.map((p) => (
								<ProgramCard key={p.slug} program={p} />
							))}
						</div>
					</div>
				</section>
			)}

			<FinalCta
				title={program.title}
				accent="Seats are limited to this cohort's size."
				subtitle={`Ready to start? Enroll in ${program.title} or ask us anything first.`}
			/>
		</main>
	);
}
