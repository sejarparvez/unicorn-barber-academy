import { IconMail, IconPhone, IconTrash } from '@tabler/icons-react';
import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import {
	ENQUIRY_STATUS_LABELS,
	ENQUIRY_STATUSES,
	type EnquiryStatus,
	formatEnquiryDateTime,
} from '@/components/pages/dashboard/enquiries/types';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
	type AdminEnquiry,
	deleteEnquiry,
	type EnquiryStats,
	setEnquiryStatus,
	updateEnquiryNote,
} from '@/server/admin/enquiries';

const STATUS_BADGE: Record<EnquiryStatus, string> = {
	new: 'border-primary/30 text-primary',
	in_progress: 'border-amber-500/40 text-amber-600 dark:text-amber-500',
	resolved: 'border-emerald-500/40 text-emerald-600 dark:text-emerald-500',
	spam: 'border-destructive/40 text-destructive',
};

const statusOptions = ENQUIRY_STATUSES.map((status) => ({
	value: status,
	label: ENQUIRY_STATUS_LABELS[status],
}));

export function EnquiriesList({
	enquiries,
	stats,
}: {
	enquiries: AdminEnquiry[];
	stats: EnquiryStats;
}) {
	const [filter, setFilter] = useState<'all' | EnquiryStatus>('all');

	const counts: Record<'all' | EnquiryStatus, number> = {
		all: stats.total,
		new: stats.new,
		in_progress: stats.inProgress,
		resolved: stats.resolved,
		spam: stats.spam,
	};

	const filtered =
		filter === 'all'
			? enquiries
			: enquiries.filter((enquiry) => enquiry.status === filter);

	return (
		<div className="flex flex-col gap-5">
			<div className="flex flex-wrap gap-2">
				{(['all', ...ENQUIRY_STATUSES] as const).map((key) => (
					<Button
						key={key}
						variant={filter === key ? 'secondary' : 'outline'}
						size="sm"
						onClick={() => setFilter(key)}
					>
						{key === 'all' ? 'All' : ENQUIRY_STATUS_LABELS[key]}
						<span className="text-muted-foreground tabular-nums">
							{counts[key]}
						</span>
					</Button>
				))}
			</div>

			{filtered.length === 0 ? (
				<div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-6 py-16 text-center">
					<IconMail
						className="mx-auto size-8 text-primary/70"
						stroke={1.6}
						aria-hidden="true"
					/>
					<p className="mt-4 font-medium text-sm">
						{enquiries.length === 0
							? 'No enquiries yet.'
							: 'Nothing in this filter.'}
					</p>
					<p className="mt-1 text-muted-foreground text-sm">
						Messages from the public contact form land here.
					</p>
				</div>
			) : (
				<ul className="flex flex-col gap-4">
					{filtered.map((enquiry) => (
						<EnquiryCard key={enquiry.id} enquiry={enquiry} />
					))}
				</ul>
			)}
		</div>
	);
}

