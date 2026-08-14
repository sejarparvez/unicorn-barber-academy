import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import {
	FinalCta,
	GOLD_TEXT,
	Grain,
	GuildSeal,
	Reveal,
	SectionEyebrow,
} from "@/components/site/decor";
import { pic, SITE_URL, type Track } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/enroll")({
	component: EnrollPage,
	head: () => ({
		meta: [
			{ title: "Enroll | Unicorn Barber Training Academy" },
			{
				name: "description",
				content:
					"Apply to Unicorn Barber Training Academy — six hands-on programs in barbering and beauty & cosmetology. Small cohorts, working professionals as instructors.",
			},
			{
				property: "og:title",
				content: "Enroll | Unicorn Barber Training Academy",
			},
			{
				property: "og:description",
				content:
					"Apply to Unicorn Barber Training Academy — six hands-on programs in barbering and beauty & cosmetology.",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: `${SITE_URL}/enroll` },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/enroll` }],
	}),
});

const BREADCRUMB_JSON_LD = {
	"@context": "https://schema.org",
	"@type": "BreadcrumbList",
	itemListElement: [
		{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
		{
			"@type": "ListItem",
			position: 2,
			name: "Enroll",
			item: `${SITE_URL}/enroll`,
		},
	],
};

const ENROLL_JSON_LD = {
	"@context": "https://schema.org",
	"@type": "Course",
	name: "Unicorn Barber Training Academy Programs",
	description:
		"Hands-on training programs in barbering and beauty & cosmetology taught by working professionals.",
	provider: {
		"@type": "EducationalOrganization",
		name: "Unicorn Barber Training Academy",
		sameAs: [
			"https://instagram.com",
			"https://facebook.com",
			"https://youtube.com",
		],
	},
	hasCourseInstance: [
		{
			"@type": "CourseInstance",
			courseMode: "part-time",
			courseSchedule: "Mo-Sa 09:00-19:00",
			location: {
				"@type": "Place",
				address: {
					"@type": "PostalAddress",
					streetAddress: "123 Fade Street",
					addressLocality: "Gulshan, Dhaka",
					postalCode: "1212",
					addressCountry: "BD",
				},
			},
		},
	],
};

const TRACKS: { key: Track; label: string; programs: string[] }[] = [
	{
		key: "barbering",
		label: "Barbering",
		programs: ["Classic Barbering", "Fades & Tapers", "Beard Sculpting"],
	},
	{
		key: "beauty",
		label: "Beauty & Cosmetology",
		programs: [
			"Cosmetology Fundamentals",
			"Hair Styling & Colouring",
			"Bridal & Editorial Makeup",
		],
	},
];

export async function submitEnrollment(data: {
	name: string;
	email: string;
	phone: string;
	track: Track;
	program: string;
	cohort: "day" | "evening";
	message?: string;
}) {
	const response = await fetch("/api/enroll", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || "Failed to submit enrollment");
	}

	return response.json();
}

function EnrollPage() {
	return (
		<main>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_JSON_LD) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(ENROLL_JSON_LD) }}
			/>
			<EnrollHero />
			<EnrollForm />
			<WhatHappensNext />
			<FinalCta
				title="Questions before you apply?"
				accent="We're here to help."
				subtitle="Email hello@unicornbta.com or call +880 1234-567890 — we'll walk you through the right track and cohort for your goals."
				ctaLabel="CONTACT ADMISSIONS"
				ctaTo="/contact"
			/>
		</main>
	);
}

function EnrollHero() {
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
					src={pic("unicorn-enroll-hero-1", 900, 1100)}
					alt=""
					className="h-full w-full object-cover opacity-40"
				/>
				<img
					src={pic("unicorn-enroll-hero-2", 900, 1100)}
					alt=""
					className="h-full w-full object-cover opacity-40"
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

			<div className="relative mx-auto max-w-3xl px-6 py-24 text-center lg:py-32">
				<motion.div
					{...fadeUp(0)}
					className="flex items-center justify-center gap-2 text-[11px] tracking-[0.22em] text-secondary-foreground/50"
				>
					<a href="/" className="hover:text-primary">
						HOME
					</a>
					<span aria-hidden="true">/</span>
					<span className="text-primary">ENROLL</span>
				</motion.div>

				<motion.div {...fadeUp(0.06)}>
					<GuildSeal className="mx-auto mb-6 mt-6 h-12 w-12 text-primary/85" />
				</motion.div>

				<motion.h1
					{...fadeUp(0.12)}
					className="font-heading text-5xl font-medium leading-[1.08] sm:text-6xl"
				>
					Start your{" "}
					<span className={cn("italic font-normal", GOLD_TEXT)}>
						application.
					</span>
				</motion.h1>
				<motion.p
					{...fadeUp(0.18)}
					className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-secondary-foreground/70 sm:text-lg"
				>
					Six programs. Two crafts. Small cohorts taught by working
					professionals. Fill out the form below and we'll be in touch within 24
					hours to discuss your fit and next steps.
				</motion.p>
			</div>
		</section>
	);
}

function EnrollForm() {
	const [step, setStep] = useState<1 | 2 | 3>(1);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		track: "barbering" as Track,
		program: "",
		cohort: "day" as "day" | "evening",
		message: "",
	});
	const [submitted, setSubmitted] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const shouldReduceMotion = useReducedMotion();

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>,
	) => {
		setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);
		setError(null);

		try {
			await submitEnrollment(formData);
			setSubmitted(true);
			setStep(3);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setSubmitting(false);
		}
	};

	const nextStep = () => {
		if (step === 1 && formData.name && formData.email && formData.phone) {
			setStep(2);
		} else if (
			step === 2 &&
			formData.track &&
			formData.program &&
			formData.cohort
		) {
			handleSubmit();
		}
	};

	const prevStep = () => {
		if (step === 2) setStep(1);
	};

	if (submitted) {
		return (
			<section className="border-t border-border bg-background px-6 py-24 lg:px-10">
				<div className="mx-auto max-w-2xl text-center">
					<Reveal className="relative">
						<GuildSeal className="mx-auto h-16 w-16 text-primary" />
						<h2 className="mt-6 font-heading text-3xl font-medium text-foreground sm:text-4xl">
							Application received
						</h2>
						<p className="mt-4 text-base leading-relaxed text-muted-foreground">
							Thanks for applying to Unicorn Barber Training Academy. Our
							admissions team will review your application and contact you
							within 24 hours to discuss your track, cohort, and next steps.
						</p>
						<div className="mt-8 flex items-center justify-center gap-4 text-[11px] tracking-[0.18em] text-muted-foreground">
							<span>{formData.track.toUpperCase()}</span>
							<span className="h-1 w-1 rounded-full bg-primary/50" />
							<span>{formData.program.toUpperCase()}</span>
							<span className="h-1 w-1 rounded-full bg-primary/50" />
							<span>{formData.cohort.toUpperCase()} COHORT</span>
						</div>
					</Reveal>
				</div>
			</section>
		);
	}

	return (
		<section
			className="bg-background px-6 py-24 lg:px-10"
			aria-labelledby="enroll-form-heading"
		>
			<div className="mx-auto max-w-2xl">
				<SectionEyebrow
					guard="1"
					title="Application Form"
					id="enroll-form-heading"
				/>
				<p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
					Three short steps. No payment required to apply.
				</p>

				<div
					className="mt-8 flex items-center justify-center gap-4"
					role="tablist"
					aria-label="Application progress"
				>
					{[1, 2, 3].map((s) => (
						<motion.div
							key={s}
							className={cn(
								"relative flex h-10 w-10 items-center justify-center rounded-full border-2 text-[12px] font-medium tracking-[0.1em] transition-all",
								s === step
									? "border-primary bg-primary text-primary-foreground"
									: s < step
										? "border-primary bg-primary text-primary-foreground"
										: "border-border text-muted-foreground bg-background",
							)}
							role="tab"
							aria-selected={s === step}
							aria-label={`Step ${s}`}
							initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.3, delay: s * 0.1 }}
						>
							{s < step ? <span>���</span> : s.toString()}
						</motion.div>
					))}
				</div>

				<AnimatePresence mode="wait">
					{step === 1 && (
						<motion.form
							key="step1"
							onSubmit={nextStep}
							initial={shouldReduceMotion ? false : { opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={shouldReduceMotion ? undefined : { opacity: 0, x: -20 }}
							transition={{ duration: 0.3 }}
							className="mt-10 space-y-6"
						>
							<div className="grid gap-6 sm:grid-cols-2">
								<div className="sm:col-span-2">
									<label
										htmlFor="name"
										className="block text-sm font-medium text-foreground"
									>
										Full Name{" "}
										<span className="text-destructive" aria-hidden="true">
											*
										</span>
									</label>
									<input
										type="text"
										id="name"
										name="name"
										value={formData.name}
										onChange={handleChange}
										required
										className="mt-2 w-full rounded-none border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
										placeholder="John Doe"
									/>
								</div>
								<div>
									<label
										htmlFor="email"
										className="block text-sm font-medium text-foreground"
									>
										Email{" "}
										<span className="text-destructive" aria-hidden="true">
											*
										</span>
									</label>
									<input
										type="email"
										id="email"
										name="email"
										value={formData.email}
										onChange={handleChange}
										required
										className="mt-2 w-full rounded-none border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
										placeholder="john@example.com"
									/>
								</div>
								<div>
									<label
										htmlFor="phone"
										className="block text-sm font-medium text-foreground"
									>
										Phone{" "}
										<span className="text-destructive" aria-hidden="true">
											*
										</span>
									</label>
									<input
										type="tel"
										id="phone"
										name="phone"
										value={formData.phone}
										onChange={handleChange}
										required
										className="mt-2 w-full rounded-none border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
										placeholder="+880 1XX XXXXXXX"
									/>
								</div>
							</div>
							<div className="flex justify-end">
								<button
									type="submit"
									className={cn(
										"rounded-none bg-primary px-8 py-3 text-[12px] font-semibold tracking-[0.16em] text-primary-foreground hover:bg-primary/90 transition-colors",
										submitting && "opacity-50 cursor-not-allowed",
									)}
									disabled={submitting}
								>
									{submitting ? "SUBMITTING..." : "CONTINUE"}
								</button>
							</div>
						</motion.form>
					)}
					{step === 2 && (
						<motion.form
							key="step2"
							onSubmit={handleSubmit}
							initial={shouldReduceMotion ? false : { opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={shouldReduceMotion ? undefined : { opacity: 0, x: 20 }}
							transition={{ duration: 0.3 }}
							className="mt-10 space-y-6"
						>
							<div className="space-y-6">
								<div>
									<label className="block text-sm font-medium text-foreground">
										Track{" "}
										<span className="text-destructive" aria-hidden="true">
											*
										</span>
									</label>
									<div
										className="mt-3 grid grid-cols-2 gap-4"
										role="radiogroup"
										aria-label="Select track"
									>
										{TRACKS.map((track) => (
											<label
												key={track.key}
												className={cn(
													"relative flex cursor-pointer items-center p-4 border-2 transition-colors",
													formData.track === track.key
														? "border-primary bg-primary/5"
														: "border-border hover:border-primary/50",
												)}
											>
												<input
													type="radio"
													name="track"
													value={track.key}
													checked={formData.track === track.key}
													onChange={handleChange}
													className="sr-only"
												/>
												<div className="flex flex-1 flex-col">
													<span className="font-medium text-foreground">
														{track.label}
													</span>
													<span className="mt-1 text-xs text-muted-foreground">
														{track.programs.join(", ")}
													</span>
												</div>
											</label>
										))}
									</div>
								</div>

								<div>
									<label
										htmlFor="program"
										className="block text-sm font-medium text-foreground"
									>
										Program{" "}
										<span className="text-destructive" aria-hidden="true">
											*
										</span>
									</label>
									<select
										id="program"
										name="program"
										value={formData.program}
										onChange={handleChange}
										required
										className="mt-2 w-full rounded-none border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
									>
										<option value="">Select a program</option>
										{TRACKS.find((t) => t.key === formData.track)?.programs.map(
											(p) => (
												<option key={p} value={p}>
													{p}
												</option>
											),
										)}
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-foreground">
										Cohort{" "}
										<span className="text-destructive" aria-hidden="true">
											*
										</span>
									</label>
									<div
										className="mt-3 grid grid-cols-2 gap-4"
										role="radiogroup"
										aria-label="Select cohort"
									>
										{[
											{
												value: "day",
												label: "Day Cohort",
												detail: "9:00 AM – 2:00 PM, Sun–Thu",
											},
											{
												value: "evening",
												label: "Evening Cohort",
												detail: "6:00 PM – 9:30 PM, Sun–Thu",
											},
										].map((c) => (
											<label
												key={c.value}
												className={cn(
													"relative flex cursor-pointer items-center p-4 border-2 transition-colors",
													formData.cohort === c.value
														? "border-primary bg-primary/5"
														: "border-border hover:border-primary/50",
												)}
											>
												<input
													type="radio"
													name="cohort"
													value={c.value}
													checked={formData.cohort === c.value}
													onChange={handleChange}
													className="sr-only"
												/>
												<div className="flex flex-1 flex-col">
													<span className="font-medium text-foreground">
														{c.label}
													</span>
													<span className="mt-1 text-xs text-muted-foreground">
														{c.detail}
													</span>
												</div>
											</label>
										))}
									</div>
								</div>

								<div>
									<label
										htmlFor="message"
										className="block text-sm font-medium text-foreground"
									>
										Additional Notes (Optional)
									</label>
									<textarea
										id="message"
										name="message"
										value={formData.message}
										onChange={handleChange}
										rows={4}
										className="mt-2 w-full rounded-none border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
										placeholder="Anything else we should know? Previous experience, scheduling constraints, questions..."
									/>
								</div>
							</div>

							{error && (
								<div className="rounded-none border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
									{error}
								</div>
							)}

							<div className="flex gap-4 justify-end">
								<button
									type="button"
									onClick={prevStep}
									className="rounded-none border border-border px-8 py-3 text-[12px] font-semibold tracking-[0.16em] text-foreground hover:bg-muted transition-colors"
								>
									BACK
								</button>
								<button
									type="submit"
									className={cn(
										"rounded-none bg-primary px-8 py-3 text-[12px] font-semibold tracking-[0.16em] text-primary-foreground hover:bg-primary/90 transition-colors",
										submitting && "opacity-50 cursor-not-allowed",
									)}
									disabled={submitting}
								>
									{submitting ? "SUBMITTING..." : "SUBMIT APPLICATION"}
								</button>
							</div>
						</motion.form>
					)}
				</AnimatePresence>
			</div>
		</section>
	);
}

function WhatHappensNext() {
	const steps = [
		{
			no: "01",
			title: "We review your application",
			description:
				"Our admissions team reads every application personally. We look for motivation and fit, not just grades.",
		},
		{
			no: "02",
			title: "We call you within 24 hours",
			description:
				"A brief conversation to confirm your track, cohort preference, and answer any questions you have.",
		},
		{
			no: "03",
			title: "Reserve your seat",
			description:
				"If it's a match, you'll secure your spot with a deposit. Cohorts are capped at 12 students.",
		},
		{
			no: "04",
			title: "Orientation & kit pickup",
			description:
				"Before day one, you'll attend orientation, meet your instructors, and receive your professional tool kit.",
		},
	];

	return (
		<section
			className="border-t border-border bg-muted/40 px-6 py-24 lg:px-10"
			aria-labelledby="next-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow guard="2" title="What Happens Next" id="next-heading" />
				<div className="relative mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
					<div
						aria-hidden="true"
						className="absolute left-0 right-0 top-6 hidden h-px bg-border lg:block"
					/>
					{steps.map((step, i) => (
						<Reveal key={step.no} delay={i * 0.08} className="relative">
							<div className="relative flex h-12 w-12 items-center justify-center border border-primary/40 bg-background">
								<span
									className={cn("font-heading text-xl font-medium", GOLD_TEXT)}
								>
									{step.no}
								</span>
							</div>
							<h3 className="mt-5 text-base font-semibold text-foreground">
								{step.title}
							</h3>
							<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
								{step.description}
							</p>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}
