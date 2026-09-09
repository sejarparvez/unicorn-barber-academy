// src/features/admin/testimonials-page.tsx
// Graduate testimonial management: quote/name/program/cohort, optional
// photo (initials avatar fallback), rating, ordering, publish.
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
import { uploadImage } from "@/lib/api/blog-admin";
import type { TestimonialAdmin } from "@/lib/content";
import {
	useCreateTestimonial,
	useDeleteTestimonial,
	useTestimonialsAdmin,
	useUpdateTestimonial,
} from "@/service/content";
import { useProgramOptions } from "@/service/enrollment";

const EMPTY = {
	quote: "",
	name: "",
	programSlug: "",
	programName: "",
	cohort: "",
	imageUrl: "",
	rating: "5",
};

export function TestimonialsPage() {
	const { data: items, isPending } = useTestimonialsAdmin();
	const { data: programs } = useProgramOptions();
	const createMutation = useCreateTestimonial();
	const updateMutation = useUpdateTestimonial();
	const deleteMutation = useDeleteTestimonial();
	const [form, setForm] = useState(EMPTY);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [deleteId, setDeleteId] = useState<number | null>(null);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const busy =
		createMutation.isPending ||
		updateMutation.isPending ||
		deleteMutation.isPending ||
		uploading;

	const set = (key: keyof typeof EMPTY, value: string) =>
		setForm((f) => ({ ...f, [key]: value }));

	function startEdit(t: TestimonialAdmin) {
		setEditingId(t.id);
		setForm({
			quote: t.quote,
			name: t.name,
			programSlug: t.programSlug ?? "",
			programName: t.programName,
			cohort: t.cohort,
			imageUrl: t.image?.startsWith("http") ? t.image : "",
			rating: String(t.rating),
		});
		window.scrollTo({ top: 0 });
	}

	function cancelEdit() {
		setEditingId(null);
		setForm(EMPTY);
	}

	async function onUpload(file: File | undefined) {
		if (!file) return;
		setUploading(true);
		setError(null);
		try {
			const url = await uploadImage(file, `testimonial-${Date.now()}`);
			setForm((f) => ({ ...f, imageUrl: url }));
		} catch (err) {
			setError(err instanceof Error ? err.message : "Upload failed");
		} finally {
			setUploading(false);
		}
	}

	function onProgramPick(slug: string) {
		setForm((f) => {
			const program = (programs ?? []).find((p) => p.slug === slug);
			return {
				...f,
				programSlug: slug,
				programName: program ? program.title : f.programName,
			};
		});
	}

	function payload() {
		return {
			quote: form.quote.trim(),
			name: form.name.trim(),
			programSlug: form.programSlug || null,
			programName: form.programName.trim(),
			cohort: form.cohort.trim(),
			imageUrl: form.imageUrl.trim() || null,
			rating: Number.parseInt(form.rating, 10) || 5,
		};
	}

	async function onSubmit(event: React.FormEvent) {
		event.preventDefault();
		if (busy) return;
		setError(null);
		setNotice(null);
		try {
			if (editingId) {
				await updateMutation.mutateAsync({ id: editingId, patch: payload() });
				setNotice("Testimonial updated.");
			} else {
				await createMutation.mutateAsync({
					...payload(),
					imageAlt: null,
					sortOrder: (items?.length ?? 0) * 10 + 10,
				});
				setNotice("Testimonial added.");
			}
			cancelEdit();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Save failed");
		}
	}

	async function onTogglePublish(t: TestimonialAdmin) {
		setError(null);
		try {
			await updateMutation.mutateAsync({
				id: t.id,
				patch: { isPublished: !t.isPublished },
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Update failed");
		}
	}

	async function onMove(t: TestimonialAdmin, dir: -1 | 1) {
		const list = items ?? [];
		const other = list[list.findIndex((i) => i.id === t.id) + dir];
		if (!other) return;
		setError(null);
		try {
			await updateMutation.mutateAsync({
				id: t.id,
				patch: { sortOrder: other.sortOrder },
			});
			await updateMutation.mutateAsync({
				id: other.id,
				patch: { sortOrder: t.sortOrder },
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
			setNotice("Testimonial deleted.");
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
					{editingId ? "Edit testimonial" : "Testimonials"}
				</h1>
				<p className="text-sm text-muted-foreground">
					Graduate quotes for the home carousel. No photo → initials avatar.
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

			<form
				onSubmit={onSubmit}
				className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2"
			>
				<Textarea
					placeholder="Quote *"
					value={form.quote}
					onChange={(e) => set("quote", e.target.value)}
					required
					rows={3}
					className="sm:col-span-2"
					aria-label="Quote"
				/>
				<Input
					placeholder="Graduate name *"
					value={form.name}
					onChange={(e) => set("name", e.target.value)}
					required
					className="h-9"
					aria-label="Name"
				/>
				<Input
					placeholder="Cohort (e.g. 2025)"
					value={form.cohort}
					onChange={(e) => set("cohort", e.target.value)}
					className="h-9"
					aria-label="Cohort"
				/>
				<select
					value={form.programSlug}
					onChange={(e) => onProgramPick(e.target.value)}
					className="h-9 rounded-md border border-border bg-background px-3 text-sm"
					aria-label="Program"
				>
					<option value="">No linked program</option>
					{(programs ?? []).map((p) => (
						<option key={p.slug} value={p.slug}>
							{p.title}
						</option>
					))}
				</select>
				<Input
					placeholder="Program name (if unlisted)"
					value={form.programName}
					onChange={(e) => set("programName", e.target.value)}
					className="h-9"
					aria-label="Program name"
				/>
				<div className="flex gap-2 sm:col-span-2">
					<Input
						placeholder="Photo URL (optional)"
						value={form.imageUrl}
						onChange={(e) => set("imageUrl", e.target.value)}
						className="h-9 flex-1"
						aria-label="Photo URL"
					/>
					<label className="inline-flex h-9 cursor-pointer items-center rounded-md border border-border px-3 text-sm hover:bg-muted">
						{uploading ? "Uploading…" : "Upload"}
						<input
							type="file"
							accept="image/*"
							className="hidden"
							disabled={uploading}
							onChange={(e) => void onUpload(e.target.files?.[0])}
						/>
					</label>
					<select
						value={form.rating}
						onChange={(e) => set("rating", e.target.value)}
						className="h-9 rounded-md border border-border bg-background px-3 text-sm"
						aria-label="Rating"
					>
						{[5, 4, 3, 2, 1].map((r) => (
							<option key={r} value={r}>
								{r} ★
							</option>
						))}
					</select>
				</div>
				<div className="flex gap-2 sm:col-span-2">
					<Button type="submit" disabled={busy}>
						{editingId ? "Save changes" : "Add testimonial"}
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
						<Skeleton className="h-4 w-48" />
					</li>
				) : (
					(items ?? []).map((t) => (
						<li key={t.id} className="flex flex-wrap items-center gap-3 p-4">
							{t.image ? (
								<img
									src={t.image}
									alt=""
									className="h-11 w-11 rounded-full object-cover"
									loading="lazy"
								/>
							) : (
								<span
									aria-hidden="true"
									className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 font-heading text-lg font-semibold text-primary"
								>
									{t.name.charAt(0)}
								</span>
							)}
							<div className="min-w-0 flex-1">
								<div className="flex flex-wrap items-center gap-2">
									<Badge variant={t.isPublished ? "secondary" : "outline"}>
										{t.isPublished ? "Live" : "Hidden"}
									</Badge>
									<span className="text-[11px] text-muted-foreground">
										{"★".repeat(t.rating)}
									</span>
								</div>
								<p className="mt-1 line-clamp-2 text-sm">
									&ldquo;{t.quote}&rdquo;
								</p>
								<p className="text-xs text-muted-foreground">
									{t.name}
									{t.programName ? ` · ${t.programName}` : ""}
									{t.cohort ? ` · ${t.cohort}` : ""}
								</p>
							</div>
							<div className="flex items-center gap-1">
								<Button
									variant="ghost"
									size="sm"
									disabled={busy}
									onClick={() => void onMove(t, -1)}
									aria-label="Move earlier"
								>
									↑
								</Button>
								<Button
									variant="ghost"
									size="sm"
									disabled={busy}
									onClick={() => void onMove(t, 1)}
									aria-label="Move later"
								>
									↓
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={busy}
									onClick={() => void onTogglePublish(t)}
								>
									{t.isPublished ? "Hide" : "Publish"}
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={busy}
									onClick={() => startEdit(t)}
								>
									Edit
								</Button>
								<Button
									variant="ghost"
									size="sm"
									disabled={busy}
									className="text-muted-foreground hover:text-destructive"
									onClick={() => setDeleteId(t.id)}
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
						<AlertDialogTitle>Delete this testimonial?</AlertDialogTitle>
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
