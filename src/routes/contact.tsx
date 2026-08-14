import {
	IconArrowRight,
	IconBrandWhatsapp,
	IconBuildingStore,
	IconCheck,
	IconClockHour4,
	IconCopy,
	IconHelpCircle,
	IconMail,
	IconMapPin,
	IconNews,
	IconParking,
	IconPhone,
	IconSchool,
	IconSend,
} from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type FormEvent, useState } from "react";
import {
	GOLD_TEXT,
	Grain,
	GuildSeal,
	Reveal,
	SectionEyebrow,
} from "@/components/site/decor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ALL_PROGRAMS, pic, SITE_URL } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/contact")({
	component: ContactPage,
	head: () => ({
		meta: [
			{ title: "Contact | Unicorn Barber Training Academy" },
			{
				name: "description",
				content:
					"Get in touch with Unicorn Barber Training Academy in Gulshan, Dhaka — admissions, salon partnerships, press, or a studio visit.",
			},
			{
				property: "og:title",
				content: "Contact | Unicorn Barber Training Academy",
			},
			{
				property: "og:description",
				content:
					"Reach admissions, partnerships, or press at Unicorn Barber Training Academy.",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: `${SITE_URL}/contact` },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/contact` }],
	}),
});

const JSON_LD = {
	"@context": "https://schema.org",
	"@type": "BreadcrumbList",
	itemListElement: [
		{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
		{
			"@type": "ListItem",
			position: 2,
			name: "Contact",
			item: `${SITE_URL}/contact`,
		},
	],
};

function ContactPage() {
	return (
		<main>
			<script
				type="application/ld+json"
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
			/>
			<ContactHero />
			<InquiryAndForm />
			<VisitStudio />
			<ContactFaq />
		</main>
	);
}

/* ----------------------------- Hero ----------------------------- */

function ContactHero() {
	const shouldReduceMotion = useReducedMotion();
	const fadeUp = (delay = 0) =>
		shouldReduceMotion
			? {}
			: {
					initial: { opacity: 0, y: 18 },
					animate: { opacity: 1, y: 0 },
					transition: {
						duration: 0.7,
						delay,
						ease: [0.16, 1, 0.3, 1] as const,
					},
				};

	return (
		<section className="relative overflow-hidden bg-secondary text-secondary-foreground">
			<div className="absolute inset-0 grid grid-cols-2">
				<img
					src={pic("unicorn-contact-hero-1", 900, 1000)}
					alt=""
					className="h-full w-full object-cover opacity-40"
				/>
				<img
					src={pic("unicorn-contact-hero-2", 900, 1000)}
					alt=""
					className="hidden h-full w-full object-cover opacity-40 sm:block"
				/>
			</div>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0"
				style={{
					background:
						"radial-gradient(60% 65% at 50% 42%, rgba(8,8,8,0.93) 0%, rgba(8,8,8,0.8) 45%, rgba(8,8,8,0.55) 78%, rgba(8,8,8,0.34) 100%)",
				}}
			/>
			<Grain />

			<div className="relative mx-auto max-w-3xl px-6 py-24 text-center lg:py-28">
				<motion.div
					{...fadeUp(0)}
					className="flex items-center justify-center gap-2 text-[11px] tracking-[0.22em] text-secondary-foreground/50"
				>
					<Link to="/" className="hover:text-primary">
						HOME
					</Link>
					<span aria-hidden="true">/</span>
					<span className="text-primary">CONTACT</span>
				</motion.div>

				<motion.div {...fadeUp(0.06)}>
					<GuildSeal className="mx-auto mb-6 mt-6 h-12 w-12 text-primary/85" />
				</motion.div>

				<motion.h1
					{...fadeUp(0.12)}
					className="font-heading text-5xl font-medium leading-[1.08] sm:text-6xl"
				>
					Let&rsquo;s{" "}
					<span className={cn("italic font-normal", GOLD_TEXT)}>talk.</span>
				</motion.h1>
				<motion.p
					{...fadeUp(0.18)}
					className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-secondary-foreground/70 sm:text-lg"
				>
					Questions about a program, a partnership, or just want to see the
					studio in person? Tell us which, and we&rsquo;ll route it to the right
					person.
				</motion.p>

				<motion.div
					{...fadeUp(0.26)}
					className="mt-9 flex flex-wrap items-center justify-center gap-3"
				>
					<a
						href="tel:+8801234567890"
						className="inline-flex items-center gap-2 border border-white/15 bg-white/5 px-4 py-2.5 text-[12px] font-medium tracking-[0.06em] text-secondary-foreground/85 backdrop-blur-sm transition-colors hover:border-primary hover:text-primary"
					>
						<IconPhone className="h-3.5 w-3.5" stroke={1.75} />
						CALL
					</a>
					<a
						href="https://wa.me/8801234567890"
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center gap-2 border border-white/15 bg-white/5 px-4 py-2.5 text-[12px] font-medium tracking-[0.06em] text-secondary-foreground/85 backdrop-blur-sm transition-colors hover:border-primary hover:text-primary"
					>
						<IconBrandWhatsapp className="h-3.5 w-3.5" stroke={1.75} />
						WHATSAPP
					</a>
					<a
						href="#visit"
						className="inline-flex items-center gap-2 border border-white/15 bg-white/5 px-4 py-2.5 text-[12px] font-medium tracking-[0.06em] text-secondary-foreground/85 backdrop-blur-sm transition-colors hover:border-primary hover:text-primary"
					>
						<IconMapPin className="h-3.5 w-3.5" stroke={1.75} />
						GET DIRECTIONS
					</a>
				</motion.div>
			</div>
		</section>
	);
}

/* -------------------------- Inquiry + form -------------------------- */

type InquiryKey = "student" | "partner" | "press" | "other";

const INQUIRIES: Record<
	InquiryKey,
	{
		label: string;
		icon: typeof IconSchool;
		description: string;
		response: string;
		email: string;
	}
> = {
	student: {
		label: "Prospective Student",
		icon: IconSchool,
		description: "Ask about programs, tuition, kit fees, or how to apply.",
		response: "Replies within 24 hours",
		email: "admissions@unicornbta.com",
	},
	partner: {
		label: "Salon or Barbershop",
		icon: IconBuildingStore,
		description: "Hire graduates or explore a placement partnership with us.",
		response: "Replies within 2 business days",
		email: "partnerships@unicornbta.com",
	},
	press: {
		label: "Press & Media",
		icon: IconNews,
		description: "Interview requests, brand assets, or press inquiries.",
		response: "Replies within 3 business days",
		email: "press@unicornbta.com",
	},
	other: {
		label: "Something Else",
		icon: IconHelpCircle,
		description: "General questions about the academy or your visit.",
		response: "Replies within 48 hours",
		email: "hello@unicornbta.com",
	},
};

const INQUIRY_ORDER: InquiryKey[] = ["student", "partner", "press", "other"];

function InquiryAndForm() {
	const [inquiry, setInquiry] = useState<InquiryKey>("student");
	const [submitted, setSubmitted] = useState(false);
	const active = INQUIRIES[inquiry];

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setSubmitted(true);
	};

	return (
		<section
			className="bg-background px-6 py-24 lg:px-10"
			aria-labelledby="contact-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow
					guard="1"
					title="Reach the Right Desk"
					id="contact-heading"
				/>

				<div
					className="mt-10"
					role="radiogroup"
					aria-label="I'm reaching out as a"
				>
					<p className="text-[11px] tracking-[0.18em] text-muted-foreground">
						I&rsquo;M REACHING OUT AS A&hellip;
					</p>
					<div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
						{INQUIRY_ORDER.map((key) => {
							const opt = INQUIRIES[key];
							const isActive = inquiry === key;
							return (
								<button
									key={key}
									type="button"
									role="radio"
									aria-checked={isActive}
									onClick={() => {
										setInquiry(key);
										setSubmitted(false);
									}}
									className={cn(
										"flex flex-col items-start gap-3 border p-5 text-left transition-colors",
										isActive
											? "border-primary bg-accent"
											: "border-border hover:border-primary/40",
									)}
								>
									<opt.icon
										className={cn(
											"h-5 w-5",
											isActive ? "text-primary" : "text-muted-foreground",
										)}
										stroke={1.5}
									/>
									<span className="text-sm font-semibold text-foreground">
										{opt.label}
									</span>
									<span className="text-xs leading-relaxed text-muted-foreground">
										{opt.description}
									</span>
								</button>
							);
						})}
					</div>
				</div>

				<div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-5">
					{/* Form */}
					<Reveal className="lg:col-span-3">
						<div className="relative overflow-hidden border border-border p-8 sm:p-10">
							<AnimatePresence mode="wait">
								{submitted ? (
									<SealedConfirmation
										key="confirmation"
										response={active.response}
										onReset={() => setSubmitted(false)}
									/>
								) : (
									<motion.form
										key="form"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.2 }}
										onSubmit={handleSubmit}
										className="space-y-6"
									>
										<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
											<div className="space-y-2">
												<Label htmlFor="name">Full name</Label>
												<Input
													id="name"
													name="name"
													placeholder="Your name"
													required
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="email">Email</Label>
												<Input
													id="email"
													name="email"
													type="email"
													placeholder="you@example.com"
													required
												/>
											</div>
										</div>

										<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
											<div className="space-y-2">
												<Label htmlFor="phone">Phone (optional)</Label>
												<Input
													id="phone"
													name="phone"
													type="tel"
													placeholder="+880"
												/>
											</div>
											{inquiry === "student" && (
												<div className="space-y-2">
													<Label htmlFor="program">
														Program you&rsquo;re interested in
													</Label>
													<Select name="program">
														<SelectTrigger id="program">
															<SelectValue placeholder="Not sure yet" />
														</SelectTrigger>
														<SelectContent>
															{ALL_PROGRAMS.map((p) => (
																<SelectItem key={p.title} value={p.title}>
																	{p.title}
																</SelectItem>
															))}
															<SelectItem value="undecided">
																Not sure yet
															</SelectItem>
														</SelectContent>
													</Select>
												</div>
											)}
										</div>

										<div className="space-y-2">
											<Label htmlFor="message">
												{inquiry === "student" && "What do you want to know?"}
												{inquiry === "partner" &&
													"Tell us about your salon or barbershop"}
												{inquiry === "press" && "What are you working on?"}
												{inquiry === "other" && "Your message"}
											</Label>
											<Textarea
												id="message"
												name="message"
												rows={5}
												placeholder="Type your message here…"
												required
											/>
										</div>

										<div className="flex flex-wrap items-center justify-between gap-4 pt-2">
											<p className="text-xs text-muted-foreground">
												Sent to{" "}
												<span className="text-foreground">{active.email}</span>{" "}
												&middot; {active.response}
											</p>
											<Button
												type="submit"
												className="rounded-none px-7 py-5 text-[12px] font-semibold tracking-[0.14em]"
											>
												SEND MESSAGE
												<IconSend className="ml-2 h-3.5 w-3.5" stroke={1.75} />
											</Button>
										</div>
									</motion.form>
								)}
							</AnimatePresence>
						</div>
					</Reveal>

					{/* Direct details */}
					<Reveal delay={0.1} className="lg:col-span-2">
						<div className="flex h-full flex-col justify-between border border-border bg-muted/40 p-8 sm:p-10">
							<div>
								<active.icon className="h-6 w-6 text-primary" stroke={1.5} />
								<h3 className="mt-4 font-heading text-xl font-medium text-foreground">
									{active.label}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
									{active.description}
								</p>

								<div className="mt-6 space-y-3">
									<CopyRow icon={IconMail} value={active.email} />
									<CopyRow icon={IconPhone} value="+880 1234-567890" />
								</div>
							</div>

							<div className="mt-8 flex items-center gap-2 border-t border-border pt-6 text-[11px] tracking-[0.1em] text-muted-foreground">
								<IconClockHour4
									className="h-3.5 w-3.5 text-primary"
									stroke={1.75}
								/>
								{active.response.toUpperCase()}
							</div>
						</div>
					</Reveal>
				</div>
			</div>
		</section>
	);
}

function CopyRow({
	icon: Icon,
	value,
}: {
	icon: typeof IconMail;
	value: string;
}) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), 1800);
		} catch {
			// clipboard unavailable — silently ignore, value is still visible to select/copy manually
		}
	};

	return (
		<button
			type="button"
			onClick={handleCopy}
			className="group flex w-full items-center justify-between gap-3 border border-border bg-background px-4 py-3 text-left transition-colors hover:border-primary/40"
		>
			<span className="flex items-center gap-3 text-sm text-foreground">
				<Icon className="h-4 w-4 shrink-0 text-primary" stroke={1.75} />
				{value}
			</span>
			<span className="shrink-0 text-muted-foreground">
				{copied ? (
					<IconCheck className="h-4 w-4 text-primary" stroke={1.75} />
				) : (
					<IconCopy
						className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100"
						stroke={1.75}
					/>
				)}
			</span>
		</button>
	);
}

/* The Guild Seal's payoff moment: a literal wax-stamp confirmation,
   the same mark that's been decorative everywhere else on the site. */
function SealedConfirmation({
	response,
	onReset,
}: {
	response: string;
	onReset: () => void;
}) {
	const shouldReduceMotion = useReducedMotion();
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.2 }}
			className="flex flex-col items-center py-10 text-center"
		>
			<motion.div
				initial={
					shouldReduceMotion
						? { opacity: 0 }
						: { opacity: 0, scale: 1.6, rotate: -8 }
				}
				animate={{ opacity: 1, scale: 1, rotate: 0 }}
				transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
			>
				<GuildSeal className="h-20 w-20 text-primary" />
			</motion.div>
			<h3 className="mt-6 font-heading text-2xl font-medium text-foreground">
				Sealed.
			</h3>
			<p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
				Your message has been logged. {response.toLowerCase()}.
			</p>
			<button
				type="button"
				onClick={onReset}
				className="mt-6 text-[12px] font-medium tracking-[0.1em] text-primary hover:underline"
			>
				SEND ANOTHER MESSAGE
			</button>
		</motion.div>
	);
}

/* ----------------------------- Visit studio ----------------------------- */

const HOURS = [
	{ day: "Sunday – Thursday", time: "9:00 AM – 9:00 PM" },
	{ day: "Friday", time: "9:00 AM – 12:30 PM, 2:30 PM – 9:00 PM" },
	{ day: "Saturday", time: "9:00 AM – 7:00 PM" },
];

function VisitStudio() {
	return (
		<section
			id="visit"
			className="scroll-mt-20 border-t border-border bg-secondary text-secondary-foreground"
		>
			<div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
				<Reveal className="flex flex-col justify-center px-6 py-24 lg:px-10">
					<SectionEyebrow
						guard="2"
						title="Visit the Studio"
						id="visit-heading"
					/>

					<address className="mt-8 space-y-5 text-sm not-italic text-secondary-foreground/75">
						<p className="flex items-start gap-3">
							<IconMapPin
								className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
								stroke={1.75}
							/>
							<span>123 Fade Street, Gulshan, Dhaka 1212, Bangladesh</span>
						</p>
						<p className="flex items-start gap-3">
							<IconParking
								className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
								stroke={1.75}
							/>
							<span>
								Free parking behind the building, entrance on Fade Street
							</span>
						</p>
					</address>

					<div className="mt-8 border-t border-white/10 pt-6">
						<p className="flex items-center gap-2 text-[11px] tracking-[0.18em] text-primary">
							<IconClockHour4 className="h-3.5 w-3.5" stroke={1.75} />
							STUDIO HOURS
						</p>
						<dl className="mt-4 space-y-2.5 text-sm">
							{HOURS.map((h) => (
								<div
									key={h.day}
									className="flex items-baseline justify-between gap-4 text-secondary-foreground/75"
								>
									<dt>{h.day}</dt>
									<dd className="text-right text-secondary-foreground/55">
										{h.time}
									</dd>
								</div>
							))}
						</dl>
					</div>

					<Link
						to="/enroll"
						className="mt-9 inline-flex w-fit items-center gap-2 border border-primary bg-transparent px-6 py-3.5 text-[12px] font-semibold tracking-[0.16em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
					>
						PREFER TO TOUR FIRST? BOOK A VISIT
						<IconArrowRight className="h-3.5 w-3.5" stroke={1.75} />
					</Link>
				</Reveal>

				<Reveal delay={0.1} className="relative h-72 lg:h-auto">
					<img
						src={pic("unicorn-contact-map", 1000, 900)}
						alt="Street map showing the location of Unicorn Barber Training Academy in Gulshan, Dhaka"
						className="h-full w-full object-cover opacity-70"
					/>
					<div className="absolute inset-0 bg-secondary/30" />
				</Reveal>
			</div>
		</section>
	);
}

/* ------------------------------- FAQ ------------------------------- */

const CONTACT_FAQS = [
	{
		q: "Do I need an appointment to visit the studio?",
		a: "Walk-ins are welcome during studio hours, but booking a visit means an instructor can actually walk you through a cohort in session.",
	},
	{
		q: "How fast will I hear back?",
		a: "It depends on your inquiry — admissions questions get same-day attention on weekdays; partnership and press inquiries take a little longer since they're routed to a specific person.",
	},
	{
		q: "Can I call instead of using the form?",
		a: "Yes — the phone number above rings the front desk directly during studio hours, and WhatsApp works outside those hours too.",
	},
];

function ContactFaq() {
	return (
		<section
			className="border-t border-border bg-background px-6 py-24 lg:px-10"
			aria-labelledby="contact-faq-heading"
		>
			<div className="mx-auto max-w-3xl">
				<SectionEyebrow
					guard="3"
					title="Before You Reach Out"
					id="contact-faq-heading"
				/>
				<div className="mt-10 divide-y divide-border border-y border-border">
					{CONTACT_FAQS.map((item, i) => (
						<Reveal key={item.q} delay={i * 0.06}>
							<details className="group py-5">
								<summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-foreground marker:content-none">
									{item.q}
									<span
										className="shrink-0 text-primary transition-transform group-open:rotate-45"
										aria-hidden="true"
									>
										+
									</span>
								</summary>
								<p className="mt-3 text-sm leading-relaxed text-muted-foreground">
									{item.a}
								</p>
							</details>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}
