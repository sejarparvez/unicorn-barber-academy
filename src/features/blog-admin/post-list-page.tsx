// src/features/blog-admin/post-list-page.tsx
// Admin listing of every post with status filter tabs and quick actions
// (publish / unpublish / archive / delete). Reads + mutations flow through
// the service layer (src/service/blog.ts).
import { IconEye, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatPostDate } from "@/lib/api/blog-admin";
import {
	BLOG_STATUS_LABELS,
	type BlogPostSummary,
	type BlogStatus,
} from "@/lib/blog";
import { cn } from "@/lib/utils";
import { useAdminPosts, useDeletePost, useSetPostStatus } from "@/service/blog";

const TABS: Array<{ label: string; status?: BlogStatus }> = [
	{ label: "All", status: undefined },
	{ label: "Published", status: "published" },
	{ label: "Drafts", status: "draft" },
	{ label: "Archived", status: "archived" },
];

export function PostListPage({ statusFilter }: { statusFilter?: BlogStatus }) {
	const { data, isPending } = useAdminPosts({ status: statusFilter });
	const setStatusMutation = useSetPostStatus();
	const deleteMutation = useDeletePost();
	const mutatingId: number | undefined =
		(setStatusMutation.variables as { id?: number } | undefined)?.id ??
		(deleteMutation.variables as number | undefined);
	const [error, setError] = useState<string | null>(null);
	const [confirmId, setConfirmId] = useState<number | null>(null);

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
		if (confirmId !== id) {
			setConfirmId(id);
			return;
		}
		setError(null);
		try {
			await deleteMutation.mutateAsync(id);
			setConfirmId(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Delete failed");
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
						{data ? `${data.total} total` : "Loading…"}
					</p>
				</div>
				<Link
					to="/dashboard/blog/new"
					className={cn(buttonVariants(), "gap-1.5")}
				>
					<IconPlus className="h-4 w-4" /> New post
				</Link>
			</header>

			<nav className="flex flex-wrap gap-2">
				{TABS.map((tab) => (
					<Link
						key={tab.label}
						to="/dashboard/blog"
						search={tab.status ? { status: tab.status } : {}}
						className={cn(
							buttonVariants({ variant: "outline", size: "sm" }),
							statusFilter === tab.status && "border-primary text-primary",
						)}
					>
						{tab.label}
					</Link>
				))}
				<span className="flex-1" />
				<Link
					to="/dashboard/blog/categories"
					className={buttonVariants({ variant: "ghost", size: "sm" })}
				>
					Categories
				</Link>
			</nav>

			{error ? (
				<p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
					{error}
				</p>
			) : null}

			{isPending ? (
				<section className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center">
					<p className="text-sm text-muted-foreground">Loading posts…</p>
				</section>
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
				<ul className="divide-y divide-border rounded-xl border border-border bg-card">
					{(data?.items ?? []).map((post) => (
						<li
							key={post.id}
							className="flex flex-wrap items-center gap-3 p-4 sm:flex-nowrap"
						>
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
									aria-label={
										confirmId === post.id ? "Confirm delete" : "Delete"
									}
									className={cn(confirmId === post.id && "text-destructive")}
									disabled={mutatingId === post.id}
									onClick={() => onDelete(post.id)}
								>
									<IconTrash className="h-4 w-4" />
								</Button>
							</div>
						</li>
					))}
				</ul>
			)}

			{data && data.total > data.items.length ? (
				<p className="text-xs text-muted-foreground">
					Showing the {data.items.length} most recently updated of {data.total}{" "}
					posts.
				</p>
			) : null}
		</div>
	);
}
