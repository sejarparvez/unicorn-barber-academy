import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { ApplicationForm } from '@/components/pages/enroll/application-form';
import { BatchPicker } from '@/components/pages/enroll/batch-picker';
import { Button } from '@/components/ui/button';
import { getEnrollmentOptions, getEnrollmentTarget } from '@/server/batches';

type EnrollSearch = { batch?: string };

export const Route = createFileRoute('/_public/enroll/')({
	validateSearch: (search: Record<string, unknown>): EnrollSearch => ({
		batch:
			typeof search.batch === 'string' && search.batch.length > 0
				? search.batch
				: undefined,
	}),
	beforeLoad: ({ context, location }) => {
		if (!context.session) {
			throw redirect({
				to: '/auth/signin',
				search: { redirect: location.href },
			});
		}
	},
	loaderDeps: ({ search }) => ({ batch: search.batch }),
	loader: async ({ deps }) => {
		if (deps.batch) {
			const target = await getEnrollmentTarget({
				data: { batchId: deps.batch },
			});

			if (target) {
				return { mode: 'apply' as const, target };
			}

			return { mode: 'missing' as const };
		}

		const options = await getEnrollmentOptions();
		return { mode: 'pick' as const, options };
	},
	head: () => ({
		meta: [
			{ title: 'Enroll | Unicorn Barber Training Academy' },
			{ name: 'robots', content: 'noindex' },
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const data = Route.useLoaderData();

	return (
		<main className="relative overflow-hidden bg-background px-4 py-16 sm:px-6 lg:px-10">
			<div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
				<header className="flex flex-col gap-2">
					<p className="font-semibold text-[11px] text-primary uppercase tracking-[0.22em]">
						Admissions
					</p>
					<h1 className="font-semibold text-3xl tracking-tight sm:text-4xl">
						{data.mode === 'apply' ? 'Apply to this batch' : 'Choose a batch'}
					</h1>
					<p className="text-muted-foreground">
						{data.mode === 'apply'
							? 'Review the batch details and tell us a little about yourself. No payment is taken now.'
							: 'Pick a program and a batch to apply to. Morning and evening cohorts are available.'}
					</p>
				</header>

				{data.mode === 'apply' ? (
					<ApplicationForm target={data.target} />
				) : null}

				{data.mode === 'pick' ? <BatchPicker options={data.options} /> : null}

				{data.mode === 'missing' ? (
					<div className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
						<p className="font-medium text-foreground">
							This batch is not available.
						</p>
						<p className="mt-1 text-muted-foreground text-sm">
							It may be full, hidden or no longer accepting applications.
						</p>
						<Button
							nativeButton={false}
							variant="outline"
							className="mt-5 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
							render={<Link to="/enroll" search={{ batch: undefined }} />}
						>
							Browse open batches
						</Button>
					</div>
				) : null}
			</div>
		</main>
	);
}
