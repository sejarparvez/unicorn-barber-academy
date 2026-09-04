// src/features/blog-admin/post-editor-page.tsx
// Create/edit surface for blog posts. Two-pane layout: content on the left,
// SEO & AIO controls on the right. Works against /api/admin/blog via the
// typed client in lib/api/blog-admin.ts.
import {
	IconArrowLeft,
	IconDeviceFloppy,
	IconEye,
	IconPhotoPlus,
	IconTrash,
} from "@tabler/icons-react";
import { Link, useBlocker, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadImage } from "@/lib/api/blog-admin";
import {
	BLOG_STATUS_LABELS,
	BLOG_STATUSES,
	type BlogCategory,
	type BlogPostFull,
	type BlogStatus,
	deriveExcerpt,
	seoChecks,
	slugify,
} from "@/lib/blog";
import { cn } from "@/lib/utils";
import { useDeletePost, useSavePost } from "@/service/blog";
import { MarkdownEditor } from "./markdown-editor";
import { SeoPanel } from "./seo-panel";
import { formRowsFromPost, type PostFormState } from "./types";

type Props = {
	mode: "new" | "edit";
	categories: BlogCategory[];
	post?: BlogPostFull;
};

function formFromPost(post?: BlogPostFull): PostFormState {
	const rows = formRowsFromPost(post);
	return {
		title: post?.title ?? "",
		slug: post?.slug ?? "",
		slugTouched: Boolean(post),
		excerpt: post?.excerpt ?? "",
		contentMd: post?.contentMd ?? "",
		coverImageUrl: post?.coverImageUrl ?? "",
		coverImageAlt: post?.coverImageAlt ?? "",
		metaTitle: post?.metaTitle ?? "",
		metaDescription: post?.metaDescription ?? "",
		focusKeyword: post?.focusKeyword ?? "",
		seoKeywords: post?.seoKeywords ?? [],
		canonicalUrl: post?.canonicalUrl ?? "",
		ogImageUrl: post?.ogImageUrl ?? "",
		noindex: post?.noindex ?? false,
		keyTakeaways: rows.keyTakeaways,
		faq: rows.faq,
		relatedProgramSlugs: post?.relatedProgramSlugs ?? [],
		tags: post?.tags ?? [],
		status: post?.status ?? "draft",
		categoryId: post?.category?.id ?? null,
	};
}

