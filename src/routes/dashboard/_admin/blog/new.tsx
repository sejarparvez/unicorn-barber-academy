import { createFileRoute, useRouteContext } from '@tanstack/react-router';
import {
	createEmptyPost,
	PostForm,
} from '@/components/pages/dashboard/blog/post-form';

export const Route = createFileRoute('/dashboard/_admin/blog/new')({
	head: () => ({
		meta: [
			{ title: 'New post | Unicorn Barber Training Academy' },
			{ name: 'robots', content: 'noindex' },
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const { session } = useRouteContext({ from: '__root__' });
	const authorName = session?.user?.name?.trim() || 'Unicorn Academy';

	return (
		<div className="section-light mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 rounded-2xl border border-border/60 bg-background p-4 sm:p-6">
			<div>
				<h1 className="font-semibold text-2xl tracking-tight">New post</h1>
				<p className="text-muted-foreground text-sm">
					Write an article. It stays a draft until you publish it.
				</p>
			</div>

			<PostForm mode="create" defaultValues={createEmptyPost(authorName)} />
		</div>
	);
}
