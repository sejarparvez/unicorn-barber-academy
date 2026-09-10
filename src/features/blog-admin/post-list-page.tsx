// src/features/blog-admin/post-list-page.tsx
// Admin listing of every post with status filter tabs and quick actions
// (publish / unpublish / archive / delete). Reads + mutations flow through
// the service layer (src/service/blog.ts).
import {
	IconDots,
	IconEye,
	IconPencil,
	IconPlus,
	IconSearch,
	IconTrash,
} from "@tabler/icons-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ListPagination } from "@/components/list-pagination";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
	sortByViews = false,
}: {
	statusFilter?: BlogStatus;
	search?: string;
	categoryFilter?: number;
	page?: number;
	sortByViews?: boolean;
}) {
	const navigate = useNavigate();
	const { data, isPending } = useAdminPosts({
		status: statusFilter,
		search,
		category: categoryFilter,
		page,
		sortByViews,
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
		sort?: "views";
	}) {
		void navigate({
			to: "/dashboard/blog",
			search: {
				...(next.status ? { status: next.status } : {}),
				...(next.search ? { search: next.search } : {}),
				...(next.category ? { category: next.category } : {}),
				...(next.page && next.page > 1 ? { page: next.page } : {}),
				...(next.sort ? { sort: next.sort } : {}),
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
						sort: sortByViews ? "views" : undefined,
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
								sort: sortByViews ? "views" : undefined,
							});
						}}
					>
						Clear
					</Button>
				) : null}
			</form>

			<div className="flex flex-wrap items-center gap-3">
				<Tabs
					value={statusFilter ?? "all"}
					onValueChange={(v) =>
						navigateWith({
							status: TABS.find((t) => (t.status ?? "all") === v)?.status,
							search,
							category: categoryFilter,
							page: undefined,
							sort: sortByViews ? "views" : undefined,
						})
					}
				>
					<TabsList>
						{TABS.map((tab) => (
							<TabsTrigger key={tab.label} value={tab.status ?? "all"}>
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>
				</Tabs>

				{categories && categories.length > 0 ? (
					<Select
						value={categoryFilter ? String(categoryFilter) : "all"}
						onValueChange={(v) => {
							const val = Number.parseInt(v ?? "all", 10);
							navigateWith({
								status: statusFilter,
								search,
								category: Number.isInteger(val) && val > 0 ? val : undefined,
								page: undefined,
								sort: sortByViews ? "views" : undefined,
							});
						}}
					>
						<SelectTrigger
							className="h-9 w-44 text-sm"
							aria-label="Filter by category"
						>
							<SelectValue placeholder="All categories" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All categories</SelectItem>
							{categories.map((cat) => (
								<SelectItem key={cat.id} value={String(cat.id)}>
									{cat.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				) : null}

				<span className="flex-1" />
				<Button
					type="button"
					variant={sortByViews ? "default" : "outline"}
					size="sm"
					onClick={() =>
						navigateWith({
							status: statusFilter,
							search,
							category: categoryFilter,
							page: undefined,
							sort: sortByViews ? undefined : "views",
						})
					}
					aria-pressed={sortByViews}
				>
					Top viewed
				</Button>
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
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<IconPlus />
						</EmptyMedia>
						<EmptyTitle>No posts here yet</EmptyTitle>
						<EmptyDescription>
							Write your first article — it becomes a crawlable page with
							structured data the moment you publish.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Link
							to="/dashboard/blog/new"
							className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}
						>
							<IconPlus className="h-4 w-4" /> Write a post
						</Link>
					</EmptyContent>
				</Empty>
			) : (
				<>
					{allIds.length > 0 ? (
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<Checkbox
								checked={allSelected}
								indeterminate={!allSelected && selectedIds.size > 0}
								onCheckedChange={() => toggleSelectAll()}
								aria-label="Select all posts"
							/>
							Select all ({allIds.length})
						</div>
					) : null}
					<ul className="divide-y divide-border rounded-xl border border-border bg-card">
						{(data?.items ?? []).map((post) => (
							<li
								key={post.id}
								className="flex flex-wrap items-center gap-3 p-4 sm:flex-nowrap"
							>
								<Checkbox
									checked={selectedIds.has(post.id)}
									onCheckedChange={() => toggleSelect(post.id)}
									aria-label={`Select ${post.title}`}
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
										{post.status === "published"
											? ` · ${post.viewCount.toLocaleString("en-US")} views`
											: ""}
									</p>
								</div>

								<DropdownMenu>
									<DropdownMenuTrigger
										render={
											<Button
												variant="ghost"
												size="icon"
												aria-label={`Actions for ${post.title}`}
												className="text-muted-foreground"
											/>
										}
									>
										<IconDots className="h-4 w-4" />
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											onClick={() =>
												navigate({
													to: "/dashboard/blog/$id/edit",
													params: { id: String(post.id) },
												})
											}
										>
											<IconPencil className="h-4 w-4" />
											Edit
										</DropdownMenuItem>
										{post.status === "published" ? (
											<DropdownMenuItem
												onClick={() =>
													window.open(`/blog/${post.slug}`, "_blank")
												}
											>
												<IconEye className="h-4 w-4" />
												View live
											</DropdownMenuItem>
										) : null}
										<DropdownMenuSeparator />
										<DropdownMenuItem
											disabled={mutatingId === post.id || !post.slug}
											onClick={() =>
												setStatus(
													post,
													post.status === "published" ? "draft" : "published",
												)
											}
										>
											{post.status === "published" ? "Unpublish" : "Publish"}
										</DropdownMenuItem>
										<DropdownMenuItem
											variant="destructive"
											disabled={mutatingId === post.id}
											onClick={() => setDeleteTarget(post)}
										>
											<IconTrash className="h-4 w-4" />
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</li>
						))}
					</ul>
				</>
			)}

			<ListPagination
				page={page}
				totalPages={totalPages}
				total={data?.total ?? 0}
				itemNoun="posts"
				onPage={(nextPage) =>
					navigateWith({
						status: statusFilter,
						search,
						category: categoryFilter,
						page: nextPage,
						sort: sortByViews ? "views" : undefined,
					})
				}
			/>

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
