import { createFileRoute } from '@tanstack/react-router';
import { MyCertificatesList } from '@/components/pages/dashboard/my-certificates/my-certificates-list';
import { getMyCertificates } from '@/server/certificates';

export const Route = createFileRoute('/dashboard/my-certificates')({
	loader: () => getMyCertificates(),
	head: () => ({
		meta: [
			{ title: 'My certificates | Unicorn Barber Training Academy' },
			{ name: 'robots', content: 'noindex' },
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const certificates = Route.useLoaderData();

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 pt-0">
			<div>
				<h1 className="font-semibold text-2xl tracking-tight">
					My certificates
				</h1>
				<p className="text-muted-foreground text-sm">
					Certificates issued to you after completing a program. Open one to
					view or print it.
				</p>
			</div>

			<MyCertificatesList certificates={certificates} />
		</div>
	);
}
