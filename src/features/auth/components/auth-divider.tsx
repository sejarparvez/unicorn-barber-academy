// src/features/auth/components/auth-divider.tsx
/** Hairline separator between the Google button and the email form. */
export function AuthDivider() {
	return (
		<div className="my-6 flex items-center gap-3">
			<span aria-hidden="true" className="h-px flex-1 bg-border" />
			<span className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
				or continue with email
			</span>
			<span aria-hidden="true" className="h-px flex-1 bg-border" />
		</div>
	);
}
