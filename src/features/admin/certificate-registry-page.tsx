// src/features/admin/certificate-registry-page.tsx
// Admin certificate registry: every issued credential, searchable by code,
// holder, email or application reference. Revocation is soft (the record and
// its audit trail stay); /verify/<code> then reports the credential revoked.
import {
	IconCertificate,
	IconExternalLink,
	IconSearch,
} from "@tabler/icons-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ListPagination } from "@/components/list-pagination";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
	AdminCertificateListItem,
	CertificateListStatus,
} from "@/lib/certificates";
import { formatLongDate } from "@/lib/date";
import { COHORT_LABELS } from "@/lib/enrollment";
import { APP_ORIGIN } from "@/lib/env";
import { cn } from "@/lib/utils";
import {
	useAdminCertificates,
	useSetCertificateRevocation,
} from "@/service/certificate";

const TABS: Array<{ label: string; status: CertificateListStatus }> = [
	{ label: "All", status: "all" },
	{ label: "Active", status: "active" },
	{ label: "Revoked", status: "revoked" },
];

export function CertificateRegistryPage({
	search,
	status,
	page,
}: {
	search?: string;
	status: CertificateListStatus;
	page: number;
}) {
	const navigate = useNavigate();
	const [searchInput, setSearchInput] = useState(search ?? "");
	const [confirmId, setConfirmId] = useState<number | null>(null);
	const { data, isPending } = useAdminCertificates({ search, status, page });
	const revoke = useSetCertificateRevocation();

	function navigateWith(next: {
		search?: string;
		status?: CertificateListStatus;
		page?: number;
	}) {
		void navigate({
			to: "/dashboard/certificates/admin",
			search: {
				...(next.search ? { search: next.search } : {}),
				...(next.status && next.status !== "all"
					? { status: next.status }
					: {}),
				...(next.page && next.page > 1 ? { page: next.page } : {}),
			},
		});
	}

	async function toggleRevocation(item: AdminCertificateListItem) {
		const next = !item.revokedAt;
		// Revocation breaks QR links employers may already hold — require a
		// second click. Restoring stays one click.
		if (next && confirmId !== item.id) {
			setConfirmId(item.id);
			return;
		}
		setConfirmId(null);
		try {
			await revoke.mutateAsync({
				id: item.id,
				revoked: next,
				reason: next ? "Revoked from certificate registry" : null,
			});
			toast.success(next ? "Certificate revoked" : "Certificate restored");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Could not update certificate",
			);
		}
	}

	const totalPages = data
		? Math.max(1, Math.ceil(data.total / data.pageSize))
		: 1;
	const items = data?.items ?? [];

	return (
		<div className="space-y-6">
			<header className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
						Administration
					</p>
					<h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
						Certificate registry
					</h1>
					<p className="mt-2 max-w-2xl text-sm text-muted-foreground">
						Every credential the academy has issued. Certificates are minted
						from completed, fully-paid applications — revoke here to invalidate
						a live verification link.
					</p>
				</div>
				<Link
					to="/dashboard/enrollments"
					className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
				>
					Applications
				</Link>
			</header>

			<div className="flex flex-wrap items-center gap-2">
				<Tabs
					value={status}
					onValueChange={(value) =>
						navigateWith({
							search,
							status: (value as CertificateListStatus | null) ?? "all",
						})
					}
				>
					<TabsList>
						{TABS.map((tab) => (
							<TabsTrigger key={tab.status} value={tab.status}>
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>
				</Tabs>
				<span className="flex-1" />
				<form
					onSubmit={(event) => {
						event.preventDefault();
						navigateWith({
							search: searchInput.trim() || undefined,
							status,
						});
					}}
					className="flex gap-2"
				>
					<Input
						value={searchInput}
						onChange={(event) => setSearchInput(event.target.value)}
						placeholder="Code, holder, email, reference…"
						aria-label="Search certificates"
						className="h-8 w-64 text-xs"
					/>
					<Button type="submit" size="sm" variant="outline" className="gap-1.5">
						<IconSearch className="h-3.5 w-3.5" stroke={1.75} />
						Search
					</Button>
				</form>
			</div>

			<div className="overflow-x-auto rounded-xl border border-border bg-card">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Code</TableHead>
							<TableHead>Holder</TableHead>
							<TableHead>Program</TableHead>
							<TableHead>Cohort</TableHead>
							<TableHead>Issued</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isPending ? (
							[0, 1, 2, 3, 4].map((row) => (
								<TableRow key={row}>
									<TableCell colSpan={7}>
										<Skeleton className="h-4 w-full" />
									</TableCell>
								</TableRow>
							))
						) : items.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} className="p-10 text-center">
									<IconCertificate
										className="mx-auto h-6 w-6 text-muted-foreground"
										stroke={1.5}
									/>
									<p className="mt-2 text-sm font-medium">
										No certificates match this view
									</p>
									<p className="mt-1 text-xs text-muted-foreground">
										{search
											? "Try a different search term or status filter."
											: "Issue a certificate from a completed application."}
									</p>
								</TableCell>
							</TableRow>
						) : (
							items.map((item) => {
								const revoked = Boolean(item.revokedAt);
								return (
									<TableRow key={item.id}>
										<TableCell>
											<p className="font-mono text-xs font-semibold tracking-wide">
												{item.code}
											</p>
											{item.applicationReference ? (
												<p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
													{item.applicationReference}
												</p>
											) : null}
										</TableCell>
										<TableCell>
											<p className="max-w-48 truncate font-medium">
												{item.holderName}
											</p>
											<p className="max-w-48 truncate text-xs text-muted-foreground">
												{item.holderEmail}
											</p>
										</TableCell>
										<TableCell className="max-w-48 truncate">
											{item.programTitle ?? item.programSlug}
										</TableCell>
										<TableCell className="text-muted-foreground">
											{COHORT_LABELS[item.cohort]}
										</TableCell>
										<TableCell className="whitespace-nowrap text-muted-foreground">
											{formatLongDate(item.issuedOn)}
										</TableCell>
										<TableCell>
											<Badge
												variant={revoked ? "destructive" : "default"}
												className="h-5 px-1.5 text-[10px]"
												title={
													revoked && item.revokedReason
														? item.revokedReason
														: undefined
												}
											>
												{revoked ? "Revoked" : "Active"}
											</Badge>
										</TableCell>
										<TableCell>
											<div className="flex items-center justify-end gap-1">
												{item.applicationId ? (
													<Link
														to="/dashboard/enrollments/$id"
														params={{ id: String(item.applicationId) }}
														aria-label={`Open application ${item.applicationReference ?? item.applicationId}`}
														className={cn(
															buttonVariants({
																variant: "ghost",
																size: "icon-sm",
															}),
															"text-muted-foreground",
														)}
													>
														<IconExternalLink
															className="h-4 w-4"
															stroke={1.75}
														/>
													</Link>
												) : null}
												<a
													href={`${APP_ORIGIN}/verify/${item.code}`}
													target="_blank"
													rel="noreferrer"
													aria-label={`Verify ${item.code}`}
													className={cn(
														buttonVariants({
															variant: "ghost",
															size: "icon-sm",
														}),
														"text-muted-foreground",
													)}
												>
													<IconCertificate className="h-4 w-4" stroke={1.75} />
												</a>
												<Button
													variant="outline"
													size="xs"
													className={cn(
														confirmId === item.id &&
															"border-destructive/40 text-destructive",
													)}
													disabled={revoke.isPending}
													onClick={() => void toggleRevocation(item)}
												>
													{revoked
														? "Restore"
														: confirmId === item.id
															? "Confirm"
															: "Revoke"}
												</Button>
											</div>
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>

			<ListPagination
				page={page}
				totalPages={totalPages}
				total={data?.total ?? 0}
				itemNoun="certificates"
				onPage={(nextPage) => navigateWith({ search, status, page: nextPage })}
			/>
		</div>
	);
}
