// src/features/auth/components/auth-alert.tsx
export function AuthAlert({
	message,
	tone = "error",
}: {
	message: string;
	tone?: "error" | "success";
}) {
	const styles =
		tone === "success"
			? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
			: "border-destructive/30 bg-destructive/10 text-destructive";
	return (
		<div
			role={tone === "success" ? "status" : "alert"}
			className={`rounded-md border px-3 py-2 text-sm ${styles}`}
		>
			{message}
		</div>
	);
}
