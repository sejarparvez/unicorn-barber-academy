import { GuildSeal, Reveal, SectionEyebrow } from "@/components/effects";
import { Card, CardContent } from "@/components/ui/card";

/* ----------------------------- The guild ----------------------------- */

const CREDENTIALS = [
	"Nationally Registered Training Provider (BTEB)",
	"NTVQF Certified Curriculum Levels 2–4",
	"Member, Bangladesh Barbers & Beauticians Guild",
	"Partner salons & barbershops across Dhaka",
];

export default function TheGuild() {
	return (
		<section
			className="border-t border-border bg-muted/40 px-6 py-24 lg:px-10"
			aria-labelledby="guild-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow title="Guild & Accreditation" id="guild-heading" />
				<div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{CREDENTIALS.map((cred, i) => (
						<Reveal key={cred} delay={i * 0.06}>
							<Card className="h-full rounded-none border-border bg-background">
								<CardContent className="p-6">
									<GuildSeal
										className="h-10 w-10 text-primary/60"
										aria-hidden="true"
									/>
									<p className="mt-3 text-sm leading-relaxed text-foreground">
										{cred}
									</p>
								</CardContent>
							</Card>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}
