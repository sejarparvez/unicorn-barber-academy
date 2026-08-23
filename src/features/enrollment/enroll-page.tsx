// src/features/enrollment/enroll-page.tsx
// Application form (sign-in required — the route gate handles that).
// Track → program → intake card picker, then contact details. On success the
// form is replaced by a confirmation panel with the ENR reference.
import { IconArrowRight, IconCircleCheck } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitApplication } from "@/lib/api/enrollment";
import type { IntakePublic } from "@/lib/enrollment";
import { COHORT_LABELS, formatStartsOn } from "@/lib/enrollment";
import type { SessionPayload } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
	intakes: IntakePublic[];
	session: SessionPayload;
};

const HEAR_ABOUT_OPTIONS = [
	{ value: "", label: "Choose… (optional)" },
	{ value: "friend", label: "Friend / family" },
	{ value: "facebook", label: "Facebook" },
	{ value: "instagram", label: "Instagram" },
	{ value: "search", label: "Google search" },
	{ value: "walkby", label: "Walked by the academy" },
	{ value: "other", label: "Other" },
];

export function EnrollPage({ intakes, session }: Props) {
	const [track, setTrack] = useState<"barbering" | "beauty">("barbering");
	const [programSlug, setProgramSlug] = useState("");
	const [intakeId, setIntakeId] = useState<number | null>(null);
	const [phone, setPhone] = useState("");
	const [experienceNote, setExperienceNote] = useState("");
	const [hearAbout, setHearAbout] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [reference, setReference] = useState<string | null>(null);

	const trackIntakes = useMemo(
		() => intakes.filter((i) => i.track === track),
		[intakes, track],
	);

	const programs = useMemo(() => {
		const seen = new Map<string, string>();
		for (const intake of trackIntakes) {
			if (!seen.has(intake.programSlug)) {
				seen.set(intake.programSlug, intake.programTitle);
			}
		}
		return [...seen.entries()];
	}, [trackIntakes]);

	const programIntakes = useMemo(
		() => trackIntakes.filter((i) => i.programSlug === programSlug),
		[trackIntakes, programSlug],
	);

	function switchTrack(next: "barbering" | "beauty") {
		setTrack(next);
		setProgramSlug("");
		setIntakeId(null);
	}

	async function onSubmit(event: React.FormEvent) {
		event.preventDefault();
		if (!intakeId || submitting) return;
		setSubmitting(true);
		setError(null);
		const result = await submitApplication({
			intakeId,
			phone,
			experienceNote: experienceNote.trim() || null,
			hearAbout: hearAbout || null,
		});
		if (result.ok) {
			setReference(result.reference);
		} else {
			setError(result.message);
		}
		setSubmitting(false);
	}

	if (reference) {
		return (
			<ConfirmationPanel reference={reference} email={session.user.email} />
		);
	}

	return (
		<main>
			<section className="bg-background px-6 pt-28 pb-10 lg:px-10 lg:pt-36">
				<div className="mx-auto max-w-2xl text-center">
					<p className="font-mono text-[11px] tracking-[0.32em] text-primary">
						ADMISSIONS
					</p>
					<h1 className="mt-4 font-heading text-4xl font-medium text-foreground sm:text-5xl">
						Secure your seat
					</h1>
					<p className="mt-5 text-base leading-relaxed text-secondary-foreground/70">
						Cohorts are small so instructor time stays one-on-one — apply for
						the intake that fits you and we&rsquo;ll take it from there.
					</p>
				</div>
			</section>

			<section className="bg-background px-6 pb-20 lg:px-10">
				<form
					onSubmit={onSubmit}
					className="mx-auto max-w-2xl space-y-8 rounded-2xl border border-border bg-card p-6 sm:p-10"
				>
					{/* Track */}
					<div className="space-y-2">
						<Label>Track</Label>
						<div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border">
							{(["barbering", "beauty"] as const).map((t) => (
								<button
									key={t}
									type="button"
									onClick={() => switchTrack(t)}
									className={cn(
										"py-2.5 text-sm font-medium transition-colors",
										track === t
											? "bg-primary text-primary-foreground"
											: "hover:bg-muted",
									)}
								>
									{t === "barbering" ? "Barbering" : "Beauty & Cosmetology"}
								</button>
							))}
						</div>
					</div>

					{/* Program */}
					<div className="space-y-2">
						<Label htmlFor="enroll-program">Program</Label>
						<select
							id="enroll-program"
							value={programSlug}
							onChange={(e) => {
								setProgramSlug(e.target.value);
								setIntakeId(null);
							}}
							required
							className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
						>
							<option value="" disabled>
								{programs.length === 0
									? "No open intakes right now"
									: "Choose a program…"}
							</option>
							{programs.map(([slug, title]) => (
								<option key={slug} value={slug}>
									{title}
								</option>
							))}
						</select>
					</div>

					{/* Intakes */}
					{programSlug ? (
						<div className="space-y-2">
							<Label>Available cohorts</Label>
							{programIntakes.length === 0 ? (
								<p className="rounded-md border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
									No open intakes for this program yet — check back soon.
								</p>
							) : (
								<ul className="space-y-2">
									{programIntakes.map((intake) => {
										const full = intake.seatsLeft <= 0;
										const selected = intakeId === intake.id;
										return (
											<li key={intake.id}>
												<label
													className={cn(
														"flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 transition-colors",
														selected
															? "border-primary bg-primary/5"
															: "border-border hover:bg-muted/40",
														full && "cursor-not-allowed opacity-50",
													)}
												>
													<span className="flex items-center gap-3">
														<input
															type="radio"
															name="intake"
															className="accent-[var(--primary)]"
															checked={selected}
															disabled={full}
															onChange={() => setIntakeId(intake.id)}
														/>
														<span className="text-sm">
															<span className="font-medium">
																{COHORT_LABELS[intake.cohort]}
															</span>
															<span className="block text-xs text-muted-foreground">
																Starts {formatStartsOn(intake.startsOn)}
															</span>
														</span>
													</span>
													<span
														className={cn(
															"text-xs font-semibold",
															full
																? "text-destructive"
																: intake.seatsLeft <= 3
																	? "text-amber-600 dark:text-amber-400"
																	: "text-muted-foreground",
														)}
													>
														{full
															? "Full"
															: `${intake.seatsLeft} of ${intake.seatsTotal} seats left`}
													</span>
												</label>
											</li>
										);
									})}
								</ul>
							)}
						</div>
					) : null}

					{/* Contact details (prefilled name/email from account) */}
					<div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
						<p className="text-xs text-muted-foreground">
							Applying as{" "}
							<span className="font-medium text-foreground">
								{session.user.name || session.user.email}
							</span>{" "}
							({session.user.email})
						</p>
						<div className="space-y-1.5">
							<Label htmlFor="enroll-phone">Phone *</Label>
							<Input
								id="enroll-phone"
								value={phone}
								placeholder="+880 1XXX-XXXXXX"
								onChange={(e) => setPhone(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="enroll-note">
								Prior experience or questions (optional)
							</Label>
							<Textarea
								id="enroll-note"
								rows={3}
								value={experienceNote}
								onChange={(e) => setExperienceNote(e.target.value)}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="enroll-hear">How did you hear about us?</Label>
							<select
								id="enroll-hear"
								value={hearAbout}
								onChange={(e) => setHearAbout(e.target.value)}
								className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
							>
								{HEAR_ABOUT_OPTIONS.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
						</div>
					</div>

					{error ? (
						<p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
							{error}
						</p>
					) : null}

					<Button
						type="submit"
						size="lg"
						disabled={!intakeId || submitting}
						className="w-full gap-2"
					>
						{submitting ? "Submitting…" : "Submit application"}
						{!submitting ? <IconArrowRight className="h-4 w-4" /> : null}
					</Button>
				</form>
			</section>
		</main>
	);
}

function ConfirmationPanel({
	reference,
	email,
}: {
	reference: string;
	email: string;
}) {
	return (
		<main className="section-light bg-background px-6 py-24">
			<div className="mx-auto max-w-xl text-center">
				<IconCircleCheck
					className="mx-auto h-14 w-14 text-primary"
					stroke={1.5}
				/>
				<h1 className="mt-6 font-heading text-3xl font-medium sm:text-4xl">
					Application received
				</h1>
				<p className="mt-4 text-muted-foreground">
					Thanks for applying — our admissions team reviews applications within
					2–3 working days and will contact you about next steps.
				</p>
				<div className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-6">
					<p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
						Your reference
					</p>
					<p className="mt-2 font-heading text-3xl font-semibold tracking-wide text-primary">
						{reference}
					</p>
					<p className="mt-3 text-xs text-muted-foreground">
						A confirmation email is on its way to {email}. Track your
						application anytime from your dashboard.
					</p>
				</div>
				<Link
					to="/dashboard"
					className="mt-8 inline-flex items-center gap-2 border border-primary px-6 py-3 text-[12px] font-semibold tracking-[0.16em] text-primary hover:bg-primary hover:text-primary-foreground"
				>
					GO TO DASHBOARD{" "}
					<IconArrowRight className="h-3.5 w-3.5" stroke={1.75} />
				</Link>
			</div>
		</main>
	);
}
