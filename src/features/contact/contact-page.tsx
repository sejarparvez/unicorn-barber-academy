// src/features/contact/contact-page.tsx
import {
	IconArrowRight,
	IconBrandWhatsapp,
	IconBuildingStore,
	IconCheck,
	IconClockHour4,
	IconCopy,
	IconMail,
	IconMapPin,
	IconNews,
	IconParking,
	IconPhone,
	IconSchool,
	IconSend,
} from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type FormEvent, useState } from "react";
import {
	GOLD_TEXT,
	Grain,
	GuildSeal,
	Reveal,
	SectionEyebrow,
	useFadeUp,
} from "@/components/effects";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
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
import { pic } from "@/data/images";
import { ALL_PROGRAMS } from "@/data/programs";
import { AREAS_SERVED, CONTACT, SITE_URL } from "@/data/site";
import { submitContactMessage } from "@/lib/api/contact";
import { stringifyJsonLd } from "@/lib/jsonld";
import { cn } from "@/lib/utils";

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

export function ContactPage() {
	return (
		<main>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: this is fine
				dangerouslySetInnerHTML={{ __html: stringifyJsonLd(JSON_LD) }}
			/>
			<ContactHero />
			<ContactForm />
			<VisitStudio />
			<ContactFaq />
		</main>
	);
}

/* ----------------------------- Hero ----------------------------- */