export function PostEditorPage({ mode, categories, post }: Props) {
	const navigate = useNavigate();
	const [form, setForm] = useState<PostFormState>(() => formFromPost(post));
	// Snapshot captured once on mount; refreshed after every successful
	// save so "dirty" means diverged-from-saved.
	const [savedSnapshot, setSavedSnapshot] = useState(() =>
		JSON.stringify(formFromPost(post)),
	);
	const save = useSavePost(mode === "edit" ? post?.id : undefined);
	const deleteMutation = useDeletePost();
	const saving = save.isPending || deleteMutation.isPending;
	const [error, setError] = useState<string | null>(null);
	const [savedAt, setSavedAt] = useState<string | null>(null);
	// Deletion is confirmed through the shared AlertDialog — no timer
	// bookkeeping, and consistent with the other admin surfaces.
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [uploadingCover, setUploadingCover] = useState(false);
	const coverInputRef = useRef<HTMLInputElement>(null);

	// Dirty tracking: warn before leaving with unsaved edits (router-level
	// blocker for SPA navigation + browser guard for refresh/close).
	const isDirty = useMemo(
		() => JSON.stringify(form) !== savedSnapshot,
		[form, savedSnapshot],
	);
	useBlocker({
		shouldBlockFn: () => {
			if (!isDirty || saving) return false;
			const leave = window.confirm(
				"You have unsaved changes. Leave without saving?",
			);
			return !leave;
		},
	});
	useEffect(() => {
		if (!isDirty) return;
		const handler = (event: BeforeUnloadEvent) => {
			event.preventDefault();
		};
		window.addEventListener("beforeunload", handler);
		return () => window.removeEventListener("beforeunload", handler);
	}, [isDirty]);

	const patch = (changes: Partial<PostFormState>) =>
		setForm((prev) => ({ ...prev, ...changes }));

	const checks = useMemo(
		() =>
			seoChecks({
				...form,
				keyTakeaways: form.keyTakeaways.map((row) => row.text),
				faq: form.faq.map(({ q, a }) => ({ q, a })),
			}),
		[form],
	);

	async function onSave(nextStatus?: BlogStatus) {
		// Mirror the server rule locally so admins get instant feedback.
		if (form.coverImageUrl.trim() && !form.coverImageAlt.trim()) {
			setError(
				"Cover image alt text is required — describe the image using natural keywords.",
			);
			return;
		}
		setError(null);
		const status = nextStatus ?? form.status;
		const payload = {
			slug: form.slugTouched && form.slug ? form.slug : undefined,
			title: form.title,
			excerpt: form.excerpt.trim() || deriveExcerpt(form.contentMd),
			contentMd: form.contentMd,
			coverImageUrl: form.coverImageUrl.trim() || null,
			coverImageAlt: form.coverImageUrl.trim()
				? form.coverImageAlt.trim() || null
				: null,
			metaTitle: form.metaTitle.trim() || null,
			metaDescription: form.metaDescription.trim() || null,
			focusKeyword: form.focusKeyword.trim() || null,
			seoKeywords: form.seoKeywords,
			canonicalUrl: form.canonicalUrl.trim() || null,
			ogImageUrl: form.ogImageUrl.trim() || null,
			noindex: form.noindex,
			keyTakeaways: form.keyTakeaways
				.map((row) => row.text.trim())
				.filter(Boolean),
			faq: form.faq.map(({ q, a }) => ({ q, a })),
			relatedProgramSlugs: form.relatedProgramSlugs,
			tags: form.tags,
			status,
			categoryId: form.categoryId,
		};
		try {
			if (mode === "new") {
				const created = await save.mutateAsync(payload);
				// Freshly saved — disarm the unsaved-changes blocker for the
				// redirect into edit mode.
				setSavedSnapshot(JSON.stringify(form));
				await navigate({
					to: "/dashboard/blog/$id/edit",
					params: { id: String(created.id) },
					replace: true,
				});
			} else if (post) {
				const saved = await save.mutateAsync({
					...payload,
					slug: form.slugTouched ? form.slug : undefined,
				});
				// Adopt the server's view: slug collisions resolve to e.g.
				// "slug-2", and the status may have been normalized.
				const next = { ...form, slug: saved.slug, status: saved.status };
				setForm(next);
				setSavedSnapshot(JSON.stringify(next));
				setSavedAt(new Date().toLocaleTimeString());
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Save failed");
		}
	}

	async function onDelete() {
		if (!post) return;
		try {
			await deleteMutation.mutateAsync(post.id);
			// Post is gone — disarm the unsaved-changes blocker for this nav.
			setSavedSnapshot(JSON.stringify(form));
			await navigate({ to: "/dashboard/blog", replace: true });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Delete failed");
		}
	}

	async function onCoverFile(file: File) {
		setUploadingCover(true);
		setError(null);
		try {
			const url = await uploadImage(file, form.slug || "cover");
			patch({ coverImageUrl: url });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Upload failed");
		} finally {
			setUploadingCover(false);
		}
	}

	return (
		<div className="space-y-6">
			{/* Header row */}
			<header className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<Link
						to="/dashboard/blog"
						aria-label="Back to posts"
						className={cn(
							buttonVariants({ variant: "ghost", size: "icon" }),
							"text-muted-foreground",
						)}
					>
						<IconArrowLeft className="h-4 w-4" />
					</Link>
					<div>
						<p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
							{mode === "new" ? "New post" : "Edit post"}
						</p>
						<h1 className="font-heading text-xl font-semibold tracking-tight">
							{form.title || "Untitled"}
						</h1>
					</div>
					<Badge
						variant={form.status === "published" ? "default" : "secondary"}
						className="h-5 px-1.5 text-[10px]"
					>
						{BLOG_STATUS_LABELS[form.status]}
					</Badge>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					{post && post.status === "published" ? (
						<a
							href={`/blog/${post.slug}`}
							target="_blank"
							rel="noreferrer"
							className={cn(
								buttonVariants({ variant: "outline", size: "sm" }),
								"gap-1.5",
							)}
						>
							<IconEye className="h-3.5 w-3.5" /> View live
						</a>
					) : null}
					{mode === "edit" ? (
						<AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
							<AlertDialogTrigger
								render={
									<Button
										variant="ghost"
										size="sm"
										className="gap-1.5 text-destructive hover:text-destructive"
									/>
								}
							>
								<IconTrash className="h-3.5 w-3.5" />
								Delete
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Delete this post?</AlertDialogTitle>
									<AlertDialogDescription>
										This permanently removes the post and its slug redirects.
										Public URLs will hard-404. This cannot be undone.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										className="bg-destructive text-white hover:bg-destructive/90"
										onClick={(event) => {
											event.preventDefault();
											void onDelete();
										}}
									>
										Delete post
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					) : null}
					<Button
						onClick={() => onSave()}
						disabled={saving || !form.title.trim()}
						className="gap-1.5"
					>
						<IconDeviceFloppy className="h-4 w-4" />
						{saving
							? "Saving…"
							: `Save ${BLOG_STATUS_LABELS[form.status].toLowerCase()}`}
					</Button>
				</div>
			</header>

			{error ? (
				<p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
					{error}
				</p>
			) : null}
			{savedAt && !error ? (
				<p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
					Saved at {savedAt}.
				</p>
			) : null}

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
				{/* ------------------------- Content pane ------------------------- */}
				<div className="space-y-5">
					<div className="space-y-1.5">
						<Label htmlFor="post-title">Title</Label>
						<Input
							id="post-title"
							value={form.title}
							placeholder="How long does it take to become a barber?"
							required
							onChange={(e) => {
								const title = e.target.value;
								patch({
									title,
									slug: form.slugTouched ? form.slug : slugify(title),
								});
							}}
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="post-slug">Slug</Label>
						<div className="flex items-center gap-1 rounded-md border border-border bg-muted/30 px-3 py-1.5 text-sm">
							<span className="shrink-0 text-muted-foreground">/blog/</span>
							<input
								id="post-slug"
								value={form.slug}
								onChange={(e) =>
									patch({ slug: e.target.value, slugTouched: true })
								}
								className="w-full bg-transparent outline-none"
							/>
						</div>
						<p className="text-[11px] text-muted-foreground">
							Keep the focus keyword in the slug. Changing it after publishing
							changes the public URL.
						</p>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-1.5">
							<Label htmlFor="post-category">Category</Label>
							<select
								id="post-category"
								value={form.categoryId ?? ""}
								onChange={(e) =>
									patch({
										categoryId: e.target.value ? Number(e.target.value) : null,
									})
								}
								className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
							>
								<option value="">None</option>
								{categories.map((c) => (
									<option key={c.id} value={c.id}>
										{c.name}
									</option>
								))}
							</select>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="post-status">Status</Label>
							<select
								id="post-status"
								value={form.status}
								onChange={(e) =>
									patch({ status: e.target.value as BlogStatus })
								}
								className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
							>
								{BLOG_STATUSES.map((s) => (
									<option key={s} value={s}>
										{BLOG_STATUS_LABELS[s]}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="post-excerpt">Excerpt</Label>
						<Textarea
							id="post-excerpt"
							rows={2}
							value={form.excerpt}
							placeholder="Auto-derived from the article when left blank"
							onChange={(e) => patch({ excerpt: e.target.value })}
						/>
					</div>

					{/* Cover */}
					<div className="space-y-2">
						<Label htmlFor="cover-url">Cover image</Label>
						{form.coverImageUrl ? (
							<div className="relative overflow-hidden rounded-lg border border-border">
								<img
									src={form.coverImageUrl}
									alt={form.coverImageAlt || "Cover preview"}
									loading="lazy"
									className="max-h-52 w-full object-cover"
								/>
								<button
									type="button"
									aria-label="Remove cover"
									className="absolute top-2 right-2 rounded-full bg-background/90 p-1 text-destructive shadow"
									onClick={() =>
										patch({ coverImageUrl: "", coverImageAlt: "" })
									}
								>
									<IconTrash className="h-4 w-4" />
								</button>
							</div>
						) : null}
						<div className="flex flex-wrap items-center gap-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="gap-1.5"
								disabled={uploadingCover}
								onClick={() => coverInputRef.current?.click()}
							>
								<IconPhotoPlus className="h-3.5 w-3.5" />
								{uploadingCover ? "Uploading…" : "Upload image"}
							</Button>
							<span className="text-xs text-muted-foreground">
								or paste a URL below
							</span>
						</div>
						<input
							ref={coverInputRef}
							type="file"
							accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
							className="sr-only"
							aria-label="Upload cover image"
							onChange={(e) => {
								const file = e.target.files?.[0];
								e.target.value = "";
								if (file) void onCoverFile(file);
							}}
						/>
						<Input
							id="cover-url"
							value={form.coverImageUrl}
							placeholder="https://…"
							onChange={(e) => patch({ coverImageUrl: e.target.value })}
						/>
						{form.coverImageUrl ? (
							<Input
								aria-label="Cover image alt text"
								value={form.coverImageAlt}
								placeholder="Alt text — describe the image using natural keywords (required)"
								onChange={(e) => patch({ coverImageAlt: e.target.value })}
								className={cn(
									!form.coverImageAlt.trim() && "border-destructive/50",
								)}
							/>
						) : null}
					</div>

					{/* Body */}
					<div className="space-y-1.5">
						<Label>Article body</Label>
						<MarkdownEditor
							value={form.contentMd}
							onChange={(contentMd) => patch({ contentMd })}
							slugForUploads={form.slug}
						/>
					</div>
				</div>

				{/* --------------------------- SEO pane --------------------------- */}
				<aside className="lg:max-h-[calc(100svh-8rem)] lg:overflow-y-auto lg:pr-1">
					<SeoPanel value={form} onChange={patch} checks={checks} />
				</aside>
			</div>
		</div>
	);
}
