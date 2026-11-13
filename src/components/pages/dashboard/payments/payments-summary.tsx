import {
	IconCash,
	IconClockExclamation,
	IconReceipt,
	IconUsers,
} from '@tabler/icons-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatTaka } from '@/lib/utils';
import type { AdminPaymentStats } from '@/server/admin/payments';

function Stat({
	icon: Icon,
	label,
	value,
	hint,
}: {
	icon: typeof IconCash;
	label: string;
	value: string;
	hint?: string;
}) {
	return (
		<Card>
			<CardContent className="flex items-start gap-3">
				<span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/[0.06] text-primary">
					<Icon className="size-4.5" stroke={1.6} aria-hidden="true" />
				</span>
				<div className="flex flex-col gap-0.5">
					<span className="font-medium text-[11px] text-muted-foreground uppercase tracking-[0.14em]">
						{label}
					</span>
					<span className="font-semibold text-xl tabular-nums tracking-tight">
						{value}
					</span>
					{hint ? (
						<span className="text-muted-foreground text-xs">{hint}</span>
					) : null}
				</div>
			</CardContent>
		</Card>
	);
}

export function PaymentsSummary({ stats }: { stats: AdminPaymentStats }) {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<Stat
				icon={IconCash}
				label="Collected"
				value={formatTaka(stats.collected)}
				hint="Total payments received"
			/>
			<Stat
				icon={IconClockExclamation}
				label="Outstanding"
				value={formatTaka(stats.outstanding)}
				hint="Balance on active students"
			/>
			<Stat
				icon={IconReceipt}
				label="Payments"
				value={String(stats.paymentCount)}
				hint="Recorded entries"
			/>
			<Stat
				icon={IconUsers}
				label="Active students"
				value={String(stats.enrolledStudents)}
				hint="Currently enrolled"
			/>
		</div>
	);
}
