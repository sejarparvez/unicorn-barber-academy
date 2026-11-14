import { IconArrowLeft, IconPencil } from '@tabler/icons-react';
import { createFileRoute, Link, useRouteContext } from '@tanstack/react-router';
import {
	createEmptyPost,
	PostForm,
} from '@/components/pages/dashboard/blog/post-form';
import { Button } from '@/components/ui/button';

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
		<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
			<header className="flex flex-col gap-5 border-border/60 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
				<div className="flex items-start gap-4">
					<span className="hidden size-11 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary sm:grid">
						<IconPencil className="size-5" stroke={1.75} aria-hidden />
					</span>
					<div>
						<p className="font-semibold text-[11px] text-primary uppercase tracking-[0.24em]">
							Blog studio
						</p>
						<h1 className="mt-2 font-semibold text-3xl tracking-tight">
							New post
						</h1>
						<p className="mt-2 max-w-xl text-pretty text-muted-foreground text-sm">
							Write an article and add a cover image. It stays a draft until you
							publish it.
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

			<PostForm mode="create" defaultValues={createEmptyPost(authorName)} />
		</div>
	);
}
