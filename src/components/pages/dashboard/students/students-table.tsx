import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/lib/utils';
import type { AdminStudent } from '@/server/admin/enrollments';

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString('en-US', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});
}

export function StudentsTable({ students }: { students: AdminStudent[] }) {
	if (students.length === 0) {
		return (
			<div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-6 py-16 text-center">
				<p className="font-medium text-sm">No students yet.</p>
				<p className="mt-1 text-muted-foreground text-sm">
					Students appear here once they create an account.
				</p>
			</div>
		);
	}

	return (
		<div className="overflow-x-auto rounded-xl border border-border/70">
			<table className="w-full min-w-[720px] text-left text-sm">
				<thead className="border-border/60 border-b bg-muted/40 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.14em]">
					<tr>
						<th className="px-4 py-3">Student</th>
						<th className="px-4 py-3">Active programs</th>
						<th className="px-4 py-3">Applications</th>
						<th className="px-4 py-3">Joined</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-border/60">
					{students.map((student) => (
						<tr
							key={student.id}
							className="transition-colors hover:bg-muted/30"
						>
							<td className="px-4 py-4">
								<div className="flex items-center gap-3">
									<Avatar className="size-9">
										{student.image ? (
											<AvatarImage src={student.image} alt="" />
										) : null}
										<AvatarFallback className="text-xs">
											{getInitials(student.name)}
										</AvatarFallback>
									</Avatar>
									<div className="flex flex-col gap-0.5">
										<span className="font-medium text-foreground">
											{student.name}
										</span>
										<span className="text-muted-foreground text-xs">
											{student.email}
										</span>
									</div>
								</div>
							</td>
							<td className="px-4 py-4">
								{student.activePrograms.length === 0 ? (
									<span className="text-muted-foreground/60 text-xs">—</span>
								) : (
									<div className="flex flex-wrap gap-1.5">
										{student.activePrograms.map((program) => (
											<Badge
												key={program}
												variant="outline"
												className="border-primary/30 text-primary"
											>
												{program}
											</Badge>
										))}
									</div>
								)}
							</td>
							<td className="px-4 py-4 tabular-nums">
								{student.enrollmentCount}
							</td>
							<td className="px-4 py-4 text-muted-foreground text-xs">
								{formatDate(student.createdAt)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
