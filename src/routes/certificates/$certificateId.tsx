import { IconArrowLeft, IconPrinter } from '@tabler/icons-react';
import {
	createFileRoute,
	Link,
	notFound,
	redirect,
} from '@tanstack/react-router';
import { CertificateSheet } from '@/components/pages/certificates/certificate-sheet';
import { Button } from '@/components/ui/button';
import { getMyCertificate } from '@/server/certificates';

export const Route = createFileRoute('/certificates/$certificateId')({
	beforeLoad: ({ context, location }) => {
		if (!context.session) {
			throw redirect({
				to: '/auth/signin',
				search: { redirect: location.href },
			});
		}
	},
	loader: async ({ params }) => {
		const certificate = await getMyCertificate({
			data: { id: params.certificateId },
		});

		if (!certificate) {
			throw notFound();
		}

		return certificate;
	},
	head: () => ({
		meta: [
			{ title: 'Certificate | Unicorn Barber Training Academy' },
			{ name: 'robots', content: 'noindex' },
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const certificate = Route.useLoaderData();

	return (
		<div className="flex min-h-svh flex-col bg-muted/30">
			<div className="flex items-center justify-between gap-3 border-border/60 border-b bg-background px-4 py-3 print:hidden">
				<Button
					variant="ghost"
					size="sm"
					className="text-muted-foreground"
					render={<Link to="/dashboard/my-certificates" />}
				>
					<IconArrowLeft stroke={1.75} />
					My certificates
				</Button>
				<Button size="sm" onClick={() => window.print()}>
					<IconPrinter stroke={1.75} />
					Print
				</Button>
			</div>

			<div className="flex flex-1 items-start justify-center p-4 sm:p-8 print:p-0">
				<CertificateSheet
					data={{
						certificateNo: certificate.certificateNo,
						studentName: certificate.studentName,
						programTitle: certificate.programTitle,
						batchName: certificate.batchName,
						issuedAt: certificate.issuedAt,
						revoked: certificate.revokedAt !== null,
					}}
				/>
			</div>
		</div>
	);
}
