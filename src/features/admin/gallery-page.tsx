// src/features/admin/gallery-page.tsx
// Gallery management: upload-first flow (upload → row), caption/alt edits,
// category, ordering, publish. Empty image URL keeps the bundled seed photo.
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
import { uploadImage } from "@/lib/api/blog-admin";
import {
	GALLERY_CATEGORIES,
	type GalleryAdmin,
	type GalleryCategory,
} from "@/lib/content";
import {
	useCreateGalleryItem,
	useDeleteGalleryItem,
	useGalleryAdmin,
	useUpdateGalleryItem,
} from "@/service/content";

export function GalleryAdminPage() {
	const { data: items, isPending } = useGalleryAdmin();
	const createMutation = useCreateGalleryItem();
	const updateMutation = useUpdateGalleryItem();
	const deleteMutation = useDeleteGalleryItem();
	const [category, setCategory] = useState<GalleryCategory>("studio");
	const [alt, setAlt] = useState("");
	const [caption, setCaption] = useState("");
	const [deleteId, setDeleteId] = useState<number | null>(null);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const busy =
		createMutation.isPending ||
		updateMutation.isPending ||
		deleteMutation.isPending ||
		uploading;

	async function onUpload(file: File | undefined) {
		if (!file || busy) return;
		if (!alt.trim()) {
			setError("Write the alt text first — every photo needs it.");
			return;
		}
		setUploading(true);
		setError(null);
		setNotice(null);
		try {
			const url = await uploadImage(file, `gallery-${Date.now()}`);
			await createMutation.mutateAsync({
				category,
				imageUrl: url,
				imageAlt: alt.trim(),
				caption: caption.trim() || null,
				sortOrder: (items?.length ?? 0) * 10 + 10,
			});
			setNotice("Photo added.");
			setAlt("");
			setCaption("");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Upload failed");
		} finally {
			setUploading(false);
		}
	}

	async function onAltSave(item: GalleryAdmin, value: string) {
		if (!value.trim() || value === item.alt) return;
		setError(null);
		try {
			await updateMutation.mutateAsync({
				id: item.id,
				patch: { imageAlt: value.trim() },
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Save failed");
		}
	}

	async function onToggle(
		item: GalleryAdmin,
		patch: { isPublished?: boolean; isFeatured?: boolean },
	) {
		setError(null);
		try {
			await updateMutation.mutateAsync({ id: item.id, patch });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Update failed");
		}
	}

	async function onMove(item: GalleryAdmin, dir: -1 | 1) {
		const list = items ?? [];
		const other = list[list.findIndex((i) => i.id === item.id) + dir];
		if (!other) return;
		setError(null);
		try {
			await updateMutation.mutateAsync({
				id: item.id,
				patch: { sortOrder: other.sortOrder },
			});
			await updateMutation.mutateAsync({
				id: other.id,
				patch: { sortOrder: item.sortOrder },
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
			setNotice("Photo deleted.");
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
					Gallery
				</h1>
				<p className="text-sm text-muted-foreground">
					Upload a photo straight into a category — alt text first, then the
					file.
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

			<div className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[auto_1fr_1fr_auto]">
				<select
					value={category}
					onChange={(e) => setCategory(e.target.value as GalleryCategory)}
					className="h-9 rounded-md border border-border bg-background px-3 text-sm"
					aria-label="Category"
				>
					{GALLERY_CATEGORIES.map((c) => (
						<option key={c} value={c}>
							{c}
						</option>
					))}
				</select>
				<Input
					placeholder="Alt text * (describe the photo)"
					value={alt}
					onChange={(e) => setAlt(e.target.value)}
					className="h-9"
					aria-label="Alt text"
				/>
				<Input
					placeholder="Caption (optional)"
					value={caption}
					onChange={(e) => setCaption(e.target.value)}
					className="h-9"
					aria-label="Caption"
				/>
				<label className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
					{uploading ? "Uploading…" : "Upload photo"}
					<input
						type="file"
						accept="image/*"
						className="hidden"
						disabled={busy}
						onChange={(e) => void onUpload(e.target.files?.[0])}
					/>
				</label>
			</div>

			{isPending ? (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} className="aspect-square w-full" />
					))}
				</div>
			) : (
				<ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
					{(items ?? []).map((item) => (
						<li
							key={item.id}
							className="overflow-hidden rounded-xl border border-border bg-card"
						>
							{item.image ? (
								<img
									src={item.image}
									alt=""
									className="aspect-square w-full object-cover"
									loading="lazy"
								/>
							) : (
								<div className="flex aspect-square w-full items-center justify-center bg-muted text-xs text-muted-foreground">
									No image
								</div>
							)}
							<div className="space-y-2 p-3">
								<div className="flex items-center gap-2">
									<Badge variant="secondary">{item.category}</Badge>
									<Badge variant={item.isPublished ? "default" : "outline"}>
										{item.isPublished ? "Live" : "Hidden"}
									</Badge>
									{item.isFeatured ? (
										<Badge className="bg-primary/15 text-primary">
											Featured
										</Badge>
									) : null}
								</div>
								<input
									key={`${item.id}:${item.alt}`}
									defaultValue={item.alt}
									onBlur={(e) => void onAltSave(item, e.target.value)}
									className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
									aria-label={`Alt text for photo ${item.id}`}
								/>
								<div className="flex items-center gap-1">
									<Button
										variant="ghost"
										size="sm"
										disabled={busy}
										onClick={() => void onMove(item, -1)}
										aria-label="Move earlier"
									>
										←
									</Button>
									<Button
										variant="ghost"
										size="sm"
										disabled={busy}
										onClick={() => void onMove(item, 1)}
										aria-label="Move later"
									>
										→
									</Button>
									<Button
										variant={item.isFeatured ? "default" : "outline"}
										size="sm"
										disabled={busy}
										onClick={() =>
											void onToggle(item, { isFeatured: !item.isFeatured })
										}
										aria-label="Toggle home feature"
									>
										★
									</Button>
									<Button
										variant="outline"
										size="sm"
										disabled={busy}
										onClick={() =>
											void onToggle(item, { isPublished: !item.isPublished })
										}
									>
										{item.isPublished ? "Hide" : "Show"}
									</Button>
									<Button
										variant="ghost"
										size="sm"
										disabled={busy}
										className="ml-auto text-muted-foreground hover:text-destructive"
										onClick={() => setDeleteId(item.id)}
										aria-label={`Delete photo ${item.id}`}
									>
										Delete
									</Button>
								</div>
							</div>
						</li>
					))}
				</ul>
			)}

			<AlertDialog
				open={deleteId !== null}
				onOpenChange={(open) => !open && setDeleteId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete this photo?</AlertDialogTitle>
						<AlertDialogDescription>
							It disappears from the gallery immediately. This cannot be undone.
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
