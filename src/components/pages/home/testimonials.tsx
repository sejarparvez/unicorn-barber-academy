import { IconArrowLeft, IconArrowRight, IconQuote } from '@tabler/icons-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	useCarousel,
} from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { SectionHeading } from './section-heading';

type Testimonial = {
	name: string;
	program: string;
	quote: string;
};

// TODO: replace with real, permissioned student testimonials before launch.
const TESTIMONIALS: Testimonial[] = [
	{
		name: 'Rafiul Islam',
		program: 'Classic Barbering',
		quote:
			'I arrived never having held clippers properly. By the end I was cutting live clients — and had two job offers before graduation.',
	},
	{
		name: 'Nusrat Jahan',
		program: 'Bridal & Editorial Makeup',
		quote:
			'The instructors still work in the industry, so every class felt like the real thing. Not a slideshow, not a textbook.',
	},
	{
		name: 'Sabbir Ahmed',
		program: 'Fades & Tapers',
		quote:
			'The kit alone saved me a fortune, and the placement support put me in a chair within a month of finishing.',
	},
	{
		name: 'Sadia Rahman',
		program: 'Hair Styling & Colouring',
		quote:
			'I could already cut, but colour theory was a mystery. Now I can talk a client through a full colour service with confidence.',
	},
	{
		name: 'Imran Hossain',
		program: 'Classic Barbering',
		quote:
			'The evening cohort meant I kept my job while I trained — same instructors, same chair time, just after hours.',
	},
	{
		name: 'Farhana Akter',
		program: 'Cosmetology Fundamentals',
		quote:
			'Small classes make the difference. You get corrected in the moment, not three weeks later when the mistake is already a habit.',
	},
];

function initials(name: string) {
	return name
		.split(' ')
		.map((part) => part[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();
}

function CarouselControls() {
	const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } =
		useCarousel();

	return (
		<div className="mt-8 flex items-center justify-center gap-3">
			<Button
				variant="outline"
				size="icon"
				onClick={scrollPrev}
				disabled={!canScrollPrev}
				aria-label="Previous testimonial"
				className="rounded-full border-primary/30 text-primary hover:bg-primary/10 hover:text-primary disabled:opacity-30"
			>
				<IconArrowLeft className="size-4" stroke={1.75} />
			</Button>
			<Button
				variant="outline"
				size="icon"
				onClick={scrollNext}
				disabled={!canScrollNext}
				aria-label="Next testimonial"
				className="rounded-full border-primary/30 text-primary hover:bg-primary/10 hover:text-primary disabled:opacity-30"
			>
				<IconArrowRight className="size-4" stroke={1.75} />
			</Button>
		</div>
	);
}

export default function Testimonials() {
	return (
		<section
			aria-labelledby="testimonials-heading"
			className="relative overflow-hidden bg-background px-4 py-24 lg:px-10"
		>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute top-0 left-1/2 size-120 -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]"
			/>

			<div className="relative mx-auto max-w-7xl">
				<SectionHeading
					id="testimonials-heading"
					align="center"
					eyebrow="Student stories"
					title={
						<>
							From the chair to the{' '}
							<span className="text-primary">shop floor</span>.
						</>
					}
					description="Real students, real tools, real clients. Here is what training at Unicorn actually feels like."
				/>

				<div className="mt-14">
					<Carousel
						opts={{ align: 'start', loop: true }}
						aria-label="Student testimonials"
					>
						<CarouselContent>
							{TESTIMONIALS.map((testimonial) => (
								<CarouselItem
									key={testimonial.name}
									className="basis-full md:basis-1/2 xl:basis-1/3"
								>
									<Card className="h-full ring-inset transition-colors hover:ring-primary/30">
										<CardContent className="flex flex-1 flex-col">
											<figure className="flex h-full flex-col gap-5">
												<IconQuote
													className="size-8 text-primary/40"
													stroke={1.5}
													aria-hidden="true"
												/>

												<blockquote className="flex-1 text-pretty text-foreground/80 text-sm leading-relaxed">
													&ldquo;{testimonial.quote}&rdquo;
												</blockquote>

												<Separator />

												<figcaption className="flex items-center gap-3">
													<Avatar
														size="lg"
														className="border border-primary/30"
													>
														<AvatarFallback className="bg-primary/10 font-semibold text-primary text-xs">
															{initials(testimonial.name)}
														</AvatarFallback>
													</Avatar>
													<span className="min-w-0">
														<span className="block truncate font-semibold text-foreground text-sm">
															{testimonial.name}
														</span>
														<span className="mt-0.5 block truncate text-muted-foreground text-xs">
															{testimonial.program}
														</span>
													</span>
												</figcaption>
											</figure>
										</CardContent>
									</Card>
								</CarouselItem>
							))}
						</CarouselContent>

						<CarouselControls />
					</Carousel>
				</div>
			</div>
		</section>
	);
}
