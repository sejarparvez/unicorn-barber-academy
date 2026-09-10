// src/features/admin/inbox-page.tsx
// Contact-inquiry triage: unread-first list, expandable messages with
// reply-via-email links, mark read/replied, spam delete with confirm.

import { IconMail } from "@tabler/icons-react";
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
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import type { InquiryRow } from "@/lib/inquiry";
import {
	useDeleteInquiry,
	useInquiries,
	useMarkInquiry,
} from "@/service/inquiry";

export function InboxPage() {
	const [unreadOnly, setUnreadOnly] = useState(false);
	const [page, setPage] = useState(1);
	const [openId, setOpenId] = useState<number | null>(null);
	const [deleteId, setDeleteId] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);
	const { data, isPending } = useInquiries(unreadOnly, page);
	const markMutation = useMarkInquiry();
	const deleteMutation = useDeleteInquiry();
	const busy = markMutation.isPending || deleteMutation.isPending;

	async function mark(
		id: number,
		patch: { isRead?: boolean; isReplied?: boolean },
	) {
		setError(null);
		try {
			await markMutation.mutateAsync({ id, patch });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Update failed");
		}
	}

	async function onDelete() {
		if (!deleteId) return;
		setError(null);
		try {
			await deleteMutation.mutateAsync(deleteId);
			setDeleteId(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Delete failed");
		}
	}

	function toggleOpen(item: InquiryRow) {
		setOpenId((cur) => (cur === item.id ? null : item.id));
		if (!item.isRead) void mark(item.id, { isRead: true });
	}

	return (
		<div className="space-y-6">
			<header>
				<p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
					Administration
				</p>
				<h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
					Inbox{" "}
					{data && data.unread > 0 ? (
						<Badge className="ml-1 align-middle">{data.unread} new</Badge>
					) : null}
				</h1>
				<p className="text-sm text-muted-foreground">
					Website inquiries, stored durably — email is only the notification.
				</p>
			</header>

			{error ? (
				<p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
					{error}
				</p>
			) : null}

			<div className="flex gap-3">
				<Button
					variant={unreadOnly ? "default" : "outline"}
					size="sm"
					onClick={() => {
						setUnreadOnly((v) => !v);
						setPage(1);
					}}
				>
					Unread only
				</Button>
			</div>

			<ul className="divide-y divide-border rounded-xl border border-border bg-card">
				{isPending ? (
					<li className="p-4">
						<Skeleton className="h-4 w-full" />
					</li>
				) : (data?.items.length ?? 0) === 0 ? (
					<li>
						<Empty>
							<EmptyHeader>
								<EmptyMedia variant="icon">
									<IconMail />
								</EmptyMedia>
								<EmptyTitle>
									{unreadOnly ? "Inbox zero" : "No inquiries yet"}
								</EmptyTitle>
								<EmptyDescription>
									{unreadOnly
										? "Nothing unread — every inquiry has been triaged."
										: "Contact-form inquiries will land here."}
								</EmptyDescription>
							</EmptyHeader>
						</Empty>
					</li>
				) : (
					(data?.items ?? []).map((item) => {
						const open = openId === item.id;
						return (
							<li key={item.id}>
								<button
									type="button"
									onClick={() => toggleOpen(item)}
									className="flex w-full flex-wrap items-center gap-2 p-4 text-left hover:bg-muted/40"
								>
									{!item.isRead ? (
										<span
											aria-hidden="true"
											className="h-2 w-2 shrink-0 rounded-full bg-primary"
										/>
									) : (
										<span aria-hidden="true" className="h-2 w-2 shrink-0" />
									)}
									<span
										className={`min-w-0 flex-1 truncate text-sm ${item.isRead ? "" : "font-semibold"}`}
									>
										{item.name}{" "}
										<span className="font-normal text-muted-foreground">
											· {item.subject}
										</span>
									</span>
									{item.isReplied ? (
										<Badge variant="secondary">Replied</Badge>
									) : null}
									<span className="text-xs text-muted-foreground">
										{new Date(item.createdAt).toLocaleDateString("en-GB", {
											day: "numeric",
											month: "short",
										})}
									</span>
								</button>
								{open ? (
									<div className="space-y-3 border-t border-border bg-muted/20 px-4 py-4">
										<p className="text-sm leading-relaxed whitespace-pre-wrap">
											{item.message}
										</p>
										<p className="text-xs text-muted-foreground">
											{item.email}
											{item.phone ? ` · ${item.phone}` : ""}
											{item.program ? ` · interested in: ${item.program}` : ""}
										</p>
										<div className="flex flex-wrap gap-2">
											<a
												href={`mailto:${item.email}?subject=${encodeURIComponent(`Re: your inquiry to Unicorn Barber Training Academy`)}`}
												className="inline-flex h-8 items-center rounded-md border border-border bg-background px-3 text-xs font-medium hover:bg-muted"
												onClick={() => void mark(item.id, { isReplied: true })}
											>
												Reply by email
											</a>
											{!item.isReplied ? (
												<Button
													variant="outline"
													size="sm"
													disabled={busy}
													onClick={() =>
														void mark(item.id, { isReplied: true })
													}
												>
													Mark replied
												</Button>
											) : null}
											{item.isRead ? (
												<Button
													variant="ghost"
													size="sm"
													disabled={busy}
													onClick={() => void mark(item.id, { isRead: false })}
												>
													Mark unread
												</Button>
											) : null}
											<Button
												variant="ghost"
												size="sm"
												disabled={busy}
												className="ml-auto text-muted-foreground hover:text-destructive"
												onClick={() => setDeleteId(item.id)}
											>
												Delete
											</Button>
										</div>
									</div>
								) : null}
							</li>
						);
					})
				)}
			</ul>

			{data && data.totalPages > 1 ? (
				<div className="flex items-center gap-3 text-sm">
					<Button
						variant="outline"
						size="sm"
						disabled={page <= 1}
						onClick={() => setPage((p) => p - 1)}
					>
						Previous
					</Button>
					<span className="text-muted-foreground">
						Page {data.page} of {data.totalPages} ({data.total})
					</span>
					<Button
						variant="outline"
						size="sm"
						disabled={page >= data.totalPages}
						onClick={() => setPage((p) => p + 1)}
					>
						Next
					</Button>
				</div>
			) : null}

			<AlertDialog
				open={deleteId !== null}
				onOpenChange={(open) => !open && setDeleteId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete this inquiry?</AlertDialogTitle>
						<AlertDialogDescription>
							The message is removed permanently. Reply first if it needs an
							answer.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-white hover:bg-destructive/90"
							onClick={(e) => {
								e.preventDefault();
								void onDelete();
							}}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
