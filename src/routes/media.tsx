// routes/media.tsx
// Press & media: stories featuring the academy. Content is curated in
// src/data/media.ts; this page renders it with outbound canonical links.
import { IconArrowUpRight, IconNews } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { MEDIA_FEATURES, MEDIA_TYPE_LABELS } from "@/data/media";
import { CONTACT, SITE_URL } from "@/data/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/media")({
	head: () => ({
		meta: [
			{ title: "Press & Media | Unicorn Barber Training Academy" },
			{
				name: "description",
				content:
					"TV appearances, newspaper features, and interviews with Unicorn Barber Training Academy — barbering and beauty education in Dhaka.",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: `${SITE_URL}/media` },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/media` }],
	}),
	component: MediaPage,
});

function formatDate(value: string) {
	return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

function MediaPage() {
	const features = [...MEDIA_FEATURES].sort((a, b) =>
		b.publishedOn.localeCompare(a.publishedOn),
	);

	return (
		<main className="mx-auto max-w-5xl px-6 py-24">
			<header className="max-w-2xl">
				<p className="text-[11px] font-medium tracking-[0.22em] text-primary uppercase">
					In the news
				</p>
				<h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
					Press &amp; media
				</h1>
				<p className="mt-4 text-muted-foreground">
					Stories, interviews, and TV appearances featuring our instructors,
					students, and the academy&rsquo;s mission to professionalise barbering
					in Bangladesh.
				</p>
			</header>

			{features.length === 0 ? (
				<section className="mt-16 rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
					<IconNews
						className="mx-auto h-10 w-10 text-muted-foreground/50"
						stroke={1.5}
					/>
					<h2 className="mt-4 font-heading text-xl font-semibold">
						Coverage is coming soon
					</h2>
					<p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
						We&rsquo;re gathering recent features and interviews. For press
						enquiries in the meantime, reach us at{" "}
						<a
							href={`mailto:${CONTACT.email}`}
							className="text-primary underline underline-offset-2"
						>
							{CONTACT.email}
						</a>
						.
					</p>
				</section>
			) : (
				<ul className="mt-12 grid gap-5 md:grid-cols-2">
					{features.map((feature) => (
						<li key={feature.url}>
							<a
								href={feature.url}
								target="_blank"
								rel="noopener noreferrer"
								className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/40"
							>
								<div className="flex items-center justify-between gap-3">
									<Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
										{MEDIA_TYPE_LABELS[feature.type]}
									</Badge>
									<span className="text-xs text-muted-foreground">
										{formatDate(feature.publishedOn)}
									</span>
								</div>
								<h2 className="mt-3 font-heading text-lg leading-snug font-semibold text-balance group-hover:text-primary">
									{feature.title}
								</h2>
								{feature.summary ? (
									<p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
										{feature.summary}
									</p>
								) : null}
								<p className="mt-auto flex items-center justify-between pt-4 text-sm">
									<span className="font-medium">{feature.outlet}</span>
									<IconArrowUpRight
										className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:text-primary"
										stroke={1.75}
									/>
								</p>
							</a>
						</li>
					))}
				</ul>
			)}

			<section className="mt-16 rounded-xl border border-primary/30 bg-primary/5 p-8 text-center sm:p-10">
				<h2 className="font-heading text-xl font-semibold">
					Want to cover the academy?
				</h2>
				<p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
					Journalists and creators are welcome to visit a live cohort, meet
					instructors, and film on campus.
				</p>
				<a
					href="/contact"
					className={cn(buttonVariants({ variant: "outline" }), "mt-6")}
				>
					Contact our team
				</a>
			</section>
		</main>
	);
}
