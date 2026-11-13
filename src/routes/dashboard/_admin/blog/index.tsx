import { IconPlus } from '@tabler/icons-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { PostsTable } from '@/components/pages/dashboard/blog/posts-table';
import { Button } from '@/components/ui/button';
import { getAdminPosts } from '@/server/admin/posts';

export const Route = createFileRoute('/dashboard/_admin/blog/')({
	loader: () => getAdminPosts(),
	head: () => ({
		meta: [
			{ title: 'Blog | Unicorn Barber Training Academy' },
			{ name: 'robots', content: 'noindex' },
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const posts = Route.useLoaderData();

	return (
		<div className=" mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 rounded-2xl border border-border/60 bg-background p-4 sm:p-6">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="font-semibold text-2xl tracking-tight">Blog</h1>
					<p className="text-muted-foreground text-sm">
						Write, publish and feature articles on the public blog.
					</p>
				</div>

				<Button render={<Link to="/dashboard/blog/new" />}>
					<IconPlus stroke={1.75} />
					New post
				</Button>
			</div>

			<PostsTable posts={posts} />
		</div>
	);
}
