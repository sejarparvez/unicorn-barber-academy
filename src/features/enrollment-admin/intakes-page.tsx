// src/features/enrollment-admin/intakes-page.tsx
// Intake management: create cohort instances (program/cohort/date/seats),
// open/close them, adjust capacity (never below occupied), delete empty ones.
// Reads + mutations flow through the service layer; invalidations refresh
// the list in place.
import {
	IconArrowLeft,
	IconCheck,
	IconPlus,
	IconTrash,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { IntakeAdmin, ProgramAdmin } from "@/lib/enrollment";
import {
	COHORT_LABELS,
	formatFeePoisha,
	formatStartsOn,
} from "@/lib/enrollment";
import { cn } from "@/lib/utils";
import {
	useCreateIntake,
	useDeleteIntake,
	useIntakesAdmin,
	useProgramOptions,
	useProgramsAdmin,
	useUpdateIntake,
	useUpdateProgram,
} from "@/service/enrollment";

export function IntakesPage() {
	const { data: intakes, isPending } = useIntakesAdmin();
	const createMutation = useCreateIntake();
	const updateMutation = useUpdateIntake();
	const deleteMutation = useDeleteIntake();

	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	// Intake pending deletion confirmation (only set when it has applications).
	const [confirmDelete, setConfirmDelete] = useState<IntakeAdmin | null>(null);
	const busy =
		createMutation.isPending ||
		updateMutation.isPending ||
		deleteMutation.isPending;

	// create form
	const { data: programOptions } = useProgramOptions();
	const { data: programs } = useProgramsAdmin();
	const updateProgramMutation = useUpdateProgram();
	const [programSlug, setProgramSlug] = useState("");
	const [cohort, setCohort] = useState<"day" | "evening">("day");
	const [startsOn, setStartsOn] = useState("");
	const [seatsTotal, setSeatsTotal] = useState("12");

	const selectedProgram = (programOptions ?? []).find(
		(p) => p.slug === programSlug,
	);
	const effectiveSlug = programSlug || programOptions?.[0]?.slug || "";
	const effectiveSeats = selectedProgram
		? String(selectedProgram.defaultSeats)
		: seatsTotal;

	async function onCreate(event: React.FormEvent) {
		event.preventDefault();
		if (busy || !startsOn || !effectiveSlug) return;
		setError(null);
		setNotice(null);
		try {
			await createMutation.mutateAsync({
				programSlug: effectiveSlug,
				cohort,
				startsOn,
				seatsTotal: Number.parseInt(effectiveSeats, 10),
			});
			setNotice("Intake created.");
			setStartsOn("");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Create failed");
		}
	}

	async function onToggleOpen(intake: IntakeAdmin) {
		setError(null);
		try {
			await updateMutation.mutateAsync({
				id: intake.id,
				patch: { isOpen: !intake.isOpen },
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Update failed");
		}
	}

	async function onSeatsChange(intake: IntakeAdmin, seats: number) {
		if (!Number.isInteger(seats) || seats === intake.seatsTotal) return;
		setError(null);
		try {
			await updateMutation.mutateAsync({
				id: intake.id,
				patch: { seatsTotal: seats },
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Update failed");
		}
	}

	function onDelete(intake: IntakeAdmin) {
		if (intake.applicationsCount > 0) {
			// AlertDialog handles the confirmation; state holds the target.
			setConfirmDelete(intake);
			return;
		}
		void doDelete(intake);
	}

	async function doDelete(intake: IntakeAdmin) {
		setError(null);
		try {
			await deleteMutation.mutateAsync(intake.id);
			setConfirmDelete(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Delete failed");
		}
	}

	return (
		<div className="space-y-6">
			<header className="flex items-center gap-3">
				<Link
					to="/dashboard/enrollments"
					aria-label="Back to applications"
					className={cn(
						buttonVariants({ variant: "ghost", size: "icon" }),
						"text-muted-foreground",
					)}
				>
					<IconArrowLeft className="h-4 w-4" />
				</Link>
				<div>
					<p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
						Admissions
					</p>
					<h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
						Program intakes
					</h1>
					<p className="text-sm text-muted-foreground">
						Cohort instances with start dates and seat caps shown on the apply
						form.
					</p>
				</div>
			</header>

			{error ? (
				<p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
					{error}
				</p>
			) : null}
			{notice ? (
				<p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
					{notice}
				</p>
			) : null}

			<form
				onSubmit={onCreate}
				className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[minmax(0,2fr)_auto_auto_auto_auto]"
			>
				<select
					value={effectiveSlug}
					onChange={(e) => {
						setProgramSlug(e.target.value);
						const next = (programOptions ?? []).find(
							(p) => p.slug === e.target.value,
						);
						if (next) setSeatsTotal(String(next.defaultSeats));
					}}
					className="h-9 rounded-md border border-border bg-background px-3 text-sm"
					aria-label="Program"
				>
					{(programOptions ?? []).map((p) => (
						<option key={p.slug} value={p.slug}>
							{p.title}
						</option>
					))}
				</select>
				<select
					value={cohort}
					onChange={(e) => setCohort(e.target.value as "day" | "evening")}
					className="h-9 rounded-md border border-border bg-background px-3 text-sm"
					aria-label="Cohort"
				>
					<option value="day">Day</option>
					<option value="evening">Evening</option>
				</select>
				<Input
					type="date"
					value={startsOn}
					min={new Date().toISOString().slice(0, 10)}
					onChange={(e) => setStartsOn(e.target.value)}
					required
					className="h-9"
					aria-label="Start date"
				/>
				<Input
					type="number"
					min={1}
					max={200}
					value={seatsTotal}
					onChange={(e) => setSeatsTotal(e.target.value)}
					required
					className="h-9 w-24"
					aria-label="Seats"
				/>
				<Button
					type="submit"
					disabled={busy || !startsOn || !effectiveSlug}
					className="gap-1.5"
				>
					<IconPlus className="h-4 w-4" /> Create
				</Button>
			</form>

			<ProgramsOverview
				programs={programs}
				busy={busy}
				onError={setError}
				updateProgram={(slug, patch) =>
					updateProgramMutation.mutateAsync({ slug, patch })
				}
			/>

			<ul className="divide-y divide-border rounded-xl border border-border bg-card">
				{isPending ? (
					<li className="p-4">
						<div className="flex items-center gap-3">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-5 w-16 rounded-full" />
							<Skeleton className="h-3 w-24" />
						</div>
					</li>
				) : (intakes?.length ?? 0) === 0 ? (
					<li className="p-8 text-center text-sm text-muted-foreground">
						No intakes yet — create the first one above.
					</li>
				) : (
					(intakes ?? []).map((intake) => (
						<li
							key={intake.id}
							className="flex flex-wrap items-center gap-3 p-4"
						>
							<div className="min-w-0 flex-1">
								<div className="flex flex-wrap items-center gap-2">
									<Badge variant={intake.isOpen ? "default" : "secondary"}>
										{intake.isOpen ? "Open" : "Closed"}
									</Badge>
									<span className="text-[11px] tracking-wide text-muted-foreground uppercase">
										{COHORT_LABELS[intake.cohort]}
									</span>
								</div>
								<p className="mt-1 font-medium">{intake.programTitle}</p>
								<p className="text-xs text-muted-foreground">
									Starts {formatStartsOn(intake.startsOn)} ·{" "}
									{intake.applicationsCount} application
									{intake.applicationsCount === 1 ? "" : "s"}
								</p>
							</div>
							<label className="flex items-center gap-2 text-xs text-muted-foreground">
								Seats
								{/* Keyed by the server value: after a refetch (reject,
								    clamp, or another admin's edit) the DOM input resets to
								    what the DB actually holds instead of keeping stale text. */}
								<input
									key={`${intake.id}:${intake.seatsTotal}`}
									type="number"
									min={1}
									max={200}
									defaultValue={intake.seatsTotal}
									onBlur={(e) => {
										void onSeatsChange(
											intake,
											Number.parseInt(e.target.value, 10),
										);
									}}
									className="h-8 w-20 rounded-md border border-border bg-background px-2 text-sm"
								/>
								{intake.seatsWarning ? (
									<span className="text-destructive font-medium">
										Overbooked ({intake.applicationsCount - intake.seatsTotal}{" "}
										excess)
									</span>
								) : null}
							</label>
							<Button
								variant="outline"
								size="sm"
								disabled={busy}
								onClick={() => onToggleOpen(intake)}
							>
								{intake.isOpen ? "Close" : "Reopen"}
							</Button>
							<Button
								variant="ghost"
								size="icon"
								aria-label={`Delete ${intake.programTitle} intake`}
								className="text-muted-foreground hover:text-destructive"
								disabled={busy}
								onClick={() => onDelete(intake)}
							>
								<IconTrash className="h-4 w-4" />
							</Button>
						</li>
					))
				)}
			</ul>
			<p className="flex items-center gap-1.5 text-xs text-muted-foreground">
				<IconCheck className="h-3.5 w-3.5" />
				Pending, in-review, and approved applications hold seats; waitlisted and
				rejected ones do not. Seats cannot drop below held count.
			</p>

			<AlertDialog
				open={confirmDelete !== null}
				onOpenChange={(open) => !open && setConfirmDelete(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete this intake?</AlertDialogTitle>
						<AlertDialogDescription>
							{confirmDelete
								? `This intake has ${confirmDelete.applicationsCount} application(s) and cannot be deleted. Remove or transfer the applications first, then try again.`
								: ""}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-white hover:bg-destructive/90"
							onClick={(event) => {
								event.preventDefault();
								if (confirmDelete) void doDelete(confirmDelete);
							}}
						>
							Delete intake
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

/* ------------------------- programs overview ------------------------- */

function ProgramsOverview({
	programs,
	busy,
	onError,
	updateProgram,
}: {
	programs: ProgramAdmin[] | undefined;
	busy: boolean;
	onError: (message: string | null) => void;
	updateProgram: (
		slug: string,
		patch: {
			feePoisha?: number;
			defaultSeats?: number;
			isPublished?: boolean;
		},
	) => Promise<unknown>;
}) {
	async function save(
		slug: string,
		patch: { feePoisha?: number; defaultSeats?: number; isPublished?: boolean },
	) {
		onError(null);
		try {
			await updateProgram(slug, patch);
		} catch (err) {
			onError(err instanceof Error ? err.message : "Update failed");
		}
	}

	return (
		<section aria-label="Programs overview" className="space-y-3">
			<h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
				Programs — what&apos;s live, seats &amp; fees
			</h2>
			{(programs ?? []).length === 0 ? (
				<p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
					No programs yet — seed with{" "}
					<code className="font-mono text-xs">
						bun scripts/seed-programs.ts
					</code>
					.
				</p>
			) : (
				<ul className="grid gap-3 md:grid-cols-2">
					{(programs ?? []).map((program) => (
						<li
							key={program.slug}
							className="space-y-3 rounded-xl border border-border bg-card p-4"
						>
							<div className="flex flex-wrap items-center gap-2">
								<Badge variant={program.isPublished ? "default" : "secondary"}>
									{program.isPublished ? "Live" : "Hidden"}
								</Badge>
								<span className="font-medium">{program.title}</span>
								<span className="text-xs text-muted-foreground">
									{program.duration}
								</span>
								<Button
									variant="outline"
									size="sm"
									className="ml-auto"
									disabled={busy}
									onClick={() =>
										void save(program.slug, {
											isPublished: !program.isPublished,
										})
									}
								>
									{program.isPublished ? "Hide" : "Publish"}
								</Button>
							</div>
							<p className="text-xs text-muted-foreground">
								{program.openIntakes} open intake
								{program.openIntakes === 1 ? "" : "s"} · {program.seatsFilled}/
								{program.seatsTotal} seats filled · {program.pendingCount}{" "}
								pending review · {formatFeePoisha(program.collectedPoisha)}{" "}
								collected
							</p>
							<div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
								<label className="flex items-center gap-2">
									Fee (৳)
									<input
										key={`${program.slug}:fee:${program.feePoisha}`}
										type="number"
										min={0}
										max={1000000}
										step={500}
										defaultValue={Math.floor(program.feePoisha / 100)}
										onBlur={(e) => {
											const bdt = Number.parseInt(e.target.value, 10);
											if (
												Number.isInteger(bdt) &&
												bdt * 100 !== program.feePoisha
											) {
												void save(program.slug, { feePoisha: bdt * 100 });
											}
										}}
										className="h-8 w-28 rounded-md border border-border bg-background px-2 text-sm"
									/>
								</label>
								<label className="flex items-center gap-2">
									Default seats
									<input
										key={`${program.slug}:seats:${program.defaultSeats}`}
										type="number"
										min={1}
										max={200}
										defaultValue={program.defaultSeats}
										onBlur={(e) => {
											const seats = Number.parseInt(e.target.value, 10);
											if (
												Number.isInteger(seats) &&
												seats !== program.defaultSeats
											) {
												void save(program.slug, { defaultSeats: seats });
											}
										}}
										className="h-8 w-20 rounded-md border border-border bg-background px-2 text-sm"
									/>
								</label>
								<span>
									Per intake: {formatFeePoisha(program.feePoisha)} ×{" "}
									{program.defaultSeats} seats
								</span>
							</div>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
