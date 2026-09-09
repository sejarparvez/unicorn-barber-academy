// src/features/admin/instructors-page.tsx
// Instructor roster management: create/edit profiles, lead + publish flags,
// ordering, photo upload (Cloudinary, falls back to bundled seeds).
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
import type { InstructorAdmin } from "@/lib/content";
import {
	useCreateInstructor,
	useDeleteInstructor,
	useInstructorsAdmin,
	useUpdateInstructor,
} from "@/service/content";
import { useProgramOptions } from "@/service/enrollment";

const EMPTY = {
	name: "",
	title: "",
	track: "barbering",
	memberNo: "",
	years: "8",
	bio: "",
	specialties: "",
	imageUrl: "",
	imageAlt: "",
	instagram: "",
	programSlug: "",
	lead: false,
	quote: "",
};

export function InstructorsPage() {
	const { data: instructors, isPending } = useInstructorsAdmin();
	const { data: programs } = useProgramOptions();
	const createMutation = useCreateInstructor();
	const updateMutation = useUpdateInstructor();
	const deleteMutation = useDeleteInstructor();
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

	const set = (key: keyof typeof EMPTY, value: string | boolean) =>
		setForm((f) => ({ ...f, [key]: value }));

	function startEdit(ins: InstructorAdmin) {
		setEditingId(ins.id);
		setForm({
			name: ins.name,
			title: ins.title,
			track: ins.track,
			memberNo: "",
			years: String(ins.years),
			bio: ins.bio,
			specialties: ins.specialties.join(", "),
			imageUrl: ins.image?.startsWith("http") ? ins.image : "",
			imageAlt: ins.imageAlt,
			instagram: ins.instagram ?? "",
			programSlug: ins.programSlug ?? "",
			lead: ins.lead,
			quote: ins.quote ?? "",
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
			const url = await uploadImage(file, `instructor-${Date.now()}`);
			setForm((f) => ({ ...f, imageUrl: url }));
		} catch (err) {
			setError(err instanceof Error ? err.message : "Upload failed");
		} finally {
			setUploading(false);
		}
	}

	function payload() {
		return {
			name: form.name.trim(),
			title: form.title.trim(),
			track: form.track,
			memberNo: form.memberNo.trim(),
			years: Number.parseInt(form.years, 10) || 0,
			bio: form.bio.trim(),
			specialties: form.specialties
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean),
			imageUrl: form.imageUrl.trim() || null,
			imageAlt: form.imageAlt.trim() || null,
			instagram: form.instagram.trim() || null,
			programSlug: form.programSlug || null,
			lead: form.lead,
			quote: form.quote.trim() || null,
		};
	}

	async function onSubmit(event: React.FormEvent) {
		event.preventDefault();
		if (busy) return;
		setError(null);
		setNotice(null);
		try {
			if (editingId) {
				const { memberNo: _m, ...rest } = payload();
				void _m;
				await updateMutation.mutateAsync({ id: editingId, patch: rest });
				setNotice("Instructor updated.");
			} else {
				await createMutation.mutateAsync({
					...payload(),
					memberNo: form.memberNo.trim(),
					sortOrder: (instructors?.length ?? 0) * 10 + 10,
					isPublished: true,
				});
				setNotice("Instructor created.");
			}
			cancelEdit();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Save failed");
		}
	}

	async function onTogglePublish(ins: InstructorAdmin) {
		setError(null);
		try {
			await updateMutation.mutateAsync({
				id: ins.id,
				patch: { isPublished: !ins.isPublished },
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Update failed");
		}
	}

	async function onMove(ins: InstructorAdmin, dir: -1 | 1) {
		const list = instructors ?? [];
		const idx = list.findIndex((i) => i.id === ins.id);
		const other = list[idx + dir];
		if (!other) return;
		setError(null);
		try {
			await updateMutation.mutateAsync({
				id: ins.id,
				patch: { sortOrder: other.sortOrder },
			});
			await updateMutation.mutateAsync({
				id: other.id,
				patch: { sortOrder: ins.sortOrder },
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
			setNotice("Instructor deleted.");
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
					{editingId ? "Edit instructor" : "Instructors"}
				</h1>
				<p className="text-sm text-muted-foreground">
					Roster shown on the instructors page, home strip, and program pages.
					Empty photo URL keeps the bundled portrait.
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
				<Input
					placeholder="Name *"
					value={form.name}
					onChange={(e) => set("name", e.target.value)}
					required
					className="h-9"
					aria-label="Name"
				/>
				<Input
					placeholder="Title * (e.g. Instructor, Fades & Tapers)"
					value={form.title}
					onChange={(e) => set("title", e.target.value)}
					required
					className="h-9"
					aria-label="Title"
				/>
				<select
					value={form.track}
					onChange={(e) => set("track", e.target.value)}
					className="h-9 rounded-md border border-border bg-background px-3 text-sm"
					aria-label="Track"
				>
					<option value="barbering">Barbering</option>
					<option value="beauty">Beauty</option>
				</select>
				{editingId ? (
					<Input
						value="Member no. locked after create"
						disabled
						className="h-9"
						aria-label="Member number locked"
					/>
				) : (
					<Input
						placeholder="Member no. * (e.g. GM-07)"
						value={form.memberNo}
						onChange={(e) => set("memberNo", e.target.value)}
						required
						className="h-9"
						aria-label="Member number"
					/>
				)}
				<Input
					placeholder="Years experience"
					value={form.years}
					onChange={(e) => set("years", e.target.value)}
					inputMode="numeric"
					className="h-9"
					aria-label="Years"
				/>
				<select
					value={form.programSlug}
					onChange={(e) => set("programSlug", e.target.value)}
					className="h-9 rounded-md border border-border bg-background px-3 text-sm"
					aria-label="Teaches program"
				>
					<option value="">No linked program</option>
					{(programs ?? []).map((p) => (
						<option key={p.slug} value={p.slug}>
							{p.title}
						</option>
					))}
				</select>
				<Textarea
					placeholder="Bio"
					value={form.bio}
					onChange={(e) => set("bio", e.target.value)}
					rows={2}
					className="sm:col-span-2"
					aria-label="Bio"
				/>
				<Input
					placeholder="Specialties (comma-separated)"
					value={form.specialties}
					onChange={(e) => set("specialties", e.target.value)}
					className="h-9 sm:col-span-2"
					aria-label="Specialties"
				/>
				<Input
					placeholder="Quote (optional)"
					value={form.quote}
					onChange={(e) => set("quote", e.target.value)}
					className="h-9 sm:col-span-2"
					aria-label="Quote"
				/>
				<div className="flex gap-2 sm:col-span-2">
					<Input
						placeholder="Photo URL (or upload →)"
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
				</div>
				<Input
					placeholder="Photo alt text"
					value={form.imageAlt}
					onChange={(e) => set("imageAlt", e.target.value)}
					className="h-9"
					aria-label="Photo alt"
				/>
				<Input
					placeholder="Instagram URL (optional)"
					value={form.instagram}
					onChange={(e) => set("instagram", e.target.value)}
					className="h-9"
					aria-label="Instagram"
				/>
				<label className="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						checked={form.lead}
						onChange={(e) => set("lead", e.target.checked)}
						className="h-4 w-4"
					/>
					Lead instructor (spotlight)
				</label>
				<div className="flex gap-2">
					<Button type="submit" disabled={busy}>
						{editingId ? "Save changes" : "Add instructor"}
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
					(instructors ?? []).map((ins) => (
						<li key={ins.id} className="flex flex-wrap items-center gap-3 p-4">
							{ins.image ? (
								<img
									src={ins.image}
									alt=""
									className="h-11 w-11 rounded-full object-cover"
									loading="lazy"
								/>
							) : (
								<span
									aria-hidden="true"
									className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 font-heading text-lg font-semibold text-primary"
								>
									{ins.name.charAt(0)}
								</span>
							)}
							<div className="min-w-0 flex-1">
								<div className="flex flex-wrap items-center gap-2">
									{ins.lead ? <Badge>Lead</Badge> : null}
									<Badge variant={ins.isPublished ? "secondary" : "outline"}>
										{ins.isPublished ? "Live" : "Hidden"}
									</Badge>
									<span className="text-[11px] tracking-wide text-muted-foreground uppercase">
										{ins.track}
									</span>
								</div>
								<p className="mt-1 font-medium">
									{ins.name}{" "}
									<span className="font-normal text-muted-foreground">
										· {ins.title}
									</span>
								</p>
							</div>
							<div className="flex items-center gap-1">
								<Button
									variant="ghost"
									size="sm"
									disabled={busy}
									onClick={() => void onMove(ins, -1)}
									aria-label={`Move ${ins.name} up`}
								>
									↑
								</Button>
								<Button
									variant="ghost"
									size="sm"
									disabled={busy}
									onClick={() => void onMove(ins, 1)}
									aria-label={`Move ${ins.name} down`}
								>
									↓
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={busy}
									onClick={() => void onTogglePublish(ins)}
								>
									{ins.isPublished ? "Hide" : "Publish"}
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={busy}
									onClick={() => startEdit(ins)}
								>
									Edit
								</Button>
								<Button
									variant="ghost"
									size="sm"
									disabled={busy}
									className="text-muted-foreground hover:text-destructive"
									onClick={() => setDeleteId(ins.id)}
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
						<AlertDialogTitle>Delete this instructor?</AlertDialogTitle>
						<AlertDialogDescription>
							Their profile disappears from all pages immediately. This cannot
							be undone.
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
