import { createFileRoute } from '@tanstack/react-router';
import { CertificateCandidates } from '@/components/pages/dashboard/certificates/candidates-list';
import { CertificatesTable } from '@/components/pages/dashboard/certificates/certificates-table';
import {
	getAdminCertificates,
	getCertificateCandidates,
} from '@/server/admin/certificates';

export const Route = createFileRoute('/dashboard/_admin/certificates/')({
	loader: async () => {
		const [certificates, candidates] = await Promise.all([
			getAdminCertificates(),
			getCertificateCandidates(),
		]);

		return { certificates, candidates };
	},
	head: () => ({
		meta: [
			{ title: 'Certificates | Unicorn Barber Training Academy' },
			{ name: 'robots', content: 'noindex' },
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const { certificates, candidates } = Route.useLoaderData();

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 p-4 pt-0">
			<div>
				<h1 className="font-semibold text-2xl tracking-tight">Certificates</h1>
				<p className="text-muted-foreground text-sm">
					Issue completion certificates and manage the numbers students can
					verify.
				</p>
			</div>

			<section className="flex flex-col gap-4">
				<div className="flex flex-wrap items-baseline justify-between gap-2">
					<h2 className="font-semibold text-lg tracking-tight">
						Ready to issue
					</h2>
					<span className="text-muted-foreground text-sm">
						{candidates.length} student{candidates.length === 1 ? '' : 's'}
					</span>
				</div>
				<CertificateCandidates candidates={candidates} />
			</section>

			<section className="flex flex-col gap-4">
				<div className="flex flex-wrap items-baseline justify-between gap-2">
					<h2 className="font-semibold text-lg tracking-tight">
						Issued certificates
					</h2>
					<span className="text-muted-foreground text-sm">
						{certificates.length} total
					</span>
				</div>
				<CertificatesTable certificates={certificates} />
			</section>
		</div>
	);
}
