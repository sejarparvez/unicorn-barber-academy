/* --------------------------- Testimonials --------------------------- */

import { IconQuote } from "@tabler/icons-react";
import { Image } from "@unpic/react";
import { Reveal, SectionEyebrow } from "@/components/effects";
import { JsonLdScript } from "@/components/jsonld-script";
import { Card, CardContent } from "@/components/ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { SITE_URL } from "@/data/site";
import type { TestimonialView } from "@/lib/content";

function testimonialsJsonLd(testimonials: TestimonialView[]) {
	return {
		"@context": "https://schema.org",
		"@type": "EducationalOrganization",
		"@id": `${SITE_URL}/#academy`,
		name: "Unicorn Barber Training Academy",
		url: SITE_URL,
		review: testimonials.map((t) => ({
			"@type": "Review",
			reviewBody: t.quote,
			reviewRating: { "@type": "Rating", ratingValue: 5, bestRating: 5 },
			author: { "@type": "Person", name: t.name },
			itemReviewed: {
				"@type": "Course",
				name: t.program,
			},
		})),
	};
}

function TestimonialCard({ testimonial }: { testimonial: TestimonialView }) {
	return (
		<Card className="flex h-full flex-col justify-between rounded-none border-primary/15 bg-secondary">
			<CardContent className="flex flex-1 flex-col p-8">
				<IconQuote
					className="h-6 w-6 shrink-0 text-primary/60"
					stroke={1.5}
					aria-hidden="true"
				/>
				<figure className="mt-4 flex flex-1 flex-col">
					<blockquote className="flex-1 text-[15px] leading-relaxed text-secondary-foreground/80">
						&ldquo;{testimonial.quote}&rdquo;
					</blockquote>
					<figcaption className="mt-6 flex items-center gap-3">
						{testimonial.image ? (
							<Image
								src={testimonial.image}
								alt={testimonial.name}
								layout="constrained"
								width={40}
								height={40}
								loading="lazy"
								className="h-10 w-10 shrink-0 rounded-full object-cover"
							/>
						) : (
							<span
								aria-hidden="true"
								className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 font-heading text-base font-semibold text-primary"
							>
								{testimonial.name.charAt(0)}
							</span>
						)}
						<span>
							<span className="block text-sm font-semibold">
								{testimonial.name}
							</span>
							<span className="block text-xs text-secondary-foreground/65">
								{testimonial.program}, {testimonial.cohort}
							</span>
						</span>
					</figcaption>
				</figure>
			</CardContent>
		</Card>
	);
}

export default function Testimonials({ items }: { items: TestimonialView[] }) {
	return (
		<section
			className="border-t border-primary/15  px-4 py-24 lg:px-10"
			aria-labelledby="testimonials-heading"
		>
			<JsonLdScript data={testimonialsJsonLd(items)} />
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow title="What Graduates Say" id="testimonials-heading" />

				<Carousel
					opts={{ align: "start", loop: true }}
					aria-label="Graduate testimonials"
					className="mt-14"
				>
					<CarouselContent className="-ml-6">
						{items.map((testimonial, i) => (
							<CarouselItem
								key={testimonial.id}
								className="basis-full pl-6 sm:basis-1/2 lg:basis-1/3"
							>
								<Reveal delay={i * 0.1} className="h-full">
									<TestimonialCard testimonial={testimonial} />
								</Reveal>
							</CarouselItem>
						))}
					</CarouselContent>

					<div className="mt-8 flex items-center justify-end gap-3">
						<CarouselPrevious className="static translate-x-0 translate-y-0 rounded-none border-primary/30 bg-transparent text-secondary-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground" />
						<CarouselNext className="static translate-x-0 translate-y-0 rounded-none border-primary/30 bg-transparent text-secondary-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground" />
					</div>
				</Carousel>
			</div>
		</section>
	);
}
