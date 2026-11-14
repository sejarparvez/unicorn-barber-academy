import { IconArrowLeft, IconPencil } from '@tabler/icons-react';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { PostForm } from '@/components/pages/dashboard/blog/post-form';
import { Button } from '@/components/ui/button';
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
		<div className="section-light mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
			<header className="flex flex-col gap-5 border-border/60 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
				<div className="flex min-w-0 items-start gap-4">
					<span className="hidden size-11 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary sm:grid">
						<IconPencil className="size-5" stroke={1.75} aria-hidden />
					</span>
					<div className="min-w-0">
						<p className="font-semibold text-[11px] text-primary uppercase tracking-[0.24em]">
							Blog studio
						</p>
						<h1 className="mt-2 truncate font-semibold text-3xl tracking-tight">
							Edit post
						</h1>
						<p className="mt-2 max-w-xl truncate text-pretty text-muted-foreground text-sm">
							{post.title}
						</p>
					</div>
				</div>

				<Button
					type="button"
					variant="outline"
					render={<Link to="/dashboard/blog" />}
				>
					<IconArrowLeft stroke={1.75} />
					All posts
				</Button>
			</header>

			<PostForm mode="edit" postId={post.id} defaultValues={post} />
		</div>
	);
}
