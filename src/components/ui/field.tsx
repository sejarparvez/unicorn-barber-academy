import { cn } from "@/lib/utils";

function Field({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div data-slot="field" className={cn("space-y-2", className)} {...props} />
	);
}

function FieldLabel({ className, ...props }: React.ComponentProps<"label">) {
	return (
		<label
			data-slot="field-label"
			className={cn(
				"font-medium leading-none text-sm text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

function FieldDescription({
	className,
	...props
}: React.ComponentProps<"p">) {
	return (
		<p
			data-slot="field-description"
			className={cn("text-xs text-muted-foreground", className)}
			{...props}
		/>
	);
}

function FieldError({ className, ...props }: React.ComponentProps<"p">) {
	return (
		<p
			data-slot="field-error"
			className={cn("text-xs text-destructive", className)}
			{...props}
		/>
	);
}

export { Field, FieldLabel, FieldDescription, FieldError };
