// src/features/blog-admin/post-list-page.tsx
// Admin listing of every post with status filter tabs and quick actions
// (publish / unpublish / archive / delete). Reads + mutations flow through
// the service layer (src/service/blog.ts).
import {
	IconEye,
	IconPencil,
	IconPlus,
	IconSearch,
	IconTrash,
} from "@tabler/icons-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
import { formatPostDate } from "@/lib/api/blog-admin";
import type { BlogPostSummary } from "@/lib/blog";
import { BLOG_STATUS_LABELS, type BlogStatus } from "@/lib/blog";
import { cn } from "@/lib/utils";
import {
	useAdminPosts,
	useBlogCategories,
	useBulkDeletePosts,
	useBulkSetPostStatus,
	useDeletePost,
	useSetPostStatus,
} from "@/service/blog";
import { BlogBulkActionBar } from "./blog-bulk-action-bar";

const TABS: Array<{ label: string; status?: BlogStatus }> = [
	{ label: "All", status: undefined },
	{ label: "Published", status: "published" },
	{ label: "Drafts", status: "draft" },
	{ label: "Archived", status: "archived" },
];

export function PostListPage({
	statusFilter,
	search,
	categoryFilter,
	page = 1,
}: {
	statusFilter?: BlogStatus;
	search?: string;
	categoryFilter?: number;
	page?: number;
}) {
	const navigate = useNavigate();
	const { data, isPending } = useAdminPosts({
		status: statusFilter,
		search,
		category: categoryFilter,
		page,
	});
	const { data: categories } = useBlogCategories();
	const setStatusMutation = useSetPostStatus();
	const deleteMutation = useDeletePost();
	const bulkStatusMutation = useBulkSetPostStatus();
	const bulkDeleteMutation = useBulkDeletePosts();

	function navigateWith(next: {
		status?: BlogStatus;
		search?: string;
		category?: number;
		page?: number;
	}) {
		void navigate({
			to: "/dashboard/blog",
			search: {
				...(next.status ? { status: next.status } : {}),
				...(next.search ? { search: next.search } : {}),
				...(next.category ? { category: next.category } : {}),
				...(next.page && next.page > 1 ? { page: next.page } : {}),
			},
		});
	}

	const totalPages = data?.totalPages ?? 1;
	const mutatingId: number | undefined =
		(setStatusMutation.variables as { id?: number } | undefined)?.id ??
		(deleteMutation.variables as number | undefined);
	const [error, setError] = useState<string | null>(null);
	const [searchInput, setSearchInput] = useState(search ?? "");
	const [deleteTarget, setDeleteTarget] = useState<BlogPostSummary | null>(
		null,
	);
	const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

	const allIds = useMemo(
		() => (data?.items ?? []).map((p) => p.id),
		[data?.items],
	);
	const allSelected =
		allIds.length > 0 && allIds.every((id) => selectedIds.has(id));

	function toggleSelectAll() {
		if (allSelected) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(allIds));
		}
	}

	function toggleSelect(id: number) {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}

	async function setStatus(post: BlogPostSummary, status: BlogStatus) {
		setError(null);
		try {
			const action =
				status === "published"
					? "publish"
					: status === "draft"
						? "unpublish"
						: "archive";
			await setStatusMutation.mutateAsync({ id: post.id, action });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Action failed");
		}
	}

	async function onDelete(id: number) {
		setError(null);
		try {
			await deleteMutation.mutateAsync(id);
			setDeleteTarget(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Delete failed");
		}
	}

	async function onBulkStatus(status: BlogStatus) {
		const ids = [...selectedIds];
		if (ids.length === 0) return;
		setError(null);
		try {
			await bulkStatusMutation.mutateAsync({ ids, status });
			setSelectedIds(new Set());
		} catch (err) {
			setError(err instanceof Error ? err.message : "Bulk update failed");
		}
	}

	async function onBulkDelete() {
		const ids = [...selectedIds];
		if (ids.length === 0) return;
		setError(null);
		try {
			await bulkDeleteMutation.mutateAsync(ids);
			setSelectedIds(new Set());
		} catch (err) {
			setError(err instanceof Error ? err.message : "Bulk delete failed");
		}
	}

	return (
		<div className="space-y-6">
			<header className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
						Staff tools
					</p>
					<h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
						Blog posts
					</h1>
					<p className="text-sm text-muted-foreground">
						{data ? (
							`${data.total} total`
						) : (
							<Skeleton className="h-4 w-16 inline-block" />
						)}
					</p>
				</div>
				<Link
					to="/dashboard/blog/new"
					className={cn(buttonVariants(), "gap-1.5")}
				>
					<IconPlus className="h-4 w-4" /> New post
				</Link>
			</header>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					navigateWith({
						status: statusFilter,
						search: searchInput.trim() || undefined,
						category: categoryFilter,
						page: undefined,
					});
				}}
				className="flex items-center gap-2"
			>
				<Input
					value={searchInput}
					onChange={(e) => setSearchInput(e.target.value)}
					placeholder="Search title, slug, excerpt..."
					aria-label="Search posts"
					className="max-w-sm"
				/>
				<Button type="submit" variant="outline" size="sm">
					<IconSearch className="h-4 w-4" /> Search
				</Button>
				{search ? (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => {
							setSearchInput("");
							navigateWith({
								status: statusFilter,
								search: undefined,
								category: categoryFilter,
								page: undefined,
							});
						}}
					>
						Clear
					</Button>
				) : null}
			</form>

			<div className="flex flex-wrap items-center gap-3">
				<nav className="flex flex-wrap gap-2">
					{TABS.map((tab) => (
						<Link
							key={tab.label}
							to="/dashboard/blog"
							search={{
								...(tab.status ? { status: tab.status } : {}),
								...(search ? { search } : {}),
								...(categoryFilter ? { category: categoryFilter } : {}),
							}}
							className={cn(
								buttonVariants({ variant: "outline", size: "sm" }),
								statusFilter === tab.status && "border-primary text-primary",
							)}
						>
							{tab.label}
						</Link>
					))}
				</nav>

				{categories && categories.length > 0 ? (
					<select
						value={categoryFilter ?? ""}
						onChange={(e) => {
							const val = Number.parseInt(e.target.value, 10);
							navigateWith({
								status: statusFilter,
								search,
								category: Number.isInteger(val) && val > 0 ? val : undefined,
								page: undefined,
							});
						}}
						className="h-8 rounded-md border border-border bg-background px-2 text-sm"
						aria-label="Filter by category"
					>
						<option value="">All categories</option>
						{categories.map((cat) => (
							<option key={cat.id} value={cat.id}>
								{cat.name}
							</option>
						))}
					</select>
				) : null}

				<span className="flex-1" />
				<Link
					to="/dashboard/blog/categories"
					className={buttonVariants({ variant: "ghost", size: "sm" })}
				>
					Categories
				</Link>
			</div>

			{error ? (
				<p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
					{error}
				</p>
			) : null}

			{isPending ? (
				<ul className="divide-y divide-border rounded-xl border border-border bg-card">
					{Array.from({ length: 5 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
						<li key={i} className="flex items-center gap-4 p-4">
							<Skeleton className="h-5 w-5 shrink-0 rounded" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-48" />
								<Skeleton className="h-3 w-32" />
							</div>
							<Skeleton className="h-5 w-16 rounded-full" />
						</li>
					))}
				</ul>
			) : (data?.items.length ?? 0) === 0 ? (
				<section className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center">
					<h2 className="font-heading text-lg font-semibold">
						No posts here yet
					</h2>
					<p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
						Write your first article — it becomes a crawlable page with
						structured data the moment you publish.
					</p>
					<Link
						to="/dashboard/blog/new"
						className={cn(
							buttonVariants({ variant: "outline" }),
							"mt-5 gap-1.5",
						)}
					>
						<IconPlus className="h-4 w-4" /> Write a post
					</Link>
				</section>
			) : (
				<>
					{allIds.length > 0 ? (
						<label className="flex items-center gap-2 text-xs text-muted-foreground">
							<input
								type="checkbox"
								checked={allSelected}
								onChange={toggleSelectAll}
								className="accent-[var(--primary)]"
							/>
							Select all ({allIds.length})
						</label>
					) : null}
					<ul className="divide-y divide-border rounded-xl border border-border bg-card">
						{(data?.items ?? []).map((post) => (
							<li
								key={post.id}
								className="flex flex-wrap items-center gap-3 p-4 sm:flex-nowrap"
							>
								<input
									type="checkbox"
									checked={selectedIds.has(post.id)}
									onChange={() => toggleSelect(post.id)}
									className="accent-[var(--primary)]"
								/>
								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-center gap-2">
										<Badge
											variant={
												post.status === "published" ? "default" : "secondary"
											}
											className="h-5 px-1.5 text-[10px]"
										>
											{BLOG_STATUS_LABELS[post.status]}
										</Badge>
										{post.category ? (
											<span className="text-[11px] tracking-wide text-muted-foreground uppercase">
												{post.category.name}
											</span>
										) : null}
									</div>
									<p className="mt-1 truncate font-medium">{post.title}</p>
									<p className="truncate text-xs text-muted-foreground">
										/blog/{post.slug} · updated {formatPostDate(post.updatedAt)}
										{post.publishedAt
											? ` · published ${formatPostDate(post.publishedAt)}`
											: ""}
									</p>
								</div>

								<div className="flex shrink-0 items-center gap-1">
									<Link
										to="/dashboard/blog/$id/edit"
										params={{ id: String(post.id) }}
										aria-label="Edit"
										className={cn(
											buttonVariants({ variant: "ghost", size: "icon" }),
											"text-muted-foreground",
										)}
									>
										<IconPencil className="h-4 w-4" />
									</Link>
									{post.status === "published" ? (
										<a
											href={`/blog/${post.slug}`}
											target="_blank"
											rel="noreferrer"
											aria-label="View live"
											className={cn(
												buttonVariants({ variant: "ghost", size: "icon" }),
											)}
										>
											<IconEye className="h-4 w-4" />
										</a>
									) : null}
									<Button
										variant="outline"
										size="sm"
										disabled={mutatingId === post.id || !post.slug}
										onClick={() =>
											setStatus(
												post,
												post.status === "published" ? "draft" : "published",
											)
										}
									>
										{mutatingId === post.id
											? "…"
											: post.status === "published"
												? "Unpublish"
												: "Publish"}
									</Button>
									<Button
										variant="ghost"
										size="icon"
										aria-label="Delete"
										disabled={mutatingId === post.id}
										onClick={() => setDeleteTarget(post)}
									>
										<IconTrash className="h-4 w-4" />
									</Button>
								</div>
							</li>
						))}
					</ul>
				</>
			)}

			{totalPages > 1 ? (
				<footer className="flex items-center justify-between text-sm">
					{page > 1 ? (
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								navigateWith({ status: statusFilter, search, page: page - 1 })
							}
						>
							Previous
						</Button>
					) : (
						<span className="text-muted-foreground">Previous</span>
					)}
					<span className="text-muted-foreground">
						Page {page} of {totalPages} · {data?.total ?? 0} posts
					</span>
					{data && page < totalPages ? (
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								navigateWith({ status: statusFilter, search, page: page + 1 })
							}
						>
							Next
						</Button>
					) : (
						<span className="text-muted-foreground">Next</span>
					)}
				</footer>
			) : null}

			<BlogBulkActionBar
				selectedIds={selectedIds}
				setSelectedIds={setSelectedIds}
				bulkStatusMutation={bulkStatusMutation}
				onBulkStatus={onBulkStatus}
				onBulkDelete={onBulkDelete}
				bulkDeleteOpen={bulkDeleteOpen}
				setBulkDeleteOpen={setBulkDeleteOpen}
			/>

			<AlertDialog
				open={deleteTarget !== null}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete this post?</AlertDialogTitle>
						<AlertDialogDescription>
							This permanently removes the post and its slug redirects. Public
							URLs will hard-404. This cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={() => {
								if (deleteTarget) void onDelete(deleteTarget.id);
							}}
						>
							Delete post
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
