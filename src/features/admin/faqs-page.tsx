// src/features/admin/faqs-page.tsx
// FAQ management for the home + contact placements: create/edit Q&As,
// ordering, publish. Feeds both FAQ sections and their JSON-LD blocks.
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { FaqAdmin } from "@/lib/content";
import {
	useCreateFaq,
	useDeleteFaq,
	useFaqsAdmin,
	useUpdateFaq,
} from "@/service/content";

export function FaqsPage() {
	const [placement, setPlacement] = useState<"home" | "contact">("home");
	const { data: items, isPending } = useFaqsAdmin(placement);
	const createMutation = useCreateFaq();
	const updateMutation = useUpdateFaq();
	const deleteMutation = useDeleteFaq();
	const [question, setQuestion] = useState("");
	const [answer, setAnswer] = useState("");
	const [editingId, setEditingId] = useState<number | null>(null);
	const [deleteId, setDeleteId] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const busy =
		createMutation.isPending ||
		updateMutation.isPending ||
		deleteMutation.isPending;

	function startEdit(f: FaqAdmin) {
		setEditingId(f.id);
		setQuestion(f.question);
		setAnswer(f.answer);
		if (f.placement !== placement) setPlacement(f.placement);
		window.scrollTo({ top: 0 });
	}

	function cancelEdit() {
		setEditingId(null);
		setQuestion("");
		setAnswer("");
	}

	async function onSubmit(event: React.FormEvent) {
		event.preventDefault();
		if (busy || !question.trim() || !answer.trim()) return;
		setError(null);
		setNotice(null);
		try {
			if (editingId) {
				await updateMutation.mutateAsync({
					id: editingId,
					patch: { question: question.trim(), answer: answer.trim() },
				});
				setNotice("FAQ updated.");
			} else {
				await createMutation.mutateAsync({
					placement,
					question: question.trim(),
					answer: answer.trim(),
					sortOrder: (items?.length ?? 0) * 10 + 10,
				});
				setNotice("FAQ added.");
			}
			cancelEdit();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Save failed");
		}
	}

	async function onTogglePublish(f: FaqAdmin) {
		setError(null);
		try {
			await updateMutation.mutateAsync({
				id: f.id,
				patch: { isPublished: !f.isPublished },
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Update failed");
		}
	}

	async function onMove(f: FaqAdmin, dir: -1 | 1) {
		const list = items ?? [];
		const other = list[list.findIndex((i) => i.id === f.id) + dir];
		if (!other) return;
		setError(null);
		try {
			await updateMutation.mutateAsync({
				id: f.id,
				patch: { sortOrder: other.sortOrder },
			});
			await updateMutation.mutateAsync({
				id: other.id,
				patch: { sortOrder: f.sortOrder },
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Reorder failed");
		}
	}

	async function onDelete() {
		if (!deleteId) return;
		setError(null);
		try {
			await deleteMutation.mutateAsync({ id: deleteId });
			setDeleteId(null);
			setNotice("FAQ deleted.");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Delete failed");
		}
	}

	return (
		<div className="space-y-6">
			<header>
				<p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
					Content
				</p>
				<h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
					FAQs
				</h1>
				<p className="text-sm text-muted-foreground">
					Questions shown on the homepage and contact page, with SEO answers.
				</p>
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

			<div className="flex gap-2">
				{(["home", "contact"] as const).map((p) => (
					<Button
						key={p}
						type="button"
						variant={placement === p ? "default" : "outline"}
						size="sm"
						onClick={() => {
							setPlacement(p);
							cancelEdit();
						}}
					>
						{p === "home" ? "Homepage" : "Contact page"}
					</Button>
				))}
			</div>

			<form
				onSubmit={onSubmit}
				className="grid gap-3 rounded-xl border border-border bg-card p-4"
			>
				<Input
					placeholder="Question *"
					value={question}
					onChange={(e) => setQuestion(e.target.value)}
					required
					className="h-9"
					aria-label="Question"
				/>
				<Textarea
					placeholder="Answer *"
					value={answer}
					onChange={(e) => setAnswer(e.target.value)}
					required
					rows={3}
					aria-label="Answer"
				/>
				<div className="flex gap-2">
					<Button type="submit" disabled={busy}>
						{editingId ? "Save changes" : "Add FAQ"}
					</Button>
					{editingId ? (
						<Button type="button" variant="ghost" onClick={cancelEdit}>
							Cancel
						</Button>
					) : null}
				</div>
			</form>

			<ul className="divide-y divide-border rounded-xl border border-border bg-card">
				{isPending ? (
					<li className="p-4">
						<Skeleton className="h-4 w-full" />
					</li>
				) : (items ?? []).length === 0 ? (
					<li className="p-8 text-center text-sm text-muted-foreground">
						No FAQs here yet — add the first one above.
					</li>
				) : (
					(items ?? []).map((f) => (
						<li key={f.id} className="flex flex-wrap items-center gap-3 p-4">
							<div className="min-w-0 flex-1">
								<div className="flex items-center gap-2">
									<Badge variant={f.isPublished ? "secondary" : "outline"}>
										{f.isPublished ? "Live" : "Hidden"}
									</Badge>
								</div>
								<p className="mt-1 font-medium">{f.question}</p>
								<p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
									{f.answer}
								</p>
							</div>
							<div className="flex items-center gap-1">
								<Button
									variant="ghost"
									size="sm"
									disabled={busy}
									onClick={() => void onMove(f, -1)}
									aria-label="Move up"
								>
									↑
								</Button>
								<Button
									variant="ghost"
									size="sm"
									disabled={busy}
									onClick={() => void onMove(f, 1)}
									aria-label="Move down"
								>
									↓
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={busy}
									onClick={() => void onTogglePublish(f)}
								>
									{f.isPublished ? "Hide" : "Publish"}
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={busy}
									onClick={() => startEdit(f)}
								>
									Edit
								</Button>
								<Button
									variant="ghost"
									size="sm"
									disabled={busy}
									className="text-muted-foreground hover:text-destructive"
									onClick={() => setDeleteId(f.id)}
								>
									Delete
								</Button>
							</div>
						</li>
					))
				)}
			</ul>

			<AlertDialog
				open={deleteId !== null}
				onOpenChange={(open) => !open && setDeleteId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete this FAQ?</AlertDialogTitle>
						<AlertDialogDescription>
							This cannot be undone.
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