function ContactHero() {
	const fadeUp = useFadeUp();

	return (
		<section className="relative overflow-hidden bg-secondary text-secondary-foreground">
			<div className="absolute inset-0 grid grid-cols-2">
				<Image
					src={pic("unicorn-contact-hero-1", 900, 1000)}
					alt=""
					layout="fullWidth"
					fetchPriority="high"
					loading="eager"
					className="h-full w-full object-cover opacity-40"
				/>
				<Image
					src={pic("unicorn-contact-hero-2", 900, 1000)}
					alt=""
					layout="fullWidth"
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
					className="flex items-center justify-center gap-2 text-[11px] tracking-[0.22em] text-secondary-foreground/65"
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
					studio in person? One message reaches us — tell us what it&rsquo;s
					about below.
				</motion.p>

				<motion.div
					{...fadeUp(0.26)}
					className="mt-9 flex flex-wrap items-center justify-center gap-3"
				>
					<a
						href={CONTACT.phoneHref}
						className="inline-flex items-center gap-2 border border-white/15 bg-white/5 px-4 py-2.5 text-[12px] font-medium tracking-[0.06em] text-secondary-foreground/85 backdrop-blur-sm transition-colors hover:border-primary hover:text-primary"
					>
						<IconPhone className="h-3.5 w-3.5" stroke={1.75} />
						CALL
					</a>
					<a
						href={CONTACT.whatsapp}
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center gap-2 border border-white/15 bg-white/5 px-4 py-2.5 text-[12px] font-medium tracking-[0.06em] text-secondary-foreground/85 backdrop-blur-sm transition-colors hover:border-primary hover:text-primary"
					>
						<IconBrandWhatsapp className="h-3.5 w-3.5" stroke={1.75} />
						WHATSAPP
					</a>
					<a
						href={CONTACT.mapsUrl}
						target="_blank"
						rel="noreferrer"
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

/* ------------------------------ Form ------------------------------ */

const SUBJECTS = [
	{ value: "student", label: "Prospective student" },
	{ value: "partner", label: "Salon or barbershop partnership" },
	{ value: "press", label: "Press & media" },
	{ value: "other", label: "Something else" },
];

const DESKS = [
	{
		icon: IconSchool,
		label: "Admissions",
		handles: "Programs, tuition, kit fees, applying",
	},
	{
		icon: IconBuildingStore,
		label: "Partnerships",
		handles: "Hiring graduates, placement partnerships",
	},
	{
		icon: IconNews,
		label: "Press",
		handles: "Interviews, brand assets, media requests",
	},
];

function ContactForm() {
	const submitMessage = useMutation({
		mutationFn: submitContactMessage,
	});

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const data = new FormData(e.currentTarget);
		submitMessage.mutate({
			name: String(data.get("name") ?? "").trim(),
			email: String(data.get("email") ?? "").trim(),
			phone: String(data.get("phone") ?? "").trim() || undefined,
			subject: String(data.get("subject") ?? ""),
			program: String(data.get("program") ?? "") || undefined,
			message: String(data.get("message") ?? "").trim(),
		});
	};

	return (
		<section
			className="section-light bg-background px-6 py-24 lg:px-10"
			aria-labelledby="contact-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow guard="1" title="Send a Message" id="contact-heading" />

				<div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-5">
					{/* Form */}
					<Reveal className="lg:col-span-3">
						<div className="relative overflow-hidden border border-border p-8 sm:p-10">
							<AnimatePresence mode="wait">
								{submitMessage.isSuccess && !submitMessage.isPending ? (
									<SealedConfirmation
										key="confirmation"
										onReset={() => submitMessage.reset()}
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
											<div className="space-y-2">
												<Label htmlFor="subject">
													What&rsquo;s this about?
												</Label>
												<Select name="subject" defaultValue="student">
													<SelectTrigger id="subject">
														<SelectValue placeholder="Select one" />
													</SelectTrigger>
													<SelectContent>
														{SUBJECTS.map((s) => (
															<SelectItem key={s.value} value={s.value}>
																{s.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
										</div>

										<div className="space-y-2">
											<Label htmlFor="program">
												Program you&rsquo;re interested in{" "}
												<span className="text-muted-foreground">
													(if applicable)
												</span>
											</Label>
											<Select name="program" defaultValue="not-applicable">
												<SelectTrigger id="program">
													<SelectValue placeholder="Not applicable" />
												</SelectTrigger>
												<SelectContent>
													{ALL_PROGRAMS.map((p) => (
														<SelectItem key={p.title} value={p.title}>
															{p.title}
														</SelectItem>
													))}
													<SelectItem value="not-applicable">
														Not applicable
													</SelectItem>
												</SelectContent>
											</Select>
										</div>

										<div className="space-y-2">
											<Label htmlFor="message">Your message</Label>
											<Textarea
												id="message"
												name="message"
												rows={5}
												placeholder="Type your message here…"
												required
											/>
										</div>

										{submitMessage.isError ? (
											<div
												role="alert"
												className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
											>
												{submitMessage.error instanceof Error
													? "We couldn't send your message. Please try again, or email us directly."
													: "Something went wrong. Please try again."}
											</div>
										) : null}

										<div className="flex flex-wrap items-center justify-between gap-4 pt-2">
											<p className="text-xs text-muted-foreground">
												Sent to{" "}
												<span className="text-foreground">{CONTACT.email}</span>{" "}
												&middot; we typically reply within 1&ndash;2 business
												days
											</p>
											<Button
												type="submit"
												className="rounded-none px-7 py-5 text-[12px] font-semibold tracking-[0.14em]"
												disabled={submitMessage.isPending}
											>
												{submitMessage.isPending ? "SENDING…" : "SEND MESSAGE"}
												<IconSend className="ml-2 h-3.5 w-3.5" stroke={1.75} />
											</Button>
										</div>
									</motion.form>
								)}
							</AnimatePresence>
						</div>
					</Reveal>

					{/* Direct details — static, not tied to form state */}
					<Reveal delay={0.1} className="lg:col-span-2">
						<div className="flex h-full flex-col justify-between border border-border bg-muted/40 p-8 sm:p-10">
							<div>
								<h3 className="font-heading text-xl font-medium text-foreground">
									Reach us directly
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
									Prefer not to use the form? Call, WhatsApp, or email — same
									inbox, same team.
								</p>

								<div className="mt-6 space-y-3">
									<CopyRow icon={IconMail} value={CONTACT.email} />
									<CopyRow icon={IconPhone} value={CONTACT.phoneDisplay} />
								</div>

								<ul className="mt-8 space-y-4 border-t border-border pt-6">
									{DESKS.map((desk) => (
										<li key={desk.label} className="flex items-start gap-3">
											<desk.icon
												className="mt-0.5 h-4 w-4 shrink-0 text-primary"
												stroke={1.75}
											/>
											<span className="text-sm text-muted-foreground">
												<span className="text-foreground">{desk.label}</span>{" "}
												&mdash; {desk.handles}
											</span>
										</li>
									))}
								</ul>
							</div>

							<div className="mt-8 flex items-center gap-2 border-t border-border pt-6 text-[11px] tracking-widest text-muted-foreground">
								<IconClockHour4
									className="h-3.5 w-3.5 text-primary"
									stroke={1.75}
								/>
								WE REPLY WITHIN 1&ndash;2 BUSINESS DAYS
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
			<output className="sr-only">{copied ? "Copied to clipboard" : ""}</output>
		</button>
	);
}

/* The Guild Seal's payoff moment: a literal wax-stamp confirmation,
   the same mark that's been decorative everywhere else on the site. */
function SealedConfirmation({ onReset }: { onReset: () => void }) {
	const shouldReduceMotion = useReducedMotion();
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.2 }}
			className="flex flex-col items-center py-10 text-center"
			role="status"
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
				Your message has been logged. We typically reply within 1&ndash;2
				business days.
			</p>
			<button
				type="button"
				onClick={onReset}
				className="mt-6 text-[12px] font-medium tracking-widest text-primary hover:underline"
			>
				SEND ANOTHER MESSAGE
			</button>
		</motion.div>
	);
}

/* ----------------------------- Visit studio ----------------------------- */

function VisitStudio() {
	return (
		<section id="visit" className="scroll-mt-20 border-t border-border">
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
							<span>{CONTACT.addressDisplay}</span>
						</p>
						<p className="flex items-start gap-3">
							<IconParking
								className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
								stroke={1.75}
							/>
							<span>
								Entrance on Main Road — the academy is on the 1st floor
							</span>
						</p>
					</address>

					<div className="mt-6 text-sm text-secondary-foreground/75">
						<p className="text-[11px] tracking-[0.18em] text-primary uppercase">
							Convenient for students from
						</p>
						<p className="mt-2 leading-relaxed">{AREAS_SERVED.join(" · ")}</p>
					</div>

					<div className="mt-8 border-t border-white/10 pt-6">
						<p className="flex items-center gap-2 text-[11px] tracking-[0.18em] text-primary">
							<IconClockHour4 className="h-3.5 w-3.5" stroke={1.75} />
							STUDIO HOURS
						</p>
						<dl className="mt-4 space-y-2.5 text-sm">
							{CONTACT.hours.map((h) => (
								<div
									key={h.day}
									className="flex items-baseline justify-between gap-4 text-secondary-foreground/75"
								>
									<dt>{h.day}</dt>
									<dd className="text-right text-secondary-foreground/70">
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
					<iframe
						title="Google Map showing the location of Unicorn Barber Training Academy in Banasree, Rampura, Dhaka"
						src={CONTACT.mapsEmbedUrl}
						loading="lazy"
						referrerPolicy="no-referrer-when-downgrade"
						allowFullScreen
						className="h-full min-h-[18rem] w-full border-0"
					/>
				</Reveal>
			</div>
		</section>
	);
}

/* ------------------------------- FAQ ------------------------------- */

const CONTACT_FAQS = [
	{
		q: "Where exactly is the academy located?",
		a: "House 04, Block F, Main Road, Banasree, Rampura, Dhaka 1219 — the academy is on the 1st floor, with the entrance on Main Road. There's a Google map on this page.",
	},
	{
		q: "Which parts of Dhaka do students commute from?",
		a: "Most students come from nearby Banasree, Rampura, Aftabnagar, Badda, Khilgaon, Gulshan and Mohakhali — but cohorts regularly include learners from across Dhaka.",
	},
	{
		q: "Do I need an appointment to visit the studio?",
		a: "Walk-ins are welcome during studio hours, but booking a visit means an instructor can actually walk you through a cohort in session.",
	},
	{
		q: "How fast will I hear back?",
		a: "Most messages get a same-day reply on weekdays, and within 1–2 business days otherwise.",
	},
	{
		q: "Can I call instead of using the form?",
		a: "Yes — the phone number above rings the front desk directly during studio hours, and WhatsApp works outside those hours too.",
	},
];

const CONTACT_FAQ_JSON_LD = {
	"@context": "https://schema.org",
	"@type": "FAQPage",
	mainEntity: CONTACT_FAQS.map((f) => ({
		"@type": "Question",
		name: f.q,
		acceptedAnswer: { "@type": "Answer", text: f.a },
	})),
};

function ContactFaq() {
	return (
		<section
			className="section-light border-t border-border bg-background px-6 py-24 lg:px-10"
			aria-labelledby="contact-faq-heading"
		>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: this is fine
				dangerouslySetInnerHTML={{
					__html: stringifyJsonLd(CONTACT_FAQ_JSON_LD),
				}}
			/>
			<div className="mx-auto max-w-3xl">
				<SectionEyebrow
					guard="3"
					title="Before You Reach Out"
					id="contact-faq-heading"
				/>
				<Accordion className="mt-10">
					{CONTACT_FAQS.map((item, i) => (
						<AccordionItem
							key={item.q}
							value={`item-${i}`}
							className="border-border py-1 first:border-t"
						>
							<AccordionTrigger className="py-4 text-base font-medium text-foreground hover:no-underline [&>svg]:text-primary">
								{item.q}
							</AccordionTrigger>
							<AccordionContent className="text-sm leading-relaxed text-muted-foreground">
								{item.a}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</div>
		</section>
	);
}
