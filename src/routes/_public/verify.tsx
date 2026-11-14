import {
	IconCircleCheck,
	IconCircleX,
	IconShieldCheck,
} from '@tabler/icons-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { type FormEvent, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';
import { pageSeo } from '@/lib/seo';
import { verifyCertificate } from '@/server/certificates';

const TITLE = 'Verify a Certificate | Unicorn Barber Training Academy';
const DESCRIPTION =
	'Check that a Unicorn Barber Training Academy certificate is genuine using the certificate number printed on it.';

export const Route = createFileRoute('/_public/verify')({
	validateSearch: (search: Record<string, unknown>): { no?: string } => ({
		no: typeof search.no === 'string' ? search.no : undefined,
	}),
	loaderDeps: ({ search }) => ({ no: search.no }),
	loader: async ({ deps }) => {
		if (!deps.no) {
			return null;
		}
		return verifyCertificate({ data: { certificateNo: deps.no } });
	},
	head: () => {
		const breadcrumb = breadcrumbSchema([
			{ name: 'Home', path: '/' },
			{ name: 'Verify a certificate', path: '/verify' },
		]);

		return pageSeo({
			title: TITLE,
			description: DESCRIPTION,
			path: '/verify',
			keywords: [
				'verify certificate',
				'Unicorn Barber Training Academy certificate',
				'NTVQF certificate check',
			],
			jsonLd: [
				webPageSchema({
					name: TITLE,
					description: DESCRIPTION,
					path: '/verify',
					breadcrumb,
				}),
			],
		});
	},
	component: RouteComponent,
});

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString('en-US', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
}

function RouteComponent() {
	const navigate = useNavigate();
	const result = Route.useLoaderData();
	const { no } = Route.useSearch();
	const [value, setValue] = useState(no ?? '');

	function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const next = value.trim().toUpperCase();
		if (!next) {
			return;
		}
		void navigate({ to: '/verify', search: { no: next } });
	}

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-16">
			<div className="flex flex-col items-center gap-3 text-center">
				<span className="flex size-12 items-center justify-center rounded-full border border-primary/25 bg-primary/[0.06] text-primary">
					<IconShieldCheck className="size-6" stroke={1.6} aria-hidden="true" />
				</span>
				<h1 className="font-semibold text-3xl tracking-tight">
					Verify a certificate
				</h1>
				<p className="max-w-md text-muted-foreground text-sm">
					Enter the certificate number printed on the certificate to confirm it
					was issued by Unicorn Barber Training Academy.
				</p>
			</div>

			<form onSubmit={onSubmit} className="flex flex-col gap-3">
				<Field>
					<FieldLabel htmlFor="certificateNo">Certificate number</FieldLabel>
					<Input
						id="certificateNo"
						name="no"
						value={value}
						onChange={(event) => setValue(event.target.value)}
						placeholder="UBTA-CERT-2026-0001"
						autoComplete="off"
						spellCheck={false}
						className="font-medium uppercase tabular-nums"
					/>
				</Field>
				<Button type="submit" className="self-start">
					Verify certificate
				</Button>
			</form>

			{result ? (
				<Card
					className={
						result.revoked
							? 'border border-destructive/30'
							: 'border border-primary/30'
					}
				>
					<CardHeader>
						<div className="flex items-center gap-2.5">
							{result.revoked ? (
								<IconCircleX
									className="size-5 text-destructive"
									stroke={1.75}
									aria-hidden="true"
								/>
							) : (
								<IconCircleCheck
									className="size-5 text-primary"
									stroke={1.75}
									aria-hidden="true"
								/>
							)}
							<CardTitle className="text-lg">
								{result.revoked
									? 'Certificate revoked'
									: 'Certificate verified'}
							</CardTitle>
						</div>
						<CardDescription>
							{result.revoked
								? 'This certificate was issued but has since been revoked and is no longer valid.'
								: 'This certificate is genuine and was issued by Unicorn Barber Training Academy.'}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<dl className="divide-y divide-border/60 text-sm">
							<div className="flex items-center justify-between gap-4 py-2.5">
								<dt className="text-muted-foreground">Certificate no.</dt>
								<dd className="font-medium tabular-nums">
									{result.certificateNo}
								</dd>
							</div>
							<div className="flex items-center justify-between gap-4 py-2.5">
								<dt className="text-muted-foreground">Holder</dt>
								<dd className="font-medium">{result.studentName}</dd>
							</div>
							<div className="flex items-center justify-between gap-4 py-2.5">
								<dt className="text-muted-foreground">Program</dt>
								<dd className="text-right font-medium">
									{result.programTitle}
								</dd>
							</div>
							<div className="flex items-center justify-between gap-4 py-2.5">
								<dt className="text-muted-foreground">Issued</dt>
								<dd className="font-medium">{formatDate(result.issuedAt)}</dd>
							</div>
							<div className="flex items-center justify-between gap-4 py-2.5">
								<dt className="text-muted-foreground">Status</dt>
								<dd>
									{result.revoked ? (
										<Badge
											variant="outline"
											className="border-destructive/40 text-destructive"
										>
											Revoked
										</Badge>
									) : (
										<Badge
											variant="outline"
											className="border-primary/30 text-primary"
										>
											Valid
										</Badge>
									)}
								</dd>
							</div>
						</dl>
					</CardContent>
				</Card>
			) : null}

			{no && !result ? (
				<Card className="border border-destructive/30">
					<CardHeader>
						<div className="flex items-center gap-2.5">
							<IconCircleX
								className="size-5 text-destructive"
								stroke={1.75}
								aria-hidden="true"
							/>
							<CardTitle className="text-lg">Not found</CardTitle>
						</div>
						<CardDescription>
							No certificate matches <span className="font-medium">{no}</span>.
							Check the number and try again.
						</CardDescription>
					</CardHeader>
				</Card>
			) : null}
		</div>
	);
}