function EnquiryCard({ enquiry }: { enquiry: AdminEnquiry }) {
	const router = useRouter();
	const [statusPending, setStatusPending] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [deletePending, setDeletePending] = useState(false);

	async function changeStatus(next: EnquiryStatus) {
		if (next === enquiry.status) {
			return;
		}
		setStatusPending(true);
		try {
			await setEnquiryStatus({ data: { id: enquiry.id, status: next } });
			await router.invalidate();
			toast.success(`Marked as ${ENQUIRY_STATUS_LABELS[next].toLowerCase()}.`);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'Could not update the status.',
			);
		} finally {
			setStatusPending(false);
		}
	}

	async function handleDelete() {
		setDeletePending(true);
		try {
			await deleteEnquiry({ data: { id: enquiry.id } });
			setDeleteOpen(false);
			await router.invalidate();
			toast.success('Enquiry deleted.');
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: 'Could not delete the enquiry.',
			);
		} finally {
			setDeletePending(false);
		}
	}

	return (
		<li className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="flex min-w-0 flex-col gap-1">
					<div className="flex items-center gap-2.5">
						<h2 className="font-semibold text-base tracking-tight">
							{enquiry.name}
						</h2>
						<Badge variant="outline" className={STATUS_BADGE[enquiry.status]}>
							{ENQUIRY_STATUS_LABELS[enquiry.status]}
						</Badge>
					</div>
					<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs">
						<a
							href={`mailto:${enquiry.email}`}
							className="inline-flex items-center gap-1 font-medium text-foreground hover:text-primary"
						>
							<IconMail className="size-3.5" stroke={1.75} aria-hidden="true" />
							{enquiry.email}
						</a>
						{enquiry.phone ? (
							<a
								href={`tel:${enquiry.phone}`}
								className="inline-flex items-center gap-1 hover:text-primary"
							>
								<IconPhone
									className="size-3.5"
									stroke={1.75}
									aria-hidden="true"
								/>
								{enquiry.phone}
							</a>
						) : null}
						<span>·</span>
						<time dateTime={enquiry.createdAt}>
							{formatEnquiryDateTime(enquiry.createdAt)}
						</time>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Select
						items={statusOptions}
						value={enquiry.status}
						onValueChange={(value) =>
							void changeStatus((value ?? 'new') as EnquiryStatus)
						}
						disabled={statusPending}
					>
						<SelectTrigger size="sm" aria-label="Enquiry status">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{statusOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
						<Button
							variant="ghost"
							size="icon-sm"
							className="text-destructive hover:bg-destructive/10 hover:text-destructive"
							onClick={() => setDeleteOpen(true)}
							aria-label="Delete enquiry"
							title="Delete enquiry"
						>
							<IconTrash stroke={1.75} />
						</Button>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
									Delete the enquiry from {enquiry.name}?
								</AlertDialogTitle>
								<AlertDialogDescription>
									This permanently removes the message. This action cannot be
									undone.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel disabled={deletePending}>
									Cancel
								</AlertDialogCancel>
								<AlertDialogAction
									onClick={(event) => {
										event.preventDefault();
										void handleDelete();
									}}
									disabled={deletePending}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
								>
									{deletePending ? 'Deleting…' : 'Delete enquiry'}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>

			<p className="mt-3 text-muted-foreground text-xs">
				Interested in{' '}
				<span className="font-medium text-foreground">
					{enquiry.interestLabel}
				</span>
				{enquiry.handledByName ? (
					<> · handled by {enquiry.handledByName}</>
				) : null}
			</p>

			<p className="mt-3 text-pretty text-foreground text-sm leading-relaxed whitespace-pre-line">
				{enquiry.message}
			</p>

			<div className="mt-4 border-border/60 border-t pt-4">
				<EnquiryNote enquiry={enquiry} />
			</div>
		</li>
	);
}

function EnquiryNote({ enquiry }: { enquiry: AdminEnquiry }) {
	const router = useRouter();
	const [note, setNote] = useState(enquiry.note ?? '');
	const [isPending, setIsPending] = useState(false);

	const isDirty = note.trim() !== (enquiry.note ?? '');

	async function handleSave() {
		setIsPending(true);
		try {
			await updateEnquiryNote({ data: { id: enquiry.id, note: note.trim() } });
			await router.invalidate();
			toast.success('Note saved.');
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'Could not save the note.',
			);
		} finally {
			setIsPending(false);
		}
	}

	return (
		<div className="flex flex-col gap-2">
			<label
				htmlFor={`note-${enquiry.id}`}
				className="font-medium text-muted-foreground text-xs uppercase tracking-[0.14em]"
			>
				Internal note
			</label>
			<Textarea
				id={`note-${enquiry.id}`}
				value={note}
				onChange={(event) => setNote(event.target.value)}
				placeholder="Add a note for the team — follow-ups, decisions, next steps."
				rows={2}
				className="min-h-16 resize-y text-sm"
				maxLength={1000}
			/>
			{isDirty ? (
				<div className="flex items-center gap-2">
					<Button
						size="sm"
						disabled={isPending}
						onClick={() => void handleSave()}
					>
						{isPending ? 'Saving…' : 'Save note'}
					</Button>
					<Button
						size="sm"
						variant="ghost"
						disabled={isPending}
						onClick={() => setNote(enquiry.note ?? '')}
					>
						Reset
					</Button>
				</div>
			) : null}
		</div>
	);
}
