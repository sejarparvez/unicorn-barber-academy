import {
	IconArrowUpRight,
	IconBrandWhatsapp,
	IconClock,
	IconMail,
	IconMapPin,
	IconPhone,
} from '@tabler/icons-react';
import { Card, CardContent } from '@/components/ui/card';
import { SITE } from '@/lib/site';

const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.contact.address)}`;

const DIRECT_LINES = [
	{
		icon: IconPhone,
		label: 'Call admissions',
		value: SITE.contact.phone,
		href: `tel:${SITE.contact.phoneE164}`,
		external: false,
	},
	{
		icon: IconBrandWhatsapp,
		label: 'WhatsApp',
		value: 'Chat with the team',
		href: `https://wa.me/${SITE.contact.whatsapp}`,
		external: true,
	},
	{
		icon: IconMail,
		label: 'Email',
		value: SITE.contact.email,
		href: `mailto:${SITE.contact.email}`,
		external: false,
	},
];

const NEXT_STEPS = [
	{
		title: 'We read your message',
		description:
			'An admissions advisor picks it up and matches it to the right program.',
	},
	{
		title: 'We call or WhatsApp you',
		description:
			'Expect a reply within one working day, with schedules and fees.',
	},
	{
		title: 'You visit the floor',
		description:
			'Meet an instructor, watch a live class and try the tools before you commit.',
	},
];

export default function ContactDetails() {
	return (
		<div className="flex flex-col gap-6">
			<Card className="border border-border/70 bg-card shadow-sm ring-0">
				<CardContent className="gap-4">
					<div>
						<p className="font-semibold text-[10px] text-primary uppercase tracking-[0.24em]">
							Direct lines
						</p>
						<h3 className="mt-2 font-bold text-xl text-foreground tracking-tight">
							Talk to a human
						</h3>
					</div>

					<ul className="divide-y divide-border/60">
						{DIRECT_LINES.map((line) => (
							<li key={line.label}>
								<a
									href={line.href}
									target={line.external ? '_blank' : undefined}
									rel={line.external ? 'noreferrer' : undefined}
									className="group flex items-center gap-3 py-3.5 transition-colors first:pt-1 last:pb-1"
								>
									<span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
										<line.icon
											className="size-4"
											stroke={1.75}
											aria-hidden="true"
										/>
									</span>
									<span className="min-w-0 flex-1">
										<span className="block font-semibold text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
											{line.label}
										</span>
										<span className="mt-0.5 block truncate font-medium text-foreground text-sm transition-colors group-hover:text-primary">
											{line.value}
										</span>
									</span>
									<IconArrowUpRight
										className="size-4 shrink-0 text-muted-foreground/60 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
										stroke={1.75}
										aria-hidden="true"
									/>
								</a>
							</li>
						))}
					</ul>
				</CardContent>
			</Card>

			<Card className="border border-border/70 bg-card shadow-sm ring-0">
				<CardContent className="gap-4">
					<div>
						<p className="font-semibold text-[10px] text-primary uppercase tracking-[0.24em]">
							Find us
						</p>
						<h3 className="mt-2 font-bold text-xl text-foreground tracking-tight">
							Banasree, Dhaka
						</h3>
					</div>

					<ul className="space-y-3.5">
						<li className="flex items-start gap-3 text-muted-foreground text-sm leading-relaxed">
							<IconMapPin
								className="mt-0.5 size-4 shrink-0 text-primary/80"
								stroke={1.75}
								aria-hidden="true"
							/>
							{SITE.contact.address}
						</li>
						<li className="flex items-start gap-3 text-muted-foreground text-sm leading-relaxed">
							<IconClock
								className="mt-0.5 size-4 shrink-0 text-primary/80"
								stroke={1.75}
								aria-hidden="true"
							/>
							<span>
								<span className="block text-foreground">
									{SITE.contact.hours.days}
								</span>
								{SITE.contact.hours.time}
							</span>
						</li>
					</ul>

					<a
						href={MAPS_URL}
						target="_blank"
						rel="noreferrer"
						className="group inline-flex items-center gap-1.5 font-semibold text-[11px] text-primary uppercase tracking-[0.16em] transition-colors hover:text-primary/80"
					>
						Open in Google Maps
						<IconArrowUpRight
							className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
							stroke={1.75}
							aria-hidden="true"
						/>
					</a>
				</CardContent>
			</Card>

			<Card className="border border-primary/25 bg-card shadow-sm ring-0">
				<CardContent className="gap-4">
					<div>
						<p className="font-semibold text-[10px] text-primary uppercase tracking-[0.24em]">
							What happens next
						</p>
						<h3 className="mt-2 font-bold text-xl text-foreground tracking-tight">
							From message to chair
						</h3>
					</div>

					<ol className="space-y-4">
						{NEXT_STEPS.map((step, index) => (
							<li key={step.title} className="flex gap-3">
								<span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-semibold text-[11px] text-primary">
									{index + 1}
								</span>
								<span>
									<span className="block font-medium text-foreground text-sm">
										{step.title}
									</span>
									<span className="mt-0.5 block text-muted-foreground text-xs leading-relaxed">
										{step.description}
									</span>
								</span>
							</li>
						))}
					</ol>

					<p className="border-border/60 border-t pt-3 text-muted-foreground text-xs leading-relaxed">
						We usually reply within one working day.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
