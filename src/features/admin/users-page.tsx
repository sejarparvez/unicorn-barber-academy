// src/features/admin/users-page.tsx
// Admin user management: search/filter accounts, change academy roles,
// ban/unban with reasons. Protections (never touch your own row, never ban
// an admin, last-admin guard) are enforced server-side; the UI mirrors them
// so forbidden actions are unreachable, and destructive picks confirm via
// AlertDialog — never the native browser confirm.
import { getRouteApi } from "@tanstack/react-router";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { ROLE_LABELS, ROLES, type Role } from "@/lib/roles";
import type { AdminUserRow } from "@/lib/users";
import { useSetUserBan, useSetUserRole, useUsersList } from "@/service/users";

const routeApi = getRouteApi("/dashboard/users");

const ROLE_BADGE: Record<Role, "default" | "secondary" | "outline"> = {
	admin: "default",
	instructor: "secondary",
	student: "secondary",
	user: "outline",
};

export function UsersPage() {
	const { session } = routeApi.useRouteContext();
	const selfId = Number(session.user.id);
	const [search, setSearch] = useState("");
	const [role, setRole] = useState<Role | "">("");
	const [page, setPage] = useState(1);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [banTarget, setBanTarget] = useState<AdminUserRow | null>(null);
	const [banReason, setBanReason] = useState("");
	const [banDays, setBanDays] = useState("");
	const [roleConfirm, setRoleConfirm] = useState<{
		user: AdminUserRow;
		next: Role;
	} | null>(null);
	const [unbanTarget, setUnbanTarget] = useState<AdminUserRow | null>(null);

	const { data, isPending } = useUsersList({
		...(search.trim() ? { search: search.trim() } : {}),
		...(role ? { role } : {}),
		page,
	});
	const roleMutation = useSetUserRole();
	const banMutation = useSetUserBan();
	const busy = roleMutation.isPending || banMutation.isPending;

	const isSelf = (user: AdminUserRow) => user.id === selfId;
	const isProtected = (user: AdminUserRow) =>
		isSelf(user) || user.role === "admin";
	const roleLocked = (user: AdminUserRow) =>
		isSelf(user) || user.role === "admin";
	const roleLockReason = (user: AdminUserRow) =>
		isSelf(user)
			? "You cannot change your own role"
			: "Admins cannot be demoted";

	async function onRoleConfirm() {
		if (!roleConfirm) return;
		const { user, next } = roleConfirm;
		setRoleConfirm(null);
		setError(null);
		setNotice(null);
		try {
			await roleMutation.mutateAsync({ targetId: user.id, role: next });
			setNotice(`Updated ${user.email}.`);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Update failed");
		}
	}

	async function onBanConfirm() {
		if (!banTarget) return;
		if (!banReason.trim()) {
			setError("A ban reason is required");
			return;
		}
		setError(null);
		setNotice(null);
		try {
			await banMutation.mutateAsync({
				targetId: banTarget.id,
				banned: true,
				banReason: banReason.trim(),
				banExpiresDays: banDays.trim() ? Number.parseInt(banDays, 10) : null,
			});
			setNotice(`Banned ${banTarget.email}.`);
			setBanTarget(null);
			setBanReason("");
			setBanDays("");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Ban failed");
		}
	}

	async function onUnbanConfirm() {
		if (!unbanTarget) return;
		const user = unbanTarget;
		setUnbanTarget(null);
		setError(null);
		setNotice(null);
		try {
			await banMutation.mutateAsync({ targetId: user.id, banned: false });
			setNotice(`Unbanned ${user.email}.`);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unban failed");
		}
	}

	return (
		<div className="space-y-6">
			<header>
				<p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
					Administration
				</p>
				<h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
					Users
				</h1>
				<p className="text-sm text-muted-foreground">
					Accounts, academy roles, and bans. Role changes take effect on next
					sign-in.
				</p>
			</header>

			{error ? (
				<p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
					{error}
				</p>
			) : null}
			{notice ? (
				<p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
					{notice}
				</p>
			) : null}

			<div className="flex flex-wrap gap-3">
				<Input
					placeholder="Search name or email…"
					value={search}
					onChange={(e) => {
						setSearch(e.target.value);
						setPage(1);
					}}
					className="h-9 max-w-xs"
					aria-label="Search users"
				/>
				<select
					value={role}
					onChange={(e) => {
						setRole(e.target.value as Role | "");
						setPage(1);
					}}
					className="h-9 rounded-md border border-border bg-background px-3 text-sm"
					aria-label="Filter by role"
				>
					<option value="">All roles</option>
					{ROLES.map((r) => (
						<option key={r} value={r}>
							{ROLE_LABELS[r]}
						</option>
					))}
				</select>
			</div>

			<div className="overflow-x-auto rounded-xl border border-border bg-card">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Account</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Joined</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isPending ? (
							<TableRow>
								<TableCell colSpan={5}>
									<Skeleton className="h-4 w-full" />
								</TableCell>
							</TableRow>
						) : (data?.items.length ?? 0) === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="p-8 text-center text-sm text-muted-foreground"
								>
									No users match.
								</TableCell>
							</TableRow>
						) : (
							(data?.items ?? []).map((user) => (
								<TableRow key={user.id}>
									<TableCell className="min-w-0">
										<p className="truncate font-medium">{user.name || "—"}</p>
										<p className="truncate text-xs text-muted-foreground">
											{user.email}
											{!user.emailVerified ? " · unverified" : ""}
										</p>
										{user.banned && user.banReason ? (
											<p className="mt-0.5 text-xs text-destructive">
												Banned: {user.banReason}
											</p>
										) : null}
									</TableCell>
									<TableCell>
										<select
											value={user.role}
											disabled={busy || roleLocked(user)}
											title={
												roleLocked(user) ? roleLockReason(user) : undefined
											}
											onChange={(e) => {
												const next = e.target.value as Role;
												if (next !== user.role) setRoleConfirm({ user, next });
											}}
											className="h-8 rounded-md border border-border bg-background px-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
											aria-label={`Role for ${user.email}`}
										>
											{ROLES.map((r) => (
												<option key={r} value={r}>
													{ROLE_LABELS[r]}
												</option>
											))}
										</select>
									</TableCell>
									<TableCell>
										<Badge
											variant={
												user.banned ? "destructive" : ROLE_BADGE[user.role]
											}
										>
											{user.banned ? "Banned" : ROLE_LABELS[user.role]}
										</Badge>
									</TableCell>
									<TableCell className="text-xs text-muted-foreground">
										{new Date(user.createdAt).toLocaleDateString("en-GB", {
											day: "numeric",
											month: "short",
											year: "numeric",
										})}
									</TableCell>
									<TableCell className="text-right">
										{user.banned ? (
											<Button
												variant="outline"
												size="sm"
												disabled={busy}
												onClick={() => setUnbanTarget(user)}
											>
												Unban
											</Button>
										) : isProtected(user) ? (
											<span
												className="text-xs text-muted-foreground"
												title={
													isSelf(user)
														? "You cannot ban yourself"
														: "Admins cannot be banned — demote the role first"
												}
											>
												Protected
											</span>
										) : (
											<Button
												variant="ghost"
												size="sm"
												disabled={busy}
												className="text-muted-foreground hover:text-destructive"
												onClick={() => setBanTarget(user)}
											>
												Ban
											</Button>
										)}
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{data && data.totalPages > 1 ? (
				<div className="flex items-center gap-3 text-sm">
					<Button
						variant="outline"
						size="sm"
						disabled={page <= 1}
						onClick={() => setPage((p) => p - 1)}
					>
						Previous
					</Button>
					<span className="text-muted-foreground">
						Page {data.page} of {data.totalPages} ({data.total} users)
					</span>
					<Button
						variant="outline"
						size="sm"
						disabled={page >= data.totalPages}
						onClick={() => setPage((p) => p + 1)}
					>
						Next
					</Button>
				</div>
			) : null}

			{banTarget ? (
				<div className="rounded-xl border border-destructive/40 bg-card p-4">
					<h2 className="font-medium">Ban {banTarget.email}?</h2>
					<p className="mt-1 text-xs text-muted-foreground">
						Banned accounts cannot sign in. A reason is required and shown in
						the audit trail.
					</p>
					<div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
						<Input
							placeholder="Reason (e.g. abusive behavior, fraud)…"
							value={banReason}
							onChange={(e) => setBanReason(e.target.value)}
							className="h-9"
							aria-label="Ban reason"
						/>
						<Input
							placeholder="Days (blank = indefinite)"
							value={banDays}
							onChange={(e) => setBanDays(e.target.value)}
							className="h-9 sm:w-44"
							inputMode="numeric"
							aria-label="Ban length in days"
						/>
					</div>
					<div className="mt-3 flex gap-2">
						<Button
							variant="destructive"
							size="sm"
							disabled={busy}
							onClick={() => void onBanConfirm()}
						>
							Confirm ban
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								setBanTarget(null);
								setBanReason("");
								setBanDays("");
							}}
						>
							Cancel
						</Button>
					</div>
				</div>
			) : null}

			{/* Role-change confirmation */}
			<AlertDialog
				open={roleConfirm !== null}
				onOpenChange={(open) => !open && setRoleConfirm(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Change role?</AlertDialogTitle>
						<AlertDialogDescription>
							{roleConfirm
								? roleConfirm.next === "admin"
									? `${roleConfirm.user.email} will become an admin with full control over the academy console.`
									: `Change ${roleConfirm.user.email} from ${ROLE_LABELS[roleConfirm.user.role]} to ${ROLE_LABELS[roleConfirm.next]}?`
								: ""}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={(event) => {
								event.preventDefault();
								void onRoleConfirm();
							}}
						>
							Confirm
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Unban confirmation */}
			<AlertDialog
				open={unbanTarget !== null}
				onOpenChange={(open) => !open && setUnbanTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Unban account?</AlertDialogTitle>
						<AlertDialogDescription>
							{unbanTarget
								? `${unbanTarget.email} will be able to sign in again.`
								: ""}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={(event) => {
								event.preventDefault();
								void onUnbanConfirm();
							}}
						>
							Unban
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
