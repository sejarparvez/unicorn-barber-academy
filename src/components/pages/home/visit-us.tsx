import { IconClockHour4, IconMapPin, IconPhone } from "@tabler/icons-react";
import { SectionEyebrow } from "@/components/effects";
import { buttonVariants } from "@/components/ui/button";
import { useSite } from "@/lib/site-context";
import { cn } from "@/lib/utils";

export default function VisitUs() {
	const { contact, areasServed } = useSite();
	return (
		<section
			className="border-t border-primary/15"
			aria-labelledby="visit-heading"
		>
			<div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
				<div className="flex flex-col justify-center px-4 py-24 lg:px-10">
					<SectionEyebrow title="Visit the Academy" id="visit-heading" />
					<address className="mt-8 space-y-5 text-sm not-italic text-secondary-foreground/75">
						<p className="flex items-start gap-3">
							<IconMapPin
								className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
								stroke={1.75}
								aria-hidden="true"
							/>
							<span>{contact.addressDisplay}</span>
						</p>
						<p className="flex items-start gap-3">
							<IconPhone
								className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
								stroke={1.75}
								aria-hidden="true"
							/>
							<a href={contact.phoneHref} className="hover:text-primary">
								{contact.phoneDisplay}
							</a>
						</p>
						<p className="flex items-start gap-3">
							<IconClockHour4
								className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
								stroke={1.75}
								aria-hidden="true"
							/>
							<span>{contact.hoursSummary}</span>
						</p>
						<p className="flex items-start gap-3">
							<IconMapPin
								className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
								stroke={1.75}
								aria-hidden="true"
							/>
							<span>
								Convenient for students from{" "}
								{areasServed.slice(0, 5).join(", ")} and across Dhaka.
							</span>
						</p>
					</address>
					<a
						href={contact.mapsUrl}
						target="_blank"
						rel="noreferrer"
						aria-label="Get directions to Unicorn Barber Training Academy on Google Maps"
						className={cn(
							buttonVariants({ variant: "outline" }),
							"mt-9 w-fit rounded-none border-primary bg-transparent px-6 py-5 text-[12px] font-semibold tracking-[0.16em] text-primary hover:bg-primary hover:text-primary-foreground",
						)}
					>
						GET DIRECTIONS
					</a>
				</div>
				<div className="relative h-72 lg:h-auto">
					<iframe
						title="Google Map showing the location of Unicorn Barber Training Academy in Banasree, Rampura, Dhaka"
						src={contact.mapsEmbedUrl}
						loading="lazy"
						referrerPolicy="no-referrer-when-downgrade"
						allowFullScreen
						className="h-full min-h-72 w-full border-0 opacity-90"
					/>
				</div>
			</div>
		</section>
	);
}
