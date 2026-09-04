/* --------------------------- Testimonials --------------------------- */

import { IconQuote } from "@tabler/icons-react";
import { Image } from "@unpic/react";
import { Reveal, SectionEyebrow } from "@/components/effects";
import { Card, CardContent } from "@/components/ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { pic } from "@/data/images";
import { SITE_URL } from "@/data/site";
import { stringifyJsonLd } from "@/lib/jsonld";

type Testimonial = {
	quote: string;
	name: string;
	program: string;
	cohort: string;
	image: string;
};

const TESTIMONIALS: Testimonial[] = [
	{
		quote:
			"I walked in barely able to hold a clipper. Fourteen weeks later I had a chair waiting for me before graduation.",
		name: "Sadman Alam",
		program: "Classic Barbering",
		cohort: "2025",
		image: pic("unicorn-student-1", 200, 200),
	},
	{
		quote:
			"Bridal & Editorial Makeup gave me an actual portfolio, not just a certificate. I booked my first wedding before I even graduated.",
		name: "Farzana Akter",
		program: "Bridal & Editorial Makeup",
		cohort: "2025",
		image: pic("unicorn-student-2", 200, 200),
	},
	{
		quote:
			"Business of Barbering paid for itself in my first month. I priced my services wrong for years before this.",
		name: "Shakil Ahmed",
		program: "Classic Barbering",
		cohort: "2024",
		image: pic("unicorn-student-3", 200, 200),
	},
];

const TESTIMONIALS_JSON_LD = {
	"@context": "https://schema.org",
	"@type": "EducationalOrganization",
	"@id": `${SITE_URL}/#academy`,
	name: "Unicorn Barber Training Academy",
	url: SITE_URL,
	review: TESTIMONIALS.map((t) => ({
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

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
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
						<Image
							src={testimonial.image}
							alt=""
							layout="constrained"
							width={40}
							height={40}
							loading="lazy"
							className="h-10 w-10 shrink-0 rounded-full object-cover"
						/>
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

export default function Testimonials() {
	return (
		<section
			className="border-t border-primary/15  px-4 py-24 lg:px-10"
			aria-labelledby="testimonials-heading"
		>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: this is fine
				dangerouslySetInnerHTML={{
					__html: stringifyJsonLd(TESTIMONIALS_JSON_LD),
				}}
			/>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow
					guard="5"
					title="What Graduates Say"
					id="testimonials-heading"
				/>

				<Carousel
					opts={{ align: "start", loop: true }}
					aria-label="Graduate testimonials"
					className="mt-14"
				>
					<CarouselContent className="-ml-6">
						{TESTIMONIALS.map((testimonial, i) => (
							<CarouselItem
								key={testimonial.name}
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
