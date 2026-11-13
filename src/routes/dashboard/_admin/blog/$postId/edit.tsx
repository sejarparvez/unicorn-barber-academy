import { createFileRoute, notFound } from '@tanstack/react-router';
import { PostForm } from '@/components/pages/dashboard/blog/post-form';
import { getAdminPost } from '@/server/admin/posts';

export const Route = createFileRoute('/dashboard/_admin/blog/$postId/edit')({
	loader: async ({ params }) => {
		const post = await getAdminPost({ data: { id: params.postId } });

		if (!post) {
			throw notFound();
		}

		return post;
	},
	head: () => ({
		meta: [
			{ title: 'Edit post | Unicorn Barber Training Academy' },
			{ name: 'robots', content: 'noindex' },
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const post = Route.useLoaderData();

	return (
		<div className="section-light mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 rounded-2xl border border-border/60 bg-background p-4 sm:p-6">
			<div>
				<h1 className="font-semibold text-2xl tracking-tight">
					Edit {post.title}
				</h1>
				<p className="text-muted-foreground text-sm">
					Update the article, its cover image and publishing status.
				</p>
			</div>

			<PostForm mode="edit" postId={post.id} defaultValues={post} />
		</div>
	);
}
