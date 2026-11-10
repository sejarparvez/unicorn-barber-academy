import { Image } from "@unpic/react";
import { SectionEyebrow } from "@/components/effects";
import { pic } from "@/data/images";

/* ----------------------------- Our story ----------------------------- */

export default function OurStory() {
	return (
		<section
			className="section-light bg-background px-6 py-24 lg:px-10"
			aria-labelledby="story-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow title="Our Story" id="story-heading" />
				<div className="mt-14 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
					<div>
						<p className="text-base leading-relaxed text-muted-foreground">
							Most training academies feel like classrooms. Ours feels like a
							shop — because it is one. Unicorn started when a group of working
							barbers and beauty professionals in Dhaka realised the gap between
							what schools taught and what the chair actually demanded.
						</p>
						<p className="mt-4 text-base leading-relaxed text-muted-foreground">
							We built the academy we wished existed when we were learning:
							small cohorts, real clients, instructors who still hustle behind
							the chair, and a curriculum that leads to an NTVQF-recognised
							certificate and a job, not just a piece of paper.
						</p>
						<p className="mt-4 text-base leading-relaxed text-muted-foreground">
							Today, we're a nationally registered training provider and a proud
							member of the Bangladesh Barbers & Beauticians Guild. Our
							graduates work in top salons and barbershops across Dhaka and
							beyond — many opening their own chairs within a year of
							graduating.
						</p>
					</div>

					<div className="relative aspect-4/3 overflow-hidden">
						<Image
							src={pic("unicorn-about-story", 800, 600)}
							alt="Unicorn Barber Training Academy studio floor with students at work"
							layout="constrained"
							width={800}
							height={600}
							loading="lazy"
							className="h-full w-full object-cover"
						/>
						<span className="absolute left-4 top-4 border border-primary/50 bg-black/40 px-2.5 py-1 text-[10px] tracking-[0.18em] text-primary backdrop-blur-sm">
							STUDIO FLOOR &mdash; GULSHAN, DHAKA
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}
