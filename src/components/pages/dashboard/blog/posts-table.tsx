import {
	IconEye,
	IconEyeOff,
	IconPencil,
	IconStar,
	IconStarFilled,
	IconTrash,
} from '@tabler/icons-react';
import { Link, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import {
	formatPostDate,
	POST_CATEGORY_LABELS,
	POST_STATUS_LABELS,
} from '@/components/pages/blog/types';
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
	type AdminPostSummary,
	deletePost,
	setPostFeatured,
	setPostStatus,
} from '@/server/admin/posts';

export function PostsTable({ posts }: { posts: AdminPostSummary[] }) {
	if (posts.length === 0) {
		return (
			<div className="rounded-xl border border-border/70 border-dashed bg-muted/20 px-6 py-16 text-center">
				<p className="font-medium text-sm">No posts yet.</p>
				<p className="mt-1 text-muted-foreground text-sm">
					Write your first article to get started.
				</p>
			</div>
		);
	}

	return (
		<div className="overflow-x-auto rounded-xl border border-border/70">
			<table className="w-full min-w-[860px] text-left text-sm">
				<thead className="border-border/60 border-b bg-muted/40 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.14em]">
					<tr>
						<th className="px-4 py-3">Post</th>
						<th className="px-4 py-3">Category</th>
						<th className="px-4 py-3">Status</th>
						<th className="px-4 py-3">Updated</th>
						<th className="px-4 py-3 text-right">Actions</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-border/60">
					{posts.map((post) => (
						<PostRow key={post.id} post={post} />
					))}
				</tbody>
			</table>
		</div>
	);
}

function PostRow({ post }: { post: AdminPostSummary }) {
	const router = useRouter();
	const [isPending, setIsPending] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);

	async function run(
		action: () => Promise<unknown>,
		success: string,
		failure: string,
	) {
		setIsPending(true);
		try {
			await action();
			await router.invalidate();
			toast.success(success);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : failure);
		} finally {
			setIsPending(false);
		}
	}

	const isPublished = post.status === 'published';

	return (
		<tr className="transition-colors hover:bg-muted/30">
			<td className="px-4 py-4">
				<div className="flex flex-col gap-0.5">
					<span className="font-medium text-foreground">{post.title}</span>
					<span className="text-muted-foreground text-xs">
						/blog/{post.slug}
					</span>
				</div>
			</td>
			<td className="px-4 py-4 text-muted-foreground">
				{POST_CATEGORY_LABELS[post.category]}
			</td>
			<td className="px-4 py-4">
				<div className="flex flex-wrap gap-1.5">
					<Badge
						variant="outline"
						className={
							isPublished
								? 'border-primary/30 text-primary'
								: 'text-muted-foreground'
						}
					>
						{POST_STATUS_LABELS[post.status]}
					</Badge>
					{post.featured ? (
						<Badge variant="outline" className="text-muted-foreground">
							Featured
						</Badge>
					) : null}
				</div>
			</td>
			<td className="px-4 py-4 text-muted-foreground text-xs tabular-nums">
				{formatPostDate(post.updatedAt)}
			</td>
			<td className="px-4 py-4">
				<div className="flex items-center justify-end gap-1">
					<Button
						variant="outline"
						size="sm"
						render={
							<Link
								to="/dashboard/blog/$postId/edit"
								params={{ postId: post.id }}
							/>
						}
					>
						<IconPencil stroke={1.75} />
						Edit
					</Button>

					<Button
						variant="ghost"
						size="icon-sm"
						disabled={isPending}
						onClick={() =>
							run(
								() =>
									setPostStatus({
										data: {
											id: post.id,
											status: isPublished ? 'draft' : 'published',
										},
									}),
								isPublished ? 'Post unpublished.' : 'Post published.',
								'Could not update the post.',
							)
						}
						aria-label={isPublished ? 'Unpublish post' : 'Publish post'}
						title={isPublished ? 'Unpublish post' : 'Publish post'}
					>
						{isPublished ? (
							<IconEyeOff stroke={1.75} />
						) : (
							<IconEye stroke={1.75} />
						)}
					</Button>

					<Button
						variant="ghost"
						size="icon-sm"
						disabled={isPending}
						onClick={() =>
							run(
								() =>
									setPostFeatured({
										data: { id: post.id, featured: !post.featured },
									}),
								post.featured ? 'Removed from featured.' : 'Marked featured.',
								'Could not update the post.',
							)
						}
						aria-label={post.featured ? 'Unfeature post' : 'Feature post'}
						title={post.featured ? 'Unfeature post' : 'Feature post'}
					>
						{post.featured ? (
							<IconStarFilled className="text-primary" stroke={1.75} />
						) : (
							<IconStar stroke={1.75} />
						)}
					</Button>

					<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
						<Button
							variant="ghost"
							size="icon-sm"
							className="text-destructive hover:bg-destructive/10 hover:text-destructive"
							onClick={() => setConfirmOpen(true)}
							aria-label="Delete post"
							title="Delete post"
						>
							<IconTrash stroke={1.75} />
						</Button>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Delete “{post.title}”?</AlertDialogTitle>
								<AlertDialogDescription>
									This permanently removes the post. This action cannot be
									undone.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel disabled={isPending}>
									Cancel
								</AlertDialogCancel>
								<AlertDialogAction
									onClick={(event) => {
										event.preventDefault();
										void run(
											() => deletePost({ data: { id: post.id } }),
											'Post deleted.',
											'Could not delete the post.',
										).then(() => setConfirmOpen(false));
									}}
									disabled={isPending}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
								>
									{isPending ? 'Deleting…' : 'Delete post'}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</td>
		</tr>
	);
}
